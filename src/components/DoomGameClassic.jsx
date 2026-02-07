import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaHeart, FaStar, FaCrosshairs, FaTrophy, FaGamepad, FaSkull } from 'react-icons/fa';
import { GiDevilMask } from 'react-icons/gi';
import api from '../services/api';

const DoomGame = ({ fullscreen = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('doomHighScore');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [ammo, setAmmo] = useState(30); // Start with 30 ammo
  const [health, setHealth] = useState(100);
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const ammoRef = useRef(ammo); // Ref to track ammo without re-binding listeners
  const { isDark } = useTheme();

  // Keep ammoRef in sync with ammo state
  useEffect(() => {
    ammoRef.current = ammo;
  }, [ammo]);


  // Game constants - larger when fullscreen
  const CANVAS_WIDTH = fullscreen ? 800 : 400;
  const CANVAS_HEIGHT = fullscreen ? 600 : 300;
  const PLAYER_SIZE = fullscreen ? 20 : 15;
  const ENEMY_SIZE = fullscreen ? 28 : 20;
  const BULLET_SIZE = fullscreen ? 7 : 5;
  const PLAYER_SPEED = fullscreen ? 5 : 4;
  const BULLET_SPEED = fullscreen ? 12 : 10;
  const ENEMY_SPEED = fullscreen ? 2 : 1.5;

  // Game state refs
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 40,
    angle: 0
  });
  const bulletsRef = useRef([]);
  const enemiesRef = useRef([]);
  const particlesRef = useRef([]);
  const keysRef = useRef({});
  const enemySpawnTimerRef = useRef(0);
  const frameCountRef = useRef(0);
  const mouseRef = useRef({ x: CANVAS_WIDTH / 2, y: 0 });
  const ammoPickupsRef = useRef([]); // Ammo pickups array

  const scoreRef = useRef(0);
  const highScoreRef = useRef(highScore);

  // Sync highScoreRef
  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  const resetGame = () => {
    playerRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 40, angle: 0 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    keysRef.current = {};
    enemySpawnTimerRef.current = 0;
    frameCountRef.current = 0;
    setScore(0);
    scoreRef.current = 0; // Sync ref
    setAmmo(30); // Start with 30 ammo
    setHealth(100);
    setGameOver(false);
    ammoPickupsRef.current = []; // Reset ammo pickups
  };

  const startGame = () => {
    resetGame();
    setIsPlaying(true);
  };

  const stopGame = () => {
    setIsPlaying(false);
    setGameOver(false); // Reset game over state when closing
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };



  const createParticles = (x, y, color, count = 12) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 40,
        color
      });
    }
  };

  const shootBullet = () => {
    if (ammoRef.current <= 0) return; // Check reliable ref instead of potentially stale state

    const player = playerRef.current;
    const angle = player.angle;

    bulletsRef.current.push({
      x: player.x,
      y: player.y,
      vx: Math.sin(angle) * BULLET_SPEED,
      vy: -Math.cos(angle) * BULLET_SPEED
    });

    setAmmo(prev => Math.max(0, prev - 1)); // Deduct ammo, never go below 0
  };

  const spawnEnemy = () => {
    const type = Math.random();
    let enemy;

    if (type > 0.8) {
      // Fast demon
      enemy = {
        x: Math.random() * (CANVAS_WIDTH - ENEMY_SIZE),
        y: -ENEMY_SIZE,
        type: 'fast',
        health: 1,
        speed: ENEMY_SPEED * 2
      };
    } else if (type > 0.6) {
      // Tank demon
      enemy = {
        x: Math.random() * (CANVAS_WIDTH - ENEMY_SIZE),
        y: -ENEMY_SIZE,
        type: 'tank',
        health: 3,
        speed: ENEMY_SPEED * 0.7
      };
    } else {
      // Normal demon
      enemy = {
        x: Math.random() * (CANVAS_WIDTH - ENEMY_SIZE),
        y: -ENEMY_SIZE,
        type: 'normal',
        health: 2,
        speed: ENEMY_SPEED
      };
    }

    enemiesRef.current.push(enemy);
  };

  const spawnAmmoPickup = () => {
    ammoPickupsRef.current.push({
      x: Math.random() * (CANVAS_WIDTH - 20),
      y: -20,
      collected: false
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Dark corridor background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a0a0a');
    gradient.addColorStop(0.5, '#2a1515');
    gradient.addColorStop(1, '#1a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Floor tiles
    ctx.strokeStyle = 'rgba(100, 50, 50, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_HEIGHT; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    // Draw particles (blood, explosions)
    particlesRef.current.forEach(particle => {
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life / 40;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw enemies (demons)
    enemiesRef.current.forEach(enemy => {
      let enemyColor, enemyColor2;

      if (enemy.type === 'fast') {
        enemyColor = '#ff4444';
        enemyColor2 = '#cc0000';
      } else if (enemy.type === 'tank') {
        enemyColor = '#8b4513';
        enemyColor2 = '#654321';
      } else {
        enemyColor = '#ff6b35';
        enemyColor2 = '#cc3300';
      }

      ctx.save();

      // Demon body
      const demonGradient = ctx.createRadialGradient(
        enemy.x + ENEMY_SIZE / 2, enemy.y + ENEMY_SIZE / 2, 0,
        enemy.x + ENEMY_SIZE / 2, enemy.y + ENEMY_SIZE / 2, ENEMY_SIZE / 2
      );
      demonGradient.addColorStop(0, enemyColor);
      demonGradient.addColorStop(1, enemyColor2);

      ctx.fillStyle = demonGradient;
      ctx.shadowBlur = 15;
      ctx.shadowColor = enemyColor;

      // Main body
      ctx.beginPath();
      ctx.arc(enemy.x + ENEMY_SIZE / 2, enemy.y + ENEMY_SIZE / 2, ENEMY_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Horns
      ctx.fillStyle = '#660000';
      ctx.beginPath();
      ctx.moveTo(enemy.x + ENEMY_SIZE * 0.3, enemy.y + ENEMY_SIZE * 0.3);
      ctx.lineTo(enemy.x + ENEMY_SIZE * 0.2, enemy.y);
      ctx.lineTo(enemy.x + ENEMY_SIZE * 0.4, enemy.y + ENEMY_SIZE * 0.2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(enemy.x + ENEMY_SIZE * 0.7, enemy.y + ENEMY_SIZE * 0.3);
      ctx.lineTo(enemy.x + ENEMY_SIZE * 0.8, enemy.y);
      ctx.lineTo(enemy.x + ENEMY_SIZE * 0.6, enemy.y + ENEMY_SIZE * 0.2);
      ctx.fill();

      // Eyes (glowing)
      ctx.fillStyle = '#ffff00';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#ffff00';
      ctx.beginPath();
      ctx.arc(enemy.x + ENEMY_SIZE * 0.35, enemy.y + ENEMY_SIZE * 0.45, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(enemy.x + ENEMY_SIZE * 0.65, enemy.y + ENEMY_SIZE * 0.45, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Health bar
      if (enemy.health < (enemy.type === 'tank' ? 3 : 2)) {
        const maxHealth = enemy.type === 'tank' ? 3 : 2;
        const healthPercent = enemy.health / maxHealth;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(enemy.x, enemy.y - 5, ENEMY_SIZE, 3);

        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(enemy.x, enemy.y - 5, ENEMY_SIZE * healthPercent, 3);
      }

      ctx.restore();
    });

    // Draw bullets
    bulletsRef.current.forEach(bullet => {
      const bulletGradient = ctx.createRadialGradient(
        bullet.x, bullet.y, 0,
        bullet.x, bullet.y, BULLET_SIZE
      );
      bulletGradient.addColorStop(0, '#ffff00');
      bulletGradient.addColorStop(0.5, '#ff8800');
      bulletGradient.addColorStop(1, '#ff0000');

      ctx.fillStyle = bulletGradient;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffaa00';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, BULLET_SIZE, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw ammo pickups (yellow boxes with ammo icon)
    ammoPickupsRef.current.forEach(pickup => {
      if (pickup.collected) return;

      ctx.save();

      // Ammo box (yellow/gold)
      const ammoGradient = ctx.createLinearGradient(
        pickup.x, pickup.y,
        pickup.x + 20, pickup.y + 20
      );
      ammoGradient.addColorStop(0, '#ffd700');
      ammoGradient.addColorStop(0.5, '#ffaa00');
      ammoGradient.addColorStop(1, '#ff8800');

      ctx.fillStyle = ammoGradient;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffaa00';

      // Box body
      ctx.fillRect(pickup.x, pickup.y, 20, 20);
      ctx.shadowBlur = 0;

      // Box outline
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 2;
      ctx.strokeRect(pickup.x, pickup.y, 20, 20);

      // Ammo symbol (bullets icon)
      ctx.fillStyle = '#000000';
      ctx.fillRect(pickup.x + 6, pickup.y + 5, 3, 10);
      ctx.fillRect(pickup.x + 11, pickup.y + 5, 3, 10);

      // Pulsing glow effect
      const pulse = Math.sin(frameCountRef.current * 0.1) * 0.3 + 0.7;
      ctx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(pickup.x - 2, pickup.y - 2, 24, 24);

      ctx.restore();
    });

    // Draw player (DOOM marine)
    const player = playerRef.current;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Marine body
    const marineGradient = ctx.createLinearGradient(-PLAYER_SIZE, -PLAYER_SIZE, PLAYER_SIZE, PLAYER_SIZE);
    marineGradient.addColorStop(0, '#00aa00');
    marineGradient.addColorStop(0.5, '#008800');
    marineGradient.addColorStop(1, '#006600');

    ctx.fillStyle = marineGradient;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff00';

    // Body triangle
    ctx.beginPath();
    ctx.moveTo(0, -PLAYER_SIZE);
    ctx.lineTo(-PLAYER_SIZE * 0.7, PLAYER_SIZE * 0.7);
    ctx.lineTo(PLAYER_SIZE * 0.7, PLAYER_SIZE * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Helmet
    ctx.fillStyle = '#444444';
    ctx.beginPath();
    ctx.arc(0, -PLAYER_SIZE * 0.5, PLAYER_SIZE * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Visor
    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#00ffff';
    ctx.fillRect(-PLAYER_SIZE * 0.3, -PLAYER_SIZE * 0.6, PLAYER_SIZE * 0.6, PLAYER_SIZE * 0.2);
    ctx.shadowBlur = 0;

    // Gun
    ctx.fillStyle = '#666666';
    ctx.fillRect(-PLAYER_SIZE * 0.2, -PLAYER_SIZE * 0.2, PLAYER_SIZE * 0.4, PLAYER_SIZE);

    ctx.restore();
  };

  const gameLoop = () => {
    if (gameOver) return;

    frameCountRef.current++;
    const player = playerRef.current;
    const keys = keysRef.current;

    // Player movement
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
      player.x = Math.max(PLAYER_SIZE, player.x - PLAYER_SPEED);
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
      player.x = Math.min(CANVAS_WIDTH - PLAYER_SIZE, player.x + PLAYER_SPEED);
    }
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
      player.y = Math.max(PLAYER_SIZE, player.y - PLAYER_SPEED);
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
      player.y = Math.min(CANVAS_HEIGHT - PLAYER_SIZE, player.y + PLAYER_SPEED);
    }

    // Calculate angle to mouse
    const dx = mouseRef.current.x - player.x;
    const dy = mouseRef.current.y - player.y;
    player.angle = Math.atan2(dx, -dy);

    // Update bullets
    bulletsRef.current = bulletsRef.current.filter(bullet => {
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      return bullet.x > 0 && bullet.x < CANVAS_WIDTH && bullet.y > 0 && bullet.y < CANVAS_HEIGHT;
    });

    // Spawn enemies and ammo pickups
    enemySpawnTimerRef.current++;
    if (enemySpawnTimerRef.current > 50) {
      spawnEnemy();
      enemySpawnTimerRef.current = 0;

      // Spawn ammo pickup occasionally (30% chance)
      if (Math.random() > 0.7) {
        spawnAmmoPickup();
      }
    }

    // Update ammo pickups
    ammoPickupsRef.current = ammoPickupsRef.current.filter(pickup => {
      if (pickup.collected) return false;

      pickup.y += 2; // Fall speed

      // Check collision with player
      const dist = Math.hypot(pickup.x + 10 - player.x, pickup.y + 10 - player.y);
      if (dist < PLAYER_SIZE + 10) {
        pickup.collected = true;
        setAmmo(prev => Math.min(prev + 10, 99)); // Add 10 ammo, max 99
        createParticles(pickup.x + 10, pickup.y + 10, '#ffd700', 10);
        return false;
      }

      // Remove if off screen
      return pickup.y < CANVAS_HEIGHT + 20;
    });

    // Update enemies
    enemiesRef.current = enemiesRef.current.filter(enemy => {
      enemy.y += enemy.speed;

      // Check collision with player
      const dist = Math.hypot(enemy.x + ENEMY_SIZE / 2 - player.x, enemy.y + ENEMY_SIZE / 2 - player.y);
      if (dist < PLAYER_SIZE + ENEMY_SIZE / 2) {
        createParticles(enemy.x, enemy.y, '#ff0000', 15);
        setHealth(prev => {
          const newHealth = Math.max(0, prev - 10); // Lose 10% HP when enemy hits
          if (newHealth <= 0) {
            setGameOver(true);
            setIsPlaying(false); // Stop the game
            if (scoreRef.current > highScoreRef.current) {
              highScoreRef.current = scoreRef.current;
              setHighScore(scoreRef.current);
              localStorage.setItem('doomHighScore', scoreRef.current.toString());
            }
            api.post('/game/score', { score: scoreRef.current }).catch(console.error);
          }
          return newHealth;
        });
        return false;
      }

      // Enemy escaped - reduce health
      if (enemy.y > CANVAS_HEIGHT) {
        createParticles(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10, '#ff4444', 8);
        setHealth(prev => {
          const newHealth = Math.max(0, prev - 10); // Lose 10% HP when enemy escapes
          if (newHealth <= 0) {
            setGameOver(true);
            setIsPlaying(false); // Stop the game
            if (scoreRef.current > highScoreRef.current) {
              highScoreRef.current = scoreRef.current;
              setHighScore(scoreRef.current);
              localStorage.setItem('doomHighScore', scoreRef.current.toString());
            }
            api.post('/game/score', { score: scoreRef.current }).catch(console.error);
          }
          return newHealth;
        });
        return false;
      }

      return true;
    });

    // Check bullet-enemy collisions
    bulletsRef.current = bulletsRef.current.filter(bullet => {
      let hit = false;
      enemiesRef.current = enemiesRef.current.filter(enemy => {
        const dist = Math.hypot(
          bullet.x - (enemy.x + ENEMY_SIZE / 2),
          bullet.y - (enemy.y + ENEMY_SIZE / 2)
        );

        if (dist < BULLET_SIZE + ENEMY_SIZE / 2) {
          hit = true;
          enemy.health--;

          if (enemy.health <= 0) {
            createParticles(enemy.x + ENEMY_SIZE / 2, enemy.y + ENEMY_SIZE / 2, '#ff4444', 20);
            const points = enemy.type === 'tank' ? 30 : enemy.type === 'fast' ? 20 : 10;
            scoreRef.current += points;
            setScore(scoreRef.current);
            // No ammo drop needed - unlimited ammo!
            return false;
          }

          createParticles(bullet.x, bullet.y, '#ffaa00', 8);
          return true;
        }
        return true;
      });
      return !hit;
    });

    // Check bullet-ammo pickup collisions (shoot to collect!)
    bulletsRef.current = bulletsRef.current.filter(bullet => {
      let hitPickup = false;

      ammoPickupsRef.current = ammoPickupsRef.current.filter(pickup => {
        if (pickup.collected) return false;

        const dist = Math.hypot(
          bullet.x - (pickup.x + 10),
          bullet.y - (pickup.y + 10)
        );

        if (dist < BULLET_SIZE + 10) {
          hitPickup = true;
          pickup.collected = true;
          setAmmo(prev => Math.min(prev + 10, 99)); // Add 10 ammo, max 99
          createParticles(pickup.x + 10, pickup.y + 10, '#ffd700', 15);
          return false;
        }
        return true;
      });

      return !hitPickup;
    });

    // Update particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // Gravity
      particle.life--;
      return particle.life > 0;
    });

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };



  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying || gameOver) return;
      keysRef.current[e.key] = true;

      if (e.key === ' ') {
        e.preventDefault();
        shootBullet();
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.key] = false;
    };

    const handleMouseMove = (e) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleClick = (e) => {
      // Use ref for current check to avoid stale closures
      if (!isPlaying || gameOver || ammoRef.current <= 0) return;
      e.preventDefault();
      shootBullet();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousemove', handleMouseMove);
      canvasRef.current.addEventListener('click', handleClick);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousemove', handleMouseMove);
        canvasRef.current.removeEventListener('click', handleClick);
      }
    };
  }, [isPlaying, gameOver]);

  return (
    <>
      <div className="doom-game-container">
        {!isPlaying && !gameOver ? (
          <div className="game-placeholder">
            <div className="game-icon"><GiDevilMask /></div>
            <div className="game-text">
              <h3>Take a Break!</h3>
              <p>DOOM-Style Shooter</p>
            </div>
            <button className="game-start-btn" onClick={startGame}>
              <span className="start-icon"><FaGamepad /></span>
              START GAME
            </button>
            <div className="game-hint">Fight the Demons!</div>
            {highScore > 0 && (
              <div className="high-score-badge"><FaTrophy /> High Score: {highScore}</div>
            )}
          </div>
        ) : !isPlaying && gameOver ? (
          <div className="game-over-screen" onClick={startGame}>
            <div className="game-over-content">
              <h2 className="game-over-title"><FaSkull /> GAME OVER <FaSkull /></h2>
              <div className="final-score">
                <div className="score-label">Final Score</div>
                <div className="score-value">{score}</div>
              </div>
              {score > highScore && (
                <div className="new-record"><FaTrophy /> NEW HIGH SCORE! <FaTrophy /></div>
              )}
              {score <= highScore && highScore > 0 && (
                <div className="high-score-display">
                  <span>Best: {highScore}</span>
                </div>
              )}
              <div className="play-again-hint">
                Click to Play Again
              </div>
            </div>
          </div>
        ) : (
          <div className="game-wrapper">
            <div className="game-header" style={{ maxWidth: CANVAS_WIDTH }}>
              <div className="stats-container">
                <div className="stat-display health">
                  <span className="stat-icon"><FaHeart /></span>
                  <div className="stat-info">
                    <span className="stat-label">Health</span>
                    <span className="stat-value" style={{ color: health > 50 ? '#00ff00' : health > 25 ? '#ffff00' : '#ff0000' }}>
                      {health}%
                    </span>
                  </div>
                </div>
                <div className="stat-display score">
                  <span className="stat-icon"><FaStar /></span>
                  <div className="stat-info">
                    <span className="stat-label">Score</span>
                    <span className="stat-value">{score}</span>
                  </div>
                </div>
                <div className="stat-display ammo">
                  <span className="stat-icon"><FaCrosshairs /></span>
                  <div className="stat-info">
                    <span className="stat-label">Ammo</span>
                    <span className="stat-value" style={{ color: ammo > 20 ? '#00ff00' : ammo > 10 ? '#ffaa00' : '#ff0000' }}>
                      {ammo}
                    </span>
                  </div>
                </div>
                <div className="stat-display best">
                  <span className="stat-icon"><FaTrophy /></span>
                  <div className="stat-info">
                    <span className="stat-label">Best</span>
                    <span className="stat-value">{highScore}</span>
                  </div>
                </div>
              </div>
              <button className="game-control-btn close" onClick={stopGame} title="Close Game">
                ✕
              </button>
            </div>

            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="game-canvas"
            />


            <div className="game-instructions">
              <span>WASD/Arrows: Move</span>
              <span>Mouse: Aim</span>
              <span>Click/Space: Shoot</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .doom-game-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 280px;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .game-placeholder {
          width: 100%;
          height: 100%;
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: ${isDark
          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(219, 39, 119, 0.08) 100%)'
        };
          border: 2px dashed ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(124, 58, 237, 0.2)'};
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow: ${isDark
          ? '0 0 20px rgba(139, 92, 246, 0.1), inset 0 0 20px rgba(0,0,0,0.5)'
          : '0 0 20px rgba(124, 58, 237, 0.05), inset 0 0 20px rgba(255,255,255,0.5)'};
        }

        .game-placeholder::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, ${isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(124, 58, 237, 0.05)'} 0%, transparent 70%);
          z-index: 0;
        }

        .game-placeholder:hover {
          border-color: ${isDark ? 'rgba(139, 92, 246, 0.8)' : 'rgba(124, 58, 237, 0.6)'};
          transform: translateY(-5px);
          box-shadow: ${isDark
          ? '0 15px 40px rgba(139, 92, 246, 0.3), inset 0 0 30px rgba(139, 92, 246, 0.1)'
          : '0 15px 40px rgba(124, 58, 237, 0.2), inset 0 0 30px rgba(124, 58, 237, 0.05)'
        };
        }

        .game-icon {
          font-size: 80px;
          margin-bottom: 20px;
          /* animation: float removed */
          filter: drop-shadow(0 0 20px ${isDark ? 'rgba(239, 68, 68, 0.8)' : 'rgba(220, 38, 38, 0.6)'});
          color: ${isDark ? '#ef4444' : '#dc2626'};
          position: relative;
          z-index: 1;
        }

        /* @keyframes float removed */

        .game-text {
          text-align: center;
          position: relative;
          z-index: 1;
          margin-bottom: 10px;
        }

        .game-text h3 {
          font-family: 'Orbitron', sans-serif;
          font-size: 32px;
          font-weight: 900;
          margin: 0 0 8px 0;
          color: #ffffff;
          text-shadow: 0 0 10px ${isDark ? 'rgba(239, 68, 68, 0.8)' : 'rgba(220, 38, 38, 0.6)'};
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .game-text p {
          font-size: 16px;
          color: ${isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)'};
          margin: 0;
          font-weight: 500;
          letter-spacing: 1px;
        }

        .game-hint {
          margin-top: 24px;
          font-size: 12px;
          color: ${isDark ? '#fbbf24' : '#f59e0b'};
          text-transform: uppercase;
          letter-spacing: 3px;
          font-weight: 700;
          position: relative;
          z-index: 1;
          opacity: 0.8;
        }

        .high-score-badge {
          margin-top: 8px;
          font-size: 12px;
          color: ${isDark ? '#fbbf24' : '#f59e0b'};
          font-weight: 700;
          position: relative;
          z-index: 1;
        }

        .game-start-btn {
          margin: 20px 0;
          padding: 16px 48px;
          font-size: 18px;
          font-weight: 800;
          color: ${isDark ? '#ffffff' : '#ffffff'};
          background: linear-gradient(135deg, ${isDark ? '#8b5cf6' : '#7c3aed'} 0%, ${isDark ? '#ec4899' : '#db2777'} 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 0 4px 20px ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(124, 58, 237, 0.3)'};
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 12px;
          /* animation: pulse-glow removed */
        }

        .game-start-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 30px ${isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(124, 58, 237, 0.5)'};
          background: linear-gradient(135deg, ${isDark ? '#9333ea' : '#8b5cf6'} 0%, ${isDark ? '#f472b6' : '#ec4899'} 100%);
        }

        .game-start-btn:active {
          transform: translateY(0) scale(1);
        }

        .start-icon {
          font-size: 24px;
          /* animation: bounce-icon removed */
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 4px 20px ${isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(124, 58, 237, 0.3)'};
          }
          50% {
            box-shadow: 0 4px 30px ${isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(124, 58, 237, 0.5)'};
          }
        }

        @keyframes bounce-icon {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }



        .game-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: ${isDark ? 'rgba(10, 10, 26, 0.95)' : 'rgba(26, 26, 46, 0.95)'};
          padding: 20px;
          border-radius: 12px;
          position: relative;
        }

        .game-header {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 20px;
          width: 100%;
          justify-content: space-between;
        }

        .stats-container {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          flex: 1;
        }

        .stat-display {
          display: flex;
          align-items: center;
          gap: 10px;
          background: ${isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.5)'};
          padding: 10px 16px;
          border-radius: 10px;
          border: 2px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(124, 58, 237, 0.3)'};
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          min-width: 110px;
        }

        .stat-display:hover {
          transform: translateY(-2px);
          border-color: ${isDark ? 'rgba(139, 92, 246, 0.5)' : 'rgba(124, 58, 237, 0.5)'};
          box-shadow: 0 4px 12px ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(124, 58, 237, 0.2)'};
        }

        .stat-icon {
          font-size: 20px;
          line-height: 1;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-label {
          font-size: 9px;
          color: ${isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.7)'};
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-family: 'Orbitron', monospace;
          font-size: 16px;
          font-weight: 800;
          color: ${isDark ? '#a78bfa' : '#8b5cf6'};
          text-shadow: 0 0 8px ${isDark ? 'rgba(167, 139, 250, 0.5)' : 'rgba(139, 92, 246, 0.5)'};
          line-height: 1;
        }

        .game-control-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          background: ${isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.2)'};
          color: white;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .game-control-btn:hover {
          background: rgba(239, 68, 68, 0.8);
          transform: scale(1.1);
        }

        .game-canvas {
          border: 2px solid ${isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(220, 38, 38, 0.4)'};
          border-radius: 8px;
          box-shadow: ${isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)'
          : '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 40px rgba(220, 38, 38, 0.2)'
        };
          cursor: crosshair;
        }

        .game-over-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .game-over-content {
          text-align: center;
          padding: 32px;
          background: ${isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(220, 38, 38, 0.15)'};
          border-radius: 16px;
          border: 2px solid ${isDark ? 'rgba(239, 68, 68, 0.5)' : 'rgba(220, 38, 38, 0.4)'};
        }

        .game-over-content h2 {
          font-family: 'Orbitron', sans-serif;
          font-size: 32px;
          margin: 0 0 16px 0;
          color: #ff4444;
          text-shadow: 0 0 20px rgba(255, 68, 68, 0.8);
        }

        .final-score {
          font-size: 18px;
          color: white;
          margin: 0 0 8px 0;
          font-weight: 700;
        }

        .new-record {
          font-size: 14px;
          color: #fbbf24;
          margin: 0 0 24px 0;
          font-weight: 700;
          animation: glow 1s infinite;
        }

        @keyframes glow {
          0%, 100% { opacity: 1; text-shadow: 0 0 10px #fbbf24; }
          50% { opacity: 0.8; text-shadow: 0 0 20px #fbbf24; }
        }

        .play-again-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
        }

        .play-again-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(239, 68, 68, 0.6);
        }

        .game-instructions {
          margin-top: 12px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          background: ${isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.6)'};
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }

        .game-instructions span {
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .game-placeholder {
            min-height: 200px;
          }

          .game-icon {
            font-size: 48px;
          }

          .game-text h3 {
            font-size: 20px;
          }

          .game-wrapper {
            padding: 12px;
          }

          .game-header {
            gap: 6px;
          }

          .stat-display {
            padding: 3px 8px;
          }

          .stat-label {
            font-size: 9px;
          }

          .stat-value {
            font-size: 12px;
          }
        }

        /* Game Over Screen Styles */
        .game-over-screen {
          width: 100%;
          height: 100%;
          min-height: 280px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: ${isDark
          ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(127, 29, 29, 0.3) 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(153, 27, 27, 0.2) 100%)'
        };
          border: 2px solid ${isDark ? 'rgba(220, 38, 38, 0.4)' : 'rgba(220, 38, 38, 0.3)'};
          border-radius: 12px;
          cursor: pointer;
          animation: fadeIn 0.5s ease;
          position: relative;
          z-index: 10;
        }


.game-over-content {
  text-align: center;
  padding: 30px;
  animation: slideUp 0.5s ease;
  color: ${isDark ? '#e5e7eb' : '#1f2937'};
}

.game-over-title {
  font-size: 32px;
  font-weight: 800;
  color: ${isDark ? '#f87171' : '#dc2626'};
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(220, 38, 38, 0.3);
  animation: pulse 2s infinite;
}

.final-score {
  margin: 20px 0;
  background: ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)'};
  padding: 15px;
  border-radius: 8px;
}

.score-label {
  font-size: 14px;
  color: ${isDark ? '#9ca3af' : '#6b7280'};
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-value {
  font-size: 42px;
  font-weight: 900;
  color: ${isDark ? '#fbbf24' : '#f59e0b'};
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
}

.new-record {
  font-size: 18px;
  font-weight: 700;
  color: ${isDark ? '#fbbf24' : '#f59e0b'};
  margin: 15px 0;
  animation: bounce 1s infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.high-score-display {
  font-size: 14px;
  color: ${isDark ? '#d1d5db' : '#4b5563'};
  margin: 10px 0;
  font-weight: 500;
}

.play-again-hint {
  margin-top: 25px;
  font-size: 14px;
  color: ${isDark ? '#a78bfa' : '#7c3aed'};
  font-weight: 600;
  animation: blink 1.5s infinite;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
`}</style>
    </>
  );
};

export default DoomGame;
