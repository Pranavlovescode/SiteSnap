import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import TeamSettings from "@/layouts/team-settings";
import ProfileSettings from "@/layouts/profile-settings";

export default function SettingsPage() {
  return (
    <div className="container py-10">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and team preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <Tabs defaultValue="team" className="space-y-4 ">
        <TabsList className="backdrop-blur-md bg-white/60">
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {/* <TabsTrigger value="notifications">Notifications</TabsTrigger> */}
        </TabsList>
        <TabsContent value="team" className="space-y-4">
          <TeamSettings />
        </TabsContent>
        <TabsContent value="profile" className="space-y-4">
          <ProfileSettings />
        </TabsContent>
        {/* <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
