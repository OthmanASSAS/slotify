/**
 * Rate Limiting simple en mémoire
 * Pour la production, utiliser Redis ou un service externe
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Map pour stocker les tentatives par IP
const attempts = new Map<string, RateLimitEntry>()

// Nettoyer les anciennes entrées toutes les heures
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of attempts.entries()) {
    if (now > entry.resetTime) {
      attempts.delete(ip)
    }
  }
}, 60 * 60 * 1000) // 1 heure

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Vérifie si une IP peut faire une requête
 * @param ip - Adresse IP
 * @param limit - Nombre maximum de requêtes (défaut: 5)
 * @param windowMs - Fenêtre de temps en ms (défaut: 15 minutes)
 */
export function checkRateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): RateLimitResult {
  const now = Date.now()
  const entry = attempts.get(ip)

  // Si pas d'entrée ou fenêtre expirée, créer nouvelle entrée
  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs
    attempts.set(ip, { count: 1, resetTime })
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTime,
    }
  }

  // Incrémenter le compteur
  entry.count++

  // Vérifier si limite atteinte
  if (entry.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  }
}

/**
 * Réinitialise le compteur pour une IP (utile pour les tests)
 */
export function resetRateLimit(ip: string): void {
  attempts.delete(ip)
}
