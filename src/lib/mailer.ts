import nodemailer, { TransportOptions, SentMessageInfo } from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_SERVICE,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_EMAIL_PASSWORD,
  },
} as TransportOptions);

export function sendMail(emails: Array<string>, subject: string, body: string) {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: emails,
    subject: subject,
    html: body,
  };
  transport.sendMail(
    mailOptions,
    (error: Error | null, info: SentMessageInfo) => {
      if (error) {
        console.log(error?.message);
      } else {
        console.log("Email sent: " + info?.response);
      }
    }
  );
}
