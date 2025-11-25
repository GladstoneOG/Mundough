"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminStore } from "@/stores/admin/admin-store";

const TAP_THRESHOLD = 5;
const RESET_TIMEOUT = 2500;

export function Header() {
  const isUnlocked = useAdminStore((state) => state.isUnlocked);
  const lock = useAdminStore((state) => state.lock);
  const unlock = useAdminStore((state) => state.unlock);

  const [tapCount, setTapCount] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (tapCount === 0) return;
    const timer = window.setTimeout(() => setTapCount(0), RESET_TIMEOUT);
    return () => window.clearTimeout(timer);
  }, [tapCount]);

  const triggerAdmin = useCallback(() => {
    setTapCount((count) => {
      const next = count + 1;
      if (next >= TAP_THRESHOLD) {
        setShowDialog(true);
        return 0;
      }
      return next;
    });
  }, []);

  const closeDialog = () => {
    setShowDialog(false);
    setPin("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await unlock(pin.trim());
    if (success) {
      toast.success("Admin unlocked");
      closeDialog();
    } else {
      toast.error("That PIN didn't match");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-cocoa/10 bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={triggerAdmin}
          className="rounded-full bg-cream px-3 py-1 text-left transition hover:bg-white/80"
        >
          <span className="block text-xs uppercase tracking-[0.35em] text-caramel/80">
            Crafted in-house
          </span>
          <span className="block font-serif text-2xl font-semibold text-cocoa">
            Mundough
          </span>
        </button>

        <nav className="flex items-center gap-4 text-sm font-semibold text-cocoa">
          <Link
            href="/"
            className="rounded-full px-3 py-2 transition hover:bg-caramel/10"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="rounded-full px-3 py-2 transition hover:bg-caramel/10"
          >
            Shop
          </Link>
          {isUnlocked ? (
            <Link
              href="/admin"
              className="rounded-full px-3 py-2 transition hover:bg-caramel/10"
            >
              Admin
            </Link>
          ) : null}
          {isUnlocked ? (
            <Button variant="ghost" onClick={lock} className="px-3 py-2">
              Lock Admin
            </Button>
          ) : null}
        </nav>
      </div>

      <Dialog
        open={showDialog}
        onClose={closeDialog}
        title={isUnlocked ? "Admin panel already unlocked" : "Mundough admin access"}
        footer={
          isUnlocked ? (
            <Button onClick={closeDialog}>Close</Button>
          ) : (
            <Button type="submit" form="admin-login-form">
              Enter kitchen
            </Button>
          )
        }
      >
        {isUnlocked ? (
            <p className="text-sm text-cocoa/60">
              {"You're already in. Head to the admin page or lock the gate when you're done."}
            </p>
        ) : (
          <form id="admin-login-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="pin">Bakery PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="••••"
                required
              />
            </div>
            <p className="text-xs text-cocoa/60">
              Tap the Mundough wordmark {TAP_THRESHOLD} times whenever you need to reopen this prompt.
            </p>
          </form>
        )}
      </Dialog>
    </header>
  );
}
