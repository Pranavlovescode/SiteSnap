"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TeamSettings from "@/layouts/team-settings";
import ProfileSettings from "@/layouts/profile-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Loading component for the Suspense boundary
function SettingsLoader() {
  return <div className="container py-10">Loading settings...</div>;
}

// Component that safely uses useSearchParams inside Suspense
function SettingsContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team_id");
  const defaultTab = teamId ? "team" : "profile";

  return (
    <div className="container py-10">
      <h2 className="text-2xl font-bold tracking-tight text-white mb-6">Settings</h2>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="team">Team Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="team">
          {teamId ? (
            <TeamSettings teamId={teamId} />
          ) : (
            <div className="mt-6 text-muted-foreground">
              <p>No team selected. Please select a team from your teams page.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoader />}>
      <SettingsContent />
    </Suspense>
  );
}
