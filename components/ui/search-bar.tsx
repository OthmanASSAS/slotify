'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * Composant de barre de recherche réutilisable
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('')
 * <SearchBar
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Rechercher par email ou code..."
 * />
 * ```
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher...",
  className = ""
}: SearchBarProps) {
  const handleClear = () => {
    onChange('')
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Effacer la recherche"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
