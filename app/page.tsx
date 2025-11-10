"use client";

import { useState } from "react";
import { ModernCalendar } from "@/components/calendar/modern";
import ReservationForm from "@/components/forms/ReservationForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Copy, X } from "lucide-react";
import { toast } from "sonner";

interface SelectedSlot {
  slotId: string;
  date: Date;
  startTime: string;
  endTime: string;
}

export default function HomePage() {
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [cancellationCode, setCancellationCode] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSlotSelect = (slots: SelectedSlot[]) => {
    setSelectedSlots(slots);
  };

  const handleReservationSuccess = (code: string) => {
    setCancellationCode(code);
    setSelectedSlots([]);
    setRefreshTrigger(prev => prev + 1); // Déclencher un refresh du calendrier
  };

  const handleCopyCode = () => {
    if (cancellationCode) {
      navigator.clipboard.writeText(cancellationCode);
      toast.success("Code copié dans le presse-papier!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Gradient Header */}
      <header className="sticky top-0 z-40 border-b border-violet-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl blur opacity-40"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Slotify
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Réservation de salle d’étude
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-violet-100"
            >
              <Link href="/cancel">
                <X className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Annuler</span>
              </Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/30"
            >
              <Link href="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="py-6 sm:py-8">
        {/* Colorful Hero */}
        <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
          <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-200">
            <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              ✨ Réservation instantanée
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Réservez votre place
          </h2>
          <p className="text-base text-slate-600">
            Sélectionnez un ou plusieurs créneaux dans le calendrier
          </p>
        </div>

        <ModernCalendar onSlotSelect={handleSlotSelect} refreshTrigger={refreshTrigger} />

        {selectedSlots.length > 0 && (
          <ReservationForm
            slots={selectedSlots}
            onSuccess={handleReservationSuccess}
            onCancel={() => setSelectedSlots([])}
          />
        )}

        <Dialog
          open={!!cancellationCode}
          onOpenChange={(open) => !open && setCancellationCode(null)}
        >
          <DialogContent className="sm:max-w-[520px] border-2 border-emerald-200">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-lg opacity-50"></div>
                  <div className="relative rounded-full bg-gradient-to-br from-emerald-100 to-green-100 p-4">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                  </div>
                </div>
              </div>
              <DialogTitle className="text-center text-2xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent font-bold">
                Réservation confirmée !
              </DialogTitle>
              <DialogDescription className="text-center text-slate-600">
                Conservez précieusement ce code pour annuler votre réservation
                si nécessaire
              </DialogDescription>
            </DialogHeader>

            <Card className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200">
              <div className="flex items-center justify-between gap-3">
                <code className="text-2xl sm:text-3xl font-mono font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {cancellationCode}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="shrink-0 border-violet-300 hover:bg-violet-100 hover:border-violet-400"
                >
                  <Copy className="h-4 w-4 text-violet-600" />
                </Button>
              </div>
            </Card>

            <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
              <p className="text-sm text-amber-900 font-medium">
                <strong className="text-orange-600">⚠️ Important:</strong>{" "}
                L&apos;annulation est possible jusqu&apos;à 24h avant le début
                du créneau.
              </p>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setCancellationCode(null)}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/30"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <footer className="border-t border-violet-200/50 bg-white/60 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-slate-600">
            <span className="font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Slotify
            </span>{" "}
            - Plateforme de réservation de salle d&apos;étude
          </p>
        </div>
      </footer>
    </div>
  );
}
