import confetti from 'canvas-confetti';

export function fireSuccessConfetti() {
  const count = 70;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#C9A96E', '#F2F1EE', '#6FCF97', '#D4AF37'],
    disableForReducedMotion: true,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 45,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.1,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 35,
  });
}
