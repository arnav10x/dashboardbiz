"use client"
import * as React from 'react';
import confetti from 'canvas-confetti';

export function EarnedCelebration() {
  React.useEffect(() => {
    
    // Fire a cool athletic/premium centered confetti burst
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // premium preset colors
      confetti({
        ...defaults, 
        particleCount, 
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ffffff'],
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, 
        particleCount, 
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ffffff'],
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return null; // pure hook effector Component
}
