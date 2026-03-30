import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('mail.host'),
      port: this.config.get<number>('mail.port'),
      secure: this.config.get<boolean>('mail.secure'),
      auth: {
        user: this.config.get<string>('mail.user'),
        pass: this.config.get<string>('mail.password'),
      },
    });
  }

  async sendAdvisorApprovalEmail(
    email: string,
    firstName: string,
  ): Promise<void> {
    const from = this.config.get<string>('mail.from');
    const appUrl = this.config.get<string>('appUrl');

    await this.transporter.sendMail({
      from,
      to: email,
      subject: '✅ Your AgriSmart Advisor Account Has Been Approved!',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f7f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2d6a4f, #40916c); padding: 40px 30px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; }
    .header p { color: #b7e4c7; margin: 8px 0 0; }
    .body { padding: 40px 30px; }
    .body h2 { color: #1b4332; font-size: 22px; }
    .body p { color: #555; line-height: 1.7; }
    .cta { display: inline-block; margin: 24px 0; background: #40916c; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; }
    .footer { background: #f0f4ef; padding: 20px 30px; text-align: center; color: #888; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌱 AgriSmart</h1>
      <p>Connecting Rwanda's farmers with expert knowledge</p>
    </div>
    <div class="body">
      <h2>Welcome aboard, ${firstName}! 🎉</h2>
      <p>We're thrilled to let you know that your <strong>Advisor account</strong> on AgriSmart has been reviewed and <strong>approved</strong> by our admin team.</p>
      <p>You can now log in to your dashboard to:</p>
      <ul>
        <li>🤝 Connect with farmers in your district</li>
        <li>📅 Create crop calendars and task notifications</li>
        <li>📚 Upload guides to the Knowledge Base</li>
        <li>💬 Chat directly with farmers in real-time</li>
      </ul>
      <a href="${appUrl}/auth/login" class="cta">Log In to Your Dashboard →</a>
      <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
      <p>Together, let's transform Rwandan agriculture!</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} AgriSmart Rwanda · <a href="${appUrl}">agrismart.rw</a>
    </div>
  </div>
</body>
</html>
      `,
    });

    this.logger.log(`Approval email sent to ${email}`);
  }

  async sendWelcomeFarmerEmail(email: string, firstName: string): Promise<void> {
    const from = this.config.get<string>('mail.from');

    await this.transporter.sendMail({
      from,
      to: email,
      subject: '🌱 Welcome to AgriSmart!',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f4f7f0; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2d6a4f, #40916c); padding: 40px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 28px; }
    .body { padding: 40px 30px; color: #555; line-height: 1.7; }
    .footer { background: #f0f4ef; padding: 20px; text-align: center; color: #888; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🌱 AgriSmart</h1></div>
    <div class="body">
      <h2 style="color:#1b4332">Hello, ${firstName}! 👋</h2>
      <p>You have successfully joined <strong>AgriSmart</strong> — Rwanda's premier platform connecting farmers with certified agricultural advisors.</p>
      <p>Your account is active and ready. An advisor will be assigned to your farm shortly.</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} AgriSmart Rwanda</div>
  </div>
</body>
</html>
      `,
    });
  }

  async sendConsultationNotification(
    email: string,
    firstName: string,
    advisorName: string,
    messagePreview: string,
  ): Promise<void> {
    const from = this.config.get<string>('mail.from');
    await this.transporter.sendMail({
      from,
      to: email,
      subject: `💬 New message from ${advisorName} on AgriSmart`,
      html: `
        <p>Hello ${firstName},</p>
        <p>You have a new message from your advisor <strong>${advisorName}</strong>:</p>
        <blockquote style="border-left:4px solid #40916c;padding:12px 20px;background:#f4f7f0;color:#333">"${messagePreview}"</blockquote>
        <p>Log in to AgriSmart to view the full message and respond.</p>
      `,
    });
  }
}
