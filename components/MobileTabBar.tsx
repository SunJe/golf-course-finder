"use client";

import { Home, Map, ShoppingBag, Crown, User } from "lucide-react";

const TABS = [
  { id: "home", label: "홈", icon: Home },
  { id: "map", label: "지도", icon: Map },
  { id: "shop", label: "샵", icon: ShoppingBag },
  { id: "membership", label: "멤버십", icon: Crown },
  { id: "my", label: "마이", icon: User },
] as const;

export default function MobileTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/80 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="하단 메뉴"
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch justify-around px-1">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = id === "map";
          return (
          <button
            key={id}
            type="button"
            disabled={!active}
            aria-current={active ? "page" : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 ${
              active
                ? "text-brand-800"
                : "text-stone-400"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${active ? "stroke-[2.5px]" : "stroke-[1.75px]"}`}
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
