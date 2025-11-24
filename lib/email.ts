'use server'

import { Resend } from 'resend'

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null

function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not defined')
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

// Email sender configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Slotify <onboarding@resend.dev>'

/**
 * Envoie un email de confirmation de réservation
 */
export async function sendReservationEmail(
  email: string,
  date: Date,
  startTime: string,
  endTime: string,
  cancellationCode: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY manquante. Email non envoyé.')
    return { success: false, error: 'Configuration email manquante' }
  }

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)

  try {
    const data = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Confirmation de votre réservation Slotify',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Réservation confirmée ! ✅</h1>
          <p>Bonjour,</p>
          <p>Votre réservation de salle d'étude a bien été enregistrée.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📅 Date :</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>⏰ Heure :</strong> ${startTime} - ${endTime}</p>
            <p style="margin: 5px 0;"><strong>🔑 Code d'annulation :</strong> <code style="background: #fff; padding: 2px 5px; border-radius: 4px; font-size: 1.2em;">${cancellationCode}</code></p>
          </div>

          <p>Si vous ne pouvez plus venir, merci d'annuler votre réservation pour libérer la place pour d'autres étudiants.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cancel" style="display: inline-block; background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Annuler ma réservation
          </a>
        </div>
      `,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return { success: false, error }
  }
}

/**
 * Envoie un email récapitulatif pour plusieurs réservations
 */
export async function sendBulkReservationEmail(
  email: string,
  reservations: {
    date: Date
    startTime: string
    endTime: string
    cancellationCode: string
  }[]
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY manquante. Email non envoyé.')
    return { success: false, error: 'Configuration email manquante' }
  }

  const reservationsHtml = reservations
    .map(res => {
      const formattedDate = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date(res.date))

      return `
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
          <p style="margin: 5px 0;"><strong>📅 ${formattedDate}</strong></p>
          <p style="margin: 5px 0;">⏰ ${res.startTime} - ${res.endTime}</p>
          <p style="margin: 5px 0;">🔑 Code : <code style="background: #fff; padding: 2px 5px; border-radius: 4px;">${res.cancellationCode}</code></p>
        </div>
      `
    })
    .join('')

  try {
    const data = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Confirmation de vos ${reservations.length} réservations Slotify`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Réservations confirmées ! ✅</h1>
          <p>Bonjour,</p>
          <p>Vos ${reservations.length} réservations de salle d'étude ont bien été enregistrées.</p>
          
          <div style="margin: 20px 0;">
            ${reservationsHtml}
          </div>

          <p><strong>Note importante :</strong> Pour annuler, vous devez utiliser le code correspondant à chaque créneau individuellement.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cancel" style="display: inline-block; background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Annuler une réservation
          </a>
        </div>
      `,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Erreur envoi email groupé:', error)
    return { success: false, error }
  }
}

/**
 * Envoie un email avec un lien magique de connexion
 */
export async function sendMagicLinkEmail(email: string, token: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY manquante. Email non envoyé.')
    return { success: false, error: 'Configuration email manquante' }
  }

  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-reservations/dashboard?token=${token}`

  try {
    const data = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Accédez à vos réservations Slotify',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Slotify</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Système de réservation</p>
          </div>

          <h2 style="color: #1f2937; font-size: 20px; margin: 20px 0;">Accédez à vos réservations</h2>
          <p style="color: #374151; line-height: 1.6; margin: 15px 0;">Bonjour,</p>
          <p style="color: #374151; line-height: 1.6; margin: 15px 0;">
            Vous avez demandé à consulter vos réservations de salle d'étude.
            Pour y accéder, veuillez cliquer sur le lien ci-dessous :
          </p>

          <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-left: 4px solid #2563eb; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; color: #374151; font-weight: 600;">🔗 Votre lien d'accès personnel :</p>
            <a href="${magicLink}" style="color: #2563eb; word-break: break-all; text-decoration: underline; font-size: 14px;">${magicLink}</a>
          </div>

          <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-radius: 4px; border: 1px solid #fbbf24;">
            <p style="margin: 0; color: #92400e; font-size: 13px;">
              ⏱️ <strong>Important :</strong> Ce lien expire dans 1 heure pour votre sécurité.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Si vous n'avez pas demandé cet email, vous pouvez l'ignorer en toute sécurité.<br/>
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Erreur envoi magic link:', error)
    return { success: false, error }
  }
}
