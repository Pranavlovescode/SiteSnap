"use client";

import React from "react";
import { Folder } from "lucide-react";
import Link from "next/link";

type PhotoDataType = {
  folder: string;
  id: string;
  name: string;
  url: string;
  createdAt: Date;
};

type TeamType = {
  id: string;
  name: string;
  description: string;
  adminId: string;
  admin: object;
  members: [];
  photoData: PhotoDataType[];
  createdAt: Date;
  code: string;
};

export default function File({ team }: { team: TeamType }) {
  // Group photoData by folder
  const groupedData = team.photoData.reduce(
    (acc: { [key: string]: PhotoDataType[] }, item) => {
      if (!acc[item.folder]) {
        acc[item.folder] = [];
      }
      acc[item.folder].push(item);
      return acc;
    },
    {}
  );

  return (
    <>
      <div className="p-3 mt-10" key={team.id}>
        {Object.keys(groupedData).length > 0 ? (
          Object.entries(groupedData).map(([folder], index) => (
            <Link
              href={`/dashboard/${team.id}/${team.name}/${team.photoData.find(
                (folder) => folder.folder === folder.folder
              )?.folder.split('/')[1]}/view-image`}
            >
              <div
                key={index}
                className="grid grid-cols-4 gap-4 md:grid-cols-3"
              >
                <div className="flex flex-col bg-white/30 rounded-lg p-2">
                  <Folder size={110} className="text-white" />
                  <h2 className="text-lg font-bold text-white">{folder}</h2>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-white">No folders or images available.</p>
        )}
      </div>
    </>
  );
}
