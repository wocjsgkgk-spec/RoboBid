"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function RouteProgressBar() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // When pathname changes, briefly flash completion and hide
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] bg-primary/20 overflow-hidden pointer-events-none">
      <div className="h-full bg-primary animate-[progress_0.4s_ease-in-out_infinite] shadow-[0_0_8px_hsl(var(--primary))]" />
    </div>
  );
}
