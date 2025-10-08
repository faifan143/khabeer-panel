"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, AlertCircle } from "lucide-react";
import { useState } from "react";

interface ClickableImageProps {
  src?: string;
  alt: string;
  fallback?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  type?: "avatar" | "image";
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function ClickableImage({
  src,
  alt,
  fallback,
  className = "",
  size = "md",
  type = "avatar",
}: ClickableImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleClick = () => {
    if (src && !hasError) {
      try {
        window.open(src, "_blank", "noopener,noreferrer");
      } catch (error) {
        console.error("Failed to open image:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  if (type === "image") {
    return (
      <div
        className={`relative cursor-pointer transition-all duration-200 ${className}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        tabIndex={0}
        role="button"
        aria-label={`Open ${alt} in new tab`}
      >
        {hasError ? (
          <div className="h-16 w-24 bg-gray-100 rounded flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-gray-400" />
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className="h-16 w-auto rounded object-cover"
            onError={() => setHasError(true)}
          />
        )}
        {isHovered && !hasError && (
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded flex items-center justify-center">
            <ExternalLink className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      role="button"
      aria-label={`Open ${alt} profile image in new tab`}
    >
      <Avatar
        className={`${sizeClasses[size]} ${
          isHovered ? "ring-2 ring-blue-500 ring-offset-2" : ""
        }`}
      >
        <AvatarImage src={src} alt={alt} onError={() => setHasError(true)} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      {isHovered && !hasError && src && (
        <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
          <ExternalLink className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}
