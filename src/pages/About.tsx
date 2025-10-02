import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Target, Zap, Users } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Leverage cutting-edge AI technology to receive personalized feedback and guidance tailored to your unique learning style."
    },
    {
      icon: Target,
      title: "Goal-Oriented Approach",
      description: "Set clear objectives and track your progress with detailed analytics and insights into your skill development."
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Get real-time analysis and suggestions to improve your performance immediately during practice sessions."
    },
    {
      icon: Users,
      title: "Comprehensive Modules",
      description: "Access a wide range of training modules covering all aspects of soft skills development in one platform."
    }
  ];

  const team = [
    {
      name: "AI Research Team",
      description: "Experts in natural language processing and machine learning"
    },
    {
      name: "Education Specialists",
      description: "Professional coaches and trainers with decades of experience"
    },
    {
      name: "Product Designers",
      description: "Creating intuitive and engaging learning experiences"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SkillMantra
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Empowering professionals to master their soft skills through intelligent, personalized AI coaching.
          </p>
        </div>
      </div>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-primary/20 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At SkillMantra, we believe that soft skills are the foundation of professional success.
                Our mission is to democratize access to high-quality soft skills training by combining 
                artificial intelligence with proven coaching methodologies.
              </p>
              <p className="text-lg text-muted-foreground">
                Whether you're preparing for an interview, improving your presentation skills, or 
                enhancing your written communication, SkillMantra provides the tools and feedback 
                you need to excel.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose SkillMantra?</h2>
            <p className="text-muted-foreground text-lg">
              Built on pillars of innovation, expertise, and user-focused design
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built by Experts</h2>
            <p className="text-muted-foreground text-lg">
              Our platform is developed by a diverse team of specialists
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center border-border/50">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 SkillMantra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
