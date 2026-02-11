"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export default function PageTransition({ children }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname}
        initial={{ opacity: 0, scale: 0.92, y: 40,
          filter: "blur(8px)",
          rotateX: 8,
        }}
        animate={{ opacity: 1, scale: 1, y: 0,
          filter: "blur(0px)",
          rotateX: 0,
        }}
        exit={{ opacity: 0, scale: 0.96, y: -20,
          filter: "blur(6px)",
        }}
        transition={{ type: "spring", stiffness: 140, damping: 18,
          mass: 0.6,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
