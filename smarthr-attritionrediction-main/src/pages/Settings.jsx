import { Layout } from "@/components/layout/Layout.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { getProfile, updateProfile } from "@/services/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [language, setLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("mm/dd/yyyy");

  const [profile, setProfile] = useState({
     email: "",
     username: "",
     phone: "",
     department: "",
     role: "",
     avatar: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
        } catch (error) {
            toast.error("Using local profile data (API offline or unauthenticated).");
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            setProfile({ email: storedUser.email || "admin@smarthr.com", username: storedUser.name || "Admin User", role: storedUser.role || "HR", phone: "", department: "" });
        }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("hrmate-dark-mode", darkMode ? "true" : "false");
  }, [darkMode]);

  const handleToggle = (setter, label) => (checked) => {
    setter(checked);
    toast.success(`${label} ${checked ? "enabled" : "disabled"}`);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        const updated = await updateProfile({
            username: profile.username,
            phone: profile.phone,
            department: profile.department,
            avatar: profile.avatar
        });
        setProfile(updated.user);
        toast.success("Profile saved successfully!");
        
        localStorage.setItem("user", JSON.stringify({
            name: updated.user.username || updated.user.email?.split('@')[0],
            role: updated.user.role,
            avatar: updated.user.avatar,
            initials: (updated.user.username || updated.user.email).charAt(0).toUpperCase()
        }));
        window.dispatchEvent(new Event("profile-updated"));
    } catch(err) {
        toast.error(err.message || "Error updating profile");
    } finally {
        setIsSaving(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              
              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center justify-center space-y-4 pb-4 border-b border-border">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById("avatar-upload").click()}>
                  <Avatar className="h-24 w-24 border-4 border-muted shadow-sm transition-all duration-200 group-hover:opacity-75">
                    {profile.avatar ? (
                      <AvatarImage src={profile.avatar} alt="Profile Picture" className="object-cover" />
                    ) : (
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || profile.email}&backgroundColor=b6e3f4`} />
                    )}
                    <AvatarFallback className="text-2xl">{profile.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
                <input 
                  id="avatar-upload"
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="text-center">
                  <p className="text-sm font-medium">Profile Picture</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profile.email} disabled className="bg-muted text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={profile.role} disabled className="bg-muted text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Full Name</Label>
                  <Input id="username" value={profile.username || ""} onChange={(e) => setProfile({...profile, username: e.target.value})} placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={profile.phone || ""} onChange={(e) => setProfile({...profile, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={profile.department || ""} onChange={(e) => setProfile({...profile, department: e.target.value})} placeholder="Human Resources" />
                </div>
              </div>
              <Button type="submit" disabled={isSaving} className="w-full sm:w-auto mt-4">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={handleToggle(setDarkMode, "Dark mode")} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="date-format">Date Format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifs">Email Notifications</Label>
              <Switch id="email-notifs" checked={emailNotifs} onCheckedChange={handleToggle(setEmailNotifs, "Email notifications")} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="risk-alerts">Attrition Risk Alerts</Label>
              <Switch id="risk-alerts" checked={riskAlerts} onCheckedChange={handleToggle(setRiskAlerts, "Risk alerts")} />
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
