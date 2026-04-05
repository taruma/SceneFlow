
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface StagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  content: string;
}

export function StagingModal({ isOpen, onClose, label, content }: StagingModalProps) {
  // Close on escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-stone-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-stone-400 animate-pulse" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
                  STAGING: {label}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-stone-200 rounded-full transition-colors text-stone-400 hover:text-stone-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-white selection:bg-stone-200">
              <pre className="font-mono text-[11px] leading-relaxed text-stone-600 whitespace-pre-wrap break-words">
                {content}
              </pre>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/30 flex justify-end">
              <button
                onClick={onClose}
                className="text-[9px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
              >
                Click to Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
