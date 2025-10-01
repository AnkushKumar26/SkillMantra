import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Writing = () => {
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const analyzeText = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }

    setAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      setFeedback({
        clarity: 78,
        structure: 85,
        creativity: 72,
        suggestions: [
          "Consider breaking long sentences into shorter ones for better clarity",
          "Your introduction is strong, but the conclusion could be more impactful",
          "Use more active voice to make your writing more engaging",
          "Good use of transitions between paragraphs"
        ]
      });
      setAnalyzing(false);
      toast.success("Analysis complete!");
    }, 2000);
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
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">Writing Skills Analyzer</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Text</CardTitle>
                <CardDescription>Write or paste your text below for analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start writing or paste your text here..."
                  rows={20}
                  className="font-mono"
                />
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {text.split(/\s+/).filter(w => w).length} words
                  </span>
                  <Button
                    onClick={analyzeText}
                    disabled={analyzing}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Text"}
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {feedback ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>AI-powered feedback on your writing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Clarity</span>
                          <span className="text-sm font-bold">{feedback.clarity}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${feedback.clarity}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Structure</span>
                          <span className="text-sm font-bold">{feedback.structure}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${feedback.structure}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Creativity</span>
                          <span className="text-sm font-bold">{feedback.creativity}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${feedback.creativity}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feedback.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">
                    Our AI analyzes your writing across multiple dimensions:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Clarity:</strong> How easy your text is to understand</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Structure:</strong> Organization and flow of ideas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Creativity:</strong> Originality and engagement</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    Start writing to get personalized feedback!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Writing;
