/**
 * CalendarLegend - Affiche la légende des statuts de disponibilité
 * Composant atomique pur (pas de state, pas de logique)
 */

import React from 'react'

export const CalendarLegend: React.FC = () => {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-xs font-medium text-emerald-700">
          Disponible
        </span>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="text-xs font-medium text-amber-700">Limité</span>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200">
        <div className="w-2 h-2 rounded-full bg-rose-400" />
        <span className="text-xs font-medium text-rose-700">Complet</span>
      </div>
    </div>
  )
}
