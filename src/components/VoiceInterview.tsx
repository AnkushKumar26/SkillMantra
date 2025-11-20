import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { SpeechRecognitionService, TextToSpeechService } from "@/utils/speechRecognition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RobotAvatar } from "./RobotAvatar";
import { PoseDetectionCamera } from "./PoseDetectionCamera";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceInterviewProps {
  industry: string;
  role: string;
  onComplete: (analytics: InterviewAnalytics, duration: number) => void;
}

interface InterviewAnalytics {
  clarity: number;
  confidence: number;
  pace: string;
  fillerWords: number;
  eyeContact: number;
  posture: number;
  overall: number;
}

export const VoiceInterview = ({ industry, role, onComplete }: VoiceInterviewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [timer, setTimer] = useState(0);
  const [analytics, setAnalytics] = useState<InterviewAnalytics>({
    clarity: 0,
    confidence: 0,
    pace: "moderate",
    fillerWords: 0,
    eyeContact: 0,
    posture: 0,
    overall: 0,
  });

  const speechRecognition = useRef<SpeechRecognitionService | null>(null);
  const textToSpeech = useRef<TextToSpeechService | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [postureScore, setPostureScore] = useState(75);

  useEffect(() => {
    textToSpeech.current = new TextToSpeechService();

    speechRecognition.current = new SpeechRecognitionService(
      handleUserSpeech,
      (error) => {
        console.error("Speech recognition error:", error);
        setIsListening(false);
        toast.error("Speech recognition error. Please try again.");
      }
    );

    // Start webcam
    startWebcam();
    askFirstQuestion();

    // Timer
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      if (speechRecognition.current) {
        speechRecognition.current.stop();
      }
      if (textToSpeech.current) {
        textToSpeech.current.stop();
      }
    };
  }, []);

  const startWebcam = () => {
    // Webcam is now handled by PoseDetectionCamera component
  };

  const askFirstQuestion = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("interview-ai", {
        body: {
          messages: [],
          industry,
          role,
          questionNumber: 0,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        if (error.message?.includes("429")) {
          toast.error("Rate limit exceeded. Please wait a moment.");
        } else if (error.message?.includes("402")) {
          toast.error("Credits depleted. Please add credits.");
        } else {
          toast.error("Failed to start interview. Please try again.");
        }
        throw error;
      }

      if (data?.error) {
        console.error("AI error:", data.error);
        toast.error(`AI Error: ${data.error}`);
        throw new Error(data.error);
      }

      if (!data || !data.question) {
        toast.error("No question received. Please try again.");
        throw new Error("No question received");
      }

      const aiMessage: Message = { role: "assistant", content: data.question };
      setMessages([aiMessage]);
      setAiResponse(data.question);

      setIsSpeaking(true);
      await textToSpeech.current?.speak(data.question, () => {
        setIsSpeaking(false);
        setAiResponse("");
      });
    } catch (error) {
      console.error("Error asking first question:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (isSpeaking) {
      toast.info("Please wait for the AI to finish speaking");
      return;
    }

    try {
      setCurrentTranscript("");
      speechRecognition.current?.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast.error("Could not start listening. Please try again.");
    }
  };

  const stopListening = () => {
    speechRecognition.current?.stop();
    setIsListening(false);
  };

  const handleUserSpeech = async (transcript: string) => {
    console.log("User speech:", transcript);
    setCurrentTranscript(transcript);
    setIsListening(false);
    setIsProcessing(true);

    const userMessage: Message = { role: "user", content: transcript };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const { data, error } = await supabase.functions.invoke("interview-ai", {
        body: {
          messages: updatedMessages,
          industry,
          role,
          questionNumber: questionNumber + 1,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        if (error.message?.includes("429")) {
          toast.error("Rate limit exceeded. Please wait a moment.");
        } else if (error.message?.includes("402")) {
          toast.error("Credits depleted. Please add credits.");
        } else {
          toast.error("Failed to get response. Please try again.");
        }
        throw error;
      }

      if (data?.error) {
        console.error("AI error:", data.error);
        toast.error(`AI Error: ${data.error}`);
        throw new Error(data.error);
      }

      if (!data) {
        toast.error("No response received.");
        throw new Error("No response received");
      }

      // Update analytics
      if (data.evaluation) {
        setAnalytics((prev) => ({
          clarity: Math.round((prev.clarity + data.evaluation.clarity) / 2),
          confidence: Math.round((prev.confidence + data.evaluation.confidence) / 2),
          pace: data.evaluation.pace || prev.pace,
          fillerWords: prev.fillerWords + (data.evaluation.filler_words || 0),
          eyeContact: Math.round((prev.eyeContact + (data.evaluation.eye_contact || 75)) / 2),
          posture: postureScore,
          overall: Math.round((prev.overall + data.evaluation.overall) / 2),
        }));
      }

      // Check if interview is complete
      if (data.isComplete) {
        toast.success("Interview complete!");
        setQuestionNumber(questionNumber + 1);
        endInterview();
        return;
      }

      // Continue with next question
      const aiMessage: Message = { role: "assistant", content: data.question };
      setMessages([...updatedMessages, aiMessage]);
      setAiResponse(data.question);
      setQuestionNumber(questionNumber + 1);

      setIsSpeaking(true);
      await textToSpeech.current?.speak(data.question, () => {
        setIsSpeaking(false);
        setAiResponse("");
      });
    } catch (error) {
      console.error("Error processing speech:", error);
    } finally {
      setIsProcessing(false);
      setCurrentTranscript("");
    }
  };

  const stopSpeaking = () => {
    textToSpeech.current?.stop();
    setIsSpeaking(false);
    setAiResponse("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const endInterview = () => {
    stopListening();
    stopSpeaking();
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const finalAnalytics = { ...analytics, overall: Math.round((analytics.clarity + analytics.confidence + analytics.eyeContact + postureScore) / 4) };
    onComplete(finalAnalytics, duration);
  };

  const getRobotState = () => {
    if (isSpeaking) return "speaking";
    if (isProcessing) return "thinking";
    if (isListening) return "listening";
    return "idle";
  };

  return (
    <>
      {/* Pose Detection Camera - Fixed Top Right */}
      <PoseDetectionCamera
        onPostureChange={(score, issues) => {
          setPostureScore(score);
        }}
      />

      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* AI Interviewer */}
              <div className="space-y-4">
                <h3 className="font-semibold mb-2">AI Interviewer</h3>
                <RobotAvatar state={getRobotState()} currentText={aiResponse} />
                
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">Question {questionNumber + 1}</div>
                  <div className="text-2xl font-bold text-primary">{formatTime(timer)}</div>
                </div>
              </div>

            {/* Stats Display */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Clarity</div>
                <div className="text-2xl font-bold text-primary">{analytics.clarity}%</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Confidence</div>
                <div className="text-2xl font-bold text-primary">{analytics.confidence}%</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Filler Words</div>
                <div className="text-2xl font-bold text-primary">{analytics.fillerWords}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Posture</div>
                <div className="text-2xl font-bold text-primary">{postureScore}%</div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex flex-col items-center gap-4">
              {currentTranscript && (
                <div className="w-full p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-1">You said:</p>
                  <p className="font-medium">{currentTranscript}</p>
                </div>
              )}

              <div className="flex gap-4">
                {!isListening && !isSpeaking && !isProcessing && (
                  <Button onClick={startListening} size="lg" className="gap-2">
                    <Mic className="w-5 h-5" />
                    Start Speaking
                  </Button>
                )}

                {isListening && (
                  <Button onClick={stopListening} size="lg" variant="destructive" className="gap-2">
                    <MicOff className="w-5 h-5" />
                    Stop Speaking
                  </Button>
                )}

                {isSpeaking && (
                  <Button onClick={stopSpeaking} size="lg" variant="secondary">
                    Skip Question
                  </Button>
                )}

                {isProcessing && (
                  <Button disabled size="lg">
                    Processing...
                  </Button>
                )}
              </div>

              <Button onClick={endInterview} variant="outline" size="sm">
                End Interview
              </Button>
            </div>

            {/* Transcript */}
            {messages.length > 0 && (
              <div className="mt-6 space-y-2 max-h-64 overflow-y-auto">
                <h4 className="font-semibold text-sm">Interview Transcript</h4>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary/10 ml-8"
                        : "bg-muted/50 mr-8"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {msg.role === "user" ? "You" : "AI Interviewer"}
                    </div>
                    <div className="text-sm">{msg.content}</div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
