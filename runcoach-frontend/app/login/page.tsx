"use client";
import { useState } from "react";
import { login, register } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("you@example.com");
  const [password, setPassword] = useState("changeme123");
  const [mode, setMode] = useState<"login"|"register">("login");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function submit() {
    setErr(null);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password);
      router.push("/plans");
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed");
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-4">Run Coach AI</h1>
      <div className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Email"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password"
               value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded bg-black text-white"
                  onClick={()=>{ setMode("login"); submit(); }}>Login</button>
          <button className="px-3 py-2 rounded bg-neutral-200"
                  onClick={()=>{ setMode("register"); submit(); }}>Register</button>
        </div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
      </div>
    </main>
  );
}
