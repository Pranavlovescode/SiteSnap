"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TeamSettings from "@/layouts/team-settings";
import ProfileSettings from "@/layouts/profile-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Loading component for the Suspense boundary
function SettingsLoader() {
  return <div className="container py-10">Loading team settings...</div>;
}

// Component that safely uses useSearchParams inside Suspense
function TeamSettingsWrapper() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("team_id");

  if (!teamId) {
    return (
      <div className="container py-10">
        <h2 className="text-2xl font-bold tracking-tight text-white">Settings</h2>
        <div className="mt-6">
          <p>No team selected. Please select a team from your teams page.</p>
        </div>
      </div>
    );
  }

  return <TeamSettings teamId={teamId} />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoader />}>
      <TeamSettingsWrapper />
    </Suspense>
  );
}
