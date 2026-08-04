import { Router, type IRouter } from "express";
import { requireAdminAuth } from "../middlewares/supabaseAuth";
import { adminSecurityMiddleware } from "../middlewares/securityMiddleware";
import healthRouter from "./health";
import authRouter from "./auth";
import chatRouter from "./chat";
import seoRouter from "./seo";
import usersRouter from "./users";
import contactRouter from "./contact";
import championshipRouter from "./championship";
import affiliateRouter from "./affiliate";
import payoutsRouter from "./payouts";
import blogRouter from "./blog";
import impactRouter from "./impact";
import kycUserRouter from "./kyc-new";
import notificationsRouter from "./notifications";
import paymentsRouter from "./payments";
import razorpayRouter from "./razorpay";
import autoBlogRouter from "./auto-blog";
import economicEventsRouter from "./economic-events";
import fraudRouter from "./fraud";
import ipIntelligenceRouter from "./ip-intelligence";
import fingerprintRouter from "./fingerprint";
import captchaRouter from "./captcha";
import monitorRouter from "./monitor";
import communityRouter from "./community";
import accountsRouter from "./accounts";
import terminalLaunchRouter, { handleTerminalLaunch } from "./terminal-launch";
import terminalSyncRouter from "./terminal-sync";
import adminPaymentsRouter from "./admin-payments";
import adminEventsRouter from "./admin-events";
import provisioningRouter from "./provisioning";
import adminWebhookRouter from "./admin-webhook";

const router: IRouter = Router();

// ── Public routes (no auth required) ────────────────────────────────────────
router.use(healthRouter);
router.use(seoRouter);
router.use("/blog", blogRouter);
router.use("/impact", impactRouter);
router.use("/contact", contactRouter);
router.use("/captcha", captchaRouter);

// ── Auth routes (mixed public + protected) ──────────────────────────────────
router.use("/auth", authRouter);

// ── Authenticated user routes ───────────────────────────────────────────────
router.use("/chat", chatRouter);
router.use("/users", usersRouter);
router.use("/championship", championshipRouter);
router.use("/affiliate", affiliateRouter);
router.use("/payouts", payoutsRouter);
router.use("/kyc", kycUserRouter);
router.use("/notifications", notificationsRouter);
router.use("/payments", paymentsRouter);
router.use("/razorpay", razorpayRouter);
router.use("/fingerprint", fingerprintRouter);
router.use("/community", communityRouter);
router.use("/accounts", accountsRouter);
router.post("/terminal-launch", handleTerminalLaunch);
router.use("/terminal", terminalLaunchRouter);
router.use("/terminal", terminalSyncRouter);

// ── Admin routes (requireAdminAuth + MFA enforcement) ───────────────────────
router.use("/auto-blog", requireAdminAuth, adminSecurityMiddleware, autoBlogRouter);
router.use("/economic-events", requireAdminAuth, adminSecurityMiddleware, economicEventsRouter);
router.use("/fraud", requireAdminAuth, adminSecurityMiddleware, fraudRouter);
router.use("/ip-intelligence", requireAdminAuth, adminSecurityMiddleware, ipIntelligenceRouter);
router.use("/monitor", requireAdminAuth, adminSecurityMiddleware, monitorRouter);
router.use("/admin-payments", adminPaymentsRouter);
router.use("/admin-events", adminEventsRouter);
router.use("/provisioning", provisioningRouter);
router.use("/webhooks", adminWebhookRouter);

export default router;
