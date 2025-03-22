"use client";

import { io, Socket } from "socket.io-client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function UploadImage() {
  const [image, setImage] = useState<File[] | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const params = useParams<{ team_id: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // console.log("Team id is ",params?.team_id)
  useEffect(() => {
    // Establish socket connection
    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND}`||"http://localhost:5001", {
      withCredentials: true,
    });
    setSocket(newSocket);

    // Listen for events
    socket?.on("connection", () => {
      console.log("Socket connected");
    });
    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const uploadImage = async (): Promise<string | null> => {
    setIsLoading(true);
    if (!image) {
      console.error("No image selected");
      return null;
    }

    try {
      const formData = new FormData();
      image.forEach((file) => {
        formData.append("image", file);
      });
      console.log("Image data", formData);
      console.log("Uploading image...");
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
      if (response.status == 201) {
        setIsLoading(false);
        console.log("Image uploaded:", response.data.cloudinary);
        toast.success(response.data.message);
        return response.data.cloudinary; // Return the uploaded image paths
      } else {
        setIsLoading(false);
        console.log("Error in uploading image");
        toast.error(response.data.error);
        return "Error in uploading image";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!socket) {
      console.error("Socket is not connected");
      return;
    }

    try {
      const imagePath = await uploadImage(); // Wait for image upload to complete
      if (imagePath) {
        // Emit the event to the Socket.IO server
        const paths = Array.isArray(imagePath)
          ? imagePath.map((image) => ({
              secure_url: image.secure_url,
              asset_folder: image.asset_folder,
              display_name: image.display_name,
            }))
          : [imagePath];
        console.log("The paths are ", paths);
        socket.emit("upload-image", paths);
        console.log("Image path sent to server via socket:", paths);
      } else {
        console.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error during image upload or socket emit:", error);
    }
  };

  return (
    <>
      <h1>Upload Image</h1>
      {/* <p>Upload Image Page</p> */}
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="image"
          multiple={true}
          id="image"
          onChange={(e) => {
            if (e.target.files) {
              setImage(Array.from(e.target.files));
            }
          }}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Image"
          )}
        </Button>
      </form>
    </>
  );
}
