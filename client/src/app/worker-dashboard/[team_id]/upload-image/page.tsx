"use client";

import { io, Socket } from "socket.io-client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { Loader2, Camera, Upload, X } from "lucide-react";
import CameraCapture from "@/layouts/Camera";

export default function UploadImage() {
  const [image, setImage] = useState<File[] | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const params = useParams<{ team_id: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [environment, setEnvironment] = useState<'environment' | 'user'>('environment');
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    const connect = async () => {
      try {
        const res = await fetch("/api/session-token", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (!data.token) {
          console.error("❌ No token returned");
          return;
        }

        const newSocket = io(process.env.NEXT_PUBLIC_BACKEND!, {
          auth: {
            token: data.token,
          },
          withCredentials: true,
        });

        newSocket.on("connect", () => {
          console.log("✅ WebSocket connected");
        });

        newSocket.on("connect_error", (err) => {
          console.error("❌ WebSocket connection failed:", err.message);
        });

        setSocket(newSocket);
      } catch (error) {
        console.error("❌ Error connecting socket:", error);
      }
    };

    connect();

    return () => {
      socket?.disconnect();
    };
  }, []);

  // Handle captured images from camera
  const handleCapturedImage = async (imageDataUrl: string) => {
    console.log("📸 Handling captured image...");
    setCapturedImages(prev => [...prev, imageDataUrl]);
    setPreviewImages(prev => [...prev, imageDataUrl]);
    
    try {
      // Convert data URL to File object
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      setImage(prev => {
        const newImages = prev ? [...prev, file] : [file];
        console.log("📁 Updated image array:", newImages.map(f => ({ name: f.name, size: f.size, type: f.type })));
        return newImages;
      });
      
      console.log("✅ Camera image converted to file:", { name: file.name, size: file.size, type: file.type });
      toast.success("Image captured successfully!");
    } catch (error) {
      console.error("❌ Error converting captured image to file:", error);
      toast.error("Failed to process captured image");
    }
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImage(prev => prev ? [...prev, ...files] : files);
      
      // Create preview URLs for selected files
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
      
      console.log("📁 Files selected:", files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    }
  };

  // Remove image from preview and file list
  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImage(prev => prev ? prev.filter((_, i) => i !== index) : null);
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
    console.log("🗑️ Removed image at index:", index);
  };

  // Toggle camera mode
  const toggleCameraMode = () => {
    setEnvironment(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const uploadImage = async (): Promise<any> => {
    setIsLoading(true);
    
    // Better validation for image array
    if (!image || image.length === 0) {
      console.error("❌ No images to upload");
      setIsLoading(false);
      toast.error("Please select or capture an image first");
      return null;
    }

    try {
      const formData = new FormData();
      
      // Log each file being added to FormData
      image.forEach((file, index) => {
        console.log(`📎 Adding file ${index + 1}:`, { name: file.name, size: file.size, type: file.type });
        formData.append("image", file);
      });
      
      console.log("📤 Starting upload of", image.length, "images...");
      
      const response = await axios.post(
        "/api/image-data/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
          params: {
            teamId: params?.team_id,
          },
        }
      );
      
      if (response.status === 201) {
        setIsLoading(false);
        console.log("✅ Images uploaded successfully:", response.data.cloudinary);
        toast.success(response.data.message || "Images uploaded successfully!");
        return response.data.cloudinary;
      } else {
        setIsLoading(false);
        console.log("❌ Upload failed with status:", response.status);
        toast.error(response.data.error || "Upload failed");
        return null;
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("❌ Error uploading images:", error);
      
      if (error.response) {
        console.error("Response error:", error.response.data);
        toast.error(error.response.data.error || "Upload failed");
      } else {
        toast.error("Network error during upload");
      }
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!socket) {
      console.error("❌ Socket is not connected");
      toast.error("Connection error. Please refresh the page.");
      return;
    }

    // Validate images before proceeding
    if (!image || image.length === 0) {
      toast.error("Please select or capture an image first");
      return;
    }

    console.log("🚀 Starting submit process with", image.length, "images");

    try {
      const imagePath = await uploadImage();
      
      if (imagePath) {
        const paths = Array.isArray(imagePath)
          ? imagePath.map((img: any) => ({
              secure_url: img.secure_url,
              asset_folder: img.asset_folder,
              display_name: img.display_name,
            }))
          : [imagePath];
        
        console.log("📡 Emitting upload-image event with paths:", paths);
        socket.emit("upload-image", paths);
        
        // Clear all images after successful upload
        setImage(null);
        setPreviewImages([]);
        setCapturedImages([]);
        
        toast.success("Images uploaded and sent successfully!");
        console.log("✅ Upload process completed successfully");
      } else {
        console.error("❌ Failed to upload images");
        toast.error("Failed to upload images");
      }
    } catch (error) {
      console.error("❌ Error during submit process:", error);
      toast.error("An error occurred during upload");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Upload Images</h1>
          <p className="text-gray-600">Capture photos or select files from your device</p>
        </div>

        {/* Camera Mode Toggle */}
        <div className="flex justify-center">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Camera Mode:</span>
              <Button
                type="button"
                variant={environment === 'environment' ? 'default' : 'outline'}
                size="sm"
                onClick={toggleCameraMode}
                className="flex items-center space-x-2 transition-all duration-200"
              >
                <Camera className="h-4 w-4" />
                <span>{environment === 'environment' ? 'Back Camera' : 'Front Camera'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Camera Component */}
        <CameraCapture 
          environment={environment} 
          onCapture={handleCapturedImage}
        />

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* File Input Section */}
            <div className="space-y-3">
              <label htmlFor="image" className="block text-lg font-semibold text-gray-900">
                Or select files from device
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="image"
                  multiple={true}
                  id="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors file:cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-300 transition-colors"
                />
              </div>
            </div>

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                <strong>Debug:</strong> {image ? `${image.length} files ready` : 'No files'} | 
                Previews: {previewImages.length} | 
                Captured: {capturedImages.length}
              </div>
            )}

            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Selected Images ({previewImages.length})
                  </h3>
                  <span className="text-sm text-gray-500">Click × to remove</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <Button 
              type="submit" 
              disabled={isLoading || !image || image.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Upload className="h-5 w-5" />
                  <span>
                    Upload {image && image.length > 1 ? `${image.length} Images` : 'Image'}
                  </span>
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}