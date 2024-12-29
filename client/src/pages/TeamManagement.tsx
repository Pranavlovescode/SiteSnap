"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { QRCodeSVG } from "qrcode.react";
import { Users, Plus, Share2 } from "lucide-react";

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
import axios from "axios";
import { verifyCookieFrontend } from "@/config/cookie-verifier";
import toast from "react-hot-toast";

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

const teamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export default function TeamManagement({ cookie }: { cookie: cookie[] }) {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [cookieDetails, setCookieDetails] = useState<DecodedToken | null>(null);

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
        setTeams(data.teams || []);
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
        id:result.id,
        email:result.email,
        name:result.name,
        iat:result.iat,
        exp:result.exp
      });
    } else {
      console.error("Invalid cookie details");
    }
  }, [cookie]);

  useEffect(() => {
    if (cookieDetails?.id) {
      fetchTeam();
    }
  }, [cookieDetails]);

  async function onSubmit(values: z.infer<typeof teamSchema>) {
    try {
      const newTeam = {
        id: Date.now().toString(),
        ...values,
        joinCode: Math.random().toString(36).substring(7),
      };
      setTeams([...teams, newTeam]);

      const teamResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/v1/create/team`,
        {
          name: values.name,
          description: values.description,
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
      toast.success("Team created successfully");
      form.reset();
    } catch (error) {
      console.error("Error creating team", error);
      toast.error("Failed to create team");
    }
  }

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
                    className="p-3 lg:p-4 rounded-lg bg-white/50 hover:bg-white/60 transition-colors cursor-pointer"
                    onClick={() => setSelectedTeam(team)}
                  >
                    <h3 className="font-semibold text-sm lg:text-base">
                      {team.name}
                    </h3>
                    <p className="text-xs lg:text-sm text-gray-600">
                      {team.description}
                    </p>
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
      {selectedTeam && (
        <Card className="backdrop-blur-md bg-white/60 border-none">
          <CardHeader>
            <CardTitle className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <Share2 className="w-5 h-5 lg:w-6 lg:h-6" />
              Team Join Code
            </CardTitle>
            <CardDescription>
              Share this QR code with team members to join {selectedTeam.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-4">
            <div className="bg-white rounded-lg p-3 lg:p-4">
              <QRCodeSVG
                value={`${
                  process.env.NEXT_PUBLIC_FRONTEND || "http://localhost:3000"
                }/`}
                size={
                  typeof window !== "undefined" && window.innerWidth < 640
                    ? 150
                    : 200
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
