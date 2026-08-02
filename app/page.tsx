"use client";

import Link from "next/link";
import { useRef, useEffect, useState, useCallback } from "react";

// ─── constants ──────────────────────────────────────────────
const OPPORTUNITIES = [
  { tag: "Scholarship", color: "var(--lime)", title: "Full-Ride STEM Scholarship", meta: "Merit-based · Undergraduate", loc: "GLOBAL", deadline: "12 days left" },
  { tag: "Football Trial", color: "var(--magenta)", title: "Trial Day: Riverside FC U21s", meta: "Open trial · Ages 17–21", loc: "MANCHESTER, UK", deadline: "4 days left" },
  { tag: "Creative Gig", color: "var(--violet)", title: "Freelance Set Designer", meta: "Music video shoot · 3 days", loc: "LOS ANGELES, US", deadline: "1 week left" },
  { tag: "Internship", color: "var(--cyan)", title: "Product Design Intern", meta: "3 months · Remote-friendly", loc: "BERLIN, DE", deadline: "19 days left" },
  { tag: "Full-time Role", color: "var(--orange)", title: "Junior Data Analyst", meta: "Entry-level · Full-time", loc: "LAGOS, NG", deadline: "2 weeks left" },
  { tag: "Casting Call", color: "var(--magenta)", title: "Runway Casting Call", meta: "Fashion Week prep", loc: "PARIS, FR", deadline: "6 days left" },
];

const CATEGORIES = [
  "SCHOLARSHIPS", "INTERNSHIPS", "FOOTBALL TRIALS", "CREATIVE GIGS",
  "FULL-TIME ROLES", "CASTING CALLS", "GRANTS", "APPRENTICESHIPS",
];

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_/[]{}=+*^?#0123456789";

const CARD_HTML = (o: typeof OPPORTUNITIES[number]) => `
  <span class="tag"><span class="swatch" style="background:${o.color}"></span>${o.tag}</span>
  <h3>${o.title}</h3>
  <div class="meta">${o.meta}</div>
  <div class="loc">${o.loc}</div>
  <div class="spacer"></div>
  <div class="foot">
    <div class="deadline">Closes in<br><b>${o.deadline}</b></div>
    <div class="go"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 11L11 3M11 3H5M11 3V9" stroke="#f6f4f1" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  </div>`;

// ─── GSAP is loaded — wait helper ───────────────────────────
function useGsapReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      if ((window as any).gsap && (window as any).ScrollTrigger) {
        setReady(true);
        clearInterval(id);
      }
    }, 100);
    return () => clearInterval(id);
  }, []);
  return ready;
}

// ─── Landing Page ───────────────────────────────────────────
export default function LandingPage() {
  const gsapReady = useGsapReady();
  const headerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const deckStageRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const navLogoRef = useRef<HTMLDivElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const marqueeR1Ref = useRef<HTMLDivElement>(null);
  const marqueeR2Ref = useRef<HTMLDivElement>(null);
  const chaosTabsRef = useRef<HTMLDivElement>(null);
  const cleanCardRef = useRef<HTMLDivElement>(null);
  const transformPinRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── scramble links ──────────────────────────────────────
  const handleScramble = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const original = el.dataset.orig || el.textContent || "";
    el.dataset.orig = original;
    clearInterval((el as any)._sInt);
    let iterations = 0;
    (el as any)._sInt = setInterval(() => {
      el.textContent = original.split("").map((ch, i) => {
        if (ch === " ") return " ";
        if (i < iterations) return original[i];
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join("");
      iterations += 0.5;
      if (iterations >= original.length) { clearInterval((el as any)._sInt); el.textContent = original; }
    }, 28);
  }, []);

  // ── glitch logo ─────────────────────────────────────────
  const handleGlitch = useCallback(() => {
    const el = navLogoRef.current;
    if (!el) return;
    el.classList.add("glitching");
    setTimeout(() => el.classList.remove("glitching"), 350);
  }, []);

  // ── deck logic ──────────────────────────────────────────
  const [order, setOrder] = useState([...OPPORTUNITIES]);
  const cardElsRef = useRef<HTMLDivElement[]>([]);

  const advanceDeck = useCallback((dir: "left" | "right" | "up") => {
    const cards = cardElsRef.current;
    const top = cards[cards.length - 1];
    if (!top) return;
    top.style.transition = "transform .4s ease, opacity .4s ease";
    const flyX = dir === "left" ? -460 : dir === "right" ? 460 : 0;
    const flyY = dir === "up" ? -460 : 40;
    const rot = dir === "left" ? -20 : dir === "right" ? 20 : 0;
    top.style.transform = `translate(${flyX}px, ${flyY}px) rotate(${rot}deg)`;
    top.style.opacity = "0";
    setTimeout(() => {
      setOrder((prev) => {
        const next = [...prev];
        next.push(next.shift()!);
        return next;
      });
    }, 380);
  }, []);

  const layoutDeck = useCallback(() => {
    cardElsRef.current.forEach((el, i) => {
      const depth = cardElsRef.current.length - 1 - i;
      el.style.zIndex = String(i);
      if (el.classList.contains("dragging")) return;
      el.style.transition = "transform .4s cubic-bezier(.16,1,.3,1), opacity .4s ease";
      el.style.transform = `translateY(${depth * 10}px) scale(${1 - depth * 0.045}) rotate(0deg)`;
      el.style.opacity = depth > 2 ? "0" : "1";
    });
  }, []);

  // Rebuild deck when order changes
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    deck.innerHTML = "";
    cardElsRef.current = [];
    const visible = order.slice(0, 4);
    visible.forEach((o) => {
      const el = document.createElement("div");
      el.className = "opp-card";
      el.style.setProperty("--card-glow", o.color);
      el.innerHTML = CARD_HTML(o);
      deck.appendChild(el);
      cardElsRef.current.push(el);
    });
    layoutDeck();
    bindTopCard();
  }, [order, layoutDeck]);

  function bindTopCard() {
    const cards = cardElsRef.current;
    const top = cards[cards.length - 1];
    if (!top) return;
    let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;
    const onDown = (e: MouseEvent | TouchEvent) => {
      dragging = true;
      top.classList.add("dragging");
      top.style.transition = "none";
      const p = "touches" in e ? e.touches[0] : e;
      startX = p.clientX; startY = p.clientY;
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const p = "touches" in e ? e.touches[0] : e;
      dx = p.clientX - startX; dy = p.clientY - startY;
      top.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.06}deg)`;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      top.classList.remove("dragging");
      if (dx > 110) advanceDeck("right");
      else if (dx < -110) advanceDeck("left");
      else if (dy < -110) advanceDeck("up");
      else layoutDeck();
      dx = 0; dy = 0;
    };
    top.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    top.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
  }

  // ── auto-timer for deck ──────────────────────────────
  useEffect(() => {
    const section = document.getElementById("deckSection");
    const startTimer = () => {
      timerRef.current = setInterval(() => advanceDeck(Math.random() > 0.5 ? "right" : "left"), 4200);
    };
    startTimer();
    const pause = () => { if (timerRef.current) clearInterval(timerRef.current); };
    section?.addEventListener("mouseenter", pause);
    section?.addEventListener("mouseleave", startTimer);
    return () => {
      pause();
      section?.removeEventListener("mouseenter", pause);
      section?.removeEventListener("mouseleave", startTimer);
    };
  }, [advanceDeck]);

  // ── deck section perspective tilt ────────────────────
  const handleDeckMouseMove = useCallback((e: React.MouseEvent) => {
    const stage = deckStageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    stage.style.transform = `rotateX(${(py - 0.5) * -10}deg) rotateY(${(px - 0.5) * 10}deg)`;
  }, []);

  const handleDeckMouseLeave = useCallback(() => {
    if (deckStageRef.current) deckStageRef.current.style.transform = "";
  }, []);

  // ── custom cursor ────────────────────────────────────
  useEffect(() => {
    if (window.matchMedia("(pointer:coarse)").matches) return;
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; dot.style.left = mx + "px"; dot.style.top = my + "px"; };
    const loop = () => { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.left = rx + "px"; ring.style.top = ry + "px"; requestAnimationFrame(loop); };
    window.addEventListener("mousemove", onMove);
    loop();
    const els = document.querySelectorAll("a,button,.tilt,input,summary");
    const addHover = () => ring.classList.add("hover");
    const removeHover = () => ring.classList.remove("hover");
    els.forEach((el) => { el.addEventListener("mouseenter", addHover); el.addEventListener("mouseleave", removeHover); });
    return () => {
      window.removeEventListener("mousemove", onMove);
      els.forEach((el) => { el.removeEventListener("mouseenter", addHover); el.removeEventListener("mouseleave", removeHover); });
    };
  }, []);

  // ── scroll header border ─────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      headerRef.current?.classList.toggle("scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── IntersectionObserver reveals ─────────────────────
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ── magnetic buttons ─────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      const me = e as MouseEvent;
      const x = me.clientX - r.left - r.width / 2;
      const y = me.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    };
    const leave = (e: Event) => { (e.currentTarget as HTMLElement).style.transform = ""; };
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", handler);
      el.addEventListener("mouseleave", leave);
    });
    return () => {
      document.querySelectorAll(".magnetic").forEach((el) => {
        el.removeEventListener("mousemove", handler);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  // ── tilt cards ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      const me = e as MouseEvent;
      const px = (me.clientX - r.left) / r.width;
      const py = (me.clientY - r.top) / r.height;
      el.style.transform = `perspective(700px) rotateX(${(py - 0.5) * -9}deg) rotateY(${(px - 0.5) * 9}deg) translateZ(6px)`;
    };
    const leave = (e: Event) => { (e.currentTarget as HTMLElement).style.transform = ""; };
    document.querySelectorAll(".tilt").forEach((el) => {
      el.addEventListener("mousemove", handler);
      el.addEventListener("mouseleave", leave);
    });
    return () => {
      document.querySelectorAll(".tilt").forEach((el) => {
        el.removeEventListener("mousemove", handler);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  // ── GSAP animations (require GSAP + ScrollTrigger) ───
  useEffect(() => {
    if (!gsapReady) return;
    const gsap = (window as any).gsap;
    const ScrollTrigger = (window as any).ScrollTrigger;

    // before/after transform
    const tabs = chaosTabsRef.current?.querySelectorAll(".chaos-tab");
    if (tabs) {
      gsap.to(tabs, {
        x: (_i: number, t: HTMLElement) => parseFloat(t.dataset.x || "0") * 4,
        y: (_i: number, t: HTMLElement) => parseFloat(t.dataset.y || "0") * 4,
        rotate: (_i: number, t: HTMLElement) => parseFloat(t.dataset.r || "0") * 3,
        opacity: 0, stagger: 0.05, ease: "power1.in",
        scrollTrigger: { trigger: "#transformPin", start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
    }
    const cc = cleanCardRef.current;
    if (cc) {
      gsap.fromTo(cc, { scale: 0.7, opacity: 0.4 }, {
        scale: 1, opacity: 1, ease: "power1.out",
        scrollTrigger: { trigger: "#transformPin", start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
    }

    // stat count-up
    document.querySelectorAll(".stat .num").forEach((el) => {
      const raw = el.textContent?.trim() || "";
      const match = raw.match(/([\d.]+)(.*)/);
      if (!match) return;
      const target = parseFloat(match[1]);
      const suffix = match[2];
      const isDecimal = raw.includes(".");
      el.textContent = (isDecimal ? "0.0" : "0") + suffix;
      ScrollTrigger.create({
        trigger: el, start: "top 90%",
        onEnter: () => {
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target, duration: 1.6, ease: "power2.out",
            onUpdate: () => { el.textContent = (isDecimal ? obj.v.toFixed(1) : Math.round(obj.v)) + suffix; },
          });
        },
      });
    });

    // statement scroll word reveal
    const stmtEl = statementRef.current;
    if (stmtEl) {
      const html = stmtEl.innerHTML;
      const parts = html.split(/(<span class="accent">|<\/span>|\s+)/).filter(Boolean);
      let out = ""; let inAccent = false;
      parts.forEach((p) => {
        if (p === '<span class="accent">') { inAccent = true; return; }
        if (p === "</span>") { inAccent = false; return; }
        if (/^\s+$/.test(p)) { out += p; return; }
        out += `<span class="word${inAccent ? " accent" : ""}">${p}</span> `;
      });
      stmtEl.innerHTML = out;
      const words = stmtEl.querySelectorAll(".word");
      gsap.to(words, {
        opacity: 1, stagger: 0.04, ease: "none",
        scrollTrigger: { trigger: stmtEl, start: "top 85%", end: "bottom 40%", scrub: 0.4 },
      });
    }
  }, [gsapReady]);

  // ── particle canvas title ────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const wrap = canvas.parentElement!;
    const palette = ["#d6ff3f", "#2af5cf", "#ff2e9f", "#9b5cff"];
    let W = 0, H = 0;
    let particles: { tx: number; ty: number; x: number; y: number; vx: number; vy: number; color: string; size: number }[] = [];
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap.clientWidth; H = wrap.clientHeight;
      const c = canvas as HTMLCanvasElement;
      c.width = W * dpr; c.height = H * dpr;
      c.style.width = W + "px"; c.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sample();
    }
    function sample() {
      const off = document.createElement("canvas");
      off.width = W; off.height = H;
      const octx = off.getContext("2d")!;
      let fs = 200;
      octx.font = `700 ${fs}px 'Space Grotesk', sans-serif`;
      let tw = octx.measureText("BLACKSPACE").width;
      fs = fs * (W * 0.9) / tw;
      octx.font = `700 ${fs}px 'Space Grotesk', sans-serif`;
      octx.fillStyle = "#fff"; octx.textAlign = "center"; octx.textBaseline = "middle";
      octx.fillText("BLACKSPACE", W / 2, H / 2 + fs * 0.04);
      const data = octx.getImageData(0, 0, W, H).data;
      const gap = Math.max(3, Math.floor(W / 230));
      const pts: { x: number; y: number }[] = [];
      for (let y = 0; y < H; y += gap) {
        for (let x = 0; x < W; x += gap) {
          const idx = (y * W + x) * 4;
          if (data[idx + 3] > 128) pts.push({ x, y });
        }
      }
      pts.sort(() => Math.random() - 0.5);
      particles = pts.map((p) => ({
        tx: p.x, ty: p.y,
        x: W / 2 + (Math.random() - 0.5) * W * 1.4,
        y: H / 2 + (Math.random() - 0.5) * H * 1.4,
        vx: 0, vy: 0,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: Math.random() * 1.5 + 0.9,
      }));
    }
    function animate() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        const dx = p.tx - p.x, dy = p.ty - p.y;
        p.vx += dx * 0.045; p.vy += dy * 0.045;
        const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        const dist = Math.hypot(mdx, mdy);
        if (dist < 65) { const f = (65 - dist) / 65; p.vx += (mdx / (dist || 1)) * f * 4; p.vy += (mdy / (dist || 1)) * f * 4; }
        p.vx *= 0.82; p.vy *= 0.82; p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(animate);
    }
    const onMouseMove = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); };
    window.addEventListener("resize", onResize);
    resize(); animate();
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // ── marquee builder ───────────────────────────────────
  useEffect(() => {
    const build = (el: HTMLDivElement | null, fillEvery: number) => {
      if (!el) return;
      let html = "";
      for (let rep = 0; rep < 2; rep++) {
        CATEGORIES.forEach((c, i) => {
          const filled = i % fillEvery === 0;
          html += `<span class="marquee-item${filled ? " fill" : ""}">${c}<span class="mq-sep"></span></span>`;
        });
      }
      el.innerHTML = html;
    };
    build(marqueeR1Ref.current, 3);
    build(marqueeR2Ref.current, 2);
  }, []);

  // ── FAQ fix ───────────────────────────────────────────
  useEffect(() => {
    document.querySelectorAll(".faq-item summary").forEach((s) => {
      if (!s.nextElementSibling || !s.nextElementSibling.classList.contains("faq-body")) {
        const body = document.createElement("div");
        body.className = "faq-body";
        body.textContent = "A job board waits for you to search it. Blackspace comes to you — one ranked feed across every category, built to be swiped through in minutes instead of browsed for hours.";
        s.after(body);
        const plus = document.createElement("span");
        plus.className = "faq-plus";
        s.appendChild(plus);
      }
    });
  }, []);

  // ── RENDER ────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-[var(--text)] overflow-x-clip relative" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* ─── custom cursor ─── */}
        <div ref={cursorRingRef} className="cursor-ring" />
        <div ref={cursorDotRef} className="cursor-dot" />

        {/* ─── noise overlay ─── */}
        <svg className="noise-svg">
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /></filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        {/* ─── animated blobs ─── */}
        <div className="blob blob1" />
        <div className="blob blob2" />
        <div className="blob blob3" />
        <div className="blob blob4" />

        {/* ─── Nav ─── */}
        <header ref={headerRef} id="siteHeader">
          <nav>
            <Link href="/" className="logo glitch" ref={navLogoRef as any} data-text="BLACKSPACE" onMouseEnter={handleGlitch}>
              <span className="dot" />BLACKSPACE
            </Link>
            <div className="nav-links">
              <a href="#how" className="scramble" onMouseEnter={handleScramble}>How it works</a>
              <a href="#who" className="scramble" onMouseEnter={handleScramble}>Who it's for</a>
              <a href="#features" className="scramble" onMouseEnter={handleScramble}>Why Blackspace</a>
              <a href="#faq" className="scramble" onMouseEnter={handleScramble}>FAQ</a>
            </div>
            <Link href="/login" className="btn btn-primary magnetic">Get Started</Link>
          </nav>
        </header>

        {/* ─── Hero ─── */}
        <section className="hero wrap">
          <div className="eyebrow-row">
            <div className="eyebrow">
              <span className="live-dot" />3,482 opportunities live right now
            </div>
          </div>
          <div className="title-canvas-wrap">
            <canvas ref={canvasRef} id="titleCanvas" />
          </div>
          <p className="hero-sub">Scholarships. Trials. Gigs. Jobs. <b>One feed</b> that finds you — not the other way around.</p>
          <p className="hero-sub2">Blackspace pulls real opportunities from across the internet into a single, fast, swipeable feed — so you spend less time hunting and more time moving. No tabs, no dead links, no noise. Just what's actually worth your shot, sorted for you the moment it appears.</p>
          <div className="hero-cta-row">
            <Link href="/login" className="btn btn-primary magnetic">Get Started</Link>
            <a href="#how" className="btn btn-ghost magnetic">See how it works</a>
          </div>
        </section>

        {/* ─── Deck Section ─── */}
        <section className="deck-section wrap" id="deckSection" onMouseMove={handleDeckMouseMove} onMouseLeave={handleDeckMouseLeave}>
          <div className="deck-stage" ref={deckStageRef}>
            <div className="orbit-system" aria-hidden="true">
              <div className="orbit-ring r1"><span className="orbit-dot" style={{ background: "var(--lime)", color: "var(--lime)" }} /></div>
              <div className="orbit-ring r2"><span className="orbit-dot" style={{ background: "var(--magenta)", color: "var(--magenta)" }} /></div>
              <div className="orbit-ring r3"><span className="orbit-dot" style={{ background: "var(--cyan)", color: "var(--cyan)" }} /></div>
            </div>
            <div className="badge-chip" style={{ top: "6%", left: "2%", animationDelay: ".5s" }}>
              <span className="pip" />swipe right to apply
            </div>
            <div className="badge-chip" style={{ bottom: "8%", right: "0%", animationDelay: "1.2s" }}>
              <span className="pip" style={{ background: "var(--magenta)", boxShadow: "0 0 8px var(--magenta)" }} />skip in a tap
            </div>
            <div className="deck" ref={deckRef} id="deck" />
            <div className="deck-actions">
              <button className="skip magnetic" onClick={() => advanceDeck("left")} aria-label="Skip">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2L14 14M14 2L2 14" stroke="#c9c9d1" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </button>
              <button className="save magnetic" onClick={() => advanceDeck("up")} aria-label="Save">
                <svg width="15" height="17" viewBox="0 0 15 17" fill="none"><path d="M1 1H14V16L7.5 12L1 16V1Z" stroke="#c9c9d1" strokeWidth="1.6" strokeLinejoin="round" /></svg>
              </button>
              <button className="apply magnetic" onClick={() => advanceDeck("right")} aria-label="Apply">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5" stroke="#c9c9d1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </section>

        {/* ─── Stats Bar ─── */}
        <div className="stats-bar wrap reveal-stagger" style={{ display: "grid" }}>
          <div className="stat"><div className="num">50K+</div><div className="lbl">Opportunities indexed weekly</div></div>
          <div className="stat"><div className="num">120+</div><div className="lbl">Countries reached</div></div>
          <div className="stat"><div className="num">6</div><div className="lbl">Categories, one single feed</div></div>
          <div className="stat"><div className="num">4.9</div><div className="lbl">Average rating from early users</div></div>
        </div>

        {/* ─── Marquee ─── */}
        <div className="marquee-band">
          <div className="marquee-row r1" ref={marqueeR1Ref} id="marqueeR1" />
          <div className="marquee-row r2" ref={marqueeR2Ref} id="marqueeR2" />
        </div>

        {/* ─── Transform Section (Before/After) ─── */}
        <div className="transform-pin" id="transformPin" ref={transformPinRef}>
          <div className="transform-stage">
            <div className="section-head reveal" style={{ margin: "0 auto 50px", textAlign: "center", maxWidth: 680 }}>
              <div className="kicker" style={{ justifyContent: "center" }}>The shift</div>
              <h2>From searching, to <span className="grad-text">discovering</span>.</h2>
              <p>Ten tabs, five logins, and a search history that looks like a cry for help — that's the old way of finding opportunities. Blackspace replaces all of it with a single feed built around you.</p>
            </div>
            <div className="transform-grid">
              <div className="panel panel-before">
                <span className="panel-label">Before — 14 tabs deep</span>
                <div className="chaos-tabs" ref={chaosTabsRef} id="chaosTabs">
                  <div className="chaos-tab" data-x="-40" data-y="-30" data-r="-14" style={{ top: 0, left: 0 }}>
                    <div className="url">jobsite.com/search?q=...</div><div className="row" /><div className="row" /><div className="row" />
                  </div>
                  <div className="chaos-tab" data-x="60" data-y="20" data-r="10" style={{ top: 30, left: 75 }}>
                    <div className="url">trialshub.net/listings</div><div className="row" /><div className="row" /><div className="row" />
                  </div>
                  <div className="chaos-tab" data-x="-70" data-y="50" data-r="-8" style={{ top: 95, left: 5 }}>
                    <div className="url">grantportal.org/apply</div><div className="row" /><div className="row" /><div className="row" />
                  </div>
                  <div className="chaos-tab" data-x="50" data-y="-40" data-r="16" style={{ top: 140, left: 95 }}>
                    <div className="url">creativegigs.io/board</div><div className="row" /><div className="row" /><div className="row" />
                  </div>
                </div>
              </div>
              <div className="transform-arrow">
                <svg viewBox="0 0 40 40" fill="none"><path d="M4 20H36M36 20L24 8M36 20L24 32" stroke="var(--lime)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span>BLACKSPACE</span>
              </div>
              <div className="panel panel-after">
                <span className="panel-label">After — one clean feed</span>
                <div style={{ display: "flex", alignItems: "center", height: 270 }}>
                  <div className="clean-card" ref={cleanCardRef} id="cleanCard">
                    <span className="tag">Scholarship</span>
                    <h4>Full-Ride STEM Scholarship</h4>
                    <p>Merit-based · Undergraduate · Global</p>
                    <div className="bar"><i /></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="progress-label">SCROLL TO WATCH THE CHAOS DISAPPEAR</div>
          </div>
        </div>

        {/* ─── Statement ─── */}
        <section className="statement-section wrap">
          <p className="statement" ref={statementRef} id="statementText">
            Opportunity was never supposed to depend on who you know, how many tabs you keep open, or how good you are at Googling. It was supposed to be about who you are and where you want to go. <span className="accent">That's the whole idea behind Blackspace.</span>
          </p>
        </section>

        {/* ─── How it works ─── */}
        <section className="wrap" id="how">
          <div className="section-head reveal">
            <div className="kicker">How it works</div>
            <h2>Three moves. That's it.</h2>
            <p>Blackspace is built to remove friction at every step — you understand an opportunity in seconds, and decide what happens next without ever leaving the feed.</p>
          </div>
          <div className="steps reveal-stagger">
            {[
              { num: "01", title: "Browse the feed", desc: "Opportunities from every category arrive as clean, readable cards — scholarships next to trials next to internships. No forms to fill out just to see if something's relevant, no clutter, no dead links wasting your time." },
              { num: "02", title: "Decide in seconds", desc: "Skip what's not for you, save what's interesting for later, or move straight toward applying — all with a single motion. The feed adapts as you go, learning what's actually worth showing you next." },
              { num: "03", title: "Apply, effortlessly", desc: "When something's right, Blackspace takes you straight to the source. No re-searching, no losing the tab, no forgetting where you saw it three days ago. Your saved list is always exactly where you left it." },
            ].map((step, i) => (
              <div className="tilt" key={i}>
                <div className="step">
                  <span className="num">{step.num}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Personas ─── */}
        <section className="wrap" id="who">
          <div className="section-head reveal">
            <div className="kicker">Built for anyone pursuing growth</div>
            <h2>One platform. Every path.</h2>
            <p>A student, an athlete, a creative, or a young professional — Blackspace shows each of them exactly what applies to their world, without asking them to sort through everyone else's.</p>
          </div>
          <div className="personas reveal-stagger">
            {/* Student */}
            <div className="persona-card tilt">
              <svg className="float-a" viewBox="0 0 88 110" fill="none"><circle cx="44" cy="24" r="14" stroke="#f6f4f1" strokeWidth="2" /><path d="M20 96V70C20 58 30 50 44 50C58 50 68 58 68 70V96" stroke="#f6f4f1" strokeWidth="2" strokeLinecap="round" /><rect x="30" y="58" width="12" height="16" rx="2" stroke="var(--lime)" strokeWidth="2" /><path d="M12 46L20 58" stroke="#f6f4f1" strokeWidth="2" strokeLinecap="round" /></svg>
              <h4>Student</h4><p>Scholarships, grants, and programs that match your field — before the deadline sneaks up on you.</p>
            </div>
            {/* Athlete */}
            <div className="persona-card tilt">
              <svg className="float-b" viewBox="0 0 88 110" fill="none"><circle cx="44" cy="20" r="12" stroke="#f6f4f1" strokeWidth="2" /><path d="M44 34L30 60L40 66L36 96" stroke="#f6f4f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M44 34L58 58L48 68L54 96" stroke="#f6f4f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="44" cy="34" r="3" fill="var(--magenta)" /></svg>
              <h4>Athlete</h4><p>Trials, teams, and competitions across every level — from local tryouts to national scouting calls.</p>
            </div>
            {/* Creative */}
            <div className="persona-card tilt">
              <svg className="float-c" viewBox="0 0 88 110" fill="none"><circle cx="44" cy="22" r="13" stroke="#f6f4f1" strokeWidth="2" /><path d="M22 96V72C22 60 32 52 44 52C56 52 66 60 66 72V96" stroke="#f6f4f1" strokeWidth="2" strokeLinecap="round" /><circle cx="44" cy="72" r="9" stroke="var(--violet)" strokeWidth="2" /><circle cx="44" cy="72" r="3" fill="var(--violet)" /></svg>
              <h4>Creative</h4><p>Gigs, casting calls, and briefs from people actually looking to hire — not just browse portfolios.</p>
            </div>
            {/* Professional */}
            <div className="persona-card tilt">
              <svg className="float-d" viewBox="0 0 88 110" fill="none"><circle cx="44" cy="22" r="12" stroke="#f6f4f1" strokeWidth="2" /><path d="M22 96V74C22 62 32 54 44 54C56 54 66 62 66 74V96" stroke="#f6f4f1" strokeWidth="2" strokeLinecap="round" /><rect x="32" y="62" width="24" height="18" rx="2" stroke="var(--cyan)" strokeWidth="2" /><path d="M32 66H56" stroke="var(--cyan)" strokeWidth="2" /></svg>
              <h4>Professional</h4><p>Internships and full-time roles ranked by relevance to you, not by who paid to be at the top.</p>
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        <section className="wrap">
          <div className="section-head reveal">
            <div className="kicker">What people are saying</div>
            <h2>People are already moving faster.</h2>
            <p>Thousands of opportunities discovered. Here's what our users are saying.</p>
          </div>
          <div className="testimonials reveal-stagger">
            {[
              { q: "I found a design internship in Berlin on a Tuesday and had submitted my application by Wednesday morning. I wasn't even looking that hard.", name: "Amara", role: "Creative, Lagos", grad: "linear-gradient(135deg,var(--lime),var(--cyan))" },
              { q: "I stopped checking six different trial boards every morning. Blackspace just shows me what's open near me, sorted by how soon it closes.", name: "Diego", role: "Athlete, Madrid", grad: "linear-gradient(135deg,var(--magenta),var(--violet))" },
              { q: "The swipe format sounds gimmicky until you realize it's actually just faster. I saved four scholarships in under two minutes.", name: "Priya", role: "Student, Bangalore", grad: "linear-gradient(135deg,var(--cyan),var(--violet))" },
            ].map((t, i) => (
              <div className="testimonial tilt" key={i}>
                <div className="avatar-wrap"><div className="avatar" style={{ background: t.grad }} /></div>
                <p className="quote">{t.q}</p>
                <div className="who"><b>{t.name}</b> — {t.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Features ─── */}
        <section className="wrap" id="features">
          <div className="section-head reveal">
            <div className="kicker">Why Blackspace</div>
            <h2>Speed and access, by design.</h2>
            <p>Every decision in Blackspace comes back to two things: how fast you can understand an opportunity, and how easily you can act on it.</p>
          </div>
          <div className="features reveal-stagger">
            {[
              { title: "Instant", desc: "Every card is built to be understood in seconds — the category, the deadline, and the essentials, with nothing extra to dig through.", accent: "var(--lime)", dur: "9s" },
              { title: "Zero noise", desc: "Only opportunities relevant to you reach your feed. No sponsored filler, no outdated postings, nothing you'd have to scroll past to find the good stuff.", accent: "var(--cyan)", dur: "11s" },
              { title: "Cross-category", desc: "One account covers every path — sports, creative, academic, and professional — so your ambitions don't have to live in five different apps.", accent: "var(--violet)", dur: "7s" },
              { title: "Always current", desc: "Opportunities move fast, and so does the feed. Closed listings disappear, new ones surface immediately — nothing you see is stale.", accent: "var(--magenta)", dur: "13s" },
            ].map((feat, i) => (
              <div className="feature" key={i}>
                <div className="cube-wrap">
                  <div className="cube" style={{ animationDuration: feat.dur }}>
                    {["front", "back", "right", "left", "top", "bottom"].map((face) => (
                      <div key={face} className={`face ${face}`} style={{ borderColor: feat.accent }} />
                    ))}
                  </div>
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="wrap" id="faq">
          <div className="section-head reveal">
            <div className="kicker">Questions</div>
            <h2>Everything you're probably wondering.</h2>
          </div>
          <div className="faq reveal">
            <details className="faq-item" open>
              <summary>Is Blackspace free to use?<span className="faq-plus" /></summary>
              <div className="faq-body">Yes. Browsing, saving, and applying through Blackspace is completely free. Premium features may be added in the future, but the core discovery experience will always remain free.</div>
            </details>
            <details className="faq-item">
              <summary>What kind of opportunities actually show up?<span className="faq-plus" /></summary>
              <div className="faq-body">Scholarships, grants, internships, full-time roles, football and sports trials, creative gigs, and casting calls — pulled in from across the web and organized into one feed instead of six separate ones.</div>
            </details>
            <details className="faq-item">
              <summary>How is this different from a regular job board?<span className="faq-plus" /></summary>
              <div className="faq-body">A job board waits for you to search it. Blackspace comes to you — one ranked feed across every category, built to be swiped through in minutes instead of browsed for hours.</div>
            </details>
            <details className="faq-item">
              <summary>Which countries are supported?<span className="faq-plus" /></summary>
              <div className="faq-body">Blackspace is global from day one. Opportunities are currently strongest in Europe, North America, and West Africa, with new regions expanding weekly as more listings get added.</div>
            </details>
            <details className="faq-item">
              <summary>How do I get started?<span className="faq-plus" /></summary>
              <div className="faq-body">Just create an account — it takes under a minute. Once you set up your profile, Blackspace immediately starts curating opportunities matched to your goals and interests.</div>
            </details>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="wrap cta-section" id="get-started">
          <div className="reveal">
            <div className="kicker" style={{ justifyContent: "center", display: "flex" }}>Ready to start</div>
            <h2 className="cta-title">Find what's next <span className="grad-text">before</span> everyone else does.</h2>
            <p>Create your profile and start discovering opportunities tailored to you. It takes under a minute.</p>
            <div className="hero-cta-row" style={{ justifyContent: "center" }}>
              <Link href="/login" className="btn btn-primary magnetic" style={{ padding: "16px 30px", fontSize: "14px" }}>Create Your Profile</Link>
              <a href="#how" className="btn btn-ghost magnetic" style={{ padding: "16px 26px", fontSize: "14px" }}>Learn more</a>
            </div>
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer>
          <div className="wrap foot-row">
            <div className="logo" style={{ fontSize: 19 }}><span className="dot" />BLACKSPACE</div>
            <div className="foot-links"><a href="#how">How it works</a><a href="#who">Who it's for</a><a href="/login">Get Started</a></div>
            <div className="foot-copy">© 2026 Blackspace. Discover what's next.</div>
          </div>
        </footer>
    </div>
  );
}
