import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_EMAIL_CONFIG_PATH = path.join(__dirname, 'email-config.local.json');

const readSavedConfig = () => {
  try {
    if (!fs.existsSync(LOCAL_EMAIL_CONFIG_PATH)) return {};
    return JSON.parse(fs.readFileSync(LOCAL_EMAIL_CONFIG_PATH, 'utf8'));
  } catch (error) {
    console.warn('Could not read local email config:', error.message);
    return {};
  }
};

const saveConfig = config => {
  fs.writeFileSync(LOCAL_EMAIL_CONFIG_PATH, JSON.stringify(config, null, 2));
};

const savedConfig = readSavedConfig();

let runtimeConfig = {
  host: process.env.SMTP_HOST || savedConfig.host || '',
  port: Number(process.env.SMTP_PORT || savedConfig.port || 587),
  secure: String(process.env.SMTP_SECURE ?? savedConfig.secure ?? 'false').toLowerCase() === 'true',
  user: process.env.SMTP_USER || savedConfig.user || '',
  pass: process.env.SMTP_PASS || savedConfig.pass || '',
  fromEmail: process.env.SMTP_FROM_EMAIL || savedConfig.fromEmail || process.env.SMTP_USER || '',
  fromName: process.env.SMTP_FROM_NAME || savedConfig.fromName || 'Tatvalife Care Team',
  replyTo: process.env.SMTP_REPLY_TO || savedConfig.replyTo || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || ''
};

export const getEmailConfig = () => ({
  host: runtimeConfig.host,
  port: runtimeConfig.port,
  secure: runtimeConfig.secure,
  user: runtimeConfig.user,
  fromEmail: runtimeConfig.fromEmail,
  fromName: runtimeConfig.fromName,
  replyTo: runtimeConfig.replyTo,
  configured: Boolean(runtimeConfig.host && runtimeConfig.port && runtimeConfig.user && runtimeConfig.pass && runtimeConfig.fromEmail)
});

export const updateEmailConfig = updates => {
  runtimeConfig = {
    ...runtimeConfig,
    host: updates.host ?? runtimeConfig.host,
    port: Number(updates.port || runtimeConfig.port || 587),
    secure: Boolean(updates.secure),
    user: updates.user ?? runtimeConfig.user,
    pass: updates.pass || runtimeConfig.pass,
    fromEmail: updates.fromEmail ?? runtimeConfig.fromEmail,
    fromName: updates.fromName ?? runtimeConfig.fromName,
    replyTo: updates.replyTo ?? runtimeConfig.replyTo
  };

  saveConfig(runtimeConfig);

  return getEmailConfig();
};

export const sendEmail = async ({ to, subject, text }) => {
  const publicConfig = getEmailConfig();
  if (!publicConfig.configured) {
    throw new Error('Email is not configured. Add local SMTP settings in Admin Console first.');
  }

  let nodemailer;
  try {
    nodemailer = await import('nodemailer');
  } catch {
    throw new Error('Email package missing. Run npm install in the backend folder to install nodemailer.');
  }

  const transporter = nodemailer.default.createTransport({
    host: runtimeConfig.host,
    port: runtimeConfig.port,
    secure: runtimeConfig.secure,
    auth: {
      user: runtimeConfig.user,
      pass: runtimeConfig.pass
    }
  });

  const info = await transporter.sendMail({
    from: `"${runtimeConfig.fromName}" <${runtimeConfig.fromEmail}>`,
    to,
    replyTo: runtimeConfig.replyTo || runtimeConfig.fromEmail,
    subject,
    text
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted || [],
    rejected: info.rejected || []
  };
};
