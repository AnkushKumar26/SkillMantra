import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  MessageSquare, 
  FileText, 
  Video, 
  Mic, 
  BookOpen, 
  Sparkles,
  CheckCircle2,
  Zap,
  Target
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "AI Debate Platform",
      description: "Engage in intelligent debates with AI and receive constructive feedback"
    },
    {
      icon: Video,
      title: "Mock Interviews",
      description: "Practice interviews with AI-generated questions tailored to your field"
    },
    {
      icon: FileText,
      title: "Resume Analyzer",
      description: "Get actionable insights to improve your resume"
    },
    {
      icon: Mic,
      title: "Voice Analysis",
      description: "Track and improve your tone, pitch, and speaking clarity"
    },
    {
      icon: BookOpen,
      title: "Writing Coach",
      description: "Enhance your writing with AI-powered feedback"
    },
    {
      icon: Sparkles,
      title: "Grammar Assistant",
      description: "Real-time grammar and style suggestions"
    }
  ];

  const benefits = [
    "Track your progress with detailed analytics",
    "AI-powered personalized feedback",
    "Practice anytime, anywhere",
    "Improve communication confidence"
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Skill Development</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Master Your{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Soft Skills
            </span>
            <br />
            With AI Coaching
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Elevate your communication, presentation, and interview skills with personalized AI-driven training and real-time feedback.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Excel
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive AI-powered modules designed to enhance every aspect of your soft skills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 border-border/50 hover:border-primary/50"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Why Choose SkillMantra</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Transform Your Professional Communication
              </h2>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-lg text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>

              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="mt-8 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>

            <Card className="p-8 border-primary/20 shadow-2xl">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl">Ready to Begin?</CardTitle>
                <CardDescription className="text-base">
                  Join thousands improving their skills daily
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Sign Up Free</h4>
                      <p className="text-sm text-muted-foreground">Create your account in seconds</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-xl font-bold text-accent">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Choose Your Module</h4>
                      <p className="text-sm text-muted-foreground">Select the skill you want to improve</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Start Practicing</h4>
                      <p className="text-sm text-muted-foreground">Get instant AI feedback</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Skills?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start your journey to becoming a more confident and effective communicator today.
          </p>
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-12"
            >
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 SkillMantra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
