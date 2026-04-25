"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrderLookupForm({
  defaultNumber,
  defaultEmail,
}: {
  defaultNumber?: string;
  defaultEmail?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [numero, setNumero] = useState(defaultNumber ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!numero.trim() || !email.trim()) return;
    startTransition(() => {
      const params = new URLSearchParams({ numero: numero.trim(), email: email.trim() });
      router.push(`/pedido?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="numero">Número de pedido</Label>
        <Input
          id="numero"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          placeholder="NOOK-2026-XXXXX"
          autoComplete="off"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email de la compra</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending || !numero || !email}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
        Buscar pedido
      </Button>
    </form>
  );
}
