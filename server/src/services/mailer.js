import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { escapeHtml } from './utils.js';

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  transporter = env.SMTP_HOST
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      })
    : nodemailer.createTransport({ jsonTransport: true }); // dev: no SMTP configured, log only
  return transporter;
}

function itemsTable(items) {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(i.brand)}</td>` +
        `<td style="padding:8px 12px;border:1px solid #ddd">${escapeHtml(i.name)}</td>` +
        `<td style="padding:8px 12px;border:1px solid #ddd;text-align:center">${i.quantity}</td></tr>`,
    )
    .join('');
  return `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
    <thead><tr style="background:#f2f2f2"><th style="padding:8px 12px;border:1px solid #ddd">Brand</th>
    <th style="padding:8px 12px;border:1px solid #ddd">Product</th>
    <th style="padding:8px 12px;border:1px solid #ddd">Qty</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export async function sendEnquiryEmails(enquiry) {
  const t = getTransporter();
  const e = (v) => escapeHtml(v || '-');
  const adminHtml = `
    <div style="font-family:Arial,sans-serif;color:#333">
      <h2 style="color:#E31837">New enquiry — Manchanda Electricals</h2>
      <p><b>Name:</b> ${e(enquiry.name)}<br><b>Phone:</b> ${e(enquiry.phone)}<br><b>Email:</b> ${e(enquiry.email)}<br>
      <b>Company/Shop:</b> ${e(enquiry.company)}<br><b>City:</b> ${e(enquiry.city)}<br>
      <b>Preferred contact time:</b> ${e(enquiry.preferredContactTime)}</p>
      <p><b>Message:</b><br>${e(enquiry.message)}</p>
      ${enquiry.items.length ? itemsTable(enquiry.items) : '<p><i>No products selected (general enquiry).</i></p>'}
      <p style="color:#888;font-size:12px">Enquiry ID: ${enquiry._id}</p>
    </div>`;
  const results = [];
  results.push(
    await t.sendMail({
      from: env.MAIL_FROM,
      to: env.ADMIN_EMAIL,
      replyTo: enquiry.email || undefined,
      subject: `New enquiry from ${enquiry.name} (${enquiry.city}) — ${enquiry.items.length} item(s)`,
      html: adminHtml,
    }),
  );
  if (env.SEND_CUSTOMER_CONFIRMATION && enquiry.email) {
    results.push(
      await t.sendMail({
        from: env.MAIL_FROM,
        to: enquiry.email,
        subject: 'We received your enquiry — Manchanda Electricals',
        html: `<div style="font-family:Arial,sans-serif;color:#333">
          <p>Dear ${e(enquiry.name)},</p>
          <p>Thank you for contacting Manchanda Electricals, Chandni Chowk. We have received your enquiry
          and will get back to you shortly.</p>
          ${enquiry.items.length ? itemsTable(enquiry.items) : ''}
          <p>— Manchanda Electricals<br>G-21, 1767/68, Electric Market, Bhagirath Palace, Chandni Chowk, Delhi 110006</p></div>`,
      }),
    );
  }
  if (!env.SMTP_HOST) console.log('[mail] SMTP not configured; emails logged only.');
  return results;
}
