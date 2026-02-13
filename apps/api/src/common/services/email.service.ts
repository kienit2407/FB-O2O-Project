import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { emailConfig, sender } from '../../config/email.config';
import { createAuthFirst, createWelcomeEmail } from './email-templates';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<boolean> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: `"${sender.name}" <${sender.email}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`[Email] Sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error('[Email] Failed to send email:', error);
      return false;
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    const html = createAuthFirst(otp, 'http://localhost:3000', email);
    return this.sendEmail({
      to: email,
      subject: 'Mã OTP xác thực tài khoản FaB-O2O',
      html,
    });
  }

  async sendWelcomeEmail(email: string, fullName: string): Promise<boolean> {
    const html = createWelcomeEmail(fullName);
    return this.sendEmail({
      to: email,
      subject: 'Chào mừng bạn đến với FaB-O2O! 🎉',
      html,
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('[Email] SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('[Email] SMTP connection failed:', error);
      return false;
    }
  }
}
