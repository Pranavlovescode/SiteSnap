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
  photoData?: PhotoDataType[]; // <-- optional
  createdAt: Date;
  code: string;
};

export default function File({ team }: { team: TeamType }) {
  if (!team || !team.photoData) {
    return <p className="text-white p-3">No team or image data available.</p>;
  }

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
    <div className="p-3 mt-10 grid grid-cols-1 gap-4 md:grid-cols-4" key={team.id}>
      {Object.keys(groupedData).length > 0 ? (
        Object.entries(groupedData).map(([groupedFolder], index) => (
          <div key={index} className="my-3">
            <Link
              href={`/dashboard/${team.id}/${team.name}/${
                groupedFolder.split("/")[1] ?? groupedFolder
              }/view-image`}
            >
              <div className="flex flex-col justify-start items-center bg-white/30 rounded-lg p-2">
                <Folder size={110} className="text-white" />
                <h2 className="text-lg font-bold text-white">{groupedFolder}</h2>
              </div>
            </Link>
          </div>
        ))
      ) : (
        <p className="text-white">No folders or images available.</p>
      )}
    </div>
  );
}
