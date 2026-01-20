import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  });

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated!");
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications" className="hidden sm:inline-flex">Notifications</TabsTrigger>
          <TabsTrigger value="system" className="hidden sm:inline-flex">System</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue={user?.email} type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+1 234 567 8900" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input defaultValue={user?.role} disabled />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="w-full sm:w-auto">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" />
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4>Two-Factor Authentication</h4>
                    <p className="text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4>Email Notifications</h4>
                  <p className="text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked: boolean | undefined) =>
                    setNotifications({ ...notifications, email: !!checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4>Push Notifications</h4>
                  <p className="text-muted-foreground">
                    Receive push notifications
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked: boolean | undefined) =>
                    setNotifications({ ...notifications, push: !!checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4>SMS Notifications</h4>
                  <p className="text-muted-foreground">Receive text messages</p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked: boolean | undefined) =>
                    setNotifications({ ...notifications, sms: !!checked })
                  }
                />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4>Dark Mode</h4>
                    <p className="text-muted-foreground">Use dark theme</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4>Auto Backup</h4>
                    <p className="text-muted-foreground">
                      Automatically backup data daily
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4>Data Management</h4>
                  <div className="flex gap-2">
                    <Button variant="outline">Export Data</Button>
                    <Button variant="outline">Clear Cache</Button>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
