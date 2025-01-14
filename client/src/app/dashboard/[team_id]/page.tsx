"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import FileSystem from "@/pages/FileSystem";

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

function page() {
  const [team, setTeam] = useState<TeamType | null>(null);
  const params = useParams<{ team_id: string }>();

  const fetchTeams = async () => {
    const team_response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND}/api/v1/team`,
      {
        withCredentials: true,
        params: {
          id: params?.team_id,
        },
      }
    );
    if (team_response.status == 200) {
      console.log("Team fetched", team_response.data.teams);
      setTeam(team_response.data.teams);
    } else {
      console.error("Failed to fetch team");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div className="text-white">
      <h2 className="font-semibold text-4xl">{team?.name}</h2>
      {team && <FileSystem team={team} />}
    </div>
  );
}

export default page;
