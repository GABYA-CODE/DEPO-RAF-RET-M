"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";

interface PutTabProps {
  session: { role: string; pin: string };
  putProduct: (
    product: string,
    shelf: number,
    qty: number,
    pin: string
  ) => Promise<{ success: boolean; message: string }>;
}

export default function PutTab({ session, putProduct }: PutTabProps) {
  const [inProduct, setInProduct] = useState("");
  const [inShelfNum, setInShelfNum] = useState("");
  const [inQty, setInQty] = useState("1");
  const [statusMessage, setStatusMessage] = useState("");

  const handlePutProduct = async () => {
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
  };

  return (
    <Card className="shadow-lg">
      <Typography variant="title" className="mb-6">{""}</Typography>
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
          onClick={handlePutProduct}
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
  );
}
