const nodemailer = require("nodemailer");

const emailEnabled = String(process.env.EMAIL_ENABLED || "").toLowerCase() === "true";

const hasSmtpConfig = Boolean(
  emailEnabled &&
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS,
);
let warnedMissingConfig = false;

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const sendEmail = async ({ to, subject, html }) => {
  if (!to || !String(to).includes("@")) return false;

  if (!hasSmtpConfig || !transporter) {
    if (!warnedMissingConfig) {
      console.warn(
        "Email sending is disabled. Set EMAIL_ENABLED=true and valid SMTP_* vars to enable.",
      );
      warnedMissingConfig = true;
    }
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`Error sending email to ${to}:`, err.message);
    return false;
  }
};

module.exports = sendEmail;
