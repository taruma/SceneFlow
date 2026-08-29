import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { UI_TOKENS } from "../styles/tokens/ui";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface StagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  content: string;
}

export function StagingModal({ isOpen, onClose, label, content }: StagingModalProps) {
  useEscapeKey(onClose, isOpen);


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
            className="absolute inset-0 bg-overlay-bg backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={UI_TOKENS.modal.containerStaging}
          >
            {/* Header */}
            <div className={UI_TOKENS.modal.headerSubtle}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-text-faint animate-pulse" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                  STAGING: {label}
                </h3>
              </div>
              <button
                onClick={onClose}
                className={UI_TOKENS.button.iconCloseSm}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-surface selection:bg-surface-hover">
              <pre className="font-mono text-[11px] leading-relaxed text-text-body whitespace-pre-wrap break-words">
                {content}
              </pre>
            </div>

            {/* Footer */}
            <div className={UI_TOKENS.modal.footer}>
              <button
                onClick={onClose}
                className="text-[9px] font-bold uppercase tracking-widest text-text-faint hover:text-text-main transition-colors"
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
