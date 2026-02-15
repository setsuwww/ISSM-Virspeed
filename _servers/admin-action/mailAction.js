"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendMail({ to, message }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not set")
  }

  if (!to || !message) {
    throw new Error("Invalid payload")
  }

  return await resend.emails.send({
    from: "Admin <onboarding@resend.dev>",
    to,
    subject: "New message",
    html: `<p>${message}</p>`,
  })
}
