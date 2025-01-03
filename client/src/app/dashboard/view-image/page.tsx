"use client";

import { io, Socket } from "socket.io-client";
import React, { useEffect, useState } from "react";
import Image from "next/image";



export default function RealTimeImages() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Establish socket connection
    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND}`, {
      withCredentials: true,
    });
    setSocket(newSocket);
  }, []);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    const handleProcessStatus = (data: { path: string[] }) => {
      console.log("Received data:", data);
      if (data && Array.isArray(data.path)) {
        setImages((prevImages) => [...prevImages, ...data.path]);
      } else {
        console.error("Unexpected data format:", data);
      }
    };

    socket.on("process-status", handleProcessStatus);

    // Cleanup event listener
    return () => {
      socket.off("process-status", handleProcessStatus);
    };
  }, [socket]);
  return (
    <>
      <h1>Real-Time Images</h1>
      <div>
        {images.length === 0 && <p>No images uploaded yet.</p>}
        {images.map((image, index) => (
          <Image
            key={index}
            src={`${image}`}
            alt={`Uploaded ${index}`}
            width={200}
            height={200}
          />
        ))}
      </div>
    </>
  );
}
