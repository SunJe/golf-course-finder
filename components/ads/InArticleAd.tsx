import AdSlot from "@/components/ads/AdSlot";

interface InArticleAdProps {
  slot?: string;
  className?: string;
}

export default function InArticleAd({
  slot = "in-article",
  className = "",
}: InArticleAdProps) {
  return (
    <AdSlot
      slot={slot}
      format="auto"
      className={className}
      label="본문 광고"
    />
  );
}
