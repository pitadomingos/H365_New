"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, User, Building2, Globe, Moon, Sun, Monitor, CheckCircle2, ShieldCheck, Mail, Phone, MapPin, Database, RefreshCw } from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { useUser, MOCK_USERS, type UserRole } from '@/context/user-context';
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { currentLocale, setLocale } = useLocale();
  const { user, setUser } = useUser();
  const { theme, setTheme } = useTheme();
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated and synchronized with the facility node.",
    });
  };

  const handleRoleSwitch = (role: UserRole) => {
    setUser(MOCK_USERS[role]);
    toast({
      title: "Perspective Switched",
      description: `Now viewing as ${role.replace('_', ' ')}. Dashboard metrics and permissions updated.`,
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" /> Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account, facility configuration, and application preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:flex lg:gap-2 bg-transparent h-auto p-0 border-b rounded-none mb-6">
          <TabsTrigger value="profile" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-10 px-6 gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="facility" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-10 px-6 gap-2">
            <Building2 className="h-4 w-4" /> Facility
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-10 px-6 gap-2">
            <Globe className="h-4 w-4" /> Display
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none h-10 px-6 gap-2">
            <Database className="h-4 w-4" /> System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Your personal information and security roles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 mb-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20">
                  {user?.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{user?.name}</h3>
                  <Badge variant="secondary" className="mt-1 gap-1">
                    <ShieldCheck className="h-3 w-3" /> {user?.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue={user?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" className="pl-9" defaultValue={user?.email} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" className="pl-9" defaultValue="+258 84 123 4567" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 justify-between">
              <p className="text-xs text-muted-foreground italic">Last synchronized: 10 mins ago</p>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Demo Perspective Switcher</CardTitle>
              <CardDescription>Quickly switch between hierarchical roles for testing.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant={user?.role === 'NATIONAL_ADMIN' ? 'default' : 'outline'} size="sm" onClick={() => handleRoleSwitch('NATIONAL_ADMIN')}>National Level</Button>
              <Button variant={user?.role === 'PROVINCIAL_ADMIN' ? 'default' : 'outline'} size="sm" onClick={() => handleRoleSwitch('PROVINCIAL_ADMIN')}>Provincial Level</Button>
              <Button variant={user?.role === 'DISTRICT_ADMIN' ? 'default' : 'outline'} size="sm" onClick={() => handleRoleSwitch('DISTRICT_ADMIN')}>District Level</Button>
              <Button variant={user?.role === 'FACILITY_ADMIN' ? 'default' : 'outline'} size="sm" onClick={() => handleRoleSwitch('FACILITY_ADMIN')}>Facility Level</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Facility Details</CardTitle>
              <CardDescription>Current hospital node configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facility Name</Label>
                  <Input defaultValue={user?.jurisdiction.facility || "Central General Hospital"} />
                </div>
                <div className="space-y-2">
                  <Label>Facility ID (OpenHIE)</Label>
                  <Input defaultValue="HCM-MZ-00451" disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input defaultValue={user?.jurisdiction.district || "Maputo Central"} />
                </div>
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Input defaultValue={user?.jurisdiction.province || "Maputo City"} />
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> GPS Coordinates</Label>
                <div className="flex gap-2">
                  <Input defaultValue="-25.9678" placeholder="Lat" />
                  <Input defaultValue="32.5852" placeholder="Long" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button variant="outline" className="w-full">Edit Clinical Capabilities</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance & Localization</CardTitle>
              <CardDescription>Customize how H365 looks and speaks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme Preference</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant={theme === 'light' ? 'default' : 'outline'} className="flex-col h-20 gap-2" onClick={() => setTheme('light')}>
                    <Sun className="h-5 w-5" />
                    <span>Light</span>
                  </Button>
                  <Button variant={theme === 'dark' ? 'default' : 'outline'} className="flex-col h-20 gap-2" onClick={() => setTheme('dark')}>
                    <Moon className="h-5 w-5" />
                    <span>Dark</span>
                  </Button>
                  <Button variant={theme === 'system' ? 'default' : 'outline'} className="flex-col h-20 gap-2" onClick={() => setTheme('system')}>
                    <Monitor className="h-5 w-5" />
                    <span>System</span>
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>System Language</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant={currentLocale === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLocale('en')}>English</Button>
                  <Button variant={currentLocale === 'pt' ? 'default' : 'outline'} size="sm" onClick={() => setLocale('pt')}>Português</Button>
                  <Button variant={currentLocale === 'it' ? 'default' : 'outline'} size="sm" disabled className="opacity-50">Italiano (Coming Soon)</Button>
                  <Button variant={currentLocale === 'es' ? 'default' : 'outline'} size="sm" disabled className="opacity-50">Español (Coming Soon)</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System & Connectivity</CardTitle>
              <CardDescription>Low-resource network and synchronization settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <p className="font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Facility Hub (L-LAN)
                  </p>
                  <p className="text-xs text-muted-foreground">The local server is operational and reachable.</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Online</Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Sync Policy</Label>
                  <Badge variant="outline">Cloud-as-Master</Badge>
                </div>
                <div className="grid gap-2">
                   <Button variant="outline" className="justify-start gap-2 h-auto py-3 px-4">
                      <RefreshCw className="h-4 w-4" />
                      <div className="text-left">
                        <p className="text-sm font-bold">Manual Deep Sync</p>
                        <p className="text-[10px] text-muted-foreground">Full reconciliation of all clinical records (approx. 5 mins).</p>
                      </div>
                   </Button>
                   <Button variant="outline" className="justify-start gap-2 h-auto py-3 px-4" disabled>
                      <Database className="h-4 w-4" />
                      <div className="text-left">
                        <p className="text-sm font-bold">Clear Local Cache</p>
                        <p className="text-[10px] text-muted-foreground italic">Restricted to Facility Administrators.</p>
                      </div>
                   </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
