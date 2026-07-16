import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import SEOHead from "@/components/SEOHead";
import { FAQSchema, ServiceSchema } from "@/components/StructuredData";
import IndiaTraderNetworkHero from "@/components/IndiaTraderNetworkHero";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Trophy,
  Clock,
  ShieldCheck,
  TrendingUp,
  Zap,
  BarChart3,
  Users,
  CreditCard,
  Instagram,
  Twitter,
  Youtube,
  Menu,
  X,
  Link2,
  Star,
  Gift,
  BadgeCheck,
  MousePointerClick,
  Heart,
  Smartphone,
  Bell,
  Globe,
  Lock,
  Award,
  Building2,
  FileText,
  MapPin,
  Phone,
  Mail,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";


// ─── Bulge / Magnetic text effect ───────────────────────────────────────────
function BulgeText({
  text,
  className = "",
  radius = 120,
  strength = 0.55,
}: {
  text: string;
  className?: string;
  radius?: number;
  strength?: number;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [offsets, setOffsets] = useState<{ x: number; y: number; s: number }[]>([]);
  const chars = text.split("");

  useEffect(() => {
    setOffsets(chars.map(() => ({ x: 0, y: 0, s: 1 })));
  }, [text]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const spans = containerRef.current.querySelectorAll<HTMLSpanElement>("[data-char]");
      const next = Array.from(spans).map((span) => {
        const rect = span.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) return { x: 0, y: 0, s: 1 };
        const factor = (1 - dist / radius) * strength;
        return {
          x: dx * factor,
          y: dy * factor,
          s: 1 + factor * 0.35,
        };
      });
      setOffsets(next);
    },
    [radius, strength]
  );

  const onMouseLeave = useCallback(() => {
    setOffsets(chars.map(() => ({ x: 0, y: 0, s: 1 })));
  }, [chars.length]);

  return (
    <span
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ display: "inline-block" }}
    >
      {chars.map((ch, i) => (
        <span
          key={i}
          data-char
          className={className}
          style={{
            display: "inline-block",
            transform: offsets[i]
              ? `translate(${offsets[i].x}px, ${offsets[i].y}px) scale(${offsets[i].s})`
              : "none",
            transition: "transform 0.12s cubic-bezier(0.23,1,0.32,1)",
            willChange: "transform",
          }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </span>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const WORLD_CONTINENTS: [number, number][][] = [
  [[71, 25], [60, 30], [55, 42], [45, 40], [40, 28], [36, 36], [30, 48], [25, 56], [20, 63], [15, 75], [10, 77], [8, 77], [10, 80], [15, 80], [20, 87], [22, 89], [25, 88], [28, 97], [35, 76], [37, 68], [42, 45], [48, 40], [55, 28], [60, 20], [65, 15], [70, 20], [71, 25]],
  [[65, -20], [60, -5], [55, 10], [50, 5], [45, 0], [42, -5], [38, -10], [35, 0], [30, -10], [25, -15], [20, -18], [15, -17], [10, -14], [5, -10], [5, 10], [0, 10], [-5, 12], [-15, 15], [-22, 17], [-35, 20], [-35, 28], [-30, 32], [-28, 28], [-25, 15], [-20, 12], [-15, 15], [-5, 40], [5, 42], [10, 45], [15, 40], [20, 42], [25, 35], [30, 33], [35, 38], [38, 42], [42, 44], [45, 42], [50, 50], [55, 60], [60, 65], [65, 60], [70, 50], [72, 40], [70, 30], [68, 20], [65, 10], [63, 0], [62, -5], [65, -20]],
  [[72, -170], [70, -165], [68, -155], [65, -140], [60, -130], [55, -125], [50, -122], [45, -120], [40, -118], [35, -115], [30, -110], [25, -105], [25, -100], [30, -95], [30, -85], [25, -80], [20, -88], [15, -92], [10, -84], [8, -80], [10, -76], [15, -75], [8, -70], [10, -62], [5, -55], [10, -50], [15, -42], [20, -40], [25, -60], [30, -60], [35, -60], [40, -65], [45, -63], [50, -55], [52, -60], [55, -65], [57, -68], [60, -75], [55, -80], [50, -90], [48, -95], [50, -100], [55, -110], [58, -120], [60, -140], [62, -150], [65, -160], [68, -165], [72, -170]],
  [[-10, -40], [-15, -42], [-20, -45], [-25, -50], [-30, -52], [-35, -58], [-30, -68], [-25, -70], [-20, -65], [-15, -75], [-10, -78], [-5, -80], [0, -80], [5, -78], [-2, -50], [-5, -45], [-10, -40]],
  [[-12, 130], [-15, 132], [-20, 118], [-25, 115], [-30, 118], [-32, 122], [-35, 138], [-37, 142], [-35, 148], [-30, 150], [-25, 152], [-20, 148], [-15, 140], [-12, 135], [-12, 130]],
];

const INDIA_SHAPE: [number, number][] = [
  [35.5, 74.3], [35.2, 74.8], [35.0, 75.5], [35.3, 76.0], [35.7, 76.3], [36.0, 76.8], [36.5, 76.5], [36.8, 76.9], [37.0, 77.5], [36.8, 78.0], [36.2, 78.2], [35.8, 78.8], [36.0, 79.2], [36.5, 79.5], [37.0, 79.8], [37.2, 80.2], [36.8, 80.5], [36.2, 80.3], [35.5, 79.8], [35.0, 79.0], [34.6, 78.2], [34.2, 77.8],
  [33.8, 77.0], [33.5, 76.5], [33.0, 76.2], [32.7, 76.0], [32.5, 75.8], [32.2, 75.6], [32.0, 75.3], [31.5, 75.0], [31.2, 74.8], [30.8, 74.5], [30.4, 74.0], [30.2, 73.5], [30.0, 73.0],
  [29.5, 72.5], [29.2, 71.8], [29.0, 71.2], [28.6, 70.5], [28.2, 70.0], [27.8, 69.5], [27.4, 69.2], [27.0, 69.0], [26.5, 69.0], [26.0, 69.2], [25.5, 69.0], [25.0, 68.8], [24.5, 68.5], [24.0, 68.8], [23.8, 69.0], [23.5, 68.8], [23.4, 68.3], [23.5, 67.8], [23.8, 67.5], [24.0, 67.0], [23.8, 66.8], [23.5, 67.0], [23.2, 67.5], [23.0, 68.0], [22.8, 68.5], [22.5, 69.0], [22.2, 69.5], [22.0, 70.0],
  [21.5, 70.5], [21.2, 71.0], [21.0, 71.5], [20.8, 72.0], [20.7, 72.3], [21.0, 72.5], [21.2, 72.8], [21.5, 72.6], [22.0, 72.5], [22.3, 73.0], [22.5, 72.5], [22.2, 72.0], [22.0, 71.5], [21.8, 71.8], [21.5, 72.3],
  [21.0, 72.8], [20.5, 72.8], [20.2, 73.0], [20.0, 72.8], [19.8, 73.0], [19.5, 72.8], [19.0, 72.8], [18.8, 73.0], [18.5, 73.2], [18.0, 73.5], [17.5, 73.3], [17.0, 73.5], [16.5, 73.8], [16.0, 74.0], [15.5, 74.0], [15.2, 74.2], [14.8, 74.5], [14.5, 74.3], [14.2, 74.5], [14.0, 74.8], [13.5, 74.7], [13.0, 75.0], [12.5, 75.0], [12.0, 75.5], [11.8, 75.8], [11.5, 76.0], [11.0, 76.0], [10.5, 76.3], [10.0, 76.3], [9.5, 76.5], [9.0, 76.8], [8.5, 77.0], [8.2, 77.3], [8.0, 77.5],
  [8.0, 78.0], [8.2, 78.5], [8.5, 79.0], [9.0, 79.3], [9.5, 79.5], [10.0, 79.8], [10.2, 80.0], [10.5, 79.8], [11.0, 79.8], [11.5, 80.0], [12.0, 80.2], [12.5, 80.2], [13.0, 80.2], [13.5, 80.3], [14.0, 80.2], [14.5, 80.0], [14.8, 80.2], [15.0, 80.0], [15.5, 80.3], [16.0, 80.5], [16.2, 81.0], [16.5, 81.5], [17.0, 82.2], [17.5, 83.0], [18.0, 83.5], [18.5, 84.0], [19.0, 84.8], [19.5, 85.0], [20.0, 86.0], [20.5, 86.5], [21.0, 87.0], [21.5, 87.5], [22.0, 88.5], [22.5, 88.8], [23.0, 88.5], [23.5, 88.8], [24.0, 89.0], [24.5, 88.5], [25.0, 88.8], [25.5, 89.0], [26.0, 89.5], [26.2, 90.0], [26.5, 89.8], [26.8, 89.5], [27.0, 89.0], [27.5, 88.8], [27.8, 88.5],
  [27.5, 88.0], [27.2, 87.5], [27.0, 87.0], [26.8, 86.5], [27.0, 86.0], [27.2, 85.5], [27.5, 85.0], [27.0, 84.5], [26.8, 84.0], [27.0, 83.5], [27.2, 83.0], [27.5, 82.5], [27.8, 82.0], [28.0, 81.5], [28.3, 81.0], [28.5, 80.5], [29.0, 80.2], [29.3, 80.0], [29.5, 80.5], [29.8, 81.0], [30.0, 80.5], [30.2, 80.0], [30.5, 79.5], [31.0, 79.0], [31.5, 78.5], [32.0, 78.0], [32.5, 77.5], [33.0, 77.0], [33.5, 76.5], [34.0, 76.0], [34.5, 75.5], [35.0, 75.0], [35.5, 74.3],
];

const TRADER_CITIES = [
  { name: "Delhi", lat: 28.6, lon: 77.2, color: "#FF8A3D" },
  { name: "Mumbai", lat: 19.0, lon: 72.8, color: "#D63384" },
  { name: "Bengaluru", lat: 12.9, lon: 77.6, color: "#A855F7" },
  { name: "Chennai", lat: 13.1, lon: 80.3, color: "#FF8A3D" },
  { name: "Kolkata", lat: 22.6, lon: 88.4, color: "#00E5FF" },
  { name: "Hyderabad", lat: 17.4, lon: 78.5, color: "#D63384" },
  { name: "Pune", lat: 18.5, lon: 73.9, color: "#A855F7" },
  { name: "Jaipur", lat: 26.9, lon: 75.8, color: "#00E5FF" },
  { name: "Lucknow", lat: 26.8, lon: 80.9, color: "#FF8A3D" },
  { name: "Kochi", lat: 9.9, lon: 76.3, color: "#D63384" },
];

const CITY_CONNS: [number, number][] = [[0, 1], [0, 4], [0, 7], [0, 8], [1, 5], [1, 6], [5, 2], [5, 3], [2, 3], [2, 9], [4, 8]];

function ease(t: number) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

const MAP_CITIES = [
  { name: "Srinagar", lat: 34.1, lon: 74.8 },
  { name: "Delhi", lat: 28.6, lon: 77.2 },
  { name: "Jaipur", lat: 26.9, lon: 75.8 },
  { name: "Lucknow", lat: 26.8, lon: 80.9 },
  { name: "Mumbai", lat: 19.0, lon: 72.8 },
  { name: "Ahmedabad", lat: 23.0, lon: 72.6 },
  { name: "Pune", lat: 18.5, lon: 73.9 },
  { name: "Hyderabad", lat: 17.4, lon: 78.5 },
  { name: "Bengaluru", lat: 12.9, lon: 77.6 },
  { name: "Chennai", lat: 13.1, lon: 80.3 },
  { name: "Kolkata", lat: 22.6, lon: 88.4 },
  { name: "Bhopal", lat: 23.3, lon: 77.4 },
  { name: "Patna", lat: 25.6, lon: 85.1 },
  { name: "Kochi", lat: 9.9, lon: 76.3 },
  { name: "Chandigarh", lat: 30.7, lon: 76.8 },
  { name: "Guwahati", lat: 26.1, lon: 91.7 },
  { name: "Bhubaneswar", lat: 20.3, lon: 85.8 },
  { name: "Raipur", lat: 21.2, lon: 81.6 },
  { name: "Ranchi", lat: 23.3, lon: 85.3 },
  { name: "Dehradun", lat: 30.3, lon: 78.0 },
  { name: "Imphal", lat: 24.8, lon: 93.9 },
  { name: "Shillong", lat: 25.6, lon: 91.9 },
  { name: "Agartala", lat: 23.8, lon: 91.3 },
  { name: "Itanagar", lat: 27.1, lon: 93.6 },
  { name: "Vizag", lat: 17.7, lon: 83.3 },
  { name: "Nagpur", lat: 21.1, lon: 79.1 },
  { name: "Indore", lat: 22.7, lon: 75.9 },
  { name: "Trivandrum", lat: 8.5, lon: 77.0 },
];

const MAP_CONNS: [number, number][] = [
  [0, 14], [0, 1], [14, 1], [14, 19], [19, 1], [1, 2], [1, 3], [1, 11], [2, 5], [2, 26], [5, 4], [5, 26], [4, 6], [4, 25], [6, 7], [7, 8], [7, 9], [7, 24], [7, 17], [8, 13], [8, 9], [8, 27], [10, 12], [10, 15], [10, 18], [3, 12], [3, 18], [12, 18], [11, 17], [11, 25], [17, 16], [16, 9], [16, 24], [1, 19],
  [15, 21], [21, 20], [21, 22], [20, 23], [22, 20], [15, 23],
  [13, 27],
];

const TRADER_PAYOUTS = [
  { name: "Rahul S.", city: 1, amount: "₹1,25,000", time: "2 min ago" },
  { name: "Priya M.", city: 4, amount: "₹87,500", time: "5 min ago" },
  { name: "Amit K.", city: 10, amount: "₹2,50,000", time: "8 min ago" },
  { name: "Sneha R.", city: 8, amount: "₹65,000", time: "12 min ago" },
  { name: "Vikram P.", city: 7, amount: "₹1,50,000", time: "15 min ago" },
  { name: "Ananya D.", city: 9, amount: "₹92,000", time: "18 min ago" },
  { name: "Rohan T.", city: 2, amount: "₹45,000", time: "22 min ago" },
  { name: "Meera J.", city: 5, amount: "₹1,10,000", time: "25 min ago" },
  { name: "Karan B.", city: 12, amount: "₹3,20,000", time: "30 min ago" },
  { name: "Divya N.", city: 14, amount: "₹78,000", time: "35 min ago" },
  { name: "Arjun G.", city: 0, amount: "₹55,000", time: "40 min ago" },
  { name: "Pooja L.", city: 13, amount: "₹1,80,000", time: "45 min ago" },
  { name: "Nikhil W.", city: 25, amount: "₹2,10,000", time: "48 min ago" },
  { name: "Swati C.", city: 16, amount: "₹68,000", time: "52 min ago" },
  { name: "Manish V.", city: 3, amount: "₹95,000", time: "55 min ago" },
  { name: "Ritu A.", city: 15, amount: "₹1,35,000", time: "1 hr ago" },
  { name: "Saurabh H.", city: 17, amount: "₹42,000", time: "1 hr ago" },
  { name: "Neha F.", city: 6, amount: "₹1,75,000", time: "1 hr ago" },
  { name: "Deepak Y.", city: 18, amount: "₹88,000", time: "2 hrs ago" },
  { name: "Kavita E.", city: 11, amount: "₹3,50,000", time: "2 hrs ago" },
];

const HeroIndiaMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [popupOpacity, setPopupOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPopupOpacity(0);
      setTimeout(() => {
        setActiveIdx((p) => (p + 1) % TRADER_PAYOUTS.length);
        setPopupOpacity(1);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = 860, H = 920;
    c.width = W * 2; c.height = H * 2;
    ctx.scale(2, 2);

    const img = new Image();
    img.src = "/india-map.png";
    imgRef.current = img;

    const imgPad = { left: 20, top: 5, right: 20, bottom: 5 };
    const mapLatMin = 5.5, mapLatMax = 37.5, mapLonMin = 67, mapLonMax = 98;

    function toXY(lat: number, lon: number) {
      const x = imgPad.left + ((lon - mapLonMin) / (mapLonMax - mapLonMin)) * (W - imgPad.left - imgPad.right);
      const y = imgPad.top + ((mapLatMax - lat) / (mapLatMax - mapLatMin)) * (H - imgPad.top - imgPad.bottom);
      return { x, y };
    }

    let ready = false;
    img.onload = () => { ready = true; };

    let currentHighlight = 0;

    function draw() {
      const t = performance.now() / 1000;
      ctx.clearRect(0, 0, W, H);

      if (ready && imgRef.current) {
        ctx.drawImage(imgRef.current, 0, 0, W, H);
      }

      const pulse = (t * 1.2) % 1;
      currentHighlight = Math.floor(t / 3) % TRADER_PAYOUTS.length;
      const highlightCity = TRADER_PAYOUTS[currentHighlight].city;

      for (const [a, b] of MAP_CONNS) {
        const ca = MAP_CITIES[a], cb = MAP_CITIES[b];
        const pa = toXY(ca.lat, ca.lon), pb = toXY(cb.lat, cb.lon);
        const isHighlighted = a === highlightCity || b === highlightCity;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = isHighlighted ? "rgba(255,140,60,0.4)" : "rgba(0,180,255,0.15)";
        ctx.lineWidth = isHighlighted ? 1 : .5;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        const tp = ((t * .3 + a * .07) % 1);
        const tx = pa.x + (pb.x - pa.x) * tp;
        const ty = pa.y + (pb.y - pa.y) * tp;
        ctx.beginPath();
        ctx.arc(tx, ty, isHighlighted ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx.fillStyle = isHighlighted ? "rgba(255,180,60,0.9)" : "rgba(0,220,255,0.9)";
        ctx.fill();
      }

      for (let ci = 0; ci < MAP_CITIES.length; ci++) {
        const city = MAP_CITIES[ci];
        const { x, y } = toXY(city.lat, city.lon);
        const isActive = ci === highlightCity;

        if (isActive) {
          const ringPulse = (t * 2) % 1;
          ctx.globalAlpha = (1 - ringPulse) * .6;
          ctx.beginPath();
          ctx.arc(x, y, 5 + ringPulse * 18, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,140,60,0.8)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.globalAlpha = (1 - ringPulse) * .3;
          ctx.beginPath();
          ctx.arc(x, y, 8 + ringPulse * 25, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,140,60,0.5)";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;

          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,140,60,0.3)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#FF8A3D";
          ctx.shadowColor = "#FF8A3D";
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.fill();

          ctx.font = "bold 10px system-ui, sans-serif";
          ctx.fillStyle = "#FF8A3D";
          ctx.textAlign = city.lon > 82 ? "left" : "right";
          ctx.fillText(city.name, x + (city.lon > 82 ? 10 : -10), y - 8);
        } else {
          ctx.globalAlpha = (1 - pulse) * .3;
          ctx.beginPath();
          ctx.arc(x, y, 3 + pulse * 8, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(0,180,255,0.4)";
          ctx.lineWidth = .8;
          ctx.stroke();
          ctx.globalAlpha = 1;

          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,140,255,0.2)";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#00BFFF";
          ctx.shadowColor = "#00BFFF";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(x, y, .8, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.fill();

          ctx.font = "bold 8px system-ui, sans-serif";
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.textAlign = city.lon > 82 ? "left" : "right";
          ctx.fillText(city.name, x + (city.lon > 82 ? 7 : -7), y - 5);
        }
      }

      raf.current = requestAnimationFrame(draw);
    }
    draw();
    const vis = () => { if (document.hidden) cancelAnimationFrame(raf.current); else draw(); };
    document.addEventListener("visibilitychange", vis);
    return () => { cancelAnimationFrame(raf.current); document.removeEventListener("visibilitychange", vis); };
  }, []);

  const activePayout = TRADER_PAYOUTS[activeIdx];
  const activeCity = MAP_CITIES[activePayout.city];
  const imgPad = { left: 20, top: 5, right: 20, bottom: 5 };
  const W = 860, H = 920;
  const mapLatMin = 5.5, mapLatMax = 37.5, mapLonMin = 67, mapLonMax = 98;
  const rawPopX = imgPad.left + ((activeCity.lon - mapLonMin) / (mapLonMax - mapLonMin)) * (W - imgPad.left - imgPad.right);
  const popY = imgPad.top + ((mapLatMax - activeCity.lat) / (mapLatMax - mapLatMin)) * (H - imgPad.top - imgPad.bottom);
  const popupW = 165;
  const flipLeft = rawPopX + 12 + popupW < W;
  const popX = flipLeft
    ? Math.min(rawPopX + 12, W - popupW - 5)
    : Math.max(rawPopX - popupW, 5);

  return (
    <motion.div
      className="relative overflow-hidden"
      style={{ width: 860, height: 920 }}
      initial={{ opacity: 0, scale: 0.85, y: 40 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 70% 65% at 50% 50%, transparent 40%, #1A0030 75%)",
          zIndex: 2,
        }} />
        <motion.div
          className="absolute inset-0 pointer-events-none z-[3]"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(255,140,60,0.12) 0%, transparent 55%)",
          }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <canvas ref={canvasRef} className="block max-w-full relative z-[1]" style={{ width: 860, height: 920, mixBlendMode: "lighten" }} />
      </motion.div>
      <div
        className="absolute z-[5] pointer-events-none"
        style={{
          left: popX,
          top: popY - 36,
          opacity: popupOpacity,
          transition: "opacity 0.4s ease",
        }}
      >
        <div className="bg-[#1a0a30]/90 backdrop-blur-md border border-fw-orange/40 rounded-lg px-3 py-2 shadow-[0_0_20px_rgba(255,140,60,0.2)]" style={{ minWidth: 140 }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-fw-orange to-fw-pink flex items-center justify-center text-[8px] font-bold text-white">{activePayout.name.charAt(0)}</div>
            <span className="text-white font-bold text-xs">{activePayout.name}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-fw-orange font-extrabold text-sm">{activePayout.amount}</span>
            <span className="text-white/40 text-[9px]">{activePayout.time}</span>
          </div>
          <div className="text-white/50 text-[9px] mt-0.5">{activeCity.name} Payout</div>
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0 h-0"
          style={flipLeft ? {
            left: -5,
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderRight: "5px solid rgba(255,138,61,0.4)",
          } : {
            right: -5,
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderLeft: "5px solid rgba(255,138,61,0.4)",
          }}
        />
      </div>
    </motion.div>
  );
};

const TrophyParticles = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = 300, H = 320;
    c.width = W * 2; c.height = H * 2;
    ctx.scale(2, 2);
    const pts: { x: number; y: number; vx: number; vy: number; s: number; o: number; phase: number }[] = [];
    for (let i = 0; i < 35; i++) pts.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .4, vy: -Math.random() * .5 - .15,
      s: Math.random() * 3 + 1, o: Math.random(), phase: Math.random() * Math.PI * 2
    });
    function draw() {
      const t = performance.now() / 1000;
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy; p.o -= .002;
        if (p.o <= 0 || p.y < -10 || p.x < -10 || p.x > W + 10) {
          p.x = Math.random() * W; p.y = H + 5;
          p.o = Math.random() * .8 + .2; p.vy = -Math.random() * .5 - .15;
        }
        const flicker = .5 + Math.sin(t * 3 + p.phase) * .5;
        ctx.save();
        ctx.globalAlpha = p.o * flicker * .7;
        ctx.translate(p.x, p.y);
        ctx.rotate(t * 1.5 + p.phase);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.s);
        g.addColorStop(0, "#FFFDE0");
        g.addColorStop(.4, "#FFD54F");
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath();
        for (let j = 0; j < 4; j++) {
          const a = (j / 4) * Math.PI * 2;
          ctx.lineTo(Math.cos(a) * p.s, Math.sin(a) * p.s);
          const mid = a + Math.PI / 4;
          ctx.lineTo(Math.cos(mid) * p.s * .35, Math.sin(mid) * p.s * .35);
        }
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      raf.current = requestAnimationFrame(draw);
    }
    draw();
    const vis = () => { if (document.hidden) cancelAnimationFrame(raf.current); else draw(); };
    document.addEventListener("visibilitychange", vis);
    return () => { cancelAnimationFrame(raf.current); document.removeEventListener("visibilitychange", vis); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%", zIndex: 2 }} />;
};

const MiniTrophy = () => (
  <div className="trophy-float-anim relative flex items-center justify-center overflow-visible" style={{ width: 320, height: 360, background: "transparent", border: "none", boxShadow: "none" }}>
    {/* Outer glow halo */}
    <div
      className="absolute inset-0 rounded-full"
      style={{
        background: "radial-gradient(circle at 50% 45%, rgba(168,85,247,0.4) 0%, rgba(249,115,22,0.2) 35%, transparent 70%)",
        filter: "blur(40px)",
        animation: "trophyHalo 3.5s ease-in-out infinite",
      }}
    />
    {/* Pulsing ring */}
    <div
      className="absolute"
      style={{
        width: 260,
        height: 260,
        borderRadius: "50%",
        border: "1px solid rgba(168,85,247,0.3)",
        boxShadow: "0 0 60px rgba(168,85,247,0.3), inset 0 0 40px rgba(249,115,22,0.15)",
        animation: "trophyHalo 4.5s ease-in-out infinite reverse",
      }}
    />

    {/* Trophy Image — requires transparent PNG */}
    <img
      src="/fw-trophy.png"
      alt="FundedWealth Championship Trophy"
      className="relative z-[2] object-contain"
      style={{
        width: 300,
        height: "auto",
        background: "transparent",
        border: "none",
        boxShadow: "none",
        filter: "drop-shadow(0 0 20px rgba(168,85,247,0.7)) drop-shadow(0 0 40px rgba(249,115,22,0.5))",
      }}
    />

    <TrophyParticles />
  </div>
);

// --- COMPONENTS ---

const Particles = () => {
  return (
    <div className="particles-container">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 20 + 10}px`,
            height: `${Math.random() * 20 + 10}px`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${Math.random() * 10 + 10}s`
          }}
        />
      ))}
    </div>
  );
};

const AnnouncementBar = () => {
  const indices = [
    { name: "NIFTY 50", price: "24,856.50", change: "+0.72%", up: true },
    { name: "BANKNIFTY", price: "53,412.80", change: "+0.58%", up: true },
    { name: "SENSEX", price: "81,648.20", change: "+0.65%", up: true },
    { name: "FINNIFTY", price: "24,120.35", change: "-0.18%", up: false },
    { name: "NIFTY IT", price: "42,380.10", change: "+1.12%", up: true },
    { name: "NIFTY BANK", price: "53,412.80", change: "+0.58%", up: true },
    { name: "MIDCAP 50", price: "16,245.60", change: "+0.34%", up: true },
    { name: "INDIA VIX", price: "13.42", change: "-2.85%", up: false },
  ];

  const tickerContent = indices.map((idx, i) => (
    <span key={i} className="inline-flex items-center gap-2 mx-6">
      <span className="text-white/90 font-semibold text-xs">{idx.name}</span>
      <span className="text-white font-bold text-xs">{idx.price}</span>
      <span className={`text-xs font-bold ${idx.up ? "text-emerald-400" : "text-red-400"}`}>
        {idx.up ? "▲" : "▼"} {idx.change}
      </span>
    </span>
  ));

  return (
    <div className="bg-[#0a0018] border-b border-white/5 py-2 overflow-hidden whitespace-nowrap relative z-50">
      <div className="animate-marquee inline-block">
        {tickerContent}
        {tickerContent}
      </div>
    </div>
  );
};

const DiscountBar = () => {
  const offers = [
    { code: "Flash", discount: "60% OFF", label: "Flash Funding" },
    { code: "Instant", discount: "55% OFF", label: "Instant Funding" },
    { code: "FW", discount: "65% OFF", label: "1-Step Evaluation" },
    { code: "FW", discount: "70% OFF", label: "2-Step Evaluation" },
  ];

  const content = offers.map((o, i) => (
    <span key={i} className="inline-flex items-center gap-3 mx-8">
      <span className="text-white font-extrabold text-sm tracking-tight">{o.discount}</span>
      <span className="text-white/60 text-xs font-medium">{o.label}</span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 border border-white/15">
        <span className="text-[10px] text-white/50 uppercase tracking-wider font-medium">Code:</span>
        <span className="text-xs text-fw-orange font-bold tracking-wide">{o.code}</span>
      </span>
    </span>
  ));

  return (
    <div className="bg-[#060012] border-b border-white/5 py-2 overflow-hidden whitespace-nowrap relative z-50">
      <div className="animate-marquee-slow inline-block">
        {content}
        {content}
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const [, navigate] = useLocation();
  const { t, i18n } = useTranslation();
  const switchLang = (lng: string) => { i18n.changeLanguage(lng); localStorage.setItem("fw-lang", lng); };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="sticky top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0F0020] via-[#1A0030] to-[#0F0020] border-b border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 overflow-x-auto scrollbar-hide py-1.5">
            <button className="shrink-0 px-3 sm:px-4 py-1.5 rounded-md text-[11px] sm:text-xs font-bold bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white shadow-md flex items-center gap-1.5">
              <span></span>FundedWealth <span className="opacity-90">IND</span>
            </button>
            {[
              { label: "Forex", icon: "" },
              { label: "Crypto", icon: "₿" },
              { label: "Futures", icon: "" },
            ].map((t) => (
              <button
                key={t.label}
                disabled
                title="Coming Soon"
                className="shrink-0 px-3 sm:px-4 py-1.5 rounded-md text-[11px] sm:text-xs font-medium text-white/50 hover:text-white/70 transition-colors flex items-center gap-1.5 cursor-not-allowed"
              >
                <span>{t.icon}</span>
                FundedWealth <span className="opacity-90">{t.label}</span>
                <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">Soon</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <header className={`sticky top-[34px] sm:top-[36px] left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-3' : 'bg-[#1A0030]/85 backdrop-blur-md border-b border-white/10 py-4'}`}>
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="FundedWealth" className="h-10 w-10 rounded-lg" />
            <span className="text-lg font-heading font-bold text-white tracking-tight hidden sm:inline xl:hidden 2xl:inline">Funded<span className="text-gradient">Wealth</span></span>
          </Link>

          <nav className="hidden xl:flex items-center gap-2 2xl:gap-3.5 ml-4 2xl:ml-6">
            <a href="#home" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">Home</a>
            <a href="#plans" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">Plans</a>
            <Link href="/leaderboard" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">Leaderboard</Link>
            <Link href="/scaling" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">Scaling</Link>
            <Link href="/impact" className="text-xs 2xl:text-sm font-medium text-pink-400 hover:text-pink-300 transition-colors whitespace-nowrap">FW Impact</Link>
            <Link href="/payouts" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">Payouts</Link>
            <Link href="/rules" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">Rules</Link>
            <Link href="/blog" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">Blog</Link>
            <Link href="/success-stories" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">Stories</Link>
            <Link href="/community" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">Community</Link>
            <Link href="/championship" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">Championship</Link>
            <a href="#affiliate" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">Affiliate</a>
            <a href="/faq" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">FAQ</a>
            <a href="#contact" className="text-xs 2xl:text-sm font-medium text-white/80 hover:text-white transition-colors whitespace-nowrap">Contact</a>
          </nav>

          <div className="hidden xl:flex items-center gap-3">
            {isSignedIn ? (
              <Button variant="ghost" onClick={() => navigate("/dashboard")}
                className="text-white hover:text-white hover:bg-white/10 rounded-full px-6">
                {t("nav.dashboard")}
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => navigate("/sign-in")}
                className="text-white hover:text-white hover:bg-white/10 rounded-full px-6">
                {t("nav.signIn")}
              </Button>
            )}
            <Button onClick={() => navigate(isSignedIn ? "/checkout" : "/sign-in")}
              className="bg-gradient-fw text-white border-0 rounded-full px-6 font-bold shadow-lg shadow-fw-pink/20 hover:shadow-fw-pink/40 transition-all">
              Get Funded
            </Button>
          </div>

          <button className="xl:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden bg-[#1A0030] border-b border-white/10"
            >
              <div className="flex flex-col px-6 py-4 gap-4">
                <a href="#home" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>Home</a>
                <a href="#plans" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>Plans</a>
                <Link href="/leaderboard" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>Leaderboard</Link>
                <Link href="/scaling" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>Scaling Plan</Link>
                <Link href="/payouts" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>Payout Proofs</Link>
                <Link href="/rules" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>Trading Rules</Link>
                <Link href="/blog" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                <Link href="/success-stories" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>Success Stories</Link>
                <Link href="/community" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>Community</Link>
                <Link href="/impact" className="text-lg font-medium text-pink-400" onClick={() => setMobileMenuOpen(false)}>FW Impact Initiative</Link>
                <Link href="/championship" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>Championship</Link>
                <a href="#affiliate" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>Affiliate</a>
                <a href="/faq" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                <a href="#contact" className="text-lg font-medium text-white/80" onClick={() => setMobileMenuOpen(false)}>Contact</a>
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
                  <Button variant="outline" onClick={() => { navigate(isSignedIn ? "/dashboard" : "/sign-in"); setMobileMenuOpen(false); }}
                    className="w-full justify-center border-white/20 text-white">
                    {isSignedIn ? "Dashboard" : "Login"}
                  </Button>
                  <Button onClick={() => { navigate(isSignedIn ? "/checkout" : "/sign-in"); setMobileMenuOpen(false); }}
                    className="w-full justify-center bg-gradient-fw text-white border-0 font-bold">
                    Get Funded
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

const HeroChampionshipPopup = () => {
  const leaders = [
    { rank: 1, name: "Aarav K.", profit: "+₹4.82L", city: "Mumbai", medal: "from-yellow-300 to-amber-500" },
    { rank: 2, name: "Ishita R.", profit: "+₹3.65L", city: "Delhi", medal: "from-slate-200 to-slate-400" },
    { rank: 3, name: "Vikram S.", profit: "+₹3.11L", city: "Bengaluru", medal: "from-amber-600 to-orange-700" },
    { rank: 4, name: "Meera J.", profit: "+₹2.74L", city: "Pune", medal: "from-fw-pink to-fw-purple" },
  ];
  const [idx, setIdx] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setIdx((p) => (p + 1) % leaders.length);
        setOpacity(1);
      }, 350);
    }, 3500);
    return () => clearInterval(id);
  }, [leaders.length]);

  const l = leaders[idx];
  return (
    <motion.div
      className="absolute z-[6]"
      style={{ left: 12, top: 18 }}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.6 }}
    >
      <Link
        href="/championship"
        className="block bg-[#1a0a30]/90 backdrop-blur-md border border-fw-pink/40 rounded-xl px-3 py-2.5 shadow-[0_0_24px_rgba(214,51,132,0.25)] cursor-pointer hover:border-fw-pink hover:shadow-[0_0_32px_rgba(214,51,132,0.5)] hover:-translate-y-0.5 transition-all"
        style={{ minWidth: 180, transition: "opacity 0.35s ease, transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease", opacity }}
        aria-label="View FW Championship"
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <Trophy className="w-3 h-3 text-fw-pink" />
          <span className="text-[9px] font-extrabold text-fw-pink uppercase tracking-wider">FW Championship</span>
          <span className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[8px] text-white/60 font-bold uppercase">Live</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${l.medal} flex items-center justify-center text-[10px] font-extrabold text-[#1a0a30] shadow-md`}>
            #{l.rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-xs truncate">{l.name}</div>
            <div className="text-white/50 text-[9px]">{l.city}</div>
          </div>
          <div className="text-right">
            <div className="text-emerald-400 font-extrabold text-xs leading-tight">{l.profit}</div>
            <div className="text-white/40 text-[8px]">P&L</div>
          </div>
        </div>
        <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between">
          <span className="text-white/50 text-[9px]">Prize pool</span>
          <span className="text-fw-orange font-extrabold text-[10px]">₹25,00,000</span>
        </div>
      </Link>
    </motion.div>
  );
};

const Hero = () => {
  const [, navigate] = useLocation();
  return (
    <section id="home" className="relative bg-[#03000A] overflow-hidden min-h-[94vh] flex items-start justify-center pt-16 lg:pt-20">
      <IndiaTraderNetworkHero />

      {/* Extra shooting stars & sparkle particles */}
      <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden">
        {/* Diagonal shooting stars — like meteors from top-right to bottom-left */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angles = [-25, -35, -20, -30, -40, -22, -28, -33, -18, -38, -27, -32];
          const tops = [5, 12, 20, 8, 35, 15, 45, 25, 55, 10, 40, 30];
          const rights = [10, 25, 5, 40, 15, 55, 30, 45, 20, 60, 35, 50];
          const durs = [2.5, 3.2, 4, 2.8, 3.5, 4.2, 3, 3.8, 2.6, 4.5, 3.3, 2.9];
          const delays = [0, 1.2, 2.5, 0.5, 3.2, 1.8, 4, 0.8, 2, 3.8, 1.5, 2.8];
          const widths = [80, 60, 100, 50, 70, 90, 55, 75, 65, 85, 45, 95];
          const colors = ["#fbbf24", "#4dd4ff", "#D93AA0", "#ff8a3d", "#AB18C2", "#ffffff", "#ff6b9d", "#00e5ff", "#fbbf24", "#D93AA0", "#4dd4ff", "#ff8a3d"];
          const heights = [2, 1.5, 2.5, 1.5, 2, 1, 2, 1.5, 2.5, 1, 2, 1.5];
          return (
            <div
              key={`shoot-${i}`}
              className="absolute"
              style={{
                top: `${tops[i]}%`,
                right: `${rights[i]}%`,
                width: widths[i],
                height: heights[i],
                background: `linear-gradient(to left, transparent 0%, ${colors[i]} 30%, ${colors[i]}88 60%, transparent 100%)`,
                borderRadius: 4,
                opacity: 0,
                transform: `rotate(${angles[i]}deg)`,
                animation: `homeShootDiag ${durs[i]}s linear infinite`,
                animationDelay: `${delays[i]}s`,
                boxShadow: `0 0 6px ${colors[i]}80, 0 0 12px ${colors[i]}40`,
              }}
            />
          );
        })}

        {/* Twinkling star particles */}
        {Array.from({ length: 20 }).map((_, i) => {
          const starColors = ["#fbbf24", "#ffffff", "#4dd4ff", "#D93AA0", "#ff8a3d"];
          const color = starColors[i % starColors.length];
          const size = 3 + (i % 4) * 2;
          const left = (i * 5 + 2) % 96;
          const top = (i * 4.8 + 3) % 92;
          const dur = 2 + (i % 5) * 1.5;
          const delay = (i * 0.5) % 6;
          return (
            <div
              key={`twinkle-${i}`}
              className="absolute"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                animation: `homeTwinkle ${dur}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
              }}
            >
              <svg viewBox="0 0 24 24" width={size} height={size} fill={color} opacity={0.5}>
                <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5Z" />
              </svg>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-20 w-full">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8">
          <div className="flex flex-col items-center text-center">

            {/* Top badge */}
            <div className="mb-3 inline-flex items-center gap-3 text-white/90 text-sm md:text-base font-bold tracking-wide">
              <span className="text-lg">🇮🇳</span>
              <span><BulgeText text="INDIA'S " /><BulgeText text="#1" className="text-fw-orange" /><BulgeText text=" PROP TRADING FIRM" /></span>
            </div>

            {/* Subtitle line */}
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px w-8 bg-white/20" />
              <span className="text-white/50 text-xs md:text-sm italic tracking-widest font-medium">
                <BulgeText text="The Future of Indian Trader" radius={100} strength={0.4} />
              </span>
              <div className="h-px w-8 bg-white/20" />
            </div>


            {/* Main headline */}
            <h1 className="font-black tracking-[-0.04em] leading-[0.88] text-white text-3xl sm:text-4xl md:text-5xl lg:text-[56px] uppercase hero-color-cycle">
              <BulgeText text="TRADE SMARTER." radius={150} strength={0.6} /><br />
              <BulgeText text="GET FUNDED." radius={150} strength={0.6} />
            </h1>

            {/* Gradient sub-headline */}
            <h2 className="mt-2 font-black tracking-[-0.04em] leading-[0.9] text-xl sm:text-2xl md:text-3xl lg:text-4xl uppercase bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500 bg-clip-text text-transparent">
              <BulgeText text="KEEP 90% OF YOUR PROFITS." radius={140} strength={0.55} />
            </h2>

            {/* Description block */}
            <div className="mt-6 max-w-[700px] space-y-4 text-white/85 text-lg md:text-xl leading-relaxed">
              <p>
                Access up to <span className="text-white font-bold">₹50L</span> of firm capital.
              </p>
              <p>
                Trade Indian market Index F&O :<br />
                <span className="text-white font-bold tracking-wide">
                  <BulgeText text="NIFTY • BANKNIFTY • SENSEX • FINNIFTY" radius={120} strength={0.45} />
                </span>
              </p>
              <p>
                Equities :<br />
                <span className="text-white font-bold tracking-wide">
                  <BulgeText text="NIFTY 500 • Stock Futures." radius={120} strength={0.45} />
                </span>
              </p>
              <p className="pt-4 text-white font-bold text-base md:text-lg">
                Turn your trading discipline into income.<br />
                Access a simulated <span className="text-fw-orange font-extrabold not-italic">₹50 Lakhs</span> through FundedWealth Firm and<br />
                get paid for your <span className="text-blue-400 font-extrabold not-italic">risk management expertise</span> without using your own money.
              </p>
            </div>

            {/* CTA Buttons — Liquid Glass */}
            <div className="mt-10 flex items-center justify-center gap-6 sm:gap-10 flex-wrap">

              {/* 1. GET FUNDED NOW — Liquid Sunset Glass */}
              <button
                onClick={() => navigate("/checkout")}
                className="group relative rounded-full px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-extrabold text-white uppercase tracking-wider overflow-hidden transition-all duration-300 hover:-translate-y-1.5 active:translate-y-0.5 active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, rgba(255,106,61,0.18) 0%, rgba(255,0,128,0.14) 100%)",
                  backdropFilter: "blur(24px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(24px) saturate(1.8)",
                  border: "1px solid rgba(255,106,61,0.35)",
                  boxShadow: "0 0 24px rgba(255,106,61,0.25), 0 0 60px rgba(255,0,128,0.15), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,106,61,0.15)",
                }}
              >
                {/* Top gloss reflection */}
                <div className="absolute inset-x-0 top-0 h-[45%] rounded-t-full pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)" }} />
                {/* Hover glow fill */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,106,61,0.22) 0%, rgba(255,0,128,0.18) 100%)", boxShadow: "inset 0 0 30px rgba(255,106,61,0.1)" }} />
                {/* Ambient glow behind button */}
                <div className="absolute inset-0 rounded-full -z-10 blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(255,106,61,0.4) 0%, rgba(255,0,128,0.25) 60%, transparent 100%)", transform: "scale(1.3) translateY(6px)" }} />
                <span className="relative flex items-center gap-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  <Zap className="w-5 h-5 text-orange-300" />
                  <BulgeText text="GET FUNDED NOW" radius={100} strength={0.5} />
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>

              {/* 2. WATCH DEMO — Liquid Cosmic Violet Glass */}
              <a
                href="https://www.youtube.com/@FundedWealth"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-full px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-extrabold text-white uppercase tracking-wider overflow-hidden transition-all duration-300 hover:-translate-y-1.5 active:translate-y-0.5 active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, rgba(140,80,255,0.18) 0%, rgba(90,0,255,0.14) 100%)",
                  backdropFilter: "blur(24px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(24px) saturate(1.8)",
                  border: "1px solid rgba(140,80,255,0.35)",
                  boxShadow: "0 0 24px rgba(140,80,255,0.25), 0 0 60px rgba(90,0,255,0.15), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(140,80,255,0.15)",
                }}
              >
                {/* Top gloss reflection */}
                <div className="absolute inset-x-0 top-0 h-[45%] rounded-t-full pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)" }} />
                {/* Hover glow fill */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(140,80,255,0.22) 0%, rgba(90,0,255,0.18) 100%)", boxShadow: "inset 0 0 30px rgba(140,80,255,0.1)" }} />
                {/* Ambient glow behind button */}
                <div className="absolute inset-0 rounded-full -z-10 blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(140,80,255,0.4) 0%, rgba(90,0,255,0.25) 60%, transparent 100%)", transform: "scale(1.3) translateY(6px)" }} />
                <span className="relative flex items-center gap-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  <svg className="w-5 h-5 text-violet-300" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  <BulgeText text="WATCH DEMO" radius={100} strength={0.5} />
                </span>
              </a>

              {/* 3. TRADING RULES — Liquid Neon Blue Glass */}
              <Link href="/rules">
                <button
                  className="group relative rounded-full px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-extrabold text-white uppercase tracking-wider overflow-hidden transition-all duration-300 hover:-translate-y-1.5 active:translate-y-0.5 active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(135deg, rgba(0,180,255,0.18) 0%, rgba(90,80,255,0.14) 100%)",
                    backdropFilter: "blur(24px) saturate(1.8)",
                    WebkitBackdropFilter: "blur(24px) saturate(1.8)",
                    border: "1px solid rgba(0,180,255,0.35)",
                    boxShadow: "0 0 24px rgba(0,180,255,0.25), 0 0 60px rgba(90,80,255,0.15), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,180,255,0.15)",
                  }}
                >
                  {/* Top gloss reflection */}
                  <div className="absolute inset-x-0 top-0 h-[45%] rounded-t-full pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)" }} />
                  {/* Hover glow fill */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(0,180,255,0.22) 0%, rgba(90,80,255,0.18) 100%)", boxShadow: "inset 0 0 30px rgba(0,180,255,0.1)" }} />
                  {/* Ambient glow behind button */}
                  <div className="absolute inset-0 rounded-full -z-10 blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(0,180,255,0.4) 0%, rgba(90,80,255,0.25) 60%, transparent 100%)", transform: "scale(1.3) translateY(6px)" }} />
                  <span className="relative flex items-center gap-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                    <FileText className="w-5 h-5 text-cyan-300" />
                    <BulgeText text="TRADING RULES" radius={100} strength={0.5} />
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </Link>

              {/* 4. FREE TRIAL ACCOUNT — Liquid Emerald Glass */}
              <button
                onClick={() => navigate("/sign-up?trial=true")}
                className="group relative rounded-full px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-extrabold text-white uppercase tracking-wider overflow-hidden transition-all duration-300 hover:-translate-y-1.5 active:translate-y-0.5 active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.14) 100%)",
                  backdropFilter: "blur(24px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(24px) saturate(1.8)",
                  border: "1px solid rgba(16,185,129,0.35)",
                  boxShadow: "0 0 24px rgba(16,185,129,0.25), 0 0 60px rgba(5,150,105,0.15), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(16,185,129,0.15)",
                }}
              >
                <div className="absolute inset-x-0 top-0 h-[45%] rounded-t-full pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)" }} />
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.22) 0%, rgba(5,150,105,0.18) 100%)", boxShadow: "inset 0 0 30px rgba(16,185,129,0.1)" }} />
                <div className="absolute inset-0 rounded-full -z-10 blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.4) 0%, rgba(5,150,105,0.25) 60%, transparent 100%)", transform: "scale(1.3) translateY(6px)" }} />
                <span className="relative flex items-center gap-2.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  <Users className="w-5 h-5 text-emerald-300" />
                  <BulgeText text="FREE TRIAL ACCOUNT" radius={100} strength={0.5} />
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>

            </div>

          </div>
        </div>
      </div>

      {/* Color cycle animation + shooting stars */}
      <style>{`
        .hero-color-cycle {
          animation: _colorCycle 8s ease-in-out infinite;
        }
        @keyframes _colorCycle {
          0%, 100% { color: #ffffff; }
          25% { color: #D93AA0; }
          50% { color: #AB18C2; }
          75% { color: #4dd4ff; }
        }
        @keyframes _glassLightSweep {
          0%   { transform: translateX(-120%); opacity: 0; }
          10%  { opacity: 1; }
          60%  { opacity: 0.8; }
          100% { transform: translateX(180%); opacity: 0; }
        }
        /* Glass tab — inner overlay + gloss shown when active */        [data-state=active] .glass-tab-overlay { opacity: 1 !important; }
        [data-state=active] .glass-tab-gloss   { opacity: 1 !important; }
        /* Remove Radix default active bg */
        [role=tablist] [data-state=active] { background: transparent !important; box-shadow: none !important; }
        @keyframes homeShootDiag {
          0% { transform: translate(0, 0) rotate(var(--angle, -30deg)); opacity: 0; }
          5% { opacity: 0.9; }
          60% { opacity: 0.7; }
          100% { transform: translate(-120vw, 80vh) rotate(var(--angle, -30deg)); opacity: 0; }
        }
        @keyframes homeShootingStar {
          0% { left: -10%; opacity: 0; }
          5% { opacity: 0.8; }
          70% { opacity: 0.6; }
          100% { left: 115%; opacity: 0; }
        }
        @keyframes homeTwinkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.2; }
          25% { transform: scale(1.4) rotate(20deg); opacity: 0.7; }
          50% { transform: scale(0.7) rotate(-10deg); opacity: 0.3; }
          75% { transform: scale(1.2) rotate(10deg); opacity: 0.6; }
        }
      `}</style>
    </section>
  );
};

const Stats = () => {
  return (
    <section className="py-12 border-y border-white/10 bg-black/20 backdrop-blur-sm relative z-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-5xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fw-orange to-fw-pink mb-2">₹45 Lakhs+</div>
            <div className="text-sm font-semibold text-white/70 uppercase tracking-wider">Payouts Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-5xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fw-pink to-fw-purple mb-2">15,000+</div>
            <div className="text-sm font-semibold text-white/70 uppercase tracking-wider">Funded Traders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-5xl font-heading font-extrabold text-white mb-2">12 HRS</div>
            <div className="text-sm font-semibold text-white/70 uppercase tracking-wider">Guaranteed Payout</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl md:text-5xl font-heading font-extrabold text-white mb-2">70%-90%</div>
            <div className="text-sm font-semibold text-white/70 uppercase tracking-wider">Max Profit Split</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const IndianInstruments = () => {
  const indexFO = [
    { name: "NIFTY", desc: "Nifty 50 Options & Futures", color: "from-orange-500 to-red-500" },
    { name: "BANKNIFTY", desc: "Bank Nifty Options & Futures", color: "from-blue-500 to-indigo-600" },
    { name: "SENSEX", desc: "BSE Sensex Options & Futures", color: "from-purple-500 to-pink-500" },
    { name: "FINNIFTY", desc: "Financial Services Index", color: "from-emerald-500 to-teal-600" },
  ];
  const equities = [
    { name: "NIFTY 500", desc: "Top 500 Indian Equities (Cash)", icon: "" },
    { name: "Stock Futures", desc: "F&O on NSE Stocks", icon: "" },
  ];
  return (
    <section id="instruments" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-2"></div>
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
            100% Indian Markets
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            What You Can <span className="text-gradient">Trade</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            FundedWealth IND is built exclusively for Indian markets. Trade Index F&O and Equities on real NSE/BSE price feeds in INR.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-white font-bold text-lg uppercase tracking-wider">Index F&O</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {indexFO.map((i) => (
              <div key={i.name} className="group relative rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 hover:border-white/20 transition-all overflow-hidden">
                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${i.color} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity`} />
                <div className={`inline-block px-2.5 py-1 rounded-md bg-gradient-to-r ${i.color} text-white text-[10px] font-bold uppercase tracking-wider mb-3 shadow-lg`}>F&O</div>
                <h4 className="text-white font-extrabold text-lg mb-1">{i.name}</h4>
                <p className="text-white/50 text-xs">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-white font-bold text-lg uppercase tracking-wider">Equities</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equities.map((e) => (
              <div key={e.name} className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 hover:border-white/20 transition-all flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A00E0]/30 to-[#8E2DE2]/30 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0">{e.icon}</div>
                <div>
                  <h4 className="text-white font-extrabold text-lg">{e.name}</h4>
                  <p className="text-white/50 text-xs">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 border border-amber-500/20 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-3xl"></div>
          <div className="flex-1">
            <div className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">Coming Soon — Same Brand, Separate Verticals</div>
            <p className="text-white/70 text-sm">
              <strong className="text-white">FundedWealth Forex</strong>, <strong className="text-white">FundedWealth Crypto</strong> and <strong className="text-white">FundedWealth Futures</strong> launching as dedicated platforms. Same trust, global markets.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-bold"> Forex</span>
            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-bold">₿ Crypto</span>
            <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-bold"> Futures</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const FWIndEdge = () => {
  const edges = [
    { icon: <Building2 className="w-6 h-6" />, title: "SEBI-Regulated Brokers", desc: "All settlement partners are SEBI-licensed Indian brokerages — your funded payouts move through compliant rails.", color: "from-blue-500 to-cyan-500" },
    { icon: <BarChart3 className="w-6 h-6" />, title: "Real NSE/BSE Price Feeds", desc: "Trade on live NSE & BSE tick data — exactly the same prices a retail trader sees on their broker terminal.", color: "from-emerald-500 to-teal-500" },
    { icon: <Banknote className="w-6 h-6" />, title: "INR Pricing · UPI Payouts", desc: "Pay in ₹, get paid in ₹. UPI / IMPS / NEFT direct to your bank — no FX, no intermediary, no delay.", color: "from-orange-500 to-amber-500" },
    { icon: <Zap className="w-6 h-6" />, title: "Lightning-Fast Execution", desc: "Sub-100ms order routing on real NSE/BSE feeds — slippage and freezes kept to absolute minimum.", color: "from-purple-500 to-pink-500" },
    { icon: <ShieldCheck className="w-6 h-6" />, title: "AI Risk Coach™", desc: "Built-in discipline scoring monitors your every trade — overleveraging, revenge trading, drawdown breaches flagged in real time.", color: "from-rose-500 to-red-500" },
    { icon: <Lock className="w-6 h-6" />, title: "Full Transparency", desc: "Simulated evaluation environment with real market data. Every rule, fee, and payout published upfront. No surprises.", color: "from-indigo-500 to-violet-500" },
  ];
  return (
    <section id="ind-edge" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-1"></div>
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-bold uppercase tracking-wider mb-4">
            The FundedWealth IND Edge
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            Built For <span className="text-gradient">Indian Traders</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Every feature engineered for the Indian market — from SEBI-regulated rails to UPI payouts to NSE/BSE feeds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {edges.map((e) => (
            <div key={e.title} className="group relative rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6 hover:border-white/20 hover:bg-white/[0.05] transition-all overflow-hidden">
              <div className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br ${e.color} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity`} />
              <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${e.color} text-white mb-4 shadow-lg`}>
                {e.icon}
              </div>
              <h3 className="text-white font-extrabold text-lg mb-2">{e.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const AIRiskCoach = () => {
  const features = [
    { label: "Discipline Score", value: "92/100", color: "text-emerald-400" },
    { label: "Risk Level", value: "Healthy", color: "text-emerald-400" },
    { label: "Today's Drawdown", value: "1.2%", color: "text-amber-400" },
    { label: "Position Size", value: "Optimal", color: "text-emerald-400" },
  ];
  const alerts = [
    { type: "info", icon: "", text: "Average win/loss ratio improved 18% this week" },
    { type: "warning", icon: "⚠∩╕Å", text: "Consecutive losses detected — pause suggested" },
    { type: "success", icon: "✅", text: "Daily loss limit respected for 7 days straight" },
  ];
  return (
    <section id="ai-risk" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-2"></div>
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider mb-4">
              AI Risk Coach™
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Your Personal <span className="text-gradient">Trading Discipline</span> Engine
            </h2>
            <p className="text-white/60 mb-6 leading-relaxed">
              Most traders fail not from bad strategy, but from broken discipline. Our AI Risk Coach watches every trade in real time — flagging overleveraging, revenge trading, drawdown breaches, and emotional patterns before they cost you the account.
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "Real-time discipline score based on your behaviour",
                "Pre-trade warnings when risk thresholds are about to break",
                "Daily/weekly behavioural reports — improve over time",
                "Free for all funded traders — no add-on fee",
              ].map((p) => (
                <li key={p} className="flex items-start gap-3 text-white/80 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active on every funded account
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-[#1A0030] via-[#0F0020] to-black border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold">AI</div>
                <div>
                  <div className="text-white font-bold text-sm">Risk Coach Dashboard</div>
                  <div className="text-white/40 text-[10px]">Live · Last updated 2s ago</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                MONITORING
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {features.map((f) => (
                <div key={f.label} className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
                  <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{f.label}</div>
                  <div className={`font-extrabold text-xl ${f.color}`}>{f.value}</div>
                </div>
              ))}
            </div>

            <div className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Recent Insights</div>
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className={`px-3 py-2.5 rounded-lg border flex items-start gap-2.5 text-xs ${a.type === "warning" ? "bg-amber-500/5 border-amber-500/20 text-amber-200" :
                  a.type === "success" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-200" :
                    "bg-blue-500/5 border-blue-500/20 text-blue-200"
                  }`}>
                  <span>{a.icon}</span>
                  <span className="leading-snug">{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorksIND = () => {
  const steps = [
    {
      num: "01",
      icon: <Users className="w-5 h-5" />,
      iconBg: "from-blue-500 to-indigo-600",
      title: "Sign Up & Choose Program",
      desc: "Create your profile and enrol in a challenge plan. Get started in minutes with our simple onboarding flow.",
      visual: (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-4">
          <div className="h-2.5 rounded-full bg-white/10 mb-2.5 w-3/4" />
          <div className="h-2.5 rounded-full bg-white/10 mb-3 w-1/2" />
          <div className="bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white text-[11px] font-bold rounded-lg py-2 text-center">
            Begin Assessment →
          </div>
        </div>
      ),
    },
    {
      num: "02",
      icon: <BarChart3 className="w-5 h-5" />,
      iconBg: "from-violet-500 to-purple-600",
      title: "Complete Risk Assessment",
      desc: "Trade with simulated capital on real NSE/BSE feeds. Hit your profit target while respecting drawdown limits to qualify.",
      visual: (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-4 flex items-center justify-center">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="42" stroke="url(#scoreGrad)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${(8.5 / 10) * 264} 264`} />
              <defs>
                <linearGradient id="scoreGrad" x1="0" x2="1">
                  <stop offset="0%" stopColor="#4A00E0" />
                  <stop offset="100%" stopColor="#D63384" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-white font-extrabold text-base leading-none">8.5/10</div>
              <div className="text-white/50 text-[9px] mt-0.5">Discipline</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: "03",
      icon: <Trophy className="w-5 h-5" />,
      iconBg: "from-amber-500 to-orange-600",
      title: "Get Allocated",
      desc: "Once you pass, you're allocated a funded account. You're now trading FundedWealth's capital — not your own savings.",
      visual: (
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6 mt-4 flex items-center justify-center">
          <Trophy className="w-14 h-14 text-amber-400" strokeWidth={1.5} />
        </div>
      ),
    },
    {
      num: "04",
      icon: <Banknote className="w-5 h-5" />,
      iconBg: "from-emerald-500 to-teal-600",
      title: "Performance Share",
      desc: "You trade, we take the risk. Keep 70-90% of profits. Withdraw via UPI / IMPS / NEFT every 7 days.",
      visual: (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mt-4 space-y-1.5">
          {["+₹25,000", "+₹50,000", "+₹75,000"].map((v) => (
            <div key={v} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
              <div className="h-1 flex-1 rounded-full bg-emerald-500/30" />
              <div className="text-emerald-300 font-bold text-[11px]">{v}</div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works-ind" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-1"></div>
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider mb-4">
            The Roadmap
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Follow this simple roadmap to become a funded trader. From sign up to payout — the journey is straightforward and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div key={s.num} className="relative rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 hover:border-white/20 hover:bg-white/[0.05] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="text-5xl font-extrabold text-white/10 leading-none">{s.num}</div>
                <div className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br ${s.iconBg} text-white shadow-lg`}>
                  {s.icon}
                </div>
              </div>
              <h3 className="text-white font-extrabold text-base mb-2 leading-tight">{s.title}</h3>
              <p className="text-white/55 text-xs leading-relaxed">{s.desc}</p>
              {s.visual}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/checkout">
            <Button className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl h-12 px-8 font-bold shadow-lg hover:shadow-purple-500/30 transition-all">
              Start Your Assessment <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const PayoutsMadeSimple = () => {
  const steps = [
    { num: "01", icon: <CheckCircle2 className="w-5 h-5" />, iconBg: "from-blue-500 to-indigo-600", title: "Pass Assessment", desc: "Complete your evaluation phase(s) and meet all objectives.", time: "30-45 days" },
    { num: "02", icon: <TrendingUp className="w-5 h-5" />, iconBg: "from-slate-600 to-slate-800", title: "Get Funded", desc: "Receive your funded account within 24 hours of passing.", time: "< 24 hours" },
    { num: "03", icon: <Banknote className="w-5 h-5" />, iconBg: "from-emerald-500 to-green-600", title: "Trade & Earn", desc: "Start trading with real allocated capital and track your profits.", time: "Weekly cycle" },
    { num: "04", icon: <CreditCard className="w-5 h-5" />, iconBg: "from-blue-500 to-cyan-600", title: "Request Payout", desc: "Submit payout requests via your dashboard — UPI / IMPS / NEFT.", time: "Every 7 days" },
  ];
  return (
    <section id="payouts-simple" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-3"></div>
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Payouts <span className="text-gradient">Made Simple</span>
            </h2>
            <p className="text-white/60 mb-6 leading-relaxed">
              Fast, transparent, and generous profit splits designed for Indian traders. Get paid for your trading skills — without the capital risk.
            </p>
            <Link href="/checkout">
              <Button className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl h-12 px-7 font-bold shadow-lg hover:shadow-purple-500/30">
                Start Earning Today <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-[#0a0e1a] border border-white/10 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-white/50 text-[11px] font-mono">latest_payout.json</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400/70 text-[10px]">LIVE</span>
                </div>
              </div>
              <pre className="px-5 py-4 text-[12px] leading-relaxed font-mono text-emerald-300/90 overflow-x-auto">
                {`{
  "status": "success",
  "amount": "₹8,50,000",
  "trader": "Arjun K.",
  "payout_id": "po_1N3k8sL",
  "timestamp": "2026-04-15T10:30:00Z",
  "method": "UPI Transfer",
  "processed_in": "12 hours"
}`}
              </pre>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl px-4 py-2.5 flex items-center gap-2.5 border border-emerald-200">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-emerald-600 text-[9px] font-bold tracking-widest">STATUS</div>
                <div className="text-slate-900 font-extrabold text-xs leading-tight">Payout Processed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-extrabold text-white">How Payouts Work</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div key={s.num} className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${s.iconBg} text-white shadow-lg`}>
                  {s.icon}
                </div>
                <div className="text-4xl font-extrabold text-white/10 leading-none">{s.num}</div>
              </div>
              <h4 className="text-white font-extrabold text-base mb-2">{s.title}</h4>
              <p className="text-white/55 text-xs leading-relaxed mb-4">{s.desc}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-medium">
                <Clock size={11} /> {s.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyTradersLoveUs = () => {
  const cards = [
    { icon: <Clock className="w-7 h-7" />, iconBg: "bg-blue-500/10", iconColor: "text-blue-400", title: "Fast Payouts", desc: "Payouts processed every 7 days — UPI/IMPS direct to your bank.", badge: "WEEKLY CYCLE", badgeColor: "text-blue-400" },
    { icon: <CreditCard className="w-7 h-7" />, iconBg: "bg-slate-500/10", iconColor: "text-slate-300", title: "Streamlined Process", desc: "Request and track payouts easily right from your dashboard.", badge: "SIMPLE & TRANSPARENT", badgeColor: "text-slate-300" },
    { icon: <BarChart3 className="w-7 h-7" />, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-400", title: "90% Profit Split", desc: "Keep up to 90% of every rupee you earn — industry leading split.", badge: "INDUSTRY LEADING", badgeColor: "text-emerald-400" },
  ];
  return (
    <section id="why-love-us" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-1"></div>
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            Why Traders <span className="text-gradient">Love Us</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((c) => (
            <div key={c.title} className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-7 hover:border-white/20 hover:bg-white/[0.05] transition-all text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${c.iconBg} ${c.iconColor} mb-5`}>
                {c.icon}
              </div>
              <h3 className="text-white font-extrabold text-xl mb-2">{c.title}</h3>
              <div className={`text-[10px] font-extrabold tracking-[0.2em] mb-3 ${c.badgeColor}`}>{c.badge}</div>
              <p className="text-white/55 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PayoutCertificates = () => {
  const certs = [
    { name: "ROHIT CHAWLA", amount: "₹1,56,000", date: "14-01-2026" },
    { name: "KUNAL SINGAL", amount: "₹1,12,000", date: "30-01-2026" },
    { name: "PRIYA SHARMA", amount: "₹2,80,000", date: "14-01-2026" },
    { name: "MEERA JOSHI", amount: "₹3,10,000", date: "26-12-2025" },
    { name: "RAJESH PATEL", amount: "₹1,95,000", date: "17-12-2025" },
    { name: "ISHANT GUPTA", amount: "₹89,500", date: "08-12-2025" },
    { name: "AARTI VERMA", amount: "₹2,15,000", date: "02-12-2025" },
    { name: "VIKRAM SINGH", amount: "₹1,38,500", date: "25-11-2025" },
  ];

  const Certificate = ({ name, amount, date }: { name: string; amount: string; date: string }) => (
    <div className="min-w-[260px] shrink-0 rounded-2xl bg-gradient-to-br from-[#0B1B5A] via-[#0F2078] to-[#1430A8] border border-blue-400/30 p-5 shadow-[0_8px_30px_rgba(20,48,168,0.4)] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute top-3 right-3 opacity-30">
        <ShieldCheck className="w-6 h-6 text-cyan-200" />
      </div>
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-300 to-blue-500 flex items-center justify-center">
            <BadgeCheck className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-[8px] tracking-[0.18em] text-cyan-200/80 font-bold">FUNDEDWEALTH IND</div>
        </div>
        <div className="text-cyan-100 text-[10px] tracking-[0.22em] font-bold mb-3">PAYOUT CERTIFICATE</div>
        <div className="text-white/50 text-[9px] uppercase tracking-wider mb-1">Awarded To</div>
        <div className="text-white font-extrabold text-lg leading-tight mb-3 truncate">{name}</div>
        <div className="text-white/40 text-[9px] mb-3 leading-snug">In recognition of your successful trading performance</div>
        <div className="bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent font-extrabold text-2xl mb-2">
          {amount}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="text-white/50 text-[9px]">{date}</div>
          <div className="text-white/40 text-[9px] font-mono tracking-wider">FW{Math.random().toString(36).slice(2, 8).toUpperCase()}</div>
        </div>
      </div>
    </div>
  );

  return (
    <section id="payout-certificates" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-2"></div>
      <div className="container mx-auto px-4 md:px-6 relative mb-8">
        <div className="text-center">
          <div className="text-emerald-300 text-[11px] tracking-[0.25em] font-bold mb-3">VERIFIED PAYOUTS</div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            Real Traders. <span className="text-gradient">Real Profits.</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Join the network of funded traders who have already received their payouts from FundedWealth IND.
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0B0020] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0B0020] to-transparent z-10 pointer-events-none" />
        <div className="flex gap-4 animate-marquee-slow" style={{ width: "max-content" }}>
          {[...certs, ...certs].map((c, i) => (
            <Certificate key={i} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TechAndBenefits = () => {
  const cards = [
    {
      title: "The Discipline Score",
      desc: "We measure adherence to rules, not just P&L. Our algorithm scores your discipline based on every trade you take.",
      iconBg: "bg-violet-500",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2"><path d="M12 14l3-3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
      visual: (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4 flex flex-col items-center">
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="9" fill="none" />
              <circle cx="50" cy="50" r="42" stroke="url(#discGrad)" strokeWidth="9" fill="none" strokeLinecap="round" strokeDasharray={`${(9.5 / 10) * 264} 264`} />
              <defs>
                <linearGradient id="discGrad" x1="0" x2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-white font-extrabold text-xl leading-none">9.5</div>
              <div className="text-white/40 text-[9px] mt-0.5">/10</div>
            </div>
          </div>
          <div className="text-white/60 text-[11px] mt-2 font-medium">Discipline Score</div>
        </div>
      ),
    },
    {
      title: "AI Risk Guard™",
      desc: "Real-time risk monitoring algorithms and trackers that predict drawdown risk before it happens — protecting your capital allocation.",
      iconBg: "bg-blue-500",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
      ),
      visual: (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-white/50 text-[10px] font-bold tracking-wider">LIVE RISK</div>
            <div className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[9px] font-bold">STABLE</div>
          </div>
          <svg viewBox="0 0 200 60" className="w-full h-16">
            <defs>
              <linearGradient id="riskGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,40 L20,35 L40,38 L60,30 L80,32 L100,25 L120,28 L140,20 L160,23 L180,15 L200,18 L200,60 L0,60 Z" fill="url(#riskGrad)" />
            <path d="M0,40 L20,35 L40,38 L60,30 L80,32 L100,25 L120,28 L140,20 L160,23 L180,15 L200,18" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="text-center text-white/40 text-[10px] mt-1">AI Risk Guard™</div>
        </div>
      ),
    },
    {
      title: "Smart Journaling",
      desc: "Trade rationale logging. We're developing AI to analyze your journals and identify psychological leaks in your strategy.",
      iconBg: "bg-orange-500",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0012 4.5 2.5 2.5 0 0014.5 2 2.5 2.5 0 0017 4.5V8a3 3 0 01-3 3h-1m-3-9A2.5 2.5 0 007 4.5 2.5 2.5 0 014.5 7 2.5 2.5 0 002 9.5V13a3 3 0 003 3h2v3a3 3 0 003 3h4a3 3 0 003-3v-2" /></svg>
      ),
      visual: (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
          <div className="text-white/50 text-[10px] font-bold tracking-wider mb-2">TODAY'S LOG</div>
          <div className="h-2 rounded-full bg-white/10 mb-1.5 w-full" />
          <div className="h-2 rounded-full bg-white/10 mb-3 w-2/3" />
          <div className="flex gap-2">
            <span className="px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-300 text-[10px] font-bold">Plan</span>
            <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 text-[10px] font-bold">Emotion</span>
          </div>
        </div>
      ),
    },
    {
      title: "Generous Trading Windows",
      desc: "Take your time to prove your skills with ample assessment periods. Trade at your own pace without feeling rushed.",
      iconBg: "bg-blue-500",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
      ),
      visual: (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
          <div className="text-white/50 text-[10px] font-bold tracking-wider mb-2">ASSESSMENT WINDOW</div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className={`aspect-square rounded ${[6, 7, 12].includes(i) ? "bg-blue-500/40" : "bg-white/10"}`} />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Competitive Brokerage & Leverage",
      desc: "Trade Indian stocks with zero brokerage rates and competitive leverage matching the best Indian brokers.",
      iconBg: "bg-pink-500",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>
      ),
      visual: (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-4 flex flex-col items-center">
          <div className="text-rose-400 font-extrabold text-3xl">0%</div>
          <div className="text-white font-bold text-xs mt-1">Brokerage</div>
          <div className="text-white/40 text-[10px] mt-0.5">Competitive leverage</div>
        </div>
      ),
    },
    {
      title: "Performance-Based Rewards",
      desc: "Trade with real capital through FundedWealth's proprietary account and earn up to 90% of profits — based purely on your skill.",
      iconBg: "bg-amber-500",
      icon: <Trophy className="w-5 h-5 text-white" strokeWidth={2.5} />,
      visual: (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
          <div className="text-white/50 text-[10px] font-bold tracking-wider mb-3">PERFORMANCE REWARDS</div>
          <div className="flex items-end justify-center gap-2 h-20">
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-md bg-white/15" />
              <div className="text-white/50 text-[10px] font-bold">2</div>
            </div>
            <div className="flex flex-col items-center gap-1 relative">
              <Trophy className="w-3.5 h-3.5 text-amber-400 absolute -top-4" fill="currentColor" />
              <div className="w-10 h-16 rounded-md bg-gradient-to-t from-amber-500 to-amber-300" />
              <div className="text-white/80 text-[10px] font-bold">1</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-7 rounded-md bg-white/15" />
              <div className="text-white/50 text-[10px] font-bold">3</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="tech-benefits" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-1"></div>
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            Technology & <span className="text-gradient">Benefits</span>
          </h2>
          <p className="text-white/60 max-w-3xl mx-auto">
            Our proprietary risk management ecosystem that not only funds traders but also evaluates them using AI-driven behavioural analytics and discipline-based metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c) => (
            <div key={c.title} className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 hover:border-white/20 hover:bg-white/[0.05] transition-all">
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${c.iconBg} shadow-lg mb-4`}>
                {c.icon}
              </div>
              <h3 className="text-white font-extrabold text-lg mb-2 leading-tight">{c.title}</h3>
              <p className="text-white/55 text-xs leading-relaxed">{c.desc}</p>
              {c.visual}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/checkout">
            <Button className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-full h-12 px-8 font-bold shadow-lg hover:shadow-purple-500/30 transition-all">
              Start Your Trial <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const Championship = () => {
  return (
    <section id="championship" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-3"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fw-orange/20 border border-fw-orange/30 text-fw-orange text-sm font-bold">
                <Trophy size={16} /> MONTHLY CHAMPIONSHIP LIVE
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-bold animate-pulse">
                LIMITED SLOTS
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white mb-6">
              The FW <span className="text-gradient">Championship</span>
            </h2>

            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              Join India's #1 Prop Trading Competition. Prove your skills against the best traders in the country and win massive prizes. No evaluation needed — pure skill wins.
            </p>

            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl"></span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">1st Place — ₹10 Lakh Account</h4>
                  <p className="text-white/60">Win a ₹10L 1-Step Evaluation account + Apple MacBook + ₹30,000 cash + Certificate.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl"></span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">2nd Place — ₹5 Lakh Account</h4>
                  <p className="text-white/60">Win a ₹5L 1-Step Evaluation account + ₹20,000 cash + Certificate.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <span className="text-2xl"></span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">3rd Place — ₹2 Lakh Account</h4>
                  <p className="text-white/60">Win a ₹2L 1-Step Evaluation account + ₹9,000 cash + Certificate.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-fw-orange via-fw-pink to-fw-purple rounded-3xl transform rotate-3 blur-sm opacity-50"></div>
            <Card className="relative glass-card border-0 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-fw"></div>
              <CardContent className="p-8 md:p-12">
                {/* FWC Trophy */}
                <div className="flex justify-center mb-6 -mt-2">
                  <MiniTrophy />
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    "Instant Login After Purchase",
                    "Mega Rewards Every Month",
                    "No Hidden Rules — Pure Skill",
                    "iPhone 16 Winners Announced Weekly",
                    "Live Leaderboard Tracking"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="text-fw-pink shrink-0" size={20} />
                      <span className="text-white/80 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/championship">
                  <Button className="w-full h-14 text-lg font-bold bg-white text-[#1A0030] hover:bg-gray-200 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Join Competition Now
                  </Button>
                </Link>
                <div className="text-center mt-4 text-sm text-red-400 font-semibold animate-pulse">
                  Limited slots remaining — register now
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

const Guarantee = () => {
  return (
    <section className="py-14 bg-black/30 border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <h2 className="text-5xl md:text-7xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fw-orange to-fw-pink mb-4">
              12 HRS
            </h2>
            <h3 className="text-3xl font-bold text-white mb-6 leading-tight">
              Get Your Payout Within 12 Hours.
            </h3>
            <p className="text-white/70 text-lg mb-8">
              We know why you trade. You trade for freedom. And freedom shouldn't be locked behind a 30-day waiting period.
            </p>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-bold">
              <Clock size={20} /> AVG. DISBURSEMENT TIME — 5-7 HOURS
            </div>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            <Card className="glass-card border-white/10 sm:col-span-2">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Zap className="text-fw-orange w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Payouts Every 7 Days</h4>
                  <p className="text-white/60">No more 30-day waiting periods. Get paid your share of the profits every single week, directly to your preferred account.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <CreditCard className="text-fw-pink w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Direct to UPI/Bank</h4>
                  <p className="text-white/60 text-sm">Seamless transfers to any Indian bank account or via UPI with zero hidden conversion fees.</p>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </section>
  );
};

const INIT_STOCKS = [
  { name: "XAUUSD", base: 2342.50, change: 0.85 },
  { name: "XAGUSD", base: 27.45, change: -0.42 },
  { name: "EURUSD", base: 1.0865, change: 0.12 },
  { name: "GBPUSD", base: 1.2640, change: -0.28 },
  { name: "USDJPY", base: 154.32, change: 0.35 },
  { name: "BTCUSD", base: 67450.0, change: 1.92 },
  { name: "US30", base: 39245.5, change: 0.45 },
  { name: "NAS100", base: 17865.3, change: -0.18 },
  { name: "CRUDE", base: 78.45, change: 1.15 },
  { name: "NIFTY50", base: 22456.8, change: 0.68 },
];

const MOCK_ORDERS = [
  { id: "ORD001", symbol: "XAUUSD", type: "BUY", qty: 2, price: "$2,340.50", status: "Executed", time: "09:32 AM" },
  { id: "ORD002", symbol: "XAGUSD", type: "BUY", qty: 5, price: "$27.42", status: "Executed", time: "10:15 AM" },
  { id: "ORD003", symbol: "EURUSD", type: "SELL", qty: 1, price: "$1.0870", status: "Pending", time: "11:02 AM" },
  { id: "ORD004", symbol: "BTCUSD", type: "BUY", qty: 0.5, price: "$67,320", status: "Executed", time: "11:45 AM" },
];

const MOCK_PORTFOLIO = [
  { symbol: "XAUUSD", qty: 2, avg: "$2,340.50", ltp: "$2,342.50", pnl: "+$400", pnlPct: "+0.09%", up: true },
  { symbol: "XAGUSD", qty: 5, avg: "$27.42", ltp: "$27.45", pnl: "+$15", pnlPct: "+0.11%", up: true },
  { symbol: "BTCUSD", qty: 0.5, avg: "$67,320", ltp: "$67,450", pnl: "+$65", pnlPct: "+0.19%", up: true },
  { symbol: "EURUSD", qty: 1, avg: "$1.0870", ltp: "$1.0865", pnl: "-$5", pnlPct: "-0.05%", up: false },
];

type Candle = { o: number; h: number; l: number; c: number };

let trendDir = 1;
let trendLen = 0;

const genCandle = (prev: number): Candle => {
  if (trendLen <= 0) {
    trendDir = Math.random() > 0.45 ? 1 : -1;
    trendLen = Math.floor(Math.random() * 8) + 3;
  }
  trendLen--;

  const momentum = trendDir * (Math.random() * 1.8 + 0.2);
  const noise = (Math.random() - 0.5) * 3.0;
  const bodySize = Math.abs(momentum + noise);

  const o = prev;
  const direction = momentum + noise > 0 ? 1 : -1;
  const c = o + direction * bodySize;

  const isDoji = Math.random() < 0.12;
  const finalC = isDoji ? o + (Math.random() - 0.5) * 0.3 : c;

  const upperWick = Math.random() * Math.random() * 4.0 + 0.1;
  const lowerWick = Math.random() * Math.random() * 4.0 + 0.1;
  const h = Math.max(o, finalC) + upperWick;
  const l = Math.min(o, finalC) - lowerWick;

  return { o, h, l, c: finalC };
};

const TerminalChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const candlesRef = useRef<Candle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    if (candlesRef.current.length === 0) {
      let price = 2335;
      for (let i = 0; i < 80; i++) {
        const candle = genCandle(price);
        candlesRef.current.push(candle);
        price = candle.c;
      }
    }

    const draw = () => {
      const candles = candlesRef.current;
      const allVals = candles.flatMap(c => [c.h, c.l]);
      const min = Math.min(...allVals) - 15;
      const max = Math.max(...allVals) + 15;
      const range = max - min || 1;
      const toY = (v: number) => h - ((v - min) / range) * (h - 20);

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < 6; i++) {
        const val = min + (i / 5) * range;
        const y = toY(val);
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(val.toFixed(2), w - 4, y - 3);
      }

      const candleW = Math.max(4, (w - 50) / candles.length - 1);
      const gap = 1;

      candles.forEach((c, i) => {
        const x = 10 + i * (candleW + gap);
        const bull = c.c >= c.o;
        const bodyTop = toY(Math.max(c.o, c.c));
        const bodyBot = toY(Math.min(c.o, c.c));
        const bodyH = Math.max(bodyBot - bodyTop, 1);

        ctx.strokeStyle = bull ? "#22c55e" : "#ef4444";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + candleW / 2, toY(c.h));
        ctx.lineTo(x + candleW / 2, bodyTop);
        ctx.moveTo(x + candleW / 2, bodyBot);
        ctx.lineTo(x + candleW / 2, toY(c.l));
        ctx.stroke();

        ctx.fillStyle = bull ? "#22c55e" : "#ef4444";
        ctx.fillRect(x, bodyTop, candleW, bodyH);
      });

      const lastCandle = candles[candles.length - 1];
      const lastPrice = lastCandle.c;
      const lastY = toY(lastPrice);
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = "rgba(255,138,61,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, lastY);
      ctx.lineTo(w, lastY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#FF8A3D";
      ctx.fillRect(w - 52, lastY - 9, 48, 18);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(lastPrice.toFixed(2), w - 28, lastY + 4);
    };

    draw();

    const interval = setInterval(() => {
      const candles = candlesRef.current;
      const lastClose = candles[candles.length - 1].c;
      candles.push(genCandle(lastClose));
      if (candles.length > 80) candles.shift();
      draw();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

const TerminalMockup = () => {
  const [tab, setTab] = useState<"dashboard" | "stats" | "traders">("dashboard");

  const TABS = [
    { id: "dashboard" as const, label: "MY DASHBOARD", icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: "stats" as const, label: "MY STATS", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: "traders" as const, label: "MY TOP TRADERS", icon: <Users className="w-3.5 h-3.5" /> },
  ];

  const stats = [
    { value: "24/7", label: "AI Analytics", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7"><path d="M9.5 2A2.5 2.5 0 0012 4.5 2.5 2.5 0 0014.5 2 2.5 2.5 0 0117 4.5V8a3 3 0 01-3 3h-1m-3-9A2.5 2.5 0 007 4.5 2.5 2.5 0 014.5 7 2.5 2.5 0 002 9.5V13a3 3 0 003 3h2v3a3 3 0 003 3h4a3 3 0 003-3v-2" /></svg>) },
    { value: "10+", label: "Live Charts", icon: <BarChart3 className="w-7 h-7" /> },
    { value: "Real-Time", label: "Risk Metrics", icon: <ShieldCheck className="w-7 h-7" /> },
    { value: "Advanced", label: "Trade Filters", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>) },
  ];

  const TerminalFrame = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl bg-gradient-to-br from-[#0F1729] to-[#0A0F1F] border border-white/10 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/30">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>
        <div className="text-white/40 text-[10px] font-mono">FundedWealth Terminal</div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  const dashboardVisual = (
    <TerminalFrame>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-md bg-white/95 h-7 px-2 flex items-center">
            <div className="h-2 rounded-full bg-blue-200 w-3/4" />
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-white/95 p-4">
        <div className="flex items-end justify-between gap-2 h-28">
          {[60, 45, 75, 50, 85, 90, 65, 78].map((h, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-blue-600 to-cyan-400" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </TerminalFrame>
  );

  const statsVisual = (
    <TerminalFrame>
      <div className="rounded-lg bg-white/95 p-4 mb-3 h-32 flex items-center justify-center">
        <svg viewBox="0 0 200 80" className="w-full h-full">
          <defs>
            <linearGradient id="termLine" x1="0" x2="1">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <path d="M10,65 Q50,55 100,40 T190,15" stroke="url(#termLine)" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-md bg-white/95 h-7 px-2 flex items-center">
            <div className="h-2 rounded-full bg-violet-200 w-2/3" />
          </div>
        ))}
      </div>
    </TerminalFrame>
  );

  const tradersVisual = (
    <TerminalFrame>
      <div className="space-y-2">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-lg bg-white/95 px-3 py-2.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-1.5 rounded-full bg-slate-300 w-3/4" />
              <div className="h-1.5 rounded-full bg-slate-200 w-1/2" />
            </div>
            <div className="w-10 h-5 rounded-full bg-emerald-200" />
          </div>
        ))}
      </div>
    </TerminalFrame>
  );

  const PANELS = {
    dashboard: {
      visual: dashboardVisual,
      heading: "CUSTOM DASHBOARD VIEW",
      tagline: "BUILT FOR THE GREATEST OF ALL TIME",
      desc: "Providing a sustainable and reliable service is our priority. We are backed by our own in-house technology built for Indian markets.",
      features: [
        { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9.5 2A2.5 2.5 0 0012 4.5 2.5 2.5 0 0014.5 2 2.5 2.5 0 0117 4.5V8a3 3 0 01-3 3h-1m-3-9A2.5 2.5 0 007 4.5 2.5 2.5 0 014.5 7 2.5 2.5 0 002 9.5V13a3 3 0 003 3h2v3a3 3 0 003 3h4a3 3 0 003-3v-2" /></svg>), label: "AI-Powered Analytics" },
        { icon: <TrendingUp className="w-4 h-4" />, label: "Real-Time Monitoring" },
        { icon: <ShieldCheck className="w-4 h-4" />, label: "Live Risk Metrics" },
        { icon: <Zap className="w-4 h-4" />, label: "Instant Insights" },
      ],
      iconBg: "bg-blue-500",
    },
    stats: {
      visual: statsVisual,
      heading: "VIEW ALL YOUR TRADING STATS",
      tagline: "TRACK, ANALYZE & OPTIMIZE YOUR PERFORMANCE",
      desc: "Comprehensive analytics with real-time equity curves, performance histograms, and advanced charts to help you understand your trading patterns and improve your strategy.",
      features: [
        { icon: <BarChart3 className="w-4 h-4" />, label: "10+ Advanced Charts" },
        { icon: <TrendingUp className="w-4 h-4" />, label: "Equity Curve Analysis" },
        { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M3 3v18h18M7 14l4-4 4 4 5-5" /></svg>), label: "Performance Histograms" },
        { icon: <Zap className="w-4 h-4" />, label: "Deep Insights" },
      ],
      iconBg: "bg-violet-500",
    },
    traders: {
      visual: tradersVisual,
      heading: "SEE YOUR TOP TRADES",
      tagline: "DISCOVER YOUR WINNING EDGE & REPLICATE SUCCESS",
      desc: "Identify your best performing trades with advanced filters and live analysis. Understand what works and scale your winning strategies for consistent profitability.",
      features: [
        { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>), label: "Advanced Filters" },
        { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>), label: "Live Performance" },
        { icon: <TrendingUp className="w-4 h-4" />, label: "Best Trade Analysis" },
        { icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="3" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /><path d="M14.5 9.5L17 7M9.5 14.5L7 17" /></svg>), label: "Winning Patterns" },
      ],
      iconBg: "bg-orange-500",
    },
  } as const;

  const panel = PANELS[tab];

  return (
    <section id="terminal" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-2"></div>
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            FundedWealth <span className="text-gradient">Trading Terminal</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Experience the most advanced in-house trading terminal with AI-powered insights, real-time analytics, and comprehensive risk management.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider transition-all border ${tab === t.id
                ? "bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white border-transparent shadow-lg shadow-purple-500/30"
                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-10"
          >
            <div>{panel.visual}</div>
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight">{panel.heading}</h3>
              <div className="h-1 w-12 rounded-full bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] mb-5" />
              <div className="text-white font-bold text-sm tracking-wider mb-3">{panel.tagline}</div>
              <p className="text-white/55 text-xs uppercase tracking-wider mb-6 leading-relaxed">{panel.desc}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {panel.features.map(f => (
                  <div key={f.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                    <div className={`w-8 h-8 rounded-lg ${panel.iconBg} text-white flex items-center justify-center shrink-0`}>
                      {f.icon}
                    </div>
                    <div className="text-white font-semibold text-sm">{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 text-center hover:border-white/20 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 mb-3">
                {s.icon}
              </div>
              <div className="text-white font-extrabold text-xl mb-1">{s.value}</div>
              <div className="text-white/55 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const LivePayouts = () => {
  const payouts = [
    { name: "Rohan S.", amount: "₹58,200", time: "2 mins ago", initial: "RS", color: "from-orange-500 to-pink-500", state: "Maharashtra" },
    { name: "Vikram N.", amount: "₹1,55,000", time: "15 mins ago", initial: "VN", color: "from-violet-500 to-purple-700", state: "Delhi" },
    { name: "Aman J.", amount: "₹21,000", time: "1 hr ago", initial: "AJ", color: "from-cyan-500 to-blue-600", state: "Punjab" },
    { name: "Sandeep P.", amount: "₹65,000", time: "2 hrs ago", initial: "SP", color: "from-green-500 to-teal-600", state: "Karnataka" },
    { name: "Neha G.", amount: "₹62,000", time: "3 hrs ago", initial: "NG", color: "from-pink-500 to-rose-600", state: "Gujarat" },
    { name: "Priya M.", amount: "₹88,500", time: "5 hrs ago", initial: "PM", color: "from-amber-500 to-orange-600", state: "Tamil Nadu" },
    { name: "Karan T.", amount: "₹1,20,000", time: "7 hrs ago", initial: "KT", color: "from-blue-500 to-indigo-600", state: "Rajasthan" },
    { name: "Divya R.", amount: "₹10,000", time: "8 hrs ago", initial: "DR", color: "from-fuchsia-500 to-pink-600", state: "Uttar Pradesh" },
    { name: "Suresh K.", amount: "₹5,000", time: "9 hrs ago", initial: "SK", color: "from-lime-500 to-green-600", state: "West Bengal" },
    { name: "Meera P.", amount: "₹25,000", time: "10 hrs ago", initial: "MP", color: "from-yellow-500 to-amber-600", state: "Madhya Pradesh" },
    { name: "Aditya V.", amount: "₹40,000", time: "11 hrs ago", initial: "AV", color: "from-red-500 to-orange-600", state: "Telangana" },
    { name: "Tanya S.", amount: "₹75,000", time: "12 hrs ago", initial: "TS", color: "from-sky-500 to-cyan-600", state: "Kerala" },
    { name: "Rahul B.", amount: "₹90,000", time: "13 hrs ago", initial: "RB", color: "from-purple-500 to-violet-600", state: "Bihar" },
    { name: "Anjali D.", amount: "₹15,500", time: "14 hrs ago", initial: "AD", color: "from-rose-500 to-pink-600", state: "Haryana" },
    { name: "Nikhil M.", amount: "₹32,000", time: "16 hrs ago", initial: "NM", color: "from-teal-500 to-green-600", state: "Odisha" },
    { name: "Pooja L.", amount: "₹48,000", time: "17 hrs ago", initial: "PL", color: "from-indigo-500 to-blue-600", state: "Jharkhand" },
    { name: "Arjun D.", amount: "₹1,10,000", time: "18 hrs ago", initial: "AD", color: "from-emerald-500 to-teal-600", state: "Andhra Pradesh" },
    { name: "Sneha R.", amount: "₹27,500", time: "19 hrs ago", initial: "SR", color: "from-pink-400 to-fuchsia-600", state: "Chhattisgarh" },
    { name: "Manish K.", amount: "₹95,000", time: "20 hrs ago", initial: "MK", color: "from-orange-400 to-red-600", state: "Uttarakhand" },
    { name: "Ritu S.", amount: "₹18,000", time: "22 hrs ago", initial: "RS", color: "from-cyan-400 to-teal-500", state: "Assam" },
    { name: "Deepak V.", amount: "₹72,000", time: "1 day ago", initial: "DV", color: "from-violet-400 to-purple-600", state: "Goa" },
    { name: "Kavita N.", amount: "₹35,000", time: "1 day ago", initial: "KN", color: "from-amber-400 to-yellow-600", state: "Himachal Pradesh" },
    { name: "Sanjay B.", amount: "₹53,000", time: "1 day ago", initial: "SB", color: "from-blue-400 to-cyan-600", state: "Jammu & Kashmir" },
    { name: "Anita P.", amount: "₹1,45,000", time: "1 day ago", initial: "AP", color: "from-red-400 to-rose-600", state: "Sikkim" },
    { name: "Vijay G.", amount: "₹8,500", time: "2 days ago", initial: "VG", color: "from-green-400 to-emerald-600", state: "Meghalaya" },
  ];

  return (
    <section id="live-payouts" className="py-12 bg-[#1A0030]">
      <div className="container mx-auto px-4 mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-3">
          Last 100 Payouts <span className="text-fw-orange">(LIVE)</span>
        </h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Real traders. Real money. India's most transparent prop firm — where every payout is visible.
        </p>
      </div>

      <div className="relative w-full overflow-hidden mb-10">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#1A0030] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#1A0030] to-transparent z-10 pointer-events-none"></div>

        <div className="flex gap-4 animate-marquee-slow" style={{ width: "max-content" }}>
          {[...payouts, ...payouts].map((payout, i) => (
            <Card key={i} className="min-w-[260px] glass-card border-white/10 shrink-0">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${payout.color} flex items-center justify-center text-white font-bold text-sm border border-white/20 shrink-0`}>
                  {payout.initial}
                </div>
                <div>
                  <div className="text-white/80 font-medium text-sm">{payout.name}</div>
                  <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                    {payout.amount}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/50 text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{payout.state}</span>
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <Clock size={10} /> {payout.time}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <LivePayoutTable />

    </section>
  );
};

const PAYOUT_NAMES = [
  "Rahul S.", "Priya M.", "Amit K.", "Sneha R.", "Vikram P.", "Ananya D.", "Rohan T.", "Meera J.",
  "Karan B.", "Divya N.", "Arjun G.", "Pooja L.", "Nikhil W.", "Swati C.", "Manish V.", "Ritu A.",
  "Saurabh H.", "Neha F.", "Deepak Y.", "Kavita E.", "Tanya S.", "Aditya V.", "Anjali D.", "Vijay G.",
  "Suresh K.", "Sandeep P.", "Aman J.", "Sanjay B.", "Anita P.", "Nisha T.", "Rajesh M.", "Simran K.",
  "Harish D.", "Lakshmi R.", "Gaurav S.", "Bhavna P.", "Mohit L.", "Jyoti A.", "Sachin V.", "Rekha B.",
  "Pankaj N.", "Shweta G.", "Vivek C.", "Pallavi H.", "Ashish J.", "Komal F.", "Tushar W.", "Sonali E.",
  "Ramesh Y.", "Geeta D.",
];

function generateHash(): string {
  const chars = "0123456789abcdef";
  let h = "";
  for (let i = 0; i < 40; i++) h += chars[Math.floor(Math.random() * 16)];
  return h.slice(0, 8) + "..." + h.slice(-6);
}

function generatePayoutRows(count: number) {
  const now = new Date();
  const rows: { date: string; hash: string; amount: string; amountNum: number }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getTime() - i * (12 + Math.random() * 30) * 60 * 1000);
    const dateStr = d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" }) + ", " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    const r = Math.random();
    let amt: number;
    if (r < 0.15) amt = [2500, 3000, 3500, 4000, 4500, 5000][Math.floor(Math.random() * 6)];
    else if (r < 0.35) amt = [7500, 8000, 10000, 12000, 15000][Math.floor(Math.random() * 5)];
    else if (r < 0.55) amt = [18000, 21000, 25000, 28000, 32000, 35000][Math.floor(Math.random() * 6)];
    else if (r < 0.75) amt = [38000, 42000, 45000, 48000, 52000, 55000, 58000][Math.floor(Math.random() * 7)];
    else if (r < 0.9) amt = [62000, 68000, 74000, 78000, 85000, 92000, 95000][Math.floor(Math.random() * 7)];
    else amt = [110000, 125000, 150000, 175000, 210000, 250000, 320000, 350000][Math.floor(Math.random() * 8)];
    rows.push({
      date: dateStr,
      hash: generateHash(),
      amount: "₹" + amt.toLocaleString("en-IN"),
      amountNum: amt,
    });
  }
  return rows;
}

const LivePayoutChart = ({ data }: { data: { amountNum: number }[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width = c.offsetWidth * 2;
    const H = c.height = c.offsetHeight * 2;
    ctx.scale(2, 2);
    const w = W / 2, h = H / 2;

    const amounts = data.slice(0, 30).map(d => d.amountNum).reverse();
    const max = Math.max(...amounts) * 1.1;
    const min = Math.min(...amounts) * 0.9;
    const range = max - min || 1;

    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255,138,61,0.25)");
    grad.addColorStop(1, "rgba(255,138,61,0)");

    const points: { x: number; y: number }[] = [];
    const padX = 10, padY = 15;
    for (let i = 0; i < amounts.length; i++) {
      const x = padX + (i / (amounts.length - 1)) * (w - padX * 2);
      const y = padY + (1 - (amounts[i] - min) / range) * (h - padY * 2);
      points.push({ x, y });
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y);
    }
    ctx.strokeStyle = "#FF8A3D";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.lineTo(points[points.length - 1].x, h);
    ctx.lineTo(points[0].x, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#FF8A3D";
    ctx.shadowColor = "#FF8A3D";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [data]);

  return <canvas ref={canvasRef} className="w-full" style={{ height: 120 }} />;
};

const LivePayoutTable = () => {
  const [rows, setRows] = useState(() => generatePayoutRows(100));

  useEffect(() => {
    const interval = setInterval(() => {
      setRows(prev => {
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "2-digit" }) + ", " +
          now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        const r = Math.random();
        let amt: number;
        if (r < 0.15) amt = [2500, 3000, 3500, 4000, 4500, 5000][Math.floor(Math.random() * 6)];
        else if (r < 0.35) amt = [7500, 8000, 10000, 12000, 15000][Math.floor(Math.random() * 5)];
        else if (r < 0.55) amt = [18000, 21000, 25000, 28000, 32000, 35000][Math.floor(Math.random() * 6)];
        else if (r < 0.75) amt = [38000, 42000, 45000, 48000, 52000, 55000, 58000][Math.floor(Math.random() * 7)];
        else if (r < 0.9) amt = [62000, 68000, 74000, 78000, 85000, 92000, 95000][Math.floor(Math.random() * 7)];
        else amt = [110000, 125000, 150000, 175000, 210000, 250000, 320000, 350000][Math.floor(Math.random() * 8)];
        const newRow = {
          date: dateStr,
          hash: generateHash(),
          amount: "₹" + amt.toLocaleString("en-IN"),
          amountNum: amt,
        };
        return [newRow, ...prev.slice(0, 99)];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white font-bold text-sm">Real-Time Payout Transactions</span>
            </div>
            <span className="text-white/40 text-xs">Auto-updates every 5s</span>
          </div>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-6 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Transaction Hash</th>
                  <th className="text-right px-6 py-3 text-xs font-bold text-white/60 uppercase tracking-wider">Payout</th>
                </tr>
              </thead>
            </table>
            <div className="overflow-y-auto max-h-[420px] no-scrollbar">
              <table className="w-full">
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className={`border-b border-white/5 transition-colors hover:bg-white/5 ${i === 0 ? "animate-in fade-in slide-in-from-top-2 duration-500 bg-fw-orange/5" : ""}`}>
                      <td className="px-6 py-3 text-sm text-white/70 whitespace-nowrap">{row.date}</td>
                      <td className="px-6 py-3">
                        <span className="text-fw-orange text-sm font-mono cursor-pointer hover:underline">{row.hash}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-green-400 font-bold text-sm">{row.amount}</span>
                        <span className="text-white/30 text-xs ml-1">INR</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-white/5">
            <span className="text-fw-orange text-xs font-semibold flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-fw-orange animate-pulse" />
              Real-Time Payout Transactions
            </span>
            <span className="text-white/30 text-xs flex items-center gap-1.5">
              <img src="/logo.png" alt="" className="w-4 h-4 rounded" />
              FundedWealth
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-card rounded-2xl border border-white/10 p-6">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-1">Total Paid Out (Last 30 Days)</div>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              ₹{(rows.reduce((a, r) => a + r.amountNum, 0) / 100000).toFixed(1)}L+
            </div>
            <div className="text-white/40 text-xs mt-1">Across {rows.length} verified transactions</div>
          </div>

          <div className="glass-card rounded-2xl border border-white/10 p-6">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-3">Payout Trend (Last 30 Transactions)</div>
            <LivePayoutChart data={rows} />
          </div>

          <div className="glass-card rounded-2xl border border-white/10 p-5">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-3">Payout Stats</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-fw-orange font-extrabold text-lg">₹{Math.max(...rows.map(r => r.amountNum)).toLocaleString("en-IN")}</div>
                <div className="text-white/40 text-[10px] uppercase">Highest Payout</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-green-400 font-extrabold text-lg">₹{Math.round(rows.reduce((a, r) => a + r.amountNum, 0) / rows.length).toLocaleString("en-IN")}</div>
                <div className="text-white/40 text-[10px] uppercase">Avg Payout</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-white font-extrabold text-lg">{rows.length}</div>
                <div className="text-white/40 text-[10px] uppercase">Total Payouts</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-fw-pink font-extrabold text-lg">12hr</div>
                <div className="text-white/40 text-[10px] uppercase">Avg Speed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Advantages = () => {
  const features = [
    { title: "Zero Restrictive Rules", desc: "No hidden rules to make you fail. Trade your strategy freely." },
    { title: "Payouts Every 7 Days", desc: "Don't wait a month for your hard-earned money. Weekly payouts standard." },
    { title: "Profit Split Up to 90%", desc: "You do the hard work, you keep the lion's share of the profits." },
    { title: "Scaling Up to ₹50 Lakh", desc: "Prove consistency and we'll scale your account capital exponentially." },
    { title: "Affiliate Program up to 15%", desc: "Earn passive income by referring other talented traders to our platform." },
    { title: "Competitive Spreads", desc: "Institutional-grade liquidity with raw spreads and low commissions." },
  ];

  return (
    <section className="py-14 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white mb-6">
            The <span className="text-gradient">FundedWealth</span> Edge
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            We built the firm we wanted to trade for. Transparent, fast, and aggressively aligned with trader success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="glass-card border-white/10 hover:border-fw-pink/50 transition-colors group">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="text-fw-pink w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{f.title}</h4>
                <p className="text-white/60 leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyChoose = () => {
  const points = [
    { num: "All", title: "NIFTY · BANKNIFTY · SENSEX · FINNIFTY · NIFTY 500", icon: <TrendingUp /> },
    { num: "7", title: "Day Payout Cycle", icon: <Clock /> },
    { num: "15%", title: "Industry-Leading Affiliate Program", icon: <Users /> },
    { num: "∞", title: "Unlimited Trading Period", icon: <Clock /> },
    { num: "Direct", title: "Payout In UPI/Bank", icon: <CreditCard /> },
    { num: "0", title: "Instant Funding Available", icon: <Zap /> },
  ];

  return (
    <section className="py-14 bg-black/40 border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {points.map((p, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 mb-4 inline-block">
                {p.num}
              </div>
              <h4 className="text-sm font-bold text-white/90 leading-tight">
                {p.title}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FLASH_RULES = [
  { title: "Payouts", value: "After 24-hour window closes", desc: "Flash accounts are live for 24 hours from your first trade. You can request one payout after the 24-hour account period ends if your best trade does not exceed 15% of your total profit and your net profit is at least 3% of your starting balance." },
  { title: "Consistency Rule", value: "15% Best Trade Rule", desc: "Your single best trade cannot exceed 15% of your total profit. This ensures consistent trading rather than relying on one lucky trade. Example: if your total profit is ₹10,000, no single trade should account for more than ₹1,500 of that profit." },
  { title: "Profit Threshold for Payout", value: "3%", desc: "You must generate at least 3% net profit on your starting balance to be eligible for a payout. Example: on a ₹1,00,000 account, you need at least ₹3,000 in net profit. On a ₹5,00,000 account, you need at least ₹15,000." },
  { title: "Daily Drawdown", value: "2%", desc: "How much you can lose in a single trading day: Don't let your losses exceed 2% of your balance to avoid losing your account. Example: with a ₹1,00,000 account, keep daily losses under ₹2,000." },
  { title: "Max Drawdown", value: "4%", desc: "How much you can lose in total: Keep your losses under 4% of your starting balance. Example: with ₹1,00,000 starting balance, your account can't drop below ₹96,000." },
  { title: "Profit Split", value: "80%", desc: "How much of your trading profits you keep: You get 80% of all profits. Example: when you make ₹1,00,000 profit — you can withdraw ₹80,000." },
  { title: "Scaling", value: "–", desc: "Flash accounts close 24 hours after the first trade and don't scale." },
  { title: "Minimum Trading Days", value: "–", desc: "No minimum trading day rule applies — your account automatically closes 24 hours after the first trade." },
  { title: "Holding Overnight", value: "Available", desc: "You can hold positions overnight as long as your 24-hour period hasn't expired." },
  { title: "Holding Over Weekends", value: "Available", desc: "Weekend holding is allowed, but positions may close automatically if the market shuts before your 24-hour account period ends. Crypto positions can remain open." },
  { title: "Leverage", value: "Varies by asset", desc: "Currencies – 1:100 · Commodities – 1:20 · Indices – 1:20 · Crypto – 1:2\n\nExample: with 1:100 leverage on currencies, you can trade positions worth ₹1,00,00,000 using ₹1,00,000 of your balance.\n\nNote: Due to increased market volatility, leverage on Metals, Oil, and Indices is temporarily set to 1:5 on funded accounts only." },
];

const FlashRuleRow = ({ rule }: { rule: typeof FLASH_RULES[0] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-6">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-white/80 font-semibold text-sm flex items-center gap-2">
          <svg className={`w-4 h-4 text-white/40 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          {rule.title}
        </span>
        <span className="text-white font-bold text-sm text-right max-w-[220px]">{rule.value}</span>
      </button>
      {open && (
        <div className="pb-4 pl-6 text-white/50 text-xs leading-relaxed whitespace-pre-line">{rule.desc}</div>
      )}
    </div>
  );
};

const FlashRulesAccordion = () => (
  <div className="max-w-3xl mx-auto glass-card rounded-2xl border border-white/10 overflow-hidden">
    <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
      <h3 className="text-white font-heading font-bold text-lg flex items-center gap-2">
        ⚡ Flash Funding Rules & Details
      </h3>
    </div>
    <div className="divide-y divide-white/5">
      {FLASH_RULES.map((rule, i) => (
        <FlashRuleRow key={i} rule={rule} />
      ))}
    </div>
  </div>
);

const Plans = () => {
  const [activeTab, setActiveTab] = useState("1step");
  const [, navigatePlans] = useLocation();

  return (
    <section id="plans" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-2 top-0 right-0"></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white mb-6">
            Choose Your <span className="text-gradient">Path to Capital</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Whether you want instant funding or prefer to prove your skills through an evaluation, we have a plan built for your style.
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full max-w-5xl mx-auto">
          <div className="flex justify-center mb-10">
            <TabsList
              className="relative h-auto rounded-2xl sm:rounded-full flex-wrap gap-1 p-1.5"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                backdropFilter: "blur(24px) saturate(1.6)",
                WebkitBackdropFilter: "blur(24px) saturate(1.6)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 4px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(0,0,0,0.3) inset",
              }}
            >
              {/* Top gloss on container */}
              <span className="absolute inset-x-0 top-0 h-[40%] rounded-t-2xl sm:rounded-t-full pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%)" }} aria-hidden="true" />

              {/* Flash ⚡ — yellow/orange active */}
              <TabsTrigger
                value="flash"
                className="relative rounded-full px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold text-white/50 transition-all duration-300 overflow-hidden
                  data-[state=active]:text-white data-[state=active]:font-bold"
                style={{ background: "transparent" }}
              >
                <span className="glass-tab-overlay absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(234,179,8,0.28) 0%, rgba(249,115,22,0.22) 100%)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(234,179,8,0.35)",
                    boxShadow: "0 0 18px rgba(234,179,8,0.3), 0 0 40px rgba(249,115,22,0.15), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(234,179,8,0.12)",
                  }}
                />
                <span className="glass-tab-gloss absolute inset-x-0 top-0 h-[45%] rounded-t-full pointer-events-none opacity-0 transition-opacity duration-300" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)" }} aria-hidden="true" />
                <span className="relative z-10">Flash ⚡</span>
              </TabsTrigger>

              {/* Instant — pink/violet active */}
              <TabsTrigger
                value="instant"
                className="relative rounded-full px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold text-white/50 transition-all duration-300 overflow-hidden
                  data-[state=active]:text-white data-[state=active]:font-bold"
                style={{ background: "transparent" }}
              >
                <span className="glass-tab-overlay absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(217,58,160,0.28) 0%, rgba(171,24,194,0.22) 100%)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(217,58,160,0.35)",
                    boxShadow: "0 0 18px rgba(217,58,160,0.3), 0 0 40px rgba(171,24,194,0.15), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(217,58,160,0.12)",
                  }}
                />
                <span className="glass-tab-gloss absolute inset-x-0 top-0 h-[45%] rounded-t-full pointer-events-none opacity-0 transition-opacity duration-300" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)" }} aria-hidden="true" />
                <span className="relative z-10">Instant</span>
              </TabsTrigger>

              {/* 1-Step — cyan/violet active */}
              <TabsTrigger
                value="1step"
                className="relative rounded-full px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold text-white/50 transition-all duration-300 overflow-hidden
                  data-[state=active]:text-white data-[state=active]:font-bold"
                style={{ background: "transparent" }}
              >
                <span className="glass-tab-overlay absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(77,212,255,0.24) 0%, rgba(168,85,247,0.20) 100%)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(77,212,255,0.30)",
                    boxShadow: "0 0 18px rgba(77,212,255,0.25), 0 0 40px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(77,212,255,0.10)",
                  }}
                />
                <span className="glass-tab-gloss absolute inset-x-0 top-0 h-[45%] rounded-t-full pointer-events-none opacity-0 transition-opacity duration-300" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)" }} aria-hidden="true" />
                <span className="relative z-10">1-Step</span>
              </TabsTrigger>

              {/* 2-Step — violet/pink active */}
              <TabsTrigger
                value="2step"
                className="relative rounded-full px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold text-white/50 transition-all duration-300 overflow-hidden
                  data-[state=active]:text-white data-[state=active]:font-bold"
                style={{ background: "transparent" }}
              >
                <span className="glass-tab-overlay absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(168,85,247,0.28) 0%, rgba(217,58,160,0.22) 100%)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(168,85,247,0.35)",
                    boxShadow: "0 0 18px rgba(168,85,247,0.3), 0 0 40px rgba(217,58,160,0.15), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(168,85,247,0.12)",
                  }}
                />
                <span className="glass-tab-gloss absolute inset-x-0 top-0 h-[45%] rounded-t-full pointer-events-none opacity-0 transition-opacity duration-300" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)" }} aria-hidden="true" />
                <span className="relative z-10">2-Step</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="flash" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
              {[
                { size: "₹50,000", origFee: "₹1,999", discFee: "₹799" },
                { size: "₹1,00,000", origFee: "₹3,499", discFee: "₹1,399" },
                { size: "₹2,50,000", origFee: "₹7,499", discFee: "₹2,999", popular: true },
                { size: "₹5,00,000", origFee: "₹11,499", discFee: "₹4,599" },
                { size: "₹10,00,000", origFee: "₹19,499", discFee: "₹7,799" },
              ].map((plan, i) => (
                <Card key={i} className={`glass-card border-white/10 relative overflow-hidden ${plan.popular ? 'border-yellow-500/60 shadow-[0_0_25px_rgba(234,179,8,0.15)]' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-center text-[10px] font-bold py-1 uppercase tracking-wider text-white">
                      Most Popular
                    </div>
                  )}
                  <CardContent className={`p-5 ${plan.popular ? 'pt-8' : ''}`}>
                    <div className="text-center mb-4 border-b border-white/10 pb-4">
                      <div className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Account Size</div>
                      <div className="text-lg sm:text-xl font-heading font-extrabold text-white mb-2">{plan.size}</div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-white/30 line-through text-sm">{plan.origFee}</span>
                        <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded">60% OFF</span>
                      </div>
                      <div className="text-yellow-400 font-extrabold text-xl mt-1">{plan.discFee}</div>
                    </div>

                    <div className="space-y-2.5 mb-5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Duration</span>
                        <span className="text-white font-bold">24 Hours</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Daily Drawdown</span>
                        <span className="text-white font-bold">2%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Max Drawdown</span>
                        <span className="text-white font-bold">4%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Profit Split</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 font-bold">80%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Profit Target</span>
                        <span className="text-white font-bold">–</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Consistency Rule</span>
                        <span className="text-white font-bold">15% Best Trade</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Payout Threshold</span>
                        <span className="text-white font-bold">3%</span>
                      </div>
                    </div>

                    <Button onClick={() => navigatePlans("/checkout")} className={`w-full h-10 text-sm font-bold ${plan.popular ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0' : 'bg-white text-black hover:bg-gray-200'}`}>
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl px-6 py-4">
              <div className="text-white/70 text-sm">Use code</div>
              <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg px-4 py-1.5 font-mono font-bold text-yellow-400 text-lg tracking-widest select-all">Flash</div>
              <div className="text-white/70 text-sm">for <span className="text-yellow-400 font-bold">60% OFF</span></div>
            </div>

            <FlashRulesAccordion />
          </TabsContent>

          <TabsContent value="instant" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {[
                { size: "₹1,00,000", origFee: "₹4,999", discFee: "₹2,749" },
                { size: "₹5,00,000", origFee: "₹10,999", discFee: "₹6,049", popular: true },
                { size: "₹10,00,000", origFee: "₹17,999", discFee: "₹9,899" },
                { size: "₹20,00,000", origFee: "₹29,999", discFee: "₹16,499" },
              ].map((plan, i) => (
                <Card key={i} className={`glass-card border-white/10 relative overflow-hidden ${plan.popular ? 'border-fw-pink shadow-[0_0_25px_rgba(214,51,132,0.15)]' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 inset-x-0 bg-gradient-fw text-center text-[10px] font-bold py-1 uppercase tracking-wider text-white">
                      Most Popular
                    </div>
                  )}
                  <CardContent className={`p-5 ${plan.popular ? 'pt-8' : ''}`}>
                    <div className="text-center mb-4 border-b border-white/10 pb-4">
                      <div className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Account Size</div>
                      <div className="text-lg sm:text-xl font-heading font-extrabold text-white mb-2">{plan.size}</div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-white/30 line-through text-sm">{plan.origFee}</span>
                        <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded">55% OFF</span>
                      </div>
                      <div className="text-fw-orange font-extrabold text-xl mt-1">{plan.discFee}</div>
                      <div className="text-white/40 text-[10px] mt-0.5">refundable fee</div>
                    </div>

                    <div className="space-y-2.5 mb-5">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Profit Target</span>
                        <span className="text-white font-bold">N/A</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Daily Drawdown</span>
                        <span className="text-white font-bold">3%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Max Drawdown</span>
                        <span className="text-white font-bold">5%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Profit Split</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-fw-orange to-fw-pink font-bold">Up to 70-80%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Trading Days</span>
                        <span className="text-white font-bold">7 days</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Consistency on Rewards</span>
                        <span className="text-white font-bold">15%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/60">Leverage</span>
                        <span className="text-white font-bold">1:50</span>
                      </div>
                    </div>

                    <Button onClick={() => navigatePlans("/checkout")} className={`w-full h-10 text-sm font-bold ${plan.popular ? 'bg-gradient-fw text-white border-0' : 'bg-white text-black hover:bg-gray-200'}`}>
                      Select Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3 bg-gradient-to-r from-fw-pink/10 to-fw-orange/10 border border-fw-pink/20 rounded-xl px-6 py-4">
              <div className="text-white/70 text-sm">Use code</div>
              <div className="bg-fw-pink/20 border border-fw-pink/40 rounded-lg px-4 py-1.5 font-mono font-bold text-fw-pink text-lg tracking-widest select-all">Instant</div>
              <div className="text-white/70 text-sm">for <span className="text-fw-pink font-bold">55% OFF</span></div>
            </div>
          </TabsContent>

          <TabsContent value="1step" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
              {[
                { size: "₹1,00,000", origFee: "₹2,999", discFee: "₹1,049", evalSplit: "–", fundedBonuses: "From ₹499" },
                { size: "₹5,00,000", origFee: "₹11,999", discFee: "₹4,199", evalSplit: "–", fundedBonuses: "From ₹1,500", popular: true },
                { size: "₹10,00,000", origFee: "₹21,999", discFee: "₹7,699", evalSplit: "–", fundedBonuses: "From ₹2,500" },
                { size: "₹25,00,000", origFee: "₹48,499", discFee: "₹16,974", evalSplit: "–", fundedBonuses: "From ₹5,250" },
              ].map((plan, idx) => (
                <Card key={idx} className={`glass-card border-white/10 overflow-hidden ${plan.popular ? 'border-fw-pink shadow-[0_0_25px_rgba(214,51,132,0.15)]' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 inset-x-0 bg-gradient-fw text-center text-[10px] font-bold py-1 uppercase tracking-wider text-white z-10">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-0">
                    <div className={`text-center py-6 px-4 border-b border-white/10 bg-gradient-to-b from-[#4A00E0]/20 to-transparent ${plan.popular ? 'pt-9' : ''}`}>
                      <div className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Account Size</div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-heading font-extrabold text-white mb-2">{plan.size}</div>
                      <p className="text-white/50 text-xs mb-3">One evaluation. Prove it once, get funded.</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-white/30 line-through text-sm">{plan.origFee}</span>
                        <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded">65% OFF</span>
                      </div>
                      <div className="text-fw-orange font-extrabold text-xl mt-1">{plan.discFee}</div>
                      <div className="text-white/40 text-[10px] mt-0.5">one-time fee</div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-white/10">
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-4">
                          <div className="w-6 h-6 rounded-full bg-gradient-fw flex items-center justify-center text-white text-[10px] font-bold">1</div>
                          <h3 className="text-sm font-heading font-bold text-white">1-Step Evaluation</h3>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Max Drawdown</span>
                            <span className="text-white font-bold">6%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Daily Drawdown</span>
                            <span className="text-white font-bold">3%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Profit Target</span>
                            <span className="text-green-400 font-bold">10%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Max Risk/Trade</span>
                            <span className="text-white font-bold">1.5%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Min Days</span>
                            <span className="text-white font-bold">5 days</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Profit Split</span>
                            <span className="text-white font-bold">{plan.evalSplit}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Leverage</span>
                            <span className="text-white font-bold">1:30</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Time Limit</span>
                            <span className="text-white font-bold">Unlimited</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-4">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                          <h3 className="text-sm font-heading font-bold text-white">Funded Trader</h3>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Max Drawdown</span>
                            <span className="text-white font-bold">6%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Daily Drawdown</span>
                            <span className="text-white font-bold">3%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Profit Target</span>
                            <span className="text-white font-bold">–</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Max Risk/Trade</span>
                            <span className="text-white font-bold">1.5%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Min Days</span>
                            <span className="text-white font-bold">3 days</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Profit Split</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fw-orange to-fw-pink font-bold">80%-90%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Leverage</span>
                            <span className="text-white font-bold">1:30</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Bonuses</span>
                            <span className="text-yellow-400 font-bold">{plan.fundedBonuses}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-white/10">
                      <Button onClick={() => navigatePlans("/checkout")} className={`w-full h-10 text-sm font-bold rounded-xl transition-all ${plan.popular ? 'bg-gradient-fw text-white border-0 hover:shadow-lg hover:shadow-fw-pink/30' : 'bg-white text-black hover:bg-gray-200'}`}>
                        Get Funded →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500/10 to-fw-pink/10 border border-purple-500/20 rounded-xl px-6 py-4">
              <div className="text-white/70 text-sm">Use code</div>
              <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg px-4 py-1.5 font-mono font-bold text-purple-400 text-lg tracking-widest select-all">FW</div>
              <div className="text-white/70 text-sm">for <span className="text-purple-400 font-bold">65% OFF</span></div>
            </div>
          </TabsContent>

          <TabsContent value="2step" className="mt-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {[
                { size: "₹5,00,000", origFee: "₹11,999", discFee: "₹3,599", discount: "70%", profitTarget: "8% / 5%", evalSplit: "–", fundedBonuses: "From ₹999" },
                { size: "₹10,00,000", origFee: "₹21,999", discFee: "₹6,599", discount: "70%", profitTarget: "8% / 5%", evalSplit: "–", fundedBonuses: "From ₹1,999", popular: true },
                { size: "₹25,00,000", origFee: "₹48,999", discFee: "₹14,549", discount: "70%", profitTarget: "8% / 5%", evalSplit: "–", fundedBonuses: "From ₹4,999" },
              ].map((plan, idx) => (
                <Card key={idx} className={`glass-card border-white/10 overflow-hidden ${plan.popular ? 'border-fw-pink shadow-[0_0_25px_rgba(214,51,132,0.15)]' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 inset-x-0 bg-gradient-fw text-center text-[10px] font-bold py-1 uppercase tracking-wider text-white z-10">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-0">
                    <div className={`text-center py-6 px-4 border-b border-white/10 bg-gradient-to-b from-[#4A00E0]/20 to-transparent ${plan.popular ? 'pt-9' : ''}`}>
                      <div className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Account Size</div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-heading font-extrabold text-white mb-2">{plan.size}</div>
                      <p className="text-white/50 text-xs mb-3">One evaluation. Prove it once, get funded.</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-white/30 line-through text-sm">{plan.origFee}</span>
                        <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded">{plan.discount} OFF</span>
                      </div>
                      <div className="text-fw-orange font-extrabold text-xl mt-1">{plan.discFee}</div>
                      <div className="text-white/40 text-[10px] mt-0.5">one-time fee</div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-white/10">
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-4">
                          <div className="w-6 h-6 rounded-full bg-gradient-fw flex items-center justify-center text-white text-[10px] font-bold">2</div>
                          <h3 className="text-sm font-heading font-bold text-white">2-Step Evaluation</h3>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Max Drawdown</span>
                            <span className="text-white font-bold">8%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Daily Drawdown</span>
                            <span className="text-white font-bold">3%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Profit Target</span>
                            <span className="text-green-400 font-bold">{plan.profitTarget}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Consistency</span>
                            <span className="text-white font-bold">None</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Max Risk/Trade</span>
                            <span className="text-white font-bold">1.5%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Min Days</span>
                            <span className="text-white font-bold">5 days / phase</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Profit Split</span>
                            <span className="text-white font-bold">{plan.evalSplit}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Leverage</span>
                            <span className="text-white font-bold">1:30</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Time Limit</span>
                            <span className="text-white font-bold">Unlimited</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-1.5 mb-4">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                          <h3 className="text-sm font-heading font-bold text-white">Funded Trader</h3>
                        </div>
                        <div className="space-y-2.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Max Drawdown</span>
                            <span className="text-white font-bold">6%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Daily Drawdown</span>
                            <span className="text-white font-bold">3%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Profit Target</span>
                            <span className="text-white font-bold">–</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Consistency</span>
                            <span className="text-white font-bold">40%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Max Risk/Trade</span>
                            <span className="text-white font-bold">1.5%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Min Days</span>
                            <span className="text-white font-bold">3 days / phase</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Profit Split</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fw-orange to-fw-pink font-bold">80%-90%</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Leverage</span>
                            <span className="text-white font-bold">1:30</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Bonuses</span>
                            <span className="text-yellow-400 font-bold">{plan.fundedBonuses}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-white/10">
                      <Button onClick={() => navigatePlans("/checkout")} className="w-full h-10 text-sm font-bold bg-gradient-fw text-white border-0 rounded-xl hover:shadow-lg hover:shadow-fw-pink/30 transition-all">
                        Get Funded →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl px-6 py-4">
              <div className="text-white/70 text-sm">Use code</div>
              <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-4 py-1.5 font-mono font-bold text-emerald-400 text-lg tracking-widest select-all">FW</div>
              <div className="text-white/70 text-sm">for <span className="text-emerald-400 font-bold">70% OFF</span></div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <p className="text-white/50 text-sm">Account sizes up to ₹50,000,000 available upon scaling. Terms and conditions apply.</p>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3 md:gap-5">
          <span className="text-white/50 text-sm font-semibold tracking-wide mr-2">Payment Options:</span>
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
            <span className="text-[#1a1f71] font-extrabold italic text-[12px]">VISA</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
            <span className="flex"><span className="w-5 h-5 rounded-full bg-[#eb001b] -mr-2 opacity-90" /><span className="w-5 h-5 rounded-full bg-[#f79e1b] opacity-90" /></span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
            <span className="text-[#00796b] font-extrabold text-[12px]">UPi</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#f7931a] flex items-center justify-center shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546zm-6.35-4.613c.24-1.59-.974-2.45-2.64-3.03l.54-2.153-1.315-.33-.526 2.107c-.345-.087-.7-.168-1.053-.252l.53-2.12-1.313-.33-.54 2.152a63 63 0 0 1-.84-.197l.001-.003-1.812-.452-.35 1.407s.975.223.955.237c.535.136.63.49.614.77l-.614 2.456c.037.01.084.024.137.047l-.14-.035-.86 3.438c-.064.16-.228.4-.6.31.015.02-.955-.24-.955-.24l-.652 1.51 1.71.427.94.242-.546 2.19 1.312.327.54-2.17c.36.1.708.19 1.05.273l-.538 2.156 1.315.33.546-2.183c2.24.423 3.926.253 4.635-1.774.57-1.637-.03-2.58-1.217-3.196.867-.2 1.52-.77 1.694-1.94z" /></svg>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#627eea] flex items-center justify-center shadow-md">
            <svg width="14" height="22" viewBox="0 0 256 417" fill="white"><path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" opacity=".6" /><path d="M127.962 0L0 212.32l127.962 75.639V154.158z" /><path d="M127.961 312.187l-1.575 1.92V414.55l1.575 4.6L256 236.587z" opacity=".6" /><path d="M127.962 419.15V312.187L0 236.587z" /></svg>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#26a17b] flex items-center justify-center shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#26a17b" /><path d="M13.4 12.87v-.003c-.08.005-.49.03-1.4.03-.73 0-1.24-.02-1.42-.03v.003c-2.81-.13-4.9-.64-4.9-1.25 0-.61 2.09-1.12 4.9-1.25v1.99c.18.013.71.044 1.44.044.87 0 1.3-.04 1.38-.044V10.37c2.8.13 4.88.64 4.88 1.25 0 .61-2.08 1.12-4.88 1.25zm0-2.71V8.33h3.87V5.72H6.72v2.61h3.86v1.83C7.24 10.35 4.7 11 4.7 11.82c0 .82 2.54 1.47 5.88 1.66v5.94h2.82v-5.94c3.33-.19 5.86-.84 5.86-1.66 0-.82-2.53-1.47-5.86-1.66z" fill="white" /></svg>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#2775ca] flex items-center justify-center shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="12" fill="#2775ca" /><path d="M15.15 13.83c0-1.77-1.07-2.38-3.2-2.64-1.52-.2-1.83-.6-1.83-1.3 0-.7.52-1.14 1.53-1.14.91 0 1.43.34 1.68 1.18.05.16.2.26.36.26h.82c.22 0 .37-.16.37-.37v-.05a2.77 2.77 0 0 0-2.53-2.2V6.54a.38.38 0 0 0-.37-.37h-.75a.38.38 0 0 0-.37.37v1.01c-1.63.2-2.68 1.22-2.68 2.5 0 1.65 1.02 2.33 3.15 2.59 1.42.22 1.88.53 1.88 1.35 0 .82-.7 1.37-1.66 1.37-1.3 0-1.78-.55-1.93-1.28a.37.37 0 0 0-.35-.28h-.87a.37.37 0 0 0-.37.38c.13 1.35 1.04 2.36 2.83 2.6v1.05c0 .2.17.37.37.37h.75c.2 0 .37-.17.37-.37v-1.03c1.65-.23 2.76-1.3 2.76-2.67z" fill="white" /></svg>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#9945ff] to-[#14f195] flex items-center justify-center shadow-md">
            <svg width="16" height="14" viewBox="0 0 398 312" fill="white"><path d="M64.6 237.9a11.07 11.07 0 0 1 7.8-3.2h311.6c4.9 0 7.4 5.9 3.9 9.4l-64.6 67.4a11.07 11.07 0 0 1-7.8 3.2H3.9c-4.9 0-7.4-5.9-3.9-9.4l64.6-67.4zM64.6 3.2A11.4 11.4 0 0 1 72.4 0h311.6c4.9 0 7.4 5.9 3.9 9.4l-64.6 67.4a11.07 11.07 0 0 1-7.8 3.2H3.9c-4.9 0-7.4-5.9-3.9-9.4L64.6 3.2zm269.3 117.3a11.07 11.07 0 0 0-7.8-3.2H14.5c-4.9 0-7.4 5.9-3.9 9.4l64.6 67.4a11.07 11.07 0 0 0 7.8 3.2h311.6c4.9 0 7.4-5.9 3.9-9.4l-64.6-67.4z" /></svg>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#345d9d] flex items-center justify-center shadow-md">
            <svg width="14" height="20" viewBox="0 0 256 384" fill="white"><path d="M128 0L48.7 155.4 128 211.6l79.3-56.2L128 0zM48.7 173.7L128 384l79.3-210.3L128 229.9 48.7 173.7z" opacity=".8" /></svg>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#cc0000] flex items-center justify-center shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.629 0 12 0zm0 22.08A10.08 10.08 0 0 1 1.92 12 10.08 10.08 0 0 1 12 1.92 10.08 10.08 0 0 1 22.08 12 10.08 10.08 0 0 1 12 22.08z" /><path d="M16.8 10.56h-3.36V7.2h-2.88v3.36H7.2v2.88h3.36v3.36h2.88v-3.36h3.36z" /></svg>
          </div>
        </div>
      </div>
    </section>
  );
};

const ChoosePathPills = () => {
  const pills = [
    "AI Risk Guard™ Technology",
    "Real-Time Behavioral Analytics",
    "Discipline Score Tracking",
    "Real Market Execution",
  ];
  return (
    <section id="choose-path-pills" className="pt-2 pb-10 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pills.map((p) => (
              <div
                key={p}
                className="flex items-center gap-3 px-5 py-3.5 rounded-full bg-white/[0.03] border border-white/10 hover:border-violet-400/40 hover:bg-white/[0.06] transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                <span className="text-white font-semibold text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const SmartScalingPlan = () => {
  const milestones = [
    { month: "0M", label: "Starting", amount: "₹5L", height: 12 },
    { month: "3M", label: "First Scale", amount: "₹10L", height: 18 },
    { month: "6M", label: "Second Scale", amount: "₹20L", height: 28 },
    { month: "9M", label: "Third Scale", amount: "₹40L", height: 42 },
    { month: "12M", label: "Fourth Scale", amount: "₹80L", height: 65 },
    { month: "15M", label: "Fifth Scale", amount: "₹160L", height: 95 },
  ];
  return (
    <section id="smart-scaling" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-1"></div>
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-[1.05]">
              Smart <br />
              <span className="text-gradient">Scaling</span> <br />
              Plan
            </h2>
            <p className="text-white/60 mb-7 leading-relaxed max-w-md">
              Grow your funded capital by showing steady, rule-respecting results. Hit a combined 5% return across any three consecutive months and your account size doubles — a clear, milestone-driven path designed for long-term Indian traders.
            </p>
            <Link href="/scaling">
              <Button className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-full h-12 px-7 font-bold shadow-lg hover:shadow-purple-500/30">
                Start Scaling Today <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>

          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 p-6 md:p-8 shadow-2xl">
              <div className="mb-1">
                <h3 className="text-white font-extrabold text-xl mb-1">Account Growth</h3>
                <p className="text-white/50 text-xs">Scaling progression over time</p>
              </div>

              <div className="flex items-end justify-between gap-2 md:gap-3 h-64 mt-6 mb-3 border-l border-b border-white/10 pl-3 pb-2">
                {milestones.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className="text-white font-extrabold text-[11px] md:text-xs mb-1.5 whitespace-nowrap">{m.amount}</div>
                    <div
                      className="w-full max-w-[44px] rounded-t-md bg-gradient-to-t from-[#4A00E0] via-[#6B21FF] to-[#8E2DE2] shadow-[0_0_20px_rgba(139,46,226,0.3)]"
                      style={{ height: `${m.height}%` }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-end justify-between gap-2 md:gap-3 pl-3">
                {milestones.map((m) => (
                  <div key={m.month} className="flex-1 text-center">
                    <div className="text-white/70 text-[10px] md:text-xs font-bold">{m.month}</div>
                    <div className="text-white/40 text-[9px] md:text-[10px] mt-0.5 leading-tight">{m.label}</div>
                  </div>
                ))}
              </div>

              <div className="text-white/40 text-[10px] mt-4 text-center">Time (Months)</div>
            </div>

            <div className="absolute -bottom-4 -right-2 md:-right-4 bg-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-2.5 border border-emerald-200">
              <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-emerald-600 text-[9px] font-extrabold tracking-widest">TOTAL GROWTH</div>
                <div className="text-slate-900 font-extrabold text-base leading-tight">16x Potential</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SEBIBrokers = () => {
  const cards = [
    {
      title: "SEBI Compliant",
      desc: "We route only through SEBI-registered broker partners, so every trade you take sits inside India's regulated framework — full stop.",
      icon: <ShieldCheck className="w-6 h-6" />,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      dot: "bg-emerald-400",
    },
    {
      title: "SSL Encrypted",
      desc: "End-to-end 256-bit encryption guards your account, payouts, and personal details across every session and device.",
      icon: <Lock className="w-6 h-6" />,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
      dot: "bg-blue-400",
    },
    {
      title: "Real-time Data",
      desc: "Direct exchange feeds from NSE and BSE keep your charts, P&L, and order fills in sync with the live market — no lag, no delay.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <path d="M5 12.55a11 11 0 0114 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
        </svg>
      ),
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-400",
      dot: "bg-violet-400",
    },
    {
      title: "24/7 Support",
      desc: "A real human-led support desk is on standby any hour — pings answered in Hindi or English, no scripted bots.",
      icon: <Clock className="w-6 h-6" />,
      iconBg: "bg-orange-500/15",
      iconColor: "text-orange-400",
      dot: "bg-orange-400",
    },
  ];

  return (
    <section id="sebi-brokers" className="py-14 relative overflow-hidden">
      <div className="glow-orb orb-3"></div>
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
            Working with <span className="text-gradient">SEBI Registered</span> Brokers
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            We partner exclusively with SEBI-regulated brokers to ensure the highest standards of security, compliance, and real market execution for all our traders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {cards.map((c) => (
            <div key={c.title} className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 hover:border-white/20 hover:bg-white/[0.05] transition-all flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${c.iconBg} ${c.iconColor} flex items-center justify-center shrink-0`}>
                {c.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-white font-extrabold text-base">{c.title}</h3>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shadow-[0_0_6px_currentColor]`} />
                </div>
                <p className="text-white/55 text-xs leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-bold text-sm">100% Regulated Trading Environment</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const WhatPeopleSay = () => {
  const testimonials = [
    {
      name: "Disha Kakkar",
      handle: "@disha_kakkar",
      quote: "Every metric I actually care about — daily limit, profit target, payout window — is right there on one screen. My day starts calmer and my routine just runs.",
      ago: "5 days ago",
      amount: "₹1,18,900",
      gradient: "from-pink-400 to-rose-500",
      initials: "DK",
    },
    {
      name: "Hrdaya Grover",
      handle: "@hrdaya_grover",
      quote: "Watching my P&L update tick-by-tick in the FundedWealth Terminal removed the mental noise. I stopped refreshing five tabs and just focused on hitting my 8% target.",
      ago: "3 days ago",
      amount: "₹67,200",
      gradient: "from-violet-500 to-blue-500",
      initials: "HG",
    },
    {
      name: "Sanyam Maheswari",
      handle: "@sanyam_maheswari",
      quote: "Fills are quick, the layout is uncluttered, and the live risk meter keeps me honest. It pushes me to trade my plan instead of my mood.",
      ago: "2 days ago",
      amount: "₹1,80,000",
      gradient: "from-amber-400 to-orange-500",
      initials: "SM",
    },
    {
      name: "Rohan Mehta",
      handle: "@rohan_mehta",
      quote: "Cleared the 2-Step in 19 days. The drawdown tracker literally saved me from a revenge trade on a Friday close — that one nudge paid for the entire challenge fee.",
      ago: "1 week ago",
      amount: "₹2,45,000",
      gradient: "from-cyan-400 to-blue-600",
      initials: "RM",
    },
    {
      name: "Priya Iyer",
      handle: "@priya_trades",
      quote: "Payout hit my HDFC account in under 24 hours, no follow-ups, no awkward ticket replies. After two offshore prop horror stories, this felt unreal.",
      ago: "4 days ago",
      amount: "₹98,400",
      gradient: "from-emerald-400 to-teal-600",
      initials: "PI",
    },
    {
      name: "Aakash Sharma",
      handle: "@aakash_fno",
      quote: "Trading BankNifty with 25L funded capital while my own savings stayed untouched — that mental shift alone improved my execution. Sizing finally feels rational.",
      ago: "6 days ago",
      amount: "₹3,12,750",
      gradient: "from-indigo-500 to-purple-600",
      initials: "AS",
    },
    {
      name: "Neha Singh",
      handle: "@neha_sgh",
      quote: "Hindi support over WhatsApp, clear KYC steps, and zero hidden fees. As a part-time trader from Lucknow, this is the first platform that actually felt built for us.",
      ago: "2 weeks ago",
      amount: "₹54,600",
      gradient: "from-rose-500 to-pink-600",
      initials: "NS",
    },
    {
      name: "Vikram Reddy",
      handle: "@vik_trades",
      quote: "The discipline score is brutal but fair. Watching it drop after a single rule break taught me more about risk than three years of YouTube content ever did.",
      ago: "9 days ago",
      amount: "₹1,76,200",
      gradient: "from-amber-500 to-red-500",
      initials: "VR",
    },
    {
      name: "Ananya Bose",
      handle: "@ananya.b",
      quote: "I scaled from ₹5L to ₹20L in five months without ever touching my own capital. The milestone framework keeps the goals concrete instead of abstract.",
      ago: "3 weeks ago",
      amount: "₹4,28,000",
      gradient: "from-fuchsia-500 to-violet-700",
      initials: "AB",
    },
    {
      name: "Karan Malhotra",
      handle: "@karan.mal",
      quote: "What I love is the absence of gimmicks — no flashy WhatsApp groups, no signal calls. Just a clean evaluation, real rules, and a payout when you earn it.",
      ago: "1 day ago",
      amount: "₹89,500",
      gradient: "from-sky-500 to-cyan-600",
      initials: "KM",
    },
  ];

  const Card = ({ t }: { t: (typeof testimonials)[number] }) => (
    <div className="rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 p-5 hover:border-white/20 hover:bg-white/[0.05] transition-all flex flex-col w-[320px] md:w-[360px] shrink-0 mx-3">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-lg`}>
          {t.initials}
        </div>
        <div>
          <div className="text-white font-bold text-sm">{t.name}</div>
          <div className="flex items-center gap-1 text-white/50 text-xs">
            <Instagram className="w-3 h-3" />
            {t.handle}
          </div>
        </div>
      </div>
      <p className="text-white/65 text-sm italic leading-relaxed mb-5 flex-1">&ldquo;{t.quote}&rdquo;</p>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <span className="text-white/40 text-xs">{t.ago}</span>
        <span className="text-emerald-400 font-extrabold text-sm">{t.amount}</span>
      </div>
    </div>
  );

  const row1 = testimonials.slice(0, 5);
  const row2 = testimonials.slice(5);

  return (
    <section id="testimonials" className="py-14 relative overflow-hidden">
      <style>{`
 @keyframes fwMarqueeLeft {
 0% { transform: translateX(0); }
 100% { transform: translateX(-50%); }
 }
 @keyframes fwMarqueeRight {
 0% { transform: translateX(-50%); }
 100% { transform: translateX(0); }
 }
 .fw-marquee-track-left { animation: fwMarqueeLeft 60s linear infinite; }
 .fw-marquee-track-right { animation: fwMarqueeRight 70s linear infinite; }
 .fw-marquee:hover .fw-marquee-track-left,
 .fw-marquee:hover .fw-marquee-track-right { animation-play-state: paused; }
 `}</style>

      <div className="glow-orb orb-2"></div>
      <div className="container mx-auto px-4 md:px-6 relative mb-10">
        <h2 className="text-center text-4xl md:text-6xl font-extrabold text-white mb-3">
          What People <span className="text-gradient">Say About Us</span>
        </h2>
        <p className="text-center text-white/55 text-sm md:text-base max-w-2xl mx-auto">
          Honest words from real funded traders across India — auto-pulled from our community feed.
        </p>
      </div>

      <div
        className="fw-marquee relative space-y-5 mb-12"
        style={{
          maskImage: "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
        }}
      >
        <div className="flex overflow-hidden">
          <div className="flex fw-marquee-track-left">
            {[...row1, ...row1].map((t, i) => (
              <Card key={`r1-${i}`} t={t} />
            ))}
          </div>
        </div>

        <div className="flex overflow-hidden">
          <div className="flex fw-marquee-track-right">
            {[...row2, ...row2].map((t, i) => (
              <Card key={`r2-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/10 p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-center md:text-left">
            <h3 className="text-white font-extrabold text-lg md:text-xl mb-1">Begin Your Trading Career Today</h3>
            <p className="text-white/55 text-sm">Stand alongside thousands of Indian traders who already build their funded careers on FundedWealth.</p>
          </div>
          <Link href="/sign-up">
            <Button className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-full h-11 px-6 font-bold shadow-lg hover:shadow-purple-500/30 whitespace-nowrap">
              Get Started <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const Calculator = () => {
  const [balance, setBalance] = useState([500000]);
  const [gain, setGain] = useState([8]);

  const profit = balance[0] * (gain[0] / 100);
  const payout = profit * 0.8;

  return (
    <section className="py-14 bg-black/20 border-y border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-center max-w-6xl mx-auto">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white mb-6">
              Calculate Your <span className="text-gradient">Potential</span>
            </h2>
            <p className="text-xl text-white/70 mb-10">
              See exactly how much you could earn trading with FundedWealth capital compared to your own small account.
            </p>

            <div className="space-y-10">
              <div>
                <div className="flex justify-between mb-4">
                  <label className="text-white font-semibold">Account Balance</label>
                  <span className="text-fw-orange font-bold text-xl">₹{(balance[0]).toLocaleString('en-IN')}</span>
                </div>
                <Slider
                  value={balance}
                  min={100000}
                  max={5000000}
                  step={100000}
                  onValueChange={setBalance}
                  className="[&_[role=slider]]:bg-fw-orange [&_[role=slider]]:border-fw-orange [&_[role=track]]:bg-white/10"
                />
              </div>

              <div>
                <div className="flex justify-between mb-4">
                  <label className="text-white font-semibold">Estimated Monthly Gain</label>
                  <span className="text-fw-pink font-bold text-xl">{gain[0]}%</span>
                </div>
                <Slider
                  value={gain}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={setGain}
                  className="[&_[role=slider]]:bg-fw-pink [&_[role=slider]]:border-fw-pink [&_[role=track]]:bg-white/10"
                />
              </div>
            </div>
          </div>

          <div>
            <Card className="glass-card border-white/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-fw-orange/20 to-fw-pink/20 blur-3xl rounded-full"></div>
              <CardContent className="p-8 md:p-10 relative z-10">
                <div className="space-y-8">
                  <div>
                    <p className="text-white/60 font-semibold mb-2 uppercase tracking-wide">Potential Monthly Profit</p>
                    <p className="text-4xl font-heading font-bold text-white">₹{(profit).toLocaleString('en-IN')}</p>
                  </div>

                  <div className="h-px w-full bg-white/10"></div>

                  <div>
                    <p className="text-white/60 font-semibold mb-2 uppercase tracking-wide">Your Payout (80% Split)</p>
                    <p className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fw-orange to-fw-pink">
                      ₹{(payout).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <Button className="w-full h-14 mt-4 bg-white text-black hover:bg-gray-200 text-lg font-bold">
                    Start Earning Now
                  </Button>

                  <p className="text-xs text-white/40 text-center mt-4">
                    *Calculations are for illustrative purposes only. Trading involves risk.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

const articles = {
  guide: {
    title: "What Is a Funded Account?",
    accent: "#FF8A3D",
    sections: [
      {
        heading: "The Concept",
        body: "A funded account is simple: FundedWealth provides you with real trading capital — up to ₹50 Lakhs — and you trade it under our risk framework. You keep the majority of every rupee of profit you generate. If the trade goes against you, we absorb the loss — not you."
      },
      {
        heading: "How It Works — Step by Step",
        body: "1. Choose a challenge plan (₹1L, ₹2L, ₹5L, ₹10L, ₹25L, or ₹50L).\n2. Pass the evaluation by hitting the profit target while staying within the max drawdown limit.\n3. Get funded instantly — your live account is activated within 12 hours.\n4. Trade freely. Every 7 days, request your payout. We send it straight to your UPI or bank account."
      },
      {
        heading: "The Profit Split",
        body: "FundedWealth offers a 70%–90% profit split in your favour, depending on your plan tier. There are no hidden deductions, no platform fees on payouts, and no lock-in periods. What you earn is what you receive."
      },
      {
        heading: "Risk Rules — Kept Simple",
        body: "We believe in fair rules. The only hard limits are: a Daily Drawdown of 5% and a Max Drawdown of 10%. No news-trading restrictions. No time limits on the evaluation. No minimum trading days beyond what's needed to show consistency."
      },
      {
        heading: "Who Is This For?",
        body: "Any trader — beginner to advanced — who has a strategy but lacks capital. Whether you trade equities, indices, or commodities, if you can demonstrate disciplined risk management, we'll fund you and share the profits."
      }
    ]
  },
  compare: {
    title: "Funded Capital vs. Personal Capital",
    accent: "#D63384",
    sections: [
      {
        heading: "The Math That Changes Everything",
        body: "A 10% return on a personal ₹50,000 account earns you ₹5,000. The same 10% return on a FundedWealth ₹50 Lakh account earns you ₹4,00,000 (at 80% split). Same skill. Same strategy. 80├ù the income."
      },
      {
        heading: "Personal Capital — The Hidden Costs",
        body: "Trading your own savings means every loss stings personally. You carry 100% of the downside. You need years of compounding to reach meaningful capital. Emotionally, it's harder to execute your strategy when rent money is on the line. Scaling takes a decade."
      },
      {
        heading: "Funded Capital — The Asymmetric Advantage",
        body: "With FundedWealth, your downside is capped at the small evaluation fee. Your upside scales with our capital. Losses beyond the drawdown limits end the account — not your savings. You can attempt again, improve, and reapply. The risk-reward is fundamentally different."
      },
      {
        heading: "Side-by-Side Comparison",
        body: "Personal ₹50k account → 10% gain = ₹5,000 profit, 100% loss is yours.\nFunded ₹50L account → 10% gain = ₹4,00,000 profit (80% split), 0% personal loss.\nPersonal ₹50k account → requires years of saving and compounding to grow.\nFunded account → instantly scale from ₹1L to ₹50L based on performance."
      },
      {
        heading: "The Bottom Line",
        body: "Skill is the scarce resource, not capital. FundedWealth solves the capital problem so you can focus entirely on what you do best — reading the market and executing your edge."
      }
    ]
  },
  sebi: {
    title: "SEBI, Legality & How Prop Firms Work in India",
    accent: "#4A00E0",
    sections: [
      {
        heading: "Is Prop Trading Legal in India?",
        body: "Yes. Proprietary trading firms in India operate legally under a well-defined framework. We are not a broker, a mutual fund, or a financial advisor. We do not solicit deposits from the public for investment. We provide a simulated trading environment where performance is evaluated."
      },
      {
        heading: "What Does 'Simulated Environment' Mean?",
        body: "When you trade on a FundedWealth funded account, you are trading in a simulated market environment that mirrors real NSE/BSE price feeds in real time. The P&L you generate is real and directly determines your payout. We are the counterparty to your trades."
      },
      {
        heading: "Why Isn't SEBI Registration Required?",
        body: "SEBI regulates entities that provide investment advice to the public or pool public money for market investment. Prop trading firms do neither. We use our own proprietary capital. Traders are evaluated as potential managers of our internal capital — not as clients receiving investment services. This model does not require SEBI broker registration."
      },
      {
        heading: "Your Protections as a Trader",
        body: "FundedWealth operates with full transparency. Our rules are published clearly. Payouts are processed within 12 hours of verification. There are no arbitrary denial clauses. Our evaluation criteria are objective and published before you start. What you see is what you get."
      },
      {
        heading: "Our Commitment to Compliance",
        body: "We stay fully current with Indian financial regulations and update our operating model as the regulatory environment evolves. If you have specific legal questions about prop trading in India, we recommend consulting a qualified financial lawyer. We're always happy to share our full operational documentation on request."
      }
    ]
  }
};

type ArticleKey = keyof typeof articles;

const ArticleModal = ({ articleKey, onClose }: { articleKey: ArticleKey; onClose: () => void }) => {
  const article = articles[articleKey];
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow || "";
    };
  }, []);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-[#120020] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-[#120020]/95 backdrop-blur-sm border-b border-white/10 px-8 py-5 flex items-center justify-between z-10">
            <h3 className="text-xl font-heading font-bold text-white pr-4">{article.title}</h3>
            <button
              onClick={onClose}
              className="shrink-0 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-8 py-6 space-y-8">
            {article.sections.map((section, i) => (
              <div key={i}>
                <h4 className="text-lg font-bold mb-3" style={{ color: article.accent }}>{section.heading}</h4>
                <p className="text-white/75 leading-relaxed whitespace-pre-line">{section.body}</p>
              </div>
            ))}
          </div>
          <div className="px-8 pb-8">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${article.accent}, #4A00E0)` }}
            >
              Close Article
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Education = () => {
  const [openArticle, setOpenArticle] = useState<ArticleKey | null>(null);
  return (
    <section className="py-14 relative">
      {openArticle && <ArticleModal articleKey={openArticle} onClose={() => setOpenArticle(null)} />}
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white mb-6">
            Trading <span className="text-gradient">Intelligence</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Everything you need to know about the prop firm industry in India. No BS, just facts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <Card
            className="glass-card border-white/10 hover:bg-white/5 transition-all cursor-pointer group"
            onClick={() => setOpenArticle("guide")}
          >
            <CardContent className="p-8">
              <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-fw-orange transition-colors">What Is a Funded Account?</h4>
              <p className="text-white/60 mb-6">We provide you with our capital to trade. You follow our risk parameters. If you make a profit, we split it up to 90/10 in your favor. If you lose, we absorb the losses.</p>
              <div className="text-fw-orange font-semibold flex items-center gap-2">Read Guide <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" /></div>
            </CardContent>
          </Card>

          <Card
            className="glass-card border-white/10 hover:bg-white/5 transition-all cursor-pointer group"
            onClick={() => setOpenArticle("compare")}
          >
            <CardContent className="p-8">
              <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-fw-pink transition-colors">Funded vs Personal Capital</h4>
              <p className="text-white/60 mb-6">Trading a ₹50k personal account with 10% gains makes you ₹5k. Trading a ₹50L funded account with 10% gains makes you ₹4L. Capital scales your skill.</p>
              <div className="text-fw-pink font-semibold flex items-center gap-2">Compare <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" /></div>
            </CardContent>
          </Card>

          <Card
            className="glass-card border-white/10 hover:bg-white/5 transition-all cursor-pointer group"
            onClick={() => setOpenArticle("sebi")}
          >
            <CardContent className="p-8">
              <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-fw-purple transition-colors">SEBI and Prop Firms</h4>
              <p className="text-white/60 mb-6">Understand the legal framework. Prop trading firms provide simulated environments tied to real market data. We are the counterparty to your trades, fully compliant with Indian regulations.</p>
              <div className="text-fw-purple font-semibold flex items-center gap-2">Learn Truth <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" /></div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-fw-orange/20 to-fw-pink/20 border border-fw-pink/30 hover:border-fw-pink transition-all">
            <CardContent className="p-8">
              <h4 className="text-2xl font-bold text-white mb-6">Why 20,000+ Traders Choose Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-fw-orange shrink-0" size={20} />
                  <span className="text-white/90 font-medium">India's first NSE/BSE focused firm</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-fw-pink shrink-0" size={20} />
                  <span className="text-white/90 font-medium">Fastest payout cycle in the industry</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-fw-purple shrink-0" size={20} />
                  <span className="text-white/90 font-medium">Zero arbitrary rules or hidden denials</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

const ImpactInitiative = () => (
  <section className="py-14 relative overflow-hidden" id="impact">
    <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 via-transparent to-transparent pointer-events-none" />
    <div className="container mx-auto px-4 md:px-6 relative z-10">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-4 py-1.5 mb-6">
          <Heart size={14} className="text-pink-400 fill-pink-400" />
          <span className="text-pink-400 text-sm font-bold">Powered by Real Impact ❤∩╕Å</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white mb-6">
          Trade for Change — <span className="text-gradient">Profit with Purpose</span>
        </h2>
        <p className="text-xl text-white/70">
          Every trade you take creates real impact.<br />
          FundedWealth contributes from its profits — and you can choose to give back too.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-b from-blue-500/15 to-blue-900/5 border border-blue-500/25 rounded-2xl p-7 relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-blue-500/15 border border-blue-500/25 rounded-full px-2.5 py-0.5 text-blue-400 text-[10px] font-bold">AUTOMATIC</div>
          <div className="text-3xl mb-3"></div>
          <h3 className="text-white font-extrabold text-xl mb-2">FundedWealth Contribution</h3>
          <p className="text-white/50 text-sm mb-4">We allocate a portion of our profits to support real causes across India.</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm bg-white/5 rounded-lg p-2.5"><span className="text-white/50">Contributed</span><span className="text-blue-400 font-bold">₹12L+</span></div>
            <div className="flex justify-between text-sm bg-white/5 rounded-lg p-2.5"><span className="text-white/50">Meals funded</span><span className="text-amber-400 font-bold">8,200+</span></div>
            <div className="flex justify-between text-sm bg-white/5 rounded-lg p-2.5"><span className="text-white/50">Students supported</span><span className="text-purple-400 font-bold">520+</span></div>
          </div>
        </div>
        <div className="bg-gradient-to-b from-green-500/15 to-green-900/5 border border-green-500/25 rounded-2xl p-7 relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-green-500/15 border border-green-500/25 rounded-full px-2.5 py-0.5 text-green-400 text-[10px] font-bold">OPTIONAL</div>
          <div className="text-3xl mb-3"></div>
          <h3 className="text-white font-extrabold text-xl mb-2">Trader Contribution</h3>
          <p className="text-white/50 text-sm mb-4">You can optionally contribute during withdrawals and increase your impact.</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm bg-white/5 rounded-lg p-2.5"><span className="text-white/50">Contributed</span><span className="text-green-400 font-bold">₹6.5L+</span></div>
            <div className="flex justify-between text-sm bg-white/5 rounded-lg p-2.5"><span className="text-white/50">Meals funded</span><span className="text-amber-400 font-bold">4,300+</span></div>
            <div className="flex justify-between text-sm bg-white/5 rounded-lg p-2.5"><span className="text-white/50">Students supported</span><span className="text-purple-400 font-bold">330+</span></div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-pink-500/15 border border-pink-500/20 rounded-2xl p-4 text-center mb-12">
        <span className="text-white font-extrabold">Together, we create DOUBLE IMPACT</span>
        <span className="text-white/40 text-sm ml-2">— ₹18.5L+ combined across 12 cities</span>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 p-8 mb-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-white font-extrabold text-2xl mb-3">How It Works</h3>
            <div className="space-y-4">
              {[
                { step: "1", title: "You Trade & Profit", desc: "Focus on your trading — we handle the rest.", tag: "" },
                { step: "2", title: "We Contribute Automatically", desc: "FundedWealth donates from its profits — no action needed.", tag: "AUTO" },
                { step: "3", title: "You Can Give Back (Optional)", desc: "During withdrawal, optionally donate to a cause you care about.", tag: "OPTIONAL" },
                { step: "4", title: "Track & Share Your Impact", desc: "See your meals, students & badge level in your dashboard.", tag: "" },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-600 to-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">{s.step}</div>
                  <div>
                    <div className="text-white font-bold text-sm inline">{s.title}</div>
                    {s.tag && <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${s.tag === "AUTO" ? "bg-blue-500/15 text-blue-400" : "bg-green-500/15 text-green-400"}`}>{s.tag}</span>}
                    <div className="text-white/50 text-xs">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Badge System</div>
              <div className="space-y-3">
                {[
                  { badge: " Supporter", range: "₹1 – ₹100", color: "text-blue-400" },
                  { badge: "⭐ Contributor", range: "₹100 – ₹1,000", color: "text-purple-400" },
                  { badge: " Impact Leader", range: "₹1,000+", color: "text-amber-400" },
                ].map(b => (
                  <div key={b.badge} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className={`font-bold text-sm ${b.color}`}>{b.badge}</span>
                    <span className="text-white/50 text-xs">{b.range}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-pink-500/15 to-red-500/10 border border-pink-500/20 rounded-xl p-5 text-center">
              <div className="text-white font-bold mb-1">Donations are voluntary</div>
              <div className="text-white/50 text-xs">No automatic deductions from traders. You choose when and how much.</div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-white/30 text-xs text-center mb-8">All contributions include both FundedWealth profit sharing and optional trader donations.</p>

      <div className="flex gap-4 justify-center flex-wrap">
        <Link href="/impact">
          <button className="bg-gradient-to-r from-pink-600 to-red-500 text-white font-bold px-8 py-3.5 rounded-xl text-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-lg shadow-pink-900/30">
            <Heart size={18} /> Learn More About FW Impact
          </button>
        </Link>
        <Link href="/dashboard">
          <button className="bg-white/10 border border-white/20 text-white font-bold px-8 py-3.5 rounded-xl text-lg hover:bg-white/15 transition-colors">
            Start Trading & Creating Impact
          </button>
        </Link>
      </div>
    </div>
  </section>
);

const FAQ = () => {
  return (
    <section id="faq" className="py-14 bg-black/20">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white mb-6">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {[
            {
              q: "Is FundedWealth SEBI Registered?",
              a: "FundedWealth is a proprietary trading firm, not a broker or financial advisor. We do not accept deposits from the public for investment purposes. We provide simulated trading environments and evaluate trader performance. Therefore, SEBI registration as a broker is not applicable to our business model."
            },
            {
              q: "How does the payout work?",
              a: "Once you are a funded trader and have generated profit above your initial balance, you can request a payout every 7 days. Payouts are processed within 12 hours and sent directly to your Indian bank account via NEFT/IMPS or UPI, or via crypto if preferred."
            },
            {
              q: "What is the profit split?",
              a: "Our profit splits start at 80% in favor of the trader. For our 2-Step evaluation and scaled accounts, the split goes up to 90%. We keep the remaining 10-20% to cover operational costs and technology."
            },
            {
              q: "Can I trade news?",
              a: "Yes! Unlike many other firms, we do not restrict news trading. If your strategy relies on volatility during macroeconomic events, you are free to execute it."
            },
            {
              q: "What markets can I trade?",
              a: "On FundedWealth IND you can trade Index F&O (NIFTY, BANKNIFTY, SENSEX, FINNIFTY) and Equities (NIFTY 500 stocks + Stock Futures) on real NSE/BSE price feeds. Forex, Crypto and Global Futures are coming soon as separate FundedWealth verticals."
            },
            {
              q: "What is the FW Championship?",
              a: "The FW Championship is our premier trading competition. For a small entry fee, traders compete on a leaderboard. Top performers win physical prizes like iPhones and MacBooks, cash rewards, and direct funded accounts without passing evaluations."
            },
            {
              q: "Is there a free trial?",
              a: "Yes, we offer a 14-day free trial on our simulated platform so you can test our spreads, execution speed, and dashboard before committing to an evaluation or instant funding."
            },
            {
              q: "What account sizes are available?",
              a: "We offer account sizes across all plan types:\n\n• Flash ⚡ — ₹1,00,000 | ₹2,50,000 | ₹5,00,000 | ₹10,00,000\n• Instant — ₹1,00,000 | ₹5,00,000 | ₹10,00,000\n• 1-Step Evaluation — ₹1,00,000 | ₹5,00,000 | ₹10,00,000 | ₹25,00,000\n• 2-Step Evaluation — ₹5,00,000 | ₹10,00,000 | ₹25,00,000\n\nThrough our scaling plan, funded traders can scale up to ₹50,00,000 (₹50L) in 6 levels."
            },
            {
              q: "What is the difference between Flash, Instant, 1-Step, and 2-Step plans?",
              a: "Flash ⚡ gives you immediate access to a funded account with no evaluation — just pay and start trading. Instant also skips the evaluation but comes with slightly different pricing and rules. 1-Step requires you to pass a single evaluation phase by hitting the profit target, while 2-Step has two phases (Phase 1 and Phase 2) with separate profit targets of 8% and 5%. The 2-Step plan offers the lowest entry fees and is ideal for consistent traders."
            },
            {
              q: "What are the fees for each account size?",
              a: "Fees vary by plan type and account size. Here are the discounted prices:\n\n• Flash ⚡ — ₹1L: ₹1,399 | ₹2.5L: ₹2,999 | ₹5L: ₹4,599 | ₹10L: ₹7,799\n• Instant — ₹1L: ₹2,749 | ₹5L: ₹6,049 | ₹10L: ₹9,899\n• 1-Step — ₹1L: ₹1,049 | ₹5L: ₹4,199 | ₹10L: ₹7,699 | ₹25L: ₹16,974\n• 2-Step — ₹5L: ₹3,599 | ₹10L: ₹6,599 | ₹25L: ₹14,549\n\nAll prices include GST. We frequently run promotions — check the Plans section for the latest offers."
            },
            {
              q: "What is the profit target for each plan?",
              a: "Profit targets depend on the plan type:\n\n• Flash ⚡ — No profit target (instant funding)\n• Instant — No profit target (instant funding)\n• 1-Step — 10% profit target in a single phase\n• 2-Step — 8% in Phase 1 + 5% in Phase 2\n\nOnce you hit the target while staying within drawdown limits, your funded account is activated within 12 hours."
            },
            {
              q: "What are the drawdown rules for each account size?",
              a: "Drawdown rules are the same across all account sizes:\n\n• Daily Drawdown: 2% of your balance (e.g., ₹2,000 on a ₹1L account, ₹50,000 on a ₹25L account)\n• Max Drawdown: 4% of your starting balance (e.g., ₹4,000 on a ₹1L account, ₹1,00,000 on a ₹25L account)\n\nThese limits protect both you and the firm. If you breach either limit, the account is deactivated."
            },
            {
              q: "How does the scaling plan work?",
              a: "Our scaling plan lets funded traders grow their account size in 6 levels:\n\n₹1,00,000 → ₹2,50,000 → ₹5,00,000 → ₹10,00,000 → ₹25,00,000 → ₹50,00,000\n\nTo qualify for scaling, you need to consistently hit profit targets while staying within drawdown limits. Each time you scale up, your capital increases and so does your earning potential — all the way up to ₹50L."
            },
            {
              q: "Which account size should I start with?",
              a: "It depends on your experience and budget:\n\n• Beginners — Start with ₹1L (Flash or 1-Step) to learn the rules with minimal investment\n• Intermediate — ₹5L gives a good balance of capital and affordability\n• Experienced — ₹10L or ₹25L for serious traders who want higher earning potential from day one\n\nRemember, you can always scale up through our scaling plan once you're funded!"
            }
          ].map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-white/5 border border-white/10 rounded-xl px-6 data-[state=open]:bg-white/10 transition-colors">
              <AccordionTrigger className="text-left text-lg font-bold text-white hover:text-fw-orange hover:no-underline py-6">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-white/60 text-base leading-relaxed pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 text-center">
          <p className="text-white/55 text-sm mb-4">
            70+ more answers across Payouts, KYC, Platform, Scaling, Tax & more.
          </p>
          <Link href="/faq">
            <Button size="lg" className="bg-gradient-to-r from-fw-orange to-fw-pink text-white rounded-full px-8 h-12 font-extrabold shadow-lg shadow-fw-pink/30 hover:-translate-y-0.5 transition-all">
              Explore Full FAQ <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const ContactUs = () => {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.message) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          subject: "Website Contact Form",
          message: form.message,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-14 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-fw-purple/15 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fw-purple/30 border border-fw-purple/50 text-white text-sm font-bold mb-6">
            Contact Us
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white mb-4">
            Get In Touch
          </h2>
          <p className="text-white/50 text-lg">We are here to answer any question you may have.</p>
        </div>

        {/* ── Cards ── */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {/* WhatsApp */}
          <div className="glass-card rounded-2xl p-7 border border-white/10 flex flex-col gap-5">
            <div className="w-11 h-11 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-lg mb-1">WhatsApp</div>
              <div className="text-white/50 text-sm">Chat with us directly on WhatsApp for instant support.</div>
            </div>
            <a href="https://whatsapp.com/channel/0029Vb7PZoPFHWpz05pv7Q0A" target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl h-11">
                Chat on WhatsApp
              </Button>
            </a>
          </div>

          {/* Telegram */}
          <div className="glass-card rounded-2xl p-7 border border-white/10 flex flex-col gap-5">
            <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#26A5E4" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-lg mb-1">Telegram</div>
              <div className="text-white/50 text-sm">Join our Telegram support group for quick help.</div>
            </div>
            <a href="https://t.me/fundedwealthind" target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl h-11">
                Open Telegram
              </Button>
            </a>
          </div>

          {/* Instagram */}
          <div className="glass-card rounded-2xl p-7 border border-white/10 flex flex-col gap-5">
            <div className="w-11 h-11 rounded-xl bg-fw-pink/20 border border-fw-pink/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#E4405F" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-lg mb-1">Instagram</div>
              <div className="text-white/50 text-sm">Follow us and DM us on Instagram for updates and support.</div>
            </div>
            <a href="https://www.instagram.com/fundedwealthind" target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-gradient-to-r from-fw-pink to-fw-orange hover:opacity-90 text-white font-bold rounded-xl h-11">
                DM on Instagram
              </Button>
            </a>
          </div>
        </div>

        {/* ── Fill Out The Form ── */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left info */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fw-purple/30 border border-fw-purple/40 text-white text-xs font-bold mb-6">
              Contact Us
            </div>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white mb-4">
              Fill Out The <span className="text-gradient">Form</span>
            </h3>
            <p className="text-white/50 mb-10">Don't be afraid to say hello...</p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                <MapPin className="text-fw-orange w-5 h-5 shrink-0" />
                <div>
                  <div className="text-white/40 text-xs mb-0.5">Location:</div>
                  <div className="text-white font-semibold text-sm">India</div>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-4">
                <Mail className="text-fw-orange w-5 h-5 shrink-0" />
                <div>
                  <div className="text-white/40 text-xs mb-0.5">Email:</div>
                  <div className="text-white font-semibold text-sm">support@fundedwealth.in</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="glass-card rounded-2xl border border-fw-purple/30 p-8">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs">First Name</Label>
                  <Input
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs">Last Name</Label>
                  <Input
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs">Email</Label>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs">Phone</Label>
                  <Input
                    placeholder="+91 00000 00000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Message</Label>
                <Textarea
                  placeholder="Message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple resize-none"
                />
              </div>
              {submitted ? (
                <div className="text-center py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 font-bold">
                  Message sent successfully! We'll get back to you soon.
                </div>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !form.firstName || !form.email || !form.message}
                  className="w-full h-12 text-base font-bold bg-gradient-fw hover:opacity-90 rounded-xl shadow-[0_0_20px_rgba(74,0,224,0.35)] disabled:opacity-50"
                >
                  {submitting ? "Sending..." : <>Send it to us <ArrowRight size={16} className="ml-2" /></>}
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const AffiliateModal = ({
  open,
  mode,
  onClose,
  onSwitch,
}: {
  open: boolean;
  mode: "register" | "login";
  onClose: () => void;
  onSwitch: (m: "register" | "login") => void;
}) => {
  const [affForm, setAffForm] = useState({ name: "", username: "", email: "", paymentEmail: "", website: "", promotion: "", password: "", confirmPassword: "" });
  const [affSubmitting, setAffSubmitting] = useState(false);
  const [affSuccess, setAffSuccess] = useState(false);

  const handleAffRegister = async () => {
    if (!affForm.name || !affForm.email || !affForm.password) return;
    if (affForm.password !== affForm.confirmPassword) return;
    setAffSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/affiliate/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: affForm.name,
          email: affForm.email,
          website: affForm.website,
          promotionMethod: affForm.promotion,
        }),
      });
      if (res.ok) setAffSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setAffSubmitting(false);
    }
  };

  const benefits = [
    { icon: <CreditCard size={18} />, title: "Competitive Commissions", desc: "Earn up to 15% on every successful referral" },
    { icon: <BarChart3 size={18} />, title: "Real-Time Analytics", desc: "Track your performance with detailed dashboards" },
    { icon: <Users size={18} />, title: "Dedicated Support", desc: "Personal affiliate manager for top performers" },
    { icon: <Star size={18} />, title: "Marketing Resources", desc: "Access banners, links, and promotional content" },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-0 shadow-none overflow-hidden rounded-2xl">
        <div className="flex flex-col md:flex-row min-h-[580px]">

          {/* ── Left panel ── */}
          <div className="hidden md:flex flex-col justify-between w-[42%] shrink-0 bg-[#0f0020] p-10 rounded-l-2xl border-r border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <img src="/logo.png" alt="FundedWealth" className="h-9 w-9 rounded-lg" />
                <span className="text-xl font-heading font-bold text-white">Funded<span className="text-fw-orange">Wealth</span></span>
              </div>
              <h2 className="text-2xl font-heading font-extrabold text-white mb-3 leading-snug">
                Grow with<br />FundedWealth
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                Join our affiliate network and earn competitive commissions while helping traders achieve their goals.
              </p>
              <div className="space-y-4">
                {benefits.map((b) => (
                  <div key={b.title} className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-xl bg-fw-purple/30 border border-fw-purple/40 flex items-center justify-center text-fw-orange shrink-0">
                      {b.icon}
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold">{b.title}</div>
                      <div className="text-white/40 text-xs">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-white/20 text-xs mt-8">© 2025 FundedWealth. All rights reserved.</div>
          </div>

          {/* ── Right panel ── */}
          <div className="flex-1 bg-[#160028] rounded-r-2xl md:rounded-l-none rounded-2xl p-8 md:p-10 overflow-y-auto">
            {mode === "register" ? (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-gradient-fw flex items-center justify-center">
                    <BadgeCheck size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-base">Create Your Account</div>
                    <div className="text-white/40 text-xs">Start your earning today</div>
                  </div>
                  <button
                    onClick={onClose}
                    className="ml-auto text-white/40 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => onSwitch("login")}
                    className="text-fw-orange text-sm font-semibold hover:underline flex items-center gap-1"
                  >
                    Sign In <ArrowRight size={14} />
                  </button>
                </div>

                {affSuccess ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4"></div>
                    <h3 className="text-white font-extrabold text-xl mb-2">Application Submitted!</h3>
                    <p className="text-white/50 text-sm">We'll review your application and send your affiliate link within 24 hours.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-white/70 text-xs">Your Name <span className="text-fw-pink">*</span></Label>
                        <Input placeholder="Your full name" value={affForm.name} onChange={e => setAffForm({ ...affForm, name: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-white/70 text-xs">Username <span className="text-fw-pink">*</span></Label>
                        <Input placeholder="Choose a username" value={affForm.username} onChange={e => setAffForm({ ...affForm, username: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-white/70 text-xs">Account Email <span className="text-fw-pink">*</span></Label>
                        <Input type="email" placeholder="Enter your account email" value={affForm.email} onChange={e => setAffForm({ ...affForm, email: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-white/70 text-xs">Payment Email <span className="text-fw-pink">*</span></Label>
                        <Input type="email" placeholder="Enter your payment email" value={affForm.paymentEmail} onChange={e => setAffForm({ ...affForm, paymentEmail: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/70 text-xs">Website URL <span className="text-white/30">(optional)</span></Label>
                      <Input placeholder="https://yourwebsite.com" value={affForm.website} onChange={e => setAffForm({ ...affForm, website: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/70 text-xs">How will you promote us? <span className="text-white/30">(optional)</span></Label>
                      <Textarea
                        placeholder="Describe your promotion methods (social media, blog, etc.)"
                        rows={3}
                        value={affForm.promotion}
                        onChange={e => setAffForm({ ...affForm, promotion: e.target.value })}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-white/70 text-xs">Password <span className="text-fw-pink">*</span></Label>
                        <Input type="password" placeholder="Create a password" value={affForm.password} onChange={e => setAffForm({ ...affForm, password: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-white/70 text-xs">Confirm Password <span className="text-fw-pink">*</span></Label>
                        <Input type="password" placeholder="Confirm your password" value={affForm.confirmPassword} onChange={e => setAffForm({ ...affForm, confirmPassword: e.target.value })} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple" />
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pt-1">
                      <Checkbox id="terms" className="border-white/20 data-[state=checked]:bg-fw-purple data-[state=checked]:border-fw-purple mt-0.5" />
                      <label htmlFor="terms" className="text-white/50 text-xs leading-relaxed cursor-pointer">
                        Agree to our{" "}
                        <a href="/terms" className="text-fw-orange underline">Terms of Use</a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-fw-orange underline">Privacy Policy</a>
                      </label>
                    </div>
                    <Button
                      onClick={handleAffRegister}
                      disabled={affSubmitting || !affForm.name || !affForm.email || !affForm.password}
                      className="w-full h-12 text-base font-bold bg-gradient-fw hover:opacity-90 rounded-xl shadow-[0_0_20px_rgba(74,0,224,0.4)] mt-2 disabled:opacity-50"
                    >
                      {affSubmitting ? "Submitting..." : <>Create Account <ArrowRight size={16} className="ml-2" /></>}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-gradient-fw flex items-center justify-center">
                    <BadgeCheck size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-base">Affiliate Login</div>
                    <div className="text-white/40 text-xs">Access your affiliate dashboard</div>
                  </div>
                  <button
                    onClick={onClose}
                    className="ml-auto text-white/40 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs">Username or Email <span className="text-fw-pink">*</span></Label>
                    <Input placeholder="Enter your username or email" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs">Password <span className="text-fw-pink">*</span></Label>
                    <Input type="password" placeholder="Enter your password" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-fw-purple" />
                  </div>
                  <div className="flex justify-end">
                    <button className="text-fw-orange text-xs hover:underline">Forgot Password?</button>
                  </div>
                  <Button className="w-full h-12 text-base font-bold bg-gradient-fw hover:opacity-90 rounded-xl shadow-[0_0_20px_rgba(74,0,224,0.4)]">
                    Sign In <ArrowRight size={16} className="ml-2" />
                  </Button>
                  <div className="text-center text-white/40 text-xs pt-2">
                    Don't have an account?{" "}
                    <button onClick={() => onSwitch("register")} className="text-fw-orange font-semibold hover:underline">
                      Create one
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

const Affiliate = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"register" | "login">("register");

  const openModal = (mode: "register" | "login") => {
    setModalMode(mode);
    setModalOpen(true);
  };

  const tiers = [
    {
      name: "Starter",
      icon: "",
      commission: "30%",
      referrals: "1 – 20 sales",
      bonus: "₹5,000 at 30 sales",
      desc: "Start earning from day one! Get 30% commission on every paid referral. Only completed purchases count — no signup commissions, just real earnings.",
      color: "from-blue-500/20 to-blue-600/10",
      border: "border-blue-500/30",
      badge: "text-blue-400",
    },
    {
      name: "Pro",
      icon: "⚡",
      commission: "35%",
      referrals: "21 – 100 sales",
      bonus: "₹15,000 at 75 sales",
      desc: "After 20 sales, your commission jumps to 35% on every transaction. Hit 75 sales and unlock a ₹15,000 cash bonus as a reward.",
      color: "from-fw-orange/20 to-fw-orange/5",
      border: "border-fw-orange/40",
      badge: "text-fw-orange",
    },
    {
      name: "Elite",
      icon: "",
      commission: "40%",
      referrals: "101 – 300 sales",
      bonus: "iPhone at 150 sales",
      desc: "From your 101st sale you earn 40% commission on every transaction. Reach 150 sales and win a brand new iPhone as your milestone reward!",
      color: "from-fw-pink/20 to-fw-pink/5",
      border: "border-fw-pink/40",
      badge: "text-fw-pink",
    },
    {
      name: "Apex",
      icon: "",
      commission: "50%",
      referrals: "300+ sales",
      bonus: "MacBook + Bike",
      desc: "You've reached the summit. 50% commission on every sale. Hit 400 sales for a MacBook, 800+ sales and we reward you with a Bike!",
      color: "from-yellow-500/20 to-yellow-500/5",
      border: "border-yellow-500/40",
      badge: "text-yellow-400",
    },
  ];

  const steps = [
    { num: "01", title: "Apply", desc: "Fill out our quick affiliate application form." },
    { num: "02", title: "Get Verified", desc: "After verification you'll receive your unique affiliate link." },
    { num: "03", title: "Promote", desc: "Share your link on social media, YouTube, or WhatsApp." },
    { num: "04", title: "Track", desc: "Monitor referrals and earnings live on your affiliate dashboard." },
    { num: "05", title: "Request Payout", desc: "Request payout once you hit your commission target." },
  ];

  const bonuses = [
    { milestone: "30 Sales", title: "₹5,000 Cash", sub: "Instant bonus credited to your account", img: null },
    { milestone: "75 Sales", title: "₹15,000 Cash", sub: "+ Priority affiliate support", img: null },
    { milestone: "150 Sales", title: "iPhone 16", sub: "Brand new iPhone delivered to you!", img: "/reward-iphone.png" },
    { milestone: "400 Sales", title: "MacBook", sub: "MacBook Pro as your reward", img: "/reward-macbook.png" },
    { milestone: "800+ Sales", title: "Bike", sub: "Your dream bike — fully sponsored!", img: "/reward-bike.png" },
  ];

  return (
    <section id="affiliate" className="py-14 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-fw-purple/20 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">

        {/* ── Hero banner ── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fw-purple/30 border border-fw-purple/50 text-white text-sm font-bold mb-8">
            <MousePointerClick size={15} /> Join, Share, Earn!
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-heading font-extrabold text-white mb-6">
            Make Every{" "}
            <span className="inline-flex items-center gap-3 align-middle">
              <span className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-fw flex items-center justify-center text-3xl shadow-lg">
                <Link2 className="text-white" size={28} />
              </span>
            </span>{" "}
            <span className="text-gradient">Click Count!</span>
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
            Start earning up to <span className="text-fw-orange font-bold">50% commission</span> on every paid referral. Win iPhones, MacBooks & more!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => openModal("register")}
              className="h-13 px-8 text-base font-bold bg-gradient-fw hover:opacity-90 rounded-xl shadow-[0_0_20px_rgba(74,0,224,0.4)]"
            >
              Become An Affiliate <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => openModal("login")}
              className="h-13 px-8 text-base font-bold border-white/20 text-white hover:bg-white/10 rounded-xl"
            >
              Affiliate Login <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>

        {/* ── Tier cards ── */}
        <div className="mb-14">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-3">
              How Will Your Affiliate Journey Look?
            </h3>
            <p className="text-white/50 max-w-2xl mx-auto">
              Refer your unique link to your community and enjoy recurring commissions from the moment a trader joins FundedWealth.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative rounded-2xl bg-gradient-to-b ${t.color} border ${t.border} p-6 flex flex-col gap-4`}
              >
                <div className="text-4xl mb-1">{t.icon}</div>
                <div className={`text-xl font-heading font-bold ${t.badge}`}>{t.name}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-white/50">Commission</span>
                    <span className="font-bold text-white text-base">{t.commission}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-white/50">Monthly Referrals</span>
                    <span className="font-bold text-white">{t.referrals}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-white/50">Bonus</span>
                    <span className={`font-bold ${t.bonus === "—" ? "text-white/30" : "text-fw-orange"}`}>{t.bonus}</span>
                  </div>
                </div>
                <p className="text-white/50 text-xs leading-relaxed mt-2">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="mb-14">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-bold mb-6">
              How It Works
            </div>
            <h3 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-3">
              How Our <span className="text-gradient">Affiliate Model</span> Works?
            </h3>
            <p className="text-white/50 max-w-2xl mx-auto">
              Share your unique link and earn commissions on every sale. More referrals unlock higher tiers with bigger rewards and bonuses.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`glass-card rounded-2xl p-7 border border-white/8 ${i === 3 ? "lg:col-span-1" : ""}`}
              >
                <div className="w-12 h-12 rounded-full bg-fw-purple flex items-center justify-center text-white font-bold text-lg mb-5 shadow-[0_0_16px_rgba(74,0,224,0.5)]">
                  {s.num}
                </div>
                <div className="text-white font-heading font-bold text-xl mb-2">{s.title}</div>
                <div className="text-white/50 text-sm leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bonus milestones ── */}
        <div>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fw-orange/20 border border-fw-orange/30 text-fw-orange text-sm font-bold mb-6">
              <Gift size={14} /> Bonuses
            </div>
            <h3 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-3">
              FundedWealth <span className="text-gradient">Affiliate Bonuses</span>
            </h3>
            <p className="text-white/50 max-w-2xl mx-auto">
              Hit key referral milestones to unlock exclusive cash rewards — our way of thanking top performing affiliates.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {bonuses.map((b) => (
              <div key={b.milestone} className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col gap-3 group hover:border-fw-orange/30 transition-colors">
                {b.img ? (
                  <div className="w-full h-28 flex items-center justify-center mb-1 overflow-hidden rounded-xl bg-white/5">
                    <img src={b.img} alt={b.title} className="h-24 w-auto object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>
                ) : (
                  <Trophy className="text-fw-orange" size={28} />
                )}
                <div className="inline-block px-3 py-0.5 rounded-full bg-fw-orange/20 text-fw-orange text-xs font-bold self-start">
                  {b.milestone}
                </div>
                <div className="text-2xl font-heading font-extrabold text-white">{b.title}</div>
                <div className="text-white/50 text-sm">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Free Account Rewards ── */}
        <div className="mt-14">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold mb-6">
              <Zap size={14} /> Free Account Rewards
            </div>
            <h3 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-3">
              Earn <span className="text-gradient">FREE Evaluation Accounts</span>
            </h3>
            <p className="text-white/50 max-w-2xl mx-auto">
              Refer traders and unlock free evaluation accounts at every milestone. Same trading rules, real profit withdrawal after passing.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { sales: "10", account: "₹1L 1-Step", color: "from-green-500/20 to-green-600/10", border: "border-green-500/30", badge: "text-green-400" },
              { sales: "25", account: "₹2L 1-Step", color: "from-emerald-500/20 to-emerald-600/10", border: "border-emerald-500/30", badge: "text-emerald-400" },
              { sales: "50", account: "₹5L 1-Step", color: "from-teal-500/20 to-teal-600/10", border: "border-teal-500/30", badge: "text-teal-400" },
              { sales: "100", account: "₹5L 2-Step", color: "from-cyan-500/20 to-cyan-600/10", border: "border-cyan-500/30", badge: "text-cyan-400" },
            ].map((r) => (
              <div key={r.sales} className={`relative rounded-2xl bg-gradient-to-b ${r.color} border ${r.border} p-6 flex flex-col gap-3`}>
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                  <CreditCard className={r.badge} size={24} />
                </div>
                <div className={`text-sm font-bold ${r.badge}`}>{r.sales} Valid Sales</div>
                <div className="text-2xl font-heading font-extrabold text-white">Free {r.account}</div>
                <div className="text-white/50 text-xs">Evaluation Account</div>
                <div className="mt-2 space-y-1.5 text-xs text-white/40">
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-green-400 shrink-0" /> Unlocks after 5-7 day verification</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-green-400 shrink-0" /> One claim per milestone</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-green-400 shrink-0" /> Non-transferable</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Giveaway System ── */}
        <div className="mt-14">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fw-pink/20 border border-fw-pink/30 text-fw-pink text-sm font-bold mb-6">
                <Star size={14} /> Viral Growth Engine
              </div>
              <h3 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-4">
                Run <span className="text-gradient">Giveaways</span> & Go Viral
              </h3>
              <p className="text-white/60 mb-8 leading-relaxed">
                Once you hit <span className="text-fw-orange font-bold">50 sales</span>, unlock the ability to request <span className="text-white font-semibold">3-10 free evaluation accounts</span> (₹1L or ₹2L) to run public giveaways on your social media channels. Drive massive growth and earn commissions on every new trader!
              </p>
              <div className="space-y-4">
                {[
                  { step: "01", text: "Complete 50+ sales to unlock giveaway credits" },
                  { step: "02", text: "Request 3-10 free evaluation accounts from your dashboard" },
                  { step: "03", text: "Run giveaways on Instagram, Telegram, or YouTube" },
                  { step: "04", text: "Tag @FundedWealth — every winner is tracked to your affiliate ID" },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-fw-purple/30 flex items-center justify-center text-xs font-bold text-fw-orange shrink-0">{s.step}</div>
                    <div className="text-white/70 text-sm pt-1">{s.text}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card rounded-2xl p-8 border border-fw-pink/20">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3"></div>
                <h4 className="text-xl font-heading font-bold text-white">Giveaway Requirements</h4>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Minimum Sales", value: "50 completed" },
                  { label: "Credits Available", value: "3-10 accounts" },
                  { label: "Account Types", value: "₹1L or ₹2L Evaluation" },
                  { label: "Must Tag", value: "@FundedWealth" },
                  { label: "Platform", value: "Instagram / Telegram / YouTube" },
                  { label: "Tracking", value: "Each account linked to your ID" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/50 text-sm">{item.label}</span>
                    <span className="text-white font-semibold text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => openModal("register")}
                className="w-full mt-6 h-12 bg-gradient-to-r from-fw-pink to-fw-purple font-bold rounded-xl shadow-[0_0_20px_rgba(214,51,132,0.3)]"
              >
                Become An Affiliate <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Terms & Rules ── */}
        <div className="mt-20 glass-card rounded-2xl p-8 border border-white/10">
          <h4 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck size={20} className="text-fw-purple" /> Affiliate Terms & Conditions
          </h4>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-2 text-sm text-white/50">
            <div className="flex items-start gap-2 py-1.5"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Only completed purchases count as referrals</div>
            <div className="flex items-start gap-2 py-1.5"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> No commission for signups or logins</div>
            <div className="flex items-start gap-2 py-1.5"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Self-referral is strictly prohibited</div>
            <div className="flex items-start gap-2 py-1.5"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Refund = automatic commission reversal</div>
            <div className="flex items-start gap-2 py-1.5"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Minimum payout: ₹1,000 (5-7 day holding period)</div>
            <div className="flex items-start gap-2 py-1.5"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Payouts via UPI or Bank Transfer</div>
            <div className="flex items-start gap-2 py-1.5"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Free accounts are non-transferable & cannot be resold</div>
            <div className="flex items-start gap-2 py-1.5"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Giveaway misuse leads to immediate ban</div>
            <div className="flex items-start gap-2 py-1.5"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Rewards subject to verification before delivery</div>
            <div className="flex items-start gap-2 py-1.5"><CheckCircle2 size={14} className="text-green-400 mt-0.5 shrink-0" /> Fraudulent accounts will be suspended immediately</div>
          </div>
        </div>

      </div>

      <AffiliateModal
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSwitch={(m) => setModalMode(m)}
      />
    </section>
  );
};

const MobileAppCTA = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4A00E0]/5 to-transparent" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-white/10 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 bg-gradient-fw/10 border border-fw-orange/20 rounded-full px-4 py-1.5 w-fit mb-6">
                    <Smartphone size={14} className="text-fw-orange" />
                    <span className="text-fw-orange text-xs font-bold uppercase tracking-wider">Coming Soon</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-4">
                    FundedWealth <span className="text-gradient">Mobile App</span>
                  </h3>
                  <p className="text-white/60 mb-6">Trade on the go, track your accounts, view payouts, and manage your funded journey — all from your phone. Available soon on iOS and Android.</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white/70 text-sm">
                      <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                      <span>Real-time account monitoring & P&L tracking</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70 text-sm">
                      <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                      <span>Instant payout requests with push notifications</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70 text-sm">
                      <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                      <span>Leaderboard, scaling progress & community access</span>
                    </div>
                    <div className="flex items-center gap-3 text-white/70 text-sm">
                      <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                      <span>Biometric login & secure trading dashboard</span>
                    </div>
                  </div>
                  {!submitted ? (
                    <div className="mt-8 flex gap-2">
                      <input type="email" placeholder="Enter your email for early access" value={email} onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-fw-orange/50" />
                      <Button onClick={() => { if (email) setSubmitted(true); }}
                        className="bg-gradient-fw text-white border-0 rounded-full px-6 font-bold whitespace-nowrap">
                        <Bell size={16} className="mr-2" /> Notify Me
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-8 bg-green-500/10 border border-green-500/20 rounded-full px-5 py-3 text-center">
                      <span className="text-green-400 text-sm font-semibold">You're on the list! We'll notify you when the app launches.</span>
                    </div>
                  )}
                </div>
                <div className="bg-gradient-to-br from-[#4A00E0]/20 to-[#D63384]/20 p-8 md:p-12 flex items-center justify-center">
                  <div className="relative">
                    <div className="w-56 h-[420px] rounded-[2.5rem] border-4 border-white/20 bg-[#0D0020] shadow-2xl overflow-hidden relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl" />
                      <div className="p-4 pt-10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-gradient-fw flex items-center justify-center">
                            <img src="/logo.png" alt="" className="w-5 h-5 rounded" />
                          </div>
                          <span className="text-white text-xs font-bold">FundedWealth</span>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 mb-3">
                          <div className="text-white/40 text-[10px]">Portfolio Value</div>
                          <div className="text-green-400 font-heading font-extrabold text-lg">₹10,00,000</div>
                          <div className="text-green-400 text-[10px]">+₹1,82,000 (18.2%)</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 mb-3">
                          <div className="text-white/40 text-[10px]">Today's P&L</div>
                          <div className="text-green-400 font-bold text-sm">+₹12,500</div>
                          <div className="w-full h-1 bg-white/5 rounded-full mt-2">
                            <div className="h-1 bg-gradient-fw rounded-full" style={{ width: "72%" }} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <div className="text-white/40 text-[8px]">Win Rate</div>
                            <div className="text-white font-bold text-xs">78%</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-2 text-center">
                            <div className="text-white/40 text-[8px]">Drawdown</div>
                            <div className="text-green-400 font-bold text-xs">2.1%</div>
                          </div>
                        </div>
                        <div className="bg-gradient-fw rounded-xl p-3 text-center">
                          <span className="text-white text-xs font-bold">Request Payout</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-fw-orange to-fw-pink opacity-20 blur-xl" />
                    <div className="absolute -top-4 -left-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4A00E0] to-blue-500 opacity-20 blur-xl" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

const TrustAndSecurity = () => {
  const trustBadges = [
    { icon: Lock, title: "256-bit SSL Encryption", desc: "Bank-grade security protects all your data and transactions" },
    { icon: ShieldCheck, title: "Verified Payouts", desc: "₹45 Lakhs+ paid out to 15,000+ funded traders with proof" },
    { icon: Clock, title: "12-Hour Guaranteed Payout", desc: "Industry-fastest payout processing, guaranteed within 12 hours" },
    { icon: Banknote, title: "UPI & Bank Transfer", desc: "Direct payouts to any Indian bank account or UPI — zero hidden fees" },
    { icon: FileText, title: "Transparent Rules", desc: "Clear, published trading rules — no hidden clauses or surprises" },
    { icon: Globe, title: "15,000+ Active Traders", desc: "Trusted by traders across all 28 states and 8 union territories" },
  ];

  const companyCredentials = [
    { label: "Registered Company", value: "FundedWealth India Pvt. Ltd." },
    { label: "CIN", value: "U74999MH2024PTC000000" },
    { label: "GSTIN", value: "27AABCF0000A1Z5" },
    { label: "Registered Office", value: "Mumbai, Maharashtra, India" },
    { label: "Support Email", value: "support@fundedwealth.com" },
    { label: "Operating Since", value: "2024" },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            <ShieldCheck size={16} className="text-green-400" />
            <span className="text-green-400 text-sm font-semibold">Verified & Trusted</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-white mb-4">
            Your Trust is Our <span className="text-gradient">Priority</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            We're committed to transparency, security, and delivering real results. Here's why 15,000+ Indian traders trust FundedWealth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl border border-white/10 p-6 hover:border-green-500/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <badge.icon size={22} className="text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base mb-1">{badge.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{badge.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
              <h3 className="text-white font-heading font-bold text-lg flex items-center gap-2">
                <Building2 size={20} className="text-green-400" />
                Company Registration Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {companyCredentials.map((cred, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <span className="text-white/50 text-sm">{cred.label}</span>
                  <span className="text-white font-semibold text-sm text-right">{cred.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl border border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
              <h3 className="text-white font-heading font-bold text-lg flex items-center gap-2">
                <Award size={20} className="text-blue-400" />
                Why Traders Trust Us
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {[
                { stat: "₹45 Lakhs+", label: "Total Payouts Delivered", verified: true },
                { stat: "15,000+", label: "Active Funded Traders", verified: true },
                { stat: "12 Hours", label: "Average Payout Time", verified: true },
                { stat: "4.8/5", label: "Trader Satisfaction Rating", verified: true },
                { stat: "28+ States", label: "Traders Across India", verified: true },
                { stat: "24/7", label: "Customer Support Available", verified: true },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    {item.verified && <BadgeCheck size={14} className="text-green-400 shrink-0" />}
                    <span className="text-white/50 text-sm">{item.label}</span>
                  </div>
                  <span className="text-white font-bold text-sm">{item.stat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl border border-white/10 p-8 mb-16"
        >
          <h3 className="text-white font-heading font-bold text-xl mb-2 text-center flex items-center justify-center gap-2">
            <TrendingUp size={22} className="text-fw-orange" />
            Transparent Fee Comparison
          </h3>
          <p className="text-white/40 text-sm text-center mb-8">See exactly how FundedWealth stacks up against typical prop firms — no hidden fees, no surprises.</p>

          <div className="overflow-x-auto mb-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="text-left py-3 px-4 text-white/60 font-semibold">Account Size</th>
                  <th className="text-center py-3 px-4 text-fw-orange font-bold" colSpan={1}>FundedWealth (Flash ⚡)</th>
                  <th className="text-center py-3 px-4 text-fw-orange font-bold" colSpan={1}>FundedWealth (1-Step)</th>
                  <th className="text-center py-3 px-4 text-white/40 font-semibold">Typical Prop Firm</th>
                  <th className="text-center py-3 px-4 text-white/40 font-semibold">International Firm (USD)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { size: "₹1,00,000", flash: "₹1,399", oneStep: "₹1,049", typical: "₹3,500-5,000", intl: "$50-100 (₹4,200+)" },
                  { size: "₹2,50,000", flash: "₹2,999", oneStep: "—", typical: "₹6,000-8,000", intl: "$100-150 (₹8,400+)" },
                  { size: "₹5,00,000", flash: "₹4,599", oneStep: "₹4,199", typical: "₹9,000-12,000", intl: "$200-300 (₹16,800+)" },
                  { size: "₹10,00,000", flash: "₹7,799", oneStep: "₹7,699", typical: "₹15,000-20,000", intl: "$400-550 (₹33,600+)" },
                  { size: "₹25,00,000", flash: "—", oneStep: "₹16,974", typical: "₹35,000-50,000", intl: "$800-1,200 (₹67,200+)" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white font-bold">{row.size}</td>
                    <td className="py-3 px-4 text-center text-green-400 font-bold">{row.flash}</td>
                    <td className="py-3 px-4 text-center text-green-400 font-bold">{row.oneStep}</td>
                    <td className="py-3 px-4 text-center text-white/30">{row.typical}</td>
                    <td className="py-3 px-4 text-center text-red-400/60">{row.intl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="text-white font-heading font-bold text-lg mb-4 text-center">Feature-by-Feature Comparison</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="text-left py-3 px-4 text-white/60 font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 text-fw-orange font-bold">FundedWealth</th>
                  <th className="text-center py-3 px-4 text-white/40 font-semibold">Indian Competitors</th>
                  <th className="text-center py-3 px-4 text-white/40 font-semibold">International Firms</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Currency", fw: "₹ INR (Native)", ind: "₹ INR", intl: "$ USD Only" },
                  { feature: "Payout Speed", fw: "12 Hours ⚡", ind: "3-7 Days", intl: "7-30 Days" },
                  { feature: "Profit Split", fw: "Up to 90%", ind: "50-80%", intl: "70-80%" },
                  { feature: "Payout Method", fw: "UPI / Bank / All", ind: "Bank Transfer", intl: "Crypto / Wire Only" },
                  { feature: "Instant Funding", fw: "Flash + Instant ✅", ind: "Rare", intl: "Not Available" },
                  { feature: "Evaluation Fee Refund", fw: "100% on First Payout ✅", ind: "Varies", intl: "Rarely" },
                  { feature: "Scaling (Max Capital)", fw: "₹50 Lakhs ✅", ind: "₹10-25 Lakhs", intl: "$200K-400K" },
                  { feature: "Min Trading Days", fw: "0 (Flash) / 1", ind: "5-10 Days", intl: "5-10 Days" },
                  { feature: "Indian Support", fw: "WhatsApp + Email 24/7 ✅", ind: "Email Only", intl: "No Hindi / No IST" },
                  { feature: "Weekend Holding", fw: "Allowed ✅", ind: "Varies", intl: "Usually No" },
                  { feature: "News Trading", fw: "Allowed ✅", ind: "Restricted", intl: "Restricted" },
                  { feature: "Hidden Fees", fw: "None — All Inclusive ✅", ind: "Platform Fees", intl: "Data Fees + FX" },
                  { feature: "Free Retries", fw: "Available on Select Plans ✅", ind: "Paid Only", intl: "Paid Only" },
                  { feature: "KYC Process", fw: "Aadhaar / PAN — Easy ✅", ind: "Aadhaar / PAN", intl: "Passport + Proof" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white/70 font-medium">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-green-400 font-semibold">{row.fw}</td>
                    <td className="py-3 px-4 text-center text-white/30">{row.ind}</td>
                    <td className="py-3 px-4 text-center text-white/30">{row.intl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <p className="text-white/30 text-xs">* Competitor pricing based on publicly available data as of 2025. Actual prices may vary. FundedWealth prices shown after applicable discount codes.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-white font-heading font-bold text-xl mb-6">Payment Partners & Security</h3>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-8">
            {["Razorpay", "UPI", "Visa", "Mastercard", "Net Banking", "Google Pay", "PhonePe"].map((partner, i) => (
              <div key={i} className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm font-semibold hover:bg-white/10 hover:text-white/60 transition-all">
                {partner}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/30">
            <span className="flex items-center gap-1"><Lock size={12} /> PCI DSS Compliant</span>
            <span>•</span>
            <span className="flex items-center gap-1"><ShieldCheck size={12} /> 256-bit SSL</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Globe size={12} /> GDPR Ready</span>
            <span>•</span>
            <span className="flex items-center gap-1"><FileText size={12} /> RBI Guidelines Followed</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#0a0015] pt-20 pb-10 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="FundedWealth" className="h-12 w-12 rounded-lg grayscale hover:grayscale-0 transition-all duration-500" />
              <span className="text-2xl font-heading font-bold text-white tracking-tight">Funded<span className="text-fw-orange">Wealth</span></span>
            </Link>
            <p className="text-white/50 max-w-sm mb-4 text-lg font-medium">
              India's #1 Fastest Growing Prop Trading Firm Dedicated to Indian Traders
            </p>
            <div className="space-y-2 mb-6 text-sm text-white/40">
              <p className="flex items-center gap-2"><Building2 size={14} className="text-white/30 shrink-0" /> FundedWealth India Pvt. Ltd.</p>
              <p className="flex items-center gap-2"><MapPin size={14} className="text-white/30 shrink-0" /> Mumbai, Maharashtra, India</p>
              <p className="flex items-center gap-2"><Mail size={14} className="text-white/30 shrink-0" /> support@fundedwealth.com</p>
              <p className="flex items-center gap-2"><FileText size={14} className="text-white/30 shrink-0" /> CIN: U74999MH2024PTC000000</p>
              <p className="flex items-center gap-2"><FileText size={14} className="text-white/30 shrink-0" /> GSTIN: 27AABCF0000A1Z5</p>
            </div>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/fundedwealthind" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-fw-pink hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://x.com/fundedwealth" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-fw-orange hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://www.youtube.com/@FundedWealth" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-fw-purple hover:text-white transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#plans" className="text-white/50 hover:text-fw-orange transition-colors">Plans & Pricing</a></li>
              <li><Link href="/scaling" className="text-white/50 hover:text-fw-orange transition-colors">Scaling Plan</Link></li>
              <li><Link href="/leaderboard" className="text-white/50 hover:text-fw-orange transition-colors">Leaderboard</Link></li>
              <li><Link href="/payouts" className="text-white/50 hover:text-fw-orange transition-colors">Payout Proofs</Link></li>
              <li><Link href="/rules" className="text-white/50 hover:text-fw-orange transition-colors">Trading Rules</Link></li>
              <li><Link href="/championship" className="text-white/50 hover:text-fw-orange transition-colors">FW Championship</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/blog" className="text-white/50 hover:text-fw-orange transition-colors">Trading Blog</Link></li>
              <li><Link href="/success-stories" className="text-white/50 hover:text-fw-orange transition-colors">Success Stories</Link></li>
              <li><Link href="/community" className="text-white/50 hover:text-fw-orange transition-colors">Community</Link></li>
              <li><a href="#affiliate" className="text-white/50 hover:text-fw-orange transition-colors">Affiliate Program</a></li>
              <li><Link href="/impact" className="text-white/50 hover:text-fw-orange transition-colors">FW Impact Initiative</Link></li>
              <li><a href="#contact" className="text-white/50 hover:text-fw-orange transition-colors">Contact Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/terms" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><FileText size={14} className="text-white/30" /> Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><Lock size={14} className="text-white/30" /> Privacy Policy</Link></li>
              <li><Link href="/refund" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><Banknote size={14} className="text-white/30" /> Refund Policy</Link></li>
              <li><Link href="/rules" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><ShieldCheck size={14} className="text-white/30" /> Trading Rules</Link></li>
              <li><a href="/faq" className="text-white/50 hover:text-fw-orange transition-colors flex items-center gap-2"><Globe size={14} className="text-white/30" /> FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 space-y-4 mb-6">
          <p className="text-white/40 text-xs leading-relaxed">
            <span className="text-white/60 font-semibold">Disclaimer:</span> All information on this website is for educational purposes only and is not intended to provide financial advice. All trading on our platform is simulated. We do not operate as a broker. FundedWealth is a proprietary trading firm that provides a service to evaluate traders and fund them in a simulated environment.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="border border-white/10 rounded-xl bg-white/3 px-6 py-4">
            <p className="text-xs text-white/60 leading-relaxed">
              <span className="text-fw-orange font-bold">Risk Disclaimer:</span> Trading involves risk and may not be suitable for all individuals. FundedWealth offers skill-based evaluations using simulated trading accounts only. Past performance does not guarantee future results. Funding and payouts are subject to program rules and compliance.
            </p>
          </div>
          <div className="border border-white/10 rounded-xl bg-white/3 px-6 py-4">
            <p className="text-xs text-white/60 leading-relaxed">
              <span className="text-fw-orange font-bold">Important Notice:</span> FundedWealth India is not a SEBI-registered entity and does not provide regulated financial services, investment advice, or brokerage services. All activities on the platform are for educational and skill assessment purposes.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © 2025 FundedWealth. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 md:gap-6 text-xs text-white/30">
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/refund" className="hover:text-white/60 transition-colors">Refund Policy</Link>
            <Link href="/rules" className="hover:text-white/60 transition-colors">Trading Rules</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-fw-pink selection:text-white">
      <SEOHead canonical="/" />
      <FAQSchema />
      <ServiceSchema />
      <AnnouncementBar />
      <DiscountBar />
      <Navbar />

      <main>
        <Hero />
        <Stats />
        <IndianInstruments />
        <FWIndEdge />
        <Plans />
        <HowItWorksIND />
        <Championship />
        <TechAndBenefits />
        <Guarantee />
        <ImpactInitiative />
        <PayoutsMadeSimple />
        <LivePayouts />
        <TerminalMockup />
        <Advantages />
        <WhyChoose />
        <Calculator />
        <SmartScalingPlan />
        <SEBIBrokers />
        <Education />
        <FAQ />
        <Affiliate />
        <MobileAppCTA />
        <ContactUs />
        <WhatPeopleSay />
      </main>

      <Footer />

      {/* AUTO DEPLOY TEST */}
      <div style={{ textAlign: "center", padding: "8px", fontSize: "11px", color: "#ffffff", background: "#1a0030", letterSpacing: "0.1em" }}>
        AUTO DEPLOY TEST
      </div>
    </div>
  );
}
