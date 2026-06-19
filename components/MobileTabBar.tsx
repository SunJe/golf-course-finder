"use client";

import { Home, Map, Heart, Flag, User } from "lucide-react";

const TABS = [
  { id: "home", label: "홈", icon: Home, disabled: true },
  { id: "map", label: "지도", icon: Map, disabled: false },
  { id: "favorites", label: "즐겨찾기", icon: Heart, disabled: false },
  { id: "visited", label: "가본", icon: Flag, disabled: false },
  { id: "my", label: "마이", icon: User, disabled: true },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface MobileTabBarProps {
  favoriteOnly?: boolean;
  visitedOnly?: boolean;
  onToggleFavoriteOnly?: () => void;
  onToggleVisitedOnly?: () => void;
}

export default function MobileTabBar({
  favoriteOnly = false,
  visitedOnly = false,
  onToggleFavoriteOnly,
  onToggleVisitedOnly,
}: MobileTabBarProps) {
  const handlePress = (id: TabId) => {
    if (id === "favorites") {
      if (!favoriteOnly) onToggleFavoriteOnly?.();
      return;
    }
    if (id === "visited") {
      if (!visitedOnly) onToggleVisitedOnly?.();
      return;
    }
    if (id === "map" && (favoriteOnly || visitedOnly)) {
      if (favoriteOnly) onToggleFavoriteOnly?.();
      if (visitedOnly) onToggleVisitedOnly?.();
    }
  };

  const isActive = (id: TabId) => {
    if (id === "map") return !favoriteOnly && !visitedOnly;
    if (id === "favorites") return favoriteOnly;
    if (id === "visited") return visitedOnly;
    return false;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/70 bg-white/98 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.12)] backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="하단 메뉴"
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch justify-around px-0.5">
        {TABS.map(({ id, label, icon: Icon, disabled }) => {
          const active = isActive(id);
          const isDisabled = disabled;

          return (
            <button
              key={id}
              type="button"
              disabled={isDisabled}
              aria-current={active ? "page" : undefined}
              aria-label={
                isDisabled ? `${label} (준비 중)` : label
              }
              title={isDisabled ? "준비 중" : undefined}
              onClick={() => handlePress(id)}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 transition ${
                isDisabled
                  ? "cursor-not-allowed text-stone-300"
                  : active
                    ? "text-brand-800"
                    : "text-stone-400"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  active ? "stroke-[2.5px]" : "stroke-[1.75px]"
                } ${
                  id === "favorites" && favoriteOnly
                    ? "fill-brand-800 text-brand-800"
                    : id === "visited" && visitedOnly
                      ? "fill-brand-700 text-brand-700"
                      : ""
                }`}
              />
              <span
                className={`text-[10px] leading-none ${
                  active ? "font-bold" : "font-medium"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
