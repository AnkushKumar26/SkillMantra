import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  audio?: string;
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
      content: `Debate Topic: "${topic}". Difficulty: ${difficulty}. Present your opening argument!`
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [timer, setTimer] = useState(0);
  const [analytics, setAnalytics] = useState({
    clarity: 0,
    argument_strength: 0,
    confidence: 0,
    filler_words: 0
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isRecording && !timerRef.current) {
      timerRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (!isRecording && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert audio to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];

        // Speech to text
        const { data: sttData, error: sttError } = await supabase.functions.invoke('speech-to-text', {
          body: { audio: base64Audio }
        });

        if (sttError) throw sttError;

        const userText = sttData.text;
        setTranscript(userText);
        
        const userMessage: Message = { role: "user", content: userText };
        setMessages(prev => [...prev, userMessage]);

        // Get AI response
        const { data: aiData, error: aiError } = await supabase.functions.invoke('debate-ai', {
          body: {
            messages: [...messages, userMessage],
            difficulty,
            topic
          }
        });

        if (aiError) throw aiError;

        const aiMessage: Message = { role: "assistant", content: aiData.response };
        
        // Update analytics
        setAnalytics(prev => ({
          clarity: Math.round((prev.clarity + aiData.analysis.clarity) / 2),
          argument_strength: Math.round((prev.argument_strength + aiData.analysis.argument_strength) / 2),
          confidence: Math.round((prev.confidence + aiData.analysis.confidence) / 2),
          filler_words: prev.filler_words + aiData.analysis.filler_words
        }));

        // Text to speech for AI response
        const { data: ttsData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
          body: { text: aiData.response }
        });

        if (!ttsError && ttsData?.audioContent) {
          aiMessage.audio = ttsData.audioContent;
          playAudio(ttsData.audioContent);
        }

        setMessages(prev => [...prev, aiMessage]);
        setTranscript("");
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Error processing audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (base64Audio: string) => {
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    audioRef.current = audio;
    audio.play().catch(err => console.error("Error playing audio:", err));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const endDebate = () => {
    onComplete({
      ...analytics,
      duration: timer,
      topic,
      difficulty
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">Timer: {formatTime(timer)}</div>
            <div className="text-sm text-muted-foreground capitalize">Difficulty: {difficulty}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{analytics.clarity}%</div>
              <div className="text-xs text-muted-foreground">Clarity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{analytics.argument_strength}%</div>
              <div className="text-xs text-muted-foreground">Strength</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{analytics.confidence}%</div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isProcessing}
                className="bg-gradient-to-r from-primary to-accent"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Speaking
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="animate-pulse"
              >
                <MicOff className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}
            <Button onClick={endDebate} variant="outline">
              End Debate
            </Button>
          </div>

          {transcript && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-1">Live Transcript:</div>
              <div className="text-sm">{transcript}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-12"
                  : msg.role === "system"
                  ? "bg-accent/10 border border-accent/20"
                  : "bg-muted mr-12"
              }`}
            >
              <div className="flex items-start justify-between">
                <p className="whitespace-pre-wrap flex-1">{msg.content}</p>
                {msg.audio && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => playAudio(msg.audio!)}
                    className="ml-2"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-2 text-muted-foreground justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
