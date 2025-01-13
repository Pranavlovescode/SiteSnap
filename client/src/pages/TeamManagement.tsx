"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { QRCodeSVG } from "qrcode.react";
import { Users, Plus } from "lucide-react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import axios from "axios";
import { verifyCookieFrontend } from "@/config/cookie-verifier";
import toast from "react-hot-toast";
import { QrCode, Check } from "lucide-react";
import { generateJoiningCode } from "@/config/joiningCode";
import copy from "clipboard-copy";
import Link from "next/link";

type cookie = {
  name: string;
  value: string;
};

type DecodedToken = {
  id: string;
  name: string;
  email: string;
  exp: number;
  iat: number;
};

type TeamType = {
  id: string;
  name: string;
  description: string;
  adminId: string;
  admin: object;
  members: [];
  createdAt: Date;
  code: string;
};

const teamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export default function TeamManagement({ cookie }: { cookie: cookie[] }) {
  const [teams, setTeams] = useState<TeamType[]>([]);
  const [cookieDetails, setCookieDetails] = useState<DecodedToken | null>(null);
  const [joiningCode, setJoiningCode] = useState("");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const form = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Fetching teams from database
  const fetchTeam = async () => {
    if (!cookieDetails?.id) {
      console.error("Missing cookie details for fetchTeam");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/v1/get/team?id=${cookieDetails.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Team retrieved", data);
        setTeams(
          data.teams.map((teams: TeamType) => ({
            id: teams.id,
            name: teams.name,
            description: teams.description,
            createdAt: teams.createdAt,
            admin: teams.admin,
            adminId: teams.adminId,
            members: teams.members,
            code: teams.code,
          }))
        );
      } else {
        console.error("Failed to retrieve the details", response.status);
      }
    } catch (error) {
      console.error("Error during team fetch", error);
    }
  };

  useEffect(() => {
    const result = verifyCookieFrontend(cookie);
    if (result) {
      setCookieDetails({
        id: result.id,
        email: result.email,
        name: result.name,
        iat: result.iat,
        exp: result.exp,
      });
    } else {
      console.error("Invalid cookie details");
    }
  }, [cookie]);

  useEffect(() => {
    if (cookieDetails?.id) {
      fetchTeam();
    }
    if (teams) {
      console.log("teams are", teams);
    }
  }, [cookieDetails]);

  async function onSubmit(values: z.infer<typeof teamSchema>) {
    try {
      const code = generateJoiningCode();
      setJoiningCode(code);
      const teamResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/v1/create/team`,
        {
          name: values.name,
          description: values.description,
          code: joiningCode,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          params: {
            adm_id: cookieDetails?.id,
          },
        }
      );

      console.log("Team response", teamResponse.data);
      setTeams([...teams, teamResponse.data.team]);
      toast.success("Team created successfully");
      form.reset();
    } catch (error) {
      console.error("Error creating team", error);
      toast.error("Failed to create team");
    }
  }

  const joiningTeam = async () => {
    console.log("This is joining team function");
  };

  const copyToClipboard = async (code: string) => {
    try {
      console.log("Joining code:", code); // Debug log
      const result = await copy(code);
      setIsCopied(true);
      console.log("Copied to clipboard", result);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.log("Failed to copy to clipboard", error);
    }
  };

  console.log("Teams:", teams);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Create Team Form */}
        <Card className="backdrop-blur-md bg-white/60 border-none">
          <CardHeader>
            <CardTitle className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
              Create New Team
            </CardTitle>
            <CardDescription>
              Create a new team and invite members to collaborate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter team name"
                          {...field}
                          className="bg-white/30 backdrop-blur-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter team description"
                          {...field}
                          className="bg-white/30 backdrop-blur-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Create Team
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Team List */}
        <Card className="backdrop-blur-md bg-white/60 border-none">
          <CardHeader>
            <CardTitle className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 lg:w-6 lg:h-6" />
              Your Teams
            </CardTitle>
            <CardDescription>
              Select a team to view or share its join code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teams.length ? (
                teams.map((team) => (
                  <div
                    key={team.id}
                    className="p-3 lg:p-4 rounded-lg bg-white/50 hover:bg-white/60 transition-colors
        cursor-pointer flex flex-row justify-between items-center"
                  >
                    <div className="flex flex-col">
                      <Link href={`/dashboard/${team.id}`}>
                        <h3 className="font-semibold text-sm lg:text-base">
                          {team.name}
                        </h3>
                        {/* Debugging: Log team.code */}
                        <p className="text-xs lg:text-sm text-gray-600">
                          {team.description || "No description available"}{" "}
                          {/* Fallback for debugging */}
                        </p>
                      </Link>
                    </div>
                    <div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="p-2 hover:bg-slate-50 rounded-sm">
                            <QrCode className="" />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Share link</DialogTitle>
                            <DialogDescription>
                              Anyone who has this link will be able to join the
                              team.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col items-center space-x-2">
                            <div className="bg-white rounded-lg p-3 lg:p-4">
                              <QRCodeSVG
                                value={`${
                                  process.env.NODE_ENV === "production" ||
                                  process.env.NEXT_PUBLIC_FRONTEND
                                }/join-team/${team.id}`}
                                size={
                                  typeof window !== "undefined" &&
                                  window.innerWidth < 640
                                    ? 150
                                    : 200
                                }
                              />
                            </div>
                          </div>
                          <p>Joining Code</p>
                          <div className="flex flex-row justify-between">
                            <code>{team.code || "No code available"}</code>
                            <Button
                              onClick={() => {
                                console.log("Team:", team);
                                console.log("Team code:", team.code);
                                copyToClipboard(team.code);
                              }}
                              type="submit"
                              size="sm"
                              className="px-3"
                            >
                              {isCopied ? <Check /> : <Copy />}
                            </Button>
                          </div>
                          <DialogFooter className="sm:justify-start">
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Close
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-6 lg:py-8">
                  No teams created yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Join Code */}
      {/* {selectedTeam && (
        
      )} */}
    </div>
  );
}
