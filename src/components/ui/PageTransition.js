'use client';

import { motion } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export default function PageTransition({ children, className }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={{ display: 'contents' }}
    >
      {children}
    </motion.div>
  );
}
