// Additional Visual Effects - EXTREME MODE

// Glitch Effect on Title
function createGlitch() {
    const title = document.querySelector('.title');
    if (!title) return;

    setInterval(() => {
        if (Math.random() > 0.95) {
            title.classList.add('glitch-active');
            setTimeout(() => {
                title.classList.remove('glitch-active');
            }, 200);
        }
    }, 2000);
}

// Typing Animation
function typingAnimation() {
    const subtitle = document.querySelector('.typing-text');
    if (!subtitle) return;

    const text = subtitle.textContent;
    subtitle.textContent = '';
    subtitle.style.opacity = '1';

    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < text.length) {
            subtitle.textContent += text[i];
            i++;
        } else {
            clearInterval(typeInterval);
            // Add blinking cursor
            subtitle.innerHTML += '<span class="cursor">|</span>';
        }
    }, 50);
}

// Floating Animation for Cards
function addFloatingEffects() {
    const floatingElements = document.querySelectorAll('.hover-float');

    floatingElements.forEach((el, index) => {
        const delay = index * 0.2;
        const duration = 3 + Math.random() * 2;
        el.style.animation = `floating ${duration}s ease-in-out ${delay}s infinite`;
    });
}

// Random Color Shift
function colorShiftEffect() {
    const neonElements = document.querySelectorAll('.neon-text, .rainbow-text');

    setInterval(() => {
        neonElements.forEach(el => {
            const hue = Math.random() * 60 + 180; // Blue to purple range
            el.style.filter = `hue-rotate(${hue}deg)`;
        });
    }, 3000);
}

// Pulse Glow Effect
function pulseGlowElements() {
    const pulseElements = document.querySelectorAll('.pulse-glow, .mega-glow');

    pulseElements.forEach((el, index) => {
        const delay = index * 0.5;
        el.style.animationDelay = delay + 's';
    });
}

// Success Sound Effect (Optional - silent by default)
function playSuccessSound() {
    // Create audio context for beep sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Chromatic Aberration on Hover
function addChromaticAberration() {
    const cards = document.querySelectorAll('.glass-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.filter = 'drop-shadow(2px 0 0 rgba(255, 0, 255, 0.5)) drop-shadow(-2px 0 0 rgba(0, 255, 255, 0.5))';
        });

        card.addEventListener('mouseleave', function () {
            this.style.filter = '';
        });
    });
}

// Particle Explosion on Button Click
function createParticleExplosion(x, y) {
    const colors = ['#4facfe', '#667eea', '#f5576c', '#00f2fe', '#ff00ff'];
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'click-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 2 + Math.random() * 3;
        const tx = Math.cos(angle) * velocity * 50;
        const ty = Math.sin(angle) * velocity * 50;

        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Initialize all effects
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        createGlitch();
        typingAnimation();
        addFloatingEffects();
        colorShiftEffect();
        pulseGlowElements();
        addChromaticAberration();
    }, 100);

    // Add particle explosion on start button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            createParticleExplosion(x, y);
            playSuccessSound();
        });
    }
});

// Screen shake effect
function screenShake() {
    const container = document.querySelector('.container');
    container.style.animation = 'shake 0.5s ease';
    setTimeout(() => {
        container.style.animation = '';
    }, 500);
}

// Export functions for use in main.js
window.ultraEffects = {
    screenShake,
    playSuccessSound,
    createParticleExplosion
};
