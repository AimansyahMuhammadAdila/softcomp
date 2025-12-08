// Matrix Rain Effect - Ultra Cyberpunk
const matrixCanvas = document.getElementById('matrixCanvas');
const matrixCtx = matrixCanvas.getContext('2d');

function resizeMatrixCanvas() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
}
resizeMatrixCanvas();
window.addEventListener('resize', resizeMatrixCanvas);

const matrixChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01';
const fontSize = 14;
const columns = matrixCanvas.width / fontSize;
const drops = [];

for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100;
}

function drawMatrix() {
    // Fade effect
    matrixCtx.fillStyle = 'rgba(10, 10, 31, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    // Matrix characters
    matrixCtx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];

        // Gradient colors (reduced opacity)
        const hue = (i * 5 + drops[i]) % 360;
        matrixCtx.fillStyle = `hsla(${hue}, 100%, 60%, 0.3)`;

        // Draw character
        matrixCtx.fillText(char, i * fontSize, drops[i] * fontSize);

        // Reset or continue
        if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 50);
