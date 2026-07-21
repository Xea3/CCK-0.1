import React, { useState, useRef, useEffect } from "react";

/* ============================================================
   THEME TOKENS — palette per theme. Environment feel (bg
   texture, hero gradient, shadow tint) lives in THEME_ENV below
   so switching themes changes the whole page, not just text.
   ============================================================ */
/* ============================================================
   PLACEHOLDER IMAGERY
   Generates a themed gradient image as an inline SVG data URI —
   no network request at all, so it can never 403, hang, or fail
   to load depending on what a given preview sandbox allows.
   Swap any of these for a real photo URL later; the img tag
   usage is identical either way.
   ============================================================ */
function placeholderImg(colorA, colorB, label = "") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${colorA}"/>
        <stop offset="100%" stop-color="${colorB}"/>
      </linearGradient>
    </defs>
    <rect width="480" height="360" fill="url(#g)"/>
    ${label ? `<text x="240" y="188" font-family="Georgia, serif" font-size="22" fill="rgba(255,255,255,0.85)" text-anchor="middle">${label}</text>` : ""}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const THEMES = {
  green: {
    name: "Verdant",
    primary: "#0F3D2E",
    primaryDark: "#092A1F",
    accent: "#C9A54A",
    accentSoft: "#E4D9B8",
    surface: "#E9E0C7",
    surfaceRaised: "#F4EEDC",
    ink: "#1E241F",
    inkSoft: "#4B564D",
    line: "#C9BB90",
    tint: "#DCE5D7",
  },
  charcoal: {
    name: "Slate",
    primary: "#26282B",
    primaryDark: "#141517",
    accent: "#C9A54A",
    accentSoft: "#E2DAC4",
    surface: "#E2DCCB",
    surfaceRaised: "#EFE9D9",
    ink: "#201F1D",
    inkSoft: "#54524D",
    line: "#C2B89F",
    tint: "#D5CFBF",
  },
  cream: {
    name: "Parchment",
    primary: "#8A6A1E",
    primaryDark: "#5E480F",
    accent: "#0F3D2E",
    accentSoft: "#D9CDA0",
    surface: "#F0E4C4",
    surfaceRaised: "#F8EFD8",
    ink: "#2A2417",
    inkSoft: "#5C5540",
    line: "#D6C28A",
    tint: "#ECE0BC",
  },
};

/* ============================================================
   SIMULATED CMS STORE
   In production this is Supabase. Here it's in-memory React
   state shared via context, so the Admin page can edit content
   and the public pages reflect it instantly — a working
   preview of the intended UX before the real backend build.
   ============================================================ */
const CMSContext = React.createContext(null);
const useCMS = () => React.useContext(CMSContext);

const DEFAULT_CONTENT = {
  siteSettings: {
    phone: "+256 700 000 000",
    email: "info@cck.ac.ug",
    address: "Kiteezi Parish, Nangabo, Wakiso District",
    tiktokHandle: "@cckofficial01",
    tiktokFollowers: "—",
  },
  heroHeadline: "Arise and shine — a Ugandan education built for today's exam.",
  heroBody: "O-Level and A-Level, day and boarding. In 2024, every one of our 80 UCE candidates achieved Result One under the new competency-based curriculum. This year, we've added something no other Wakiso school has: an AI study partner built for the CBC.",
  headTeacherMessage: "Our students' achievements through hard work, commitment, and good discipline have been pivotal in securing remarkable results. It reflects the dedication and professionalism of a teaching staff that works tirelessly for every learner.",
  news: [
    { id: 1, title: "CCK secures 100% Result One in 2024 UCE", date: "Feb 17, 2025", published: true, excerpt: "All 80 candidates achieved Result One under the new competency-based curriculum, reaffirming CCK's place among Wakiso's top schools." },
    { id: 2, title: "Inter-house sports day set for August", date: "Jul 2, 2026", published: true, excerpt: "Students from all four houses will compete across athletics, football, and netball at the main field." },
    { id: 3, title: "New science laboratory opens", date: "Jun 10, 2026", published: false, excerpt: "A draft post — not yet visible to the public." },
  ],
  tiktokVideos: [
    { id: 1, caption: "Bino byabanene boka — enjoy the calmness and beauty of CCK. Come join us for S1 or A'Level!", featured: true, thumbnail: placeholderImg("#0F3D2E","#C9A54A","Campus") },
    { id: 2, caption: "Morning assembly energy 🔥 #cck #fyp", featured: false, thumbnail: placeholderImg("#26282B","#8A6A1E","Assembly") },
    { id: 3, caption: "A day in the life of a CCK boarding student", featured: true, thumbnail: placeholderImg("#0F3D2E","#5E480F","Boarding") },
    { id: 4, caption: "Our debate club prepping for the district finals", featured: false, thumbnail: placeholderImg("#8A6A1E","#0F3D2E","Debate") },
    { id: 5, caption: "Graduation day 2025 highlights", featured: false, thumbnail: placeholderImg("#C9A54A","#0F3D2E","Graduation") },
    { id: 6, caption: "Sports day recap — house colours out in full force", featured: false, thumbnail: placeholderImg("#0F3D2E","#26282B","Sports Day") },
  ],
  staff: [
    { id: 1, name: "Kabweru Samuel", role: "Head Teacher", dept: "Administration" },
    { id: 2, name: "Nakato Prossy", role: "Deputy Head, Academics", dept: "Administration" },
    { id: 3, name: "Ssemwogerere John", role: "Mathematics Dept. Head", dept: "Sciences" },
  ],
  contactMessages: [
    { id: 1, name: "Achen Grace", email: "achen.g@example.com", message: "Please send the S1 fees structure for 2027.", read: false },
    { id: 2, name: "Mukasa Ivan", email: "ivan.m@example.com", message: "Do you offer boarding for A-Level students only?", read: true },
  ],
  events: [
    { id: 1, title: "Inter-House Sports Day", date: "2026-08-14", category: "Sports", description: "All four houses compete across athletics, football, and netball at the main field." },
    { id: 2, title: "Founders' Day & Open Speech", date: "2026-09-05", category: "Community", description: "Annual celebration marking CCK's founding in 2001, with an open day for prospective parents." },
    { id: 3, title: "UACE Mock Examinations Begin", date: "2026-09-21", category: "Academics", description: "S6 candidates sit internal mock exams ahead of national UACE papers." },
    { id: 4, title: "Inter-School Debate Finals", date: "2026-10-02", category: "Clubs", description: "CCK's debate club hosts the Wakiso District finals on home turf." },
    { id: 5, title: "Carol Service & End-of-Term", date: "2026-12-04", category: "Community", description: "Term Three closes with the annual carol service in the school hall." },
  ],
  galleryImages: [
    { id: 1, url: placeholderImg("#C9A54A","#0F3D2E","Graduation"), caption: "Graduation day, 2025", category: "Events" },
    { id: 2, url: placeholderImg("#0F3D2E","#5E480F","Chemistry"), caption: "S4 Chemistry practicals", category: "Academics" },
    { id: 3, url: placeholderImg("#0F3D2E","#26282B","Sports Day"), caption: "Inter-house sports day", category: "Sports" },
    { id: 4, url: placeholderImg("#5E480F","#0F3D2E","Boarding House"), caption: "Boarding house common room", category: "Campus" },
    { id: 5, url: placeholderImg("#8A6A1E","#0F3D2E","Debate Club"), caption: "Debate club, district finals", category: "Clubs" },
    { id: 6, url: placeholderImg("#26282B","#8A6A1E","Assembly"), caption: "Morning assembly", category: "Campus" },
    { id: 7, url: placeholderImg("#0F3D2E","#C9A54A","Library"), caption: "Library reading hour", category: "Academics" },
    { id: 8, url: placeholderImg("#C9A54A","#26282B","New Students"), caption: "Head Teacher addressing new students", category: "Events" },
  ],
  alumni: [
    { id: 1, name: "Namutebi Rehema", cohort: "Class of 2019", note: "Now studying Medicine at Makerere University." },
    { id: 2, name: "Okello Brian", cohort: "Class of 2017", note: "Software Engineer, Kampala — credits CCK's early Computer Studies programme." },
    { id: 3, name: "Nabirye Sandra", cohort: "Class of 2020", note: "Bachelor of Laws graduate, currently pupillage in Kampala." },
  ],
  houses: [
    { id: 1, name: "Nile House", color: "#0F3D2E", motto: "Strength in the current", points: 342 },
    { id: 2, name: "Kabaka House", color: "#8A6A1E", motto: "Honour above all", points: 298 },
    { id: 3, name: "Ruwenzori House", color: "#26282B", motto: "Rise together", points: 275 },
    { id: 4, name: "Victoria House", color: "#5E480F", motto: "Depth of character", points: 251 },
  ],
  fixtures: [
    { id: 1, sport: "Football", opponent: "St. Mary's Kitende", result: "Won 2–1", date: "Jul 12, 2026" },
    { id: 2, sport: "Netball", opponent: "Gayaza High School", result: "Won 24–19", date: "Jul 5, 2026" },
    { id: 3, sport: "Athletics", opponent: "Wakiso District Meet", result: "3rd place overall", date: "Jun 27, 2026" },
    { id: 4, sport: "Chess", opponent: "Kings College Budo", result: "Drew 2–2", date: "Jun 19, 2026" },
  ],
  faqs: [
    { id: 1, category: "Admissions", q: "Do you admit both day and boarding students?", a: "Yes. CCK offers both day and boarding options for S1–S6, with separate boys' and girls' boarding wings." },
    { id: 2, category: "Admissions", q: "When does the S1 and S5 intake open?", a: "Admissions open at the start of Term Three each year for the following year's intake, though enquiries are welcome year-round." },
    { id: 3, category: "Admissions", q: "Is a placement assessment required?", a: "Yes, all new entrants sit a short assessment in English and Mathematics before an offer is issued." },
    { id: 4, category: "Admissions", q: "Can a student transfer in mid-year?", a: "Mid-year transfers are considered on a case-by-case basis, subject to space and a placement assessment. Contact the admissions office directly to discuss your situation." },
    { id: 5, category: "Admissions", q: "What documents are needed for enrollment?", a: "A previous school report or PLE/UCE result slip, two passport photos, an immunisation record, and a signed parent or guardian consent form." },
    { id: 6, category: "Academics", q: "What curriculum do you follow?", a: "CCK follows Uganda's National Curriculum Development Centre (NCDC) syllabus, including the revised competency-based framework for O-Level." },
    { id: 7, category: "Academics", q: "What subjects are compulsory at O-Level?", a: "English Language, Mathematics, and a science combination are compulsory, alongside a spread of humanities and vocational options students choose from in S1 and S2." },
    { id: 8, category: "Academics", q: "How are A-Level subject combinations chosen?", a: "Students select combinations at the end of S4 based on their UCE results and career interests, guided by our academic staff during a dedicated subject-selection period." },
    { id: 9, category: "Boarding", q: "What does the boarding fee cover?", a: "Accommodation, three meals a day, laundry, and access to prep/study hours in the evening. It does not cover personal items or optional extracurricular trips." },
    { id: 10, category: "Boarding", q: "How often can boarding students go home?", a: "Boarders are permitted to go home on official visiting days and at the end of each term; special permission can be requested through the boarding matron for exceptional circumstances." },
    { id: 11, category: "Boarding", q: "Is there a difference in supervision between boys' and girls' wings?", a: "Each wing has its own dedicated matron/patron and house staff, with separate living quarters, though both follow the same daily schedule and rules." },
    { id: 12, category: "E-Learning", q: "Is the AI e-learning tool free for students?", a: "Yes — the quiz generator and past paper archive are free to use for all current CCK students, no login required." },
    { id: 13, category: "E-Learning", q: "Can the AI quiz tool be used outside school hours?", a: "Yes, it's available any time a student has internet access, making it useful for evening prep and holiday revision alike." },
    { id: 14, category: "E-Learning", q: "Are the AI-generated questions checked by teachers?", a: "The tool is aligned to the NCDC competency-based curriculum, but we always recommend cross-checking answers against class notes and a teacher where something is unclear." },
  ],
  careers: [
    { id: 1, title: "Mathematics Teacher (A-Level)", type: "Full-time", posted: "Posted 5 days ago" },
    { id: 2, title: "Boarding House Matron", type: "Full-time", posted: "Posted 2 weeks ago" },
  ],
};

/* ============================================================
   TOAST / ACTION FEEDBACK
   Every button that represents a real-world action (download,
   submit, apply) that has no live backend in this preview gives
   honest, visible feedback instead of doing nothing when clicked.
   ============================================================ */
const ToastContext = React.createContext(null);
const useToast = () => React.useContext(ToastContext);

function ToastProvider({ theme, children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const showToast = (message) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(message);
    timerRef.current = setTimeout(() => setToast(null), 3200);
  };
  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, left: "50%", transform: `translateX(-50%) translateY(${toast ? "0" : "20px"})`,
        opacity: toast ? 1 : 0, pointerEvents: "none", transition: "all 0.3s cubic-bezier(.22,.61,.36,1)",
        zIndex: 200, maxWidth: "90vw",
      }}>
        {toast && (
          <div style={{
            background: theme.primary, color: theme.surface, padding: "13px 22px", borderRadius: 8,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, fontWeight: 600, boxShadow: "0 14px 34px rgba(0,0,0,0.28)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ color: theme.accent }}>✓</span> {toast}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

function CMSProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  const updateField = (path, value) => {
    setContent((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      let ref = next;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
      ref[path[path.length - 1]] = value;
      return next;
    });
  };
  const updateCollectionItem = (collection, id, patch) => {
    setContent((prev) => ({
      ...prev,
      [collection]: prev[collection].map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };
  const addCollectionItem = (collection, item) => {
    setContent((prev) => ({ ...prev, [collection]: [...prev[collection], { ...item, id: Date.now() }] }));
  };
  const deleteCollectionItem = (collection, id) => {
    setContent((prev) => ({ ...prev, [collection]: prev[collection].filter((item) => item.id !== id) }));
  };

  return (
    <CMSContext.Provider value={{ content, updateField, updateCollectionItem, addCollectionItem, deleteCollectionItem }}>
      {children}
    </CMSContext.Provider>
  );
}



function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.unobserve(el); } },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, y = 16, style }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : `translateY(${y}px) scale(0.98)`,
        transition: `opacity 0.65s cubic-bezier(.34,1.36,.4,1) ${delay}ms, transform 0.65s cubic-bezier(.34,1.36,.4,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function scrollToTop() {
  // Defensive: different rendering contexts (iframes, artifact
  // previews, some mobile webviews) can make any one of these the
  // actual scrolling element, so reset all of them together rather
  // than assuming `window` is always it.
  try { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); } catch (e) {}
  if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;
}

function PageTransition({ pageKey, children }) {
  const [display, setDisplay] = useState(pageKey);
  const [phase, setPhase] = useState("in");
  useEffect(() => {
    if (pageKey !== display) {
      setPhase("out");
      const t = setTimeout(() => {
        setDisplay(pageKey);
        setPhase("in");
        scrollToTop();
        // Some browsers/webviews only finish laying out the new page
        // content a frame or two later, so the first scrollTo can land
        // before the page has its real height — try again just after.
        requestAnimationFrame(scrollToTop);
        setTimeout(scrollToTop, 60);
      }, 220);
      return () => clearTimeout(t);
    }
  }, [pageKey]);
  return (
    <div style={{
      opacity: phase === "in" ? 1 : 0,
      transform: phase === "in" ? "translateY(0) scale(1)" : "translateY(14px) scale(0.985)",
      filter: phase === "in" ? "blur(0px)" : "blur(3px)",
      transition: "opacity 0.42s cubic-bezier(.22,.61,.36,1), transform 0.42s cubic-bezier(.22,.61,.36,1), filter 0.42s cubic-bezier(.22,.61,.36,1)",
      willChange: "opacity, transform, filter",
    }}>
      {children}
    </div>
  );
}

const MotionStyles = ({ theme }) => (
  <style>{`
    @keyframes cck-fade-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes cck-word-rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes cck-fade-in { from { opacity: 0; } to { opacity: 1; } }
    /* Ambient floating + tilt is computed in JS (useFloatAndTilt) and
       applied as a single inline transform, not CSS keyframes — a
       parallel CSS animation on the same transform property was
       verified to silently overwrite the inline tilt offset every
       frame, so there must be exactly one writer of the transform. */
    @keyframes cck-ripple { to { transform: translate(-50%,-50%) scale(22); opacity: 0; } }
    @keyframes cck-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    @keyframes cck-crest-settle { 0% { opacity: 0; transform: scale(0.85) rotate(-6deg); } 60% { opacity: 1; transform: scale(1.04) rotate(1deg); } 100% { opacity: 1; transform: scale(1) rotate(0); } }
    @keyframes cck-shimmer { 0% { background-position: -150% 0; } 100% { background-position: 150% 0; } }
    @keyframes cck-page-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    html { scroll-behavior: smooth; }
    body, #root, [data-cck-root] { transition: background-color 0.55s ease; }

    .cck-hero-title { animation: cck-fade-rise 0.8s cubic-bezier(.22,.61,.36,1) both; }
    .cck-hero-body { animation: cck-fade-rise 0.8s cubic-bezier(.22,.61,.36,1) 0.12s both; }
    .cck-hero-cta { animation: cck-fade-rise 0.8s cubic-bezier(.22,.61,.36,1) 0.22s both; }
    .cck-hero-media { animation: cck-fade-in 1s ease 0.15s both; }
    .cck-hero-badge-anim { animation: cck-fade-rise 0.6s cubic-bezier(.22,.61,.36,1) 0.55s both, cck-float 4.5s ease-in-out 1.2s infinite; }
    .cck-crest-anim { animation: cck-crest-settle 0.9s cubic-bezier(.22,.61,.36,1) both; }

    .cck-card-hover { transition: transform 0.32s cubic-bezier(.22,.61,.36,1), box-shadow 0.32s ease, border-color 0.25s ease; will-change: transform; }
    .cck-card-hover:hover { transform: translateY(-6px) scale(1.012); box-shadow: 0 20px 40px ${theme?.__shadowTint || "rgba(15,61,46,0.16)"}; border-color: ${theme?.accent || "#C9A54A"}; }

    .cck-underline-link { position: relative; transition: color 0.2s ease; }
    .cck-underline-link::after {
      content: ""; position: absolute; left: 0; bottom: -3px; width: 0; height: 1.5px;
      background: currentColor; transition: width 0.28s cubic-bezier(.22,.61,.36,1);
    }
    .cck-underline-link:hover::after { width: 100%; }

    .cck-tiktok-thumb { transition: transform 0.45s cubic-bezier(.22,.61,.36,1); }
    .cck-tiktok-card:hover .cck-tiktok-thumb { transform: scale(1.07); }
    .cck-gallery-caption { opacity: 0; transition: opacity 0.3s ease; }
    .cck-card-hover:hover .cck-gallery-caption { opacity: 1; }

    .cck-btn-press { transition: transform 0.15s cubic-bezier(.22,.61,.36,1), opacity 0.15s ease, box-shadow 0.2s ease; }
    .cck-btn-press:active { transform: scale(0.96) !important; }

    .cck-nav-link { position: relative; overflow: hidden; }

    .cck-page-fade { animation: cck-page-in 0.5s cubic-bezier(.22,.61,.36,1) both; }

    ::selection { background: ${theme?.accentSoft || "#E4D9B8"}; }

    * { scrollbar-width: thin; }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${theme?.line || "#D8CFB4"}; border-radius: 8px; }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      .cck-hero-title, .cck-hero-body, .cck-hero-cta, .cck-hero-media, .cck-hero-badge-anim, .cck-crest-anim { animation: none !important; }
      .cck-card-hover:hover { transform: none !important; }
      .cck-tiktok-thumb { transition: none !important; }
    }
  `}</style>
);

/* ============================================================
   THEME ENVIRONMENT TOKENS — background texture per theme so
   switching palettes changes the *feel*, not just word color
   ============================================================ */
const THEME_ENV = {
  green: {
    bgImage: "radial-gradient(circle at 12% -5%, rgba(15,61,46,0.14), transparent 48%), radial-gradient(circle at 100% 25%, rgba(201,165,74,0.16), transparent 42%), radial-gradient(circle at 30% 100%, rgba(15,61,46,0.08), transparent 50%)",
    heroGradient: "linear-gradient(160deg, #EDE6D3 0%, #E4DAC0 55%, #DEE7DB 100%)",
    shadowTint: "rgba(15,61,46,0.22)",
    grain: 0.05,
  },
  charcoal: {
    bgImage: "radial-gradient(circle at 8% -5%, rgba(38,40,43,0.16), transparent 48%), radial-gradient(circle at 100% 35%, rgba(201,165,74,0.13), transparent 42%), radial-gradient(circle at 30% 100%, rgba(38,40,43,0.09), transparent 50%)",
    heroGradient: "linear-gradient(160deg, #E7E3D8 0%, #DDD8C9 55%, #D3CFC0 100%)",
    shadowTint: "rgba(20,21,23,0.26)",
    grain: 0.06,
  },
  cream: {
    bgImage: "radial-gradient(circle at 18% -5%, rgba(138,106,30,0.15), transparent 48%), radial-gradient(circle at 100% 25%, rgba(15,61,46,0.12), transparent 42%), radial-gradient(circle at 30% 100%, rgba(138,106,30,0.08), transparent 50%)",
    heroGradient: "linear-gradient(160deg, #F5EDD8 0%, #EDE0BC 55%, #E9DCB3 100%)",
    shadowTint: "rgba(94,72,15,0.22)",
    grain: 0.045,
  },
};

/* ============================================================
   SCHOOL CREST — faithful SVG recreation of the CCK badge:
   shield, red cross, yellow sunburst, green ground, ribbon
   reading "ARISE AND SHINE", "KITETIKKA" below. Recolors
   per active theme while keeping the cross/sun true to source.
   ============================================================ */
function Crest({ size = 56, theme, showText = true }) {
  const shieldFill = theme.surfaceRaised;
  const shieldStroke = theme.ink;
  const shieldPath = "M50 3 C46 9 41 12 35 11 C28 10 22 7 17 4 C15 12 14 20 14 28 L14 56 C14 78 28 96 50 108 C72 96 86 78 86 56 L86 28 C86 20 85 12 83 4 C78 7 72 10 65 11 C59 12 54 9 50 3 Z";
  return (
    <svg width={size} height={size * 1.08} viewBox="0 0 100 108" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      {/* Shield outline */}
      <path d={shieldPath} fill={shieldFill} stroke={shieldStroke} strokeWidth="2.4" strokeLinejoin="round" />
      <clipPath id={`crest-clip-${theme.name}`}>
        <path d={shieldPath} />
      </clipPath>
      <g clipPath={`url(#crest-clip-${theme.name})`}>
        {/* Green ground, lower half */}
        <rect x="8" y="58" width="84" height="52" fill={theme.primary} />
        {/* Sunburst — four triangular rays */}
        <g fill="#F2C94C">
          <polygon points="50,58 33,16 42,58" />
          <polygon points="50,58 67,16 58,58" />
          <polygon points="50,58 22,26 40,58" />
          <polygon points="50,58 78,26 60,58" />
        </g>
        {/* Sun */}
        <circle cx="50" cy="58" r="12.5" fill="#F7D774" stroke="#E0B23C" strokeWidth="1" />
        {/* Cross */}
        <rect x="44.5" y="6" width="11" height="92" fill="#D6412E" />
        <rect x="16" y="42" width="68" height="11" fill="#D6412E" />
      </g>
      {/* Re-stroke shield edge on top for crispness */}
      <path d={shieldPath} fill="none" stroke={shieldStroke} strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

function CrestFull({ width = 240, theme }) {
  // Full badge with ribbon + text, used on About / footer / admin login.
  // This geometry was verified by rendering it to a real image and
  // visually checking it (previous versions were tuned blind and the
  // arms didn't actually meet the center notch correctly) — flat ribbon
  // strips meeting a center tab, with a simple pointed fold at each
  // outer tip, matching the real CCK badge's construction.
  const VB_W = 260, VB_H = 90;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width }}>
      <Crest size={width * 0.72} theme={theme} />
      <svg width={width} height={(VB_H / VB_W) * width * 0.72} viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ marginTop: -width * 0.045, overflow: "visible" }}>
        <path d="M 6 32 L 100 42 L 100 58 L 6 68 L 16 58 L 22 50 L 16 42 Z"
          fill={theme.surfaceRaised} stroke={theme.ink} strokeWidth="2" strokeLinejoin="round" />
        <path d="M 254 32 L 160 42 L 160 58 L 254 68 L 244 58 L 238 50 L 244 42 Z"
          fill={theme.surfaceRaised} stroke={theme.ink} strokeWidth="2" strokeLinejoin="round" />
        <rect x="115" y="40" width="30" height="24" fill={theme.surfaceRaised} stroke={theme.ink} strokeWidth="2" />
        <text x="130" y="57" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="9.5" fill={theme.ink}>AND</text>
        <text x="52" y="53" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" fill={theme.ink} letterSpacing="0.8">ARISE</text>
        <text x="208" y="53" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" fill={theme.ink} letterSpacing="0.8">SHINE</text>
      </svg>
      <div style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 700, fontSize: width * 0.105, letterSpacing: "0.05em", color: theme.ink, marginTop: width * -0.02, textAlign: "center" }}>KITETIKKA</div>
    </div>
  );
}

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
function ScrollProgress({ theme }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      setPct(height > 0 ? (scrolled / height) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, height: 3, width: "100%", zIndex: 60, background: "transparent", pointerEvents: "none" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.primary})`, transition: "width 0.1s linear" }} />
    </div>
  );
}

/* ============================================================
   COUNT-UP NUMBER — animates a numeric stat when revealed
   ============================================================ */
function CountUp({ value, suffix = "", duration = 1200 }) {
  const [ref, visible] = useReveal();
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!visible) return;
    const numMatch = String(value).match(/[\d.]+/);
    if (!numMatch) { setDisplay(value); return; }
    const target = parseFloat(numMatch[0]);
    const prefix = String(value).slice(0, numMatch.index);
    const restSuffix = String(value).slice(numMatch.index + numMatch[0].length);
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(target * eased);
      setDisplay(`${prefix}${current}${restSuffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, value, duration]);
  return <span ref={ref}>{display}{suffix}</span>;
}

/* ============================================================
   FONT IMPORT
   ============================================================ */
const FontLoader = () => (
  <style>{`
    /* No external @import: a blocked or slow network call to Google
       Fonts could hang or fail differently across sandboxed preview
       environments, so the site is fully self-contained instead.
       These system stacks approximate the intended feel: a serif
       display face for Fraunces, a clean humanist sans for Inter,
       and a real monospace for JetBrains Mono. */
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; overflow-x: hidden; }
    body { overflow-x: hidden; }
    img { max-width: 100%; }
    /* Deliberate keyboard-focus treatment: a bare browser default
       outline reads off-brand against this cream/gold palette, and
       :focus-visible (rather than :focus) means mouse clicks don't
       show a ring, only real keyboard navigation does. */
    :focus-visible {
      outline: 2px solid #C9A54A;
      outline-offset: 2px;
      border-radius: 2px;
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
    }

    /* ============================================================
       GLOBAL RESPONSIVE RULES — these classes are reused across
       many pages, so their mobile behaviour lives here once,
       globally, rather than being duplicated (and easily missed)
       inside each page's own scoped <style> block.
       ============================================================ */
    @media (max-width: 900px) {
      .cck-pillar-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .cck-hero-grid { grid-template-columns: 1fr !important; }
      .cck-quiz-grid { grid-template-columns: 1fr !important; }
      .cck-quiz-sidebar { position: static !important; }
      .cck-steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .cck-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media (max-width: 720px) {
      .cck-about-grid { grid-template-columns: 1fr !important; }
      .cck-leader { flex-direction: column !important; text-align: center; }
      .cck-about-hero { grid-template-columns: 1fr !important; justify-items: center; text-align: center; }
    }
    @media (max-width: 640px) {
      .cck-pillar-grid { grid-template-columns: 1fr !important; }
      .cck-steps-grid { grid-template-columns: 1fr !important; }
      .cck-footer-grid { grid-template-columns: 1fr !important; text-align: center; }
      .cck-tiktok-featured { grid-template-columns: 1fr !important; }
      .cck-admin-shell { grid-template-columns: 1fr !important; }
      .cck-hero-badge-anim { position: static !important; margin-top: 16px; display: inline-block; }
    }
    @media (max-width: 480px) {
      .cck-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
    }

    /* Tap targets: keep every interactive element comfortably
       thumb-sized on touch devices rather than desktop-cursor-sized. */
    @media (max-width: 720px) {
      button, a, select, input[type="checkbox"] { min-height: 40px; }
      input[type="checkbox"] { min-height: auto; min-width: 18px; }
    }
  `}</style>
);

/* ============================================================
   SHARED UI ATOMS
   ============================================================ */
function Ledger({ theme, items }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      border: `1px solid ${theme.line}`, borderRadius: 4, overflow: "hidden", background: theme.surfaceRaised,
    }}>
      {items.map((it, i) => (
        <div key={i} style={{ padding: "18px 16px", borderLeft: i === 0 ? "none" : `1px solid ${theme.line}`, textAlign: "center" }}>
          <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 26, fontWeight: 600, color: theme.primary, letterSpacing: "-0.02em" }}>{it.value}</div>
          <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: theme.inkSoft, marginTop: 4 }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

function Eyebrow({ theme, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase",
      color: theme.accent === theme.primary ? theme.primary : theme.accent, fontWeight: 600, marginBottom: 14,
    }}>
      <span style={{ width: 22, height: 1, background: "currentColor", display: "inline-block" }} />
      {children}
    </div>
  );
}

function Button({ theme, children, variant = "solid", onClick, style, type = "button" }) {
  const [ripples, setRipples] = useState([]);
  const base = {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14, fontWeight: 600, padding: "13px 26px", borderRadius: 3,
    cursor: "pointer", border: "1px solid transparent", transition: "all 0.18s ease", letterSpacing: "0.01em",
    display: "inline-flex", alignItems: "center", gap: 8, position: "relative", overflow: "hidden",
  };
  const variants = {
    solid: { background: theme.primary, color: theme.surface, borderColor: theme.primary, boxShadow: `0 2px 10px ${theme.accentSoft}66` },
    outline: { background: "transparent", color: theme.primary, borderColor: theme.primary },
    ghost: { background: "transparent", color: theme.inkSoft, borderColor: "transparent" },
    accent: { background: theme.accent, color: theme.primaryDark, borderColor: theme.accent },
  };
  const rippleColor = variant === "solid" || variant === "accent" ? "rgba(255,255,255,0.45)" : `${theme.primary}33`;

  function handleClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const ripple = { id, x: e.clientX - rect.left, y: e.clientY - rect.top };
    setRipples((r) => [...r, ripple]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 650);
    if (onClick) onClick(e);
  }

  return (
    <button
      type={type} onClick={handleClick} className="cck-btn-press" style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {children}
      {ripples.map((r) => (
        <span key={r.id} aria-hidden="true" style={{
          position: "absolute", left: r.x, top: r.y, width: 8, height: 8, borderRadius: "50%",
          background: rippleColor, transform: "translate(-50%,-50%) scale(0)",
          animation: "cck-ripple 0.6s ease-out", pointerEvents: "none",
        }} />
      ))}
    </button>
  );
}

/* ============================================================
   THEME SWITCHER — wax-seal badge toggle (signature element)
   ============================================================ */
function ThemeSwitcher({ theme, themeKey, setThemeKey }) {
  const [open, setOpen] = useState(false);
  const keys = Object.keys(THEMES);
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)} aria-label="Change site colours"
        style={{
          width: 40, height: 40, borderRadius: "50%", border: `2px solid ${theme.accentSoft}`,
          background: `conic-gradient(from 180deg, ${THEMES.green.primary} 0 120deg, ${THEMES.charcoal.primary} 120deg 240deg, ${THEMES.cream.primary} 240deg 360deg)`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: open ? `0 0 0 3px ${theme.accentSoft}` : "none", transition: "box-shadow 0.2s ease, transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span style={{ width: 16, height: 16, borderRadius: "50%", background: theme.surfaceRaised, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: theme.ink }}>◈</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: 50, right: 0, zIndex: 50, background: theme.surfaceRaised,
          border: `1px solid ${theme.line}`, borderRadius: 6, padding: 10, minWidth: 200,
          boxShadow: "0 12px 32px rgba(0,0,0,0.18)", animation: "cck-fade-rise 0.22s cubic-bezier(.22,.61,.36,1) both",
        }}>
          <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.inkSoft, padding: "4px 8px 8px" }}>Choose a palette</div>
          {keys.map((k) => (
            <button key={k} onClick={() => { setThemeKey(k); setOpen(false); }} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 8px", borderRadius: 4,
              border: "none", cursor: "pointer", textAlign: "left", background: k === themeKey ? theme.tint : "transparent",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, fontWeight: k === themeKey ? 600 : 500, color: theme.ink,
            }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: THEMES[k].primary, border: `2px solid ${THEMES[k].accent}`, flexShrink: 0 }} />
              {THEMES[k].name}
              <span style={{ marginLeft: "auto", fontSize: 11, color: theme.inkSoft, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
                {k === "green" ? "Green" : k === "charcoal" ? "Dark grey" : "Cream"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   NAVIGATION — mega-menu structure
   ============================================================ */
const NAV_GROUPS = [
  { label: "Home", page: "Home" },
  { label: "About", items: [
    { label: "Our story", page: "About" },
    { label: "Alumni", page: "Alumni" },
    { label: "Careers", page: "Careers" },
  ]},
  { label: "Academics", items: [
    { label: "Curriculum & subjects", page: "Academics" },
    { label: "E-Learning (AI)", page: "E-Learning" },
  ]},
  { label: "Admissions", page: "Admissions" },
  { label: "School Life", items: [
    { label: "Sports & clubs", page: "Sports" },
    { label: "Gallery", page: "Gallery" },
    { label: "Events calendar", page: "Events" },
    { label: "Life at CCK (TikTok)", page: "Life at CCK" },
  ]},
  { label: "FAQs", page: "FAQs" },
];
const ALL_PAGES = NAV_GROUPS.flatMap((g) => (g.items ? g.items.map((i) => i.page) : [g.page]));

function NavDropdown({ theme, group, page, setPage }) {
  const [open, setOpen] = useState(false);
  const isActive = group.items.some((i) => i.page === page);
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14, fontWeight: 600,
        color: isActive ? theme.primary : theme.inkSoft, padding: "8px 14px", borderRadius: 3,
        display: "flex", alignItems: "center", gap: 5, transition: "color 0.2s ease",
        borderBottom: isActive ? `2px solid ${theme.accent}` : "2px solid transparent",
      }}>
        {group.label}
        <span style={{ fontSize: 9, color: theme.accent, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s cubic-bezier(.22,.61,.36,1)" }}>▾</span>
      </button>
      <div style={{
        position: "absolute", top: "100%", left: 0, paddingTop: 8,
        opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden",
        transform: open ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity 0.22s cubic-bezier(.22,.61,.36,1), transform 0.22s cubic-bezier(.22,.61,.36,1)", zIndex: 50,
      }}>
        <div style={{ background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 6, padding: 6, minWidth: 210, boxShadow: "0 14px 32px rgba(0,0,0,0.14)" }}>
          {group.items.map((item, i) => (
            <button
              key={item.page} onClick={() => setPage(item.page)}
              style={{
                display: "block", width: "100%", textAlign: "left", background: page === item.page ? theme.tint : "transparent",
                border: "none", cursor: "pointer", padding: "9px 12px", borderRadius: 4,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, fontWeight: page === item.page ? 700 : 500,
                color: page === item.page ? theme.primary : theme.ink,
                transition: "background 0.15s ease, transform 0.15s ease, padding-left 0.15s ease",
                opacity: open ? 1 : 0, transform: open ? "translateX(0)" : "translateX(-6px)",
                transitionDelay: open ? `${i * 35}ms` : "0ms",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "16px"; }}
              onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "12px"; }}
            >{item.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Nav({ theme, themeKey, setThemeKey, page, setPage }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [offset, setOffset] = useState(0);
  const lastY = useRef(0);
  const accum = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      setScrolled(y > 40);
      // Continuous, rubber-banded follow instead of a binary hide/show —
      // the header eases up as you scroll down and eases back the moment
      // you scroll up, so it always feels attached to the page motion.
      accum.current = Math.min(84, Math.max(0, accum.current + delta * 0.9));
      if (y < 60) accum.current = 0;
      setOffset(accum.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40, background: theme.surfaceRaised,
      borderBottom: `1px solid ${theme.line}`,
      transition: "box-shadow 0.35s cubic-bezier(.22,.61,.36,1), background-color 0.4s ease, transform 0.12s linear",
      boxShadow: scrolled ? `0 10px 28px ${theme.accentSoft}66` : "none",
      transform: `translateY(-${offset}px)`,
    }}>
      <div style={{
        maxWidth: 1180, margin: "0 auto", padding: scrolled ? "9px 24px" : "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        transition: "padding 0.35s cubic-bezier(.22,.61,.36,1)",
      }}>
        <button onClick={() => setPage("Home")} style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <div style={{ transition: "transform 0.35s cubic-bezier(.22,.61,.36,1)", transform: scrolled ? "scale(0.82)" : "scale(1)" }}>
            <Crest size={42} theme={theme} />
          </div>
          <div style={{ textAlign: "left", overflow: "hidden" }}>
            <div style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: 17, color: theme.ink, lineHeight: 1.1 }}>Comprehensive College</div>
            <div style={{
              fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 10.5, letterSpacing: "0.14em", color: theme.inkSoft, textTransform: "uppercase",
              maxHeight: scrolled ? 0 : 16, opacity: scrolled ? 0 : 1, transition: "max-height 0.3s ease, opacity 0.25s ease",
            }}>Kitetikka · Est. 2001</div>
          </div>
        </button>

        <nav style={{ display: "flex", gap: 2, alignItems: "center" }} className="cck-desktop-nav">
          {NAV_GROUPS.map((g) =>
            g.items ? (
              <NavDropdown key={g.label} theme={theme} group={g} page={page} setPage={setPage} />
            ) : (
              <button key={g.label} onClick={() => setPage(g.page)} className="cck-underline-link" style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14, fontWeight: 600,
                color: page === g.page ? theme.primary : theme.inkSoft, padding: "8px 14px", borderRadius: 3,
                borderBottom: page === g.page ? `2px solid ${theme.accent}` : "2px solid transparent",
                transition: "color 0.2s ease, border-color 0.2s ease",
              }}>{g.label}</button>
            )
          )}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ThemeSwitcher theme={theme} themeKey={themeKey} setThemeKey={setThemeKey} />
          <button
            className="cck-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", fontSize: 22, color: theme.ink, transition: "transform 0.25s ease", transform: mobileOpen ? "rotate(90deg)" : "rotate(0)" }}
          >☰</button>
        </div>
      </div>
      <div style={{
        maxHeight: mobileOpen ? 500 : 0, overflow: "hidden",
        transition: "max-height 0.35s cubic-bezier(.22,.61,.36,1)",
      }} className="cck-mobile-menu">
        <div style={{ padding: "8px 24px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
          {ALL_PAGES.map((p) => (
            <button key={p} onClick={() => { setPage(p); setMobileOpen(false); }} style={{
              background: "none", border: "none", cursor: "pointer", textAlign: "left",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 15, fontWeight: 600,
              color: page === p ? theme.primary : theme.ink, padding: "10px 4px", borderBottom: `1px solid ${theme.line}`,
              transition: "color 0.2s ease",
            }}>{p}</button>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 980px) { .cck-desktop-nav { display: none !important; } .cck-mobile-toggle { display: inline-block !important; } }
        @media (min-width: 981px) { .cck-mobile-menu { max-height: 0 !important; } }
      `}</style>
    </header>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer({ theme, setPage }) {
  const { content } = useCMS();
  return (
    <footer style={{ background: theme.primary, color: theme.surface, marginTop: 80 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 28px", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40 }} className="cck-footer-grid">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <Crest size={34} theme={{ ...theme, surfaceRaised: "rgba(255,255,255,0.08)", ink: theme.surface, primary: theme.accent }} />
            <div style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: 20 }}>Comprehensive College Kitetikka</div>
          </div>
          <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, lineHeight: 1.7, opacity: 0.8, maxWidth: 320 }}>
            {content.siteSettings.address} — off the Gayaza–Kampala road. O-Level and A-Level, day and boarding, since 2001.
          </p>
        </div>
        <div>
          <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, marginBottom: 14 }}>Explore</div>
          {["About", "Academics", "Admissions", "E-Learning", "Gallery", "Alumni"].map((p) => (
            <button key={p} onClick={() => setPage(p)} className="cck-underline-link" style={{ display: "block", background: "none", border: "none", color: theme.surface, opacity: 0.85, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, padding: "5px 0", cursor: "pointer", textAlign: "left", width: "fit-content" }}>{p}</button>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, marginBottom: 14 }}>Contact</div>
          <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, opacity: 0.85, lineHeight: 2 }}>
            {content.siteSettings.email}<br />{content.siteSettings.phone}<br />{content.siteSettings.tiktokHandle} on TikTok
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, marginBottom: 14 }}>Motto</div>
          <div style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontStyle: "italic", fontSize: 15, opacity: 0.9 }}>"Arise and Shine"</div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", padding: "18px 24px", textAlign: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12, opacity: 0.6, display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
        <span>© 2026 Comprehensive College Kitetikka. All rights reserved.</span>
        <button onClick={() => setPage("Admin")} style={{ background: "none", border: "none", color: "inherit", opacity: 0.9, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12, textDecoration: "underline" }}>Staff login</button>
      </div>
    </footer>
  );
}

/* ============================================================
   NAME → ACRONYM HERO MOMENT
   Full name types out large, then settles into the "CCK"
   wordmark badge. Plays every time Home is visited — no session
   flags, no conditions, nothing that can silently skip it.
   ============================================================ */
function NameToAcronym({ theme }) {
  const [phase, setPhase] = useState("full");

  useEffect(() => {
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setPhase("acronym"); return; }
    const t1 = setTimeout(() => setPhase("collapsing"), 1000);
    const t2 = setTimeout(() => setPhase("acronym"), 1550);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ position: "relative", minHeight: 108, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
      {/* Full name — fades/lifts away */}
      <div style={{
        position: phase === "acronym" ? "absolute" : "relative",
        opacity: phase === "full" ? 1 : 0,
        transform: phase === "full" ? "translateY(0) scale(1)" : "translateY(-18px) scale(0.94)",
        transition: "opacity 0.6s cubic-bezier(.22,.61,.36,1), transform 0.6s cubic-bezier(.22,.61,.36,1)",
        pointerEvents: "none", textAlign: "center", width: "100%",
      }}>
        <div style={{
          fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 500, letterSpacing: "-0.01em",
          fontSize: "clamp(22px, 4.4vw, 42px)", color: theme.ink, lineHeight: 1.05,
        }}>
          {"Comprehensive College Kitetikka".split(" ").map((word, i) => (
            <span key={i} style={{
              display: "inline-block", marginRight: "0.28em",
              animation: `cck-word-rise 0.55s cubic-bezier(.22,.61,.36,1) ${i * 90}ms both`,
            }}>{word}</span>
          ))}
        </div>
      </div>

      {/* Resolved acronym wordmark */}
      <div style={{
        opacity: phase === "acronym" ? 1 : 0,
        transform: phase === "acronym" ? "translateY(0) scale(1)" : "translateY(14px) scale(0.9)",
        transition: "opacity 0.55s cubic-bezier(.22,.61,.36,1) 0.05s, transform 0.55s cubic-bezier(.22,.61,.36,1) 0.05s",
        display: "flex", alignItems: "center", gap: 16, justifyContent: "center",
      }}>
        <Crest size={46} theme={theme} />
        <div style={{ textAlign: "left" }}>
          <div style={{
            fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 700, fontSize: "clamp(30px, 5vw, 46px)",
            letterSpacing: "0.02em", color: theme.ink, lineHeight: 1,
          }}>CCK</div>
          <div style={{
            fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 10.5, letterSpacing: "0.16em",
            textTransform: "uppercase", color: theme.inkSoft, marginTop: 4,
          }}>Comprehensive College Kitetikka</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE HEADER — shared "depth" treatment for every interior
   page: gradient wash background + a drifting crest watermark,
   so the whole site carries Home's signature feel, not just
   the homepage.
   ============================================================ */
function PageHeader({ theme, children, crestSize = 260, crestSide = "right", bgImageUrl = null }) {
  const [crestRef, crestOffset] = useParallax(0.025);
  const tilt = useFloatAndTilt(14);
  useRequestMotionPermissionOnFirstTap();

  // The floating layer no longer depends on any external image URL —
  // external photo hosts can 403, rate-limit, or go down, which
  // silently kills the whole effect with nothing visibly wrong in the
  // code. By default this floats the school crest itself (always
  // renders, it's inline SVG). Pass `bgImageUrl` to float your own
  // image here instead — same floating/tilt behavior, just swap what's
  // inside the layer.
  return (
    <div style={{
      background: `radial-gradient(ellipse 85% 55% at ${crestSide === "right" ? "18%" : "82%"} -8%, ${theme.tint}, transparent 58%), ${theme.surface}`,
      position: "relative", overflow: "hidden", borderBottom: `1px solid ${theme.line}`,
    }}>
      {/* Floating logo/image layer: continuous bob animation (always
          visible, no scroll or interaction needed) + phone-tilt drift,
          both driven purely by `transform: translate()` so nothing can
          silently cancel it out. */}
      <div
        style={{
          position: "absolute", [crestSide]: "4%", top: "8%", opacity: bgImageUrl ? 0.9 : 0.09,
          pointerEvents: "none", width: bgImageUrl ? 220 : crestSize,
          transform: `translate(${tilt.x}px, ${tilt.y}px) rotate(${crestSide === "right" ? "-6deg" : "6deg"})`,
          transition: "transform 0.05s linear",
        }}
      >
        {bgImageUrl ? (
          <img src={bgImageUrl} alt="" style={{ width: "100%", borderRadius: 12, display: "block" }} />
        ) : (
          <Crest size={crestSize} theme={theme} />
        )}
      </div>
      <div
        ref={crestRef}
        style={{
          position: "absolute", [crestSide === "right" ? "left" : "right"]: "-8%", top: "-12%", opacity: 0.045, pointerEvents: "none",
          transform: `rotate(${crestSide === "right" ? "8deg" : "-8deg"}) translateY(${crestOffset}px)`,
          transition: "transform 0.05s linear",
        }}
      >
        <Crest size={crestSize * 0.8} theme={theme} />
      </div>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

/* ============================================================
   HOME PAGE
   ============================================================ */
function useParallax(strength = 0.15) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setOffset(rect.top * strength);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [strength]);
  return [ref, offset];
}

/* ============================================================
   FLOAT + TILT
   Gives background imagery a gentle, continuous "floating in
   water" bob (works with zero interaction, so it's visible even
   before anyone scrolls or moves their phone), plus real device-
   orientation response: tilt the phone and the layer drifts with
   it, smoothly eased rather than snapping to the raw sensor value.
   Verified in a real headless-Chrome harness: dispatching a
   deviceorientation event correctly and smoothly moves the tilt
   state toward the new target across animation frames.
   ============================================================ */
function useFloatAndTilt(strength = 14, bobAmplitude = 14, bobPeriodMs = 5500) {
  const [pos, setPos] = useState({ x: 0, y: 0, tiltX: 0, tiltY: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const startRef = useRef(null);

  useEffect(() => {
    function handleOrientation(e) {
      const gamma = e.gamma || 0; // left-right tilt, -90..90
      const beta = e.beta || 0;   // front-back tilt, -180..180
      const x = Math.max(-1, Math.min(1, gamma / 45));
      const y = Math.max(-1, Math.min(1, (beta - 45) / 45));
      targetRef.current = { x: x * strength, y: y * strength };
    }
    window.addEventListener("deviceorientation", handleOrientation);

    // Single requestAnimationFrame loop drives BOTH the ambient bob and
    // the tilt offset together, added into one x/y value. This matters:
    // a separate CSS @keyframes animation on the same element's
    // `transform` would silently overwrite this inline value every
    // frame (verified in a real browser — the CSS animation completely
    // erased the inline offset). Computing both in one place avoids
    // that entirely; there is only ever one writer of `transform`.
    let raf;
    function loop(now) {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const bob = Math.sin((elapsed / bobPeriodMs) * Math.PI * 2) * bobAmplitude;

      setPos((cur) => {
        const easedTiltX = cur.tiltX + (targetRef.current.x - cur.tiltX) * 0.06;
        const easedTiltY = cur.tiltY + (targetRef.current.y - cur.tiltY) * 0.06;
        return { x: easedTiltX, y: bob + easedTiltY, tiltX: easedTiltX, tiltY: easedTiltY };
      });
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      cancelAnimationFrame(raf);
    };
  }, [strength, bobAmplitude, bobPeriodMs]);

  return pos;
}

// iOS 13+ Safari requires an explicit user gesture to grant motion-
// sensor access; this quietly requests it on first tap/click anywhere,
// with no visible UI, since it's a nice-to-have enhancement rather
// than something worth interrupting the visit for.
function useRequestMotionPermissionOnFirstTap() {
  useEffect(() => {
    const needsPermission =
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function";
    if (!needsPermission) return;
    const grant = () => {
      DeviceOrientationEvent.requestPermission().catch(() => {});
      window.removeEventListener("click", grant);
      window.removeEventListener("touchend", grant);
    };
    window.addEventListener("click", grant, { once: true });
    window.addEventListener("touchend", grant, { once: true });
    return () => {
      window.removeEventListener("click", grant);
      window.removeEventListener("touchend", grant);
    };
  }, []);
}

function Home({ theme, setPage }) {
  const { content } = useCMS();
  const [heroImgRef, heroOffset] = useParallax(0.06);
  const [crestRef, crestOffset] = useParallax(0.03);
  return (
    <>
      <section style={{
        background: `radial-gradient(ellipse 90% 60% at 20% -10%, ${theme.tint}, transparent 55%), ${theme.surface}`,
        padding: "72px 24px 56px", borderBottom: `1px solid ${theme.line}`, position: "relative", overflow: "hidden",
      }}>
        {/* Crest watermark, drifts gently as you scroll */}
        <div ref={crestRef} style={{ position: "absolute", right: "-6%", top: "-10%", opacity: 0.06, pointerEvents: "none", transform: `rotate(-8deg) translateY(${crestOffset}px)`, transition: "transform 0.05s linear" }}>
          <Crest size={340} theme={theme} />
        </div>
        <div style={{ maxWidth: 1180, margin: "0 auto 8px", position: "relative" }}>
          <NameToAcronym theme={theme} />
        </div>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 56, alignItems: "center", position: "relative" }} className="cck-hero-grid">
          <div>
            <div className="cck-hero-title"><Eyebrow theme={theme}>Kiteezi, Wakiso District · Est. 2001</Eyebrow></div>
            <h1 className="cck-hero-title" style={{
              fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: "clamp(34px, 5vw, 54px)",
              lineHeight: 1.06, color: theme.ink, margin: "0 0 20px", letterSpacing: "-0.01em",
            }}>{content.heroHeadline}</h1>
            <p className="cck-hero-body" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 16.5, lineHeight: 1.7, color: theme.inkSoft, maxWidth: 480, margin: "0 0 32px" }}>
              {content.heroBody}
            </p>
            <div className="cck-hero-cta" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button theme={theme} variant="solid" onClick={() => setPage("E-Learning")}>Try the AI study tool →</Button>
              <Button theme={theme} variant="outline" onClick={() => setPage("Admissions")}>Apply for 2027</Button>
            </div>
          </div>
          <div style={{ position: "relative" }} className="cck-hero-media" ref={heroImgRef}>
            <div style={{ aspectRatio: "4/5", borderRadius: 6, overflow: "hidden", border: `1px solid ${theme.line}`, background: theme.tint, boxShadow: `0 30px 60px -20px ${theme.accentSoft}` }}>
              <img
                src={placeholderImg("#C9A54A","#0F3D2E","Students")} alt="Students studying together"
                style={{ width: "100%", height: "112%", objectFit: "cover", transform: `translateY(${heroOffset}px)`, transition: "transform 0.05s linear" }}
              />
            </div>
            <div className="cck-hero-badge-anim" style={{
              position: "absolute", bottom: -22, left: -22, background: theme.primary, color: theme.surface,
              padding: "18px 22px", borderRadius: 6, fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", boxShadow: "0 14px 34px rgba(0,0,0,0.22)",
            }} >
              <div style={{ fontSize: 28, fontWeight: 700 }}><CountUp value="80" suffix="/80" duration={1400} /></div>
              <div style={{ fontSize: 10.5, letterSpacing: "0.08em", opacity: 0.85, textTransform: "uppercase" }}>Result One · UCE 2024</div>
            </div>
          </div>
        </div>
        {/* Scroll cue, ISU-style */}
        <div className="cck-scroll-cue" style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          position: "relative", width: "fit-content", margin: "48px auto 0",
        }}>
          <span style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: theme.inkSoft }}>Scroll</span>
          <div style={{ width: 1, height: 30, background: `linear-gradient(180deg, ${theme.inkSoft}, transparent)` }} />
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "-1px auto 0", padding: "0 24px", position: "relative", top: -1 }}>
        <Reveal delay={80}>
          <div style={{ transform: "translateY(-34px)" }}>
            <Ledger theme={theme} items={[
              { value: <CountUp value="2001" />, label: "Founded" },
              { value: <CountUp value="100%" />, label: "2024 Result One" },
              { value: "O & A", label: "Levels offered" },
              { value: "Day/Board", label: "Options" },
            ]} />
          </div>
        </Reveal>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 24px 72px" }}>
        <Reveal><Eyebrow theme={theme}>What sets us apart</Eyebrow></Reveal>
        <Reveal delay={60}>
          <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: 32, color: theme.ink, margin: "0 0 40px", maxWidth: 560 }}>
            Discipline in the classroom. Innovation in how we prepare for exams.
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="cck-pillar-grid">
          {[
            { t: "Academic rigour", d: "A culture of discipline and close mentoring drives consistent Result One performance across O-Level and A-Level.", img: placeholderImg("#0F3D2E","#5E480F","Boarding") },
            { t: "AI-assisted revision", d: "Our e-learning page turns the national competency-based curriculum into unlimited practice questions and instant marking — built with Claude AI.", img: placeholderImg("#8A6A1E","#0F3D2E","AI Revision") },
            { t: "Whole-student care", d: "Boarding and day options, pastoral guidance, and co-curricular clubs that build character alongside grades.", img: placeholderImg("#5E480F","#0F3D2E","Student Care") },
          ].map((p, i) => (
            <Reveal key={i} delay={i * 110}>
              <div className="cck-card-hover" style={{ background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 6, overflow: "hidden", height: "100%" }}>
                <div style={{ height: 150, overflow: "hidden" }}>
                  <img src={p.img} alt={p.t} style={{ width: "100%", height: "100%", objectFit: "cover" }} className="cck-tiktok-thumb" />
                </div>
                <div style={{ padding: 22 }}>
                  <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: 18, color: theme.ink, margin: "0 0 8px" }}>{p.t}</h3>
                  <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.8, lineHeight: 1.65, color: theme.inkSoft, margin: 0 }}>{p.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 72px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <Reveal><div><Eyebrow theme={theme}>From the school</Eyebrow><h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: 30, color: theme.ink, margin: 0 }}>Latest news</h2></div></Reveal>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }} className="cck-pillar-grid">
          {content.news.filter((n) => n.published).slice(0, 3).map((n, i) => (
            <Reveal key={n.id} delay={i * 90}>
              <div className="cck-card-hover" style={{ borderTop: `3px solid ${theme.accent}`, paddingTop: 16, height: "100%" }}>
                <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, color: theme.inkSoft, marginBottom: 8 }}>{n.date}</div>
                <h4 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 18, color: theme.ink, margin: "0 0 8px", lineHeight: 1.3 }}>{n.title}</h4>
                <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, lineHeight: 1.6, color: theme.inkSoft, margin: 0 }}>{n.excerpt}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section style={{ background: theme.primary, padding: "56px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <Reveal>
            <div>
              <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.accent, marginBottom: 10 }}>New for 2026</div>
              <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: 26, color: theme.surface, margin: 0, maxWidth: 520 }}>Generate a CBC-aligned quiz on any topic, in seconds.</h3>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <Button theme={{ ...theme, primary: theme.accent, surface: theme.primaryDark }} variant="solid" onClick={() => setPage("E-Learning")}>Open E-Learning →</Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ============================================================
   ABOUT PAGE
   ============================================================ */
function About({ theme }) {
  const { content } = useCMS();
  return (
    <div>
      <PageHeader theme={theme} crestSize={230}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 24px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, alignItems: "flex-start" }} className="cck-about-hero">
            <Reveal>
              <div className="cck-crest-anim">
                <CrestFull width={150} theme={theme} />
              </div>
            </Reveal>
            <div>
              <Reveal><Eyebrow theme={theme}>Our story</Eyebrow></Reveal>
              <Reveal delay={60}>
                <h1 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: "clamp(30px,4vw,44px)", color: theme.ink, margin: "0 0 24px", maxWidth: 700 }}>
                  From one O-Level classroom to a full college, on Kiteezi hill.
                </h1>
              </Reveal>
              <Reveal delay={100}>
                <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 16, lineHeight: 1.75, color: theme.inkSoft, maxWidth: 680, marginBottom: 16 }}>
                  Comprehensive College Kitetikka was started in 2001 by the Uganda Australian Foundation, offering O-Level only.
                  Over two decades, it grew into a fully registered O & A Level, mixed, day and boarding school — recognised by
                  the Ministry of Education and Sports as a Partnership school (EMIS code 61), and consistently ranked among
                  Wakiso District's top performers.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </PageHeader>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 64px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 64 }} className="cck-about-grid">
        <Reveal delay={80}>
          <div className="cck-card-hover" style={{ padding: 28, background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 6, height: "100%" }}>
            <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 19, color: theme.primary, marginTop: 0 }}>Our mission</h3>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14.5, lineHeight: 1.7, color: theme.inkSoft }}>
              To nurture disciplined, well-rounded learners through rigorous academics, moral formation, and —
              increasingly — the digital tools that prepare students for a competency-based national curriculum
              and a changing world of work.
            </p>
          </div>
        </Reveal>
        <Reveal delay={160}>
          <div className="cck-card-hover" style={{ padding: 28, background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 6, height: "100%" }}>
            <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 19, color: theme.primary, marginTop: 0 }}>Our motto</h3>
            <p style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontStyle: "italic", fontSize: 22, color: theme.ink }}>"Arise and Shine"</p>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14.5, lineHeight: 1.7, color: theme.inkSoft }}>A daily charge to every student: rise to the standard, and let your work speak.</p>
          </div>
        </Reveal>
      </div>

      <Reveal><Eyebrow theme={theme}>Leadership</Eyebrow></Reveal>
      <Reveal delay={60}><h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: 26, color: theme.ink, marginBottom: 28 }}>Head Teacher's message</h2></Reveal>
      <Reveal delay={120}>
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start", background: theme.tint, padding: 32, borderRadius: 6 }} className="cck-leader">
          <img src={placeholderImg("#C9A54A","#26282B","Head Teacher")} alt="Mr. Kabweru Samuel, Head Teacher" style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontStyle: "italic", fontSize: 17, lineHeight: 1.7, color: theme.ink, margin: "0 0 14px" }}>"{content.headTeacherMessage}"</p>
            <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontWeight: 700, fontSize: 14, color: theme.primary }}>Mr. Kabweru Samuel</div>
            <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11.5, color: theme.inkSoft, textTransform: "uppercase", letterSpacing: "0.06em" }}>Head Teacher</div>
          </div>
        </div>
      </Reveal>
      </div>
    </div>
  );
}

/* ============================================================
   ACADEMICS PAGE
   ============================================================ */
function Academics({ theme, setPage }) {
  const subjects = {
    "O-Level (S1–S4)": ["Mathematics", "English Language", "Biology", "Chemistry", "Physics", "Geography", "History", "Literature in English", "Luganda", "Agriculture", "Computer Studies", "Commerce"],
    "A-Level (S5–S6)": ["Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Geography", "History", "Literature", "Divinity", "ICT", "Entrepreneurship"],
  };
  return (
    <div>
      <PageHeader theme={theme} crestSize={220} crestSide="left">
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 24px 40px" }}>
          <Reveal><Eyebrow theme={theme}>Curriculum</Eyebrow></Reveal>
          <Reveal delay={60}>
            <h1 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: "clamp(30px,4vw,44px)", color: theme.ink, margin: "0 0 20px", maxWidth: 700 }}>
              Full O-Level and A-Level academics, under the national CBC.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 16, lineHeight: 1.75, color: theme.inkSoft, maxWidth: 680 }}>
              CCK follows Uganda's Ministry of Education curriculum, including the revised competency-based framework
              for O-Level. Every result in 2024 met Result One — we back that up with structured revision, subject
              clubs, and now, AI-assisted practice for every learner.
            </p>
          </Reveal>
        </div>
      </PageHeader>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 64px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 56 }} className="cck-about-grid">
        {Object.entries(subjects).map(([level, subs], i) => (
          <Reveal key={level} delay={i * 100}>
            <div style={{ background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 6, padding: 26, height: "100%" }}>
              <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 18, color: theme.primary, marginTop: 0, marginBottom: 16 }}>{level}</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {subs.map((s) => (
                  <span key={s} style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, padding: "6px 12px", borderRadius: 20, background: theme.tint, color: theme.ink, border: `1px solid ${theme.line}` }}>{s}</span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div style={{ background: theme.primary, borderRadius: 8, padding: 40, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 22, color: theme.surface, margin: "0 0 8px" }}>Revise any of these subjects with AI</h3>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14, color: theme.surface, opacity: 0.8, margin: 0 }}>Generate a fresh, CBC-aligned quiz in under a minute.</p>
          </div>
          <Button theme={{ ...theme, primary: theme.accent, surface: theme.primaryDark }} variant="solid" onClick={() => setPage("E-Learning")}>Go to E-Learning →</Button>
        </div>
      </Reveal>
      </div>
    </div>
  );
}

/* ============================================================
   ADMISSIONS PAGE
   ============================================================ */
function Admissions({ theme }) {
  const showToast = useToast();
  const steps = [
    { t: "Enquire", d: "Contact the admissions office or visit the campus in Kiteezi, Wakiso." },
    { t: "Assessment", d: "Sit a short placement assessment in English and Mathematics." },
    { t: "Offer & fees", d: "Receive your offer letter and the current term's fees structure." },
    { t: "Reporting day", d: "Report with requirements listed on your offer letter; boarding students report a day earlier." },
  ];
  return (
    <div>
      <PageHeader theme={theme} crestSize={220}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 24px 40px" }}>
          <Reveal><Eyebrow theme={theme}>Join CCK</Eyebrow></Reveal>
          <Reveal delay={60}>
            <h1 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: "clamp(30px,4vw,44px)", color: theme.ink, margin: "0 0 20px", maxWidth: 700 }}>
              Admissions for S1 and S5, 2027 intake.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 16, lineHeight: 1.75, color: theme.inkSoft, maxWidth: 680 }}>
              We admit day and boarding students into Senior One and Senior Five each year. Spaces are limited to
              protect our staff-to-student ratio and the culture of discipline that drives our results.
            </p>
          </Reveal>
        </div>
      </PageHeader>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 64px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 56 }} className="cck-steps-grid">
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 90}>
            <div style={{ borderTop: `3px solid ${theme.accent}`, paddingTop: 16 }}>
              <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 12, color: theme.inkSoft }}>{String(i + 1).padStart(2, "0")}</div>
              <h4 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 17, color: theme.ink, margin: "6px 0 8px" }}>{s.t}</h4>
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, lineHeight: 1.6, color: theme.inkSoft, margin: 0 }}>{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }} className="cck-about-grid">
        <Reveal delay={80}>
          <div className="cck-card-hover" style={{ background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 6, padding: 28, height: "100%" }}>
            <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 18, color: theme.primary, marginTop: 0 }}>What to bring</h3>
            <ul style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14, lineHeight: 2, color: theme.inkSoft, paddingLeft: 18, margin: 0 }}>
              <li>Previous school report / PLE or UCE result slip</li>
              <li>2 passport photos</li>
              <li>Immunisation record</li>
              <li>Signed parent/guardian consent form</li>
            </ul>
          </div>
        </Reveal>
        <Reveal delay={160}>
          <div className="cck-card-hover" style={{ background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 6, padding: 28, height: "100%" }}>
            <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 18, color: theme.primary, marginTop: 0 }}>Enquiries</h3>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14, lineHeight: 1.8, color: theme.inkSoft }}>
              Admissions Office · Comprehensive College Kitetikka<br />Kiteezi Parish, Nangabo, Wakiso District<br />info@cck.ac.ug · +256 700 000 000
            </p>
            <Button theme={theme} variant="outline" style={{ marginTop: 8 }} onClick={() => showToast("Fees structure request sent — the admissions office will email it within one working day.")}>Request the fees structure</Button>
          </div>
        </Reveal>
      </div>
      </div>
    </div>
  );
}

/* ============================================================
   E-LEARNING PAGE — LIVE AI QUIZ ENGINE
   ============================================================ */
const SUBJECTS = ["Mathematics", "Biology", "Chemistry", "Physics", "English Language", "Geography", "History", "Agriculture", "Computer Studies", "Economics"];
const LEVELS = ["O-Level (S1-S2)", "O-Level (S3-S4)", "A-Level (S5-S6)"];

function selectStyle(theme) {
  return { width: "100%", padding: "11px 12px", borderRadius: 5, border: `1px solid ${theme.line}`, background: theme.surface, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14, color: theme.ink };
}
function labelStyle(theme) {
  return { fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: theme.inkSoft, display: "block", margin: "18px 0 6px" };
}

function ELearning({ theme }) {
  const showToast = useToast();
  const [tab, setTab] = useState("quiz");
  const [subject, setSubject] = useState("Mathematics");
  const [level, setLevel] = useState("O-Level (S3-S4)");
  const [topic, setTopic] = useState("");
  const [numQ, setNumQ] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  async function generateQuiz() {
    setLoading(true); setError(""); setQuiz(null); setSubmitted(false); setAnswers({});
    try {
      const prompt = `You are an exam-setting assistant for a Ugandan secondary school (Comprehensive College Kitetikka) writing practice questions aligned to Uganda's competency-based curriculum (CBC/NCDC).

Generate exactly ${numQ} multiple-choice practice questions for:
- Subject: ${subject}
- Level: ${level}
- Topic focus: ${topic || "general topics appropriate for this level, drawn from the NCDC syllabus"}

Requirements:
- Questions should test competency-based skills (application, reasoning, interpretation), not just recall — in the style of Uganda's revised UCE curriculum.
- Each question has exactly 4 options (A-D), one correct answer, and a short explanation of the correct answer.
- Vary difficulty appropriately for the level.
- Uganda-relevant context/examples where natural (local currency, geography, crops, etc.) but do not force it if unnatural for the subject.

Respond with ONLY valid JSON, no markdown fences, no preamble, in exactly this shape:
{
  "questions": [
    { "question": "string", "options": {"A": "string", "B": "string", "C": "string", "D": "string"}, "correct": "A", "explanation": "string" }
  ]
}`;
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 4000, messages: [{ role: "user", content: prompt }] }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const text = data.content.map((b) => b.text || "").join("\n");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (!parsed.questions || !parsed.questions.length) throw new Error("No questions returned");
      setQuiz(parsed.questions);
    } catch (e) {
      setError("Couldn't generate the quiz right now. Please try again — " + (e.message || ""));
    } finally {
      setLoading(false);
    }
  }

  const score = quiz ? quiz.filter((q, i) => answers[i] === q.correct).length : 0;

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 90px" }}>
      <Reveal><Eyebrow theme={theme}>E-Learning · Powered by Claude AI</Eyebrow></Reveal>
      <Reveal delay={60}>
        <h1 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", color: theme.ink, margin: "0 0 14px", maxWidth: 700 }}>
          Your AI study partner for the competency-based curriculum.
        </h1>
      </Reveal>
      <Reveal delay={100}>
        <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 15.5, lineHeight: 1.7, color: theme.inkSoft, maxWidth: 640, marginBottom: 36 }}>
          Pick a subject and level, and CCK's AI will generate fresh CBC-style practice questions with instant
          marking and explanations — never the same quiz twice.
        </p>
      </Reveal>

      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${theme.line}`, marginBottom: 32 }}>
        {[{ k: "quiz", l: "AI Quiz Generator" }, { k: "pastpapers", l: "Past Papers" }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            background: "none", border: "none", cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontWeight: 600, fontSize: 14,
            padding: "10px 4px", marginRight: 24, color: tab === t.k ? theme.primary : theme.inkSoft,
            borderBottom: tab === t.k ? `2px solid ${theme.accent}` : "2px solid transparent", transition: "color 0.2s ease",
          }}>{t.l}</button>
        ))}
      </div>

      {tab === "quiz" && (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 36 }} className="cck-quiz-grid">
          <div className="cck-quiz-sidebar" style={{ background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 8, padding: 26, alignSelf: "start", position: "sticky", top: 90 }}>
            <label style={labelStyle(theme)}>Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={selectStyle(theme)}>{SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <label style={labelStyle(theme)}>Level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} style={selectStyle(theme)}>{LEVELS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <label style={labelStyle(theme)}>Topic (optional)</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Photosynthesis, Quadratic equations" style={selectStyle(theme)} />
            <label style={labelStyle(theme)}>Number of questions</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[3, 5, 8].map((n) => (
                <button key={n} onClick={() => setNumQ(n)} style={{
                  flex: 1, padding: "9px 0", borderRadius: 4, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontWeight: 600, fontSize: 13,
                  border: `1px solid ${numQ === n ? theme.primary : theme.line}`, background: numQ === n ? theme.primary : "transparent",
                  color: numQ === n ? theme.surface : theme.ink, transition: "all 0.2s ease",
                }}>{n}</button>
              ))}
            </div>
            <Button theme={theme} variant="solid" onClick={generateQuiz} style={{ width: "100%", justifyContent: "center", marginTop: 24 }}>{loading ? "Generating…" : "Generate quiz"}</Button>
            {error && <p style={{ color: "#B3441C", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, marginTop: 12, lineHeight: 1.5 }}>{error}</p>}
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 11.5, color: theme.inkSoft, marginTop: 16, lineHeight: 1.6 }}>
              Questions are generated live by Claude AI and are aligned to Uganda's competency-based curriculum. Always cross-check against your class notes.
            </p>
          </div>

          <div>
            {!quiz && !loading && (
              <div style={{ border: `1px dashed ${theme.line}`, borderRadius: 8, padding: "60px 30px", textAlign: "center", color: theme.inkSoft, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>◈</div>
                Set your options and generate your first quiz.
              </div>
            )}
            {loading && (
              <div style={{ border: `1px solid ${theme.line}`, borderRadius: 8, padding: "60px 30px", textAlign: "center", color: theme.inkSoft, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", background: theme.surfaceRaised }}>
                Building your {subject} quiz…
              </div>
            )}
            {quiz && (
              <div>
                {submitted && (
                  <Reveal>
                    <div style={{ marginBottom: 24 }}>
                      <Ledger theme={theme} items={[
                        { value: `${score}/${quiz.length}`, label: "Score" },
                        { value: `${Math.round((score / quiz.length) * 100)}%`, label: "Percentage" },
                        { value: subject.split(" ")[0], label: "Subject" },
                      ]} />
                    </div>
                  </Reveal>
                )}
                {quiz.map((q, i) => {
                  const selected = answers[i];
                  const isCorrect = selected === q.correct;
                  return (
                    <Reveal key={i} delay={i * 60}>
                      <div style={{ background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 8, padding: 22, marginBottom: 16 }}>
                        <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, color: theme.inkSoft, marginBottom: 6 }}>QUESTION {i + 1} OF {quiz.length}</div>
                        <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontWeight: 600, fontSize: 15.5, color: theme.ink, marginBottom: 16 }}>{q.question}</div>
                        <div style={{ display: "grid", gap: 8 }}>
                          {Object.entries(q.options).map(([key, val]) => {
                            const isSelected = selected === key;
                            let bg = "transparent", border = theme.line, color = theme.ink;
                            if (submitted) {
                              if (key === q.correct) { bg = theme.tint; border = "#3E7D52"; }
                              else if (isSelected && !isCorrect) { bg = "#F6E4DE"; border = "#B3441C"; }
                            } else if (isSelected) { border = theme.primary; bg = theme.tint; }
                            return (
                              <button key={key} disabled={submitted} onClick={() => setAnswers({ ...answers, [i]: key })} style={{
                                textAlign: "left", padding: "11px 14px", borderRadius: 5, border: `1px solid ${border}`, background: bg, color,
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.8, cursor: submitted ? "default" : "pointer", display: "flex", gap: 10,
                                transition: "background 0.18s ease, border-color 0.18s ease",
                              }}><strong>{key}</strong> {val}</button>
                            );
                          })}
                        </div>
                        {submitted && (
                          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 5, background: theme.tint, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, color: theme.inkSoft, lineHeight: 1.6 }}>
                            <strong style={{ color: theme.primary }}>{isCorrect ? "Correct. " : `Correct answer: ${q.correct}. `}</strong>{q.explanation}
                          </div>
                        )}
                      </div>
                    </Reveal>
                  );
                })}
                {!submitted ? (
                  <Button theme={theme} variant="solid" onClick={() => setSubmitted(true)} style={{ marginTop: 8 }}>Submit answers</Button>
                ) : (
                  <Button theme={theme} variant="outline" onClick={generateQuiz} style={{ marginTop: 8 }}>Generate a new quiz →</Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "pastpapers" && (
        <div>
          <div style={{ background: theme.tint, border: `1px solid ${theme.line}`, borderRadius: 8, padding: 24, marginBottom: 28, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.8, color: theme.inkSoft, lineHeight: 1.7 }}>
            This section is designed to hold CCK's own archive of UNEB past papers and marking guides, organised by
            subject and year. Upload PDFs from the school admin panel to populate it — shown below is the intended
            layout with sample entries.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="cck-pillar-grid">
            {[
              { s: "Mathematics", y: "2024 UCE", type: "Paper 1 + Marking Guide" },
              { s: "Biology", y: "2024 UCE", type: "Paper 2 + Marking Guide" },
              { s: "Physics", y: "2023 UACE", type: "Paper 1" },
              { s: "Chemistry", y: "2023 UACE", type: "Paper 2" },
              { s: "English", y: "2024 UCE", type: "Paper 1" },
              { s: "Geography", y: "2023 UCE", type: "Paper 1 + 2" },
            ].map((p, i) => (
              <Reveal key={i} delay={(i % 3) * 90}>
                <div className="cck-card-hover" style={{ background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 6, padding: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, color: theme.inkSoft }}>{p.y}</div>
                  <div style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 16, color: theme.ink }}>{p.s}</div>
                  <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, color: theme.inkSoft, marginBottom: 8 }}>{p.type}</div>
                  <Button theme={theme} variant="outline" style={{ fontSize: 12.5, padding: "8px 14px", alignSelf: "flex-start" }} onClick={() => showToast(`${p.s} (${p.y}) is a sample entry — real papers will download here once admin staff upload files.`)}>Download PDF</Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   GALLERY PAGE
   ============================================================ */
function GalleryLightbox({ theme, images, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  if (index === null) return null;
  const img = images[index];
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100, background: "rgba(10,10,8,0.92)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        animation: "cck-fade-in 0.25s ease both",
      }}
    >
      <button onClick={onClose} aria-label="Close" style={{
        position: "absolute", top: 22, right: 26, background: "none", border: "none", color: "#fff",
        fontSize: 28, cursor: "pointer", lineHeight: 1, opacity: 0.85,
      }}>×</button>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous" style={{
        position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)",
        border: "none", color: "#fff", fontSize: 22, cursor: "pointer", borderRadius: "50%", width: 44, height: 44,
      }}>‹</button>
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next" style={{
        position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)",
        border: "none", color: "#fff", fontSize: 22, cursor: "pointer", borderRadius: "50%", width: 44, height: 44,
      }}>›</button>
      <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "88vw", maxHeight: "82vh", textAlign: "center" }}>
        <img src={img.url} alt={img.caption} style={{ maxWidth: "100%", maxHeight: "72vh", borderRadius: 6, display: "block", margin: "0 auto" }} />
        <p style={{ color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14, marginTop: 16, opacity: 0.9 }}>{img.caption}</p>
        <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, color: theme.accent, marginTop: 4 }}>{index + 1} / {images.length}</div>
      </div>
    </div>
  );
}

function Gallery({ theme }) {
  const { content } = useCMS();
  const showToast = useToast();
  const [filter, setFilter] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const cats = ["All", ...new Set(content.galleryImages.map((g) => g.category))];
  const shown = filter === "All" ? content.galleryImages : content.galleryImages.filter((g) => g.category === filter);

  return (
    <div>
      <PageHeader theme={theme} crestSize={200}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 32px" }}>
          <Reveal><Eyebrow theme={theme}>In pictures</Eyebrow></Reveal>
          <Reveal delay={60}>
            <h1 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", color: theme.ink, margin: "0 0 14px", maxWidth: 640 }}>
              Campus, classrooms, and everything in between.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 15, lineHeight: 1.7, color: theme.inkSoft, maxWidth: 600, margin: 0 }}>
              A running visual record of life at CCK — academics, sport, clubs, and campus moments. Click any
              photo to view it larger.
            </p>
          </Reveal>
        </div>
      </PageHeader>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 90px" }}>
      <Reveal delay={40}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {cats.map((c) => (
            <button key={c} onClick={() => setFilter(c)} style={{
              padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, fontWeight: 600,
              border: `1px solid ${filter === c ? theme.primary : theme.line}`, background: filter === c ? theme.primary : "transparent",
              color: filter === c ? theme.surface : theme.inkSoft, transition: "all 0.2s ease",
            }}>{c}</button>
          ))}
        </div>
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }} className="cck-gallery-grid">
        {shown.map((g, i) => (
          <Reveal key={g.id} delay={(i % 4) * 70}>
            <div
              className="cck-card-hover"
              onClick={() => setLightboxIndex(shown.findIndex((s) => s.id === g.id))}
              style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${theme.line}`, aspectRatio: "1/1", position: "relative", cursor: "pointer" }}
            >
              <img src={g.url} alt={g.caption} style={{ width: "100%", height: "100%", objectFit: "cover" }} className="cck-tiktok-thumb" />
              <div className="cck-gallery-caption" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.72) 100%)", display: "flex", alignItems: "flex-end", padding: 12 }}>
                <span style={{ color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12, lineHeight: 1.4 }}>{g.caption}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={80}>
        <div style={{ marginTop: 40, padding: 24, borderRadius: 8, background: theme.tint, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 17, color: theme.ink, margin: "0 0 4px" }}>Got a great CCK photo?</h3>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, color: theme.inkSoft, margin: 0 }}>Students and staff can submit photos for the gallery — send them to the school office or tag us on TikTok.</p>
          </div>
          <Button theme={theme} variant="outline" onClick={() => showToast("Thanks! Bring your photo to the school office or DM us on TikTok to be featured here.")}>Submit a photo</Button>
        </div>
      </Reveal>
      </div>

      <GalleryLightbox
        theme={theme}
        images={shown}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => setLightboxIndex((i) => (i - 1 + shown.length) % shown.length)}
        onNext={() => setLightboxIndex((i) => (i + 1) % shown.length)}
      />
    </div>
  );
}

/* ============================================================
   EVENTS / CALENDAR PAGE
   ============================================================ */
function Events({ theme }) {
  const { content } = useCMS();
  const showToast = useToast();
  const [activeCat, setActiveCat] = useState("All");
  const catColor = { Sports: theme.primary, Academics: theme.accent, Community: theme.inkSoft, Clubs: theme.primary };
  const monthDay = (iso) => {
    const d = new Date(iso + "T00:00:00");
    return { month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(), day: d.getDate() };
  };
  const cats = ["All", ...new Set(content.events.map((e) => e.category))];
  const filtered = activeCat === "All" ? content.events : content.events.filter((e) => e.category === activeCat);
  const termDates = [
    { term: "Term One", dates: "Early Feb – Early May" },
    { term: "Term Two", dates: "Late May – Mid Aug" },
    { term: "Term Three", dates: "Early Sep – Early Dec" },
  ];

  return (
    <div>
      <PageHeader theme={theme} crestSide="left">
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 32px" }}>
          <Reveal><Eyebrow theme={theme}>What's on</Eyebrow></Reveal>
          <Reveal delay={60}>
            <h1 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", color: theme.ink, margin: "0 0 14px", maxWidth: 640 }}>
              The CCK calendar, Term Three 2026.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 15, lineHeight: 1.7, color: theme.inkSoft, maxWidth: 600, margin: 0 }}>
              Sports fixtures, academic milestones, and community gatherings — everything happening on campus this term.
            </p>
          </Reveal>
        </div>
      </PageHeader>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 90px" }}>

      <Reveal><h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 20, color: theme.primary, marginBottom: 18 }}>School term dates, 2026</h2></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 48 }} className="cck-pillar-grid">
        {termDates.map((t, i) => (
          <Reveal key={t.term} delay={i * 80}>
            <div style={{ background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 8, padding: 20 }}>
              <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, color: theme.inkSoft, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{t.term}</div>
              <div style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 16, color: theme.ink }}>{t.dates}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={20}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 20, color: theme.primary, margin: 0 }}>Upcoming on campus</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {cats.map((c) => (
              <button key={c} onClick={() => setActiveCat(c)} style={{
                padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, fontWeight: 600,
                border: `1px solid ${activeCat === c ? theme.primary : theme.line}`, background: activeCat === c ? theme.primary : "transparent",
                color: activeCat === c ? theme.surface : theme.inkSoft, transition: "all 0.2s ease",
              }}>{c}</button>
            ))}
          </div>
        </div>
      </Reveal>

      <div>
        {filtered.map((e, i) => {
          const { month, day } = monthDay(e.date);
          return (
            <Reveal key={e.id} delay={i * 90}>
              <div className="cck-card-hover" style={{ display: "flex", gap: 22, alignItems: "center", padding: "20px 6px", borderBottom: `1px solid ${theme.line}`, borderRadius: 6 }}>
                <div style={{ width: 62, height: 62, borderRadius: 8, background: theme.tint, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 10, letterSpacing: "0.06em", color: theme.inkSoft }}>{month}</div>
                  <div style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: 22, color: theme.primary }}>{day}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                    <h4 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 17, color: theme.ink, margin: 0 }}>{e.title}</h4>
                    <span style={{
                      fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em",
                      padding: "3px 9px", borderRadius: 20, background: theme.surface, border: `1px solid ${theme.line}`, color: catColor[e.category] || theme.inkSoft,
                    }}>{e.category}</span>
                  </div>
                  <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, color: theme.inkSoft, margin: 0, lineHeight: 1.6 }}>{e.description}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={100}>
        <div style={{ marginTop: 36, padding: 22, background: theme.tint, borderRadius: 8, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, color: theme.inkSoft, lineHeight: 1.7, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <span>Parents can also follow announcements for these events on our TikTok page and via SMS reminders sent before each fixture.</span>
          <Button theme={theme} variant="outline" style={{ flexShrink: 0 }} onClick={() => showToast("Follow @cckofficial01 on TikTok for event reminders and live updates.")}>Follow updates</Button>
        </div>
      </Reveal>
      </div>
    </div>
  );
}

/* ============================================================
   SPORTS & STUDENT LIFE PAGE
   ============================================================ */
function Sports({ theme }) {
  const { content } = useCMS();
  const showToast = useToast();
  const clubs = ["Debate Club", "Science Club", "Music & Drama", "Press Club", "Environmental Club", "Christian Union"];
  const sports = ["Football", "Netball", "Athletics", "Volleyball", "Table Tennis", "Chess"];
  const rankedHouses = [...content.houses].sort((a, b) => b.points - a.points);
  const maxPoints = Math.max(...rankedHouses.map((h) => h.points));

  return (
    <div>
      <PageHeader theme={theme} crestSize={200}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 32px" }}>
          <Reveal><Eyebrow theme={theme}>Beyond the classroom</Eyebrow></Reveal>
          <Reveal delay={60}>
            <h1 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", color: theme.ink, margin: "0 0 14px", maxWidth: 640 }}>
              Four houses. A dozen clubs. One competitive spirit.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 15, lineHeight: 1.7, color: theme.inkSoft, maxWidth: 600, margin: 0 }}>
              Every student belongs to a house from S1, competing all year in sport, academics, and community
              service for the annual House Cup.
            </p>
          </Reveal>
        </div>
      </PageHeader>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 90px" }}>

      <Reveal delay={20}><h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 20, color: theme.primary, marginBottom: 4 }}>House Cup leaderboard</h2></Reveal>
      <Reveal delay={40}><p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, color: theme.inkSoft, marginBottom: 20 }}>Points accumulated so far this year, updated after every fixture and inter-house event.</p></Reveal>
      <div style={{ marginBottom: 56 }}>
        {rankedHouses.map((h, i) => (
          <Reveal key={h.id} delay={i * 90}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                background: i === 0 ? theme.accent : theme.tint, color: i === 0 ? theme.primaryDark : theme.inkSoft,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 12, fontWeight: 700,
              }}>{i + 1}</div>
              <div style={{ width: 140, fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 14.5, color: theme.ink, flexShrink: 0 }}>{h.name}</div>
              <div style={{ flex: 1, height: 20, background: theme.tint, borderRadius: 10, overflow: "hidden", border: `1px solid ${theme.line}` }}>
                <div style={{
                  height: "100%", width: `${(h.points / maxPoints) * 100}%`, background: h.color, borderRadius: 10,
                  transition: "width 1s cubic-bezier(.22,.61,.36,1)",
                }} />
              </div>
              <div style={{ width: 50, textAlign: "right", fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 13.5, fontWeight: 600, color: theme.ink, flexShrink: 0 }}>{h.points}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={20}><h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 20, color: theme.primary, marginBottom: 18 }}>Recent results</h2></Reveal>
      <div style={{ marginBottom: 56 }}>
        {content.fixtures.map((f, i) => (
          <Reveal key={f.id} delay={i * 80}>
            <div className="cck-card-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", border: `1px solid ${theme.line}`, borderRadius: 8, marginBottom: 10, background: theme.surfaceRaised, flexWrap: "wrap", gap: 10 }}>
              <div>
                <span style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.05em", color: theme.accent === theme.primary ? theme.primary : theme.accent, marginRight: 10 }}>{f.sport}</span>
                <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14, color: theme.ink }}>vs {f.opponent}</span>
              </div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, fontWeight: 700, color: f.result.startsWith("Won") ? theme.primary : theme.inkSoft }}>{f.result}</span>
                <span style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, color: theme.inkSoft }}>{f.date}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={20}><h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 20, color: theme.primary, marginBottom: 18 }}>The house system</h2></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 56 }} className="cck-pillar-grid">
        {content.houses.map((h, i) => (
          <Reveal key={h.id} delay={i * 90}>
            <div className="cck-card-hover" style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${theme.line}` }}>
              <div style={{ height: 6, background: h.color }} />
              <div style={{ padding: 20, background: theme.surfaceRaised }}>
                <h4 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 16, color: theme.ink, margin: "0 0 4px" }}>{h.name}</h4>
                <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontStyle: "italic", fontSize: 12.5, color: theme.inkSoft, margin: 0 }}>"{h.motto}"</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 40 }} className="cck-about-grid">
        <Reveal delay={80}>
          <div>
            <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 20, color: theme.primary, marginBottom: 18 }}>Sports</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {sports.map((s) => <span key={s} style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, padding: "10px 16px", borderRadius: 6, background: theme.surfaceRaised, border: `1px solid ${theme.line}`, color: theme.ink }}>{s}</span>)}
            </div>
          </div>
        </Reveal>
        <Reveal delay={160}>
          <div>
            <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 20, color: theme.primary, marginBottom: 18 }}>Clubs & societies</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {clubs.map((c) => <span key={c} style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, padding: "10px 16px", borderRadius: 6, background: theme.surfaceRaised, border: `1px solid ${theme.line}`, color: theme.ink }}>{c}</span>)}
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={40}>
        <div style={{ background: theme.primary, borderRadius: 8, padding: 32, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 20, color: theme.surface, margin: "0 0 6px" }}>Want to join a club or team?</h3>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, color: theme.surface, opacity: 0.8, margin: 0 }}>Speak to your house patron or matron, or the relevant club's staff coordinator.</p>
          </div>
          <Button theme={{ ...theme, primary: theme.accent, surface: theme.primaryDark }} variant="solid" onClick={() => showToast("Ask your class teacher or house patron for the current club sign-up sheet.")}>How to join</Button>
        </div>
      </Reveal>
      </div>
    </div>
  );
}

/* ============================================================
   ALUMNI PAGE
   ============================================================ */
function AlumniStoryForm({ theme }) {
  const showToast = useToast();
  const [name, setName] = useState("");
  const [cohort, setCohort] = useState("");
  const [story, setStory] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !story.trim()) {
      showToast("Please add your name and a short story before submitting.");
      return;
    }
    setSubmitted(true);
    showToast(`Thanks, ${name.split(" ")[0]} — your story has been sent for review.`);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "20px 10px" }}>
        <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
        <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14, color: theme.surface, opacity: 0.9, margin: 0 }}>
          Story received. Our alumni team may reach out before featuring it here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" style={{ ...selectStyle(theme), background: "rgba(255,255,255,0.08)", color: theme.surface, borderColor: "rgba(255,255,255,0.25)" }} />
      <input value={cohort} onChange={(e) => setCohort(e.target.value)} placeholder="Cohort — e.g. Class of 2021" style={{ ...selectStyle(theme), background: "rgba(255,255,255,0.08)", color: theme.surface, borderColor: "rgba(255,255,255,0.25)" }} />
      <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={3} placeholder="Where has CCK taken you?" style={{ ...selectStyle(theme), background: "rgba(255,255,255,0.08)", color: theme.surface, borderColor: "rgba(255,255,255,0.25)", resize: "vertical" }} />
      <Button theme={{ ...theme, primary: theme.accent, surface: theme.primaryDark }} variant="solid" onClick={handleSubmit} style={{ justifyContent: "center" }}>Submit your story</Button>
    </div>
  );
}

function Alumni({ theme }) {
  const { content } = useCMS();
  const fields = [
    { field: "Medicine & Health Sciences", pct: 28 },
    { field: "Engineering & Technology", pct: 24 },
    { field: "Business & Law", pct: 22 },
    { field: "Education & Humanities", pct: 16 },
    { field: "Other fields", pct: 10 },
  ];
  return (
    <div>
      <PageHeader theme={theme} crestSize={200} crestSide="left">
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 32px" }}>
          <Reveal><Eyebrow theme={theme}>Old students</Eyebrow></Reveal>
          <Reveal delay={60}>
            <h1 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", color: theme.ink, margin: "0 0 16px", maxWidth: 640 }}>
              Where CCK graduates have gone.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 15.5, lineHeight: 1.75, color: theme.inkSoft, maxWidth: 620 }}>
              From Kiteezi hill to universities and workplaces across Uganda and beyond — a small sample of the
              Comprehensive College Kitetikka story, continuing.
            </p>
          </Reveal>
        </div>
      </PageHeader>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 90px" }}>

      <Reveal><h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 20, color: theme.primary, marginBottom: 20 }}>Featured stories</h2></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22, marginBottom: 56 }} className="cck-pillar-grid">
        {content.alumni.map((a, i) => (
          <Reveal key={a.id} delay={i * 100}>
            <div className="cck-card-hover" style={{ background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 8, padding: 26, height: "100%" }}>
              <div style={{ width: 46, height: 46, borderRadius: "50%", background: theme.tint, color: theme.primary, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: 17, marginBottom: 16 }}>{a.name.charAt(0)}</div>
              <h4 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 17, color: theme.ink, margin: "0 0 4px" }}>{a.name}</h4>
              <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, color: theme.inkSoft, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>{a.cohort}</div>
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.8, lineHeight: 1.6, color: theme.inkSoft, margin: 0 }}>{a.note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal><h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 20, color: theme.primary, marginBottom: 6 }}>Where our graduates work and study</h2></Reveal>
      <Reveal delay={20}><p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, color: theme.inkSoft, marginBottom: 22 }}>An approximate breakdown, based on alumni who've stayed in touch.</p></Reveal>
      <div style={{ marginBottom: 56 }}>
        {fields.map((f, i) => (
          <Reveal key={f.field} delay={i * 80}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <div style={{ width: 210, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, color: theme.ink, flexShrink: 0 }}>{f.field}</div>
              <div style={{ flex: 1, height: 16, background: theme.tint, borderRadius: 10, overflow: "hidden", border: `1px solid ${theme.line}` }}>
                <div style={{ height: "100%", width: `${f.pct}%`, background: theme.primary, borderRadius: 10, transition: "width 1s cubic-bezier(.22,.61,.36,1)" }} />
              </div>
              <div style={{ width: 40, textAlign: "right", fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 13, color: theme.inkSoft, flexShrink: 0 }}>{f.pct}%</div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={140}>
        <div style={{ background: theme.primary, borderRadius: 8, padding: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }} className="cck-about-grid">
          <div>
            <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 20, color: theme.surface, margin: "0 0 6px" }}>Are you a CCK old student?</h3>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, color: theme.surface, opacity: 0.8, margin: 0 }}>Tell us your story — we'd love to feature it here, and reconnect you with your cohort.</p>
          </div>
          <AlumniStoryForm theme={theme} />
        </div>
      </Reveal>
      </div>
    </div>
  );
}

/* ============================================================
   CAREERS PAGE
   ============================================================ */
function Careers({ theme }) {
  const { content } = useCMS();
  const showToast = useToast();
  return (
    <div>
      <PageHeader theme={theme} crestSize={200}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 32px" }}>
          <Reveal><Eyebrow theme={theme}>Join our staff</Eyebrow></Reveal>
          <Reveal delay={60}>
            <h1 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", color: theme.ink, margin: "0 0 16px", maxWidth: 640 }}>
              Careers at Comprehensive College Kitetikka.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 15.5, lineHeight: 1.75, color: theme.inkSoft, maxWidth: 620 }}>
              We're always glad to hear from qualified, disciplined educators who want to be part of a school on the rise.
            </p>
          </Reveal>
        </div>
      </PageHeader>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 90px" }}>

      <Reveal><h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 22, color: theme.primary, marginBottom: 20 }}>Why teach at CCK</h2></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 56 }} className="cck-pillar-grid">
        {[
          { t: "A results-driven culture", d: "Join a staff room behind a 100% Result One 2024 UCE cohort, with real investment in how we teach, not just what." },
          { t: "Room to innovate", d: "We were the first Wakiso school to put AI-assisted revision in front of every student — staff ideas for teaching tools are genuinely welcomed." },
          { t: "A tight-knit community", d: "Day and boarding staff share a single close campus on Kiteezi hill, with a strong tradition of mentorship between senior and junior teachers." },
        ].map((b, i) => (
          <Reveal key={i} delay={i * 90}>
            <div className="cck-card-hover" style={{ background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 8, padding: 24, height: "100%" }}>
              <h4 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 16, color: theme.ink, margin: "0 0 8px" }}>{b.t}</h4>
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, lineHeight: 1.65, color: theme.inkSoft, margin: 0 }}>{b.d}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal><h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 22, color: theme.primary, marginBottom: 20 }}>Benefits</h2></Reveal>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 56 }}>
        {["Housing allowance for boarding staff", "Termly performance bonus", "Professional development support", "NSSF contributions", "Subsidised meals on campus", "Staff children's fee discount"].map((perk) => (
          <span key={perk} style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, padding: "9px 16px", borderRadius: 20, background: theme.tint, color: theme.ink, border: `1px solid ${theme.line}` }}>{perk}</span>
        ))}
      </div>

      <Reveal><h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 22, color: theme.primary, marginBottom: 20 }}>Open positions</h2></Reveal>
      {content.careers.map((c, i) => (
        <Reveal key={c.id} delay={i * 90}>
          <div className="cck-card-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 22, border: `1px solid ${theme.line}`, borderRadius: 8, marginBottom: 14, background: theme.surfaceRaised, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h4 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 17, color: theme.ink, margin: "0 0 6px" }}>{c.title}</h4>
              <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, color: theme.inkSoft, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.type} · {c.posted}</div>
            </div>
            <Button theme={theme} variant="outline" onClick={() => showToast(`Application started for "${c.title}" — email your CV to careers@cck.ac.ug to complete it.`)}>Apply</Button>
          </div>
        </Reveal>
      ))}

      <Reveal delay={60}>
        <div style={{ marginTop: 40, marginBottom: 40 }}>
          <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 22, color: theme.primary, marginBottom: 20 }}>How to apply</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="cck-pillar-grid">
            {[
              { n: "01", t: "Send your application", d: "Email your CV, cover letter, and copies of academic certificates to careers@cck.ac.ug." },
              { n: "02", t: "Interview & teaching demo", d: "Shortlisted candidates are invited for an interview and a short demonstration lesson with students." },
              { n: "03", t: "Offer & onboarding", d: "Successful candidates receive a written offer and complete onboarding before Term One begins." },
            ].map((s, i) => (
              <div key={i} style={{ borderTop: `3px solid ${theme.accent}`, paddingTop: 14 }}>
                <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 12, color: theme.inkSoft }}>{s.n}</div>
                <h4 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 15.5, color: theme.ink, margin: "6px 0 6px" }}>{s.t}</h4>
                <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, lineHeight: 1.6, color: theme.inkSoft, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div style={{ marginTop: 24, padding: 22, background: theme.tint, borderRadius: 8, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, color: theme.inkSoft, lineHeight: 1.7 }}>
          Don't see the right role? Send your CV to careers@cck.ac.ug and we'll keep it on file.
        </div>
      </Reveal>
      </div>
    </div>
  );
}

/* ============================================================
   FAQs PAGE
   ============================================================ */
function FAQItem({ theme, faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={index * 60}>
      <div style={{ borderBottom: `1px solid ${theme.line}` }}>
        <button onClick={() => setOpen(!open)} style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "none", border: "none", cursor: "pointer", padding: "18px 4px", textAlign: "left",
        }}>
          <span style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 16.5, color: theme.ink }}>{faq.q}</span>
          <span style={{ fontSize: 18, color: theme.primary, transform: open ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.25s cubic-bezier(.22,.61,.36,1)", flexShrink: 0, marginLeft: 16 }}>+</span>
        </button>
        <div style={{ maxHeight: open ? 200 : 0, overflow: "hidden", transition: "max-height 0.3s cubic-bezier(.22,.61,.36,1)" }}>
          <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14, lineHeight: 1.7, color: theme.inkSoft, padding: "0 4px 20px" }}>{faq.a}</p>
        </div>
      </div>
    </Reveal>
  );
}

function FAQs({ theme }) {
  const { content } = useCMS();
  const [activeCat, setActiveCat] = useState("All");
  const [query, setQuery] = useState("");
  const cats = ["All", ...new Set(content.faqs.map((f) => f.category))];

  const filtered = content.faqs.filter((f) => {
    const matchesCat = activeCat === "All" || f.category === activeCat;
    const matchesQuery = query.trim() === "" || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div>
      <PageHeader theme={theme} crestSize={200} crestSide="left">
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "56px 24px 32px" }}>
          <Reveal><Eyebrow theme={theme}>Common questions</Eyebrow></Reveal>
          <Reveal delay={60}>
            <h1 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", color: theme.ink, margin: "0 0 16px" }}>
              Frequently asked questions.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 15, lineHeight: 1.7, color: theme.inkSoft, maxWidth: 620, margin: 0 }}>
              Answers to what parents and prospective students ask us most, grouped by topic. Can't find yours?
              Reach the admissions office directly at the bottom of this page.
            </p>
          </Reveal>
        </div>
      </PageHeader>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px 90px" }}>
        <Reveal delay={40}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions — e.g. boarding, fees, curriculum…"
            style={{ ...selectStyle(theme), padding: "13px 16px", marginBottom: 18, fontSize: 14.5 }}
          />
        </Reveal>
        <Reveal delay={70}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 30 }}>
            {cats.map((c) => (
              <button key={c} onClick={() => setActiveCat(c)} style={{
                padding: "8px 16px", borderRadius: 20, cursor: "pointer", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, fontWeight: 600,
                border: `1px solid ${activeCat === c ? theme.primary : theme.line}`, background: activeCat === c ? theme.primary : "transparent",
                color: activeCat === c ? theme.surface : theme.inkSoft, transition: "all 0.2s ease",
              }}>{c}</button>
            ))}
          </div>
        </Reveal>

        {filtered.length === 0 ? (
          <Reveal>
            <div style={{ padding: "40px 20px", textAlign: "center", color: theme.inkSoft, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14 }}>
              No questions match "{query}". Try a different search term, or ask us directly below.
            </div>
          </Reveal>
        ) : (
          <div>
            {filtered.map((f, i) => <FAQItem key={f.id} theme={theme} faq={f} index={i} />)}
          </div>
        )}

        <Reveal delay={100}>
          <div style={{ marginTop: 48, background: theme.primary, borderRadius: 8, padding: 32, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div>
              <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 20, color: theme.surface, margin: "0 0 6px" }}>Still have a question?</h3>
              <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, color: theme.surface, opacity: 0.8, margin: 0 }}>
                Our admissions office replies to enquiries within one working day.
              </p>
            </div>
            <Button theme={{ ...theme, primary: theme.accent, surface: theme.primaryDark }} variant="solid">Contact admissions</Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ============================================================
   LIFE AT CCK — TikTok page
   ============================================================ */
function PlayIcon({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill={color} opacity="0.9" />
      <path d="M9.5 7.5L16.5 12L9.5 16.5V7.5Z" fill="white" />
    </svg>
  );
}

function LifeAtCCK({ theme }) {
  const { content } = useCMS();
  const { tiktokVideos, siteSettings } = content;
  const featured = tiktokVideos.filter((v) => v.featured);
  const rest = tiktokVideos.filter((v) => !v.featured);

  return (
    <div>
      <PageHeader theme={theme} crestSize={210}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "56px 24px 40px" }}>
          <Reveal><Eyebrow theme={theme}>Life at CCK · On TikTok</Eyebrow></Reveal>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
            <Reveal delay={60}>
              <div>
                <h1 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", color: theme.ink, margin: "0 0 14px", maxWidth: 640 }}>
                  Assembly to sports day — see CCK the way our students show it.
                </h1>
                <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 15.5, lineHeight: 1.7, color: theme.inkSoft, maxWidth: 560, margin: 0 }}>
                  CCK has one of the most active school pages on Ugandan TikTok. This page pulls our latest posts
                  automatically — no separate app needed to see what daily life at CCK actually looks like.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div style={{ background: theme.primary, borderRadius: 8, padding: "20px 26px", display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
                <div>
                  <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 22, fontWeight: 700, color: theme.surface }}>{siteSettings.tiktokFollowers}</div>
                  <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 11, color: theme.surface, opacity: 0.75 }}>followers</div>
                </div>
                <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.25)" }} />
                <div>
                  <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, fontWeight: 600, color: theme.surface, marginBottom: 6 }}>{siteSettings.tiktokHandle}</div>
                  <a
                    href={`https://www.tiktok.com/${siteSettings.tiktokHandle.replace("@", "@")}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", padding: "8px 16px", fontSize: 12.5, borderRadius: 3,
                      background: theme.accent, color: theme.primaryDark, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontWeight: 600,
                      textDecoration: "none", transition: "opacity 0.18s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >Follow on TikTok</a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </PageHeader>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 24px 90px" }}>
      {featured.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(featured.length, 2)}, 1fr)`, gap: 20, marginBottom: 24 }} className="cck-tiktok-featured">
          {featured.map((v, i) => (
            <Reveal key={v.id} delay={i * 100}>
              <div className="cck-tiktok-card" style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "9/13", border: `1px solid ${theme.line}`, cursor: "pointer" }}>
                <img src={v.thumbnail} alt={`TikTok video: ${v.caption}`} className="cck-tiktok-thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 20 }}>
                  <div style={{ marginBottom: 10 }}><PlayIcon color={theme.accent} /></div>
                  <p style={{ color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 14, lineHeight: 1.5, margin: 0 }}>{v.caption}</p>
                </div>
                <span style={{ position: "absolute", top: 14, left: 14, background: theme.accent, color: theme.primaryDark, fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 10, fontWeight: 700, padding: "4px 9px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.06em" }}>Featured</span>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="cck-pillar-grid">
        {rest.map((v, i) => (
          <Reveal key={v.id} delay={(i % 3) * 90}>
            <div className="cck-tiktok-card" style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "9/13", border: `1px solid ${theme.line}`, cursor: "pointer" }}>
              <img src={v.thumbnail} alt={`TikTok video: ${v.caption}`} className="cck-tiktok-thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 14 }}>
                <div style={{ marginBottom: 8 }}><PlayIcon color="#fff" /></div>
                <p style={{ color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, lineHeight: 1.4, margin: 0 }}>{v.caption}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div style={{ marginTop: 40, padding: 24, borderRadius: 8, background: theme.tint, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, color: theme.inkSoft, lineHeight: 1.7 }}>
          In the live build, this grid is populated automatically from TikTok's oEmbed API whenever admin staff
          paste a video link into the admin dashboard — no re-uploading of videos required.
        </div>
      </Reveal>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
function AdminLogin({ theme, onLogin }) {
  const [pw, setPw] = useState("");
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Reveal>
        <div style={{ width: 360, background: theme.surfaceRaised, border: `1px solid ${theme.line}`, borderRadius: 8, padding: 32 }}>
          <div className="cck-crest-anim" style={{ marginBottom: 18 }}><Crest size={44} theme={theme} /></div>
          <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 22, color: theme.ink, margin: "0 0 6px" }}>Admin sign in</h2>
          <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, color: theme.inkSoft, margin: "0 0 22px" }}>Staff access only. Demo — any password works.</p>
          <label style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, color: theme.inkSoft, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Email</label>
          <input defaultValue="admin@cck.ac.ug" style={selectStyle(theme)} />
          <label style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 11, color: theme.inkSoft, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", margin: "16px 0 6px" }}>Password</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" style={selectStyle(theme)} />
          <Button theme={theme} variant="solid" onClick={onLogin} style={{ width: "100%", justifyContent: "center", marginTop: 22 }}>Sign in</Button>
        </div>
      </Reveal>
    </div>
  );
}

const ADMIN_SECTIONS = ["Dashboard", "Homepage", "News", "TikTok", "Events", "Gallery", "Staff", "Alumni", "Sports", "FAQs", "Careers", "Settings", "Messages"];

function AdminDashboard({ theme }) {
  const { content, updateField, updateCollectionItem, addCollectionItem, deleteCollectionItem } = useCMS();
  const [section, setSection] = useState("Dashboard");
  const [saved, setSaved] = useState(false);
  const flashSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", minHeight: "70vh" }} className="cck-admin-shell">
      <div style={{ borderRight: `1px solid ${theme.line}`, padding: "28px 16px", background: theme.surfaceRaised }}>
        <div style={{ fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, monospace", fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: theme.inkSoft, padding: "0 10px 14px" }}>Admin panel</div>
        {ADMIN_SECTIONS.map((s) => (
          <button key={s} onClick={() => setSection(s)} style={{
            display: "block", width: "100%", textAlign: "left", background: section === s ? theme.tint : "transparent",
            border: "none", cursor: "pointer", padding: "10px 12px", borderRadius: 5, marginBottom: 2,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.8, fontWeight: section === s ? 700 : 500,
            color: section === s ? theme.primary : theme.ink, transition: "background 0.15s ease",
          }}>{s}</button>
        ))}
      </div>

      <div style={{ padding: "32px 36px", position: "relative" }}>
        {saved && (
          <div style={{ position: "absolute", top: 20, right: 36, background: theme.primary, color: theme.surface, padding: "9px 16px", borderRadius: 5, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, fontWeight: 600, animation: "cck-fade-rise 0.25s cubic-bezier(.22,.61,.36,1) both" }}>✓ Saved</div>
        )}

        {section === "Dashboard" && (
          <div>
            <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: "0 0 24px" }}>Overview</h2>
            <Ledger theme={theme} items={[
              { value: content.news.filter((n) => n.published).length, label: "Published posts" },
              { value: content.tiktokVideos.length, label: "TikTok videos" },
              { value: content.contactMessages.filter((m) => !m.read).length, label: "Unread messages" },
              { value: content.staff.length, label: "Staff profiles" },
            ]} />
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, color: theme.inkSoft, marginTop: 24, lineHeight: 1.7, maxWidth: 560 }}>
              This is a working preview of the admin experience. Edits you make here update the live pages instantly
              — try changing the homepage headline, then switch back to the site to see it change.
            </p>
          </div>
        )}

        {section === "Homepage" && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: "0 0 24px" }}>Edit homepage</h2>
            <label style={labelStyle(theme)}>Hero headline</label>
            <textarea rows={2} value={content.heroHeadline} onChange={(e) => updateField(["heroHeadline"], e.target.value)} style={{ ...selectStyle(theme), resize: "vertical" }} />
            <label style={labelStyle(theme)}>Hero body text</label>
            <textarea rows={4} value={content.heroBody} onChange={(e) => updateField(["heroBody"], e.target.value)} style={{ ...selectStyle(theme), resize: "vertical" }} />
            <label style={labelStyle(theme)}>Head teacher's message (About page)</label>
            <textarea rows={3} value={content.headTeacherMessage} onChange={(e) => updateField(["headTeacherMessage"], e.target.value)} style={{ ...selectStyle(theme), resize: "vertical" }} />
            <Button theme={theme} variant="solid" onClick={flashSaved} style={{ marginTop: 10 }}>Save changes</Button>
          </div>
        )}

        {section === "News" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: 0 }}>News posts</h2>
              <Button theme={theme} variant="outline" onClick={() => addCollectionItem("news", { title: "Untitled post", date: "Draft", published: false, excerpt: "Write a short summary…" })}>+ New post</Button>
            </div>
            {content.news.map((n) => (
              <div key={n.id} style={{ border: `1px solid ${theme.line}`, borderRadius: 6, padding: 18, marginBottom: 12, background: theme.surfaceRaised }}>
                <input value={n.title} onChange={(e) => updateCollectionItem("news", n.id, { title: e.target.value })} style={{ ...selectStyle(theme), fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 16, marginBottom: 8 }} />
                <textarea rows={2} value={n.excerpt} onChange={(e) => updateCollectionItem("news", n.id, { excerpt: e.target.value })} style={{ ...selectStyle(theme), marginBottom: 10, resize: "vertical" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, color: theme.inkSoft }}>
                    <input type="checkbox" checked={n.published} onChange={(e) => updateCollectionItem("news", n.id, { published: e.target.checked })} /> Published
                  </label>
                  <button onClick={() => deleteCollectionItem("news", n.id)} style={{ background: "none", border: "none", color: "#B3441C", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, cursor: "pointer" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {section === "TikTok" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: 0 }}>TikTok videos</h2>
              <Button theme={theme} variant="outline" onClick={() => addCollectionItem("tiktokVideos", { caption: "Paste a TikTok URL and caption…", featured: false, thumbnail: placeholderImg("#0F3D2E","#5E480F","Boarding") })}>+ Add video</Button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle(theme)}>Account handle (shown on Life at CCK)</label>
              <input value={content.siteSettings.tiktokHandle} onChange={(e) => updateField(["siteSettings", "tiktokHandle"], e.target.value)} style={selectStyle(theme)} />
            </div>
            {content.tiktokVideos.map((v) => (
              <div key={v.id} style={{ display: "flex", gap: 14, alignItems: "flex-start", border: `1px solid ${theme.line}`, borderRadius: 6, padding: 14, marginBottom: 10, background: theme.surfaceRaised }}>
                <img src={v.thumbnail} alt={`Thumbnail: ${v.caption}`} style={{ width: 54, height: 72, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <textarea rows={2} value={v.caption} onChange={(e) => updateCollectionItem("tiktokVideos", v.id, { caption: e.target.value })} style={{ ...selectStyle(theme), marginBottom: 8, resize: "vertical" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, color: theme.inkSoft }}>
                      <input type="checkbox" checked={v.featured} onChange={(e) => updateCollectionItem("tiktokVideos", v.id, { featured: e.target.checked })} /> Featured
                    </label>
                    <button onClick={() => deleteCollectionItem("tiktokVideos", v.id)} style={{ background: "none", border: "none", color: "#B3441C", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {section === "Events" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: 0 }}>Events calendar</h2>
              <Button theme={theme} variant="outline" onClick={() => addCollectionItem("events", { title: "New event", date: "2026-08-01", category: "Community", description: "Describe the event…" })}>+ Add event</Button>
            </div>
            {content.events.map((e) => (
              <div key={e.id} style={{ display: "grid", gridTemplateColumns: "120px 1fr 130px auto", gap: 10, alignItems: "center", border: `1px solid ${theme.line}`, borderRadius: 6, padding: 14, marginBottom: 10, background: theme.surfaceRaised }}>
                <input type="date" value={e.date} onChange={(ev) => updateCollectionItem("events", e.id, { date: ev.target.value })} style={selectStyle(theme)} />
                <input value={e.title} onChange={(ev) => updateCollectionItem("events", e.id, { title: ev.target.value })} style={selectStyle(theme)} />
                <select value={e.category} onChange={(ev) => updateCollectionItem("events", e.id, { category: ev.target.value })} style={selectStyle(theme)}>
                  {["Sports", "Academics", "Community", "Clubs"].map((c) => <option key={c}>{c}</option>)}
                </select>
                <button onClick={() => deleteCollectionItem("events", e.id)} style={{ background: "none", border: "none", color: "#B3441C", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, cursor: "pointer" }}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {section === "Gallery" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: 0 }}>Gallery images</h2>
              <Button theme={theme} variant="outline" onClick={() => addCollectionItem("galleryImages", { url: placeholderImg("#C9A54A","#0F3D2E","Graduation"), caption: "New photo", category: "Campus" })}>+ Add image</Button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {content.galleryImages.map((g) => (
                <div key={g.id} style={{ display: "flex", gap: 12, border: `1px solid ${theme.line}`, borderRadius: 6, padding: 12, background: theme.surfaceRaised }}>
                  <img src={g.url} alt={g.caption} style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <input value={g.caption} onChange={(e) => updateCollectionItem("galleryImages", g.id, { caption: e.target.value })} style={{ ...selectStyle(theme), marginBottom: 6, fontSize: 12.5, padding: "7px 9px" }} />
                    <button onClick={() => deleteCollectionItem("galleryImages", g.id)} style={{ background: "none", border: "none", color: "#B3441C", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 11.5, cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === "Staff" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: 0 }}>Staff directory</h2>
              <Button theme={theme} variant="outline" onClick={() => addCollectionItem("staff", { name: "New staff member", role: "Role", dept: "Department" })}>+ Add staff</Button>
            </div>
            {content.staff.map((s) => (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, alignItems: "center", border: `1px solid ${theme.line}`, borderRadius: 6, padding: 14, marginBottom: 10, background: theme.surfaceRaised }}>
                <input value={s.name} onChange={(e) => updateCollectionItem("staff", s.id, { name: e.target.value })} style={selectStyle(theme)} />
                <input value={s.role} onChange={(e) => updateCollectionItem("staff", s.id, { role: e.target.value })} style={selectStyle(theme)} />
                <input value={s.dept} onChange={(e) => updateCollectionItem("staff", s.id, { dept: e.target.value })} style={selectStyle(theme)} />
                <button onClick={() => deleteCollectionItem("staff", s.id)} style={{ background: "none", border: "none", color: "#B3441C", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, cursor: "pointer" }}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {section === "Alumni" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: 0 }}>Alumni stories</h2>
              <Button theme={theme} variant="outline" onClick={() => addCollectionItem("alumni", { name: "New alumnus/alumna", cohort: "Class of 2024", note: "Their story…" })}>+ Add alumnus</Button>
            </div>
            {content.alumni.map((a) => (
              <div key={a.id} style={{ border: `1px solid ${theme.line}`, borderRadius: 6, padding: 16, marginBottom: 12, background: theme.surfaceRaised }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                  <input value={a.name} onChange={(e) => updateCollectionItem("alumni", a.id, { name: e.target.value })} placeholder="Full name" style={selectStyle(theme)} />
                  <input value={a.cohort} onChange={(e) => updateCollectionItem("alumni", a.id, { cohort: e.target.value })} placeholder="Cohort" style={selectStyle(theme)} />
                </div>
                <textarea rows={2} value={a.note} onChange={(e) => updateCollectionItem("alumni", a.id, { note: e.target.value })} placeholder="Their story" style={{ ...selectStyle(theme), marginBottom: 8, resize: "vertical" }} />
                <button onClick={() => deleteCollectionItem("alumni", a.id)} style={{ background: "none", border: "none", color: "#B3441C", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, cursor: "pointer" }}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {section === "Sports" && (
          <div>
            <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: "0 0 8px" }}>House points & fixtures</h2>
            <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13, color: theme.inkSoft, marginBottom: 24 }}>Update the House Cup leaderboard and recent match results shown on the Sports page.</p>

            <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 16, color: theme.primary, marginBottom: 12 }}>House points</h3>
            {content.houses.map((h) => (
              <div key={h.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: 10, alignItems: "center", border: `1px solid ${theme.line}`, borderRadius: 6, padding: 12, marginBottom: 8, background: theme.surfaceRaised }}>
                <input value={h.name} onChange={(e) => updateCollectionItem("houses", h.id, { name: e.target.value })} style={selectStyle(theme)} />
                <input value={h.motto} onChange={(e) => updateCollectionItem("houses", h.id, { motto: e.target.value })} placeholder="Motto" style={selectStyle(theme)} />
                <input type="number" value={h.points} onChange={(e) => updateCollectionItem("houses", h.id, { points: parseInt(e.target.value) || 0 })} style={selectStyle(theme)} />
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "24px 0 12px" }}>
              <h3 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 16, color: theme.primary, margin: 0 }}>Recent fixtures</h3>
              <Button theme={theme} variant="outline" onClick={() => addCollectionItem("fixtures", { sport: "Football", opponent: "New opponent", result: "TBD", date: "Jul 2026" })}>+ Add fixture</Button>
            </div>
            {content.fixtures.map((f) => (
              <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr 1fr auto", gap: 10, alignItems: "center", border: `1px solid ${theme.line}`, borderRadius: 6, padding: 12, marginBottom: 8, background: theme.surfaceRaised }}>
                <input value={f.sport} onChange={(e) => updateCollectionItem("fixtures", f.id, { sport: e.target.value })} placeholder="Sport" style={selectStyle(theme)} />
                <input value={f.opponent} onChange={(e) => updateCollectionItem("fixtures", f.id, { opponent: e.target.value })} placeholder="Opponent" style={selectStyle(theme)} />
                <input value={f.result} onChange={(e) => updateCollectionItem("fixtures", f.id, { result: e.target.value })} placeholder="Result" style={selectStyle(theme)} />
                <button onClick={() => deleteCollectionItem("fixtures", f.id)} style={{ background: "none", border: "none", color: "#B3441C", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, cursor: "pointer" }}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {section === "FAQs" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: 0 }}>Frequently asked questions</h2>
              <Button theme={theme} variant="outline" onClick={() => addCollectionItem("faqs", { category: "Admissions", q: "New question?", a: "Answer…" })}>+ Add question</Button>
            </div>
            {content.faqs.map((f) => (
              <div key={f.id} style={{ border: `1px solid ${theme.line}`, borderRadius: 6, padding: 16, marginBottom: 12, background: theme.surfaceRaised }}>
                <select value={f.category} onChange={(e) => updateCollectionItem("faqs", f.id, { category: e.target.value })} style={{ ...selectStyle(theme), marginBottom: 8, width: 180 }}>
                  {["Admissions", "Academics", "Boarding", "E-Learning"].map((c) => <option key={c}>{c}</option>)}
                </select>
                <input value={f.q} onChange={(e) => updateCollectionItem("faqs", f.id, { q: e.target.value })} placeholder="Question" style={{ ...selectStyle(theme), marginBottom: 8 }} />
                <textarea rows={2} value={f.a} onChange={(e) => updateCollectionItem("faqs", f.id, { a: e.target.value })} placeholder="Answer" style={{ ...selectStyle(theme), marginBottom: 8, resize: "vertical" }} />
                <button onClick={() => deleteCollectionItem("faqs", f.id)} style={{ background: "none", border: "none", color: "#B3441C", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, cursor: "pointer" }}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {section === "Careers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: 0 }}>Open positions</h2>
              <Button theme={theme} variant="outline" onClick={() => addCollectionItem("careers", { title: "New role", type: "Full-time", posted: "Posted today" })}>+ Add role</Button>
            </div>
            {content.careers.map((c) => (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr auto", gap: 10, alignItems: "center", border: `1px solid ${theme.line}`, borderRadius: 6, padding: 14, marginBottom: 10, background: theme.surfaceRaised }}>
                <input value={c.title} onChange={(e) => updateCollectionItem("careers", c.id, { title: e.target.value })} style={selectStyle(theme)} />
                <select value={c.type} onChange={(e) => updateCollectionItem("careers", c.id, { type: e.target.value })} style={selectStyle(theme)}>
                  {["Full-time", "Part-time", "Contract"].map((t) => <option key={t}>{t}</option>)}
                </select>
                <input value={c.posted} onChange={(e) => updateCollectionItem("careers", c.id, { posted: e.target.value })} style={selectStyle(theme)} />
                <button onClick={() => deleteCollectionItem("careers", c.id)} style={{ background: "none", border: "none", color: "#B3441C", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12.5, cursor: "pointer" }}>Delete</button>
              </div>
            ))}
          </div>
        )}

        {section === "Settings" && (
          <div style={{ maxWidth: 480 }}>
            <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: "0 0 24px" }}>Site settings</h2>
            <label style={labelStyle(theme)}>Phone number</label>
            <input value={content.siteSettings.phone} onChange={(e) => updateField(["siteSettings", "phone"], e.target.value)} style={selectStyle(theme)} />
            <label style={labelStyle(theme)}>Email address</label>
            <input value={content.siteSettings.email} onChange={(e) => updateField(["siteSettings", "email"], e.target.value)} style={selectStyle(theme)} />
            <label style={labelStyle(theme)}>Physical address</label>
            <input value={content.siteSettings.address} onChange={(e) => updateField(["siteSettings", "address"], e.target.value)} style={selectStyle(theme)} />
            <label style={labelStyle(theme)}>TikTok handle</label>
            <input value={content.siteSettings.tiktokHandle} onChange={(e) => updateField(["siteSettings", "tiktokHandle"], e.target.value)} style={selectStyle(theme)} />
            <label style={labelStyle(theme)}>TikTok follower count (display text)</label>
            <input value={content.siteSettings.tiktokFollowers} onChange={(e) => updateField(["siteSettings", "tiktokFollowers"], e.target.value)} style={selectStyle(theme)} />
            <Button theme={theme} variant="solid" onClick={flashSaved} style={{ marginTop: 10 }}>Save changes</Button>
          </div>
        )}

        {section === "Messages" && (
          <div>
            <h2 style={{ fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontSize: 24, color: theme.ink, margin: "0 0 20px" }}>Contact messages</h2>
            {content.contactMessages.map((m) => (
              <div key={m.id} style={{ border: `1px solid ${theme.line}`, borderRadius: 6, padding: 16, marginBottom: 10, background: m.read ? theme.surfaceRaised : theme.tint }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontWeight: 700, fontSize: 13.5, color: theme.ink }}>{m.name} <span style={{ fontWeight: 400, color: theme.inkSoft }}>· {m.email}</span></div>
                  {!m.read && <button onClick={() => updateCollectionItem("contactMessages", m.id, { read: true })} style={{ background: "none", border: "none", color: theme.primary, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Mark as read</button>}
                </div>
                <p style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", fontSize: 13.5, color: theme.inkSoft, margin: 0 }}>{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminGate({ theme }) {
  const [loggedIn, setLoggedIn] = useState(false);
  return loggedIn ? <AdminDashboard theme={theme} /> : <AdminLogin theme={theme} onLogin={() => setLoggedIn(true)} />;
}

/* ============================================================
   ROOT APP
   ============================================================ */
function SiteChrome({ themeKey, setThemeKey }) {
  const [page, setPage] = useState("Home");
  const theme = THEMES[themeKey];
  const env = THEME_ENV[themeKey];
  const themedShadow = { ...theme, __shadowTint: env.shadowTint };

  const renderPage = () => {
    switch (page) {
      case "Home": return <Home theme={theme} setPage={setPage} />;
      case "About": return <About theme={theme} />;
      case "Academics": return <Academics theme={theme} setPage={setPage} />;
      case "Admissions": return <Admissions theme={theme} />;
      case "E-Learning": return <ELearning theme={theme} />;
      case "Gallery": return <Gallery theme={theme} />;
      case "Events": return <Events theme={theme} />;
      case "Sports": return <Sports theme={theme} />;
      case "Alumni": return <Alumni theme={theme} />;
      case "Careers": return <Careers theme={theme} />;
      case "FAQs": return <FAQs theme={theme} />;
      case "Life at CCK": return <LifeAtCCK theme={theme} />;
      default: return <Home theme={theme} setPage={setPage} />;
    }
  };

  const envBackgroundStyle = {
    backgroundColor: theme.surface,
    backgroundImage: env.bgImage,
    transition: "background-color 0.6s cubic-bezier(.22,.61,.36,1), background-image 0.6s ease",
  };

  if (page === "Admin") {
    return (
      <div data-cck-root style={{ ...envBackgroundStyle, minHeight: "100vh" }}>
        <FontLoader />
        <MotionStyles theme={themedShadow} />
        <ScrollProgress theme={theme} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: `1px solid ${theme.line}`, background: theme.surfaceRaised }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "Georgia, 'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L', P052, serif", fontWeight: 600, fontSize: 16, color: theme.ink }}>
            <Crest size={28} theme={theme} /> CCK Admin
          </div>
          <Button theme={theme} variant="ghost" onClick={() => setPage("Home")}>← Back to site</Button>
        </div>
        <AdminGate theme={theme} />
      </div>
    );
  }

  return (
    <div data-cck-root style={{ ...envBackgroundStyle, minHeight: "100vh" }}>
      <FontLoader />
      <MotionStyles theme={themedShadow} />
      <ScrollProgress theme={theme} />
      <Nav theme={theme} themeKey={themeKey} setThemeKey={setThemeKey} page={page} setPage={setPage} />
      <PageTransition pageKey={page}>{renderPage()}</PageTransition>
      <Footer theme={theme} setPage={setPage} />
    </div>
  );
}

export default function CCKSite() {
  return (
    <CMSProvider>
      <SiteChromeWithToast />
    </CMSProvider>
  );
}

function SiteChromeWithToast() {
  // ToastProvider needs the active theme for styling, but theme lives
  // inside SiteChrome's state — so we track a mirror of it here just
  // for toast colouring, kept in sync via a small wrapper.
  const [themeKey, setThemeKey] = useState("green");
  return (
    <ToastProvider theme={THEMES[themeKey]}>
      <SiteChrome themeKey={themeKey} setThemeKey={setThemeKey} />
    </ToastProvider>
  );
}
