import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, VolumeX, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SpeechRecognitionService, TextToSpeechService } from "@/utils/speechRecognition";
import { RobotAvatar } from "@/components/RobotAvatar";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface VoiceDebateProps {
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  onComplete: (analytics: any) => void;
}

export const VoiceDebate = ({ topic, difficulty, onComplete }: VoiceDebateProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: `Debate Topic: "${topic}". Difficulty: ${difficulty}. Press the microphone button and present your opening argument!`
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentAiResponse, setCurrentAiResponse] = useState("");
  const [timer, setTimer] = useState(0);
  const [analytics, setAnalytics] = useState({
    clarity: 0,
    argument_strength: 0,
    confidence: 0,
    filler_words: 0,
    turnCount: 0
  });

  const speechRecognitionRef = useRef<SpeechRecognitionService | null>(null);
  const ttsRef = useRef<TextToSpeechService | null>(null);
  const timerRef = useRef<number | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize TTS
    ttsRef.current = new TextToSpeechService();

    // Start timer
    timerRef.current = window.setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      speechRecognitionRef.current?.stop();
      ttsRef.current?.stop();
    };
  }, []);

  // Auto-scroll transcript to bottom when new messages arrive
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages]);

  const startListening = async () => {
    try {
      if (!speechRecognitionRef.current) {
        speechRecognitionRef.current = new SpeechRecognitionService(
          (transcript) => {
            setCurrentTranscript(transcript);
            handleUserSpeech(transcript);
            setIsListening(false);
          },
          (error) => {
            console.error("Speech recognition error:", error);
            toast.error("Could not recognize speech. Please try again.");
            setIsListening(false);
          }
        );
      }

      // Stop any ongoing AI speech
      ttsRef.current?.stop();
      setIsSpeaking(false);

      speechRecognitionRef.current.start();
      setIsListening(true);
      setCurrentTranscript("");
      toast.success("Listening... Speak your argument");
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast.error("Speech recognition not supported in this browser");
    }
  };

  const stopListening = () => {
    speechRecognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleUserSpeech = async (transcript: string) => {
    if (!transcript.trim()) {
      console.log("Empty transcript, skipping");
      return;
    }

    console.log("Processing user speech:", transcript);
    setIsProcessing(true);
    const userMessage: Message = { role: "user", content: transcript };
    setMessages(prev => [...prev, userMessage]);

    try {
      toast.info("Getting AI response...");
      console.log("Calling debate-ai function...");
      
      // Get AI response
      const { data, error } = await supabase.functions.invoke('debate-ai', {
        body: {
          messages: [...messages, userMessage],
          difficulty,
          topic
        }
      });

      console.log("debate-ai response:", { data, error });

      if (error) {
        console.error("Edge function error:", error);
        
        // Handle specific error codes with user-friendly messages
        if (error.message?.includes("429") || error.message?.includes("Rate limit")) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (error.message?.includes("402") || error.message?.includes("Payment required")) {
          toast.error("Credits depleted. Please add credits to your Lovable workspace.");
        } else if (error.message?.includes("404")) {
          toast.error("AI service unavailable. Please try again later.");
        } else if (error.message?.includes("500") || error.message?.includes("503")) {
          toast.error("AI service error. Please try again in a moment.");
        } else {
          toast.error("Failed to get AI response. Please try again.");
        }
        
        throw error;
      }

      // Check for error in the response data
      if (data?.error) {
        console.error("AI error in response:", data.error);
        
        if (data.error.includes("Rate limit") || data.error.includes("429")) {
          toast.error("Rate limit exceeded. Please wait a moment and try again.");
        } else if (data.error.includes("Payment required") || data.error.includes("credits") || data.error.includes("402")) {
          toast.error("Credits depleted. Please add credits to your Lovable workspace.");
        } else {
          toast.error(`AI Error: ${data.error}`);
        }
        
        throw new Error(data.error);
      }

      if (!data || !data.response) {
        console.error("No response data:", data);
        toast.error("No response received from AI. Please try again.");
        throw new Error("No response received from AI");
      }

      const aiResponse = data.response;
      const analysisData = data.analysis;
      
      console.log("AI response received:", aiResponse.substring(0, 100));

      // Update analytics
      const newTurnCount = analytics.turnCount + 1;
      setAnalytics({
        clarity: Math.round((analytics.clarity * analytics.turnCount + analysisData.clarity) / newTurnCount),
        argument_strength: Math.round((analytics.argument_strength * analytics.turnCount + analysisData.argument_strength) / newTurnCount),
        confidence: Math.round((analytics.confidence * analytics.turnCount + analysisData.confidence) / newTurnCount),
        filler_words: analytics.filler_words + (analysisData.filler_words || 0),
        turnCount: newTurnCount
      });

      const aiMessage: Message = { role: "assistant", content: aiResponse };
      setMessages(prev => [...prev, aiMessage]);

      // Speak AI response
      setCurrentAiResponse(aiResponse);
      setIsSpeaking(true);
      toast.info("AI is responding...");
      ttsRef.current?.speak(aiResponse, () => {
        setIsSpeaking(false);
        setCurrentAiResponse("");
      });

      toast.success("AI response ready");
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to get AI response: ${errorMessage}`);
      
      // Remove the failed user message
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsProcessing(false);
      setCurrentTranscript("");
    }
  };

  const stopSpeaking = () => {
    ttsRef.current?.stop();
    setIsSpeaking(false);
    setCurrentAiResponse("");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const endDebate = () => {
    speechRecognitionRef.current?.stop();
    ttsRef.current?.stop();
    onComplete({
      ...analytics,
      duration: timer,
      topic,
      difficulty
    });
  };

  const getRobotState = () => {
    if (isProcessing) return "thinking";
    if (isListening) return "listening";
    if (isSpeaking) return "speaking";
    return "idle";
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="text-2xl font-bold text-primary">⏱️ {formatTime(timer)}</div>
            <div className="text-sm font-medium px-3 py-1 bg-accent/20 rounded-full capitalize">
              {difficulty}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-background rounded-lg border border-primary/20">
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {analytics.clarity}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Clarity</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg border border-accent/20">
              <div className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                {analytics.argument_strength}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Strength</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg border border-secondary/20">
              <div className="text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                {analytics.confidence}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">Confidence</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center items-center">
            {!isListening && !isProcessing ? (
              <Button
                onClick={startListening}
                disabled={isSpeaking}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Speaking
              </Button>
            ) : isListening ? (
              <Button
                onClick={stopListening}
                size="lg"
                variant="destructive"
                className="animate-pulse"
              >
                <MicOff className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            ) : (
              <Button disabled size="lg" variant="secondary">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </Button>
            )}

            {isSpeaking && (
              <Button
                onClick={stopSpeaking}
                size="lg"
                variant="outline"
              >
                <VolumeX className="w-5 h-5 mr-2" />
                Stop AI Speech
              </Button>
            )}

            <Button onClick={endDebate} size="lg" variant="outline">
              End Debate
            </Button>
          </div>

          {currentTranscript && isListening && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/30 animate-fade-in">
              <div className="text-sm font-semibold mb-2 text-primary">🎤 You are saying:</div>
              <div className="text-sm">{currentTranscript}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debate Transcript */}
      <Card className="border-secondary/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
            <span>💬</span> Live Transcript
          </h3>
          <div 
            ref={transcriptRef}
            className="h-80 overflow-y-auto space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50 scroll-smooth"
          >
            {messages.map((message, index) => (
              message.role !== "system" && (
                <div
                  key={index}
                  className={`p-4 rounded-lg transition-all ${
                    message.role === "user"
                      ? "bg-primary/20 ml-8 border border-primary/30"
                      : "bg-accent/20 mr-8 border border-accent/30"
                  }`}
                >
                  <p className="text-xs font-bold mb-2 uppercase tracking-wide text-muted-foreground">
                    {message.role === "user" ? "🗣️ You" : "🤖 AI Opponent"}
                  </p>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              )
            ))}
            {isProcessing && (
              <div className="p-4 rounded-lg bg-accent/20 mr-8 border border-accent/30 flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <p className="text-sm text-muted-foreground italic">AI is formulating response...</p>
              </div>
            )}
            {messages.filter(m => m.role !== "system").length === 0 && !isProcessing && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                <p>Click "Start Speaking" to begin the debate</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Robot Avatar */}
      <Card className="border-accent/20">
        <CardContent className="p-6">
          <RobotAvatar 
            state={getRobotState()} 
            currentText={isSpeaking ? currentAiResponse : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
};
