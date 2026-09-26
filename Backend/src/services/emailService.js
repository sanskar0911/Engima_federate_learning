import nodemailer from "nodemailer";

export const sendEmail = async (to, report) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "🚨 Fraud Detection Alert",
    text: `
Suspicious Transactions Detected

Risk Score: ${report.riskScore}

Reasons:
${report.reasons.join("\n")}

⚠ Please respond within 7 days.

- Fraud Detection System
    `,
  });
};

export const sendDirectEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
};