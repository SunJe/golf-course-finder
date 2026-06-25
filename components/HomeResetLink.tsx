"use client";

import { usePathname } from "next/navigation";
import { useHomeReset } from "@/contexts/HomeResetContext";

interface HomeResetLinkProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

/** 같은 경로면 UI 초기화, 홈(/map) 이동 시 라우팅·초기화 처리 */
export default function HomeResetLink({
  href = "/",
  className,
  children,
  onClick,
}: HomeResetLinkProps) {
  const { goHome, resetCurrentView } = useHomeReset();
  const pathname = usePathname();

  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        onClick?.();
        if (pathname === href) {
          event.preventDefault();
          resetCurrentView();
          return;
        }
        if (href === "/") {
          goHome(event);
          return;
        }
      }}
    >
      {children}
    </a>
  );
}
