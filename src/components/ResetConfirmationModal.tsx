import React from 'react';
import { RefreshCw, Info, X, Loader2 } from 'lucide-react';

export interface ResetConfirmationState {
  isOpen: boolean;
  type: 'settings' | 'data' | 'blank' | 'example' | 'remote' | null;
  examplePath?: string;
  exampleTitle?: string;
  remoteUrl?: string;
  error?: string | null;
}

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
  if (!resetConfirmation.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-stone-200">
        <div className="p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100">
            <RefreshCw size={24} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {resetConfirmation.type === 'settings' ? 'Reset Timing Settings?' : 
               resetConfirmation.type === 'blank' ? 'Load Guide Script?' : 
               resetConfirmation.type === 'example' ? `Load "${resetConfirmation.exampleTitle}"?` : 
               resetConfirmation.type === 'remote' ? 'Load Remote Project?' : 'Reset All Data?'}
            </h3>
            <p className="text-sm text-stone-500 mt-2">
              {resetConfirmation.type === 'settings' ? 'This will restore all timing buffers to their factory default values.' : 
               resetConfirmation.type === 'blank' ? 'This will load the official guide script and formatting reference in playback mode.' : 
               resetConfirmation.type === 'example' ? `This will replace your current script and cues with the "${resetConfirmation.exampleTitle}" demo.` :
               resetConfirmation.type === 'remote' ? `This will replace your current project with data from: ${resetConfirmation.remoteUrl}. Only load links from sources you trust.` :
               'This will delete all cues and restore the original demo script.'}
            </p>

            {resetConfirmation.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-left animate-in slide-in-from-top-2 duration-300">
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
              className="px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              disabled={isRemoteLoading}
              onClick={onConfirm}
              className="px-6 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
