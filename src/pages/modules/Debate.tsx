import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Debate = () => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const topics = [
    "Technology improves quality of life",
    "Remote work is more productive",
    "AI will replace human jobs",
    "Social media does more harm than good"
  ];

  const startDebate = (topic: string) => {
    setMessages([
      {
        role: "system",
        content: `Let's debate: "${topic}". I'll take the opposing view. Present your opening argument!`
      }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        role: "assistant",
        content: "That's an interesting point! However, consider this counter-argument... [AI integration coming soon]"
      };
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1000);
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
        {messages.length === 0 ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose a Debate Topic</CardTitle>
                <CardDescription>Select a topic to start practicing your debate skills</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {topics.map((topic, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-primary/20"
                    onClick={() => startDebate(topic)}
                  >
                    <CardContent className="p-4">
                      <p className="font-medium">{topic}</p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-accent">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>• Choose a debate topic from the options above</p>
                <p>• Present your arguments clearly and logically</p>
                <p>• The AI will challenge your points and provide counter-arguments</p>
                <p>• Receive feedback on your argumentation skills</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
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
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your argument..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={3}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Debate;
