const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = null;

if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true pour 465, false pour 587
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
    tls: {
      rejectUnauthorized: false // Pour éviter les erreurs SSL en développement
    }
  });
}

// En l'absence de configuration SMTP (développement), on journalise l'email
// au lieu de l'envoyer, pour que les fonctionnalités restent testables.
async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    console.log("---- [EMAIL SIMULÉ — configurer SMTP_* dans .env pour un envoi réel] ----");
    console.log("À:", to, "| Sujet:", subject);
    console.log(html);
    console.log("----------------------------------------------------------------------");
    return { simulated: true };
  }

  // Convertir HTML en texte brut si non fourni
  if (!text && html) {
    text = html
      .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
      .replace(/&nbsp;/g, ' ') // Remplacer les espaces insécables
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim();
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Service Public Comores" <noreply@service-public.km>',
    to,
    subject,
    html,
    text: text || subject,
    headers: {
      'X-Priority': '3',
      'X-Mailer': 'Service Public Comores',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal',
      'Precedence': 'bulk',
      'List-Unsubscribe': `<mailto:unsubscribe@service-public.km?subject=unsubscribe>`
    }
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
