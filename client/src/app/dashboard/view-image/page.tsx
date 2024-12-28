"use client";

import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";

export default function RealTimeImages() {
  const [socket, setSocket] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Establish socket connection
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    // Listen for real-time image events
    newSocket.on("process-status", (data) => {
      console.log("New image received:", data);
      setImages((prevImages) => [...prevImages, data.path]);
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
            src={`${process.env.NEXT_PUBLIC_BACKEND}/${image}`}
            alt={`Uploaded ${index}`}
            width="200"
          />
        ))}
      </div>
    </>
  );
}
