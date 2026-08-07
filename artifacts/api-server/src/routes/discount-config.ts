import { Router, type Request, type Response } from "express";
import { db, discountConfig } from "@workspace/db";
import { PRODUCTS, type PlanType, PLAN_TYPES } from "@workspace/products";
import { logger } from "../lib/logger";

const router = Router();

/**
 * GET /api/discount-config
 *
 * Public endpoint — returns the active discount code + percentage for each plan.
 * The main website fetches this on load to display live codes in DiscountBar,
 * "Use code" banners, and checkout. Cached for 60 s by the client.
 *
 * Falls back to the static PRODUCTS defaults if the DB row is missing.
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(discountConfig);

    // Build a map from DB rows
    const dbMap: Record<string, { code: string; discountPct: number; active: boolean }> = {};
    for (const row of rows) {
      dbMap[row.planType] = { code: row.code, discountPct: row.discountPct, active: row.active };
    }

    // Merge with static fallbacks so missing rows still return something
    const result = PLAN_TYPES.map((planType) => {
      const product = PRODUCTS[planType as PlanType];
      const db = dbMap[planType];
      return {
        planType,
        displayLabel: product.displayLabel,
        code: db?.code ?? product.code,
        discountPct: db?.discountPct ?? parseInt(product.discount, 10),
        active: db?.active ?? true,
      };
    });

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=30");
    return res.json({ data: result });
  } catch (err) {
    logger.error({ err }, "discount-config fetch error");
    // Return static fallback so the site never breaks
    const fallback = PLAN_TYPES.map((planType) => {
      const p = PRODUCTS[planType as PlanType];
      return {
        planType,
        displayLabel: p.displayLabel,
        code: p.code,
        discountPct: parseInt(p.discount, 10),
        active: true,
      };
    });
    return res.json({ data: fallback });
  }
});

export default router;
