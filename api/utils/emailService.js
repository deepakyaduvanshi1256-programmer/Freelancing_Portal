import nodemailer from "nodemailer";

export const sendProjectEmail = async ({ to, subject, text }) => {
    if (!to || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return false;
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER.trim(), pass: process.env.SMTP_PASS.replace(/\s+/g, "") }
    });
    try {
        await transport.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
        return true;
    } catch (error) {
        console.error("Email delivery failed:", error.message);
        return false;
    }
};

export const sendBulkProjectEmails = async (recipients, { subject, text }) => {
    if (!Array.isArray(recipients)) return [];
    const uniqueRecipients = [...new Set(recipients.map((email) => String(email || "").trim()).filter(Boolean))];
    return Promise.allSettled(uniqueRecipients.map((email) => sendProjectEmail({ to: email, subject, text })));
};
