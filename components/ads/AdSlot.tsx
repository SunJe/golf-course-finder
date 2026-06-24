"use client";

import { isAdSenseEnabled, getAdSenseClientId } from "@/lib/adsConfig";

interface AdSlotProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  label?: string;
}

export default function AdSlot({
  slot,
  format = "auto",
  className = "",
  label = "광고",
}: AdSlotProps) {
  if (!isAdSenseEnabled()) return null;

  const clientId = getAdSenseClientId();
  if (!clientId) return null;

  return (
    <aside
      aria-label={label}
      className={`my-6 overflow-hidden ${className}`}
    >
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
