"use client";
import { useQuery } from "@tanstack/react-query";
import { api, setAuth } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Modal from "@/components/modal";
import CreatePlanForm from "./CreatePlanForm";

export default function PlansPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      router.replace("/login");
      return;
    }
    setAuth(t);
    setReady(true);
  }, [router]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => (await api.get("/plans")).data,
    enabled: ready,
  });

  const plans = data ?? [];

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Plans</h1>
        <div className="flex items-center gap-3">
          <button
            className="rounded bg-black px-3 py-2 text-white"
            onClick={() => setOpenCreate(true)}
          >
            Create Plan
          </button>
          <button
            className="text-sm underline"
            onClick={() => { clearToken(); router.push("/login"); }}
          >
            Logout
          </button>
        </div>
      </div>

      {isLoading && <p>Loading…</p>}
      {error && (
        <div className="text-red-600">
          Failed to load plans.
          <button className="ml-2 underline" onClick={() => refetch()}>Retry</button>
        </div>
      )}

      {plans.length === 0 && !isLoading ? (
        <div className="rounded border bg-white p-4">
          <p className="mb-2">No plans yet.</p>
          <button className="rounded bg-neutral-200 px-3 py-2" onClick={() => setOpenCreate(true)}>
            Create your first plan
          </button>
        </div>
      ) : null}

      <ul className="mt-4 space-y-2">
        {plans.map((p: any) => (
          <li key={p.id} className="flex items-center justify-between rounded border bg-white p-3">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-neutral-600">
                {p.goal_type} • starts {p.start_date}
              </div>
            </div>
            <Link href={`/calendar?plan=${p.id}`} className="text-blue-600 underline">Open</Link>
          </li>
        ))}
      </ul>

      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Create Plan"
      >
        <CreatePlanForm
          onCreated={() => { setOpenCreate(false); refetch(); }}
          onCancel={() => setOpenCreate(false)}
        />
      </Modal>
    </main>
  );
}
