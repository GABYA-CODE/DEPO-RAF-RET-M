import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";

interface Shelf {
  name: string;
  products: Record<string, number>;
  updated: any;
}

interface LogEntry {
  action: string;
  shelf: string;
  product: string;
  qty: number;
  detail: string;
  role: string;
  pin: string;
  ts: any;
}

interface Request {
  id: string;
  product: string;
  status: "waiting" | "fulfilled";
  createdAt: any;
  requestedBy: string;
  fulfilledAt?: any;
  fulfilledBy?: string;
  fulfilledShelf?: string;
}

export function useFirebase() {
  const [shelves, setShelves] = useState<Record<string, Shelf>>({});
  const [requests, setRequests] = useState<Request[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const padShelf = (num: number) => "R" + String(num).padStart(3, "0");

  useEffect(() => {
    try {
      // Shelves snapshot
      const shelvesCol = collection(db, "shelves");
      const unsubscribeShelves = onSnapshot(shelvesCol, (snapshot) => {
        const data: Record<string, Shelf> = {};
        snapshot.forEach((doc) => {
          data[doc.id] = doc.data() as Shelf;
        });
        console.log("📦 Shelves yüklendi:", data);
        setShelves(data);
      });

      // Requests snapshot
      const reqCol = collection(db, "requests");
      const qReq = query(reqCol, orderBy("createdAt", "desc"), limit(200));
      const unsubscribeReq = onSnapshot(qReq, (snapshot) => {
        const data: Request[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Request);
        });
        console.log("📋 Requests yüklendi:", data);
        setRequests(data);
      });

      setLoading(false);

      return () => {
        unsubscribeShelves();
        unsubscribeReq();
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("❌ Firebase bağlantı hatası:", errorMsg);
      setError(errorMsg);
      setLoading(false);
    }
  }, []);

  // PUT (Rafa ürün koy)
  const putProduct = async (
    productCode: string,
    shelfNum: number,
    qty: number,
    pin: string
  ) => {
    try {
      const shelfName = padShelf(shelfNum);
      const shelfRef = doc(db, "shelves", shelfName);

      const currentShelf = shelves[shelfName];
      if (!currentShelf) throw new Error(`Raf bulunamadı: ${shelfName}`);

      const products = { ...(currentShelf.products || {}) };
      products[productCode] = (products[productCode] || 0) + qty;

      console.log(`✅ PUT işlemi: ${productCode} x${qty} → ${shelfName}`);

      await updateDoc(shelfRef, {
        products,
        updated: serverTimestamp(),
      });

      // Log ekle
      await addDoc(collection(db, "logs"), {
        action: "PUT",
        shelf: shelfName,
        product: productCode,
        qty,
        detail: "Rafa ürün eklendi",
        pin,
        role: "stower",
        ts: serverTimestamp(),
      });

      console.log(`📝 LOG kaydedildi: PUT ${shelfName} ${productCode}`);
      return { success: true, message: "Ürün rafa kondu" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Hata";
      console.error(`❌ PUT hatası: ${msg}`);
      return {
        success: false,
        message: msg,
      };
    }
  };

  // CLEAR (Raf boşalt)
  const clearShelf = async (shelfNum: number, pin: string) => {
    try {
      const shelfName = padShelf(shelfNum);
      const shelfRef = doc(db, "shelves", shelfName);

      const currentShelf = shelves[shelfName];
      if (!currentShelf) throw new Error(`Raf bulunamadı: ${shelfName}`);

      await updateDoc(shelfRef, {
        products: {},
        updated: serverTimestamp(),
      });

      await addDoc(collection(db, "logs"), {
        action: "CLEAR_SHELF",
        shelf: shelfName,
        product: "-",
        qty: 0,
        detail: "Raf tamamen boşaltıldı",
        pin,
        role: "packer",
        ts: serverTimestamp(),
      });

      return { success: true, message: "Raf boşaltıldı" };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Hata",
      };
    }
  };

  // SEARCH (Ürün ara)
  const searchProduct = (productCode: string) => {
    const results: { shelf: string; qty: number }[] = [];
    for (const [raf, data] of Object.entries(shelves)) {
      const qty = Number((data.products && data.products[productCode]) || 0);
      if (qty > 0) results.push({ shelf: raf, qty });
    }
    return results.sort((a, b) => a.shelf.localeCompare(b.shelf));
  };

  // REQUEST (Talep oluştur)
  const createRequest = async (productCode: string, pin: string) => {
    try {
      const reqCol = collection(db, "requests");

      // Duplicate check
      const qDup = query(
        reqCol,
        where("status", "==", "waiting"),
        where("product", "==", productCode),
        limit(1)
      );
      const dupSnap = await getDocs(qDup);
      if (!dupSnap.empty) {
        return {
          success: false,
          message: "Bu ürün için zaten bekleyen talep var",
        };
      }

      await addDoc(reqCol, {
        product: productCode,
        status: "waiting",
        createdAt: serverTimestamp(),
        requestedBy: pin,
        fulfilledAt: null,
        fulfilledBy: null,
        fulfilledShelf: null,
      });

      return { success: true, message: "Talep alındı" };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Hata",
      };
    }
  };

  // SETUP (Rafları oluştur - admin only)
  const setupShelves = async (count: number, pin: string) => {
    try {
      const shelvesCol = collection(db, "shelves");
      const CHUNK_SIZE = 450;

      for (let start = 1; start <= count; start += CHUNK_SIZE) {
        const batch = writeBatch(db);
        const end = Math.min(start + CHUNK_SIZE - 1, count);

        for (let i = start; i <= end; i++) {
          const shelfName = padShelf(i);
          batch.set(doc(shelvesCol, shelfName), {
            name: shelfName,
            products: {},
            updated: serverTimestamp(),
          });
        }

        await batch.commit();
      }

      await addDoc(collection(db, "logs"), {
        action: "SETUP",
        shelf: "-",
        product: "-",
        qty: 0,
        detail: `Manuel kurulum: ${count} raf`,
        pin,
        role: "admin",
        ts: serverTimestamp(),
      });

      return { success: true, message: `${count} raf oluşturuldu` };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Hata",
      };
    }
  };

  // STATS (Özet - admin)
  const getStats = () => {
    const names = Object.keys(shelves);
    let empty = 0;
    let full = 0;
    let totalQty = 0;

    for (const name of names) {
      const products = shelves[name]?.products || {};
      const keys = Object.keys(products);
      if (keys.length === 0) empty++;
      else full++;
      for (const k of keys) totalQty += Number(products[k] || 0);
    }

    return {
      total: names.length,
      empty,
      full,
      qty: totalQty,
    };
  };

  // GET LOGS - İşlem geçmişini çek
  const getLogs = async (limitCount: number = 100): Promise<LogEntry[]> => {
    try {
      const logsCollection = collection(db, "logs");
      const logsQuery = query(
        logsCollection,
        orderBy("ts", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(logsQuery);
      const logsList: LogEntry[] = [];
      snapshot.forEach((doc) => {
        logsList.push({
          action: doc.data().action || "-",
          shelf: doc.data().shelf || "-",
          product: doc.data().product || "-",
          qty: doc.data().qty || 0,
          detail: doc.data().detail || "-",
          role: doc.data().role || "-",
          pin: doc.data().pin || "-",
          ts: doc.data().ts,
        });
      });
      console.log(`📊 ${logsList.length} log yüklendi`);
      return logsList;
    } catch (err) {
      console.log(`❌ Log çekme hatası:`, err);
      return [];
    }
  };

  return {
    shelves,
    requests,
    logs,
    loading,
    error,
    putProduct,
    clearShelf,
    searchProduct,
    createRequest,
    setupShelves,
    getStats,
    getLogs,
  };
}
