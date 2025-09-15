"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Team {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}
// Mock data
const initialMembers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@sitesnap.com",
    role: "Admin",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Sam Wilson",
    email: "sam@sitesnap.com",
    role: "Editor",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Taylor Kim",
    email: "taylor@sitesnap.com",
    role: "Viewer",
    avatar: "/placeholder.svg?height=40&width=40",
  },
];

export default function TeamSettings({ teamId }: { teamId: string }) {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState(initialMembers);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Viewer");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDeleteTeamOpen, setIsDeleteTeamOpen] = useState(false);
  const navigate = useRouter();

  // fetch team by team id
  const fetchTeamById = async () => {
    const response = await axios.get("/api/team/get", {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        team_id: teamId,
      },
      withCredentials: true,
    });
    console.log(response.data);
    setTeamName(response.data.name);
    setMembers(
      response.data.members.map((t: Team) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        role: response.data.adminId == t.id ? "Admin" : "Member",
        avatar: t.avatar || "/placeholder.svg?height=40&width=40",
      }))
    );
  };

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) return;

    const newMember = {
      id: members.length + 1,
      name: newMemberEmail.split("@")[0],
      email: newMemberEmail,
      role: newMemberRole,
      avatar: "/placeholder.svg?height=40&width=40",
    };

    setMembers([...members, newMember]);
    setNewMemberEmail("");
    setNewMemberRole("Viewer");
    setIsAddMemberOpen(false);
  };

  const handleRemoveMember = (id: number) => {
    setMembers(members.filter((member) => member.id !== id));
  };

  const handleDeleteTeam = async () => {
    try {
      const response = await axios.delete("/api/team/delete", {
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          team_id: teamId,
        },
        withCredentials: true,
      });

      setTeamName("");
      setMembers([]);
      setIsDeleteTeamOpen(false);
      toast.success("Team deleted successfully");
      navigate.push("/dashboard");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Failed to delete team");
    }
  };

  const handleUpdateTeamName = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const response = await axios.put(
        "/api/team/update/details",
        {
          teamName,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
          params: {
            team_id: teamId,
          },
        }
      );
      console.log("team update response", response.data);
      toast.success(response.data.msg);
    } catch (error) { 
      console.error("Error updating team:", error);
      toast.error("Failed to update team details");
    }
  };

  useEffect(() => {
    fetchTeamById();
  }, []);

  return (
    <div className="space-y-6 container ">
      <Card className="backdrop-blur-md bg-white/60 border-none">
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
          <CardDescription>
            Update your team details and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateTeamName} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={teamName}
                className="bg-white"
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-md bg-white/60 border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Invite and manage your team members.
            </CardDescription>
          </div>
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Member</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Invite a new member to your team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Email address"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newMemberRole}
                    onValueChange={setNewMemberRole}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Editor">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddMemberOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember}>Add Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.role === "Admin"
                          ? "default"
                          : member.role === "Editor"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove member</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove Team Member
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {member.name} from
                            the team? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMember(member.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-destructive backdrop-blur-md bg-white/60">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog
            open={isDeleteTeamOpen}
            onOpenChange={setIsDeleteTeamOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Team</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Team</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this team? This action cannot
                  be undone and all team data will be permanently lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTeam}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Team
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
