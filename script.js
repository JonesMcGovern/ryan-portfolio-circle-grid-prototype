const field = document.querySelector(".line-field");
const canvas = document.querySelector(".smudge-canvas");
const context = canvas?.getContext("2d");
const shapeField = document.querySelector(".shape-field[data-shape-mode='interactive'], .shape-field:not([data-shape-mode='preview'])");
const shapeSvg = shapeField?.querySelector(".shape-svg");
const paletteSwatches = document.querySelectorAll(".palette-swatch");
const portfolioPucks = document.querySelectorAll(".portfolio-puck");
const navMenuToggle = document.querySelector(".nav-menu");
const siteNav = document.querySelector(".site-nav");
const marqueeHeadings = document.querySelectorAll(
  ".selected-work-heading h2, .secondary-projects-heading h2, .playground-heading h2"
);
const siteStartTime = performance.now();
let dataRail = null;
let marqueeResizeTimer = null;
let scrollTicking = false;
let shapeAnimationStarted = false;
let lineAnimationStarted = false;
let projectAmbientVideoObserver = null;
let projectAmbientScrollRaf = null;
const lineState = {
  width: 0,
  height: 0,
  dpr: 1,
  lineStep: 6,
  stroke: 1,
  canvasLeft: 0,
  color: "#f1975b",
  lines: [],
  pointer: {
    active: false,
    x: 0,
    y: 0,
    previousX: 0,
    previousY: 0,
    velocityX: 0,
    velocityY: 0,
  },
};
const puckPhysicsState = {
  pucks: [],
  initialized: false,
  animationStarted: false,
  introSlidePrepared: false,
  introSlideStarted: false,
};

const projectData = {
  "skimmu-money": {
    title: "SkimmU Money",
    type: "Launch Film",
    summary: "Sizzle reel promoting a four-day investing series helping women build financial confidence and knowledge.",
    role: "Motion Designer",
    format: "Event Sizzle Reel",
    year: "2022",
    mediaLabel: "SKIMMU MONEY",
    posterSrc: "./assets/images/SkimmU_Money_Video_Poster.png",
    videoSrc: "./assets/videos/SkimmU_Money_Sizzle.mp4",
    overviewHeading: "Overview",
    overviewCopy: "In 2022, The Skimm hosted a four-part financial education series designed to help women build confidence in investing and long-term financial planning. The event brought together expert-led sessions for both new and experienced investors, covering topics such as navigating market uncertainty, building an investment portfolio, planning for retirement, and understanding cryptocurrency.",
    moduleHeading: "Creative Direction",
    moduleCopy: "The visual identity for the event had already been established, featuring a graph-paper-inspired aesthetic, hand-drawn illustrations, and collage-style photography. My role was to translate that static design system into motion. I used animated line work as a recurring visual device, guiding viewers through the piece while reinforcing the hand-crafted character of the brand. The result was a sizzle reel that preserved the personality of the original campaign while bringing its educational themes to life through movement, pacing, and visual storytelling.",
    moduleVideoSrcs: [
      "./assets/videos/skimmu-money/circles/skimmu-thumbnail-4-color.mp4",
      "./assets/videos/skimmu-money/circles/skimmu-money-thumbnail-3-color.mp4",
      "./assets/videos/skimmu-money/circles/thumbnail-skimmu-color.mp4",
    ],
    promoteModuleVideosToOverview: true,
    moveMetaToModule: true,
  },
  "flashpoint-mdlinx": {
    title: "Flashpoint by MDLinx",
    heroTitleHtml: "Flashpoint <span class=\"title-keep-together\">by MDLinx</span>",
    type: "Campaign System",
    summary: "Sizzle reel introducing Flashpoint, a new MDLinx product offering.",
    role: "Visual Direction, Motion Design",
    format: "Sizzle Reel",
    year: "2025",
    mediaLabel: "FLASHPOINT",
    posterSrc: "./assets/images/flashpoint-video-poster.png",
    videoSrc: "./assets/videos/flashpoint-sizzle-shortened.mp4",
    overviewHeading: "Overview",
    overviewCopy: "Flashpoint combined several established MDLinx products into a new offering for pharmaceutical partners. Because the platform was built from existing tools rather than a standalone product, the challenge was to clearly communicate how those components worked together while demonstrating the value of the new solution. The resulting sizzle reel was used by the sales team to introduce Flashpoint to prospective clients.",
    moduleHeading: "Creative Direction",
    moduleCopy: "I designed the piece around a clean, minimalist aesthetic that emphasized clarity while adding subtle texture to give the visuals personality. Existing product features became the foundation of the story, with motion graphics illustrating how each component fit into the larger platform. Contour-line transitions tied the experience together, creating a cohesive visual system that felt modern and technically sophisticated. The video ultimately supported the launch of Flashpoint, contributing to three pharmaceutical partnerships during its first six months.",
    moduleVideoSrcs: [
      "./assets/videos/flashpoint/circles/mdl-fp-thumbnail-1.mp4",
      "./assets/videos/flashpoint/circles/mdl-fp-thumbnail-3.mp4",
      "./assets/videos/flashpoint/circles/mdl-thumbnail-2.mp4",
    ],
    promoteModuleVideosToOverview: true,
    moveMetaToModule: true,
  },
  "skimm-money-newsletter": {
    title: "Skimm Money Awareness Campaign",
    type: "Campaign System",
    summary: "An awareness campaign created to support the launch of a new personal finance newsletter.",
    role: "Visual Direction, Campaign Design",
    format: "Emails, Paid Social Posts, Light Boxes",
    year: "Spring 2023",
    mediaLabel: "PORTRAIT VIDEO",
    videoSrc: "./assets/videos/Meta_1_9-16_OP2_1.mp4",
    secondaryVideoSrc: "./assets/videos/Meta_2_9-16_2_1.mp4",
    productHeading: "Overview",
    overviewHeading: "Overview",
    overviewCopy: "The newsletter was meant to launch in the late spring of 2023, with the awareness campaign alongside it. Inspired by medieval scribes and illuminated manuscripts, the visual system combined expressive blackletter typography, hand-drawn illustrations, and playful graphic details to create a distinctive identity. By balancing historical references with a modern editorial approach, the campaign helped position financial education as both approachable and engaging.",
    moduleHeading: "Creative Direction",
    moduleCopy: "The visual approach drew inspiration from medieval scribes and illuminated manuscripts, pairing dramatic blackletter typography with playful hand-drawn illustrations. A free typeface, Germania, was used for emphasis while theSkimm's brand typeface maintained clarity and readability throughout. The contrast between ornate historical influences and loose, contemporary illustration created a visual language that felt both knowledgeable and approachable-reinforcing the idea that financial literacy doesn't have to feel intimidating.",
    moduleVideoSrcs: [
      "./assets/videos/skimm-money-awareness/circles/dollar-sign-pattern.mp4",
      "./assets/videos/skimm-money-awareness/circles/shoe-money.mp4",
      "./assets/videos/skimm-money-awareness/circles/wand.mp4",
    ],
  },
  "interface-studies": {
    title: "\"Is Gay Marriage Next?\" Intro",
    type: "Editorial Motion",
    summary: "Editorial intro animation for a video segment examining the political future of marriage equality.",
    role: "Motion Designer",
    format: "Documentary Intro Sequence",
    year: "2023",
    mediaLabel: "EDITORIAL INTRO",
    posterSrc: "./assets/images/is-gay-marriage-next-video-poster.png",
    videoSrc: "./assets/videos/editorial/is-gay-marriage-next-intro.mp4",
    overviewHeading: "Overview",
    overviewCopy: "Created as the opening title sequence for the short documentary Is Gay Marriage Next?, this piece introduces a story centered on one woman's journey toward acceptance while exploring the evolving conversation around marriage equality and other hard-fought social milestones. The goal was to establish an emotional tone that felt personal, reflective, and rooted in lived experience before the documentary began.",
    moduleHeading: "Creative Direction",
    moduleCopy: "Visually, the animation embraces a handcrafted collage aesthetic, layering photographs, paper textures, and typography into a scrapbook-inspired composition. The motion intentionally borrows from stop-motion techniques, giving each element a subtle tactile quality that reinforces the feeling of physically assembled cutouts. Rather than relying on perfectly smooth animation, the piece celebrates texture and imperfection, creating an opening that feels intimate, human, and true to the documentary's subject matter.",
    overviewCircleVideoSrcs: [
      "./assets/videos/editorial/circles/igmn-thumbnail-1.mp4",
      "./assets/videos/editorial/circles/igmn-thumbnail-2.mp4",
      "./assets/videos/editorial/circles/igmn-thumbnail-3.mp4",
    ],
    moveMetaToModule: true,
  },
  "launch-cutdowns": {
    title: "Kaplan SAT Prep Ad",
    type: "Video Ad",
    summary: "A concise Kaplan ad promoting SAT Prep Plus 2020.",
    role: "Motion Designer, Graphic Designer",
    format: "YouTube Ad",
    year: "2020",
    mediaLabel: "KAPLAN SAT",
    posterSrc: "./assets/images/kaplan-sat-prep-video-poster.png",
    videoSrc: "./assets/videos/kaplan/kaplan-sat-amazon-ad.mp4",
    overviewHeading: "Overview",
    overviewCopy: "Kaplan's SAT Prep Plus combined comprehensive study materials with online practice tests to create a more robust preparation experience for students. The video was designed to communicate the breadth of the offering while presenting standardized test preparation as an active, confidence-building journey rather than a passive academic exercise.",
    moduleHeading: "Creative Direction",
    moduleCopy: "Rather than adopting the conventional academic tone often associated with educational products, I drew inspiration from the energy of athletic advertising. Fast-paced editing, rhythmic motion, and percussive music created a sense of momentum, positioning test preparation as a challenge to train for rather than simply study. The result was a dynamic piece that elevated familiar product imagery into a more engaging, motivational brand experience.",
    moduleVideoSrcs: [
      "./assets/videos/kaplan/sat-circles/sat-prep-thumbnail.mp4",
      "./assets/videos/kaplan/sat-circles/sat-ad-thumbnail-2.mp4",
      "./assets/videos/kaplan/sat-circles/sat-ad-thumbnail-3.mp4",
    ],
    promoteModuleVideosToOverview: true,
    moveMetaToModule: true,
  },
  "social-system": {
    title: "Kaplan Live Online Ad",
    type: "Video Ad",
    summary: "A YouTube ad promoting Kaplan's virtual classroom experience.",
    role: "Motion Designer, Graphic Designer",
    format: "YouTube Ad",
    year: "2020",
    mediaLabel: "LIVE ONLINE",
    posterSrc: "./assets/images/kaplan-live-online-video-poster.png",
    videoSrc: "./assets/videos/kaplan/kaplan-live-online-ad.mp4",
    overviewHeading: "Overview",
    overviewCopy: "Kaplan Live Online promoted the company's virtual classroom experience at a time when online learning had become more important than ever. The objective was to quickly communicate the platform's key benefits-from live instruction to interactive coursework-in a concise, engaging format that encouraged prospective students to learn more.",
    moduleHeading: "Creative Direction",
    moduleCopy: "I designed the piece to feel fluid, energetic, and approachable, using seamless transitions and rhythmic motion to connect the product's core features into a single visual narrative. Rather than presenting information as a checklist, the animation maintained a continuous sense of momentum, making the experience feel dynamic while keeping the messaging clear and accessible.",
    overviewCircleVideoSrcs: [
      "./assets/videos/kaplan/circles/lol-thumbnail-1.mp4",
      "./assets/videos/kaplan/circles/lol-thumbnail-2.mp4",
      "./assets/videos/kaplan/circles/lol-thumbnail-3.mp4",
    ],
    moveMetaToModule: true,
  },
  "kaplan-virtual-spelling-bee": {
    title: "Kaplan Virtual Spelling Bee",
    type: "Event Graphics",
    summary: "A virtual spelling bee identity and motion package created with Kaplan and Hexco.",
    role: "Motion Designer, Graphic Designer",
    format: "Event Video",
    year: "2020",
    mediaLabel: "SPELLING BEE",
    posterSrc: "./assets/images/kaplan-spelling-bee-video-poster.png",
    videoSrc: "./assets/videos/kaplan/kaplan-spellingbee-intro.mp4",
    overviewHeading: "Overview",
    overviewCopy: "When live competitions were put on hold, Kaplan partnered with Hexco to bring the excitement of the spelling bee online. The promotional video introduced the virtual event while capturing the anticipation and energy traditionally associated with in-person competition, encouraging students to participate from anywhere.",
    moduleHeading: "Creative Direction",
    moduleCopy: "With considerable creative freedom, I centered the animation around typography itself. Featured words-drawn from previous Scripps National Spelling Bee champions-begin as scattered letterforms before jumping, stretching, and snapping into their correct spelling. Paired with energetic pacing and music, the motion transformed the act of spelling into the visual centerpiece of the piece, creating a playful and memorable introduction to the event.",
    moduleVideoSrcs: [
      "./assets/videos/kaplan/circles/spellingbee-thumb-1.mp4",
      "./assets/videos/kaplan/circles/spellingbee-thumb-2.mp4",
      "./assets/videos/kaplan/circles/spellingbee-thumb-3.mp4",
    ],
    promoteModuleVideosToOverview: true,
    moveMetaToModule: true,
  },
  "brand-transitions": {
    title: "Skimm Lab Illustrations",
    type: "Illustration Animation",
    summary: "Looping animations created from commissioned Skimm Lab illustrations.",
    role: "Motion Designer",
    format: "Animated Illustrations",
    year: "2022",
    mediaLabel: "SKIMM LAB",
    overviewHeading: "Overview",
    overviewCopy: "These looping animations were created for Skimm Lab, theSkimm's in-house creative agency. Built from a series of commissioned illustrations, the project introduced the new brand through a collection of short, seamless animations designed for digital and social channels. My role was to bring the existing artwork to life in a way that complemented its distinctive visual style while establishing an engaging motion language for the brand.",
    moduleHeading: "Creative Direction",
    moduleCopy: "The illustrations were composed of loose, continuous contour lines, so I wanted the animation to feel like a natural extension of that approach. Each piece was treated as though a single thread was drawing itself across the screen, weaving together to gradually reveal the final illustration. This technique reinforced the hand-crafted quality of the artwork while adding a playful sense of movement and tactility, allowing the motion to feel inseparable from the illustrations themselves rather than simply layered on top.",
    moveMetaToModule: true,
    illustrations: [
      ["Target", "./assets/images/skimm-lab-illustrations/target.gif"],
      ["Gallery", "./assets/images/skimm-lab-illustrations/gallery.gif"],
      ["Gears", "./assets/images/skimm-lab-illustrations/gears.gif"],
      ["Handshake", "./assets/images/skimm-lab-illustrations/handshake.gif"],
      ["Megaphone", "./assets/images/skimm-lab-illustrations/megaphone.gif"],
      ["Phone", "./assets/images/skimm-lab-illustrations/phone.gif"],
      ["Shopping Bags", "./assets/images/skimm-lab-illustrations/shopping-bags.gif"],
      ["Tape Measure", "./assets/images/skimm-lab-illustrations/tape-measure.gif"],
      ["Camera", "./assets/images/skimm-lab-illustrations/camera.gif"],
      ["Vine", "./assets/images/skimm-lab-illustrations/vine.gif"],
    ],
  },
  "event-graphics": {
    title: "Skimm Spot Illustration Animations",
    type: "Illustration Animation",
    summary: "Lightweight looping animations adapted from theSkimm spot illustration library.",
    role: "Motion Designer",
    format: "Animated Spot Illustrations",
    year: "2022",
    mediaLabel: "SPOT ILLUSTRATIONS",
    overviewHeading: "Overview",
    overviewCopy: "theSkimm's visual language included a growing library of custom illustrations used to support articles, events, and editorial initiatives across the platform. Originally designed as static assets, these illustrations presented an opportunity to introduce subtle motion that could further reinforce the brand's playful personality. My role was to adapt the existing artwork into a series of lightweight looping animations while remaining faithful to the original illustrations.",
    moduleHeading: "Creative Direction",
    moduleCopy: "Working directly from the original illustration files, I repurposed many of the existing shapes and graphic elements to create simple, expressive animations with minimal modification to the artwork itself. The goal wasn't to reinvent the illustrations, but to enhance them through thoughtful motion-small loops and subtle movement that added charm, drew attention, and naturally complemented the playful character of the existing visual style.",
    moveMetaToModule: true,
    illustrations: [
      ["Spring Cleaning", "./assets/images/skimm-spot-illustrations/spray-bottle.gif"],
      ["Wellness", "./assets/images/skimm-spot-illustrations/elephant.gif"],
      ["Sexual Health", "./assets/images/skimm-spot-illustrations/rabbit.gif"],
      ["Mother's Day", "./assets/images/skimm-spot-illustrations/teacups.gif"],
      ["Motherhood", "./assets/images/skimm-spot-illustrations/well-armadillos.gif"],
      ["Spa", "./assets/images/skimm-spot-illustrations/pug.gif"],
      ["Summer Newsletter", "./assets/images/skimm-spot-illustrations/daily-skimm-newsletter.gif"],
    ],
  },
  "editorial-motion": {
    title: "Skimm NASDAQ Billboard",
    type: "Billboard Motion",
    summary: "Portrait motion designed for the Nasdaq billboard in Times Square.",
    role: "Motion Designer",
    format: "Times Square NASDAQ Billboard",
    year: "2022",
    mediaLabel: "NASDAQ BILLBOARD",
    videoSrc: "./assets/videos/skimm-nasdaq/skimm-pfl-nasdaq-billboard.mp4",
    overviewHeading: "Overview",
    productHeading: "Overview",
    overviewCopy: "This piece was created for the Nasdaq billboard in Times Square-a uniquely challenging canvas due to its curved surface and the windows that cut through the display. The campaign was originally conceived for Mother's Day, but as the anticipated Supreme Court decision on Roe v. Wade approached, the project shifted direction. We postponed the launch and reworked the creative with new messaging and updated motion elements to better reflect the moment.",
    extraHeading: "Creative Direction",
    extraCopy: "Designing for such an unconventional format was one of the most rewarding aspects of the project. Every composition had to account for the billboard's curvature and integrate seamlessly around the windows without disrupting the visual flow. Early in the concept phase, I explored a more ambitious approach that leaned into the unique architecture of the display. Ultimately, I chose a more restrained direction, prioritizing clarity and legibility at the scale and viewing distance of Times Square while still taking advantage of the billboard's distinctive form.",
    alternateHeading: "Unused Original Version",
    alternateCopy: "My original concept took fuller advantage of the billboard's unusual architecture, treating the physical windows as an active part of the animation rather than an obstacle to work around. I leaned into a more technical, mechanical aesthetic, with typography weaving between the window openings before disappearing behind the structure and reemerging on the opposite side. The illuminated window surrounds became visual triggers that expanded into the next sequence, creating the illusion that the physical and digital elements of the billboard were working together as a single system.\n\nAlthough it was ultimately replaced, this remained my favorite of the two concepts. When the campaign shifted direction, I chose not to adapt this approach because it depended on extremely precise alignment between the video content and the billboard's fixed architectural elements. Any variation in playback or calibration could have undermined the illusion. With a shortened production timeline and new creative direction, a more dependable execution was the right decision, even if it meant setting aside the more ambitious concept.",
    alternateVideoSrc: "./assets/videos/skimm-nasdaq/skimm-pfl-nasdaq-alternate.mp4",
  },
};

const projectOrder = [
  "skimmu-money",
  "flashpoint-mdlinx",
  "skimm-money-newsletter",
  "interface-studies",
  "launch-cutdowns",
  "social-system",
  "brand-transitions",
  "event-graphics",
  "kaplan-virtual-spelling-bee",
  "editorial-motion",
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getProjectKey() {
  return new URLSearchParams(window.location.search).get("project") || "skimmu-money";
}

function createMarqueeSet(label, repeatCount) {
  const set = document.createElement("span");
  set.className = "marquee-set";
  set.setAttribute("aria-hidden", "true");

  for (let index = 0; index < repeatCount; index += 1) {
    const labelSpan = document.createElement("span");
    const dotSpan = document.createElement("span");
    labelSpan.textContent = label;
    dotSpan.textContent = "•";
    set.append(labelSpan, dotSpan);
  }

  return set;
}

function fillMarquee(heading) {
  const label = heading.dataset.marqueeLabel || heading.textContent.trim();
  const container = heading.parentElement;

  if (!label || !container) return;

  const containerWidth = Math.max(container.getBoundingClientRect().width, window.innerWidth);
  let repeatCount = 2;
  heading.replaceChildren(createMarqueeSet(label, repeatCount));
  let set = heading.querySelector(".marquee-set");
  let setWidth = set?.getBoundingClientRect().width || 0;

  while (setWidth < containerWidth + 160 && repeatCount < 48) {
    repeatCount += 1;
    heading.replaceChildren(createMarqueeSet(label, repeatCount));
    set = heading.querySelector(".marquee-set");
    setWidth = set?.getBoundingClientRect().width || 0;
  }

  heading.append(set.cloneNode(true));
  heading.style.setProperty("--marquee-distance", `${Math.ceil(setWidth)}px`);
  heading.style.setProperty("--marquee-duration", `${Math.max(28, Math.min(80, setWidth / 36))}s`);
}

function fillMarquees() {
  marqueeHeadings.forEach(fillMarquee);
}

function scheduleMarqueeFill() {
  window.clearTimeout(marqueeResizeTimer);
  marqueeResizeTimer = window.setTimeout(() => window.requestAnimationFrame(fillMarquees), 80);
}

function resetInitialScrollPosition() {
  if (!window.location.hash && window.scrollY < 4) {
    window.scrollTo(0, 0);
  }
}

function syncVisualViewportWidth() {
  const width = window.visualViewport?.width || document.documentElement.clientWidth || window.innerWidth;
  document.documentElement.style.setProperty("--visual-width", `${Math.round(width)}px`);
}

function updateHeaderScrollState() {
  document.body.classList.toggle("is-scrolled", window.scrollY > 18);
  const hero = document.querySelector(".project-hero");
  if (hero) {
    document.body.classList.toggle("is-project-title-pinned", hero.getBoundingClientRect().bottom < 120);
  }
  const masthead = document.querySelector(".masthead");
  if (masthead) {
    const mastheadRect = masthead.getBoundingClientRect();
    const layoutWidth = document.documentElement.clientWidth || window.innerWidth;
    document.documentElement.style.setProperty("--masthead-bottom", `${Math.round(mastheadRect.bottom)}px`);
    document.documentElement.style.setProperty("--masthead-left", `${Math.round(mastheadRect.left)}px`);
    document.documentElement.style.setProperty("--masthead-right", `${Math.round(layoutWidth - mastheadRect.right)}px`);
  }
}

function syncSiteMenuPosition() {
  const masthead = document.querySelector(".masthead");
  if (!masthead) return;
  const mastheadRect = masthead.getBoundingClientRect();
  const layoutWidth = document.documentElement.clientWidth || window.innerWidth;
  document.documentElement.style.setProperty("--masthead-bottom", `${Math.round(mastheadRect.bottom)}px`);
  document.documentElement.style.setProperty("--masthead-left", `${Math.round(mastheadRect.left)}px`);
  document.documentElement.style.setProperty("--masthead-right", `${Math.round(layoutWidth - mastheadRect.right)}px`);
}

function requestHeaderScrollUpdate() {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(() => {
    updateHeaderScrollState();
    if (document.body.classList.contains("site-menu-open")) syncSiteMenuPosition();
    updateDataRail();
    scrollTicking = false;
  });
}

function initializeDataRail() {
  if (dataRail) return;
  dataRail = document.createElement("aside");
  dataRail.className = "data-rail";
  dataRail.setAttribute("aria-hidden", "true");
  dataRail.innerHTML = "<span data-rail-depth>000%</span><span data-rail-time>00:00</span><span>XY 0019, 0839</span><span data-rail-date></span>";
  document.body.append(dataRail);
  updateDataRail();
}

function updateDataRail() {
  if (!dataRail) return;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const percent = Math.round((window.scrollY / maxScroll) * 100);
  const elapsed = Math.floor((performance.now() - siteStartTime) / 1000);
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  const date = new Date();
  dataRail.querySelector("[data-rail-depth]").textContent = `${String(percent).padStart(3, "0")}%`;
  dataRail.querySelector("[data-rail-time]").textContent = `${minutes}:${seconds}`;
  dataRail.querySelector("[data-rail-date]").textContent = `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}.${date.getFullYear()}`;
}

function applyPalette(swatch) {
  document.documentElement.style.setProperty("--bg", swatch.dataset.bg);
  document.documentElement.style.setProperty("--ink", swatch.dataset.ink);
  document.documentElement.style.setProperty("--line", swatch.dataset.line);
  document.documentElement.style.setProperty("--headline", swatch.dataset.headline || swatch.dataset.line);
  paletteSwatches.forEach((item) => item.setAttribute("aria-pressed", String(item === swatch)));
  drawLineField();
}

function initializePalette() {
  paletteSwatches.forEach((swatch) => {
    if (swatch.getAttribute("aria-pressed") === "true") applyPalette(swatch);
    swatch.addEventListener("click", () => applyPalette(swatch));
  });
}

function getCssColor(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function getCssNumber(name, fallback) {
  const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

function drawLineField({ preserveDisplacement = false } = {}) {
  if (!canvas || !context || !field) return;
  const rect = field.getBoundingClientRect();
  const previousLines = preserveDisplacement ? lineState.lines : null;
  const previousLineStep = lineState.lineStep || 1;
  const previousSegmentStep = previousLines?.[0]?.[1]
    ? Math.max(previousLines[0][1].y - previousLines[0][0].y, 1)
    : 1;
  const previousFirstX = previousLines?.[0]?.[0]?.baseX ?? previousLines?.[0]?.[0]?.x ?? 0;
  lineState.dpr = Math.min(window.devicePixelRatio || 1, 2);
  lineState.height = Math.max(rect.height, 1);
  lineState.width = Math.max(window.innerWidth, rect.width, 1);
  lineState.lineStep = Math.max(4, getCssNumber("--line-step", 6));
  lineState.stroke = Math.max(1, getCssNumber("--stroke", 1));
  lineState.color = getCssColor("--line", "#f1975b");
  lineState.canvasLeft = rect.left * -1;

  canvas.width = Math.round(lineState.width * lineState.dpr);
  canvas.height = Math.round(lineState.height * lineState.dpr);
  canvas.style.left = `${lineState.canvasLeft}px`;
  canvas.style.width = `${lineState.width}px`;
  canvas.style.height = `${lineState.height}px`;
  context.setTransform(lineState.dpr, 0, 0, lineState.dpr, 0, 0);

  const segmentStep = Math.max(lineState.lineStep * 1.35, 7);
  const columns = Math.floor(rect.width / lineState.lineStep) + 1;
  const rows = Math.ceil(lineState.height / segmentStep) + 1;

  lineState.lines = Array.from({ length: columns }, (_, column) => {
    const x = rect.left + column * lineState.lineStep + lineState.stroke / 2;
    return Array.from({ length: rows }, (_, row) => ({
      baseX: x,
      x: x + getPreservedLineOffset(previousLines, previousFirstX, previousLineStep, previousSegmentStep, x, row * segmentStep),
      y: Math.min(row * segmentStep, lineState.height),
      vx: 0,
    }));
  });
}

function getPreservedLineOffset(previousLines, previousFirstX, previousLineStep, previousSegmentStep, x, y) {
  if (!previousLines?.length) return 0;
  const column = Math.round((x - previousFirstX) / previousLineStep);
  const previousLine = previousLines[Math.min(Math.max(column, 0), previousLines.length - 1)];
  if (!previousLine?.length) return 0;
  const row = Math.round(y / previousSegmentStep);
  const point = previousLine[Math.min(Math.max(row, 0), previousLine.length - 1)];
  if (!point) return 0;
  const baseX = point.baseX ?? previousFirstX + column * previousLineStep;
  return point.x - baseX;
}

function drawLineFieldIfLayoutChanged() {
  if (!field) return;
  const rect = field.getBoundingClientRect();
  const nextWidth = Math.max(window.innerWidth, rect.width, 1);
  const nextHeight = Math.max(rect.height, 1);
  const nextCanvasLeft = rect.left * -1;
  const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
  const nextLineStep = Math.max(4, getCssNumber("--line-step", 6));
  const nextStroke = Math.max(1, getCssNumber("--stroke", 1));
  const hasLayoutChanged =
    Math.abs(nextWidth - lineState.width) > 1 ||
    Math.abs(nextHeight - lineState.height) > 1 ||
    Math.abs(nextCanvasLeft - lineState.canvasLeft) > 1 ||
    Math.abs(nextDpr - lineState.dpr) > 0.01 ||
    Math.abs(nextLineStep - lineState.lineStep) > 0.01 ||
    Math.abs(nextStroke - lineState.stroke) > 0.01;

  if (hasLayoutChanged) drawLineField({ preserveDisplacement: true });
}

function setLinePointerFromClient(clientX, clientY, activate = true) {
  if (!field) return;
  const rect = field.getBoundingClientRect();
  const x = clientX - rect.left - lineState.canvasLeft;
  const y = clientY - rect.top;
  const velocityLimit = lineState.lineStep * 3;

  lineState.pointer.velocityX = Math.max(Math.min(x - lineState.pointer.x, velocityLimit), -velocityLimit);
  lineState.pointer.velocityY = Math.max(Math.min(y - lineState.pointer.y, velocityLimit), -velocityLimit);
  lineState.pointer.previousX = lineState.pointer.x;
  lineState.pointer.previousY = lineState.pointer.y;
  lineState.pointer.x = x;
  lineState.pointer.y = y;
  lineState.pointer.active = activate;
}

function initializeLinePointer(clientX, clientY) {
  if (!field) return;
  const rect = field.getBoundingClientRect();
  const x = clientX - rect.left - lineState.canvasLeft;
  const y = clientY - rect.top;
  lineState.pointer.x = x;
  lineState.pointer.y = y;
  lineState.pointer.previousX = x;
  lineState.pointer.previousY = y;
  lineState.pointer.velocityX = 0;
  lineState.pointer.velocityY = 0;
  lineState.pointer.active = true;
}

function applyLineSmudgeAt(x, y, velocityX, velocityY, multiplier = 1) {
  const spacingScale = lineState.lineStep / 6;
  const radius = lineState.lineStep * 18;
  const radiusSquared = radius * radius;
  const pressure = 0.38 * spacingScale * multiplier;
  const dragX = velocityX;
  const dragY = velocityY;
  const verticalBias = Math.abs(dragY) * 0.03 * spacingScale;

  lineState.lines.forEach((line) => {
    line.forEach((point) => {
      const dx = point.x - x;
      const dy = point.y - y;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared > radiusSquared) return;
      const distance = Math.sqrt(distanceSquared);
      const normalized = 1 - distance / radius;
      const falloff = normalized * normalized * (3 - 2 * normalized);
      const centerPressure = falloff * pressure;
      const direction = dx === 0 ? 0 : dx / Math.max(Math.abs(dx), 1);
      point.vx += dragX * centerPressure + direction * verticalBias * centerPressure;
    });
  });
}

function applyLineSmudge() {
  if (!lineState.pointer.active) return;
  applyLineSmudgeAt(
    lineState.pointer.x,
    lineState.pointer.y,
    lineState.pointer.velocityX,
    lineState.pointer.velocityY
  );
}

function updateLinePhysics() {
  applyLineSmudge();
  lineState.lines.forEach((line) => {
    line.forEach((point) => {
      point.vx *= 0.72;
      point.x += point.vx;
    });
  });
  lineState.pointer.velocityX *= 0.78;
  lineState.pointer.velocityY *= 0.78;
}

function renderLineField() {
  if (!context) return;
  context.clearRect(0, 0, lineState.width, lineState.height);
  context.strokeStyle = lineState.color;
  context.globalAlpha = 1;
  context.lineWidth = lineState.stroke;
  context.lineCap = "butt";
  context.lineJoin = "round";
  lineState.lines.forEach((line) => {
    context.beginPath();
    line.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
        return;
      }
      context.lineTo(point.x, point.y);
    });
    context.stroke();
  });
}

function animateLineField() {
  updateLinePhysics();
  renderLineField();
  window.requestAnimationFrame(animateLineField);
}

function initializeLineField() {
  if (!field || lineAnimationStarted) return;
  lineAnimationStarted = true;
  drawLineField();
  animateLineField();
}

function clampPuckState(state) {
  const fieldRect = field.getBoundingClientRect();
  state.x = Math.min(Math.max(state.x, state.radius), Math.max(fieldRect.width - state.radius, state.radius));
  state.y = Math.min(Math.max(state.y, state.radius), Math.max(fieldRect.height - state.radius, state.radius));
}

function setPuckPosition(state, x, y) {
  if (!field) return;
  state.x = x;
  state.y = y;
  clampPuckState(state);
  state.element.style.left = `${state.x}px`;
  state.element.style.top = `${state.y}px`;
}

function getPuckCenterClient(state) {
  const fieldRect = field.getBoundingClientRect();
  return {
    x: fieldRect.left + state.x,
    y: fieldRect.top + state.y,
  };
}

function syncPuckStateFromDom() {
  if (!field) return;
  const fieldRect = field.getBoundingClientRect();
  puckPhysicsState.pucks.forEach((state) => {
    if (state.introSliding || state.introSlidePrepared) return;
    const rect = state.element.getBoundingClientRect();
    state.radius = Math.max(rect.width, rect.height) / 2;
    state.x = rect.left - fieldRect.left + rect.width / 2;
    state.y = rect.top - fieldRect.top + rect.height / 2;
    clampPuckState(state);
    state.element.style.left = `${state.x}px`;
    state.element.style.top = `${state.y}px`;
  });
}

function resetMobilePuckLayoutFromCss() {
  if (!field || !window.matchMedia("(max-width: 700px)").matches) return;

  puckPhysicsState.introSlidePrepared = false;
  puckPhysicsState.pucks.forEach((state) => {
    state.dragging = false;
    state.pointerId = null;
    state.vx = 0;
    state.vy = 0;
    state.moved = false;
    state.introSlidePrepared = false;
    state.introSliding = false;
    state.element.classList.remove("is-dragging");
    state.element.style.left = "";
    state.element.style.top = "";
  });

  window.requestAnimationFrame(() => {
    syncPuckStateFromDom();
    drawLineField();
  });
}

function resolvePuckCollisions() {
  const pucks = puckPhysicsState.pucks;
  for (let index = 0; index < pucks.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < pucks.length; nextIndex += 1) {
      const a = pucks[index];
      const b = pucks[nextIndex];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 1;
      const minimumDistance = a.radius + b.radius;
      if (distance >= minimumDistance) continue;

      const normalX = dx / distance;
      const normalY = dy / distance;
      const overlap = minimumDistance - distance;
      const aPinned = a.dragging;
      const bPinned = b.dragging;

      if (!aPinned && !bPinned) {
        a.x -= normalX * overlap * 0.5;
        a.y -= normalY * overlap * 0.5;
        b.x += normalX * overlap * 0.5;
        b.y += normalY * overlap * 0.5;
      } else if (aPinned && !bPinned) {
        b.x += normalX * overlap;
        b.y += normalY * overlap;
      } else if (!aPinned && bPinned) {
        a.x -= normalX * overlap;
        a.y -= normalY * overlap;
      }

      const relativeVelocityX = b.vx - a.vx;
      const relativeVelocityY = b.vy - a.vy;
      const separatingVelocity = relativeVelocityX * normalX + relativeVelocityY * normalY;
      if (separatingVelocity < 0 || aPinned || bPinned) {
        const restitution = 0.88;
        const impulse = -(1 + restitution) * separatingVelocity / 2;
        if (!aPinned) {
          a.vx -= impulse * normalX;
          a.vy -= impulse * normalY;
        }
        if (!bPinned) {
          b.vx += impulse * normalX;
          b.vy += impulse * normalY;
        }
        const hitSpeed = Math.abs(separatingVelocity);
        if (hitSpeed > 0.4) {
          const centerX = (a.x + b.x) / 2 + field.getBoundingClientRect().left;
          const centerY = (a.y + b.y) / 2;
          applyLineSmudgeAt(centerX, centerY, normalX * hitSpeed, normalY * hitSpeed, 0.82);
        }
      }

      clampPuckState(a);
      clampPuckState(b);
    }
  }
}

function animatePuckPhysics() {
  if (!field) return;
  const fieldRect = field.getBoundingClientRect();
  const friction = 0.985;
  const restitution = 0.82;
  const maxSpeed = Math.max(18, fieldRect.width * 0.018);
  const isMobilePuckLayout = window.matchMedia("(max-width: 700px)").matches;
  const mobileIntroSliding = isMobilePuckLayout
    && puckPhysicsState.pucks.some((state) => state.introSliding);

  puckPhysicsState.pucks.forEach((state) => {
    if (mobileIntroSliding && !state.introSliding) {
      state.vx = 0;
      state.vy = 0;
      return;
    }

    if (!state.dragging && !state.introSliding) {
      state.x += state.vx;
      state.y += state.vy;
      state.vx *= friction;
      state.vy *= friction;

      if (state.x <= state.radius || state.x >= fieldRect.width - state.radius) {
        state.x = Math.min(Math.max(state.x, state.radius), fieldRect.width - state.radius);
        state.vx *= -restitution;
      }
      if (state.y <= state.radius || state.y >= fieldRect.height - state.radius) {
        state.y = Math.min(Math.max(state.y, state.radius), fieldRect.height - state.radius);
        state.vy *= -restitution;
      }

      state.vx = Math.max(Math.min(state.vx, maxSpeed), -maxSpeed);
      state.vy = Math.max(Math.min(state.vy, maxSpeed), -maxSpeed);
      if (Math.hypot(state.vx, state.vy) < 0.035) {
        state.vx = 0;
        state.vy = 0;
      }
    }
  });

  if (!mobileIntroSliding) {
    resolvePuckCollisions();
  }

  puckPhysicsState.pucks.forEach((state) => {
    state.element.style.left = `${state.x}px`;
    state.element.style.top = `${state.y}px`;
    if (!state.dragging && Math.hypot(state.vx, state.vy) > 0.12) {
      const center = getPuckCenterClient(state);
      applyLineSmudgeAt(center.x, center.y - fieldRect.top, state.vx, state.vy, 0.58);
    }
  });

  window.requestAnimationFrame(animatePuckPhysics);
}

function prepareIntroPuckSlide(attempt = 0) {
  if (
    puckPhysicsState.introSlidePrepared ||
    puckPhysicsState.introSlideStarted ||
    !field ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const isStackedMobileLayout = window.matchMedia("(max-width: 700px)").matches;
  const pushedTargetClass = isStackedMobileLayout ? "portfolio-puck-two" : "portfolio-puck-three";
  const state = puckPhysicsState.pucks.find((item) => item.element.classList.contains("portfolio-puck-one"));
  const pushedState = puckPhysicsState.pucks.find((item) => item.element.classList.contains(pushedTargetClass));
  if (!state || !state.radius || !pushedState || !pushedState.radius) {
    if (attempt < 20) window.setTimeout(() => prepareIntroPuckSlide(attempt + 1), 80);
    return;
  }

  state.element.style.left = "";
  state.element.style.top = "";
  pushedState.element.style.left = "";
  pushedState.element.style.top = "";
  const fieldRect = field.getBoundingClientRect();
  const puckRect = state.element.getBoundingClientRect();
  const pushedRect = pushedState.element.getBoundingClientRect();
  state.x = puckRect.left - fieldRect.left + puckRect.width / 2;
  state.y = puckRect.top - fieldRect.top + puckRect.height / 2;
  pushedState.x = pushedRect.left - fieldRect.left + pushedRect.width / 2;
  pushedState.y = pushedRect.top - fieldRect.top + pushedRect.height / 2;
  clampPuckState(state);
  clampPuckState(pushedState);
  state.introFinalX = state.x;
  state.introFinalY = state.y;
  const combinedRadius = state.radius + pushedState.radius;
  state.introStartX = Math.max(state.radius, state.introFinalX - state.radius * (isStackedMobileLayout ? 3.3 : 2.2));
  state.introStartY = state.introFinalY;
  state.introContactX = state.introFinalX;
  state.introContactY = state.introFinalY;
  if (isStackedMobileLayout) {
    pushedState.introFinalX = state.introFinalX;
    pushedState.introFinalY = pushedState.y;
    pushedState.introStartX = Math.max(pushedState.radius, state.introFinalX - pushedState.radius * 0.45);
    pushedState.introStartY = Math.min(
      Math.max(pushedState.radius, state.introFinalY + combinedRadius * 0.54),
      pushedState.introFinalY - pushedState.radius * 0.5
    );
  } else {
    pushedState.introFinalX = pushedState.x;
    pushedState.introFinalY = pushedState.y;
    const contactY = state.introFinalY + combinedRadius * 0.42;
    const contactXOffset = Math.sqrt(Math.max((combinedRadius * 0.99) ** 2 - (contactY - state.introFinalY) ** 2, 0));
    const desiredContactX = state.introFinalX + state.radius * 0.25;
    pushedState.introStartX = Math.max(pushedState.radius, desiredContactX + contactXOffset);
    pushedState.introStartY = Math.max(pushedState.radius, contactY);
    state.introContactX = pushedState.introStartX - contactXOffset;
    state.introContactY = state.introFinalY;
  }
  state.introSlidePrepared = true;
  pushedState.introSlidePrepared = true;
  puckPhysicsState.introSlidePrepared = true;
  setPuckPosition(state, state.introStartX, state.introFinalY);
  setPuckPosition(pushedState, pushedState.introStartX, pushedState.introStartY);
}

function runIntroPuckSlide(attempt = 0) {
  if (
    puckPhysicsState.introSlideStarted ||
    !field ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const isStackedMobileLayout = window.matchMedia("(max-width: 700px)").matches;
  const pushedTargetClass = isStackedMobileLayout ? "portfolio-puck-two" : "portfolio-puck-three";
  const state = puckPhysicsState.pucks.find((item) => item.element.classList.contains("portfolio-puck-one"));
  const pushedState = puckPhysicsState.pucks.find((item) => item.element.classList.contains(pushedTargetClass));
  if (!state || !state.radius || !pushedState || !pushedState.radius) {
    if (attempt < 20) window.setTimeout(() => runIntroPuckSlide(attempt + 1), 100);
    return;
  }

  if (!puckPhysicsState.introSlidePrepared) {
    prepareIntroPuckSlide();
  }

  puckPhysicsState.introSlideStarted = true;
  const fieldRect = field.getBoundingClientRect();
  const finalX = state.introFinalX ?? state.x;
  const finalY = state.introFinalY ?? state.y;
  const startX = state.introStartX ?? Math.max(state.radius, finalX - state.radius * 2);
  const contactTargetX = state.introContactX ?? finalX;
  const pushedFinalX = pushedState.introFinalX ?? pushedState.x;
  const pushedFinalY = pushedState.introFinalY ?? pushedState.y;
  const pushedStartX = pushedState.introStartX ?? Math.max(pushedState.radius, pushedFinalX - pushedState.radius * 1.25);
  const pushedStartY = pushedState.introStartY ?? Math.max(pushedState.radius, pushedFinalY - pushedState.radius * 0.62);
  let lastX = startX;
  let lastY = finalY;
  let pushedLastX = pushedStartX;
  let pushedLastY = pushedStartY;
  let velocityX = 0;
  let pushedVelocityX = 0;
  let pushedVelocityY = 0;
  const startTime = performance.now();
  const maxDuration = 3300;
  const combinedRadius = state.radius + pushedState.radius;
  let contactMade = false;

  state.introSliding = true;
  pushedState.introSliding = true;
  state.dragging = false;
  pushedState.dragging = false;
  state.vx = 0;
  state.vy = 0;
  pushedState.vx = 0;
  pushedState.vy = 0;
  setPuckPosition(state, startX, finalY);
  setPuckPosition(pushedState, pushedStartX, pushedStartY);

  function finishIntroSlide() {
    state.introSliding = false;
    state.introSlidePrepared = false;
    pushedState.introSliding = false;
    pushedState.introSlidePrepared = false;
    state.vx = 0;
    state.vy = 0;
    pushedState.vx = 0;
    pushedState.vy = 0;
    setPuckPosition(state, finalX, finalY);
    setPuckPosition(pushedState, pushedFinalX, pushedFinalY);
    lineState.pointer.active = false;
  }

  function step() {
    const elapsed = performance.now() - startTime;
    const driveTargetX = contactMade ? finalX : contactTargetX;
    const distance = driveTargetX - state.x;
    velocityX += distance * 0.012;
    velocityX *= 0.88;
    state.x += velocityX;
    state.y = finalY;

    const centerDistance = Math.hypot(pushedState.x - state.x, pushedState.y - state.y);
    if (!contactMade && centerDistance <= combinedRadius * 1.01) {
      contactMade = true;
      const normalX = (pushedState.x - state.x) / (centerDistance || 1);
      const normalY = (pushedState.y - state.y) / (centerDistance || 1);
      applyLineSmudgeAt(
        fieldRect.left + (state.x + pushedState.x) / 2,
        (state.y + pushedState.y) / 2,
        normalX * Math.max(Math.abs(velocityX), 1.2),
        normalY * Math.max(Math.abs(velocityX), 1.2),
        1
      );
    }

    if (!contactMade && Math.abs(contactTargetX - finalX) < 0.5 && Math.abs(finalX - state.x) < 0.5) {
      contactMade = true;
    }

    if (contactMade) {
      pushedVelocityX += (pushedFinalX - pushedState.x) * 0.011;
      pushedVelocityY += (pushedFinalY - pushedState.y) * 0.011;
      pushedVelocityX *= 0.88;
      pushedVelocityY *= 0.88;
      pushedState.x += pushedVelocityX;
      pushedState.y += pushedVelocityY;
    }

    if (
      Math.abs(finalX - state.x) < 0.35 &&
      Math.abs(velocityX) < 0.08 &&
      Math.abs(pushedFinalX - pushedState.x) < 0.35 &&
      Math.abs(pushedFinalY - pushedState.y) < 0.35 &&
      Math.hypot(pushedVelocityX, pushedVelocityY) < 0.08
    ) {
      finishIntroSlide();
      return;
    }

    if (elapsed > maxDuration) {
      finishIntroSlide();
      return;
    }

    state.element.style.left = `${state.x}px`;
    state.element.style.top = `${state.y}px`;
    pushedState.element.style.left = `${pushedState.x}px`;
    pushedState.element.style.top = `${pushedState.y}px`;

    const deltaX = state.x - lastX;
    const deltaY = state.y - lastY;
    lastX = state.x;
    lastY = state.y;
    if (Math.hypot(deltaX, deltaY) > 0.05) {
      const center = getPuckCenterClient(state);
      applyLineSmudgeAt(center.x, center.y - fieldRect.top, deltaX, deltaY, 0.58);
    }

    const pushedDeltaX = pushedState.x - pushedLastX;
    const pushedDeltaY = pushedState.y - pushedLastY;
    pushedLastX = pushedState.x;
    pushedLastY = pushedState.y;
    if (Math.hypot(pushedDeltaX, pushedDeltaY) > 0.05) {
      const center = getPuckCenterClient(pushedState);
      applyLineSmudgeAt(center.x, center.y - fieldRect.top, pushedDeltaX, pushedDeltaY, 0.58);
    }

    window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);
}

function initializePuckDragging() {
  if (!field || puckPhysicsState.initialized) return;
  puckPhysicsState.initialized = true;
  puckPhysicsState.pucks = Array.from(portfolioPucks, (puck) => ({
    element: puck,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 0,
    dragging: false,
    pointerId: null,
    pointerOffsetX: 0,
    pointerOffsetY: 0,
    startX: 0,
    startY: 0,
    previousClientX: 0,
    previousClientY: 0,
    releaseVx: 0,
    releaseVy: 0,
    moved: false,
    introSlidePrepared: false,
    introSliding: false,
    introStartX: 0,
    introStartY: 0,
    introContactX: 0,
    introContactY: 0,
    introFinalX: 0,
    introFinalY: 0,
  }));
  syncPuckStateFromDom();

  const updateDragFromEvent = (state, event) => {
    if (!state.dragging || state.pointerId !== event.pointerId || !field) return false;
    const movedDistance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY);
    const fieldRect = field.getBoundingClientRect();
    state.moved = state.moved || movedDistance > 3;
    const deltaX = event.clientX - state.previousClientX;
    const deltaY = event.clientY - state.previousClientY;
    state.vx = deltaX;
    state.vy = deltaY;
    if (Math.hypot(deltaX, deltaY) > 0.08) {
      state.releaseVx = state.releaseVx * 0.35 + deltaX * 0.65;
      state.releaseVy = state.releaseVy * 0.35 + deltaY * 0.65;
    }
    state.previousClientX = event.clientX;
    state.previousClientY = event.clientY;
    setPuckPosition(
      state,
      event.clientX - fieldRect.left - state.pointerOffsetX,
      event.clientY - fieldRect.top - state.pointerOffsetY
    );
    if (Math.hypot(state.vx, state.vy) > 0.2) {
      const center = getPuckCenterClient(state);
      applyLineSmudgeAt(center.x, center.y - fieldRect.top, state.vx, state.vy, 0.46);
    }
    return true;
  };

  const finishDragForState = (state, event) => {
    if (!state.dragging || state.pointerId !== event.pointerId) return false;
    lineState.pointer.active = false;
    state.dragging = false;
    state.pointerId = null;
    if (state.moved) {
      const releaseSpeed = Math.hypot(state.releaseVx, state.releaseVy);
      const fallbackVx = (event.clientX - state.startX) * 0.18;
      const fallbackVy = (event.clientY - state.startY) * 0.18;
      state.vx = (releaseSpeed > 0.1 ? state.releaseVx : fallbackVx) * 1.12;
      state.vy = (releaseSpeed > 0.1 ? state.releaseVy : fallbackVy) * 1.12;
    }
    state.element.classList.remove("is-dragging");
    if (state.element.hasPointerCapture?.(event.pointerId)) state.element.releasePointerCapture(event.pointerId);
    state.element.dataset.dragMoved = state.moved ? "true" : "false";
    return true;
  };

  portfolioPucks.forEach((puck) => {
    const state = puckPhysicsState.pucks.find((item) => item.element === puck);
    if (!state) return;

    puck.addEventListener("pointerdown", (event) => {
      if (!field || event.button !== 0) return;
      const puckRect = puck.getBoundingClientRect();
      state.dragging = true;
      state.pointerId = event.pointerId;
      state.startX = event.clientX;
      state.startY = event.clientY;
      state.previousClientX = event.clientX;
      state.previousClientY = event.clientY;
      state.releaseVx = 0;
      state.releaseVy = 0;
      state.pointerOffsetX = event.clientX - puckRect.left - puckRect.width / 2;
      state.pointerOffsetY = event.clientY - puckRect.top - puckRect.height / 2;
      state.vx = 0;
      state.vy = 0;
      state.moved = false;
      puck.classList.add("is-dragging");
      puck.setPointerCapture(event.pointerId);
      lineState.pointer.active = false;
      event.preventDefault();
    });

    puck.addEventListener("pointermove", (event) => {
      if (updateDragFromEvent(state, event)) event.puckDragHandled = true;
    });

    const finishDrag = (event) => {
      if (finishDragForState(state, event)) event.puckDragFinished = true;
    };

    puck.addEventListener("pointerup", finishDrag);
    puck.addEventListener("pointercancel", finishDrag);
    puck.addEventListener("click", (event) => {
      if (puck.dataset.dragMoved === "true") {
        event.preventDefault();
        puck.dataset.dragMoved = "false";
      }
    });
  });

  window.addEventListener("pointermove", (event) => {
    if (event.puckDragHandled) return;
    const state = puckPhysicsState.pucks.find((item) => item.dragging && item.pointerId === event.pointerId);
    if (state) updateDragFromEvent(state, event);
  });

  window.addEventListener("pointerup", (event) => {
    if (event.puckDragFinished) return;
    const state = puckPhysicsState.pucks.find((item) => item.dragging && item.pointerId === event.pointerId);
    if (state) finishDragForState(state, event);
  });

  window.addEventListener("pointercancel", (event) => {
    if (event.puckDragFinished) return;
    const state = puckPhysicsState.pucks.find((item) => item.dragging && item.pointerId === event.pointerId);
    if (state) finishDragForState(state, event);
  });

  if (!puckPhysicsState.animationStarted) {
    puckPhysicsState.animationStarted = true;
    window.requestAnimationFrame(animatePuckPhysics);
  }
}

function revealHomePucks() {
  if (!portfolioPucks.length) return;
  document.querySelectorAll("[data-puck-lottie].is-lottie-ready").forEach((target) => {
    target.closest(".portfolio-puck")?.classList.add("is-puck-ready");
  });
}

function initializePlaygroundTypeLabels() {
  const tiles = [...document.querySelectorAll(".playground-type-label")]
    .map((label) => label.closest(".playground-tile"))
    .filter(Boolean);
  if (!tiles.length) return;

  const revealTile = (tile) => {
    tile.classList.add("is-type-ready");
  };

  if (!("IntersectionObserver" in window)) {
    tiles.forEach(revealTile);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.4) return;
        revealTile(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: [0.4] }
  );

  tiles.forEach((tile) => observer.observe(tile));
}

function initializePuckLottieIcons(attempt = 0) {
  const lottieRenderer = window.lottie || window.bodymovin;
  const targets = document.querySelectorAll("[data-puck-lottie]");
  const embeddedLottieData = window.PUCK_LOTTIE_DATA || {};
  const shouldAutoplayPucks = window.matchMedia?.("(hover: none), (pointer: coarse)")?.matches;

  if (!targets.length) return;
  if (!lottieRenderer?.loadAnimation) {
    if (attempt < 30) window.setTimeout(() => initializePuckLottieIcons(attempt + 1), 120);
    return;
  }

  targets.forEach((target) => {
    if (target.dataset.lottieInitialized === "true") return;
    target.dataset.lottieInitialized = "true";
    const animationContainer = document.createElement("span");
    animationContainer.className = "puck-lottie-animation";
    target.append(animationContainer);
    const lottiePath = target.dataset.puckLottie;
    const lottieFile = lottiePath?.split("/").pop()?.split("?")[0];
    const animationOptions = {
      container: animationContainer,
      renderer: "svg",
      loop: true,
      autoplay: false,
    };
    if (lottieFile && embeddedLottieData[lottieFile]) {
      animationOptions.animationData = embeddedLottieData[lottieFile];
    } else {
      animationOptions.path = lottiePath;
    }
    const animation = lottieRenderer.loadAnimation({
      ...animationOptions,
    });
    animation.addEventListener("DOMLoaded", () => {
      const puck = target.closest(".portfolio-puck");
      if (puck?.classList.contains("portfolio-puck-one")) {
        prepareIntroPuckSlide();
      }
      target.classList.add("is-lottie-ready");
      puck?.classList.add("is-puck-ready");
      if (puck?.classList.contains("portfolio-puck-one")) {
        const slideDelay = window.matchMedia("(max-width: 700px)").matches ? 1780 : 860;
        window.setTimeout(runIntroPuckSlide, slideDelay);
      }
      if (shouldAutoplayPucks) {
        animation.play();
      } else {
        animation.goToAndStop(Number(target.dataset.puckLottieRestFrame || 0), true);
      }
    });
    const puck = target.closest(".portfolio-puck");
    puck?.addEventListener("mouseenter", () => animation.play());
    puck?.addEventListener("focus", () => animation.play());
    puck?.addEventListener("mouseleave", () => {
      if (!shouldAutoplayPucks) animation.goToAndStop(Number(target.dataset.puckLottieRestFrame || 0), true);
    });
    puck?.addEventListener("blur", () => {
      if (!shouldAutoplayPucks) animation.goToAndStop(Number(target.dataset.puckLottieRestFrame || 0), true);
    });
  });
}

function initializeSiteMenu() {
  if (!navMenuToggle || !siteNav || document.querySelector(".site-menu-panel")) return;
  const panel = document.createElement("div");
  panel.className = "site-menu-panel";
  panel.id = "site-menu-panel";
  panel.innerHTML = projectOrder.map((key, index) => {
    const project = projectData[key];
    const current = document.body.dataset.project === key;
    return `
      <a href="./project.html?project=${key}" ${current ? 'aria-current="page"' : ""}>
        <span class="site-menu-count">${String(index + 1).padStart(2, "0")}</span>
        <span class="site-menu-title">${escapeHtml(project.title)}</span>
      </a>
    `;
  }).join("");
  document.body.append(panel);

  const close = () => {
    navMenuToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-menu-open");
    document.body.classList.remove("site-menu-open");
  };

  navMenuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = navMenuToggle.getAttribute("aria-expanded") !== "true";
    updateHeaderScrollState();
    syncSiteMenuPosition();
    navMenuToggle.setAttribute("aria-expanded", String(open));
    siteNav.classList.toggle("is-menu-open", open);
    document.body.classList.toggle("site-menu-open", open);
    if (open) {
      window.requestAnimationFrame(syncSiteMenuPosition);
      window.setTimeout(syncSiteMenuPosition, 380);
    }
  });
  document.addEventListener("click", (event) => {
    if (!siteNav.contains(event.target) && !panel.contains(event.target)) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value || "";
  });
}

function setTypedHeadingData(element, text, propertyName = "--section-cursor-x") {
  if (!element) return;
  element.dataset.typeTitle = text;
  const updateWidth = () => {
    const styles = window.getComputedStyle(element);
    const probe = document.createElement("span");
    probe.textContent = text;
    Object.assign(probe.style, {
      position: "absolute",
      visibility: "hidden",
      pointerEvents: "none",
      whiteSpace: "nowrap",
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      fontStyle: styles.fontStyle,
      letterSpacing: styles.letterSpacing,
      lineHeight: styles.lineHeight,
      textTransform: styles.textTransform,
    });
    document.body.append(probe);
    element.style.setProperty(propertyName, `${probe.getBoundingClientRect().width}px`);
    probe.remove();
  };
  updateWidth();
  document.fonts?.ready.then(updateWidth).catch(() => {});
}

function getDropCapMarkup(text = "") {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const first = trimmed.charAt(0);
  return `<span class="module-drop-cap" aria-hidden="true"><span class="module-drop-cap-letter">${escapeHtml(first)}</span></span><span class="visually-hidden">${escapeHtml(first)}</span>${escapeHtml(trimmed.slice(1))}`;
}

function clearMobileDropCapStabilizers() {
  document.querySelectorAll(".drop-cap-line-clear").forEach((element) => {
    const paragraph = element.closest("p");
    element.remove();
    paragraph?.normalize();
    paragraph?.removeAttribute("data-drop-cap-stabilized");
  });
}

function stabilizeMobileDropCaps() {
  clearMobileDropCapStabilizers();
  if (!window.matchMedia("(max-width: 700px)").matches) return;

  document.querySelectorAll(".module-drop-cap").forEach((dropCap) => {
    const paragraph = dropCap.closest("p");
    if (!paragraph) return;
    const textNode = Array.from(paragraph.childNodes).find((node) => (
      node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 20
    ));
    if (!textNode) return;

    const range = document.createRange();
    const samples = [];
    const text = textNode.textContent;
    for (let index = 0; index < Math.min(text.length, 220); index += 1) {
      range.setStart(textNode, index);
      range.setEnd(textNode, index + 1);
      const rect = range.getBoundingClientRect();
      if (rect.width && rect.height) {
        samples.push({ index, top: Math.round(rect.top) });
      }
    }
    range.detach?.();

    const lineTops = [];
    samples.forEach((sample) => {
      if (!lineTops.some((top) => Math.abs(top - sample.top) <= 2)) {
        lineTops.push(sample.top);
      }
    });
    if (lineTops.length < 4) return;

    const fourthLineTop = lineTops[3];
    const fourthLineSample = samples.find((sample) => Math.abs(sample.top - fourthLineTop) <= 2);
    if (!fourthLineSample) return;

    let splitIndex = fourthLineSample.index;
    while (splitIndex > 0 && !/\s/.test(text.charAt(splitIndex - 1))) {
      splitIndex -= 1;
    }
    if (splitIndex <= 0 || splitIndex >= text.length) return;

    const remainder = textNode.splitText(splitIndex);
    const clear = document.createElement("span");
    clear.className = "drop-cap-line-clear";
    clear.setAttribute("aria-hidden", "true");
    paragraph.insertBefore(clear, remainder);
    paragraph.dataset.dropCapStabilized = "true";
  });
}

function setVideoSource(video, source, options = {}) {
  if (!video || !source) return;
  video.muted = Boolean(options.muted || options.autoplay);
  video.defaultMuted = Boolean(options.muted || options.autoplay);
  video.loop = Boolean(options.loop);
  video.autoplay = Boolean(options.autoplay);
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  if (video.muted) video.setAttribute("muted", "");
  if (video.loop) video.setAttribute("loop", "");
  if (video.autoplay) video.setAttribute("autoplay", "");
  if (options.preload) video.preload = options.preload;
  video.src = source;
  if (options.autoplay) {
    video.load();
    playAmbientVideo(video);
  }
  if (options.poster) video.poster = options.poster;
}

function playAmbientVideo(video) {
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.autoplay = true;
  video.preload = "auto";
  video.playsInline = true;
  video.classList.add("ambient-video");
  video.setAttribute("muted", "");
  video.setAttribute("loop", "");
  video.setAttribute("autoplay", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  if (video.readyState === HTMLMediaElement.HAVE_NOTHING && (video.currentSrc || video.src)) {
    video.load();
  }
  return video.play().catch(() => {});
}

function getProjectAmbientVideos() {
  const selector = [
    ".project-overview-circles video",
    ".module-one-circle video",
    "body[data-project=\"skimm-money-newsletter\"] .project-phone-screen video",
    ".additional-creative video",
  ].join(", ");
  return [...document.querySelectorAll(selector)].filter((video) => video.currentSrc || video.src);
}

function prepareProjectAmbientVideo(video) {
  if (!video || video.dataset.ambientPrepared === "true") return;
  video.dataset.ambientPrepared = "true";
  ["loadedmetadata", "loadeddata", "canplay", "playing", "pause"].forEach((eventName) => {
    video.addEventListener(eventName, () => {
      if (document.hidden) return;
      if (eventName === "pause" && video.dataset.ambientUserPaused !== "true") {
        window.setTimeout(() => playAmbientVideo(video), 80);
        return;
      }
      playAmbientVideo(video);
    });
  });
}

function observeProjectAmbientVideos(videos) {
  if (!("IntersectionObserver" in window)) return;
  if (!projectAmbientVideoObserver) {
    projectAmbientVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const video = entry.target.matches("video") ? entry.target : entry.target.querySelector("video");
        playAmbientVideo(video);
      });
    }, { rootMargin: "220px 0px", threshold: 0.01 });
  }

  videos.forEach((video) => {
    if (video.dataset.ambientObserved === "true") return;
    video.dataset.ambientObserved = "true";
    projectAmbientVideoObserver.observe(video.closest("figure") || video);
  });
}

function initializeProjectAmbientVideos() {
  const videos = getProjectAmbientVideos();
  videos.forEach((video) => {
    prepareProjectAmbientVideo(video);
    playAmbientVideo(video);
  });
  observeProjectAmbientVideos(videos);
}

function scheduleProjectAmbientVideoResume() {
  if (projectAmbientScrollRaf) return;
  projectAmbientScrollRaf = window.requestAnimationFrame(() => {
    projectAmbientScrollRaf = null;
    initializeProjectAmbientVideos();
    window.setTimeout(initializeProjectAmbientVideos, 180);
  });
}

function createOverviewCircles(sources) {
  const copy = document.querySelector(".project-overview-copy");
  if (!copy || !sources?.length || document.querySelector(".project-overview-circles")) return;
  const wrap = document.createElement("div");
  wrap.className = "project-overview-circles";
  wrap.innerHTML = sources.map((source) => `
    <figure class="project-overview-circle">
      ${source ? `<video muted loop autoplay playsinline preload="auto" src="${source}"></video>` : ""}
      <div class="project-overview-placeholder" aria-hidden="true"></div>
    </figure>
  `).join("");
  copy.after(wrap);
  wrap.querySelectorAll("video").forEach(playAmbientVideo);
}

function isNearInitialViewport(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  const viewportHeight = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight;
  return rect.top < viewportHeight + 160 && rect.bottom > -80;
}

function isLoadableMedia(media) {
  if (media instanceof HTMLImageElement) return Boolean(media.currentSrc || media.src);
  if (media instanceof HTMLVideoElement) return Boolean(media.currentSrc || media.src);
  return false;
}

function waitForMediaReady(media) {
  if (media instanceof HTMLImageElement) {
    if (media.complete && media.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      media.addEventListener("load", resolve, { once: true });
      media.addEventListener("error", resolve, { once: true });
    });
  }

  if (media instanceof HTMLVideoElement) {
    if (media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA || (media.poster && media.readyState >= HTMLMediaElement.HAVE_METADATA)) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      ["loadeddata", "canplay", "error"].forEach((eventName) => {
        media.addEventListener(eventName, resolve, { once: true });
      });
    });
  }

  return Promise.resolve();
}

function getAboveFoldProjectMedia() {
  const media = [
    ...document.querySelectorAll(".project-media-frame img, .project-media-frame video"),
    ...document.querySelectorAll(".project-overview-circles img, .project-overview-circles video"),
    ...document.querySelectorAll(".module-one-circle img, .module-one-circle video"),
  ];

  return media.filter((item) => {
    const target = item.closest("figure, .project-media-frame, .project-overview-circle, .module-one-circle") || item;
    return isLoadableMedia(item) && isNearInitialViewport(target);
  });
}

function revealProjectContentWhenReady() {
  if (!document.body.classList.contains("project-page") || document.body.classList.contains("project-content-ready")) return;
  const aboveFoldMedia = getAboveFoldProjectMedia();
  const mediaReady = aboveFoldMedia.length
    ? Promise.allSettled(aboveFoldMedia.map(waitForMediaReady))
    : Promise.resolve();
  const fallback = new Promise((resolve) => window.setTimeout(resolve, 1150));

  Promise.race([mediaReady, fallback]).then(() => {
    window.requestAnimationFrame(() => {
      document.body.classList.remove("project-content-loading");
      document.body.classList.add("project-content-ready");
    });
  });
}

function hydrateModule(project) {
  const module = document.querySelector(".module-one");
  if (!module) return;
  const heading = module.querySelector(".module-one-process-title");
  const copy = module.querySelector(".module-one-copy p");
  if (heading) heading.textContent = project.moduleHeading || "Creative Direction";
  if (copy) copy.innerHTML = getDropCapMarkup(project.moduleCopy || project.overviewCopy);

  module.querySelectorAll("[data-module-video]").forEach((video, index) => {
    const source = project.moduleVideoSrcs?.[index];
    const circle = video.closest(".module-one-circle");
    if (source) {
      setVideoSource(video, source, { muted: true, loop: true, autoplay: true });
      circle?.classList.add("has-video");
    } else {
      circle?.classList.remove("has-video");
      video.removeAttribute("src");
    }
  });

  document.body.classList.toggle("has-module-meta", Boolean(project.moveMetaToModule));
  module.querySelector(".module-one-meta")?.remove();
  if (project.moveMetaToModule) {
    const meta = document.createElement("aside");
    meta.className = "module-one-meta";
    meta.innerHTML = getMetaMarkup(project);
    module.append(meta);
  }
}

function getMetaMarkup(project) {
  return `
    <dl>
      <div><dt>Role</dt><dd>${escapeHtml(project.role)}</dd></div>
      <div><dt>Scope</dt><dd>${escapeHtml(project.format)}</dd></div>
      <div><dt>Year</dt><dd>${escapeHtml(project.year)}</dd></div>
    </dl>
  `;
}

function hydrateIllustrations(project) {
  document.querySelector(".illustration-gallery")?.remove();
  if (!project.illustrations?.length) return;
  const module = document.querySelector(".module-one");
  const gallery = document.createElement("section");
  gallery.className = "illustration-gallery";
  gallery.setAttribute("aria-label", `${project.title} gallery`);
  const rows = [];
  for (let index = 0; index < project.illustrations.length; index += 2) {
    rows.push(project.illustrations.slice(index, index + 2));
  }
  gallery.innerHTML = `<div class="illustration-gallery-grid">${rows.map((row) => `
    <div class="illustration-row ${row.length === 1 ? "illustration-row-wide" : ""}">
      ${row.map(([label, source]) => `
        <figure class="illustration-card">
          <img src="${source}" alt="${escapeHtml(label)} animation" loading="lazy" />
          <figcaption>${escapeHtml(label)}</figcaption>
        </figure>
      `).join("")}
    </div>
  `).join("")}</div>`;
  module?.before(gallery);
}

function hydrateEditorialAlternate(project) {
  document.querySelector(".editorial-alternate-media")?.remove();
  if (!project.alternateVideoSrc) return;
  const frame = document.querySelector(".project-media-frame");
  const section = document.createElement("section");
  section.className = "editorial-alternate-media";
  section.innerHTML = `
    <div class="editorial-alternate-copy">
      <h3>${escapeHtml(project.alternateHeading)}</h3>
      ${project.alternateCopy.split("\n\n").map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    </div>
    <figure class="editorial-alternate-player">
      <video muted playsinline preload="metadata" src="${project.alternateVideoSrc}"></video>
      ${getVideoControlsMarkup()}
    </figure>
  `;
  frame?.after(section);
  initializeProjectVideoControls(section);
}

function hydrateAdditionalCreativeVideos(key) {
  document.querySelectorAll(".additional-creative video").forEach((video) => {
    const source = video.dataset.src;
    if (key === "skimm-money-newsletter" && source) {
      setVideoSource(video, source, { muted: true, loop: true, autoplay: true });
      return;
    }
    video.pause();
    video.removeAttribute("src");
    video.load();
  });
}

function hydrateProjectPage() {
  if (!document.body.classList.contains("project-page")) return;
  const key = getProjectKey();
  const project = projectData[key] || projectData["skimmu-money"];
  document.body.dataset.project = key;
  document.body.classList.remove("is-project-building");
  document.title = `${project.title} | Ryan Pattison`;
  setText("[data-project-sticky-title]", project.title);
  const title = document.querySelector("[data-project-title]");
  if (title) {
    title.innerHTML = project.heroTitleHtml || escapeHtml(project.title);
    title.dataset.typeTitle = project.title;
    title.style.setProperty("--title-cursor-x", `${project.title.length + 0.25}ch`);
  }
  setText("[data-project-summary]", project.summary);
  setText("[data-project-role]", project.role);
  setText("[data-project-format]", project.format);
  setText("[data-project-year]", project.year);
  setText("[data-project-media-label]", project.mediaLabel);
  const overviewHeading = document.querySelector("[data-project-overview-heading]");
  if (overviewHeading) {
    const overviewHeadingText = project.overviewHeading || "Overview";
    overviewHeading.textContent = overviewHeadingText;
    setTypedHeadingData(overviewHeading, overviewHeadingText);
  }
  const overviewCopy = document.querySelector("[data-project-overview-copy]");
  if (overviewCopy) overviewCopy.innerHTML = getDropCapMarkup(project.overviewCopy);

  const productHeading = document.querySelector("[data-project-product-heading]");
  if (productHeading) {
    productHeading.textContent = project.productHeading || project.overviewHeading || "Overview";
    productHeading.hidden = !project.productHeading && key !== "editorial-motion";
  }
  const deviceCopy = document.querySelector(".project-device-copy > p");
  if (deviceCopy) deviceCopy.innerHTML = getDropCapMarkup(project.overviewCopy);
  const extra = document.querySelector(".project-device-extra-copy");
  if (extra) {
    extra.hidden = !project.extraCopy;
    const extraHeading = extra.querySelector("[data-project-extra-heading]");
    const extraCopy = extra.querySelector("[data-project-extra-copy]");
    if (extraHeading) extraHeading.textContent = project.extraHeading || "Creative Direction";
    if (extraCopy) extraCopy.textContent = project.extraCopy || "";
  }

  const mainVideo = document.querySelector("[data-project-video]");
  const mainVideoOptions = key === "skimm-money-newsletter"
    ? { muted: true, loop: true, autoplay: true, preload: "auto" }
    : { poster: project.posterSrc, muted: false, loop: Boolean(project.loopVideo) };
  setVideoSource(mainVideo, project.videoSrc, mainVideoOptions);
  document.querySelector(".project-media-frame")?.classList.toggle("has-video", Boolean(project.videoSrc));
  setVideoSource(document.querySelector("[data-project-secondary-video]"), project.secondaryVideoSrc, { muted: true, loop: true, autoplay: true });

  const overviewSources = project.overviewCircleVideoSrcs || (project.promoteModuleVideosToOverview ? project.moduleVideoSrcs : null);
  document.body.classList.toggle("has-overview-circles", Boolean(overviewSources?.length));
  createOverviewCircles(overviewSources);
  hydrateModule(project);
  const moduleHeading = document.querySelector(".module-one-copy h3");
  if (moduleHeading) {
    const moduleHeadingText = moduleHeading.textContent.trim();
    setTypedHeadingData(moduleHeading, moduleHeadingText);
  }
  hydrateIllustrations(project);
  hydrateEditorialAlternate(project);
  hydrateAdditionalCreativeVideos(key);
  initializeProjectVideoControls();
  initializeProjectAmbientVideos();
  initializeProcessLightbox();
  window.requestAnimationFrame(stabilizeMobileDropCaps);
  window.requestAnimationFrame(revealProjectContentWhenReady);
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) initializeProjectAmbientVideos();
});

window.addEventListener("pageshow", initializeProjectAmbientVideos);
window.addEventListener("scroll", scheduleProjectAmbientVideoResume, { passive: true });
window.addEventListener("touchstart", scheduleProjectAmbientVideoResume, { passive: true });
window.addEventListener("pointerdown", scheduleProjectAmbientVideoResume, { passive: true });
window.addEventListener("focus", scheduleProjectAmbientVideoResume);

function initializeProjectBuildTransition(project, key) {
  if (key !== "skimmu-money" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  document.querySelector(".project-build-transition")?.remove();
  const transition = document.createElement("div");
  transition.className = "project-build-transition";
  transition.setAttribute("aria-hidden", "true");
  transition.innerHTML = `
    <div class="project-build-title" data-build-title="${escapeHtml(project.title)}"></div>
    <div class="project-build-cursor"></div>
  `;
  document.body.append(transition);
  window.setTimeout(() => transition.remove(), 1280);
}

function getVideoControlsMarkup() {
  return `
    <div class="project-video-controls" data-video-controls>
      <button class="video-control-button video-play-toggle" type="button" aria-label="Play video" data-video-play><span class="video-play-icon" aria-hidden="true"></span></button>
      <span class="video-time" data-video-current>0:00</span>
      <input class="video-timeline" type="range" min="0" max="1000" value="0" step="1" aria-label="Video timeline" data-video-timeline />
      <span class="video-time" data-video-duration>0:00</span>
      <button class="video-control-button" type="button" aria-label="Mute video" data-video-mute><span class="video-volume-icon" aria-hidden="true"><svg viewBox="0 0 18 18" focusable="false"><path class="volume-horn" d="M3.5 7H6l4-3v10l-4-3H3.5z" /><path class="volume-wave" d="M12 6.5c1 1.2 1 3.8 0 5" /><path class="volume-mute-mark" d="M14 6l-4 6" /></svg></span></button>
      <input class="video-volume" type="range" min="0" max="1" value="1" step="0.05" aria-label="Video volume" data-video-volume />
      <button class="video-control-button" type="button" aria-label="Enter fullscreen" data-video-fullscreen><span class="video-fullscreen-icon" aria-hidden="true"></span></button>
    </div>
  `;
}

function formatTime(value) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function initializeProjectVideoControls(scope = document) {
  scope.querySelectorAll("[data-video-controls]").forEach((controls) => {
    if (controls.dataset.initialized === "true") return;
    controls.dataset.initialized = "true";
    const container = controls.closest(".editorial-alternate-player, .project-player-group, .project-media-frame");
    const video = container?.querySelector("video");
    if (!video) return;
    const play = controls.querySelector("[data-video-play]");
    const timeline = controls.querySelector("[data-video-timeline]");
    const current = controls.querySelector("[data-video-current]");
    const duration = controls.querySelector("[data-video-duration]");
    const mute = controls.querySelector("[data-video-mute]");
    const volume = controls.querySelector("[data-video-volume]");
    const fullscreen = controls.querySelector("[data-video-fullscreen]");
    const getFullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
    const isVideoFullscreen = () => Boolean(
      getFullscreenElement() === video ||
      getFullscreenElement() === container ||
      video.webkitDisplayingFullscreen
    );
    const syncFullscreen = () => {
      if (!fullscreen) return;
      const active = isVideoFullscreen();
      fullscreen.setAttribute("aria-label", active ? "Exit fullscreen" : "Enter fullscreen");
      fullscreen.classList.toggle("is-fullscreen", active);
    };

    const sync = () => {
      current.textContent = formatTime(video.currentTime);
      duration.textContent = formatTime(video.duration);
      if (timeline && Number.isFinite(video.duration) && video.duration > 0) {
        timeline.value = String(Math.round((video.currentTime / video.duration) * 1000));
        timeline.style.setProperty("--range-progress", `${(Number(timeline.value) / 1000) * 100}%`);
      }
      play?.classList.toggle("is-playing", !video.paused);
      mute.querySelector(".video-volume-icon")?.classList.toggle("is-muted", video.muted || video.volume === 0);
      syncFullscreen();
    };

    play?.addEventListener("click", () => (video.paused ? video.play() : video.pause()));
    timeline?.addEventListener("input", () => {
      if (Number.isFinite(video.duration)) video.currentTime = (Number(timeline.value) / 1000) * video.duration;
    });
    mute?.addEventListener("click", () => {
      video.muted = !video.muted;
      sync();
    });
    volume?.addEventListener("input", () => {
      video.volume = Number(volume.value);
      video.muted = video.volume === 0;
      volume.style.setProperty("--range-progress", `${video.volume * 100}%`);
      sync();
    });
    fullscreen?.addEventListener("click", () => {
      if (isVideoFullscreen()) {
        const exitRequest = document.exitFullscreen?.() || document.webkitExitFullscreen?.() || video.webkitExitFullscreen?.();
        exitRequest?.catch?.(() => {});
        syncFullscreen();
        return;
      }
      const requestVideoFullscreen = video.webkitEnterFullscreen
        || video.requestFullscreen
        || video.webkitRequestFullscreen;
      const fullscreenRequest = requestVideoFullscreen
        ? requestVideoFullscreen.call(video)
        : container?.requestFullscreen?.();
      if (video.paused) video.play().catch(() => {});
      fullscreenRequest?.catch?.(() => {});
      syncFullscreen();
    });
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
    video.addEventListener("webkitbeginfullscreen", syncFullscreen);
    video.addEventListener("webkitendfullscreen", syncFullscreen);
    video.addEventListener("loadedmetadata", sync);
    video.addEventListener("timeupdate", sync);
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    sync();
  });
}

function hydrateSecondaryProjectPreviews() {
  const homepagePreviewSources = {
    "brand-transitions": "./assets/videos/pucks/skimm-lab-icon.mp4",
    "event-graphics": "./assets/videos/pucks/skimm-spot-illustrations.mp4",
    "editorial-motion": "./assets/videos/pucks/pfl-icon.mp4",
  };
  document.querySelectorAll(".secondary-project-list a[href*='project=']").forEach((link) => {
    const key = new URL(link.getAttribute("href"), window.location.href).searchParams.get("project");
    const source = homepagePreviewSources[key] || projectData[key]?.overviewCircleVideoSrcs?.[0] || projectData[key]?.moduleVideoSrcs?.[0];
    const media = link.querySelector(".secondary-project-preview-media");
    if (!source || !media) return;
    const video = document.createElement("video");
    setVideoSource(video, source, { muted: true, loop: true, autoplay: true });
    video.preload = "metadata";
    video.setAttribute("aria-hidden", "true");
    media.replaceChildren(video);
    media.classList.add("has-video");
  });
}

function initializeProcessLightbox() {
  const triggers = document.querySelectorAll(".process-lightbox-trigger");
  if (!triggers.length || document.querySelector(".process-lightbox")) return;
  const lightbox = document.createElement("div");
  lightbox.className = "process-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.innerHTML = `<div class="process-lightbox-bar"><button class="process-lightbox-close" type="button" aria-label="Close enlarged image">&times;</button></div><div class="process-lightbox-frame"><img alt="" /></div>`;
  document.body.append(lightbox);
  const image = lightbox.querySelector("img");
  const close = () => lightbox.classList.remove("is-open", "is-frame-visible", "is-image-visible");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const source = trigger.querySelector("img");
      image.src = source.currentSrc || source.src;
      image.alt = source.alt;
      lightbox.classList.add("is-open", "is-frame-visible", "is-image-visible");
    });
  });
  lightbox.querySelector("button").addEventListener("click", close);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

const shapeState = {
  width: 0,
  height: 0,
  drawing: false,
  points: [],
  trace: null,
  objects: [],
  previousTime: performance.now(),
  gravity: 1500,
  bounce: 0.68,
  friction: 0.992,
  floorFriction: 0.82,
  angularFriction: 0.972,
  angularRestFriction: 0.86,
  maxAngularVelocity: 260,
};

function ensureShapePattern() {
  if (!shapeSvg || shapeSvg.querySelector("#shape-pixel-fill")) return;
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <pattern id="shape-pixel-fill" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect class="shape-pixel-fill-base" width="8" height="8"></rect>
      <path class="shape-pixel-fill-grid" d="M0 0H8M0 0V8M4 0V8M0 4H8"></path>
    </pattern>
  `;
  shapeSvg.prepend(defs);
}

function buildShapeField() {
  if (!shapeField || !shapeSvg) return;
  const rect = shapeField.getBoundingClientRect();
  shapeState.width = rect.width;
  shapeState.height = rect.height;
  shapeSvg.setAttribute("viewBox", `0 0 ${shapeState.width} ${shapeState.height}`);
  ensureShapePattern();
  shapeState.objects.forEach((object) => {
    object.x = Math.min(Math.max(object.x, object.radius), shapeState.width - object.radius);
    object.y = Math.min(Math.max(object.y, object.radius), shapeState.height - object.radius);
  });
}

function getShapePoint(event) {
  const rect = shapeField.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function beginShapeDraw(event) {
  if (!shapeField || !shapeSvg) return;
  shapeState.drawing = true;
  shapeState.points = [getShapePoint(event)];
  shapeState.trace = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  shapeState.trace.classList.add("shape-trace");
  shapeSvg.append(shapeState.trace);
  shapeField.setPointerCapture(event.pointerId);
}

function updateShapeDraw(event) {
  if (!shapeState.drawing || !shapeState.trace) return;
  shapeState.points.push(getShapePoint(event));
  shapeState.trace.setAttribute("points", shapeState.points.map((point) => `${point.x},${point.y}`).join(" "));
}

function getShapeBounds(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function getPointLineDistance(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) return Math.hypot(point.x - start.x, point.y - start.y);
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
}

function simplifyShapePoints(points, tolerance) {
  if (points.length <= 2) return points;
  let farthestIndex = 0;
  let farthestDistance = 0;
  const start = points[0];
  const end = points[points.length - 1];

  for (let index = 1; index < points.length - 1; index += 1) {
    const distance = getPointLineDistance(points[index], start, end);
    if (distance > farthestDistance) {
      farthestDistance = distance;
      farthestIndex = index;
    }
  }

  if (farthestDistance <= tolerance) return [start, end];
  const before = simplifyShapePoints(points.slice(0, farthestIndex + 1), tolerance);
  const after = simplifyShapePoints(points.slice(farthestIndex), tolerance);
  return before.slice(0, -1).concat(after);
}

function getConvexHull(points) {
  const unique = [...new Map(points.map((point) => [`${Math.round(point.x * 10)},${Math.round(point.y * 10)}`, point])).values()]
    .sort((a, b) => a.x - b.x || a.y - b.y);
  if (unique.length <= 3) return unique;

  const cross = (origin, a, b) => (a.x - origin.x) * (b.y - origin.y) - (a.y - origin.y) * (b.x - origin.x);
  const lower = [];
  unique.forEach((point) => {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  });

  const upper = [];
  [...unique].reverse().forEach((point) => {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  });

  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function getHullCorners(points, tolerance) {
  const hull = getConvexHull(points);
  if (hull.length <= 3) return hull;
  const closedHull = hull.concat(hull[0]);
  const simplified = simplifyShapePoints(closedHull, tolerance);
  const corners = simplified.slice(0, -1);
  return corners.length >= 3 ? corners : hull;
}

function getPolygonArea(points) {
  if (points.length < 3) return 0;
  return Math.abs(points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0)) / 2;
}

function getShapeKind(points, width, height) {
  if (width > height * 1.45 || height > width * 1.45) return "rect";
  const bounds = getShapeBounds(points);
  const centerX = bounds.minX + width / 2;
  const centerY = bounds.minY + height / 2;
  const boxArea = Math.max(width * height, 1);
  const hull = getConvexHull(points);
  const hullAreaRatio = getPolygonArea(hull) / boxArea;
  const corners = getHullCorners(points, Math.max(width, height) * 0.11);
  const radii = points.map((point) => Math.hypot(point.x - centerX, point.y - centerY));
  const averageRadius = radii.reduce((sum, radius) => sum + radius, 0) / Math.max(radii.length, 1);
  const radiusVariance = radii.reduce((sum, radius) => sum + Math.abs(radius - averageRadius), 0) / Math.max(radii.length, 1);
  const circularity = averageRadius ? radiusVariance / averageRadius : 1;

  if (corners.length === 3 || (hullAreaRatio < 0.68 && corners.length <= 5)) return "triangle";
  if (corners.length === 4 && hullAreaRatio > 0.82) return "rect";
  if (hullAreaRatio > 0.88 && circularity > 0.18) return "rect";
  if (points.length > 8 && circularity < 0.26 && hullAreaRatio < 0.86) return "ellipse";
  return "ellipse";
}

function createShapeElement(kind, width, height) {
  const element = document.createElementNS(
    "http://www.w3.org/2000/svg",
    kind === "triangle" ? "polygon" : kind === "rect" ? "rect" : "ellipse"
  );
  element.classList.add("shape-object");
  element.setAttribute("fill", "url(#shape-pixel-fill)");

  if (kind === "triangle") {
    element.setAttribute(
      "points",
      `0,${-height / 2} ${width / 2},${height / 2} ${-width / 2},${height / 2}`
    );
  } else if (kind === "rect") {
    element.setAttribute("x", -width / 2);
    element.setAttribute("y", -height / 2);
    element.setAttribute("width", width);
    element.setAttribute("height", height);
  } else {
    element.setAttribute("cx", 0);
    element.setAttribute("cy", 0);
    element.setAttribute("rx", width / 2);
    element.setAttribute("ry", height / 2);
  }

  return element;
}

function renderShapeObject(object) {
  object.element.setAttribute(
    "transform",
    `translate(${object.x} ${object.y}) rotate(${object.angle})`
  );
}

function addShapeObject(points) {
  const bounds = getShapeBounds(points);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  if (width <= 12 || height <= 12) return;

  const kind = getShapeKind(points, width, height);
  const element = createShapeElement(kind, width, height);
  const object = {
    element,
    kind,
    x: bounds.minX + width / 2,
    y: bounds.minY + height / 2,
    vx: (Math.random() - 0.5) * 60,
    vy: -80,
    width,
    height,
    radius: Math.max(width, height) / 2,
    angle: 0,
    angularVelocity: (Math.random() - 0.5) * 90,
  };

  shapeSvg.append(element);
  shapeState.objects.push(object);
  if (shapeState.objects.length > 14) {
    const removed = shapeState.objects.shift();
    removed.element.remove();
  }
  renderShapeObject(object);
}

function endShapeDraw(event) {
  if (!shapeState.drawing) return;
  shapeState.drawing = false;
  shapeState.trace?.remove();
  addShapeObject(shapeState.points);
  shapeState.points = [];
  if (shapeField?.hasPointerCapture(event.pointerId)) shapeField.releasePointerCapture(event.pointerId);
}

function resolveShapeCollisions() {
  for (let index = 0; index < shapeState.objects.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < shapeState.objects.length; nextIndex += 1) {
      const a = shapeState.objects[index];
      const b = shapeState.objects[nextIndex];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 1;
      const minimumDistance = (a.radius + b.radius) * 0.82;
      if (distance >= minimumDistance) continue;

      const normalX = dx / distance;
      const normalY = dy / distance;
      const overlap = minimumDistance - distance;
      a.x -= normalX * overlap * 0.5;
      a.y -= normalY * overlap * 0.5;
      b.x += normalX * overlap * 0.5;
      b.y += normalY * overlap * 0.5;

      const relativeVelocityX = b.vx - a.vx;
      const relativeVelocityY = b.vy - a.vy;
      const separatingVelocity = relativeVelocityX * normalX + relativeVelocityY * normalY;
      if (separatingVelocity > 0) continue;

      const impulse = -(1 + 0.78) * separatingVelocity / 2;
      a.vx -= impulse * normalX;
      a.vy -= impulse * normalY;
      b.vx += impulse * normalX;
      b.vy += impulse * normalY;
      const tangentSpeed = relativeVelocityX * -normalY + relativeVelocityY * normalX;
      const spin = Math.max(Math.min((impulse * 0.9 + tangentSpeed * 0.18), 85), -85);
      a.angularVelocity = Math.max(Math.min(a.angularVelocity - spin, shapeState.maxAngularVelocity), -shapeState.maxAngularVelocity);
      b.angularVelocity = Math.max(Math.min(b.angularVelocity + spin, shapeState.maxAngularVelocity), -shapeState.maxAngularVelocity);
    }
  }
}

function animateShapeField(time = performance.now()) {
  if (!shapeField || !shapeSvg || !shapeAnimationStarted) return;
  const delta = Math.min((time - shapeState.previousTime) / 1000, 0.032);
  shapeState.previousTime = time;

  shapeState.objects.forEach((object) => {
    object.vy += shapeState.gravity * delta;
    object.vx *= shapeState.friction;
    object.vy *= 0.999;
    object.x += object.vx * delta;
    object.y += object.vy * delta;
    object.angle += object.angularVelocity * delta;
    object.angularVelocity *= shapeState.angularFriction;
    object.angularVelocity = Math.max(
      Math.min(object.angularVelocity, shapeState.maxAngularVelocity),
      -shapeState.maxAngularVelocity
    );

    if (object.x < object.radius) {
      object.x = object.radius;
      object.vx = Math.abs(object.vx) * shapeState.bounce;
      object.angularVelocity += object.vy * 0.05;
    } else if (object.x > shapeState.width - object.radius) {
      object.x = shapeState.width - object.radius;
      object.vx = -Math.abs(object.vx) * shapeState.bounce;
      object.angularVelocity -= object.vy * 0.05;
    }

    if (object.y < object.radius) {
      object.y = object.radius;
      object.vy = Math.abs(object.vy) * shapeState.bounce;
    } else if (object.y > shapeState.height - object.radius) {
      object.y = shapeState.height - object.radius;
      object.vy = -Math.abs(object.vy) * shapeState.bounce;
      object.vx *= shapeState.floorFriction;
      object.angularVelocity *= shapeState.angularRestFriction;
      if (Math.abs(object.vy) < 34) object.vy = 0;
    }

    if (object.vy === 0 && Math.abs(object.vx) < 22) {
      object.angularVelocity *= shapeState.angularRestFriction;
      if (Math.abs(object.angularVelocity) < 4) object.angularVelocity = 0;
    }
  });

  resolveShapeCollisions();
  shapeState.objects.forEach(renderShapeObject);
  window.requestAnimationFrame(animateShapeField);
}

function initializeShapeField() {
  if (!shapeField || !shapeSvg || shapeAnimationStarted) return;
  shapeAnimationStarted = true;
  buildShapeField();
  shapeState.previousTime = performance.now();
  shapeField.addEventListener("pointerdown", beginShapeDraw);
  shapeField.addEventListener("pointermove", updateShapeDraw);
  shapeField.addEventListener("pointerup", endShapeDraw);
  shapeField.addEventListener("pointercancel", endShapeDraw);
  window.requestAnimationFrame(animateShapeField);
}

function initializeShapePreviewFields() {
  document.querySelectorAll(".shape-field[data-shape-mode='preview']").forEach((previewField) => {
    const previewSvg = previewField.querySelector(".shape-svg");
    if (!previewSvg || previewField.dataset.shapePreviewReady === "true") return;
    previewField.dataset.shapePreviewReady = "true";

    const previewState = {
      width: 0,
      height: 0,
      objects: [],
      previousTime: performance.now(),
      nextDrawTime: performance.now() + 260,
      drawIndex: 0,
      shapesSinceReset: 0,
      clearing: false,
      activeDemo: null,
      gravity: 1320,
      bounce: 0.58,
      friction: 0.992,
      floorFriction: 0.78,
      angularFriction: 0.968,
      angularRestFriction: 0.84,
      maxAngularVelocity: 250,
      resetAfterShapes: 5,
    };
    const demos = [
      {
        kind: "rect",
        points: [
          [0.58, 0.2],
          [0.79, 0.2],
          [0.8, 0.41],
          [0.58, 0.42],
          [0.58, 0.2],
        ],
        vx: -72,
        vy: -120,
        spin: 82,
      },
      {
        kind: "ellipse",
        points: Array.from({ length: 31 }, (_, index) => {
          const angle = (index / 30) * Math.PI * 2 - Math.PI * 0.62;
          return [
            0.42 + Math.cos(angle) * 0.13 + Math.sin(angle * 3) * 0.01,
            0.27 + Math.sin(angle) * 0.12 + Math.cos(angle * 2) * 0.008,
          ];
        }),
        vx: 58,
        vy: -100,
        spin: -68,
      },
      {
        kind: "triangle",
        points: [
          [0.2, 0.22],
          [0.35, 0.48],
          [0.09, 0.48],
          [0.2, 0.22],
        ],
        vx: 88,
        vy: -112,
        spin: -94,
      },
    ];

    function ensurePreviewPattern() {
      if (previewSvg.querySelector("#shape-pixel-fill")) return;
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.innerHTML = `
        <pattern id="shape-pixel-fill" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect class="shape-pixel-fill-base" width="8" height="8"></rect>
          <path class="shape-pixel-fill-grid" d="M0 0H8M0 0V8M4 0V8M0 4H8"></path>
        </pattern>
      `;
      previewSvg.prepend(defs);
    }

    function scaleDemoPoints(points) {
      return points.map(([x, y]) => ({
        x: x * previewState.width,
        y: y * previewState.height,
      }));
    }

    function resizePreview() {
      const rect = previewField.getBoundingClientRect();
      previewState.width = rect.width || 360;
      previewState.height = rect.height || 360;
      previewSvg.setAttribute("viewBox", `0 0 ${previewState.width} ${previewState.height}`);
      ensurePreviewPattern();
      previewState.objects.forEach((object) => {
        object.x = Math.min(Math.max(object.x, object.radius), previewState.width - object.radius);
        object.y = Math.min(Math.max(object.y, object.radius), previewState.height - object.radius);
      });
    }

    function removePreviewFallback() {
      previewSvg.querySelectorAll(".shape-preview-fallback").forEach((element) => element.remove());
    }

    function createPreviewObject(demo) {
      const points = scaleDemoPoints(demo.points);
      const bounds = getShapeBounds(points);
      const width = Math.max(bounds.maxX - bounds.minX, previewState.width * 0.12);
      const height = Math.max(bounds.maxY - bounds.minY, previewState.height * 0.12);
      const element = createShapeElement(demo.kind, width, height);
      const object = {
        element,
        kind: demo.kind,
        x: bounds.minX + width / 2,
        y: bounds.minY + height / 2,
        vx: demo.vx,
        vy: demo.vy,
        width,
        height,
        radius: Math.max(width, height) / 2,
        angle: 0,
        angularVelocity: demo.spin,
      };
      previewSvg.append(element);
      previewState.objects.push(object);
      previewState.shapesSinceReset += 1;
      renderShapeObject(object);
    }

    function resetPreviewPile(time) {
      if (previewState.clearing) return;
      previewState.clearing = true;
      previewState.objects.forEach((object) => object.element.classList.add("is-clearing"));
      window.setTimeout(() => {
        previewState.objects.forEach((object) => object.element.remove());
        previewState.objects = [];
        previewState.shapesSinceReset = 0;
        previewState.drawIndex = 0;
        previewState.nextDrawTime = performance.now() + 360;
        previewState.clearing = false;
      }, 320);
    }

    function startDemoDraw(time) {
      const demo = demos[previewState.drawIndex % demos.length];
      const points = scaleDemoPoints(demo.points);
      const trace = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      trace.classList.add("shape-trace", "shape-preview-live-trace");
      previewSvg.append(trace);
      previewState.activeDemo = {
        demo,
        points,
        trace,
        startedAt: time,
        duration: demo.kind === "ellipse" ? 1040 : 820,
      };
      previewState.drawIndex += 1;
    }

    function updateDemoDraw(time) {
      if (!previewState.activeDemo) {
        if (
          previewState.shapesSinceReset >= previewState.resetAfterShapes &&
          time >= previewState.nextDrawTime
        ) {
          resetPreviewPile(time);
          return;
        }
        if (!previewState.clearing && time >= previewState.nextDrawTime) startDemoDraw(time);
        return;
      }

      const active = previewState.activeDemo;
      const progress = Math.min((time - active.startedAt) / active.duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2.4);
      const pointCount = Math.max(2, Math.ceil(active.points.length * eased));
      active.trace.setAttribute("points", active.points.slice(0, pointCount).map((point) => `${point.x},${point.y}`).join(" "));

      if (progress >= 1) {
        active.trace.classList.add("is-resolving");
        window.setTimeout(() => active.trace.remove(), 140);
        createPreviewObject(active.demo);
        previewState.activeDemo = null;
        previewState.nextDrawTime = time + (
          previewState.shapesSinceReset >= previewState.resetAfterShapes ? 1220 : 760
        );
      }
    }

    function resolvePreviewCollisions() {
      for (let index = 0; index < previewState.objects.length; index += 1) {
        for (let nextIndex = index + 1; nextIndex < previewState.objects.length; nextIndex += 1) {
          const a = previewState.objects[index];
          const b = previewState.objects[nextIndex];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distance = Math.hypot(dx, dy) || 1;
          const minimumDistance = (a.radius + b.radius) * 0.82;
          if (distance >= minimumDistance) continue;

          const normalX = dx / distance;
          const normalY = dy / distance;
          const overlap = minimumDistance - distance;
          a.x -= normalX * overlap * 0.5;
          a.y -= normalY * overlap * 0.5;
          b.x += normalX * overlap * 0.5;
          b.y += normalY * overlap * 0.5;

          const relativeVelocityX = b.vx - a.vx;
          const relativeVelocityY = b.vy - a.vy;
          const separatingVelocity = relativeVelocityX * normalX + relativeVelocityY * normalY;
          if (separatingVelocity > 0) continue;

          const impulse = -(1 + 0.68) * separatingVelocity / 2;
          a.vx -= impulse * normalX;
          a.vy -= impulse * normalY;
          b.vx += impulse * normalX;
          b.vy += impulse * normalY;
          const tangentSpeed = relativeVelocityX * -normalY + relativeVelocityY * normalX;
          const spin = Math.max(Math.min((impulse * 0.82 + tangentSpeed * 0.16), 78), -78);
          a.angularVelocity = Math.max(Math.min(a.angularVelocity - spin, previewState.maxAngularVelocity), -previewState.maxAngularVelocity);
          b.angularVelocity = Math.max(Math.min(b.angularVelocity + spin, previewState.maxAngularVelocity), -previewState.maxAngularVelocity);
        }
      }
    }

    function animatePreview(time = performance.now()) {
      const delta = Math.min((time - previewState.previousTime) / 1000, 0.032);
      previewState.previousTime = time;
      updateDemoDraw(time);

      previewState.objects.forEach((object) => {
        object.vy += previewState.gravity * delta;
        object.vx *= previewState.friction;
        object.vy *= 0.999;
        object.x += object.vx * delta;
        object.y += object.vy * delta;
        object.angle += object.angularVelocity * delta;
        object.angularVelocity *= previewState.angularFriction;
        object.angularVelocity = Math.max(
          Math.min(object.angularVelocity, previewState.maxAngularVelocity),
          -previewState.maxAngularVelocity
        );

        if (object.x < object.radius) {
          object.x = object.radius;
          object.vx = Math.abs(object.vx) * previewState.bounce;
          object.angularVelocity += object.vy * 0.04;
        } else if (object.x > previewState.width - object.radius) {
          object.x = previewState.width - object.radius;
          object.vx = -Math.abs(object.vx) * previewState.bounce;
          object.angularVelocity -= object.vy * 0.04;
        }

        if (object.y < object.radius) {
          object.y = object.radius;
          object.vy = Math.abs(object.vy) * previewState.bounce;
        } else if (object.y > previewState.height - object.radius) {
          object.y = previewState.height - object.radius;
          object.vy = -Math.abs(object.vy) * previewState.bounce;
          object.vx *= previewState.floorFriction;
          object.angularVelocity *= previewState.angularRestFriction;
          if (Math.abs(object.vy) < 30) object.vy = 0;
        }

        if (object.vy === 0 && Math.abs(object.vx) < 20) {
          object.angularVelocity *= previewState.angularRestFriction;
          if (Math.abs(object.angularVelocity) < 4) object.angularVelocity = 0;
        }
      });

      resolvePreviewCollisions();
      previewState.objects.forEach(renderShapeObject);
      window.requestAnimationFrame(animatePreview);
    }

    removePreviewFallback();
    resizePreview();
    window.addEventListener("resize", resizePreview);
    window.requestAnimationFrame(animatePreview);
  });
}

window.addEventListener("resize", () => {
  syncVisualViewportWidth();
  scheduleMarqueeFill();
  syncPuckStateFromDom();
  drawLineFieldIfLayoutChanged();
  buildShapeField();
  updateHeaderScrollState();
  stabilizeMobileDropCaps();
});
window.visualViewport?.addEventListener("resize", () => {
  syncVisualViewportWidth();
  scheduleMarqueeFill();
  updateHeaderScrollState();
});
window.visualViewport?.addEventListener("scroll", updateHeaderScrollState, { passive: true });
window.addEventListener("scroll", requestHeaderScrollUpdate, { passive: true });

resetInitialScrollPosition();
syncVisualViewportWidth();
fillMarquees();
initializeDataRail();
initializePalette();
hydrateProjectPage();
initializeSiteMenu();
hydrateSecondaryProjectPreviews();
initializePuckLottieIcons();
initializePuckDragging();
initializeLineField();
initializeShapeField();
initializeShapePreviewFields();
updateHeaderScrollState();
revealHomePucks();
initializePlaygroundTypeLabels();
window.setInterval(updateDataRail, 1000);
document.fonts?.ready.then(() => {
  fillMarquees();
  updateHeaderScrollState();
  syncPuckStateFromDom();
  drawLineFieldIfLayoutChanged();
  stabilizeMobileDropCaps();
});
window.addEventListener("load", () => {
  fillMarquees();
  syncPuckStateFromDom();
  drawLineFieldIfLayoutChanged();
  updateHeaderScrollState();
  stabilizeMobileDropCaps();
});
window.addEventListener("pageshow", (event) => {
  if (!field) return;
  if (event.persisted || window.matchMedia("(max-width: 700px)").matches) {
    window.setTimeout(resetMobilePuckLayoutFromCss, 0);
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    window.setTimeout(resetMobilePuckLayoutFromCss, 0);
  }
});
window.setTimeout(() => document.body.classList.remove("palette-enter"), 1020);
