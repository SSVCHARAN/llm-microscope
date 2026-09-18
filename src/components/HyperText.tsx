import React, { useEffect, useRef, useState } from "react";

// Minimal cn polyfill since we don't have clsx/tailwind-merge setup, or just use template literals
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type CharacterSet = string[] | readonly string[];

interface HyperTextProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  animateOnHover?: boolean;
  characterSet?: CharacterSet;
  triggerAnimation?: boolean;
}

const DEFAULT_CHARACTER_SET = Object.freeze(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
) as readonly string[];

const getRandomInt = (max: number): number => Math.floor(Math.random() * max);

export function HyperText({
  children,
  className,
  duration = 800,
  delay = 0,
  animateOnHover = false,
  characterSet = DEFAULT_CHARACTER_SET,
  triggerAnimation = true
}: HyperTextProps) {
  const [displayText, setDisplayText] = useState<string[]>(() => children.split(""));
  const [isAnimating, setIsAnimating] = useState(false);
  const iterationCount = useRef(0);

  // Sync when children change
  useEffect(() => {
    setDisplayText(children.split(""));
    if (triggerAnimation) {
      setTimeout(() => setIsAnimating(true), delay);
    }
  }, [children, triggerAnimation, delay]);

  const handleAnimationTrigger = () => {
    if (animateOnHover && !isAnimating) {
      iterationCount.current = 0;
      setIsAnimating(true);
    }
  };

  useEffect(() => {
    let animationFrameId: number | null = null;

    if (isAnimating) {
      const maxIterations = children.length;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        iterationCount.current = progress * maxIterations;

        setDisplayText((currentText) =>
          currentText.map((letter, index) =>
            children[index] === " " || children[index] === "\n"
              ? children[index]
              : index <= iterationCount.current
                ? children[index]
                : characterSet[getRandomInt(characterSet.length)]
          )
        );

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [children, duration, isAnimating, characterSet]);

  return (
    <div
      className={cn("overflow-hidden font-bold", className)}
      onMouseEnter={handleAnimationTrigger}
    >
      {displayText.map((letter, index) => (
        <span
          key={index}
          className={cn("font-mono", letter === " " ? "w-3 inline-block" : "")}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}
