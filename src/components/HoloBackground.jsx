import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const HoloBackground = () => {
    const canvasRef = useRef(null);
    const { isDark } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let width, height;
        let particles = [];
        let connections = [];

        // Configuration
        const particleCount = 60; // Professional, not too busy
        const connectionDistance = 150;
        const moveSpeed = 0.3;

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * moveSpeed;
                this.vy = (Math.random() - 0.5) * moveSpeed;
                this.size = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = isDark ? 'rgba(139, 92, 246, 0.5)' : 'rgba(59, 130, 246, 0.5)'; // Purple/Blue
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw Background Gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            if (isDark) {
                gradient.addColorStop(0, '#0f1115');
                gradient.addColorStop(1, '#1a1d23');
            } else {
                gradient.addColorStop(0, '#f8fafc');
                gradient.addColorStop(1, '#e2e8f0');
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Draw Particles and Connections
            particles.forEach((p, index) => {
                p.update();
                p.draw();

                // Connections
                for (let i = index + 1; i < particles.length; i++) {
                    const p2 = particles[i];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = isDark
                            ? `rgba(139, 92, 246, ${0.15 * (1 - distance / connectionDistance)})`
                            : `rgba(59, 130, 246, ${0.15 * (1 - distance / connectionDistance)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            // Draw "Holo Grid" Overlay (Subtle)
            // A faint perspective grid at the bottom
            ctx.save();
            ctx.strokeStyle = isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)';
            ctx.lineWidth = 1;

            // Vertical lines converging
            const horizonY = height * 0.4;
            const centerX = width / 2;

            // Only draw if we want a 3D floor effect - keeping it subtle "Data Plane"
            // Let's just draw a few horizontal "data lines" scanning slowly
            const time = Date.now() * 0.0005;
            const scanY = (Math.sin(time) * 0.5 + 0.5) * height;

            const scanGradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
            scanGradient.addColorStop(0, 'rgba(0,0,0,0)');
            scanGradient.addColorStop(0.5, isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)');
            scanGradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = scanGradient;
            ctx.fillRect(0, scanY - 50, width, 100);

            ctx.restore();

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        init();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDark]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none'
            }}
        />
    );
};

export default HoloBackground;
