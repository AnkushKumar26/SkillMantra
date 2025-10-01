import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  MessageSquare, 
  FileText, 
  Video, 
  Mic, 
  BookOpen, 
  Sparkles, 
  User,
  LogOut,
  Brain
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const modules = [
    {
      title: "AI Debate Platform",
      description: "Practice debates with AI and get feedback",
      icon: MessageSquare,
      path: "/debate",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Mock Interviews",
      description: "Simulate job interviews with AI",
      icon: Video,
      path: "/interview",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Resume Analyzer",
      description: "Get AI-powered resume suggestions",
      icon: FileText,
      path: "/resume",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Voice Modulation",
      description: "Track tone, pitch, and clarity",
      icon: Mic,
      path: "/voice",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Writing Analyzer",
      description: "Improve clarity and structure",
      icon: BookOpen,
      path: "/writing",
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Grammar Corrector",
      description: "Real-time grammar suggestions",
      icon: Sparkles,
      path: "/grammar",
      color: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <nav className="border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              PoisePro AI
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose a module to start improving your soft skills
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card 
              key={module.path}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 overflow-hidden"
              onClick={() => navigate(module.path)}
            >
              <div className={`h-2 bg-gradient-to-r ${module.color}`} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color} shadow-lg`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors mt-4">
                  {module.title}
                </CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="ghost" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Get Started →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Track your skill development journey</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Start using modules to see your progress here. Your data is tracked automatically!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
