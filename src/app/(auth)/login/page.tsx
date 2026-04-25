"use client";

import { loginAction } from "./login.action";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginAction(email, password);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/");
      }
    } catch {
      setError("Ocurrió un error inesperado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-light text-espresso">Nook</h1>
        <p className="mt-2 text-sm text-warm-gray">Ingresá a tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-warm-gray">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="vos@ejemplo.com"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-warm-gray">
            Contraseña
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-md bg-blush-light/60 px-4 py-3 text-sm text-elara-error">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>

      <p className="text-center text-xs text-warm-gray/50">
        Para testing: admin@nook.local / password
      </p>
    </div>
  );
}
