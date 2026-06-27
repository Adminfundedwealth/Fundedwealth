/**
 * Generates public/opengraph.jpg (1200x630) for FundedWealth.
 * Uses only built-in Node APIs — writes a minimal valid JPEG via raw bytes.
 * This produces a solid dark-purple branded image with no canvas dependency.
 */
import { writeFileSync } from "fs";
import { createCanvas } from "canvas";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "public", "opengraph.jpg");

const W = 1200, H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

// Background gradient: dark purple
const grad = ctx.createLinearGradient(0, 0, W, H);
grad.addColorStop(0, "#0D0020");
grad.addColorStop(0.5, "#1A0035");
grad.addColorStop(1, "#0D0020");
ctx.fillStyle = grad;
ctx.fillRect(0, 0, W, H);

// Glow orb top-right
const orb = ctx.createRadialGradient(900, 150, 0, 900, 150, 350);
orb.addColorStop(0, "rgba(74,0,224,0.45)");
orb.addColorStop(0.5, "rgba(142,45,226,0.15)");
orb.addColorStop(1, "transparent");
ctx.fillStyle = orb;
ctx.fillRect(0, 0, W, H);

// Orange accent orb bottom-left
const orb2 = ctx.createRadialGradient(200, 500, 0, 200, 500, 250);
orb2.addColorStop(0, "rgba(255,138,61,0.3)");
orb2.addColorStop(1, "transparent");
ctx.fillStyle = orb2;
ctx.fillRect(0, 0, W, H);

// Subtle horizontal rule
ctx.strokeStyle = "rgba(255,255,255,0.06)";
ctx.lineWidth = 1;
ctx.beginPath(); ctx.moveTo(80, 390); ctx.lineTo(1120, 390); ctx.stroke();

// Badge pill
const badgeX = 80, badgeY = 100, badgeW = 260, badgeH = 38, badgeR = 19;
ctx.beginPath();
ctx.moveTo(badgeX + badgeR, badgeY);
ctx.lineTo(badgeX + badgeW - badgeR, badgeY);
ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + badgeR);
ctx.lineTo(badgeX + badgeW, badgeY + badgeH - badgeR);
ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - badgeR, badgeY + badgeH);
ctx.lineTo(badgeX + badgeR, badgeY + badgeH);
ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - badgeR);
ctx.lineTo(badgeX, badgeY + badgeR);
ctx.quadraticCurveTo(badgeX, badgeY, badgeX + badgeR, badgeY);
ctx.closePath();
ctx.fillStyle = "rgba(74,0,224,0.35)";
ctx.fill();
ctx.strokeStyle = "rgba(74,0,224,0.7)";
ctx.lineWidth = 1.5;
ctx.stroke();
ctx.fillStyle = "#a78bfa";
ctx.font = "bold 15px sans-serif";
ctx.textAlign = "center";
ctx.fillText("India's #1 Prop Trading Firm", badgeX + badgeW / 2, badgeY + 25);

// Main headline
ctx.textAlign = "left";
ctx.fillStyle = "#FFFFFF";
ctx.font = "bold 74px sans-serif";
ctx.fillText("Funded", 80, 280);
const fw = ctx.measureText("Funded").width;
const gradText = ctx.createLinearGradient(80 + fw + 8, 0, 80 + fw + 8 + 320, 0);
gradText.addColorStop(0, "#FF8A3D");
gradText.addColorStop(1, "#D63384");
ctx.fillStyle = gradText;
ctx.fillText("Wealth", 80 + fw + 8, 280);

// Subtitle
ctx.fillStyle = "rgba(255,255,255,0.65)";
ctx.font = "28px sans-serif";
ctx.fillText("Get Funded Up to ₹50 Lakhs · Trade NSE, BSE & MCX", 80, 345);

// Three stat pills
const stats = ["70–90% Profit Split", "12-Hour Payouts", "From ₹999"];
let sx = 80;
stats.forEach(stat => {
  const tw = ctx.measureText(stat).width + 40;
  ctx.beginPath();
  ctx.roundRect(sx, 415, tw, 44, 22);
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(stat, sx + tw / 2, 415 + 28);
  sx += tw + 16;
});

// Website URL
ctx.textAlign = "left";
ctx.fillStyle = "rgba(255,255,255,0.35)";
ctx.font = "18px sans-serif";
ctx.fillText("fundedwealth.com", 80, 580);

const buf = canvas.toBuffer("image/jpeg", { quality: 0.92 });
writeFileSync(OUT, buf);
console.log(`opengraph.jpg written — ${buf.length} bytes`);
