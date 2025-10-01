import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Upload, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Resume = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf" || selectedFile.name.endsWith(".docx")) {
        setFile(selectedFile);
        toast.success(`${selectedFile.name} uploaded successfully`);
      } else {
        toast.error("Please upload a PDF or DOCX file");
      }
    }
  };

  const analyzeResume = () => {
    if (!file) {
      toast.error("Please upload a resume first");
      return;
    }

    setAnalyzing(true);

    // Simulate analysis
    setTimeout(() => {
      setResults({
        score: 82,
        strengths: [
          "Clear and concise formatting",
          "Strong action verbs throughout",
          "Quantifiable achievements included",
          "Relevant keywords for ATS optimization"
        ],
        improvements: [
          "Add more specific metrics to achievements",
          "Include a professional summary at the top",
          "Expand on technical skills section",
          "Consider adding certifications"
        ],
        sections: {
          formatting: 90,
          content: 78,
          keywords: 85,
          experience: 80
        }
      });
      setAnalyzing(false);
      toast.success("Analysis complete!");
    }, 2500);
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
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">Resume Analyzer</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>Upload a PDF or DOCX file for AI-powered analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Upload className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <p className="font-medium mb-1">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PDF or DOCX (MAX. 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {file && (
                <Button
                  onClick={analyzeResume}
                  disabled={analyzing}
                  className="w-full mt-4 bg-gradient-to-r from-primary to-accent"
                >
                  {analyzing ? "Analyzing..." : "Analyze Resume"}
                </Button>
              )}
            </CardContent>
          </Card>

          {results && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Overall Score</CardTitle>
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {results.score}/100
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(results.sections).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{key}</span>
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

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-green-600">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-orange-500/20">
                  <CardHeader>
                    <CardTitle className="text-orange-600">Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.improvements.map((improvement: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-orange-500 mt-1">→</span>
                          <span className="text-sm">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Detailed Report
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Resume;
