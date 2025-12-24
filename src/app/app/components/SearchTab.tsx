"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";

interface SearchTabProps {
  searchProduct: (code: string) => Promise<{ shelf: string; qty: number }[]>;
}

export default function SearchTab({ searchProduct }: SearchTabProps) {
  const [searchCode, setSearchCode] = useState("");
  const [searchResults, setSearchResults] = useState<
    { shelf: string; qty: number }[]
  >([]);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      setStatusMessage("Ürün kodu boş olamaz.");
      return;
    }
    setStatusMessage("Aranıyor...");
    const results = await searchProduct(searchCode);
    setSearchResults(results);
    setStatusMessage(
      results.length > 0 ? "✅ Ürün bulundu!" : "❌ Ürün bulunamadı."
    );
  };

  return (
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
          onClick={handleSearch}
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
  );
}
