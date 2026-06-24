import AdSlot from "@/components/ads/AdSlot";

interface SidebarAdProps {
  slot?: string;
  className?: string;
}

export default function SidebarAd({
  slot = "sidebar",
  className = "hidden lg:block",
}: SidebarAdProps) {
  return (
    <AdSlot
      slot={slot}
      format="vertical"
      className={className}
      label="사이드바 광고"
    />
  );
}
