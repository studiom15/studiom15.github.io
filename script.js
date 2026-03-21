gsap.registerPlugin(ScrollTrigger);

/* ================================================
   1. FILM GRAIN — animated canvas noise overlay
================================================ */
(function () {
    const canvas = document.getElementById('grain-canvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function renderGrain() {
        const w = canvas.width;
        const h = canvas.height;
        const imageData = ctx.createImageData(w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const v = Math.random() * 255 | 0;
            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
            data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        requestAnimationFrame(renderGrain);
    }
    renderGrain();
})();

/* ================================================
   2. MOUSE PARALLAX — background drifts with cursor
================================================ */
(function () {
    const bg = document.getElementById('hero-bg');
    const hero = document.querySelector('.hero');
    const DEPTH = 22;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width * 2 - 1;
        const ny = (e.clientY - rect.top) / rect.height * 2 - 1;
        targetX = nx * DEPTH;
        targetY = ny * DEPTH;
    });

    hero.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
    });

    (function tick() {
        currentX += (targetX - currentX) * 0.06;
        currentY += (targetY - currentY) * 0.06;
        bg.style.transform = `translate(${currentX}px, ${currentY}px)`;
        requestAnimationFrame(tick);
    })();
})();

/* ================================================
   3. SVG LIVE TRACE — stroke-dashoffset draw-on
================================================ */
(function () {
    const svg = document.getElementById('drawing-svg');
    if (!svg) return;

    const paths = Array.from(svg.querySelectorAll('.draw-path'));
    const n = paths.length;
    const START = 1.1;
    const SPAN = 3.6;

    paths.forEach((path, i) => {
        let len = 100;
        try { len = path.getTotalLength(); } catch (e) {}

        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;

        const staggerDelay = START + (i / n) * SPAN * 0.78;
        const drawDuration = Math.max(0.25, Math.min(0.9, len / 500));

        gsap.to(path, {
            strokeDashoffset: 0,
            duration: drawDuration,
            delay: staggerDelay,
            ease: 'power1.inOut'
        });
    });

    gsap.to('#hero-illustration', {
        y: -6,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: START + SPAN + 0.4
    });
})();

/* ================================================
   4. HERO ANIMATIONS — on load
================================================ */
gsap.to("#site-header", { opacity: 1, duration: 1, delay: 0.4 });

gsap.from(gsap.utils.toArray(".hero-content .word"), {
    y: 50, opacity: 0, filter: "blur(12px)",
    duration: 1.0, stagger: 0.06, ease: "power3.out", delay: 0.6
});

/* ================================================
   5. SCROLL ANIMATIONS — information section
================================================ */
function blurReveal(selector, trigger, start = "top 85%", end = "top 40%") {
    const words = gsap.utils.toArray(selector + " .word");
    if (!words.length) return;
    gsap.fromTo(words,
        { y: 50, opacity: 0, filter: "blur(10px)" },
        {
            y: 0, opacity: 1, filter: "blur(0px)", stagger: 0.045, ease: "power2.out",
            scrollTrigger: { trigger: trigger, start: start, end: end, scrub: 0.8 }
        }
    );
}

blurReveal(".intro-text", ".intro-text", "top 85%", "top 35%");

gsap.fromTo(".details-grid p",
    { y: 30, opacity: 0 },
    {
        y: 0, opacity: 1, stagger: 0.15, ease: "power2.out",
        scrollTrigger: { trigger: ".details-grid", start: "top 88%", end: "top 55%", scrub: 0.8 }
    }
);

/* ================================================
   6. ABOUT SECTION — scroll-triggered animations
================================================ */

// Title words
blurReveal(".page-title", ".about-section", "top 80%", "top 40%");

// Portrait
gsap.fromTo(".portrait-wrap",
    { opacity: 0, y: 16 },
    {
        opacity: 1, y: 0, duration: 0.85, ease: "power2.out",
        scrollTrigger: { trigger: ".col-bio", start: "top 82%" }
    }
);

// Bio paragraphs
gsap.fromTo(".bio-block p",
    { y: 18, opacity: 0 },
    {
        y: 0, opacity: 1, stagger: 0.13, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: ".bio-block", start: "top 85%" }
    }
);

// Timeline rows — staggered bottom-to-top reveal (matches original about.html)
const rows = gsap.utils.toArray(".timeline-row");
const numRows = rows.length;
const ROW_STAGGER = 0.32;
const ROW_DURATION = 0.8;
const BASE_DELAY = 0;

// Rows start hidden (opacity:0 set in CSS); reverse so oldest fades in first,
// newest last — giving a bottom-to-top build effect.
const reversedRows = [...rows].reverse();

ScrollTrigger.create({
    trigger: "#timeline",
    start: "top 85%",
    once: true,
    onEnter: () => {
        reversedRows.forEach((row, i) => {
            gsap.fromTo(row,
                { y: 16, opacity: 0, filter: "blur(7px)" },
                {
                    y: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                    duration: ROW_DURATION,
                    ease: "power2.out",
                    delay: BASE_DELAY + i * ROW_STAGGER
                }
            );
        });

        // Spine grows upward across the same window the rows animate in
        const spineDuration = ROW_STAGGER * numRows + ROW_DURATION;
        gsap.to("#spine", {
            scaleY: 1,
            duration: spineDuration,
            ease: "power2.inOut",
            delay: BASE_DELAY,
            transformOrigin: "bottom center"
        });
    }
});

/* ================================================
   7. PROJECT CARDS — scroll-triggered
================================================ */
gsap.fromTo(".project-card",
    { y: 60, opacity: 0 },
    {
        y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: ".project-grid", start: "top 85%" }
    }
);

/* ================================================
   8. PLAY SECTION — scroll-triggered
================================================ */
gsap.fromTo(".play-feature",
    { y: 40, opacity: 0 },
    {
        y: 0, opacity: 1, duration: 0.9, ease: "power2.out",
        scrollTrigger: { trigger: ".play-feature", start: "top 85%" }
    }
);

gsap.fromTo(".play-card",
    { y: 40, opacity: 0 },
    {
        y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: ".play-secondary", start: "top 85%" }
    }
);