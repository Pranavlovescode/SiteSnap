import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

interface CameraCaptureProps {
  environment: 'environment' | 'user';
  onCapture: (imageDataUrl: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ environment, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [environment]);

  const stopCamera = () => {
    if (stream) {
      console.log("🔴 Stopping camera stream...");
      stream.getTracks().forEach(track => {
        track.stop();
        console.log("🔴 Stopped track:", track.kind);
      });
      setStream(null);
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      stopCamera();
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("📷 Starting camera with environment:", environment);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported on this device");
      }

      const constraints = {
        video: {
          facingMode: environment === 'environment' ? 'environment' : 'user',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      };

      console.log("📷 Requesting camera with constraints:", constraints);

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log("✅ Camera stream obtained:", {
        tracks: mediaStream.getTracks().length,
        video: mediaStream.getVideoTracks().length
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log("✅ Video metadata loaded");
          setIsLoading(false);
        };
      }
      
    } catch (error: any) {
      console.error("❌ Error accessing camera:", error);
      setIsLoading(false);
      
      let errorMessage = "Failed to access camera";
      
      if (error.name === 'NotReadableError') {
        errorMessage = "Camera is being used by another application. Please close other camera apps and try again.";
      } else if (error.name === 'NotAllowedError') {
        errorMessage = "Camera permission denied. Please allow camera access and refresh the page.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No camera found on this device.";
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = "Camera doesn't support the requested settings. Trying fallback...";
        tryFallbackCamera();
        return;
      }
      
      setError(errorMessage);
    }
  };

  const tryFallbackCamera = async () => {
    try {
      console.log("📷 Trying fallback camera settings...");
      
      const fallbackConstraints = {
        video: {
          facingMode: environment === 'environment' ? 'environment' : 'user',
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
          setError(null);
        };
      }
      
    } catch (fallbackError: any) {
      console.error("❌ Fallback camera also failed:", fallbackError);
      setError("Unable to access camera with any settings");
      setIsLoading(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("❌ Video or canvas ref not available");
      return;
    }
    
    if (!stream) {
      console.error("❌ No camera stream available");
      setError("No camera stream available");
      return;
    }
    
    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error("❌ Could not get canvas context");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      console.log("📸 Capturing image with dimensions:", {
        width: canvas.width,
        height: canvas.height
      });
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log("📸 Image captured, data URL length:", imageDataUrl.length);
      onCapture(imageDataUrl);
      
    } catch (captureError) {
      console.error("❌ Error during capture:", captureError);
      setError("Failed to capture image");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-800">Camera Error</h4>
              <p className="text-sm text-red-700 mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Camera Preview */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">Starting camera...</p>
              <p className="text-gray-300 text-sm mt-1">Please wait a moment</p>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto rounded-2xl"
          style={{ 
            maxHeight: '500px', 
            objectFit: 'cover',
            aspectRatio: '16/9'
          }}
        />
        
        {/* Capture Overlay */}
        {isCapturing && (
          <div className="absolute inset-0 bg-white/20 flex items-center justify-center rounded-2xl">
            <div className="bg-black/50 rounded-full p-4">
              <Camera className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      {/* Controls */}
      <div className="flex justify-center items-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={startCamera}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-white hover:bg-gray-50 border-gray-200 shadow-sm"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{isLoading ? 'Starting...' : 'Restart'}</span>
        </Button>
        
        <Button
          type="button"
          onClick={captureImage}
          disabled={isCapturing || !stream || isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
        >
          <Camera className="h-5 w-5" />
          <span className="font-medium">
            {isCapturing ? 'Capturing...' : 'Take Photo'}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default CameraCapture;