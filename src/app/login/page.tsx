"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Typography from "@/components/ui/Typography";

const ADMIN_PINS = new Set(["601", "602", "603"]);
const PACKER_PINS = new Set(
  Array.from({ length: 9 }, (_, i) => String(2001 + i))
);
const STOWER_PINS = new Set(
  Array.from({ length: 4 }, (_, i) => String(3001 + i))
);

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Sadece yetkili kullanıcılar erişebilir.");
  const [messageType, setMessageType] = useState<"" | "error" | "ok">("");
  const [loading, setLoading] = useState(false);

  const getRoleByPin = (pin: string) => {
    if (ADMIN_PINS.has(pin)) return "admin";
    if (PACKER_PINS.has(pin)) return "packer";
    if (STOWER_PINS.has(pin)) return "stower";
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const pin = password.trim();
    const role = getRoleByPin(pin);

    if (!role) {
      setMessage("Şifre yanlış.");
      setMessageType("error");
      setPassword("");
      setLoading(false);
      return;
    }

    // Session'ı localStorage'a kaydet
    localStorage.setItem(
      "session",
      JSON.stringify({ role, pin, loginTime: new Date().toISOString() })
    );

    setMessage("Giriş başarılı.");
    setMessageType("ok");

    setTimeout(() => {
      router.push("/app");
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-sm shadow-lg">
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="text-center">
            <Typography variant="title">Depo Paneli</Typography>
            <Typography variant="small" className="mt-2 text-gray-600 dark:text-gray-400">
              Giriş
            </Typography>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Şifre
            </label>
            <Input
              type="password"
              placeholder="Şifreyi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter" && !loading) {
                  const event = new Event('submit', { bubbles: true });
                  (e.currentTarget.form as HTMLFormElement)?.dispatchEvent(event);
                }
              }}
            />
          </div>

          <Button
            variant="primary"
            className="w-full py-4 text-lg font-semibold"
            onClick={() => handleLogin({} as React.FormEvent)}
            disabled={loading || !password.trim()}
          >
            {loading ? "Giriş yapılıyor..." : "GİRİŞ YAP"}
          </Button>

          {message && (
            <div
              className={`rounded-lg border px-4 py-3 text-center font-semibold text-sm ${
                messageType === "error"
                  ? "border-red-300 bg-red-50 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300"
                  : messageType === "ok"
                    ? "border-green-300 bg-green-50 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300"
                    : "border-gray-300 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
              }`}
            >
              {message}
            </div>
          )}

          <Typography variant="small" center className="text-gray-500 dark:text-gray-400 pt-2">
            Test Şifreleri:
            <br />
            Admin: 601, 602, 603
            <br />
            Packer: 2001-2009
            <br />
            Stower: 3001-3004
          </Typography>
        </form>
      </Card>
    </div>
  );
}
