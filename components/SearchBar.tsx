"use client";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "lg" | "md";
  variant?: "default" | "hero";
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "골프장명, 지역, 주소로 검색",
  size = "md",
  variant = "default",
}: SearchBarProps) {
  const lg = size === "lg";
  const hero = variant === "hero";

  return (
    <div className="relative w-full">
      <Search
        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
          hero ? "text-stone-400" : "text-gray-400"
        } ${lg ? "h-5 w-5" : "h-4.5 w-4.5"}`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-full border bg-white pl-12 pr-11 text-gray-900 outline-none transition placeholder:text-gray-400 ${
          hero
            ? "border-white/20 shadow-lg focus:border-white focus:ring-2 focus:ring-white/30"
            : "border-gray-200 shadow-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        } ${lg ? "h-14 text-base" : "h-11 text-sm"}`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="검색어 지우기"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
