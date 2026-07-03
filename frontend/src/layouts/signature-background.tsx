const meteors = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 13) % 100}%`,
  delay: `${-(i * 2.3) % 15}s`,
  duration: `${14 + (i % 6) * 2}s`,
  opacity: `${0.15 + (i % 5) * 0.05}`,
  length: `${120 + (i % 4) * 50}px`,
  width: `${1 + (i % 2)}px`,
  angle: `${12 + (i % 7) * 2}deg`,
}));

export function SignatureBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-deep"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:58px_58px] [mask-image:radial-gradient(ellipse_at_top,black_18%,transparent_78%)]" />
      <div className="app-ambient" />

      {meteors.map((meteor, index) => (
        <div
          key={index}
          className="absolute top-0"
          style={{
            left: meteor.left,
            transform: `rotate(${meteor.angle})`,
            transformOrigin: "top",
          }}
        >
          <span
            className="relative block rounded-full bg-gradient-to-b from-transparent to-accent-400 motion-reduce:[animation-play-state:paused]"
            style={
              {
                width: meteor.width,
                height: meteor.length,
                animation: `rod-fall ${meteor.duration} linear ${meteor.delay} infinite`,
                "--rod-opacity": meteor.opacity,
              } as React.CSSProperties
            }
          >
            {/* Meteor Head */}
            <div className="absolute bottom-0 left-1/2 h-2 w-[2px] -translate-x-1/2 rounded-full bg-accent-400 drop-shadow-[0_0_4px_var(--accent-400)]" />
          </span>
        </div>
      ))}
    </div>
  );
}
