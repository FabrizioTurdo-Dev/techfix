
/* ── 1. WHATSAPP LINK DINÁMICO ── */
const WA_NUMBER = '5491154922800';
const WA_DEFAULT_MSG = encodeURIComponent('Hola TechFix, necesito servicio técnico a domicilio. ¿Cuándo pueden venir?');

function buildWaLink(msg) {
    return `https://wa.me/${WA_NUMBER}?text=${msg || WA_DEFAULT_MSG}`;
}

// Asegura que todos los botones de CTA apunten al número correcto
document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
    const url = new URL(el.href);
    if (!url.pathname.includes(WA_NUMBER)) {
        el.href = buildWaLink();
    }
});

/* ── 2. HEADER SCROLL ── */
const header = document.getElementById('main-header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── 3. HAMBURGER MENU ── */
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');

hamburgerBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburgerBtn.classList.toggle('open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Cerrar al hacer click en un enlace del menú mobile
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburgerBtn.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

/* ── 4. SCROLL REVEAL ── */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));

/* ── 5. PROGRESS BARS ANIMATION ON SCROLL ── */
const progressObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.progress-fill').forEach(bar => {
                    bar.style.animation = 'none';
                    // Trigger reflow
                    void bar.offsetWidth;
                    bar.style.animation = 'fillBar 1.8s ease forwards';
                });
                progressObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.3 }
);

document.querySelectorAll('.pc-card-main').forEach(el => progressObserver.observe(el));

/* ── 6. SMOOTH SCROLL (fallback para Safari antiguo) ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* ── 7. STAT COUNTER ANIMATION ── */
function animateCounter(el, target, suffix, duration = 1600) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            el.textContent = target + suffix;
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(start) + suffix;
        }
    }, 16);
}

// Activar contadores cuando la barra de stats sea visible
const statsSection = document.getElementById('stats');
let statsAnimated = false;

const statsObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !statsAnimated) {
        statsAnimated = true;
        statsObserver.disconnect();
    }
}, { threshold: 0.5 });

if (statsSection) statsObserver.observe(statsSection);

// Medimos clicks en boton de WhatsApp

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    
    // Seleccionamos todos los enlaces que apuntan a WhatsApp
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
    
    whatsappLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Enviamos el evento a GA4
            gtag('event', 'click_whatsapp', {
                'event_category': 'Contact',
                'event_label': 'Boton WhatsApp',
                'location': link.id || 'floating_button' // Nos dice qué botón fue
            });
            console.log('Evento WhatsApp enviado: ' + (link.id || 'float'));
        });
    });
});