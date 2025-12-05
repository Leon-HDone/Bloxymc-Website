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

    // Tip/Quote Widget initialisieren
    initTipWidget();
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
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
    
        // Limit DPR for performance on very high-DPI devices
        const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
        const ctx = canvas.getContext('2d');
        let particles = [];
        let supernovas = [];
        let galaxy;
        let shouldAnimate = true;

        function resizeCanvas() {
            canvas.width = Math.max(1, Math.floor(window.innerWidth * DPR));
            canvas.height = Math.max(1, Math.floor(window.innerHeight * DPR));
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            if (galaxy && galaxy.onResize) galaxy.onResize();
        }

        // debounce resize
        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resizeCanvas, 180);
        });

        // pause animation when tab is hidden
        document.addEventListener('visibilitychange', () => {
            shouldAnimate = !document.hidden;
            if (shouldAnimate) requestAnimationFrame(animate);
        });

        resizeCanvas();

        // Determine counts based on area and cap for performance
        function areaBasedCounts() {
            const area = window.innerWidth * window.innerHeight;
            // Increase particle cap so there are more moving specks
            const particleCount = Math.min(160, Math.max(18, Math.floor(area / 12000)));
            const starCount = Math.min(700, Math.max(200, Math.floor(area / 2500)));
            return { particleCount, starCount };
        }

        // Pre-render a star sprite for cheaper draws
        const starSprite = (function createStarSprite() {
            const s = document.createElement('canvas');
            const size = 32;
            s.width = size;
            s.height = size;
            const c = s.getContext('2d');
            const g = c.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
            g.addColorStop(0, 'rgba(255,255,255,1)');
            g.addColorStop(0.2, 'rgba(200,180,255,0.85)');
            g.addColorStop(0.4, 'rgba(130,90,240,0.5)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            c.fillStyle = g;
            c.fillRect(0, 0, size, size);
            return s;
        })();

        class Particle {
            constructor(w, h) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                // assign a layer: most are slow, some are fast tiny specks
                this.layer = Math.random() < 0.28 ? 'fast' : 'slow';
                const speedBase = this.layer === 'fast' ? 0.9 : 0.42;
                this.vx = (Math.random() - 0.5) * speedBase;
                this.vy = (Math.random() - 0.5) * speedBase;
                if (this.layer === 'fast') {
                    this.size = Math.random() * 1.2 + 0.2; // smaller
                    this.opacity = Math.random() * 0.7 + 0.2;
                } else {
                    this.size = Math.random() * 2.2 + 0.4; // slightly larger
                    this.opacity = Math.random() * 0.45 + 0.05;
                }
                const hue = 230 + Math.random() * 100; // cyan->purple
                this.color = `hsla(${hue}, 80%, 60%, ${this.opacity})`;
            }
            update(w, h) {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < -30) this.x = w + 30;
                if (this.x > w + 30) this.x = -30;
                if (this.y < -30) this.y = h + 30;
                if (this.y > h + 30) this.y = -30;
            }
            draw(ctx) {
                if (this.layer === 'fast') {
                    // draw tiny bright speck
                    ctx.fillStyle = `rgba(255,255,255,${Math.min(0.95, this.opacity)})`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, Math.max(0.6, this.size * 0.8), 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        class Supernova {
            constructor(w, h) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.maxR = 60 + Math.random() * 100;
                this.r = 0;
                this.life = 0;
                this.duration = 50 + Math.floor(Math.random() * 60);
                this.hue = 200 + Math.random() * 160;
            }
            update() {
                this.life++;
                this.r = easeOutQuad(this.life / this.duration) * this.maxR;
                return this.life > this.duration;
            }
            draw(ctx) {
                const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
                grd.addColorStop(0, `rgba(255,255,220,0.9)`);
                grd.addColorStop(0.2, `hsla(${this.hue}, 90%, 65%, 0.35)`);
                grd.addColorStop(0.6, `hsla(${this.hue}, 80%, 60%, 0.12)`);
                grd.addColorStop(1, `rgba(0,0,0,0)`);
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
            }
        }

        function easeOutQuad(t) { return t * (2 - t); }

        // Galaxy class will use the pre-rendered star sprite for performance
        class Galaxy {
            constructor(w, h) {
                this.centerX = w * 0.5;
                this.centerY = h * 0.45;
                this.maxR = Math.min(w, h) * 0.45;
                this.arms = 3;
                this.stars = [];
                this.rotation = 0;
                const sc = areaBasedCounts();
                this.starCount = sc.starCount;
                this.generateStars();
            }
            generateStars() {
                this.stars.length = 0;
                for (let i = 0; i < this.starCount; i++) {
                    const r = Math.pow(Math.random(), 1.1) * this.maxR;
                    const arm = i % this.arms;
                    const armAngle = (arm / this.arms) * Math.PI * 2;
                    const angle = armAngle + r * 0.016 + (Math.random() - 0.5) * 0.9;
                    const size = Math.random() * 1.4 + 0.2;
                    const hue = 260 + (Math.random() * 60 - 20);
                    const alpha = 0.5 + Math.random() * 0.9;
                    this.stars.push({ r, angle, size, hue, alpha });
                }
            }
            update() { this.rotation += 0.0009; }
            draw(ctx) {
                const cx = this.centerX; const cy = this.centerY;
                const coreR = this.maxR * 0.12;
                const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
                coreGrad.addColorStop(0, 'rgba(255,240,230,0.95)');
                coreGrad.addColorStop(0.2, 'rgba(236,72,153,0.25)');
                coreGrad.addColorStop(0.5, 'rgba(139,92,246,0.10)');
                coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = coreGrad;
                ctx.beginPath(); ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2); ctx.fill();

                // draw stars using sprite
                for (let i = 0; i < this.stars.length; i++) {
                    const s = this.stars[i];
                    const theta = s.angle + this.rotation + (s.r * 0.006);
                    const x = cx + Math.cos(theta) * s.r;
                    const y = cy + Math.sin(theta) * s.r;
                    const drawSize = Math.max(1, s.size * 3);
                    ctx.globalAlpha = Math.min(1, 0.8 * s.alpha);
                    ctx.drawImage(starSprite, x - drawSize/2, y - drawSize/2, drawSize, drawSize);
                    ctx.globalAlpha = 1;
                }
                ctx.globalCompositeOperation = 'source-over';
            }
            onResize() {
                this.centerX = canvas.width / DPR * 0.5;
                this.centerY = canvas.height / DPR * 0.45;
                this.maxR = Math.min(canvas.width / DPR, canvas.height / DPR) * 0.45;
                const sc = areaBasedCounts();
                this.starCount = sc.starCount;
                this.generateStars();
            }
        }

        // Initialize particles, galaxy and start animation
        (function init() {
            const counts = areaBasedCounts();
            particles = [];
            for (let i = 0; i < counts.particleCount; i++) particles.push(new Particle(window.innerWidth, window.innerHeight));
            supernovas = [];
            galaxy = new Galaxy(window.innerWidth, window.innerHeight);
        })();

        function maybeSpawnSupernova() { if (Math.random() < 0.006) supernovas.push(new Supernova(window.innerWidth, window.innerHeight)); }

        function animate() {
            if (!shouldAnimate) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(6,4,12,0.22)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            galaxy.update(); galaxy.draw(ctx);
            for (let i = 0; i < particles.length; i++) { particles[i].update(window.innerWidth, window.innerHeight); particles[i].draw(ctx); }
            for (let i = supernovas.length - 1; i >= 0; i--) { const s = supernovas[i]; const done = s.update(); s.draw(ctx); if (done) supernovas.splice(i,1); }
            maybeSpawnSupernova();
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class Supernova {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.maxR = 80 + Math.random() * 120;
            this.r = 0;
            this.life = 0;
            this.duration = 60 + Math.floor(Math.random() * 60);
            this.hue = 280 * Math.random() + 200; // range for vivid colors
        }
        update() {
            this.life++;
            this.r = easeOutQuad(this.life / this.duration) * this.maxR;
            return this.life > this.duration;
        }
        draw() {
            const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
            grd.addColorStop(0, `rgba(255,255,220,0.9)`);
            grd.addColorStop(0.2, `hsla(${this.hue}, 90%, 65%, 0.35)`);
            grd.addColorStop(0.6, `hsla(${this.hue}, 80%, 60%, 0.12)`);
            grd.addColorStop(1, `rgba(0,0,0,0)`);
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    function easeOutQuad(t) {
        return t * (2 - t);
    }
    
    /* Rotating Spiral Galaxy */
    class Galaxy {
        constructor() {
            this.centerX = canvas.width * 0.5;
            this.centerY = canvas.height * 0.45;
            this.maxR = Math.min(canvas.width, canvas.height) * 0.45;
            this.arms = 3;
            this.stars = [];
            this.rotation = 0;
            this.starCount = Math.max(300, Math.floor((canvas.width * canvas.height) / 2000));
            this.generateStars();
        }

        generateStars() {
            this.stars.length = 0;
            for (let i = 0; i < this.starCount; i++) {
                const r = Math.pow(Math.random(), 1.1) * this.maxR; // bias towards center
                const arm = i % this.arms;
                const armAngle = (arm / this.arms) * Math.PI * 2;
                // spiral twist: angle proportional to radius
                const angle = armAngle + r * 0.018 + (Math.random() - 0.5) * 0.8;
                const size = Math.random() * 1.6 + 0.2;
                const hue = 260 + (Math.random() * 60 - 20); // purple-cyan range
                const alpha = 0.5 + Math.random() * 0.9;
                this.stars.push({ r, angle, size, hue, alpha, arm });
            }
        }

        update() {
            // slow rotation
            this.rotation += 0.0009;
        }

        draw(ctx) {
            const cx = this.centerX;
            const cy = this.centerY;

            // draw glowing core
            const coreR = this.maxR * 0.12;
            const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
            coreGrad.addColorStop(0, 'rgba(255,240,230,0.95)');
            coreGrad.addColorStop(0.2, 'rgba(236,72,153,0.25)');
            coreGrad.addColorStop(0.5, 'rgba(139,92,246,0.10)');
            coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, coreR * 3, 0, Math.PI * 2);
            ctx.fill();

            // draw stars along spiral arms
            for (let i = 0; i < this.stars.length; i++) {
                const s = this.stars[i];
                const theta = s.angle + this.rotation + (s.r * 0.006); // twist
                const x = cx + Math.cos(theta) * s.r;
                const y = cy + Math.sin(theta) * s.r;

                // small glow per star
                ctx.beginPath();
                const grad = ctx.createRadialGradient(x, y, 0, x, y, s.size * 6 + 2);
                grad.addColorStop(0, `hsla(${s.hue}, 90%, 75%, ${0.8 * s.alpha})`);
                grad.addColorStop(0.4, `hsla(${s.hue}, 80%, 65%, ${0.28 * s.alpha})`);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.fillRect(x - s.size * 6, y - s.size * 6, s.size * 12, s.size * 12);

                // tiny core
                ctx.fillStyle = `hsla(${s.hue}, 90%, 85%, ${Math.min(1, 0.6 * s.alpha)})`;
                ctx.beginPath();
                ctx.arc(x, y, s.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalCompositeOperation = 'source-over';
        }

        onResize() {
            this.centerX = canvas.width * 0.5;
            this.centerY = canvas.height * 0.45;
            this.maxR = Math.min(canvas.width, canvas.height) * 0.45;
            this.starCount = Math.max(300, Math.floor((canvas.width * canvas.height) / 2000));
            this.generateStars();
        }
    }

    const galaxy = new Galaxy();
    
    // Erstelle Particles
    for (let i = 0; i < 60; i++) {
        particles.push(new Particle());
    }
    
    // gelegentlich Supernova erzeugen
    function maybeSpawnSupernova() {
        // seltene, zufällige Ereignisse
        if (Math.random() < 0.008) {
            supernovas.push(new Supernova());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // leichte Hintergrund Nebula-Schatten (subtile horizontale Streuung)
        ctx.fillStyle = 'rgba(6,4,12,0.22)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Galaxy draws behind particles
        galaxy.update();
        galaxy.draw(ctx);

        particles.forEach((particle) => {
            particle.update();
            particle.draw();
        });

        // update/draw supernovas
        for (let i = supernovas.length - 1; i >= 0; i--) {
            const s = supernovas[i];
            const done = s.update();
            s.draw();
            if (done) supernovas.splice(i, 1);
        }

        maybeSpawnSupernova();
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
// TIP / QUOTE WIDGET
// ============================================================================

const TIPS_AND_QUOTES = [
    "🪵 Nimm immer mindestens 20–30 Holz am Anfang mit – damit kommst du sehr weit!",
    "🍖 Verbessere schnell dein Essen: Brot → Steak → Goldene Karotten (beste Sättigung).",
    "🛡️ Nutze Schilde – sie blocken Creeper-Explosionen (wenn du weit genug weg bist).",
    "🛏️ Schlaf jede Nacht → sonst kommen Phantome, die nerven extrem.",
    "💧 Halte immer einen Wasser-Eimer dabei → Fall-Schaden verhindern, Lava blocken.",
    "💎 Farm dir früh Diamanten, aber: Bevor du stripminest → sichere erst Essen, Rüstung, Schwert und Schild.",
    "🔦 Räume deine Höhle immer mit Fackeln rechts auf → dann findest du wieder raus.",
    "🏠 Bau deine Base in Biome mit vielen Ressourcen: Plains, Taiga oder Küste.",
    "🌳 Plains → viel Platz. Taiga → schöne Atmosphäre. Küste → Wasser + Land.",
    "🎨 Benutze immer Farben, Tiefe (3D), Dachformen → wirkt viel schöner.",
    "✨ Kleine Details machen enorm viel aus: Laternen, Trapdoors, Zäune + Blätter.",
    "🛤️ Nutze Pfade aus Coarse Dirt / Gravel für bessere Base-Struktur.",
    "🔧 Erstelle dir eine Sortieranlage – spart SO viel Zeit bei der Lagerung!",
    "⚔️ Frühe Priorität: Holz → Stein → Eisen → Diamanten (in dieser Reihenfolge).",
    "🏗️ Besser eine kleine Base bauen, die schön aussieht, als 'ne große Betonkiste!",
];


let currentTipIndex = 0;

function initTipWidget() {
    const tipText = document.getElementById('tip-text');
    const tipNextBtn = document.getElementById('tip-next-btn');
    
    if (!tipText || !tipNextBtn) return;

    // Zeige den ersten Tipp
    displayTip(0);

    // Button-Listener
    tipNextBtn.addEventListener('click', () => {
        currentTipIndex = (currentTipIndex + 1) % TIPS_AND_QUOTES.length;
        displayTip(currentTipIndex);
    });

    // Auto-rotate every 8 seconds
    setInterval(() => {
        currentTipIndex = (currentTipIndex + 1) % TIPS_AND_QUOTES.length;
        displayTip(currentTipIndex);
    }, 8000);
}

function displayTip(index) {
    const tipText = document.getElementById('tip-text');
    const widget = document.getElementById('tip-widget');
    if (!tipText) return;

    // Fade-out Effekt
    tipText.style.opacity = '0.5';
    tipText.style.transform = 'translateY(5px)';

    setTimeout(() => {
        tipText.textContent = TIPS_AND_QUOTES[index];
        tipText.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        tipText.style.opacity = '1';
        tipText.style.transform = 'translateY(0)';
    }, 150);
}

// Visitor counter removed
 
console.log('✨ Website geladen! Viel Spaß auf DeinServer.net');
