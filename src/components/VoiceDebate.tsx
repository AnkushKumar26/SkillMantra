import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SpeechRecognitionService, TextToSpeechService } from "@/utils/speechRecognition";

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
    if (!transcript.trim()) return;

    setIsProcessing(true);
    const userMessage: Message = { role: "user", content: transcript };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Get AI response
      const { data, error } = await supabase.functions.invoke('debate-ai', {
        body: {
          messages: [...messages, userMessage],
          difficulty,
          topic
        }
      });

      if (error) throw error;

      const aiResponse = data.response;
      const analysisData = data.analysis;

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
      setIsSpeaking(true);
      ttsRef.current?.speak(aiResponse, () => {
        setIsSpeaking(false);
      });

      toast.success("AI response ready");
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsProcessing(false);
      setCurrentTranscript("");
    }
  };

  const stopSpeaking = () => {
    ttsRef.current?.stop();
    setIsSpeaking(false);
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

          {currentTranscript && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/30 animate-fade-in">
              <div className="text-sm font-semibold mb-2 text-primary">🎤 Live Transcript:</div>
              <div className="text-sm">{currentTranscript}</div>
            </div>
          )}

          {isSpeaking && (
            <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/30 animate-fade-in flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-accent animate-pulse" />
              <div className="text-sm font-semibold text-accent">AI is speaking...</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg transition-all ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground ml-12 shadow-lg"
                  : msg.role === "system"
                  ? "bg-accent/10 border border-accent/20 text-center"
                  : "bg-gradient-to-r from-muted to-muted/80 mr-12 shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {msg.role === "user" && <Mic className="w-4 h-4 mt-1 flex-shrink-0" />}
                {msg.role === "assistant" && <Volume2 className="w-4 h-4 mt-1 flex-shrink-0" />}
                <p className="whitespace-pre-wrap flex-1 text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
