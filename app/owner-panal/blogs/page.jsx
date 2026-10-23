"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminBlogsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/owner-panal?tab=blogs");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
