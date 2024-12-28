'use client';

import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UploadImage() {
  const [image, setImage] = useState<File | null>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Establish socket connection
    const newSocket = io("http://localhost:5000");
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
      formData.append("image", image);

      console.log("Uploading image...");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/v1/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Image uploaded:", response.data);
      return response.data.multer.path; // Return the uploaded image path
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
        socket.emit("upload-image", { path: imagePath });
        console.log("Image path sent to server via socket:", imagePath);
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
      <p>Upload Image Page</p>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="image"
          id="image"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setImage(e.target.files[0]);
            }
          }}
        />
        <button type="submit">Upload</button>
      </form>
    </>
  );
}
