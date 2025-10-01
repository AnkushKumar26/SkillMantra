import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Video, Play, Pause } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Interview = () => {
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [recording, setRecording] = useState(false);

  const questions = [
    "Tell me about yourself and your background.",
    "What are your greatest strengths?",
    "Describe a challenging situation you faced and how you handled it.",
    "Where do you see yourself in 5 years?",
    "Why are you interested in this role?"
  ];

  const startInterview = () => {
    if (!industry || !role) {
      toast.error("Please select industry and role first");
      return;
    }
    setStarted(true);
    toast.success("Interview started! Take your time to answer each question.");
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswer("");
    } else {
      toast.success("Interview complete! Review your performance below.");
    }
  };

  const toggleRecording = () => {
    setRecording(!recording);
    toast.info(recording ? "Recording stopped" : "Recording started");
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!started ? (
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
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
                    <CardDescription>Take your time to formulate your answer</CardDescription>
                  </div>
                  <Button
                    variant={recording ? "destructive" : "default"}
                    size="icon"
                    onClick={toggleRecording}
                  >
                    {recording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-lg font-medium">{questions[currentQuestion]}</p>
                </div>

                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here or use voice recording..."
                  rows={8}
                />

                <div className="flex gap-3">
                  {currentQuestion < questions.length - 1 ? (
                    <Button 
                      onClick={handleNext}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      Next Question →
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNext}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      Finish Interview
                    </Button>
                  )}
                  {currentQuestion > 0 && (
                    <Button 
                      variant="outline"
                      onClick={() => setCurrentQuestion(currentQuestion - 1)}
                    >
                      ← Previous
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {questions.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded-full ${
                        index <= currentQuestion ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Interview;
