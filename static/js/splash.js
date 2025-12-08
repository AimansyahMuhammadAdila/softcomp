// 🔥 ULTIMATE SPLASH SCREEN & EXTREME ANIMATIONS 🔥

// Splash Screen Controller
class SplashScreen {
    constructor() {
        this.createSplash();
        this.startAnimation();
    }

    createSplash() {
        const splash = document.createElement('div');
        splash.id = 'epicSplash';
        splash.innerHTML = `
            <div class="splash-content">
                <div class="logo-container">
                    <div class="rotating-ring ring-1"></div>
                    <div class="rotating-ring ring-2"></div>
                    <div class="rotating-ring ring-3"></div>
                    <div class="center-logo">
                        <div class="cow-icon">🐄</div>
                        <div class="dna-helix"></div>
                    </div>
                </div>
                <h1 class="splash-title">
                    <span class="letter">G</span>
                    <span class="letter">E</span>
                    <span class="letter">N</span>
                    <span class="letter">E</span>
                    <span class="letter">T</span>
                    <span class="letter">I</span>
                    <span class="letter">C</span>
                    <span class="letter"> </span>
                    <span class="letter">A</span>
                    <span class="letter">L</span>
                    <span class="letter">G</span>
                    <span class="letter">O</span>
                </h1>
                <div class="loading-container">
                    <div class="loading-text">INITIALIZING NEURAL NETWORK</div>
                    <div class="loading-bar-outer">
                        <div class="loading-bar-inner"></div>
                        <div class="loading-percentage">0%</div>
                    </div>
                    <div class="loading-status">LOADING QUANTUM ALGORITHMS...</div>
                </div>
                <div class="particle-burst"></div>
            </div>
        `;
        document.body.insertBefore(splash, document.body.firstChild);
    }

    startAnimation() {
        let progress = 0;
        const loadingBar = document.querySelector('.loading-bar-inner');
        const loadingPerc = document.querySelector('.loading-percentage');
        const loadingStatus = document.querySelector('.loading-status');

        const statuses = [
            'LOADING QUANTUM ALGORITHMS...',
            'INITIALIZING DNA SEQUENCER...',
            'CALIBRATING NEURAL NETWORKS...',
            'OPTIMIZING GENETIC PATTERNS...',
            'ACTIVATING AI PROTOCOLS...',
            'ESTABLISHING CONNECTIONS...',
            'READY TO LAUNCH!'
        ];

        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => this.closeSplash(), 500);
            }

            loadingBar.style.width = progress + '%';
            loadingPerc.textContent = Math.floor(progress) + '%';

            const statusIndex = Math.floor((progress / 100) * (statuses.length - 1));
            loadingStatus.textContent = statuses[statusIndex];

            // Create random particles
            this.createParticle();
        }, 200);
    }

    createParticle() {
        const container = document.querySelector('.particle-burst');
        if (!container) return;

        const particle = document.createElement('div');
        particle.className = 'splash-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;

        container.appendChild(particle);

        setTimeout(() => particle.remove(), 2000);
    }

    closeSplash() {
        const splash = document.getElementById('epicSplash');
        splash.classList.add('splash-closing');

        // Play epic sound
        this.playEpicSound();

        // Screen flash
        this.screenFlash();

        setTimeout(() => {
            splash.remove();
            document.body.classList.add('app-loaded');
            this.revealContent();
        }, 1000);
    }

    playEpicSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create a more complex sound
            const frequencies = [261.63, 329.63, 392.00, 523.25]; // C Major chord
            const gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            frequencies.forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                osc.connect(gainNode);
                osc.frequency.value = freq;
                osc.type = 'sine';
                osc.start(audioContext.currentTime + i * 0.05);
                osc.stop(audioContext.currentTime + 0.5);
            });
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    screenFlash() {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        document.body.appendChild(flash);

        setTimeout(() => flash.remove(), 500);
    }

    revealContent() {
        const container = document.querySelector('.container');
        container.style.animation = 'contentReveal 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';

        // Animate cards in sequence
        const cards = document.querySelectorAll('.glass-card');
        cards.forEach((card, i) => {
            setTimeout(() => {
                card.style.animation = `cardFlyIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`;
                card.style.opacity = '1';
            }, i * 150);
        });
    }
}

// 3D Tilt Effect on Cards
class TiltEffect {
    constructor() {
        this.initTilt();
    }

    initTilt() {
        const cards = document.querySelectorAll('.glass-card, .metric-card, .stat-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }
}

// Liquid Button Effect
class LiquidButton {
    constructor() {
        this.initLiquid();
    }

    initLiquid() {
        const startBtn = document.getElementById('startBtn');
        if (!startBtn) return;

        startBtn.addEventListener('mousemove', (e) => {
            const rect = startBtn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.className = 'liquid-ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            startBtn.appendChild(ripple);

            setTimeout(() => ripple.remove(), 1000);
        });
    }
}

// DNA Helix Animation
function createDNAHelix() {
    const container = document.querySelector('.dna-helix');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const pair = document.createElement('div');
        pair.className = 'dna-pair';
        pair.style.transform = `rotateY(${i * 18}deg) translateZ(50px)`;
        pair.style.animationDelay = `${i * 0.1}s`;
        container.appendChild(pair);
    }
}

// Meteor Shower Effect
class MeteorShower {
    constructor() {
        this.createMeteors();
    }

    createMeteors() {
        setInterval(() => {
            if (Math.random() > 0.7) {
                const meteor = document.createElement('div');
                meteor.className = 'meteor';
                meteor.style.left = Math.random() * 100 + '%';
                meteor.style.top = Math.random() * 50 + '%';
                meteor.style.animationDuration = (Math.random() * 2 + 1) + 's';

                document.body.appendChild(meteor);

                setTimeout(() => meteor.remove(), 3000);
            }
        }, 1000);
    }
}

// Holographic Card Effect
class HolographicCards {
    constructor() {
        this.init();
    }

    init() {
        const cards = document.querySelectorAll('.glass-card');

        cards.forEach(card => {
            const hologram = document.createElement('div');
            hologram.className = 'hologram-layer';
            card.appendChild(hologram);

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                hologram.style.background = `
                    radial-gradient(circle at ${x}% ${y}%, 
                    rgba(255, 0, 255, 0.3) 0%, 
                    rgba(0, 255, 255, 0.2) 50%, 
                    transparent 100%)
                `;
            });
        });
    }
}

// Rainbow Trail Cursor
class RainbowCursor {
    constructor() {
        this.trails = [];
        this.maxTrails = 20;
        this.hue = 0;
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.hue += 5;
            if (this.hue > 360) this.hue = 0;

            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.left = e.pageX + 'px';
            trail.style.top = e.pageY + 'px';
            trail.style.background = `hsl(${this.hue}, 100%, 60%)`;

            document.body.appendChild(trail);
            this.trails.push(trail);

            if (this.trails.length > this.maxTrails) {
                const oldTrail = this.trails.shift();
                oldTrail.remove();
            }

            setTimeout(() => {
                trail.style.opacity = '0';
                trail.style.transform = 'scale(0)';
            }, 10);

            setTimeout(() => trail.remove(), 600);
        });
    }
}

// Initialize all effects when page loads
window.addEventListener('DOMContentLoaded', () => {
    // Splash screen
    new SplashScreen();

    // Wait for splash to finish
    setTimeout(() => {
        new TiltEffect();
        new LiquidButton();
        createDNAHelix();
        new MeteorShower();
        new HolographicCards();
        // new RainbowCursor(); // DISABLED per user request
    }, 4000);
});

// Export for use in other scripts
window.ultimateEffects = {
    TiltEffect,
    LiquidButton,
    MeteorShower,
    HolographicCards,
    RainbowCursor
};
