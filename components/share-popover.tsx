"use client";

import {
  Code,
  Mail,
  Check,
  Copy,
  Share2,
} from "lucide-react";
import {
  RiFacebookFill,
  RiGoogleFill,
  RiMicrosoftFill,
  RiTwitterXFill,
} from "@remixicon/react";

import { useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/origin_ui_old/button";
import { Input } from "@/components/origin_ui_old/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/origin_ui_old/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/origin_ui_old/tooltip";

interface SharePopoverProps {
  url: string;
  title?: string;
  className?: string;
  align?: "center" | "start" | "end";
  side?: "top" | "right" | "bottom" | "left";
  children?: React.ReactNode;
}

export function SharePopover({
  url,
  title = "Check this out!",
  className,
  align = "center",
  side = "bottom",
  children,
}: SharePopoverProps) {
  const id = useId();
  const [copied, setCopied] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(inputRef.current.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
        break;
      case "embed":
        // Just copy the link for now, or could be an iframe code
        navigator.clipboard.writeText(`<iframe src="${url}" />`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="outline" className={className}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-72" align={align} side={side} collisionPadding={16}>
        <div className="flex flex-col gap-3 text-center">
          <div className="font-medium text-sm">Share</div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              aria-label="Share on Twitter"
              size="icon"
              variant="outline"
              onClick={() => handleShare("twitter")}
            >
              <RiTwitterXFill aria-hidden="true" size={16} />
            </Button>

            <Button
              aria-label="Share on Facebook"
              size="icon"
              variant="outline"
              onClick={() => handleShare("facebook")}
            >
              <RiFacebookFill aria-hidden="true" size={16} />
            </Button>

            <Button
              aria-label="Share via email"
              size="icon"
              variant="outline"
              onClick={() => handleShare("email")}
            >
              <Mail aria-hidden="true" size={16} />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Input
                aria-label="Share link"
                className="pe-9"
                defaultValue={url}
                id={id}
                readOnly
                ref={inputRef}
                type="text"
              />
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label={copied ? "Copied" : "Copy to clipboard"}
                      className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed"
                      disabled={copied}
                      onClick={handleCopy}
                      type="button"
                    >
                      <div
                        className={cn(
                          "transition-all",
                          copied
                            ? "scale-100 opacity-100"
                            : "scale-0 opacity-0",
                        )}
                      >
                        <Check
                          aria-hidden="true"
                          className="stroke-emerald-500"
                          size={16}
                        />
                      </div>
                      <div
                        className={cn(
                          "absolute transition-all",
                          copied
                            ? "scale-0 opacity-0"
                            : "scale-100 opacity-100",
                        )}
                      >
                        <Copy aria-hidden="true" size={16} />
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Copy to clipboard
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
