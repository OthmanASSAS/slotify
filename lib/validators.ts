import { z } from 'zod'

// Validation schemas for forms and API routes

export const emailSchema = z.string().email('Email invalide')

export const reservationSchema = z.object({
  email: emailSchema,
  timeSlotId: z.string().cuid(),
  reservationDate: z.string().datetime(),
})

export const cancellationSchema = z.object({
  cancellationCode: z.string().min(8),
})

export const timeSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm requis'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm requis'),
  maxCapacity: z.number().min(1).max(25).default(25),
  isActive: z.boolean().default(true),
})

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Mot de passe trop court'),
})

export const allowedEmailSchema = z.object({
  email: emailSchema,
})
