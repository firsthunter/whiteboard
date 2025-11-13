import { getSettings } from "@/actions/settings";
import { getCurrentUser } from "@/actions/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth-options";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/settings-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    redirect('/sign-out');
  }

  const [userResult, settingsResult] = await Promise.all([
    getCurrentUser(),
    getSettings(),
  ]);

  if (!userResult.success || !userResult.data) {
    redirect('/sign-out');
  }

  const user = userResult.data;
  const settings = settingsResult.success && settingsResult.data ? settingsResult.data : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
                    <ProfileForm
            user={user}
          />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <SettingsForm 
            settings={settings} 
            section="preferences"
          />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <SettingsForm 
            settings={settings} 
            section="notifications"
          />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <SettingsForm 
            settings={settings} 
            section="privacy"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
