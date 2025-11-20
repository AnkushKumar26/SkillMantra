import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { VoiceInterview } from "@/components/VoiceInterview";
import { InterviewReport } from "@/components/InterviewReport";

interface InterviewAnalytics {
  clarity: number;
  confidence: number;
  pace: string;
  fillerWords: number;
  eyeContact: number;
  posture: number;
  overall: number;
}

const Interview = () => {
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [analytics, setAnalytics] = useState<InterviewAnalytics | null>(null);
  const [duration, setDuration] = useState(0);

  const startInterview = () => {
    if (!industry || !role) {
      toast.error("Please select industry and role first");
      return;
    }
    setStarted(true);
    toast.success("Interview started! The AI will ask you questions.");
  };

  const handleInterviewComplete = (finalAnalytics: InterviewAnalytics, interviewDuration: number) => {
    setAnalytics(finalAnalytics);
    setDuration(interviewDuration);
    setCompleted(true);
  };

  const restartInterview = () => {
    setIndustry("");
    setRole("");
    setStarted(false);
    setCompleted(false);
    setAnalytics(null);
    setDuration(0);
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
          <Video className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">Mock Interview</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {completed && analytics ? (
          <InterviewReport
            analytics={analytics}
            industry={industry}
            role={role}
            duration={duration}
            onRestart={restartInterview}
          />
        ) : started ? (
          <VoiceInterview
            industry={industry}
            role={role}
            onComplete={handleInterviewComplete}
          />
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Setup Your Mock Interview</CardTitle>
                <CardDescription>Select your industry and role to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid-Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={startInterview}
                  className="w-full bg-gradient-to-r from-primary to-accent"
                >
                  Start Interview
                </Button>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-accent">Interview Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>• Answer questions clearly and concisely</p>
                <p>• Use the STAR method (Situation, Task, Action, Result)</p>
                <p>• Maintain eye contact with the camera</p>
                <p>• Speak at a moderate pace</p>
                <p>• You can record your responses for self-review</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Interview;
