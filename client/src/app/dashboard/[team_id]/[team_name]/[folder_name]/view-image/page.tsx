"use client";

import { io, Socket } from "socket.io-client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


export default function RealTimeImages() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [images, setImages] = useState<
    { url: string; folder: string; fileName: string }[]
  >([]);
  const params = useParams<{
    team_id: string;
    team_name: string;
    folder_name: string;
  }>();

  useEffect(() => {
  const connect = async () => {
    try {
      const res = await fetch('/api/session-token',{
        method:"GET",
        credentials:"include"
      })
      const data = await res.json()

      if (!data.token) {
        console.error('❌ No token returned')
        return
      }

      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND!, {
        auth: {
          token: data.token,
        },
        withCredentials: true,
      })

      newSocket.on("connect", () => {
        console.log("✅ WebSocket connected")
        
      })

      fetchUploadedImages()

      newSocket.on("connect_error", (err) => {
        console.error("❌ WebSocket connection failed:", err.message)
      })

      setSocket(newSocket)
    } catch (error) {
      console.error("❌ Error connecting socket:", error)
    }
  }

  connect()

  return () => {
    socket?.disconnect()
  }
}, [])

  const fetchUploadedImages = async () => {
    try {
      const response = await axios.get("/api/image-data/get", {
        withCredentials: true,
        params: { teamId: params?.team_id },
      });

      if (response.status === 200) {
        console.log("Images fetched", response.data);
        setImages(
          response.data.images.map(
            (image: { url: string; folder: string; name: string }) => ({
              url: image.url,
              folder: image.folder,
              fileName: image.name,
            })
          )
        );
      } else {
        console.error("Failed to fetch images");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  console.log("team_name", params?.team_name);

  useEffect(() => {
    if (!socket) return;

    const handleProcessStatus = (data: {
      success: boolean;
      path: {
        asset_folder: string;
        secure_url: string;
        display_name: string;
      }[];
    }) => {
      console.log("Received data:", data);

      // Decode the team_name from the URL to account for '%20' (spaces)
      const decodedTeamName = decodeURIComponent(params?.team_name || "");

      const correctFolder = data.path.filter(
        (image) => image.asset_folder.split("/")[0] === decodedTeamName
      );

      if (data?.success && Array.isArray(data.path) && correctFolder) {
        setImages((prevImages) => [
          ...prevImages,
          ...correctFolder.map((image) => ({
            url: image.secure_url,
            folder: image.asset_folder,
            fileName: image.display_name,
          })),
        ]);
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

  console.log("sitesnap images", images);

  return (
    <div className="p-5 bg-white/30 rounded-md">
      <h1 className="text-white text-2xl mb-5">Real-Time Images</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
        {images.length === 0 && (
          <p className="text-white">No images uploaded yet.</p>
        )}
        {images
          .filter((img) => img.folder.split("/")[1] === params?.folder_name)
          .map((image, index) => (
            /* Creating the mecahnism, when the user clicks on the image, so it will bw shown in the dialog box with larger size */
            <Dialog>
              <DialogTrigger asChild>
                <div
                  key={index}
                  onClick={() => console.log("Image clicked", image)}
                  className="bg-gray-800 p-2 rounded-md shadow-lg flex flex-col items-center justify-center hover:cursor-pointer"
                >
                  <Image
                    src={image?.url}
                    alt={`Uploaded image ${index}`}
                    width={200}
                    height={200}
                    className="rounded"
                  />
                  <p className="text-white text-center mt-2">
                    {image?.fileName}
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{image.fileName}</DialogTitle>
                  <Image
                    src={image?.url}
                    alt={`Uploaded image ${index}`}
                    width={900}
                    height={900}
                    className="rounded"
                  />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
      </div>
    </div>
  );
}
