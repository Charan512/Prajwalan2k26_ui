import React, { useRef } from "react";

/**
 * Aurora Component
 *
 * Creates an animated aurora borealis background effect.
 * Adapted to work without external heavy dependencies, using CSS/Canvas principles
 * to mimic the @react-bits/Aurora-JS-CSS effect.
 *
 * @param {string[]} colorStops - Array of 3 hex colors for the gradient
 * @param {number} amplitude - Controls the intensity/height of the aurora (0.5 to 2)
 * @param {number} blend - Controls the blend/blur intensity (0 to 1)
 */
const Aurora = ({ colorStops = ["#5227FF", "#669c35", "#006d8f"], amplitude = 1, blend = 0.5 }) => {
    const containerRef = useRef(null);

    // Convert hex to rgb for smoother transitions if needed, or use CSS variables
    const colors = colorStops;

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                overflow: "hidden",
                zIndex: 0,
                background: "#000", // Fallback/Base background
            }}
        >
            {/* The "Aurora" layer */}
            <div
                className="aurora-gradient"
                style={{
                    "--aurora-color-1": colors[0],
                    "--aurora-color-2": colors[1],
                    "--aurora-color-3": colors[2],
                    "--aurora-amplitude": amplitude,
                    "--aurora-blend": blend,
                }}
            />
            <style>{`
        .aurora-gradient {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          opacity: 0.8;
          filter: blur(calc(60px * var(--aurora-blend)));
          background-image: 
            repeating-linear-gradient(
              100deg,
              var(--aurora-color-1) 10%,
              var(--aurora-color-3) 20%,
              var(--aurora-color-2) 30%,
              var(--aurora-color-1) 40%
            );
          background-size: 200% 200%;
          animation: aurora-move 20s linear infinite;
          transform: translate3d(0, 0, 0); 
          mix-blend-mode: hard-light;
        }

        .aurora-gradient::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(
              ellipse at 50% 50%, 
              rgba(0, 0, 0, 0) 20%, 
              rgba(0, 0, 0, 0.8) 100%
            );
          mix-blend-mode: multiply;
        }

        @keyframes aurora-move {
          0% {
            background-position: 50% 50%;
          }
          25% {
            background-position: 100% 50%;
            transform: scale(1.1);
          }
          50% {
            background-position: 50% 100%;
            transform: scale(1);
          }
          75% {
            background-position: 0% 50%;
            transform: scale(1.1);
          }
          100% {
              background-position: 50% 50%;
              transform: scale(1);
          }
        }
      `}</style>
        </div>
    );
};

export default Aurora;
