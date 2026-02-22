'use client';

// ============================================
// O2 KANBAN — Motion Presets (Framer Motion)
// ============================================

// --- Transitions ---

export const springTransition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const smoothTransition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
};

export const fastTransition = {
  duration: 0.15,
  ease: [0.25, 0.1, 0.25, 1],
};

// --- Variants ---

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: smoothTransition },
  exit: { opacity: 0, transition: fastTransition },
};

export const slideUp = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: smoothTransition },
  exit: { opacity: 0, y: -4, transition: fastTransition },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: springTransition },
  exit: { opacity: 0, scale: 0.97, transition: fastTransition },
};

// --- Stagger Container ---

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

// --- Modal Variants ---

export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: fastTransition,
  },
};

// --- Card Variants ---

export const cardHover = {
  y: -4,
  transition: springTransition,
};

export const cardTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// --- Toast Variants ---

export const toastVariants = {
  hidden: { opacity: 0, x: 80, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    x: 80,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// --- Chip Variants ---

export const chipVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: fastTransition,
  },
};
