import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, AlertTriangle, CheckCircle } from "lucide-react";
import { Pose, Results } from "@mediapipe/pose";
import { Camera as MediaPipeCamera } from "@mediapipe/camera_utils";

interface PostureIssue {
  type: string;
  severity: "good" | "warning" | "error";
  message: string;
}

interface PoseDetectionCameraProps {
  onPostureChange: (score: number, issues: PostureIssue[]) => void;
}

export const PoseDetectionCamera = ({ onPostureChange }: PoseDetectionCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<MediaPipeCamera | null>(null);
  const [postureScore, setPostureScore] = useState(100);
  const [issues, setIssues] = useState<PostureIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializePose = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        // Initialize MediaPipe Pose
        const pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          },
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults(onResults);
        poseRef.current = pose;

        // Start camera
        const camera = new MediaPipeCamera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && poseRef.current) {
              await poseRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });

        await camera.start();
        cameraRef.current = camera;
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing pose detection:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializePose();

    return () => {
      mounted = false;
      poseRef.current?.close();
      cameraRef.current?.stop();
    };
  }, []);

  const onResults = (results: Results) => {
    if (!canvasRef.current || !results.poseLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Draw video frame (mirrored)
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    if (videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();

    // Draw pose landmarks
    const landmarks = results.poseLandmarks;
    
    // Draw connections
    const connections = [
      // Torso
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      // Left leg
      [23, 25], [25, 27], [27, 29], [27, 31],
      // Right leg
      [24, 26], [26, 28], [28, 30], [28, 32],
      // Face
      [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
    ];

    ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
    ctx.lineWidth = 3;

    connections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      if (start && end && start.visibility && end.visibility && 
          start.visibility > 0.5 && end.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(
          (1 - start.x) * canvas.width,
          start.y * canvas.height
        );
        ctx.lineTo(
          (1 - end.x) * canvas.width,
          end.y * canvas.height
        );
        ctx.stroke();
      }
    });

    // Draw keypoints
    landmarks.forEach((landmark, index) => {
      if (landmark.visibility && landmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(
          (1 - landmark.x) * canvas.width,
          landmark.y * canvas.height,
          5,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Analyze posture
    analyzePosture(landmarks);
  };

  const analyzePosture = (landmarks: any[]) => {
    const detectedIssues: PostureIssue[] = [];
    let score = 100;

    // Key landmarks
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Check if all required landmarks are visible
    if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      return;
    }

    // 1. Check head forward lean (nose should be roughly above shoulders)
    const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
    const headLean = Math.abs(nose.x - shoulderMidX);
    
    if (headLean > 0.08) {
      detectedIssues.push({
        type: "head-lean",
        severity: "warning",
        message: "Head leaning forward - keep head aligned with shoulders",
      });
      score -= 15;
    }

    // 2. Check shoulder alignment (should be level)
    const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
    
    if (shoulderTilt > 0.05) {
      detectedIssues.push({
        type: "shoulder-tilt",
        severity: "warning",
        message: "Shoulders uneven - sit up straight",
      });
      score -= 10;
    }

    // 3. Check slouching (shoulders should be roughly above hips)
    const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2;
    const hipMidY = (leftHip.y + rightHip.y) / 2;
    const verticalAlignment = shoulderMidY - hipMidY;

    if (verticalAlignment > -0.15) {
      detectedIssues.push({
        type: "slouching",
        severity: "error",
        message: "Slouching detected - straighten your back",
      });
      score -= 20;
    }

    // 4. Check if head is visible (too close or far from camera)
    if (nose.y < 0.1 || nose.y > 0.7) {
      detectedIssues.push({
        type: "distance",
        severity: "warning",
        message: "Adjust distance from camera",
      });
      score -= 10;
    }

    // 5. Check spine alignment (shoulders and hips should be vertically aligned)
    const spineAlignment = Math.abs(shoulderMidX - (leftHip.x + rightHip.x) / 2);
    
    if (spineAlignment > 0.05) {
      detectedIssues.push({
        type: "spine",
        severity: "warning",
        message: "Leaning to one side - center your body",
      });
      score -= 10;
    }

    // Good posture feedback
    if (detectedIssues.length === 0) {
      detectedIssues.push({
        type: "good",
        severity: "good",
        message: "Excellent posture! Keep it up!",
      });
    }

    score = Math.max(0, Math.min(100, score));
    setPostureScore(score);
    setIssues(detectedIssues);
    onPostureChange(score, detectedIssues);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getSeverityColor = (severity: string) => {
    if (severity === "good") return "bg-green-500/20 text-green-500 border-green-500/50";
    if (severity === "warning") return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    return "bg-red-500/20 text-red-500 border-red-500/50";
  };

  return (
    <div className="fixed top-20 right-6 z-50">
      <Card className="w-80 overflow-hidden shadow-2xl border-2">
        <div className="relative bg-muted">
          {/* Camera indicator */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
            <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              <Camera className="w-3 h-3" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Posture score */}
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full border">
              <span className="text-xs text-muted-foreground">Posture: </span>
              <span className={`text-sm font-bold ${getScoreColor(postureScore)}`}>
                {postureScore}%
              </span>
            </div>
          </div>

          {/* Video and Canvas */}
          <div className="relative aspect-video">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover opacity-0"
              playsInline
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="w-full h-full object-cover"
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Loading pose detection...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Posture feedback */}
        <div className="p-3 space-y-2 bg-background max-h-32 overflow-y-auto">
          {issues.map((issue, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className={`${getSeverityColor(issue.severity)} w-full justify-start text-xs py-1.5`}
            >
              {issue.severity === "good" ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 mr-1" />
              )}
              <span className="truncate">{issue.message}</span>
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};
