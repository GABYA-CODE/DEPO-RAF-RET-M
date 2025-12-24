"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";
import { Timestamp } from "firebase/firestore/lite";

interface LogEntry {
  action: string;
  detail: string;
  pin: string;
  product: string;
  qty: number;
  role: string;
  shelf: string;
  ts: Timestamp;
}

interface Shelf {
  products?: Record<string, number>;
}

interface AdminTabProps {
  shelves: Record<string, Shelf>;
  getLogs: (limit: number) => Promise<LogEntry[]>;
  getStats: () => { total: number; empty: number; full: number; qty: number };
}

export default function AdminTab({ shelves, getLogs, getStats }: AdminTabProps) {
  const [logLimit, setLogLimit] = useState("100");
  const [displayLogs, setDisplayLogs] = useState<LogEntry[]>([]);

  const handleLoadLogs = async () => {
    const lim = Math.max(10, Math.min(500, Number(logLimit || 100)));
    const logs = await getLogs(lim);
    setDisplayLogs(logs);
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <Typography variant="title" className="mb-6">
          Özet Panel
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Typography
              variant="small"
              className="text-gray-600 dark:text-gray-400 font-bold"
            >
              TOPLAM RAF
            </Typography>
            <Typography variant="title" className="mt-2">
              {stats.total}
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
              {stats.empty}
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
              {stats.full}
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
              {stats.qty}
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
            onClick={handleLoadLogs}
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
                    Log bulunamadı. LOG YÜKLE tuşuna tıklayın.
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
                        ? new Date(log.ts.toDate()).toLocaleString("tr-TR")
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
                    <td className="px-4 py-3 text-sm">{log.shelf || "-"}</td>
                    <td className="px-4 py-3 text-sm">{log.product || "-"}</td>
                    <td className="px-4 py-3 text-sm">{log.qty || 0}</td>
                    <td className="px-4 py-3 text-sm">{log.detail || "-"}</td>
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
