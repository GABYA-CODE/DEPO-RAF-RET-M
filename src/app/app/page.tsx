"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import { useFirebase } from "@/hooks/useFirebase";

interface Session {
  role: "admin" | "packer" | "stower";
  pin: string;
  loginTime: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"put" | "clear" | "search" | "rack" | "request" | "admin">("put");
  
  const { shelves, requests, putProduct, clearShelf, searchProduct, createRequest, setupShelves, getStats } = useFirebase();
  
  // Form states
  const [inProduct, setInProduct] = useState("");
  const [inShelfNum, setInShelfNum] = useState("");
  const [inQty, setInQty] = useState("1");
  const [statusMessage, setStatusMessage] = useState("");
  const [outShelfNum, setOutShelfNum] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchResults, setSearchResults] = useState<{ shelf: string; qty: number }[]>([]);
  const [reqProduct, setReqProduct] = useState("");
  const [setupCount, setSetupCount] = useState("300");

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
    if (session.role === "packer") return ["clear", "search", "rack", "request"];
    if (session.role === "admin") return ["put", "clear", "search", "rack", "request", "admin"];
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
                Rol: <span className="font-bold uppercase">{session.role}</span> | PIN: {session.pin}
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
                onClick={() => setActiveTab(tab as "put" | "clear" | "search" | "rack" | "request" | "admin")}
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
            <Card className="shadow-lg">
              <Typography variant="title" className="mb-6">
                Rafa Ürün Koy
              </Typography>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                    Ürün Kodu
                  </label>
                  <input
                    type="text"
                    value={inProduct}
                    onChange={(e) => setInProduct(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                    placeholder="Ürün kodunu girin"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                    Raf Numarası
                  </label>
                  <input
                    type="number"
                    value={inShelfNum}
                    onChange={(e) => setInShelfNum(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                    placeholder="Raf numarasını girin"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                    Adet
                  </label>
                  <input
                    type="number"
                    value={inQty}
                    onChange={(e) => setInQty(e.target.value)}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!inProduct || !inShelfNum || !inQty) {
                      setStatusMessage("Tüm alanları doldurun");
                      return;
                    }
                    setStatusMessage("İşlem yapılıyor...");
                    const result = await putProduct(
                      inProduct,
                      Number(inShelfNum),
                      Number(inQty),
                      session?.pin || ""
                    );
                    setStatusMessage(result.message);
                    if (result.success) {
                      setInProduct("");
                      setInShelfNum("");
                      setInQty("1");
                    }
                  }}
                  className="w-full py-4 px-6 text-lg font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  ÜRÜNÜ RAFA KOY
                </button>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Typography variant="small">{statusMessage || "İşlem bekleniyor..."}</Typography>
                </div>
              </div>
            </Card>
          )}

          {/* CLEAR TAB */}
          {canViewTab("clear") && activeTab === "clear" && (
            <Card className="shadow-lg">
              <Typography variant="title" className="mb-6">
                Raf Boşalt
              </Typography>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                    Raf Numarası
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                    placeholder="Raf numarasını girin"
                  />
                </div>
                <Button variant="primary" className="w-full py-4 text-lg font-bold bg-red-600 hover:bg-red-700">
                  RAFI BOŞALT
                </Button>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Typography variant="small">İşlem bekleniyor...</Typography>
                </div>
              </div>
            </Card>
          )}

          {/* SEARCH TAB */}
          {canViewTab("search") && activeTab === "search" && (
            <Card className="shadow-lg">
              <Typography variant="title" className="mb-6">
                Ürün Ara
              </Typography>
              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                  placeholder="Ürün kodunu girin"
                />
                <Button variant="primary">ARA</Button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <Typography variant="small">Arama sonuçları burada gösterilecek</Typography>
              </div>
            </Card>
          )}

          {/* RACK TAB */}
          {canViewTab("rack") && activeTab === "rack" && (
            <Card className="shadow-lg">
              <Typography variant="title" className="mb-6">
                Raf Durumu
              </Typography>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Raf</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Durum</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Ürünler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        Raf verileri yükleniyor...
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* REQUEST TAB */}
          {canViewTab("request") && activeTab === "request" && (
            <div className="space-y-6">
              <Card className="shadow-lg">
                <Typography variant="title" className="mb-6">
                  Ürün Talebi
                </Typography>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                      Ürün Kodu
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                      placeholder="Ürün kodunu girin"
                    />
                  </div>
                  <Button variant="primary" className="w-full py-4 text-lg font-bold">
                    GELDİĞİNDE HABER VER
                  </Button>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <Typography variant="small">Hazır.</Typography>
                  </div>
                </div>
              </Card>

              <Card className="shadow-lg">
                <Typography variant="title" className="mb-6">
                  Bekleyen Talepler
                </Typography>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Tarih</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Ürün</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Durum</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Talep Eden</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          Talep yükleniyor...
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ADMIN TAB */}
          {canViewTab("admin") && activeTab === "admin" && (
            <div className="space-y-6">
              <Card className="shadow-lg">
                <Typography variant="title" className="mb-6">
                  Özet Panel
                </Typography>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Typography variant="small" className="text-gray-600 dark:text-gray-400 font-bold">
                      TOPLAM RAF
                    </Typography>
                    <Typography variant="title" className="mt-2">
                      -
                    </Typography>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Typography variant="small" className="text-gray-600 dark:text-gray-400 font-bold">
                      BOŞ RAF
                    </Typography>
                    <Typography variant="title" className="mt-2">
                      -
                    </Typography>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Typography variant="small" className="text-gray-600 dark:text-gray-400 font-bold">
                      DOLU RAF
                    </Typography>
                    <Typography variant="title" className="mt-2">
                      -
                    </Typography>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Typography variant="small" className="text-gray-600 dark:text-gray-400 font-bold">
                      TOPLAM ADET
                    </Typography>
                    <Typography variant="title" className="mt-2">
                      -
                    </Typography>
                  </div>
                </div>
              </Card>

              <Card className="shadow-lg">
                <Typography variant="title" className="mb-6">
                  İşlem Geçmişi (LOG)
                </Typography>
                <div className="flex gap-4 mb-6">
                  <input
                    type="number"
                    defaultValue="100"
                    min="10"
                    max="500"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                  />
                  <Button variant="primary">LOG YÜKLE</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Tarih</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Kullanıcı</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">İşlem</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Raf</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Ürün</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">Adet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          Log yükleniyor...
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
