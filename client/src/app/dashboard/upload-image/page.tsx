"use client";

import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function UploadImage() {
  const [image, setImage] = useState<File[] | null>(null);
  const [socket, setSocket] = useState<any | null>(null);

  useEffect(() => {
    // Establish socket connection
    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND}`, {
      withCredentials: true,
    });
    setSocket(newSocket);

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const uploadImage = async (): Promise<string | null> => {
    if (!image) {
      console.error("No image selected");
      return null;
    }

    try {
      const formData = new FormData();
      image.forEach((file)=>{
        formData.append("image",file);
      })
      console.log("Image data",formData);
      console.log("Uploading image...");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/v1/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Image uploaded:", response.data.cloudinary);
      return response.data.cloudinary; // Return the uploaded image paths
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
        const paths = Array.isArray(imagePath) ? imagePath.map((image) => image.secure_url) : [imagePath];
        console.log("The paths are ",paths)
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
        <Button type="submit">Upload</Button>
      </form>
    </>
  );
}
