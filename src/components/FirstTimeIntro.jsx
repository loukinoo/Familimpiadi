/**
 * @file FirstTimeIntro.jsx
 * @description Effetto speciale di benvenuto/ingresso per la prima visualizzazione di un torneo o di una nuova estrazione.
 * Utilizza confetti ed effetti visivi a cascata.
 */

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, RotateCcw } from 'lucide-react';

export default function FirstTimeIntro({ title = "Familimpiadi", storageKey = "tournament_intro_seen", onComplete }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(storageKey);
    if (!hasSeen) {
      setShow(true);
      triggerConfettiEffect();
      localStorage.setItem(storageKey, 'true');
    }
  }, [storageKey]);

  const triggerConfettiEffect = () => {
    // Esplosione confetti da sinistra e destra
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleReplay = () => {
    setShow(true);
    triggerConfettiEffect();
  };

  if (!show) {
    return null;
  }

  return (
    <div className="intro-overlay animate-fade-in" onClick={() => setShow(false)}>
      <div className="intro-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="intro-icon-wrapper">
          <Trophy className="w-16 h-16 text-yellow-400 animate-bounce" />
        </div>
        <h2 className="intro-title">
          Benvenuti a <span className="intro-highlight">{title}</span>! 🏆
        </h2>
        <p className="intro-subtitle">
          Le sfide ufficiali sono aperte! Segui i tabelloni dal vivo e tifa per la tua coppia preferita.
        </p>
        <div className="intro-actions">
          <button className="btn-primary" onClick={() => setShow(false)}>
            Entra nel Torneo 🎉
          </button>
        </div>
      </div>
    </div>
  );
}
