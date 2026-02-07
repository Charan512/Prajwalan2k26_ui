import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Boxes = ({ className, disableHover = false, ...rest }) => {
    // Much smaller grid for better performance
    const rows = new Array(15).fill(1);  // Balanced for coverage
    const cols = new Array(20).fill(1);  // Balanced for coverage

    const colors = [
        "#0ea5e9", // sky
        "#ec4899", // pink
        "#10b981", // green
        "#f59e0b", // yellow
        "#ef4444", // red
        "#a855f7", // purple
        "#3b82f6", // blue
        "#6366f1", // indigo
        "#8b5cf6", // violet
    ];

    const getRandomColor = () => {
        return colors[Math.floor(Math.random() * colors.length)];
    };

    return (
        <div
            style={{
                transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
            }}
            className={cn(
                "absolute left-1/4 p-4 -top-1/4 flex -translate-x-1/2 -translate-y-1/2 w-full h-full z-0 opacity-20",
                className
            )}
            {...rest}
        >
            {rows.map((_, i) => (
                <motion.div
                    key={`row` + i}
                    style={{ width: '64px', height: '32px', borderLeft: '1px solid rgb(51, 65, 85)', position: 'relative' }}
                >
                    {cols.map((_, j) => (
                        <motion.div
                            whileHover={disableHover ? {} : {
                                backgroundColor: getRandomColor(),
                                transition: { duration: 0 },
                            }}
                            animate={{
                                transition: { duration: 2 },
                            }}
                            key={`col` + j}
                            style={{ width: '64px', height: '32px', borderRight: '1px solid rgb(51, 65, 85)', borderTop: '1px solid rgb(51, 65, 85)', position: 'relative' }}
                        >
                            {j % 2 === 0 && i % 2 === 0 ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="absolute h-6 w-10 -top-[14px] -left-[22px] text-slate-700 stroke-[1px] pointer-events-none"
                                    style={{ position: 'absolute', height: '24px', width: '40px', top: '-14px', left: '-22px', color: 'rgb(51, 65, 85)', strokeWidth: '1px', pointerEvents: 'none' }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6v12m6-6H6"
                                    />
                                </svg>
                            ) : null}
                        </motion.div>
                    ))}
                </motion.div>
            ))}
        </div>
    );
};
