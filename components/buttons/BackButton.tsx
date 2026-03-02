"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import React from "react";

type BackButtonProps = {
  label?: string;
  variant?: "inline" | "floating";
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
};

export default function BackButton({
  label,
  variant = "inline",
  onClick,
  className = "",
  ariaLabel,
}: BackButtonProps) {
  const router = useRouter();
  const handle = onClick ?? (() => router.back());

  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-label={ariaLabel ?? "Go back"}
        className={`fixed top-4 left-4 md:top-6 md:left-6 z-40 p-2 md:p-3 border-2 border-green-600 bg-white hover:bg-green-50 transition-colors rounded-full shadow-lg ${className}`}
      >
        <ArrowLeft size={24} className="text-green-600" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={ariaLabel ?? "Go back"}
      className={`flex items-center text-gray-500 hover:text-black transition-colors w-fit ${className}`}
    >
      <ArrowLeft className="w-5 h-5 mr-1" />
      {label ? <span className="text-sm font-medium">{label}</span> : null}
    </button>
  );
}
