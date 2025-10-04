import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageSquare, Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { VoiceDebate } from "@/components/VoiceDebate";
import { supabase } from "@/integrations/supabase/client";

const Debate = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [debateStarted, setDebateStarted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const topics = [
    "Technology improves quality of life",
    "Remote work is more productive",
    "AI will replace human jobs",
    "Social media does more harm than good",
    "Climate change requires immediate action",
    "Free speech should have limits"
  ];

  const startDebate = async () => {
    if (!selectedTopic) {
      toast.error("Please select a topic");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to start a debate");
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("debate_sessions")
        .insert({
          user_id: user.id,
          topic: selectedTopic,
          difficulty,
          transcript: []
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setDebateStarted(true);
      toast.success("Debate started! Click 'Start Speaking' to begin.");
    } catch (error) {
      console.error("Error starting debate:", error);
      toast.error("Failed to start debate");
    }
  };

  const handleDebateComplete = async (analytics: any) => {
    if (!sessionId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update session
      await supabase
        .from("debate_sessions")
        .update({
          duration_seconds: analytics.duration,
          completed_at: new Date().toISOString()
        })
        .eq("id", sessionId);

      // Save analytics
      await supabase
        .from("debate_analytics")
        .insert({
          session_id: sessionId,
          user_id: user.id,
          clarity_score: analytics.clarity,
          argument_strength: analytics.argument_strength,
          confidence_score: analytics.confidence,
          filler_words_count: analytics.filler_words,
          speaking_pace: "moderate",
          feedback_summary: `Great debate! Your clarity was ${analytics.clarity}%, argument strength ${analytics.argument_strength}%, and confidence ${analytics.confidence}%.`,
          suggestions: {
            tips: [
              "Practice reducing filler words",
              "Structure arguments with clear premises",
              "Use confident tone and pacing"
            ]
          }
        });

      toast.success("Debate completed! Analytics saved.");
      setDebateStarted(false);
      setSelectedTopic("");
      setSessionId(null);
    } catch (error) {
      console.error("Error saving analytics:", error);
      toast.error("Failed to save analytics");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <MessageSquare className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">AI Debate Platform</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!debateStarted ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  AI Voice Debate Challenge
                </CardTitle>
                <CardDescription>Choose a topic and difficulty level to start your voice debate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Topic</label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a debate topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Difficulty Level</label>
                  <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Simple arguments</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Structured debate</SelectItem>
                      <SelectItem value="advanced">Advanced - Expert level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={startDebate} 
                  disabled={!selectedTopic}
                  className="w-full bg-gradient-to-r from-primary to-accent"
                >
                  Start Voice Debate
                </Button>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-accent">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>🎤 Speak your arguments using your microphone</p>
                <p>🤖 AI opponent responds with voice + text</p>
                <p>📊 Get real-time performance analytics</p>
                <p>💡 Receive feedback on clarity, strength & confidence</p>
                <p>⏱️ Timed rounds for structured practice</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <VoiceDebate 
            topic={selectedTopic}
            difficulty={difficulty}
            onComplete={handleDebateComplete}
          />
        )}
      </main>
    </div>
  );
};

export default Debate;
