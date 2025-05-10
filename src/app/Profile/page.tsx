"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User, Mail, Phone, Image as ImageIcon, Save, Edit } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

export default function MyProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  // Récupérer l'utilisateur actuel
  const currentUser = useQuery(api.auth.getMe);
  const updateUser = useMutation(api.mutations.user.updateUser);

  // Charger les données de l'utilisateur
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
      setImage(currentUser.image || "");
    }
  }, [currentUser]);

  // Gérer la mise à jour du profil
  const handleUpdateProfile = async () => {
    if (!currentUser) return;

    try {
      await updateUser({
        userId: currentUser._id,
        name,
        phone,
        image,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminPanelLayout>
      <ContentLayout title="My Profile">
        <div className="p-6 space-y-6">
          {/* Carte de Profil */}
          <Card className="border border-border shadow-lg rounded-xl bg-background">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground flex items-center gap-2">
                <User className="w-8 h-8" />
                My Profile
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage your personal information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Avatar et Image de Profil */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={image} alt="Profile Image" />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-foreground font-medium">
                      Profile Image URL
                    </Label>
                    <Input
                      id="image"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      disabled={!isEditing}
                      className="rounded-lg border-border focus:border-primary"
                    />
                  </div>
                </div>
  
                {/* Section Nom */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="rounded-lg border-border focus:border-primary"
                  />
                </div>
  
                {/* Section Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="rounded-lg border-border bg-secondary"
                  />
                </div>
  
                {/* Section Téléphone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground font-medium flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    className="rounded-lg border-border focus:border-primary"
                  />
                </div>
  
                {/* Section Notifications */}
                <div className="space-y-2">
                  <Label htmlFor="notifications" className="text-foreground font-medium flex items-center gap-2">
                    🔔 Notifications
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="notifications"
                      checked={isNotificationEnabled}
                      onCheckedChange={setIsNotificationEnabled}
                      disabled={!isEditing}
                    />
                    <span className="text-sm text-muted-foreground">
                      {isNotificationEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
  
                {/* Boutons d'Action */}
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleUpdateProfile}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-300 flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="rounded-lg border-border hover:bg-secondary transition-all duration-300 flex items-center gap-2"
                      >
                        <Edit className="w-5 h-5" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all duration-300 flex items-center gap-2"
                    >
                      <Edit className="w-5 h-5" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}