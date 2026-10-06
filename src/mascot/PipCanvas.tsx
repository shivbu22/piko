import React, { useEffect, useRef } from 'react';
import { PipEngine } from './PipEngine';
import { PipReaction } from '../types';
import { MascotSpecies } from './characters';
import { sounds } from '../audio/SoundEffects';

interface SpriteSheetPair {
  directions: HTMLImageElement;
  reactions: HTMLImageElement;
  loaded: boolean;
}

const spriteCache = new Map<string, SpriteSheetPair>();

function getSpriteFolder(species: string): string {
  if (species === 'kiko') return 'fox';
  if (species === 'milo') return 'cat';
  if (species === 'boba') return 'frog';
  if (species === 'nori') return 'penguin';
  if (species === 'aero') return 'robot';
  if (species === 'nova') return 'bunny';
  return species;
}

function getSpriteSheet(species: string): SpriteSheetPair | null {
  if (species === 'pip') return null;
  const folder = getSpriteFolder(species);
  const existing = spriteCache.get(folder);
  if (existing) return existing;

  const pair: SpriteSheetPair = {
    directions: new Image(),
    reactions: new Image(),
    loaded: false,
  };

  let loadedCount = 0;
  const onLoad = () => {
    loadedCount++;
    if (loadedCount >= 2) {
      pair.loaded = true;
    }
  };

  pair.directions.onload = onLoad;
  pair.reactions.onload = onLoad;

  const base = import.meta.env.BASE_URL || './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  pair.directions.src = `${prefix}characters/${folder}/directions.png`;
  pair.reactions.src = `${prefix}characters/${folder}/reactions.png`;

  spriteCache.set(folder, pair);
  return pair;
}

const DIR_COORDS: Record<string, { col: number; row: number }> = {
  'up-left':    { col: 0, row: 0 },
  'up':         { col: 1, row: 0 },
  'up-right':   { col: 2, row: 0 },
  'left':       { col: 0, row: 1 },
  'center':     { col: 1, row: 1 },
  'right':      { col: 2, row: 1 },
  'down-left':  { col: 0, row: 2 },
  'down':       { col: 1, row: 2 },
  'down-right': { col: 2, row: 2 },
};

const REACTION_COORDS: Record<string, { col: number; row: number }> = {
  'blink':      { col: 0, row: 0 },
  'heart':      { col: 1, row: 0 },
  'sparkle':    { col: 2, row: 0 },
  'surprised':  { col: 0, row: 1 },
  'wink':       { col: 1, row: 1 },
  'bashful':    { col: 2, row: 1 },
  'sleepy':     { col: 0, row: 2 },
  'dizzy':      { col: 1, row: 2 },
  'delighted':  { col: 2, row: 2 },
};

const PIP_REACTION_MAP: Record<PipReaction, string> = {
  idle: 'blink',
  listening: 'sparkle',
  thinking: 'surprised',
  talking: 'wink',
  alert: 'surprised',
  celebrating: 'delighted',
  sleeping: 'sleepy',
  busy: 'dizzy',
  confused: 'dizzy',
  love: 'heart',
  dizzy: 'dizzy',
  blush: 'bashful',
};

interface PipCanvasProps {
  reaction?: PipReaction;
  outfitId?: string;
  species?: MascotSpecies;
  size?: number;
  interactive?: boolean;
  onBoop?: () => void;
  className?: string;
}

const safeRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
};

export const PipCanvas: React.FC<PipCanvasProps> = ({
  reaction = 'idle',
  outfitId = 'classic',
  species = 'pip',
  size = 56,
  interactive = true,
  onBoop,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PipEngine>(new PipEngine());
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    engineRef.current.setReaction(reaction);
  }, [reaction]);

  useEffect(() => {
    engineRef.current.setOutfit(outfitId);
  }, [outfitId]);

  useEffect(() => {
    engineRef.current.setSpecies(species);
  }, [species]);

  // Global mouse position tracking for eye direction
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const engine = engineRef.current;
      engine.update(dt);

      // Track cursor direction
      if (interactive && canvas) {
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        engine.calculateDirection(
          mousePosRef.current.x,
          mousePosRef.current.y,
          centerX,
          centerY
        );
      }

      // Drawing setup with High-DPI support
      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.round(size * dpr);
      const targetH = Math.round(size * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      ctx.save();
      ctx.translate(cx, cy);

      // Apply squishy spring physics
      ctx.scale(engine.scaleX, engine.scaleY);

      // Breathing idle bob
      const bob = Math.sin(engine.tick * 0.08) * 1.2;
      ctx.translate(0, bob);

      // Direction offsets for face features
      const dir = engine.getDirection();
      let lookX = 0;
      let lookY = 0;
      if (dir.includes('left')) lookX = -3.5;
      if (dir.includes('right')) lookX = 3.5;
      if (dir.includes('up')) lookY = -3.0;
      if (dir.includes('down')) lookY = 2.5;

      const currentReaction = engine.getReaction();
      const currentOutfit = engine.getOutfit();
      const currentSpecies = engine.getSpecies();

      // Check if authentic 3x3 sprite sheet is available for this character
      const sprite = getSpriteSheet(currentSpecies);
      if (sprite && sprite.loaded) {
        let targetImg = sprite.directions;
        let col = 1;
        let row = 1;

        if (currentReaction === 'idle') {
          if (engine.isBlinking) {
            targetImg = sprite.reactions;
            col = REACTION_COORDS.blink.col;
            row = REACTION_COORDS.blink.row;
          } else {
            targetImg = sprite.directions;
            const coord = DIR_COORDS[dir] || DIR_COORDS.center;
            col = coord.col;
            row = coord.row;
          }
        } else {
          targetImg = sprite.reactions;
          const reactionName = PIP_REACTION_MAP[currentReaction] || 'delighted';
          const coord = REACTION_COORDS[reactionName] || REACTION_COORDS.delighted;
          col = coord.col;
          row = coord.row;
        }

        const tileW = targetImg.naturalWidth / 3;
        const tileH = targetImg.naturalHeight / 3;
        const sx = col * tileW;
        const sy = row * tileH;
        const drawSize = size * 0.94;

        ctx.drawImage(
          targetImg,
          sx,
          sy,
          tileW,
          tileH,
          -drawSize / 2,
          -drawSize / 2,
          drawSize,
          drawSize
        );
      } else {
        // --- 1. AMBIENT SHADOW ---
        ctx.beginPath();
        ctx.ellipse(0, 18 - bob, 16 * engine.scaleX, 4 * engine.scaleY, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.fill();

        // --- 2. MULTI-SPECIES BODY & SILHOUETTE RENDERING ---
        if (currentSpecies === 'kiko') {
        // --- KIKO THE KITSUNE FOX ---
        // Fox Ears
        ctx.fillStyle = '#F77F00';
        ctx.beginPath();
        ctx.moveTo(-16, -8);
        ctx.lineTo(-12, -26);
        ctx.lineTo(-4, -14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFF1E6';
        ctx.beginPath();
        ctx.moveTo(-14, -10);
        ctx.lineTo(-12, -22);
        ctx.lineTo(-6, -14);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#F77F00';
        ctx.beginPath();
        ctx.moveTo(16, -8);
        ctx.lineTo(12, -26);
        ctx.lineTo(4, -14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFF1E6';
        ctx.beginPath();
        ctx.moveTo(14, -10);
        ctx.lineTo(12, -22);
        ctx.lineTo(6, -14);
        ctx.closePath();
        ctx.fill();

        // Fox Head / Body
        ctx.beginPath();
        ctx.moveTo(-18, 12);
        ctx.bezierCurveTo(-22, -4, -16, -18, 0, -18);
        ctx.bezierCurveTo(16, -18, 22, -4, 18, 12);
        ctx.bezierCurveTo(14, 20, -14, 20, -18, 12);
        ctx.closePath();
        const foxGrad = ctx.createRadialGradient(-4, -6, 2, 0, 4, 22);
        foxGrad.addColorStop(0, '#FFA24C');
        foxGrad.addColorStop(0.7, '#F77F00');
        foxGrad.addColorStop(1, '#D62828');
        ctx.fillStyle = foxGrad;
        ctx.fill();

        // White chest/cheek fluff
        ctx.fillStyle = '#FFF5EB';
        ctx.beginPath();
        ctx.ellipse(0, 10, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (currentSpecies === 'milo') {
        // --- MILO THE CALICO CAT ---
        // Cat Ears
        ctx.fillStyle = '#D8B4E2';
        ctx.beginPath();
        ctx.moveTo(-16, -6);
        ctx.lineTo(-11, -22);
        ctx.lineTo(-4, -14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFC6FF';
        ctx.beginPath();
        ctx.moveTo(-13, -8);
        ctx.lineTo(-11, -19);
        ctx.lineTo(-6, -13);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#9333EA'; // Calico spot on right ear
        ctx.beginPath();
        ctx.moveTo(16, -6);
        ctx.lineTo(11, -22);
        ctx.lineTo(4, -14);
        ctx.closePath();
        ctx.fill();

        // Cat Body
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#F3E8FF';
        ctx.fill();

        // Whiskers
        ctx.strokeStyle = '#9333EA';
        ctx.lineWidth = 1;
        [-1, 1].forEach((side) => {
          ctx.beginPath();
          ctx.moveTo(side * 10, 3);
          ctx.lineTo(side * 22, 1);
          ctx.moveTo(side * 10, 5);
          ctx.lineTo(side * 22, 6);
          ctx.stroke();
        });
      } else if (currentSpecies === 'boba') {
        // --- BOBA THE MATCHA TREE FROG ---
        // Top protruding frog eyes
        ctx.fillStyle = '#80B918';
        ctx.beginPath();
        ctx.arc(-9, -15, 7, 0, Math.PI * 2);
        ctx.arc(9, -15, 7, 0, Math.PI * 2);
        ctx.fill();

        // Frog Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 16, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#80B918';
        ctx.fill();

        // Pale lime tummy
        ctx.beginPath();
        ctx.ellipse(0, 6, 11, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#D4E09B';
        ctx.fill();

        // Lotus leaf cap
        ctx.fillStyle = '#55A630';
        ctx.beginPath();
        ctx.ellipse(0, -17, 8, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (currentSpecies === 'nori') {
        // --- NORI THE TUXEDO PENGUIN ---
        // Tuxedo Navy Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 17, 19, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1E293B';
        ctx.fill();

        // White Tuxedo Belly
        ctx.beginPath();
        ctx.ellipse(0, 3, 11, 13, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Orange Beak
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(-3 + lookX * 0.8, 1 + lookY * 0.8);
        ctx.lineTo(3 + lookX * 0.8, 1 + lookY * 0.8);
        ctx.lineTo(0 + lookX * 0.8, 5 + lookY * 0.8);
        ctx.closePath();
        ctx.fill();
      } else if (currentSpecies === 'aero') {
        // --- AERO THE CYBER ORB BOT ---
        // Cyber Orb Shell
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        const orbGrad = ctx.createRadialGradient(-4, -6, 2, 0, 0, 20);
        orbGrad.addColorStop(0, '#38BDF8');
        orbGrad.addColorStop(0.8, '#0F172A');
        orbGrad.addColorStop(1, '#0284C7');
        ctx.fillStyle = orbGrad;
        ctx.fill();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Floating Visor Band
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        safeRoundRect(ctx, -14, -6, 28, 12, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.stroke();
      } else if (currentSpecies === 'nova') {
        // --- NOVA THE COSMIC STAR BUNNY ---
        // Floppy Bunny Ears
        ctx.fillStyle = '#F472B6';
        ctx.beginPath();
        ctx.ellipse(-8, -20, 4.5, 12, -0.2, 0, Math.PI * 2);
        ctx.ellipse(8, -20, 4.5, 12, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FDF2F8';
        ctx.beginPath();
        ctx.ellipse(-8, -20, 2.5, 9, -0.2, 0, Math.PI * 2);
        ctx.ellipse(8, -20, 2.5, 9, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Star tip glints
        ctx.fillStyle = '#FDE047';
        ctx.font = '7px sans-serif';
        ctx.fillText('★', -11, -30);
        ctx.fillText('★', 7, -30);

        // Bunny Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 17, 18, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FCE7F3';
        ctx.fill();
      } else {
        // --- CLASSIC PIP (MOCHI DUMPLING) ---
        ctx.beginPath();
        ctx.moveTo(-18, 12);
        ctx.bezierCurveTo(-22, -4, -14, -18, 0, -20);
        ctx.bezierCurveTo(14, -18, 22, -4, 18, 12);
        ctx.bezierCurveTo(14, 20, -14, 20, -18, 12);
        ctx.closePath();

        const bodyGrad = ctx.createRadialGradient(-4, -6, 2, 0, 4, 22);
        bodyGrad.addColorStop(0, '#FFFDF8');
        bodyGrad.addColorStop(0.65, '#F5E6D3');
        bodyGrad.addColorStop(1, '#F2C4A8');
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(224, 122, 95, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Top dumpling crest fold
        ctx.beginPath();
        ctx.moveTo(-3, -20);
        ctx.quadraticCurveTo(0, -17, 3, -20);
        ctx.strokeStyle = 'rgba(242, 196, 168, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // --- 3. BLUSH SPOTS ---
      const blushOpacity = currentReaction === 'blush' ? 1.0 : currentReaction === 'celebrating' || currentReaction === 'love' ? 0.95 : 0.65;
      ctx.fillStyle = currentSpecies === 'aero' ? `rgba(56, 189, 248, 0.4)` : `rgba(247, 160, 114, ${blushOpacity})`;
      ctx.beginPath();
      ctx.ellipse(-11 + lookX * 0.6, 3 + lookY * 0.6, 3.8, 2.2, 0, 0, Math.PI * 2);
      ctx.ellipse(11 + lookX * 0.6, 3 + lookY * 0.6, 3.8, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- 4. EYES & EXPRESSION SYSTEM (9 REACTIONS) ---
      const eyeOffsetX = currentSpecies === 'boba' ? 9 : 7;
      const eyeOffsetY = currentSpecies === 'boba' ? -15 : -2;

      if (currentReaction === 'sleeping') {
        // Closed sleep crescents
        ctx.strokeStyle = currentSpecies === 'aero' ? '#38BDF8' : '#1A1A24';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(-eyeOffsetX, eyeOffsetY, 3.5, 0.2, Math.PI - 0.2);
        ctx.arc(eyeOffsetX, eyeOffsetY, 3.5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Floating 'Zzz'
        const zTick = (engine.tick * 0.05) % 3;
        ctx.fillStyle = '#E07A5F';
        ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('z', 14 + zTick * 2, -14 - zTick * 4);
      } else if (currentReaction === 'love') {
        // Heart Eyes
        ctx.fillStyle = '#EF4444';
        ctx.font = '10px sans-serif';
        ctx.fillText('❤️', -eyeOffsetX - 5 + lookX, eyeOffsetY + 4 + lookY);
        ctx.fillText('❤️', eyeOffsetX - 5 + lookX, eyeOffsetY + 4 + lookY);
      } else if (currentReaction === 'dizzy') {
        // Cartoon spiral eyes
        ctx.strokeStyle = '#1A1A24';
        ctx.lineWidth = 1.4;
        [-eyeOffsetX, eyeOffsetX].forEach((x) => {
          ctx.beginPath();
          ctx.arc(x + lookX, eyeOffsetY + lookY, 3, 0, Math.PI * 3);
          ctx.stroke();
        });
      } else if (engine.isBlinking && currentReaction !== 'alert') {
        // Blinking slits
        ctx.strokeStyle = currentSpecies === 'aero' ? '#38BDF8' : '#1A1A24';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-eyeOffsetX - 3 + lookX, eyeOffsetY + lookY);
        ctx.lineTo(-eyeOffsetX + 3 + lookX, eyeOffsetY + lookY);
        ctx.moveTo(eyeOffsetX - 3 + lookX, eyeOffsetY + lookY);
        ctx.lineTo(eyeOffsetX + 3 + lookX, eyeOffsetY + lookY);
        ctx.stroke();
      } else if (currentReaction === 'celebrating') {
        // Joyful happy arc eyes
        ctx.strokeStyle = currentSpecies === 'aero' ? '#38BDF8' : '#1A1A24';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(-eyeOffsetX + lookX, eyeOffsetY + lookY - 1, 4, Math.PI * 0.85, Math.PI * 2.15);
        ctx.arc(eyeOffsetX + lookX, eyeOffsetY + lookY - 1, 4, Math.PI * 0.85, Math.PI * 2.15);
        ctx.stroke();
      } else {
        // Anime shiny eyes
        const eyeRadius = currentReaction === 'alert' ? 4.5 : 3.6;
        const eyeColor = currentSpecies === 'aero' ? '#38BDF8' : '#1A1A24';

        // Left Eye
        ctx.beginPath();
        ctx.ellipse(-eyeOffsetX + lookX, eyeOffsetY + lookY, eyeRadius, eyeRadius * 1.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = eyeColor;
        ctx.fill();

        // Right Eye
        ctx.beginPath();
        ctx.ellipse(eyeOffsetX + lookX, eyeOffsetY + lookY, eyeRadius, eyeRadius * 1.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Catchlight reflections
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-eyeOffsetX + lookX - 1.2, eyeOffsetY + lookY - 1.5, 1.3, 0, Math.PI * 2);
        ctx.arc(eyeOffsetX + lookX - 1.2, eyeOffsetY + lookY - 1.5, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 5. MOUTH ---
      ctx.strokeStyle = currentSpecies === 'aero' ? '#38BDF8' : '#1A1A24';
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';

      if (currentReaction === 'talking') {
        // Dynamic speaking mouth cycle
        const mouthOpen = Math.abs(Math.sin(engine.tick * 0.25)) * 3 + 1.5;
        ctx.beginPath();
        ctx.ellipse(lookX * 0.8, 4.5 + lookY * 0.8, 2.5, mouthOpen, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#E07A5F';
        ctx.fill();
        ctx.stroke();
      } else if (currentReaction === 'alert') {
        ctx.beginPath();
        ctx.arc(lookX * 0.8, 5 + lookY * 0.8, 2, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Cute resting feline smile ("w" shape)
        ctx.beginPath();
        ctx.moveTo(-3 + lookX * 0.8, 3.8 + lookY * 0.8);
        ctx.quadraticCurveTo(-1.5 + lookX * 0.8, 5.5 + lookY * 0.8, 0 + lookX * 0.8, 4.2 + lookY * 0.8);
        ctx.quadraticCurveTo(1.5 + lookX * 0.8, 5.5 + lookY * 0.8, 3 + lookX * 0.8, 3.8 + lookY * 0.8);
        ctx.stroke();
      }

      // --- 6. ARMS / CELEBRATION SPARKLES ---
      if (currentReaction === 'celebrating') {
        ctx.fillStyle = '#FFD166';
        ctx.font = '10px sans-serif';
        ctx.fillText('✨', -24, -14);
        ctx.fillText('✨', 16, -14);
      }

      // --- 7. OUTFIT OVERLAYS (Supported on all mascots) ---
      if (currentOutfit === 'detective') {
        ctx.fillStyle = '#8B5E34';
        ctx.beginPath();
        ctx.ellipse(0, -18, 14, 5, 0, 0, Math.PI * 2);
        ctx.arc(0, -18, 11, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#D4A373';
        ctx.fillRect(-10, -19, 20, 2.5);
      } else if (currentOutfit === 'wizard') {
        ctx.fillStyle = '#5A189A';
        ctx.beginPath();
        ctx.ellipse(0, -17, 16, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-11, -17);
        ctx.lineTo(0, -34);
        ctx.lineTo(11, -17);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#FFD166';
        ctx.font = '8px sans-serif';
        ctx.fillText('★', -3, -21);
      } else if (currentOutfit === 'barista') {
        ctx.strokeStyle = '#2D6A4F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, 4);
        ctx.lineTo(0, 15);
        ctx.lineTo(12, 4);
        ctx.stroke();
        } else if (currentOutfit === 'focus') {
          ctx.fillStyle = '#E07A5F';
          ctx.beginPath();
          safeRoundRect(ctx, -16, -15, 32, 5, 2.5);
          ctx.fill();
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, interactive]);

  const handlePointerDown = () => {
    engineRef.current.boop();
    sounds.playBoop();
    if (onBoop) onBoop();
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      className={`cursor-pointer select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        touchAction: 'none',
      }}
    />
  );
};
