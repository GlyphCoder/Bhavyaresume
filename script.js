/* =========================================================
   Portfolio Script
   - Canvas particle background (replaces fog, low GPU cost)
   - AOS scroll animations
   - 3D card tilt on hover
   - Hero click scroll
   ========================================================= */

$(document).ready(function () {

    /* ── Fix page-refresh scroll-to-hash jump ── */
    if (window.location.hash) {
        history.replaceState(null, null, '');
        window.scrollTo(0, 0);
    }

    /* ── AOS: Scroll-triggered animations ── */
    AOS.init({
        duration: 850,
        once: false,
        mirror: true,
        offset: 80,
        easing: 'ease-out-quart',
        anchorPlacement: 'top-bottom',
    });

    /* ── Hero click → smooth scroll to About ── */
    $('.hero-content h1').on('click', function () {
        $('html, body').animate(
            { scrollTop: $('.about-section').offset().top - 60 },
            900,
            'swing'
        );
    });

    /* ── Init features ── */
    initParticleCanvas();
    initTiltCards();
});


/* =========================================================
   1. LIGHTWEIGHT PARTICLE / STAR BACKGROUND (Canvas)
      Uses requestAnimationFrame but is very CPU/GPU light:
      - no texture fetches, no filters
      - simple 2D canvas dots + slow drift
   ========================================================= */
function initParticleCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles;
    const COUNT = 130;           // dots on screen
    const MAX_DIST = 120;        // link distance
    const SPEED = 0.22;          // drift speed

    // Palette that suits the dark portfolio aesthetic
    const COLORS = [
        'rgba(99,179,237,',      // sky blue
        'rgba(159,122,234,',     // purple
        'rgba(100,210,255,',     // cyan
        'rgba(210,160,255,',     // lavender
        'rgba(255,255,255,',     // white
    ];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function makeParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            vx: (Math.random() - 0.5) * SPEED,
            vy: (Math.random() - 0.5) * SPEED,
            r: Math.random() * 2.2 + 0.6,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: Math.random() * 0.65 + 0.30,
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: COUNT }, makeParticle);
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Update positions
        for (let i = 0; i < COUNT; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < 0) p.x = W;
            if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H;
            if (p.y > H) p.y = 0;
        }

        // Draw connections
        for (let i = 0; i < COUNT; i++) {
            for (let j = i + 1; j < COUNT; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const a = (1 - dist / MAX_DIST) * 0.28;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(160,200,255,${a})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw dots
        for (let i = 0; i < COUNT; i++) {
            const p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }

    init();
    draw();

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 200);
    });
}


/* =========================================================
   2. 3-D CARD TILT ON HOVER
      Pure JS — no library. Adds realistic perspective tilt
      to any element with class .tilt-card.
      Works on both mouse (desktop) and is disabled on touch
      (mobile — preserves performance and avoids weirdness).
   ========================================================= */
function initTiltCards() {
    // Skip tilt on touch-primary devices
    if (window.matchMedia('(hover: none)').matches) return;

    const cards = document.querySelectorAll('.tilt-card');
    const TILT_STRENGTH = 12;       // max degrees
    const SCALE = 1.04;
    const PERSPECTIVE = 700;        // px

    // Inject shine overlay into each card
    cards.forEach(function (card) {
        // Ensure card has position so overlay works
        const style = getComputedStyle(card);
        if (style.position === 'static') card.style.position = 'relative';

        const shine = document.createElement('div');
        shine.className = 'tilt-shine';
        card.appendChild(shine);
    });

    function onMouseMove(e) {
        const card = this;
        const rect = card.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = e.clientX - cx;
        const dy   = e.clientY - cy;
        const rotY =  (dx / (rect.width  / 2)) * TILT_STRENGTH;
        const rotX = -(dy / (rect.height / 2)) * TILT_STRENGTH;

        card.style.transform =
            `perspective(${PERSPECTIVE}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${SCALE})`;

        // Move shine highlight
        const shine = card.querySelector('.tilt-shine');
        if (shine) {
            const px = ((e.clientX - rect.left) / rect.width)  * 100;
            const py = ((e.clientY - rect.top)  / rect.height) * 100;
            shine.style.background =
                `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.14) 0%, transparent 65%)`;
            shine.style.opacity = '1';
        }
    }

    function onMouseLeave() {
        const card = this;
        card.style.transition = 'transform 0.45s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease, border-color 0.35s ease';
        card.style.transform  = `perspective(${PERSPECTIVE}px) rotateX(0deg) rotateY(0deg) scale(1)`;

        const shine = card.querySelector('.tilt-shine');
        if (shine) shine.style.opacity = '0';

        // Remove the transition override after animation completes
        setTimeout(function () {
            card.style.transition = '';
        }, 450);
    }

    function onMouseEnter() {
        const card = this;
        // Disable slow CSS transition during active tilt for snappy response
        card.style.transition = 'box-shadow 0.35s ease, border-color 0.35s ease';
    }

    cards.forEach(function (card) {
        card.addEventListener('mouseenter', onMouseEnter);
        card.addEventListener('mousemove',  onMouseMove);
        card.addEventListener('mouseleave', onMouseLeave);
    });
}


/* =========================================================
   Additional fix: scroll-to-top on page refresh with hash
   ========================================================= */
window.addEventListener('load', function () {
    if (window.location.hash) {
        history.replaceState(null, null, '');
        window.scrollTo(0, 0);
    }
});
