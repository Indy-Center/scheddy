import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';
import type SMTPTransport from 'nodemailer/lib/smtp-pool';

export const emailTransporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: env.SMTP_PORT,
	secure: env.SMTP_SECURE === 'true',
	auth: {
		user: env.SMTP_AUTH_USER,
		pass: env.SMTP_AUTH_PASS
	}
});

export interface EmailContent {
	raw: string;
	html: string;
}

export function templateOut(src: string, data: Record<string, string>): string {
	let out = src;
	for (const [k, v] of Object.entries(data)) {
		out = out.replaceAll(`{${k}}`, v);
	}
	return out;
}

export async function sendEmail(
	to: string,
	subject: string,
	plaintext: string,
	html: string
): Promise<SMTPTransport.SentMessageInfo> {
	return emailTransporter.sendMail({
		from: SMTP_EMAIL_FROM,
		to: to,
		subject,
		text: plaintext,
		html
	});
}
