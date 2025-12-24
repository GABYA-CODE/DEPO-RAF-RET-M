"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Session {
  role: "admin" | "packer" | "stower";
  pin: string;
  loginTime: string;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (!sessionData) {
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(sessionData);
      setSession(parsed);
    } catch (error) {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
