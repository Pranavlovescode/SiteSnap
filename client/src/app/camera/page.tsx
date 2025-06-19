"use client"
import React, { useRef, useEffect, useState } from 'react';

const CameraCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // 'user' for front camera, 'environment' for back
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Unable to access camera. Please allow permission.');
      }
    };

    getCameraStream();
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/png');
    setCapturedImage(imageDataUrl);

    // TODO: Upload imageDataUrl to backend/cloud storage if needed
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Capture Image</h1>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-md shadow-md w-full max-w-md"
      />

      <button
        onClick={handleCapture}
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded"
      >
        Capture
      </button>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {capturedImage && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Captured Image:</h2>
          <img
            src={capturedImage}
            alt="Captured"
            className="rounded shadow-md max-w-md"
          />
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
