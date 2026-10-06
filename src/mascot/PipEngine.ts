import { PipDirection, PipReaction } from '../types';
import { MascotSpecies } from './characters';

export class PipEngine {
  private direction: PipDirection = 'center';
  private reaction: PipReaction = 'idle';
  private outfitId: string = 'classic';
  private species: MascotSpecies = 'pip';
  
  // Squish spring physics
  public scaleX: number = 1.0;
  public scaleY: number = 1.0;
  private velocityX: number = 0;
  private velocityY: number = 0;
  private targetScaleX: number = 1.0;
  private targetScaleY: number = 1.0;
  
  // Spring constants
  private tension: number = 240;
  private friction: number = 18;

  // Animation ticks
  public tick: number = 0;
  public blinkTimer: number = 0;
  public isBlinking: boolean = false;

  constructor() {
    this.blinkTimer = Math.floor(Math.random() * 120) + 60;
  }

  public update(deltaTime: number) {
    this.tick += deltaTime * 60;

    // Blinking logic
    this.blinkTimer -= 1;
    if (this.blinkTimer <= 0) {
      this.isBlinking = !this.isBlinking;
      this.blinkTimer = this.isBlinking ? 8 : Math.floor(Math.random() * 180) + 90;
    }

    // Spring physics update for squishy feel
    const dt = Math.min(deltaTime, 0.05);
    const forceX = -this.tension * (this.scaleX - this.targetScaleX) - this.friction * this.velocityX;
    const forceY = -this.tension * (this.scaleY - this.targetScaleY) - this.friction * this.velocityY;

    this.velocityX += forceX * dt;
    this.velocityY += forceY * dt;

    this.scaleX += this.velocityX * dt;
    this.scaleY += this.velocityY * dt;

    // Clamp micro oscillations
    if (Math.abs(this.scaleX - 1.0) < 0.002 && Math.abs(this.velocityX) < 0.002) {
      this.scaleX = 1.0;
      this.velocityX = 0;
    }
    if (Math.abs(this.scaleY - 1.0) < 0.002 && Math.abs(this.velocityY) < 0.002) {
      this.scaleY = 1.0;
      this.velocityY = 0;
    }
  }

  // Trigger squishy poke/boop
  public boop() {
    this.scaleX = 1.35;
    this.scaleY = 0.65;
    this.velocityX = -1.2;
    this.velocityY = 1.5;
  }

  // Trigger bounce
  public bounce() {
    this.scaleX = 0.85;
    this.scaleY = 1.25;
    this.velocityX = 1.0;
    this.velocityY = -1.4;
  }

  public calculateDirection(cursorX: number, cursorY: number, pipCenterX: number, pipCenterY: number): PipDirection {
    const dx = cursorX - pipCenterX;
    const dy = cursorY - pipCenterY;
    const distance = Math.hypot(dx, dy);

    // If cursor is close, look center
    if (distance < 25) {
      this.direction = 'center';
      return 'center';
    }

    const angle = Math.atan2(dy, dx); // [-PI, PI]
    const deg = (angle * 180) / Math.PI;

    // Discretize into 8 sectors
    if (deg >= -22.5 && deg < 22.5) {
      this.direction = 'right';
    } else if (deg >= 22.5 && deg < 67.5) {
      this.direction = 'down-right';
    } else if (deg >= 67.5 && deg < 112.5) {
      this.direction = 'down';
    } else if (deg >= 112.5 && deg < 157.5) {
      this.direction = 'down-left';
    } else if (deg >= 157.5 || deg < -157.5) {
      this.direction = 'left';
    } else if (deg >= -157.5 && deg < -112.5) {
      this.direction = 'up-left';
    } else if (deg >= -112.5 && deg < -67.5) {
      this.direction = 'up';
    } else {
      this.direction = 'up-right';
    }

    return this.direction;
  }

  public setReaction(reaction: PipReaction) {
    const prev = this.reaction;
    this.reaction = reaction;
    if (prev !== reaction) {
      if (reaction === 'celebrating' || reaction === 'dizzy') {
        this.bounce();
      } else if (reaction === 'love' || reaction === 'blush' || reaction === 'alert') {
        this.boop();
      }
    }
  }

  public getReaction(): PipReaction {
    return this.reaction;
  }

  public getDirection(): PipDirection {
    return this.direction;
  }

  public setOutfit(outfitId: string) {
    this.outfitId = outfitId;
  }

  public getOutfit(): string {
    return this.outfitId;
  }

  public setSpecies(species: MascotSpecies) {
    this.species = species;
  }

  public getSpecies(): MascotSpecies {
    return this.species;
  }
}
