"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Typography from "@/components/ui/Typography";

interface ClearTabProps {
  session: { role: string; pin: string };
  clearShelf: (
    shelf: number,
    pin: string
  ) => Promise<{ success: boolean; message: string }>;
}

export default function ClearTab({ session, clearShelf }: ClearTabProps) {
  const [inShelfNum, setInShelfNum] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleClearShelf = async () => {
    if (!inShelfNum) {
      setStatusMessage("Raf numarası boş olamaz.");
      return;
    }
    setStatusMessage("Raf boşaltılıyor...");
    const result = await clearShelf(Number(inShelfNum), session?.pin || "");
    setStatusMessage(result.message);
    if (result.success) {
      setInShelfNum("");
    }
  };

  return (
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
          onClick={handleClearShelf}
          className="w-full py-4 text-lg font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
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
  );
}
