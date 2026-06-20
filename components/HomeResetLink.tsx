"use client";

import { useHomeReset } from "@/contexts/HomeResetContext";

interface HomeResetLinkProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

/** 로고 / 홈 네비 클릭 시 홈 UI를 초기 상태로 되돌린다. */
export default function HomeResetLink({
  href = "/",
  className,
  children,
  onClick,
}: HomeResetLinkProps) {
  const { goHome } = useHomeReset();

  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        onClick?.();
        goHome(event);
      }}
    >
      {children}
    </a>
  );
}
