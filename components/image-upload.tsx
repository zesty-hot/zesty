"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2, VideoIcon, X } from "lucide-react";
import { toastManager } from "@/components/ui/toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  uploadEndpoint?: string;
  accept?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  uploadEndpoint = "/api/events/upload",
  accept = "image/*"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type based on accept prop
    // Simple validation: check if file type matches the main type in accept (e.g. "image" in "image/*")
    const mainType = accept.split('/')[0];
    if (accept !== "*/*" && !file.type.startsWith(mainType)) {
      toastManager.add({
        title: "Invalid file type",
        description: `Please upload a valid ${mainType} file.`,
        type: "error",
      });
      return;
    }

    // Validate file size (e.g., 10MB for images, 50MB for videos)
    const maxSize = mainType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toastManager.add({
        title: "File too large",
        description: `File must be less than ${mainType === 'video' ? '50MB' : '10MB'}.`,
        type: "error",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload file");
      }

      const data = await response.json();
      onChange(data.url);

      toastManager.add({
        title: "Success",
        description: "File uploaded successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toastManager.add({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file. Please try again.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  const isVideo = value?.match(/\.(mp4|webm|mov)$/i);

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border flex items-center justify-center bg-black">
            {isVideo ? (
              <video src={value} controls className="w-full h-full" />
            ) : (
              <img
                src={value}
                alt="Upload"
                className="object-cover w-full h-full"
              />
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 z-10"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer bg-muted/50 hover:bg-muted"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {accept === "image/*" ? <ImageIcon className="w-8 h-8 mb-3 text-muted-foreground" /> : <VideoIcon className="w-8 h-8 mb-3 text-muted-foreground" />}
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {accept === "image/*" ? "PNG, JPG or GIF (MAX. 10MB)" : "MP4 or MOV (MAX. 50MB)"}
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading...
        </div>
      )}
    </div>
  );
}
