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
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
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
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Slotify
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Réservation de salle d'étude
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Link href="/cancel">
                <X className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Annuler</span>
              </Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Link href="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="py-8 sm:py-12">
        {/* Clean Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-50 border border-blue-100">
            <span className="text-sm font-medium text-blue-700">
              Réservation instantanée
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 tracking-tight">
            Réservez votre place
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl text-gray-900 font-semibold">
                Réservation confirmée
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600">
                Conservez ce code pour annuler votre réservation si nécessaire
              </DialogDescription>
            </DialogHeader>

            <Card className="p-4 bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <code className="text-2xl sm:text-3xl font-mono font-semibold text-gray-900">
                  {cancellationCode}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  className="shrink-0 hover:bg-gray-100"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">
                <strong className="font-semibold">Important :</strong>{" "}
                L&apos;annulation est possible jusqu&apos;à 24h avant le début
                du créneau.
              </p>
            </div>

            <DialogFooter>
              <Button
                onClick={() => setCancellationCode(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">
              Slotify
            </span>{" "}
            - Plateforme de réservation de salle d&apos;étude
          </p>
        </div>
      </footer>
    </div>
  );
}
