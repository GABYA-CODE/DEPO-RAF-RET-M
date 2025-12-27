"use client";

import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";

interface Shelf {
  products?: Record<string, number>;
}

interface RackTabProps {
  shelves: Record<string, Shelf>;
}

export default function RackTab({ shelves }: RackTabProps) {
  return (
    <Card className="shadow-lg">
      <Typography variant="title" className="mb-6">
        
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
  );
}
