"use client";

import { changePasswordAction } from "./change-password.action";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const result = await changePasswordAction(currentPassword, newPassword);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 1500);
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
        <h1 className="font-serif text-2xl font-light text-espresso">Cambiá tu contraseña</h1>
        <p className="mt-2 text-sm text-warm-gray">
          Necesitás actualizar tu contraseña para continuar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-warm-gray">
            Contraseña actual
          </label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="block text-sm font-medium text-warm-gray">
            Nueva contraseña
          </label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-warm-gray">
            Confirmá la nueva contraseña
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="rounded-md bg-blush-light/60 px-4 py-3 text-sm text-elara-error">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-sage-light/40 px-4 py-3 text-sm text-elara-success">
            ¡Contraseña actualizada! Redirigiendo…
          </div>
        )}

        <Button type="submit" disabled={loading || success} className="mt-2 w-full">
          {loading ? "Actualizando..." : "Actualizar contraseña"}
        </Button>
      </form>
    </div>
  );
}
