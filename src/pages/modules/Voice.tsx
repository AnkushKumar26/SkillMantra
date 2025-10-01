import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mic, Square, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Voice = () => {
  const [recording, setRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      setHasRecording(true);
      toast.success("Recording saved! Click analyze to get feedback.");
    } else {
      setRecording(true);
      toast.info("Recording started. Speak clearly into your microphone.");
    }
  };

  const analyzeVoice = () => {
    setAnalyzing(true);

    // Simulate analysis
    setTimeout(() => {
      setResults({
        overall: 78,
        metrics: {
          tone: 82,
          pitch: 75,
          clarity: 80,
          pace: 73,
          volume: 85
        },
        insights: [
          "Your speaking pace is slightly fast. Try slowing down for better comprehension.",
          "Good tonal variation keeps the audience engaged.",
          "Clarity is excellent - your words are easy to understand.",
          "Consider using more pauses for emphasis."
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
          <Mic className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">Voice Modulation Tracker</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Record Your Voice</CardTitle>
              <CardDescription>
                Record yourself speaking for at least 30 seconds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6 py-8">
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
                    recording
                      ? "bg-red-500 animate-pulse"
                      : "bg-gradient-to-br from-primary to-accent"
                  }`}
                >
                  <Mic className="w-16 h-16 text-white" />
                </div>

                <div className="text-center">
                  <p className="text-lg font-medium mb-2">
                    {recording
                      ? "Recording in progress..."
                      : hasRecording
                      ? "Recording saved"
                      : "Ready to record"}
                  </p>
                  {recording && (
                    <p className="text-sm text-muted-foreground">
                      Speak naturally and clearly
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    variant={recording ? "destructive" : "default"}
                    onClick={toggleRecording}
                    className={
                      !recording
                        ? "bg-gradient-to-r from-primary to-accent"
                        : ""
                    }
                  >
                    {recording ? (
                      <>
                        <Square className="w-5 h-5 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>

                  {hasRecording && !recording && (
                    <Button
                      size="lg"
                      onClick={analyzeVoice}
                      disabled={analyzing}
                      className="bg-gradient-to-r from-primary to-accent"
                    >
                      {analyzing ? "Analyzing..." : "Analyze Voice"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {results && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Overall Score</CardTitle>
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {results.overall}/100
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(results.metrics).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {key}
                          </span>
                          <span className="text-sm font-bold">{value}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Insights & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {results.insights.map((insight: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="text-accent">Tips for Better Voice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>• Maintain a steady, moderate pace</p>
              <p>• Use variation in pitch to emphasize key points</p>
              <p>• Speak clearly and enunciate words properly</p>
              <p>• Take natural pauses between thoughts</p>
              <p>• Maintain consistent volume throughout</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Voice;
