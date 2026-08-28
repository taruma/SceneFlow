import React from 'react';
import { RefreshCw, Info, X, Loader2 } from 'lucide-react';
import { UI_TOKENS } from '../styles/tokens/ui';
import type { ResetConfirmationState } from '../types/script';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface ResetConfirmationModalProps {
  resetConfirmation: ResetConfirmationState;
  isRemoteLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onClearError: () => void;
}

export function ResetConfirmationModal({
  resetConfirmation,
  isRemoteLoading,
  onClose,
  onConfirm,
  onClearError,
}: ResetConfirmationModalProps) {
  useEscapeKey(onClose, resetConfirmation.isOpen);

  if (!resetConfirmation.isOpen) return null;

  return (
    <div 
      className={UI_TOKENS.modal.overlayHighZ}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={UI_TOKENS.modal.containerSm}>

        <div className={UI_TOKENS.modal.dialogPad}>
          <div className={UI_TOKENS.iconWrapper.amber}>
            <RefreshCw size={24} className="text-amber-500" />
          </div>
          <div>
            <h3 className={UI_TOKENS.modal.title}>
              {resetConfirmation.type === 'settings' ? 'Reset Timing Settings?' : 
               resetConfirmation.type === 'blank' ? 'Load Guide Script?' : 
               resetConfirmation.type === 'example' ? `Load "${resetConfirmation.exampleTitle}"?` : 
               resetConfirmation.type === 'remote' ? 'Load Remote Project?' : 'Reset All Data?'}
            </h3>
            <p className={UI_TOKENS.modal.description}>
              {resetConfirmation.type === 'settings' ? 'This will restore all timing buffers to their factory default values.' : 
               resetConfirmation.type === 'blank' ? 'This will load the official guide script and formatting reference in playback mode.' : 
               resetConfirmation.type === 'example' ? `This will replace your current script and cues with the "${resetConfirmation.exampleTitle}" demo.` :
               resetConfirmation.type === 'remote' ? `This will replace your current project with data from: ${resetConfirmation.remoteUrl}. Only load links from sources you trust.` :
               'This will delete all cues and restore the original demo script.'}
            </p>

            {resetConfirmation.error && (
              <div className={UI_TOKENS.alert.error}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-red-500">
                    <Info size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Load Error</p>
                    <p className="text-sm text-red-600 leading-relaxed">{resetConfirmation.error}</p>
                  </div>
                  <button 
                    onClick={onClearError}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              disabled={isRemoteLoading}
              onClick={onClose}
              className={UI_TOKENS.button.secondary}
            >
              Cancel
            </button>
            <button
              disabled={isRemoteLoading}
              onClick={onConfirm}
              className="px-6 py-3 bg-btn-primary-bg text-btn-primary-text rounded-xl font-bold hover:bg-btn-primary-hover transition-all active:scale-95 shadow-lg shadow-surface-dark/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRemoteLoading && <Loader2 size={16} className="animate-spin" />}
              {resetConfirmation.error ? 'Try Again' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
