/* FundedWealth Urgency System v2 — Self-Aware Discount Engine */
(function () {
    "use strict";

    // ═══════════════════════════════════════════════════════════════
    // ROUTE-BASED SUPPRESSION — No marketing on professional pages
    // ═══════════════════════════════════════════════════════════════
    const SUPPRESSED_PATHS = ["/trade", "/dashboard", "/admin", "/kyc", "/payouts", "/leaderboard", "/economic-calendar"];
    function isSupressedPage() {
        const path = window.location.pathname;
        return SUPPRESSED_PATHS.some(p => path.startsWith(p));
    }
    // Also watch for SPA navigation (React router changes URL without reload)
    let lastCheckedPath = "";
    function checkAndSuppress() {
        const path = window.location.pathname;
        if (path === lastCheckedPath) return;
        lastCheckedPath = path;
        const suppress = SUPPRESSED_PATHS.some(p => path.startsWith(p));
        const bar = document.getElementById("fw-urgency-bar");
        const popup = document.getElementById("fw-social-popup");
        const exitOv = document.getElementById("fw-exit-overlay");
        const returnBn = document.getElementById("fw-return-banner");
        if (suppress) {
            if (bar) bar.style.display = "none";
            if (popup) popup.classList.remove("fw-show");
            if (exitOv) exitOv.classList.remove("fw-show");
            if (returnBn) returnBn.style.display = "none";
            document.body.style.paddingTop = "0";
        } else {
            if (bar) bar.style.display = "";
            if (bar && !bar.style.display) document.body.style.paddingTop = "42px";
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // DATA
    // ═══════════════════════════════════════════════════════════════
    const MALE_NAMES = ["Rahul", "Amit", "Vikram", "Arjun", "Rohan", "Karan", "Nikhil", "Deepak", "Manish", "Saurabh", "Rajesh", "Suresh", "Anil", "Pradeep", "Gaurav", "Harsh", "Varun", "Akash", "Mohit", "Ankit", "Ravi", "Sachin", "Ajay", "Vivek", "Pankaj", "Ashish", "Naveen", "Sandeep", "Manoj", "Tushar"];
    const FEMALE_NAMES = ["Priya", "Sneha", "Ananya", "Divya", "Neha", "Kavita", "Ritu", "Swati", "Pooja", "Meera", "Shruti", "Nisha", "Anjali", "Simran", "Tanvi", "Aisha", "Isha", "Kriti", "Sakshi", "Aditi", "Pallavi", "Rashmi", "Sonal", "Jyoti", "Komal", "Bhavna", "Megha", "Shweta", "Preeti", "Nikita"];
    const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kochi", "Chandigarh", "Indore", "Bhopal", "Nagpur", "Vizag", "Coimbatore", "Surat", "Vadodara", "Patna", "Ranchi", "Guwahati", "Dehradun", "Noida", "Gurgaon", "Thane", "Mysore", "Mangalore", "Bhubaneswar", "Raipur"];
    const PLANS = ["₹50K Flash", "₹1L Flash", "₹2.5L Flash", "₹1L Instant", "₹5L Instant", "₹10L Instant", "₹1L 1-Step", "₹5L 1-Step", "₹10L 1-Step", "₹25L 1-Step", "₹5L 2-Step", "₹10L 2-Step", "₹25L 2-Step"];
    const ACTIONS = ["just purchased", "just got funded", "just received payout of"];

    function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
    function pick(arr) { return arr[rand(0, arr.length - 1)] }
    function randName() { return Math.random() > .5 ? pick(MALE_NAMES) : pick(FEMALE_NAMES) }
    function fmtTime(s) { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60; return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s` : `${m}m ${String(sec).padStart(2, "0")}s` }
    function fmtINR(n) { return "₹" + n.toLocaleString("en-IN") }

    // ═══════════════════════════════════════════════════════════════
    // SELF-AWARE DISCOUNT SCANNER
    // ═══════════════════════════════════════════════════════════════
    let PRIMARY_DISCOUNT = 0;
    let DISCOUNT_LIST = [];
    let PROMO_CODES = [];

    function scanDiscounts() {
        const discounts = new Set();
        const codes = new Set();
        const body = document.body;
        if (!body) return;

        // Walk all text nodes and visible elements
        const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null);
        while (walker.nextNode()) {
            const text = walker.currentNode.textContent || "";

            // Find "X% OFF" or "X% off" patterns
            const offMatches = text.match(/(\d{1,3})\s*%\s*(?:OFF|off|Off)/g);
            if (offMatches) {
                offMatches.forEach(m => {
                    const num = parseInt(m.match(/(\d+)/)[1]);
                    if (num >= 5 && num <= 95) discounts.add(num);
                });
            }

            // Find promo codes: "Code: XXXX" or "Use code XXXX" or "code XXXX"
            const codeMatches = text.match(/(?:code[:\s]+|Code[:\s]+|CODE[:\s]+)([A-Z0-9]{2,15})/g);
            if (codeMatches) {
                codeMatches.forEach(m => {
                    const code = m.replace(/^(?:code[:\s]+|Code[:\s]+|CODE[:\s]+)/i, "").trim();
                    if (code.length >= 2 && code.length <= 15 && /^[A-Z0-9]+$/.test(code)) codes.add(code);
                });
            }
        }

        // Also scan elements with specific patterns
        document.querySelectorAll("[class*='discount'],[class*='off'],[class*='coupon'],[class*='code']").forEach(el => {
            const t = el.textContent || "";
            const m = t.match(/(\d{1,3})\s*%/);
            if (m) { const n = parseInt(m[1]); if (n >= 5 && n <= 95) discounts.add(n) }
        });

        // Update globals
        DISCOUNT_LIST = [...discounts].sort((a, b) => b - a);
        PRIMARY_DISCOUNT = DISCOUNT_LIST.length > 0 ? DISCOUNT_LIST[0] : 0;
        PROMO_CODES = [...codes];

        // Fallback codes from known site codes if none found in DOM yet
        if (PROMO_CODES.length === 0) {
            // Will be populated once React renders the pricing section
            const knownCodes = ["BAPPA"];
            PROMO_CODES = knownCodes;
        }
        if (PRIMARY_DISCOUNT === 0) PRIMARY_DISCOUNT = 60;// fallback until DOM renders
    }

    // MutationObserver: re-scan when DOM changes
    let scanTimeout = null;
    function setupObserver() {
        const observer = new MutationObserver(() => {
            if (scanTimeout) clearTimeout(scanTimeout);
            scanTimeout = setTimeout(scanDiscounts, 2000);
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }

    // Helper: get best discount text
    function getDiscountText() {
        return PRIMARY_DISCOUNT > 0 ? `${PRIMARY_DISCOUNT}% OFF` : "Special Offer";
    }
    function getPrimaryCode() {
        return PROMO_CODES.length > 0 ? PROMO_CODES[0] : "";
    }
    function getRandomCode() {
        return PROMO_CODES.length > 0 ? pick(PROMO_CODES) : "";
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPONENT 1: SMART COUNTDOWN TIMER
    // ═══════════════════════════════════════════════════════════════
    const TIMER_KEY = "fw_urgency_timer";
    let timerSeconds = 0;
    function initTimer() {
        const stored = localStorage.getItem(TIMER_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            const elapsed = Math.floor((Date.now() - data.startedAt) / 1000);
            const remaining = data.duration - elapsed;
            if (remaining > 0) { timerSeconds = remaining; return }
        }
        resetTimer();
    }
    function resetTimer() {
        const duration = rand(7200, 28800);
        timerSeconds = duration;
        localStorage.setItem(TIMER_KEY, JSON.stringify({ duration, startedAt: Date.now() }));
    }
    function tickTimer() {
        timerSeconds--;
        if (timerSeconds <= 0) {
            const duration = rand(10800, 32400);
            timerSeconds = duration;
            localStorage.setItem(TIMER_KEY, JSON.stringify({ duration, startedAt: Date.now() }));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPONENT 2: DYNAMIC SLOTS COUNTER
    // ═══════════════════════════════════════════════════════════════
    const SLOTS_KEY = "fw_urgency_slots";
    let slots = { small: 0, mid: 0, large: 0 };
    function initSlots() {
        const stored = localStorage.getItem(SLOTS_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            if (Date.now() - data.ts < 86400000) { slots = data.slots; return }
        }
        slots = { small: rand(11, 49), mid: rand(8, 31), large: rand(5, 18) };
        saveSlots();
    }
    function saveSlots() { localStorage.setItem(SLOTS_KEY, JSON.stringify({ slots, ts: Date.now() })) }
    function decrementSlot() {
        const which = pick(["small", "mid", "large"]);
        if (slots[which] > 6) { slots[which]--; saveSlots() }
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPONENT 3: SOCIAL PROOF POPUPS
    // ═══════════════════════════════════════════════════════════════
    const SHOWN_KEY = "fw_shown_proofs";
    let shownSet = new Set();
    function initShown() { try { const s = sessionStorage.getItem(SHOWN_KEY); if (s) shownSet = new Set(JSON.parse(s)) } catch { } }
    function saveShown() { try { sessionStorage.setItem(SHOWN_KEY, JSON.stringify([...shownSet])) } catch { } }

    function generateProof() {
        let combo, attempts = 0;
        do {
            const name = randName();
            const city = pick(CITIES);
            const actionIdx = rand(0, 2);
            let extra = "";
            if (actionIdx === 0) {
                extra = pick(PLANS);
                // Append code if available
                const code = getRandomCode();
                if (code) extra += ` (code: ${code})`;
            }
            else if (actionIdx === 1) extra = pick(PLANS);
            else extra = fmtINR(rand(1200, 220000));
            combo = `${name}|${city}|${actionIdx}|${extra}`;
            attempts++;
        } while (shownSet.has(combo) && attempts < 100);
        shownSet.add(combo); saveShown();
        const parts = combo.split("|");
        return { name: parts[0], city: parts[1], actionIdx: parseInt(parts[2]), extra: parts[3] };
    }

    let popupEl = null;
    function showSocialPopup() {
        if (!popupEl || isSupressedPage()) return;
        const proof = generateProof();
        let text = "";
        if (proof.actionIdx === 0) text = `<strong>${proof.name}</strong> from ${proof.city} <span class="fw-sp-action">just purchased</span> ${proof.extra}`;
        else if (proof.actionIdx === 1) text = `<strong>${proof.name}</strong> from ${proof.city} <span class="fw-sp-action">just got funded</span> on ${proof.extra}`;
        else text = `<strong>${proof.name}</strong> from ${proof.city} <span class="fw-sp-action">just received payout</span> of <span class="fw-sp-action">${proof.extra}</span>`;
        const timeAgo = rand(1, 12) + " min ago";
        popupEl.innerHTML = `<span class="fw-sp-close" onclick="this.parentElement.classList.remove('fw-show')">&times;</span><div class="fw-sp-row"><div class="fw-sp-avatar">${proof.name[0]}</div><div><div class="fw-sp-text">${text}</div><div class="fw-sp-time">${timeAgo}</div></div></div>`;
        popupEl.classList.add("fw-show");
        setTimeout(() => { popupEl.classList.remove("fw-show") }, 5000);
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPONENT 4: DYNAMIC STICKY BAR (uses scanned discounts)
    // ═══════════════════════════════════════════════════════════════
    let barEl = null, barMsgEl = null, barIdx = 0;
    function getBarMessage() {
        const discount = getDiscountText();
        const code = getPrimaryCode();
        const codeHtml = code ? ` | Code: <span class="fw-code">${code}</span>` : "";
        const msgs = [
            `🔴 LIVE: Flash Sale — <span class="fw-highlight">${discount}</span>${codeHtml} | Only <span class="fw-highlight">${slots.small}</span> spots left`,
            `⚡ <span class="fw-highlight">${rand(47, 312)}</span> traders joined FundedWealth today | Don't miss out`,
            `🏆 <span class="fw-highlight">${fmtINR(rand(140000, 200000))}</span> paid out to traders today | Join now`,
            `⏰ Sale ends in <span class="fw-highlight">${fmtTime(timerSeconds)}</span> | Prices going up soon`,
            `🟢 <span class="fw-highlight">${randName()}</span> from ${pick(CITIES)} just got funded | You're next`
        ];
        return msgs[barIdx % msgs.length];
    }
    function rotateBar() {
        if (!barMsgEl) return;
        barMsgEl.classList.add("fw-fade-out");
        setTimeout(() => {
            barIdx++;
            barMsgEl.innerHTML = getBarMessage();
            barMsgEl.classList.remove("fw-fade-out");
        }, 400);
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPONENT 5: EXIT INTENT (uses scanned codes)
    // ═══════════════════════════════════════════════════════════════
    const EXIT_KEY = "fw_exit_count";
    let exitOverlay = null;
    function getExitCount() { try { return parseInt(sessionStorage.getItem(EXIT_KEY) || "0") } catch { return 0 } }
    function setExitCount(n) { try { sessionStorage.setItem(EXIT_KEY, String(n)) } catch { } }

    function showExitIntent() {
        if (isSupressedPage()) return;
        const count = getExitCount();
        if (count >= 3) return;
        setExitCount(count + 1);
        const siteCode = getPrimaryCode();
        let html = "";
        if (count === 0) {
            html = `<div class="fw-exit-modal" style="position:relative"><button class="fw-exit-close" onclick="document.querySelector('.fw-exit-overlay').classList.remove('fw-show')">&times;</button><h3>Wait! Extra 10% OFF 🎁</h3><p>We don't want you to miss this. Use this exclusive code for an additional 10% discount on any plan${siteCode ? ` (stack with ${siteCode}!)` : ""}</p><div class="fw-exit-code">WAIT10</div><div class="fw-exit-timer">Expires in 10 minutes</div><a href="/checkout" class="fw-exit-btn">Claim My Discount →</a><button class="fw-exit-dismiss" onclick="document.querySelector('.fw-exit-overlay').classList.remove('fw-show')">No thanks, I'll pay full price</button></div>`;
        } else if (count === 1) {
            html = `<div class="fw-exit-modal" style="position:relative;border-color:rgba(255,138,61,.5)"><button class="fw-exit-close" onclick="document.querySelector('.fw-exit-overlay').classList.remove('fw-show')">&times;</button><h3>Last Chance! 🚀</h3><p>Free ₹499 bonus has been added to your account. Complete your purchase now to claim it.</p><div class="fw-exit-code" style="border-color:#4dd4ff;color:#4dd4ff;background:rgba(77,212,255,.1)">₹499 BONUS</div><p style="color:rgba(255,255,255,.5);font-size:12px">Applied automatically at checkout</p><a href="/checkout" class="fw-exit-btn" style="background:linear-gradient(90deg,#4A00E0,#8E2DE2)">Go to Checkout →</a><button class="fw-exit-dismiss" onclick="document.querySelector('.fw-exit-overlay').classList.remove('fw-show')">Maybe later</button></div>`;
        } else {
            html = `<div class="fw-exit-modal" style="position:relative;border-color:rgba(34,197,94,.5)"><button class="fw-exit-close" onclick="document.querySelector('.fw-exit-overlay').classList.remove('fw-show')">&times;</button><h3>Ok, you win... 😅</h3><p>Here's our secret code that nobody else gets. 15% off any plan. This won't appear again.</p><div class="fw-exit-code" style="border-color:#22c55e;color:#22c55e;background:rgba(34,197,94,.1)">SECRET15</div><a href="/checkout" class="fw-exit-btn" style="background:linear-gradient(90deg,#22c55e,#16a34a)">Use Secret Code →</a><button class="fw-exit-dismiss" onclick="document.querySelector('.fw-exit-overlay').classList.remove('fw-show')">I really don't want a discount</button></div>`;
        }
        exitOverlay.innerHTML = html;
        exitOverlay.classList.add("fw-show");
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPONENT 6: RETURN VISITOR
    // ═══════════════════════════════════════════════════════════════
    const VISIT_KEY = "fw_first_visit";
    function checkReturnVisitor() {
        const first = localStorage.getItem(VISIT_KEY);
        if (!first) { localStorage.setItem(VISIT_KEY, String(Date.now())); return null }
        const elapsed = Date.now() - parseInt(first);
        const hours = elapsed / 3600000;
        if (hours < 0.1) return null;
        if (hours < 24) return `Welcome back! Your reserved price expires in ${Math.ceil(24 - hours)} hours ⏰`;
        if (hours < 72) return "Prices have increased since your last visit — lock in the old price now 🔒";
        return "Special loyalty offer — extra 5% off just for coming back! Code: LOYAL5 💜";
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPONENT 7: LIVE STATS
    // ═══════════════════════════════════════════════════════════════
    const STATS_KEY = "fw_live_stats";
    let stats = { paidOut: 0, funded: 0, active: 0, ts: 0 };
    function initStats() {
        const stored = localStorage.getItem(STATS_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            if (Date.now() - data.ts < 3600000) { stats = data; return }
        }
        stats = { paidOut: rand(12, 28), funded: rand(23, 67), active: rand(134, 389), ts: Date.now() };
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }
    function tickStats() {
        if (Math.random() < .3) stats.paidOut = Math.min(stats.paidOut + rand(0, 1), 45);
        if (Math.random() < .2) stats.funded = Math.min(stats.funded + 1, 120);
        stats.active += rand(-2, 3);
        if (stats.active < 100) stats.active = rand(134, 200);
        if (stats.active > 500) stats.active = rand(300, 389);
        localStorage.setItem(STATS_KEY, JSON.stringify({ ...stats, ts: Date.now() }));
    }

    // ═══════════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════════
    function init() {
        // SUPPRESSION: No marketing on professional trading pages
        if (isSupressedPage()) return;

        initTimer(); initSlots(); initShown(); initStats();

        // Initial discount scan (DOM may not be fully rendered yet by React)
        scanDiscounts();

        // Setup MutationObserver for auto-updating when React renders
        setupObserver();

        // Re-scan after React likely finishes rendering
        setTimeout(scanDiscounts, 3000);
        setTimeout(scanDiscounts, 6000);

        // Watch for SPA route changes (React router)
        setInterval(checkAndSuppress, 1000);

        // Create sticky bar
        barEl = document.createElement("div"); barEl.className = "fw-urgency-bar"; barEl.id = "fw-urgency-bar";
        barMsgEl = document.createElement("div"); barMsgEl.className = "fw-bar-msg"; barMsgEl.innerHTML = getBarMessage();
        const closeBtn = document.createElement("span"); closeBtn.className = "fw-bar-close"; closeBtn.innerHTML = "&times;"; closeBtn.onclick = () => { barEl.style.display = "none"; document.body.style.paddingTop = "0" };
        barEl.appendChild(barMsgEl); barEl.appendChild(closeBtn);
        document.body.prepend(barEl);
        document.body.style.paddingTop = "42px";

        // Create social proof popup
        popupEl = document.createElement("div"); popupEl.className = "fw-social-popup"; popupEl.id = "fw-social-popup";
        document.body.appendChild(popupEl);

        // Create exit intent overlay
        exitOverlay = document.createElement("div"); exitOverlay.className = "fw-exit-overlay"; exitOverlay.id = "fw-exit-overlay";
        exitOverlay.onclick = (e) => { if (e.target === exitOverlay) exitOverlay.classList.remove("fw-show") };
        document.body.appendChild(exitOverlay);

        // Return visitor banner
        const returnMsg = checkReturnVisitor();
        if (returnMsg) {
            const banner = document.createElement("div"); banner.className = "fw-return-banner"; banner.id = "fw-return-banner";
            banner.innerHTML = `${returnMsg} <span class="fw-rb-close" onclick="this.parentElement.remove()">&times;</span>`;
            document.body.appendChild(banner);
            setTimeout(() => banner.classList.add("fw-show"), 1500);
            setTimeout(() => banner.remove(), 12000);
        }

        // Timers
        setInterval(tickTimer, 1000);
        setInterval(rotateBar, 8000);
        setInterval(() => decrementSlot(), rand(60, 180) * 1000);
        setInterval(tickStats, rand(45, 90) * 1000);

        // Social proof popups every 25-45s
        function schedulePopup() {
            setTimeout(() => { showSocialPopup(); schedulePopup() }, rand(25000, 45000));
        }
        setTimeout(schedulePopup, rand(8000, 15000));

        // Exit intent (desktop only)
        document.addEventListener("mouseout", (e) => {
            if (e.clientY < 5 && !exitOverlay.classList.contains("fw-show")) {
                showExitIntent();
            }
        });

        // Update bar timer every second
        setInterval(() => {
            if (barMsgEl && barMsgEl.innerHTML.includes("Sale ends in")) {
                barMsgEl.innerHTML = getBarMessage();
            }
        }, 1000);
    }

    // Wait for DOM
    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init) }
    else { init() }

})();
