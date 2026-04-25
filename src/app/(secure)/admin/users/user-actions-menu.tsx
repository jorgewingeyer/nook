"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toggleUserActiveAction, resetUserPasswordAction } from "./users.action";

interface UserActionsMenuProps {
  userId: number;
  isActive: boolean;
}

export function UserActionsMenu({ userId, isActive }: UserActionsMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  const [password, setPassword] = useState("");

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleUserActiveAction(userId);
      if (result.error) toast.error(result.error);
      else {
        toast.success(isActive ? "Usuario desactivado" : "Usuario activado");
        router.refresh();
      }
    });
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await resetUserPasswordAction(userId, password);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Contraseña restablecida. El usuario deberá cambiarla al ingresar.");
      setPassword("");
      setResetOpen(false);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setResetOpen(true)}>
            Restablecer contraseña
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={isActive ? "text-destructive" : ""}
            onClick={handleToggle}
          >
            {isActive ? "Desactivar usuario" : "Activar usuario"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restablecer contraseña</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              El usuario deberá cambiar esta contraseña al iniciar sesión.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="new-pw">Nueva contraseña temporal</Label>
              <Input
                id="new-pw"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || password.length < 8}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Restablecer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
