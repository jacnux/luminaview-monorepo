import nodemailer from 'nodemailer';

// Configuration du transporteur
const transporterOptions: any = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
};

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporterOptions.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };
}

// Fonction pour l'envoi de l'email de vérification
export const sendVerificationEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport(transporterOptions);

  // Construction de l'URL de vérification
  // Utilise FRONTEND_URL si défini, sinon fallback selon l'environnement
  const baseUrl = process.env.FRONTEND_URL || (
    process.env.NODE_ENV === 'production'
      ? 'https://luminaview.fr'
      : 'http://localhost:7080'
  );

  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'test@helioscope.fr',
    to: email,
    subject: 'Hélioscope - Vérification de votre compte',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #EAB308;">Bienvenue sur Hélioscope !</h2>
        <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour activer votre compte :</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #EAB308; color: black; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Activer mon compte
        </a>
        <p style="font-size: 12px; color: #888; margin-top: 20px;">Ce lien expire dans 24 heures.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Fonction pour l'envoi du mot de passe temporaire (NOUVEAU)
export const sendPasswordResetEmail = async (email: string, tempPassword: string) => {
  const transporter = nodemailer.createTransport(transporterOptions);

  const mailOptions = {
    from: process.env.SMTP_FROM || 'test@helioscope.fr',
    to: email,
    subject: 'Hélioscope - Votre nouveau mot de passe',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #EAB308;">Mot de passe réinitialisé</h2>
        <p>Bonjour,</p>
        <p>Un administrateur a réinitialisé votre mot de passe.</p>
        <p>Votre nouveau mot de passe temporaire est :</p>
        <div style="background: #f3f4f6; padding: 10px; font-size: 20px; font-weight: bold; text-align: center; letter-spacing: 2px; border-radius: 5px;">
          ${tempPassword}
        </div>
        <p style="color: #666; font-size: 12px;">Nous vous conseillons de le changer dès votre prochaine connexion.</p>
        <hr/>
        <p style="font-size: 12px; color: #888;">L'équipe Hélioscope</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Fonction de conversion Markdown basique vers HTML pour les emails
function markdownToHtml(markdown: string): string {
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  html = html.replace(/^### (.*$)/gim, '<h3 style="color: #0f172a; font-size: 16px; margin-top: 16px; font-weight: bold;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="color: #0f172a; font-size: 18px; margin-top: 20px; font-weight: bold;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="color: #0f172a; font-size: 22px; margin-top: 24px; font-weight: bold;">$1</h1>');

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #eab308; text-decoration: underline;">$1</a>');

  const paragraphs = html.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
  return paragraphs.map(p => `<p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 12px;">${p.replace(/\n/g, '<br/>')}</p>`).join('');
}

// Fonction d'envoi de message collectif (Broadcast) aux utilisateurs vérifiés
export const sendBroadcastEmail = async (email: string, userName: string, subject: string, markdownMessage: string) => {
  const transporter = nodemailer.createTransport(transporterOptions);
  const messageBodyHtml = markdownToHtml(markdownMessage);

  const mailOptions = {
    from: process.env.SMTP_FROM || 'test@helioscope.fr',
    to: email,
    subject: subject,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
          <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">LuminaView Studio</h1>
          <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Message officiel de l'administration</p>
        </div>
        <div style="padding: 32px 28px;">
          <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 0;">Bonjour ${userName || 'utilisateur'},</p>
          ${messageBodyHtml}
        </div>
        <div style="background-color: #f8fafc; padding: 18px 28px; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="font-size: 12px; color: #64748b; margin: 0;">
            Ce message vous a été envoyé par l'administrateur de LuminaView.
          </p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
