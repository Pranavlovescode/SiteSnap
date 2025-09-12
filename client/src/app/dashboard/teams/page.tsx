"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

// This will be replaced with actual API call
interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  role: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Fetch teams data
    const fetchTeams = async () => {
      try {
        const response = await axios.get("/api/team/get/admin", {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        const teams = response.data;
        // console.log("fetched teams ",teams)
        setTeams(
          teams.map((team: Team) => ({
            id: team.id,
            name: team.name,
            description: team.description,
            memberCount: team.memberCount,
            role: "Admin",
          }))
        );
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch teams:", error);
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  return (
    <div className="container py-10">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Your Teams
        </h2>
        <p className="text-muted-foreground">
          View and manage the teams you are a part of.
        </p>
      </div>

      <div className="mt-6">
        <Card className="backdrop-blur-md bg-white/60 border-none">
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>All teams you are a member of.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading teams...</div>
            ) : teams.length === 0 ? (
              <div className="text-center py-4">
                <p className="mb-4">You have not created any teams yet.</p>
                <Link href="/dashboard">
                  <Button>Create a Team</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Your Role</TableHead>
                    <TableHead className="w-[100px]">Settings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id} className="hover:bg-white/10">
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/${team.id}`}
                          className="hover:underline"
                        >
                          {team.name}
                        </Link>
                      </TableCell>
                      <TableCell>{team.description}</TableCell>
                      <TableCell>{team.memberCount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            team.role === "Admin"
                              ? "default"
                              : team.role === "Editor"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {team.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/settings?team_id=${team.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Settings for ${team.name}`}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
