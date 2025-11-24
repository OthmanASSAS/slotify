
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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
    const data = await resend.emails.send({
      from: 'Slotify <onboarding@resend.dev>', // Domaine de test par défaut Resend
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
    const data = await resend.emails.send({
      from: 'Slotify <onboarding@resend.dev>',
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
    const data = await resend.emails.send({
      from: 'Slotify <onboarding@resend.dev>',
      to: email,
      subject: 'Accédez à vos réservations Slotify',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Vos réservations 📅</h1>
          <p>Bonjour,</p>
          <p>Vous avez demandé à accéder à vos réservations. Cliquez sur le bouton ci-dessous pour les gérer :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Voir mes réservations
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">Ce lien est valide pendant 1 heure.</p>
          <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé cet email, vous pouvez l'ignorer.</p>
        </div>
      `,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Erreur envoi magic link:', error)
    return { success: false, error }
  }
}
