import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT') || 587;
    const user = this.configService.get<string>('SMTP_USER');
    const rawPass = this.configService.get<string>('SMTP_PASS');
    const pass = rawPass ? rawPass.replace(/\s+/g, '') : undefined;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: this.configService.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user,
          pass,
        },
      });
      this.logger.log('Nodemailer SMTP Transporter initialized successfully');
    } else {
      this.logger.warn(
        'SMTP configurations are missing in .env! Invitation emails will be logged to console instead of sending.',
      );
    }
  }

  async sendInvitation(toEmail: string, name: string, orgName: string, tempPassword: string): Promise<boolean> {
    const fromName = this.configService.get<string>('SMTP_FROM_NAME') || 'FlowCRM Team';
    const fromEmail = this.configService.get<string>('SMTP_USER') || 'noreply@flowcrm.com';
    const loginUrl = 'http://localhost:4200/auth/login';

    const subject = `You've been invited to join ${orgName} on FlowCRM`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 40px 0;
            color: #1e293b;
          }
          .email-container {
            max-width: 580px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
            overflow: hidden;
          }
          .email-header {
            background-color: #2563eb;
            padding: 24px;
            text-align: center;
          }
          .email-header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .email-body {
            padding: 32px 24px;
          }
          .email-body h2 {
            font-size: 18px;
            font-weight: 600;
            margin-top: 0;
            color: #0f172a;
          }
          .email-body p {
            font-size: 15px;
            line-height: 1.6;
            color: #475569;
          }
          .credentials-box {
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
            border: 1px solid #e2e8f0;
          }
          .credential-item {
            margin-bottom: 8px;
            font-size: 14px;
          }
          .credential-item:last-child {
            margin-bottom: 0;
          }
          .credential-label {
            font-weight: 600;
            color: #334155;
          }
          .credential-value {
            font-family: monospace;
            background-color: #e2e8f0;
            padding: 2px 6px;
            border-radius: 4px;
            color: #0f172a;
          }
          .btn-container {
            text-align: center;
            margin-top: 32px;
          }
          .btn-login {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 15px;
            transition: background-color 0.2s ease;
          }
          .btn-login:hover {
            background-color: #1d4ed8;
          }
          .email-footer {
            padding: 24px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            background-color: #f8fafc;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>FlowCRM</h1>
          </div>
          <div class="email-body">
            <h2>Hello ${name},</h2>
            <p>You have been invited by your administrator to join the organization <strong>${orgName}</strong> on FlowCRM.</p>
            <p>You can log in and start managing your pipelines by clicking the button below. Please use the following login credentials to access your account:</p>
            
            <div class="credentials-box">
              <div class="credential-item">
                <span class="credential-label">Login Email:</span>
                <span class="credential-value">${toEmail}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">Temporary Password:</span>
                <span class="credential-value">${tempPassword}</span>
              </div>
            </div>

            <p>For security reasons, we highly recommend changing your password from your User Settings immediately after your first sign-in.</p>
            
            <div class="btn-container">
              <a href="${loginUrl}" class="btn-login">Log In to Workspace</a>
            </div>
          </div>
          <div class="email-footer">
            &copy; 2026 FlowCRM Inc. All rights reserved.<br>
            This email was sent automatically, please do not reply.
          </div>
        </div>
      </body>
      </html>
    `;

    if (!this.transporter) {
      this.logger.warn(`[MOCK EMAIL] SMTP is not configured. Invitation log:
------------------------------------------
Recipient: ${toEmail}
Subject: ${subject}
Name: ${name}
Org Name: ${orgName}
Assigned Password: ${tempPassword}
Login URL: ${loginUrl}
------------------------------------------`);
      return true;
    }

    const textContent = `Hello ${name},\n\nYou have been invited by your administrator to join the organization ${orgName} on FlowCRM.\n\nLogin credentials:\nLogin Email: ${toEmail}\nTemporary Password: ${tempPassword}\n\nLog in here: ${loginUrl}`;

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
      });
      this.logger.log(`Invitation email successfully sent to: ${toEmail}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send invitation email to: ${toEmail}`, error.stack);
      return false;
    }
  }
}
