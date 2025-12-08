// Ultra WOW Particle System
// Interactive cyberpunk particle effects

const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle class
class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
        this.history = [];
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.speed = Math.random() * 2 + 1;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.3;

        // Color variations - neon cyberpunk colors
        const colors = [
            { r: 75, g: 172, b: 254 },   // Neon blue
            { r: 102, g: 126, b: 234 },  // Purple
            { r: 245, g: 87, b: 108 },   // Pink
            { r: 0, g: 242, b: 254 },    // Cyan
            { r: 255, g: 0, b: 255 }     // Magenta
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y += this.speed;

        // Store history for trail effect
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 10) {
            this.history.shift();
        }

        // Reset when off screen
        if (this.y > canvas.height + 10) {
            this.reset();
        }

        // Slight horizontal drift
        this.x += Math.sin(this.y * 0.01) * 0.5;
    }

    draw() {
        // Draw trail
        for (let i = 0; i < this.history.length; i++) {
            const point = this.history[i];
            const alpha = (i / this.history.length) * this.opacity * 0.3;

            ctx.beginPath();
            ctx.arc(point.x, point.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
            ctx.fill();
        }

        // Draw main particle
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Subtle glow effect (reduced intensity)
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.4)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

// Connection lines between nearby particles
class Connection {
    constructor(p1, p2, distance, maxDistance) {
        this.p1 = p1;
        this.p2 = p2;
        this.distance = distance;
        this.maxDistance = maxDistance;
    }

    draw() {
        const opacity = (1 - (this.distance / this.maxDistance)) * 0.3;

        const gradient = ctx.createLinearGradient(
            this.p1.x, this.p1.y,
            this.p2.x, this.p2.y
        );
        gradient.addColorStop(0, `rgba(${this.p1.color.r}, ${this.p1.color.g}, ${this.p1.color.b}, ${opacity})`);
        gradient.addColorStop(1, `rgba(${this.p2.color.r}, ${this.p2.color.g}, ${this.p2.color.b}, ${opacity})`);

        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// Create particles (reduced for better performance)
const particleCount = 30;
const particles = [];
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

// Mouse interaction
let mouse = {
    x: null,
    y: null,
    radius: 150
};

canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

canvas.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Animation loop
function animate() {
    // Clear with fade effect for trails
    ctx.fillStyle = 'rgba(10, 10, 31, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles.forEach(particle => {
        particle.update();

        // Mouse interaction - repel particles
        if (mouse.x && mouse.y) {
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const angle = Math.atan2(dy, dx);
                const force = (mouse.radius - distance) / mouse.radius;
                particle.x -= Math.cos(angle) * force * 3;
                particle.y -= Math.sin(angle) * force * 3;
            }
        }

        particle.draw();
    });

    // Draw connections between nearby particles
    const maxDistance = 120;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                const connection = new Connection(particles[i], particles[j], distance, maxDistance);
                connection.draw();
            }
        }
    }

    requestAnimationFrame(animate);
}

// Start animation
animate();

// Add floating orbs effect
class FloatingOrb {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 80 + 40;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;

        const colors = [
            { r: 102, g: 126, b: 234, a: 0.1 },
            { r: 75, g: 172, b: 254, a: 0.1 },
            { r: 245, g: 87, b: 108, a: 0.1 }
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

// Create floating orbs (reduced for subtlety)
const orbs = [];
for (let i = 0; i < 2; i++) {
    orbs.push(new FloatingOrb());
}

// Enhanced animation loop with orbs
function enhancedAnimate() {
    ctx.fillStyle = 'rgba(10, 10, 31, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw and update orbs first (background layer)
    orbs.forEach(orb => {
        orb.update();
        orb.draw();
    });

    // Then particles and connections
    particles.forEach(particle => {
        particle.update();

        if (mouse.x && mouse.y) {
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const angle = Math.atan2(dy, dx);
                const force = (mouse.radius - distance) / mouse.radius;
                particle.x -= Math.cos(angle) * force * 3;
                particle.y -= Math.sin(angle) * force * 3;
            }
        }

        particle.draw();
    });

    const maxDistance = 120;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance) {
                const connection = new Connection(particles[i], particles[j], distance, maxDistance);
                connection.draw();
            }
        }
    }

    requestAnimationFrame(enhancedAnimate);
}

// Stop basic animation and start enhanced
enhancedAnimate();
