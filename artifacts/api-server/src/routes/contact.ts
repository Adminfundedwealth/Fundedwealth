import { Router } from "express";
import { db } from "@workspace/db";
import { contactSubmissions } from "@workspace/db";
import { contactLimiter } from "../lib/rate-limit";
import { contactConfirmationEmail } from "../lib/email";

const router = Router();

router.post("/", contactLimiter, async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "Name, email, subject, and message are required" });
  }

  const [submission] = await db
    .insert(contactSubmissions)
    .values({ name, email, phone, subject, message })
    .returning();

  contactConfirmationEmail(name, email).catch(() => {});

  res.status(201).json({ success: true, id: submission.id });
});

export default router;
