// ─── Canvas particle background ───────────────────────────────────────────────
const canvas = document.getElementById('bg');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = isMobile ? 40 : 120;

  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

// ─── Accessible project card flip effect ──────────────────────────────────
document.querySelectorAll('.flip-card').forEach(card => {
  const front = card.querySelector('.flip-card-front');
  const back = card.querySelector('.flip-card-back');
  const title = card.querySelector('h3')?.textContent.replace('↗', '').trim() || 'project';
  const frontControl = front?.querySelector('.flip-control');
  const backControl = back?.querySelector('.flip-control');
  const detailsId = `${card.id}-details`;

  if (back) back.id = detailsId;
  frontControl?.setAttribute('aria-controls', detailsId);
  frontControl?.setAttribute('aria-expanded', 'false');
  frontControl?.setAttribute('aria-label', `Show case study details for ${title}`);
  backControl?.setAttribute('aria-label', `Return to ${title} overview`);
  back?.setAttribute('aria-hidden', 'true');
  back?.querySelectorAll('a, button').forEach(element => {
    element.tabIndex = -1;
  });

  function setFlipped(isFlipped, moveFocus = false) {
    card.classList.toggle('flipped', isFlipped);
    frontControl?.setAttribute('aria-expanded', String(isFlipped));
    front?.setAttribute('aria-hidden', String(isFlipped));
    back?.setAttribute('aria-hidden', String(!isFlipped));

    front?.querySelectorAll('a, button').forEach(element => {
      element.tabIndex = isFlipped ? -1 : 0;
    });
    back?.querySelectorAll('a, button').forEach(element => {
      element.tabIndex = isFlipped ? 0 : -1;
    });

    if (moveFocus) {
      (isFlipped ? backControl : frontControl)?.focus();
    }
  }

  card.addEventListener('click', (e) => {
    const clickedLink = e.target.closest('a');
    const clickedControl = e.target.closest('.flip-control');

    if (clickedLink) {
      e.stopPropagation();
      return;
    }

    setFlipped(!card.classList.contains('flipped'), Boolean(clickedControl));
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && card.classList.contains('flipped')) {
      e.preventDefault();
      setFlipped(false, true);
    }
  });
});

// ─── Mobile hamburger menu ────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
      navLinks.classList.remove('mobile-open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }
  });
}

// ─── Cursor Spotlight Tracker (LERP) ───────────────────────────────────────
const cursorGlow = document.getElementById('cursor-glow');

if (cursorGlow && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  let mouseX = -500; // start off-screen
  let mouseY = -500;
  let glowX = mouseX;
  let glowY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Soft fade in on first movement
  let firstMove = true;
  window.addEventListener('mousemove', () => {
    if (firstMove) {
      cursorGlow.style.opacity = '1';
      firstMove = false;
    }
  }, { once: true });

  function updateGlowPosition() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;

    cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(updateGlowPosition);
  }
  updateGlowPosition();
}

// ─── Scroll Reveal via IntersectionObserver ─────────────────────────────────
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();

// ─── Card Interactive Hover Effects ─────────────────────────────────────────
document.querySelectorAll('.flip-card').forEach(card => {
  const front = card.querySelector('.flip-card-front');
  const back = card.querySelector('.flip-card-back');
  
  function handleMouseMove(e, element) {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    element.style.setProperty('--mouse-x', `${x}px`);
    element.style.setProperty('--mouse-y', `${y}px`);
  }

  if (front) {
    front.addEventListener('mousemove', (e) => handleMouseMove(e, front));
  }
  if (back) {
    back.addEventListener('mousemove', (e) => handleMouseMove(e, back));
  }
});
