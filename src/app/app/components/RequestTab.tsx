"use client";

import { useState, useRef, useEffect } from "react";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { Timestamp } from "firebase/firestore/lite";

interface Request {
  id: string;
  product: string;
  status: "waiting" | "fulfilled";
  requestedBy: string;
  createdAt: Timestamp;
}

interface RequestTabProps {
  session: { role: string; pin: string };
  requests: Request[];
  createRequest: (
    product: string,
    pin: string
  ) => Promise<{ success: boolean; message: string }>;
}

export default function RequestTab({
  session,
  requests,
  createRequest,
}: RequestTabProps) {
  const [reqProduct, setReqProduct] = useState("");
  const reqRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    // Auto-focus for keyboard entry convenience
    reqRef.current?.focus();
  }, []);

  const handleCreateRequest = async () => {
    if (!reqProduct.trim()) {
      setStatusMessage("Ürün kodu boş olamaz.");
      return;
    }
    const result = await createRequest(reqProduct, session?.pin || "");
    setStatusMessage(
      result.success ? "✅ Talep oluşturuldu!" : `❌ ${result.message}`
    );
    if (result.success) setReqProduct("");
  };

  return (
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
              ref={reqRef}
              type="text"
              value={reqProduct}
              onChange={(e) => setReqProduct(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              placeholder="Ürün kodunu girin"
            />
          </div>
          <button
            onClick={handleCreateRequest}
            className="w-full py-4 px-4 bg-green-600 text-white hover:bg-green-700 rounded-lg font-bold text-lg transition-colors"
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
              <strong>Not:</strong> Ürün rafa konulunca tüm paketçilere sesli
              bildirim gelir.
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
                        ? new Date(req.createdAt.toDate()).toLocaleString(
                            "tr-TR"
                          )
                        : "-"}
                    </td>
                    <td className="px-4 py-3 font-bold">{req.product}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          req.status === "fulfilled"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {req.status === "fulfilled" ? "KARŞILANDI" : "BEKLİYOR"}
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
  );
}
