"use client";

import { Phone, MapPin, CalendarCheck, ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

type CourseStickyActionBarProps = {
  courseName: string;
  phone?: string;
  naverMapUrl: string;
  reservationHref?: string;
  reservationLabel: string;
};

export default function CourseStickyActionBar({
  courseName,
  phone,
  naverMapUrl,
  reservationHref,
  reservationLabel,
}: CourseStickyActionBarProps) {
  const actions: {
    key: string;
    label: string;
    href: string;
    external?: boolean;
    icon: typeof Phone;
    onClick: () => void;
  }[] = [];

  if (phone?.trim()) {
    actions.push({
      key: "call",
      label: "전화",
      href: `tel:${phone.replace(/\s/g, "")}`,
      icon: Phone,
      onClick: () => trackEvent("course_call_click"),
    });
  }

  actions.push({
    key: "map",
    label: "네이버지도",
    href: naverMapUrl,
    external: true,
    icon: MapPin,
    onClick: () => trackEvent("course_map_click"),
  });

  if (reservationHref) {
    actions.push({
      key: "reserve",
      label: reservationLabel,
      href: reservationHref,
      external: true,
      icon: reservationLabel.includes("예약") ? CalendarCheck : ExternalLink,
      onClick: () => trackEvent("course_reservation_click"),
    });
  }

  if (actions.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200/90 bg-white/95 backdrop-blur-md md:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      role="navigation"
      aria-label={`${courseName} 바로가기`}
    >
      <div
        className={`mx-auto grid max-w-3xl gap-2 px-3 py-2.5 ${
          actions.length === 1
            ? "grid-cols-1"
            : actions.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
        }`}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <a
              key={action.key}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noopener noreferrer" : undefined}
              onClick={action.onClick}
              className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white px-2 text-xs font-bold text-stone-800 shadow-sm transition active:scale-[0.98] ${FOCUS_RING} ${
                action.key === "reserve"
                  ? "border-brand-700 bg-brand-800 text-white"
                  : ""
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{action.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
