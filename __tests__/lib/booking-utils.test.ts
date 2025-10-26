import { describe, it, expect, beforeEach, vi } from 'vitest'
import { canCancel, generateCancellationCode } from '@/lib/booking-utils'

describe('booking-utils', () => {
  describe('canCancel', () => {
    it('should allow cancellation more than 24h before reservation', () => {
      const futureDate = new Date()
      futureDate.setHours(futureDate.getHours() + 48) // 48h dans le futur

      expect(canCancel(futureDate)).toBe(true)
    })

    it('should prevent cancellation less than 24h before reservation', () => {
      const nearFutureDate = new Date()
      nearFutureDate.setHours(nearFutureDate.getHours() + 12) // 12h dans le futur

      expect(canCancel(nearFutureDate)).toBe(false)
    })

    it('should prevent cancellation for past reservations', () => {
      const pastDate = new Date()
      pastDate.setHours(pastDate.getHours() - 2) // 2h dans le passé

      expect(canCancel(pastDate)).toBe(false)
    })

    it('should allow cancellation exactly 25h before reservation', () => {
      const date = new Date()
      date.setHours(date.getHours() + 25)

      expect(canCancel(date)).toBe(true)
    })

    it('should prevent cancellation exactly 23h before reservation', () => {
      const date = new Date()
      date.setHours(date.getHours() + 23)

      expect(canCancel(date)).toBe(false)
    })
  })

  describe('generateCancellationCode', () => {
    it('should generate a code of 8 characters', () => {
      const code = generateCancellationCode()

      expect(code).toHaveLength(8)
    })

    it('should generate different codes on multiple calls', () => {
      const code1 = generateCancellationCode()
      const code2 = generateCancellationCode()
      const code3 = generateCancellationCode()

      expect(code1).not.toBe(code2)
      expect(code2).not.toBe(code3)
      expect(code1).not.toBe(code3)
    })

    it('should generate codes with only alphanumeric characters', () => {
      const code = generateCancellationCode()
      const alphanumericRegex = /^[A-Z0-9]+$/

      expect(code).toMatch(alphanumericRegex)
    })

    it('should generate uppercase codes', () => {
      const code = generateCancellationCode()

      expect(code).toBe(code.toUpperCase())
    })
  })
})
