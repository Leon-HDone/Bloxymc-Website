// ============================================================================
// INTERAKTIVE EFFEKTE UND ANIMATIONEN
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Glätte der Scrolling-Animation
    initSmoothScroll();
    
    // Parallax-Effekte
    initParallaxEffect();
    
    // Interaktive Button-Effekte
    initButtonEffects();
    
    // Scroll-Animationen
    initScrollAnimations();
    
    // Social Media Button Feedback
    initSocialButtons();
    
    // Live Spielerzahl laden
    updatePlayerCount();
    setInterval(updatePlayerCount, 5000); // Alle 5 Sekunden aktualisieren
});

// ============================================================================
// SMOOTH SCROLL
// ============================================================================

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================================================
// PARALLAX EFFECT
// ============================================================================

function initParallaxEffect() {
    const heroSection = document.getElementById('hero');
    const heroGlow = document.querySelector('.hero-glow');
    
    if (heroGlow) {
        window.addEventListener('mousemove', function(e) {
            if (window.innerHeight > 1000) {
                const x = (e.clientX / window.innerWidth) * 100;
                const y = (e.clientY / window.innerHeight) * 100;
                
                heroGlow.style.setProperty('--mouse-x', x + '%');
                heroGlow.style.setProperty('--mouse-y', y + '%');
                
                // Leichte 3D-Rotation basierend auf Mausbewegung
                const rotateX = (e.clientY - window.innerHeight / 2) / 20;
                const rotateY = (e.clientX - window.innerWidth / 2) / 20;
                
                heroSection.style.perspective = '1000px';
            }
        });
    }
}

// ============================================================================
// BUTTON EFFEKTE
// ============================================================================

function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn, .social-btn, .team-social-link');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
        
        // Ripple-Effekt beim Klick
        button.addEventListener('click', function(e) {
            createRipple(e, this);
        });
    });
}

function createRipple(event, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    // CSS für Ripple
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.5)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple-animation 0.6s ease-out';
    ripple.style.pointerEvents = 'none';
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// ============================================================================
// SCROLL ANIMATIONEN
// ============================================================================

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Optional: Observer entfernen nach Animation
                if (!entry.target.hasAttribute('data-observe-once')) {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Animiere alle Cards
    const cards = document.querySelectorAll('.info-card, .team-card, .social-btn');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });
    
    // Animation auf Intersection
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(styleSheet);
}

// ============================================================================
// SOCIAL MEDIA BUTTONS
// ============================================================================

function initSocialButtons() {
    const socialBtns = document.querySelectorAll('.social-btn');
    
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.getAttribute('data-platform');
            handleSocialClick(platform);
        });
        
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px) scale(1.08)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

function handleSocialClick(platform) {
    const urls = {
        discord: 'https://discord.gg/jsYNKcyNbH',
        tiktok: 'https://www.tiktok.com/@yourprofile',
        instagram: 'https://www.instagram.com/yourprofile',
        youtube: 'https://www.youtube.com/@yourprofile'
    };
    
    const url = urls[platform];
    if (url) {
        window.open(url, '_blank');
    }
}

// ============================================================================
// NAVBAR EFFEKT BEI SCROLL (OPTIONAL)
// ============================================================================

window.addEventListener('scroll', function() {
    const scrollTop = window.scrollY;
    
    // Fade-Out Hero auf Scroll
    const hero = document.getElementById('hero');
    if (hero) {
        const opacity = Math.max(0, 1 - scrollTop / 400);
        hero.style.opacity = opacity;
    }
});

// ============================================================================
// PARTICLE-EFFEKT (BONUS)
// ============================================================================

function createParticles() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 1.5;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Erstelle Particles
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Particles nur auf größeren Bildschirmen aktivieren
if (window.innerWidth > 768) {
    createParticles();
}

// ============================================================================
// LOADING ANIMATION
// ============================================================================

window.addEventListener('load', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.animation = `fadeInUp 0.8s ease-out ${index * 0.1}s backwards`;
    });
});

// ============================================================================
// LIVE SPIELERZAHL
// ============================================================================

function updatePlayerCount() {
    // Minecraft Server Status API - für bloxymc.de
    const serverAddress = '88.151.194.159:25565'; // Deine Server IP mit Port
    const apiUrl = `https://api.mcsrvstat.us/2/${serverAddress}`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const playerCount = data.players ? data.players.online : 0;
            const playerCountElement = document.getElementById('player-count');
            
            if (playerCountElement) {
                // Animiere die Zahlenänderung
                const oldCount = parseInt(playerCountElement.textContent);
                if (oldCount !== playerCount) {
                    playerCountElement.style.transition = 'color 0.3s ease';
                    playerCountElement.style.color = '#34d399';
                    setTimeout(() => {
                        playerCountElement.textContent = playerCount;
                    }, 150);
                    setTimeout(() => {
                        playerCountElement.style.color = '#60a5fa';
                    }, 300);
                }
            }
        })
        .catch(error => {
            console.log('Spielerzahl konnte nicht geladen werden:', error);
            // Fallback: Zeige alte Zahl
        });
}

// ============================================================================
// TICKET SYSTEM
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleTicketSubmit();
        });
    }
});

function handleTicketSubmit() {
    const form = document.getElementById('ticketForm');
    const name = document.getElementById('ticketName').value;
    const email = document.getElementById('ticketEmail').value;
    const category = document.getElementById('ticketCategory').value;
    const subject = document.getElementById('ticketSubject').value;
    const message = document.getElementById('ticketMessage').value;

    // Validierung
    if (!name || !email || !category || !subject || !message) {
        showTicketResponse('Bitte fülle alle Felder aus!', 'error');
        return;
    }

    // Email-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showTicketResponse('Bitte gib eine gültige E-Mail ein!', 'error');
        return;
    }

    // Ticket-Daten zusammenstellen
    const ticketData = {
        name: name,
        email: email,
        category: category,
        subject: subject,
        message: message,
        timestamp: new Date().toLocaleString('de-DE')
    };

    // Sende das Ticket per Email via FormSubmit API (kostenlos)
    sendTicketViaEmail(ticketData);
}

function sendTicketViaEmail(ticketData) {
    // Nutze FormSubmit.co - kostenloser Service für Form-Emails
    const formData = new FormData();
    formData.append('from_name', ticketData.name);
    formData.append('email', ticketData.email);
    formData.append('category', ticketData.category);
    formData.append('subject', ticketData.subject);
    formData.append('message', ticketData.message);
    formData.append('timestamp', ticketData.timestamp);

    // Ändere diese E-Mail zu deiner Support-Email
    const supportEmail = 'support@bloxymc.de'; // ← Deine Support-Email eintragen

    fetch(`https://formsubmit.co/${supportEmail}`, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            showTicketResponse('✅ Ticket erfolgreich erstellt! Wir melden uns bald bei dir.', 'success');
            document.getElementById('ticketForm').reset();
        } else {
            showTicketResponse('❌ Fehler beim Senden des Tickets. Bitte versuche es später erneut.', 'error');
        }
    })
    .catch(error => {
        console.error('Fehler:', error);
        showTicketResponse('❌ Fehler beim Verbinden. Bitte überprüfe deine Internetverbindung.', 'error');
    });
}

function showTicketResponse(message, type) {
    const responseElement = document.getElementById('ticketResponse');
    const responseText = document.getElementById('ticketResponseText');
    
    responseText.textContent = message;
    responseElement.style.display = 'block';
    
    // Ändere Farbe je nach Typ
    if (type === 'success') {
        responseElement.style.background = 'rgba(52, 211, 153, 0.15)';
        responseElement.style.borderColor = 'rgba(52, 211, 153, 0.3)';
        responseElement.style.color = '#34d399';
    } else {
        responseElement.style.background = 'rgba(239, 68, 68, 0.15)';
        responseElement.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        responseElement.style.color = '#ef4444';
    }
    
    // Verstecke nach 5 Sekunden
    setTimeout(() => {
        responseElement.style.display = 'none';
    }, 5000);
}

console.log('✨ Website geladen! Viel Spaß auf DeinServer.net');
