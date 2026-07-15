import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { findRelevantSupportEntries } from "../../lib/support-knowledge";

const chatRouter = Router();

const SYSTEM_PROMPT = `You are the FundedWealth AI Assistant — a friendly, knowledgeable support agent for FundedWealth, India's fastest-growing prop trading firm for Indian traders.

ABOUT FUNDEDWEALTH:
- India's prop firm focused on NSE/BSE/MCX and Indian markets
- Provides funded simulated trading capital up to ₹50 Lakhs
- Zero risk to the trader's personal capital
- Payouts are designed to be fast and INR-native
- Trusted by thousands of active Indian traders

PROFIT SPLIT:
- Up to 70%–90% profit split depending on plan
- Payout cycle is usually 14 days, with faster payouts available for high-performing traders

TRADING RULES (general):
- Daily Drawdown: 5%
- Maximum Drawdown: 10%
- Discipline and consistency are more important than one-time spikes
- Profit target requirements vary by program

ACCOUNT TYPES:
- Flash Funding, Instant Funding, 1-Step Evaluation, 2-Step Evaluation, funded accounts, and scaling plans
- Flash is focused on speed, Instant has no profit target, 1-Step/2-Step use performance phases

REFERRAL AND KYC:
- Referrals earn commission and grow your trading dashboard rewards
- KYC must be completed with verified documents and bank details before payouts can be released

SUPPORT AND ESCALATION:
- If you are unsure or face a rule dispute, encourage the user to create a support ticket through the live support form
- If a user explicitly asks for a human, tell them you can connect them to live support
- Do not fabricate answers; when a policy is unknown, offer to escalate to support@fundedwealth.in instead

IMPORTANT INSTRUCTIONS:
- Always answer in a friendly, professional tone
- Keep responses concise and relevant to FundedWealth policies
- Use the same language the user writes in (English or Hindi)
- Use emojis sparingly to keep the tone warm and supportive
- Only refer to the user's own data when account context is provided in the request body
- Mention relevant dashboard pages and quick action buttons when applicable
- If the user sends a screenshot or file, describe what you see and provide guidance based on the image
- If the user asks about a payout or KYC issue, check eligibility and mention the likely next step (review, approval, or support ticket)`;

chatRouter.post("/", async (req, res) => {
  try {
    const { messages = [], message, imageData, imageMimeType, userEmail, userId, accountContext } = req.body as {
      messages: { role: "user" | "model"; content: string }[];
      message: string;
      imageData?: string;
      imageMimeType?: string;
      userEmail?: string;
      userId?: string;
      accountContext?: Record<string, unknown>;
    };

    if (!message && !imageData) {
      return res.status(400).json({ error: "message or imageData is required" });
    }

    const chatHistory = messages.map((m) => ({
      role: m.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: m.content }],
    }));

    const userParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    if (message) {
      userParts.push({ text: message });
    }

    if (imageData && imageMimeType) {
      userParts.push({
        inlineData: {
          mimeType: imageMimeType,
          data: imageData,
        },
      });
    }

    const relevantDocs = findRelevantSupportEntries(message || "", 3);
    const retrievalContext = relevantDocs.length > 0
      ? `Relevant support documents:\n${relevantDocs.map((doc) => `- ${doc.title}: ${doc.content}`).join("\n\n")}`
      : "";

    const accountContextText = accountContext
      ? `User account context:\n${JSON.stringify(accountContext, null, 2)}`
      : "";

    const userContextText = `User email: ${userEmail || "unknown"}\nUser ID: ${userId || "anonymous"}`;

    const dynamicSystemInstruction = [
      SYSTEM_PROMPT,
      "",
      "RETRIEVAL CONTEXT:",
      retrievalContext || "No matching support documents found.",
      "",
      "USER CONTEXT:",
      userContextText,
      accountContextText ? `\n${accountContextText}` : "",
      "",
      "When answering, combine FundedWealth policy, user account context, and support document guidance. If the user asks for a page action, mention the correct dashboard or payout page. If unsure, offer to create a support ticket or direct the user to support@fundedwealth.in.",
    ].filter(Boolean).join("\n");

    const contents = [
      ...chatHistory,
      { role: "user" as const, parts: [{ text: `[Context for this query]\n${retrievalContext}\n${userContextText}\n${accountContextText}\n\n[User message]\n${message || "Please analyze the attached file."}` }, ...userParts.filter(p => "inlineData" in p)] },
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!ai) {
      res.write(`data: ${JSON.stringify({ error: "AI service not configured" })}\n\n`);
      res.end();
      return;
    }
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
      config: {
        maxOutputTokens: 8192,
        systemInstruction: dynamicSystemInstruction,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate response" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
      res.end();
    }
  }
});

export default chatRouter;
