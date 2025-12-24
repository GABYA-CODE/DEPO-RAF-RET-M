"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import { useFirebase } from "@/hooks/useFirebase";
import PutTab from "./components/PutTab";
import ClearTab from "./components/ClearTab";
import SearchTab from "./components/SearchTab";
import RackTab from "./components/RackTab";
import RequestTab from "./components/RequestTab";
import AdminTab from "./components/AdminTab";

interface Session {
  role: "admin" | "packer" | "stower";
  pin: string;
  loginTime: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "put" | "clear" | "search" | "rack" | "request" | "admin"
  >("put");

  const {
    shelves,
    requests,
    putProduct,
    searchProduct,
    createRequest,
    getStats,
    getLogs,
    clearShelf,
  } = useFirebase();

  useEffect(() => {
    const sessionData = localStorage.getItem("session");
    if (!sessionData) {
      router.push("/");
      return;
    }
    try {
      const parsed = JSON.parse(sessionData) as Session;
      setSession(parsed);
      setLoading(false);
    } catch {
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("session");
    router.push("/");
  };

  if (loading || !session) return null;

  const getTabs = () => {
    if (session.role === "stower") return ["put"];
    if (session.role === "packer")
      return ["clear", "search", "rack", "request"];
    if (session.role === "admin")
      return ["put", "clear", "search", "rack", "request", "admin"];
    return [];
  };

  const tabLabels: Record<string, string> = {
    put: "RAFA ÜRÜN KOY",
    clear: "RAF BOŞALT",
    search: "ÜRÜN ARA",
    rack: "RAF DURUMU",
    request: "TALEP",
    admin: "YÖNETİCİ",
  };

  const tabs = getTabs();
  const canViewTab = (tab: string) => tabs.includes(tab);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="title">Depo İşlem Paneli</Typography>
              <Typography variant="small" className="mt-2">
                Rol: <span className="font-bold uppercase">{session.role}</span>{" "}
                | PIN: {session.pin}
              </Typography>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              ÇIKIŞ
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() =>
                  setActiveTab(
                    tab as
                      | "put"
                      | "clear"
                      | "search"
                      | "rack"
                      | "request"
                      | "admin"
                  )
                }
                className={`px-6 py-4 font-bold text-sm tracking-wider border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-100 dark:bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4">
          {/* PUT TAB */}
          {canViewTab("put") && activeTab === "put" && (
            <PutTab session={session} putProduct={putProduct} />
          )}

          {/* CLEAR TAB */}
          {canViewTab("clear") && activeTab === "clear" && (
            <ClearTab session={session} clearShelf={clearShelf} />
          )}

          {/* SEARCH TAB */}
          {canViewTab("search") && activeTab === "search" && (
            <SearchTab searchProduct={searchProduct} />
          )}

          {/* RACK TAB */}
          {canViewTab("rack") && activeTab === "rack" && (
            <RackTab shelves={shelves} />
          )}

          {/* REQUEST TAB */}
          {canViewTab("request") && activeTab === "request" && (
            <RequestTab
              session={session}
              requests={requests}
              createRequest={createRequest}
            />
          )}

          {/* ADMIN TAB */}
          {canViewTab("admin") && activeTab === "admin" && (
            <AdminTab shelves={shelves} getLogs={getLogs} getStats={getStats} />
          )}
        </div>
      </div>
    </div>
  );
}
