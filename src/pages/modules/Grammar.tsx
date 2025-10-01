import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Check, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Grammar = () => {
  const [text, setText] = useState("");
  const [corrections, setCorrections] = useState<any[]>([]);

  const checkGrammar = () => {
    // Simulate grammar checking
    const sampleCorrections = [
      {
        type: "spelling",
        original: "recieve",
        suggestion: "receive",
        position: 45,
        explanation: "Common spelling error - 'i before e except after c'"
      },
      {
        type: "grammar",
        original: "was went",
        suggestion: "went",
        position: 120,
        explanation: "Incorrect verb form - use past tense only"
      },
      {
        type: "punctuation",
        original: "Hello",
        suggestion: "Hello,",
        position: 0,
        explanation: "Add comma after greeting"
      }
    ];

    setCorrections(sampleCorrections);
  };

  const applySuggestion = (index: number) => {
    const newCorrections = [...corrections];
    newCorrections[index].applied = true;
    setCorrections(newCorrections);
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
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">Grammar Corrector</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Text</CardTitle>
                <CardDescription>
                  Type or paste text to check grammar in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start typing to get real-time grammar suggestions..."
                  rows={15}
                  className="font-mono"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{text.split(/\s+/).filter((w) => w).length} words</span>
                    <span>{text.length} characters</span>
                  </div>
                  <Button
                    onClick={checkGrammar}
                    className="bg-gradient-to-r from-primary to-accent"
                    disabled={!text.trim()}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Check Grammar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-accent">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Spelling corrections</span>
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Grammar suggestions</span>
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Punctuation fixes</span>
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Style improvements</span>
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Real-time feedback</span>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Suggestions</CardTitle>
                <CardDescription>
                  {corrections.length > 0
                    ? `Found ${corrections.length} suggestions`
                    : "No issues found yet"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {corrections.length > 0 ? (
                  <div className="space-y-4">
                    {corrections.map((correction, index) => (
                      <Card
                        key={index}
                        className={`border ${
                          correction.type === "spelling"
                            ? "border-red-500/20"
                            : correction.type === "grammar"
                            ? "border-orange-500/20"
                            : "border-blue-500/20"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertCircle
                                className={`w-4 h-4 ${
                                  correction.type === "spelling"
                                    ? "text-red-500"
                                    : correction.type === "grammar"
                                    ? "text-orange-500"
                                    : "text-blue-500"
                                }`}
                              />
                              <span className="text-sm font-medium capitalize">
                                {correction.type}
                              </span>
                            </div>
                            {!correction.applied && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => applySuggestion(index)}
                                className="text-xs"
                              >
                                Apply
                              </Button>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="line-through text-muted-foreground">
                                {correction.original}
                              </span>
                              <span>→</span>
                              <span className="font-medium text-green-600">
                                {correction.suggestion}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {correction.explanation}
                            </p>
                          </div>

                          {correction.applied && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                              <Check className="w-3 h-3" />
                              <span>Applied</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Type some text and click "Check Grammar"</p>
                    <p className="text-sm mt-2">
                      We'll highlight any issues we find
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Grammar;
