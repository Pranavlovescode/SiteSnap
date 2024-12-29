"use client";

import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";

export default function RealTimeImages() {
  const [socket, setSocket] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Establish socket connection
    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND}`, {
      withCredentials: true,
    });
    setSocket(newSocket);

    // Listen for real-time image events
    newSocket.on("process-status", (data) => {
      console.log("Received data:", data); // Inspect the structure
      if (data && Array.isArray(data.path)) {
        setImages((prevImages) => [...prevImages, ...data.path]);
      } else {
        console.error("Unexpected data format:", data);
      }
    });

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <>
      <h1>Real-Time Images</h1>
      <div>
        {images.length === 0 && <p>No images uploaded yet.</p>}
        {images.map((image, index) => (
          <img
            key={index}
            src={`${image}`}
            alt={`Uploaded ${index}`}
            width="200"
          />
        ))}
      </div>
    </>
  );
}
