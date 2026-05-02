"use client"

import { useState } from "react"
import clsx from "clsx"
import { motion, AnimatePresence } from "framer-motion"

import { iconMap } from "./content/iconMap"
import { Logo } from "../Logo"
import { SidebarLink } from "./SidebarLink"
import { SidebarCollapsible } from "./SidebarCollapsible"
import SidebarUserFooter from "./SidebarUserFooter"

export default function SidebarBase({ menu, user }) {
  const [minimized, setMinimized] = useState(false)

  const sidebarVariants = {
    hidden: { x: -100, opacity: 0, scale: 0.98, filter: "blur(4px)" },
    visible: { x: 0, opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { x: -80, opacity: 0, scale: 0.98, filter: "blur(2px)" },
  }

  const linkVariants = {
    initial: { opacity: 0, x: -20 },
    animate: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.03, type: "spring", stiffness: 200, damping: 18 },
    }),
  }

  return (
    <AnimatePresence mode="wait">
      <motion.aside key="sidebar" initial="hidden" animate="visible" exit="exit"
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className={clsx(
          "h-screen bg-white border-r border-slate-200 flex flex-col shadow-lg animate-transition transition-transform",
          minimized ? "w-[80px]" : "w-64"
        )}
        style={{ transformOrigin: "left center" }}
      >
        <div
          className={clsx(
            "border-b border-slate-200 flex items-center justify-between",
            minimized ? "px-4 py-[22px]" : "px-6 py-[21px]"
          )}
        >
          <Logo
            minimized={minimized}
            onToggle={() => setMinimized((v) => !v)}
          />
        </div>

        <nav
          className={clsx(
            "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300",
            minimized ? "px-2 py-4 space-y-2" : "px-4 py-5 space-y-3"
          )}
        >
          {menu.map((item, idx) => {
            const Icon = iconMap[item.icon]
            if (!Icon) return null

            if (item.type === "link") {
              return (
                <motion.div key={item.href} custom={idx} initial="initial" animate="animate" whileHover="hover" variants={linkVariants}>
                  <SidebarLink href={item.href} icon={Icon} minimized={minimized}>
                    {item.label}
                  </SidebarLink>
                </motion.div>
              )
            }

            if (item.type === "group") {
              return (
                <motion.div key={item.label} custom={idx} initial="initial" animate="animate" whileHover="hover" variants={linkVariants}>
                  <SidebarCollapsible title={item.label} icon={Icon} badge={item.badge} items={item.items} minimized={minimized} />
                </motion.div>
              )
            }

            return null
          })}
        </nav>

        {user && <SidebarUserFooter user={user} minimized={minimized} />}
      </motion.aside>
    </AnimatePresence>
  )
}
