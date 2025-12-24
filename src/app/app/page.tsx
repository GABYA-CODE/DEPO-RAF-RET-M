"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";
import { useFirebase } from "@/hooks/useFirebase";
import { Timestamp } from "firebase/firestore/lite";

interface Session {
  role: "admin" | "packer" | "stower";
  pin: string;
  loginTime: string;
}

// Define LogEntry interface
interface LogEntry {
  action: string;
  detail: string;
  pin: string;
  product: string;
  qty: number;
  role: string;
  shelf: string;
  ts: Timestamp; // Timestamp type
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

  // Form states
  const [inProduct, setInProduct] = useState("");
  const [inShelfNum, setInShelfNum] = useState("");
  const [inQty, setInQty] = useState("1");
  const [statusMessage, setStatusMessage] = useState("");

  const [searchCode, setSearchCode] = useState("");
  const [searchResults, setSearchResults] = useState<
    { shelf: string; qty: number }[]
  >([]);
  const [reqProduct, setReqProduct] = useState("");

  const [logLimit, setLogLimit] = useState("100");
  const [displayLogs, setDisplayLogs] = useState<LogEntry[]>([]);

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
                  <Typography variant="small">
                    {statusMessage || "İşlem bekleniyor..."}
                  </Typography>
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
                    value={inShelfNum}
                    onChange={(e) => setInShelfNum(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                    placeholder="Raf numarasını girin"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!inShelfNum) {
                      setStatusMessage("Raf numarası boş olamaz.");
                      return;
                    }
                    setStatusMessage("Raf boşaltılıyor...");
                    const result = await clearShelf(
                      Number(inShelfNum),
                      session?.pin || ""
                    );
                    setStatusMessage(result.message);
                    if (result.success) {
                      setInShelfNum("");
                    }
                  }}
                  className="w-full py-4 text-lg font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg"
                >
                  RAFI BOŞALT
                </button>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Typography variant="small">
                    {statusMessage || "İşlem bekleniyor..."}
                  </Typography>
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
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                    Ürün Kodu
                  </label>
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                    placeholder="Ürün kodunu girin"
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!searchCode.trim()) {
                      setStatusMessage("Ürün kodu boş olamaz.");
                      return;
                    }
                    setStatusMessage("Aranıyor...");
                    const results = await searchProduct(searchCode);
                    setSearchResults(results);
                    setStatusMessage(
                      results.length > 0
                        ? "✅ Ürün bulundu!"
                        : "❌ Ürün bulunamadı."
                    );
                  }}
                  className="w-full mb-4 py-4 px-4 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold text-lg transition-colors"
                >
                  ARA
                </button>
                {statusMessage && (
                  <div
                    className={`p-4 rounded-lg text-sm font-bold ${
                      statusMessage.startsWith("✅")
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : statusMessage.startsWith("❌")
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}
                  >
                    {statusMessage}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                {searchResults.length === 0 ? (
                  <Typography
                    variant="small"
                    className="text-gray-500 dark:text-gray-400"
                  >
                    Arama sonuçları burada gösterilecek
                  </Typography>
                ) : (
                  <ul className="space-y-2">
                    {searchResults.map((result, idx) => (
                      <li
                        key={idx}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        Raf: {result.shelf}, Adet: {result.qty}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          )}

          {/* RACK TAB */}
          {canViewTab("rack") && activeTab === "rack" && (
            <Card className="shadow-lg">
              <Typography variant="title" className="mb-6">
                Raf Durumu
              </Typography>
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Typography
                  variant="small"
                  className="text-blue-900 dark:text-blue-100 font-bold"
                >
                  Toplam raf: {Object.keys(shelves).length} | Dolu:{" "}
                  {
                    Object.values(shelves).filter(
                      (s) => Object.keys(s.products || {}).length > 0
                    ).length
                  }{" "}
                  | Boş:{" "}
                  {
                    Object.values(shelves).filter(
                      (s) => Object.keys(s.products || {}).length === 0
                    ).length
                  }
                </Typography>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                        Raf
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                        Durum
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                        Ürünler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.keys(shelves).length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          Raf verileri yükleniyor...
                        </td>
                      </tr>
                    ) : (
                      Object.entries(shelves).map(([shelfName, shelf]) => {
                        const products = shelf.products || {};
                        const isEmpty = Object.keys(products).length === 0;
                        const productStr = isEmpty
                          ? "-"
                          : Object.entries(products)
                              .map(([code, qty]) => `${code} x${qty}`)
                              .join(", ");

                        return (
                          <tr
                            key={shelfName}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                              {shelfName}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  isEmpty
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                }`}
                              >
                                {isEmpty ? "BOŞ" : "DOLU"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {productStr}
                            </td>
                          </tr>
                        );
                      })
                    )}
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
                      value={reqProduct}
                      onChange={(e) => setReqProduct(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                      placeholder="Ürün kodunu girin"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!reqProduct.trim()) {
                        setStatusMessage("Ürün kodu boş olamaz.");
                        return;
                      }
                      const result = await createRequest(
                        reqProduct,
                        session?.pin || ""
                      );
                      setStatusMessage(
                        result.success
                          ? "✅ Talep oluşturuldu!"
                          : `❌ ${result.message}`
                      );
                      if (result.success) setReqProduct("");
                    }}
                    className="w-full py-4 px-4 bg-green-600 text-black hover:bg-green-700 rounded-lg font-bold text-lg transition-colors"
                  >
                    GELDİĞİNDE HABER VER
                  </button>
                  {statusMessage && (
                    <div
                      className={`p-4 rounded-lg text-sm font-bold ${
                        statusMessage.startsWith("✅")
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : statusMessage.includes("boş") ||
                            statusMessage.startsWith("❌")
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      }`}
                    >
                      {statusMessage}
                    </div>
                  )}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Typography
                      variant="small"
                      className="text-blue-900 dark:text-blue-100"
                    >
                      <strong>Not:</strong> Ürün rafa konulunca tüm paketçilere
                      sesli bildirim gelir.
                    </Typography>
                  </div>
                </div>
              </Card>

              <Card className="shadow-lg">
                <Typography variant="title" className="mb-6">
                  Bekleyen Talepler
                </Typography>
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <Typography
                    variant="small"
                    className="text-green-900 dark:text-green-100 font-bold"
                  >
                    Gösteriliyor: {requests.length}
                  </Typography>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                          Tarih
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                          Ürün
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                          Durum
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                          Talep Eden
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {requests.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            Talep yükleniyor...
                          </td>
                        </tr>
                      ) : (
                        requests.map((req) => (
                          <tr
                            key={req.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-3">
                              {req.createdAt?.toDate
                                ? new Date(
                                    req.createdAt.toDate()
                                  ).toLocaleString("tr-TR")
                                : "-"}
                            </td>
                            <td className="px-4 py-3 font-bold">
                              {req.product}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  req.status === "fulfilled"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                }`}
                              >
                                {req.status === "fulfilled"
                                  ? "KARŞILANDI"
                                  : "BEKLİYOR"}
                              </span>
                            </td>
                            <td className="px-4 py-3">{req.requestedBy}</td>
                          </tr>
                        ))
                      )}
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
                    <Typography
                      variant="small"
                      className="text-gray-600 dark:text-gray-400 font-bold"
                    >
                      TOPLAM RAF
                    </Typography>
                    <Typography variant="title" className="mt-2">
                      {getStats().total}
                    </Typography>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Typography
                      variant="small"
                      className="text-gray-600 dark:text-gray-400 font-bold"
                    >
                      BOŞ RAF
                    </Typography>
                    <Typography variant="title" className="mt-2">
                      {getStats().empty}
                    </Typography>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Typography
                      variant="small"
                      className="text-gray-600 dark:text-gray-400 font-bold"
                    >
                      DOLU RAF
                    </Typography>
                    <Typography variant="title" className="mt-2">
                      {getStats().full}
                    </Typography>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Typography
                      variant="small"
                      className="text-gray-600 dark:text-gray-400 font-bold"
                    >
                      TOPLAM ADET
                    </Typography>
                    <Typography variant="title" className="mt-2">
                      {getStats().qty}
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
                    value={logLimit}
                    onChange={(e) => setLogLimit(e.target.value)}
                    min="10"
                    max="500"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    onClick={async () => {
                      const lim = Math.max(
                        10,
                        Math.min(500, Number(logLimit || 100))
                      );
                      const logs = await getLogs(lim);
                      setDisplayLogs(logs);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold transition-colors"
                  >
                    LOG YÜKLE
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                          Tarih
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                          Kullanıcı (PIN)
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                          Role
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                          İşlem
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                          Raf
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                          Ürün
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                          Adet
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300 uppercase text-xs">
                          Detay
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {displayLogs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            Log bulunamadı. 0
                            LOG YÜKLE tuşuna tıklayın.
                          </td>
                        </tr>
                      ) : (
                        displayLogs.map((log, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-3 text-sm">
                              {log.ts?.toDate
                                ? new Date(log.ts.toDate()).toLocaleString(
                                    "tr-TR"
                                  )
                                : "-"}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono">
                              {log.pin || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-bold">
                                {log.role || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-bold">
                              {log.action || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {log.shelf || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {log.product || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {log.qty || 0}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {log.detail || "-"}
                            </td>
                          </tr>
                        ))
                      )}
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
