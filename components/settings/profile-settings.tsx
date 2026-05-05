"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { useSupabaseSession } from "@/lib/supabase/client";
import { X, Upload, Star, Image as ImageIcon, User } from "lucide-react";

interface ProfileImage {
  id?: string;
  url: string;
  width: number;
  height: number;
  default: boolean;
  file?: File; // For new uploads
}

interface UserProfile {
  zesty_id: string;
  slug: string;
  bio: string | null;
  suburb: string | null;
  images: ProfileImage[];
}

export function ProfileSettings() {
  const router = useRouter();
  // const { supabase } = useSupabaseSession(); // Not needed for client-side upload anymore
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [images, setImages] = useState<ProfileImage[]>([]);
  const [formData, setFormData] = useState({
    slug: "",
    bio: "",
    suburb: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/dash/settings/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
      setImages(data.images || []);
      setFormData({
        slug: data.slug || "",
        bio: data.bio || "",
        suburb: data.suburb || "",
      });
    } catch (error) {
      console.error(error);
      toastManager.add({
        title: "Error",
        description: "Failed to load profile settings",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 8) {
      toastManager.add({
        title: "Limit Reached",
        description: "You can only have up to 8 images",
        type: "warning",
      });
      return;
    }

    const newImages: ProfileImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      // Basic dimension check could happen here, but for now we just add it
      newImages.push({
        url,
        width: 800, // Placeholder
        height: 800, // Placeholder
        default: images.length === 0 && i === 0, // Make first image default if none exist
        file,
      });
    }

    setImages([...images, ...newImages]);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    if (imageToRemove.id) {
      setDeletedImageIds([...deletedImageIds, imageToRemove.id]);
    }
    const newImages = images.filter((_, i) => i !== index);

    // If we removed the default image, make the first one default
    if (imageToRemove.default && newImages.length > 0) {
      newImages[0].default = true;
    }

    setImages(newImages);
  };

  const setDefaultImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      default: i === index,
    }));
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("suburb", formData.suburb);

      // Append deleted image IDs
      if (deletedImageIds.length > 0) {
        formDataToSend.append("deletedImageIds", JSON.stringify(deletedImageIds));
      }

      // Append default image ID (if existing)
      const defaultImage = images.find(img => img.default);
      if (defaultImage?.id) {
        formDataToSend.append("defaultImageId", defaultImage.id);
      }

      // Handle new images
      // We need to map new images to their "default" status if applicable
      // Since we can't easily attach metadata to File objects in FormData in a structured way that matches the file array perfectly without some care,
      // we will append files and a separate JSON describing the new images' metadata (like isDefault).

      const newImagesMetadata: { isDefault: boolean }[] = [];

      images.forEach((img) => {
        if (img.file) {
          formDataToSend.append("newImages", img.file);
          newImagesMetadata.push({ isDefault: img.default });
        }
      });

      formDataToSend.append("newImagesMetadata", JSON.stringify(newImagesMetadata));

      const res = await fetch("/api/dash/settings/profile", {
        method: "PATCH",
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toastManager.add({
        title: "Success",
        description: "Profile updated successfully",
        type: "success",
      });

      // Refresh profile to get new IDs etc
      fetchProfile();
      setDeletedImageIds([]);

    } catch (error: any) {
      console.error(error);
      toastManager.add({
        title: "Error",
        description: error.message || "Failed to save changes",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your public profile information and photos.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Profile Photos</Label>
              <span className="text-xs text-muted-foreground">
                {images.length} / 8 images
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square group rounded-lg overflow-hidden border bg-muted">
                  <img
                    src={img.url}
                    alt={`Profile ${index + 1}`}
                    className="object-cover w-full h-full"
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end p-2 gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    {img.default ? (
                      <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md flex items-center gap-1 mt-auto w-full justify-center">
                        <Star className="h-3 w-3 fill-current" />
                        Main
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="mt-auto w-full text-xs h-7"
                        onClick={() => setDefaultImage(index)}
                      >
                        Make Default
                      </Button>
                    )}
                  </div>

                  {img.default && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full shadow-sm z-10">
                      Main
                    </div>
                  )}
                </div>
              ))}

              {images.length < 8 && (
                <div
                  className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors flex flex-col items-center justify-center cursor-pointer bg-muted/50 hover:bg-muted"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground font-medium">Add Photo</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="slug">Username</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="username"
                minLength={3}
                pattern="[a-zA-Z0-9_-]+"
              />
              <p className="text-xs text-muted-foreground">
                Your unique profile URL
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="min-h-[100px]"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bio.length}/1000
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="suburb">Suburb / City</Label>
              <Input
                id="suburb"
                value={formData.suburb}
                onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                placeholder="e.g. Sydney"
                maxLength={100}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <Spinner className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
