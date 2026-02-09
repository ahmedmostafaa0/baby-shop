import { cn } from "@/lib/utils";
import { NavLink } from "react-router";
import { AnimatePresence, motion } from 'motion/react';

type NavItemProps = {
  to: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
  end?: boolean;
};

const NavItem = ({ to, icon, label, open, end }: NavItemProps) =>  {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center py-3 px-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
          "hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:shadow-lg hover:backdrop-blur-sm",
          isActive
            ? "bg-gradient-to-r from-[#29beb3]/20 to-[#a96bde]/20 text-white shadow-lg shadow-[#29beb3]/20 scale-105 ring-1 ring-[#29beb3]/30 border border-white/10 backdrop-blur-sm"
            : "text-slate-300 hover:scale-102",
          !open && "justify-center"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#29beb3]/30 to-[#a96bde]/30 opacity-30 blur-xl rounded-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "relative z-10 transition-colors duration-200",
              !open && "mr-0",
              open && "mr-3",
              isActive ? "text-white" : "text-slate-300 group-hover:text-white"
            )}
          >
            {icon}
          </motion.div>

          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "relative z-10 font-medium",
                  isActive
                    ? "text-white"
                    : "text-slate-300 group-hover:text-white"
                )}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          {isActive && !open && (
            <motion.div
              className="absolute -right-1 top-1/2 w-2 h-2 bg-gradient-to-br from-[#29beb3] to-[#a96bde] rounded-full shadow-lg"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export default NavItem;
