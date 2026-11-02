"use client";

import { animate, createTimeline, stagger } from "animejs";

/**
 * Anime.js v4 Animation Engine for Vydex / Lexora
 * Providing bespoke, awards-caliber UI animations, physics,
 * spring easings, and staggering.
 */

export const animeAnimations = {
  /**
   * Hero entrance orchestration
   */
  heroEntrance: (targets: {
    badge?: string | HTMLElement | null;
    title?: string | HTMLElement | null;
    description?: string | HTMLElement | null;
    cta?: string | HTMLElement | null;
    cards?: string | HTMLElement[] | NodeListOf<Element> | null;
  }) => {
    if (typeof window === "undefined") return null;

    const tl = createTimeline({
      defaults: {
        ease: "outQuad",
      },
    });

    if (targets.badge) {
      tl.add(targets.badge, {
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.92, 1],
        duration: 650,
      });
    }

    if (targets.title) {
      tl.add(
        targets.title,
        {
          opacity: [0, 1],
          translateY: [35, 0],
          duration: 850,
        },
        "-=450"
      );
    }

    if (targets.description) {
      tl.add(
        targets.description,
        {
          opacity: [0, 1],
          translateY: [25, 0],
          duration: 750,
        },
        "-=550"
      );
    }

    if (targets.cta) {
      tl.add(
        targets.cta,
        {
          opacity: [0, 1],
          translateY: [20, 0],
          scale: [0.95, 1],
          duration: 700,
        },
        "-=500"
      );
    }

    if (targets.cards) {
      tl.add(
        targets.cards,
        {
          opacity: [0, 1],
          translateY: [40, 0],
          duration: 900,
          delay: stagger(120),
        },
        "-=450"
      );
    }

    return tl;
  },

  /**
   * Stagger entrance for grid cards (decks, features, stats)
   */
  staggerCards: (selectorOrElements: string | HTMLElement[] | NodeListOf<Element>) => {
    if (typeof window === "undefined") return null;
    try {
      return animate(selectorOrElements as any, {
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.96, 1],
        delay: stagger(60, { start: 80 }),
        duration: 750,
        ease: "outQuad",
      });
    } catch {
      return null;
    }
  },

  /**
   * Smooth kinetic float for squircle cards
   */
  floatSquircle: (target: string | HTMLElement, direction = 1) => {
    if (typeof window === "undefined" || !target) return null;
    try {
      return animate(target as any, {
        translateY: [-10 * direction, 10 * direction],
        duration: 4000 + Math.random() * 1500,
        alternate: true,
        loop: true,
        ease: "inOutSine",
      });
    } catch {
      return null;
    }
  },

  /**
   * Modal pop-in
   */
  modalIn: (modalContentTarget: string | HTMLElement) => {
    if (typeof window === "undefined" || !modalContentTarget) return null;
    try {
      return animate(modalContentTarget as any, {
        opacity: [0, 1],
        scale: [0.92, 1],
        translateY: [20, 0],
        duration: 450,
        ease: "outQuad",
      });
    } catch {
      return null;
    }
  },

  /**
   * Animated numeric counter for stats
   */
  countNumber: (
    target: { value: number },
    endVal: number,
    onUpdate: (val: number) => void,
    duration = 1500
  ) => {
    if (typeof window === "undefined") return null;
    try {
      return animate(target, {
        value: endVal,
        duration,
        ease: "outQuad",
        onUpdate: () => {
          onUpdate(Math.round(target.value));
        },
      });
    } catch {
      return null;
    }
  },
};

export { animate, createTimeline, stagger };
