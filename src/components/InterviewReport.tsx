import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";

interface InterviewAnalytics {
  clarity: number;
  confidence: number;
  pace: string;
  fillerWords: number;
  eyeContact: number;
  posture: number;
  overall: number;
}

interface InterviewReportProps {
  analytics: InterviewAnalytics;
  industry: string;
  role: string;
  duration: number;
  onRestart: () => void;
}

export const InterviewReport = ({ 
  analytics, 
  industry, 
  role, 
  duration,
  onRestart 
}: InterviewReportProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getOverallFeedback = () => {
    if (analytics.overall >= 80) {
      return "Excellent performance! You demonstrated strong communication skills and confidence throughout the interview.";
    }
    if (analytics.overall >= 60) {
      return "Good performance! You showed solid skills, but there's room for improvement in clarity and confidence.";
    }
    return "Your interview shows potential, but focusing on clarity, reducing filler words, and building confidence will help significantly.";
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (analytics.clarity < 70) {
      recommendations.push("Practice structuring your answers using the STAR method (Situation, Task, Action, Result)");
    }
    if (analytics.confidence < 70) {
      recommendations.push("Work on maintaining steady eye contact and speaking at a consistent pace");
    }
    if (analytics.fillerWords > 5) {
      recommendations.push("Reduce filler words like 'um', 'uh', and 'like' by pausing briefly instead");
    }
    if (analytics.eyeContact < 70) {
      recommendations.push("Practice maintaining eye contact with the camera for better engagement");
    }
    if (analytics.posture < 70) {
      recommendations.push("Sit upright and maintain good posture throughout the interview");
    }
    if (analytics.pace !== "moderate") {
      recommendations.push(`Your speaking pace was ${analytics.pace}. Try to maintain a moderate, steady pace`);
    }

    return recommendations;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Interview Performance Report</CardTitle>
          <div className="text-sm text-muted-foreground">
            {role} Position • {industry} Industry • Duration: {formatTime(duration)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="text-center py-6 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Overall Performance</div>
            <div className={`text-6xl font-bold ${getScoreColor(analytics.overall)}`}>
              {analytics.overall}%
            </div>
            <p className="mt-4 text-sm max-w-2xl mx-auto">{getOverallFeedback()}</p>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Clarity</span>
                {getScoreIcon(analytics.clarity)}
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(analytics.clarity)}`}>
                {analytics.clarity}%
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${analytics.clarity}%` }}
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Confidence</span>
                {getScoreIcon(analytics.confidence)}
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(analytics.confidence)}`}>
                {analytics.confidence}%
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${analytics.confidence}%` }}
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Eye Contact</span>
                {getScoreIcon(analytics.eyeContact)}
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(analytics.eyeContact)}`}>
                {analytics.eyeContact}%
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${analytics.eyeContact}%` }}
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Posture</span>
                {getScoreIcon(analytics.posture)}
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(analytics.posture)}`}>
                {analytics.posture}%
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${analytics.posture}%` }}
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Speaking Pace</span>
              </div>
              <div className="text-3xl font-bold text-primary capitalize">
                {analytics.pace}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Filler Words</span>
              </div>
              <div className={`text-3xl font-bold ${analytics.fillerWords > 10 ? 'text-red-500' : analytics.fillerWords > 5 ? 'text-yellow-500' : 'text-green-500'}`}>
                {analytics.fillerWords}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Recommendations for Improvement</h3>
            {getRecommendations().length > 0 ? (
              <ul className="space-y-2">
                {getRecommendations().map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Great job! Your performance was excellent across all metrics.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button onClick={onRestart} className="flex-1">
              Start New Interview
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
