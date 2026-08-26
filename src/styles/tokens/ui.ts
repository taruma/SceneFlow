/**
 * Reusable UI Chrome & Theme Swatch Design Tokens (App Shell Scope)
 * Centralized Tailwind class bundles for uniform surfaces, buttons, modals, swatches, badges, and layout shells.
 * Script paper tokens remain strictly isolated in themes.ts, cues.ts, and typography.ts.
 */

export const UI_TOKENS = {
  // Application layout frames & headers
  layout: {
    appHeader: "h-16 border-b border-stone-200 bg-white flex items-center justify-between px-3 lg:px-6 shrink-0 z-40 shadow-sm transition-all",
    scriptHeader: "h-16 border-b border-stone-200 flex items-center justify-between px-4 lg:px-8 bg-white shrink-0 z-20",
    scriptHeaderPlayback: "h-12 border-b border-stone-200 flex items-center justify-between px-4 lg:px-8 bg-white shrink-0 z-20 sticky top-0 shadow-sm",
    leftPanelBase: "flex flex-col bg-white border-stone-200 z-10",
    rightPanelBase: "bg-stone-50 flex flex-col overflow-hidden relative transition-all duration-500",
    sectionTitle: "text-xs font-black uppercase tracking-[0.2em] text-stone-400",
    sectionTitleMini: "text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-stone-400",
  },

  // Modal containers & overlays
  modal: {
    overlay: "fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300",
    overlayHeavy: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300",
    overlayHighZ: "fixed inset-0 z-[200] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300",
    containerSm: "bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-stone-200",
    containerMd: "bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-stone-200",
    containerLg: "bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-stone-200",
    containerXl: "bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-stone-200 max-h-[90vh] flex flex-col",
    popover: "fixed z-[100] bg-white border border-stone-200 rounded-xl shadow-2xl p-1.5 min-w-[160px] animate-in zoom-in-95 duration-200",
    dialogPad: "p-8 space-y-6 text-center",
    bodyPad: "p-8 lg:p-10 space-y-6",
    title: "text-lg font-bold text-stone-900",
    description: "text-sm text-stone-500 mt-2",
  },

  // Button styles
  button: {
    primary: "px-10 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-900/20",
    primaryBlue: "flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20",
    secondary: "px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
    secondaryWide: "flex-1 py-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95",
    danger: "px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20",
    dangerSubtle: "px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 text-sm font-semibold rounded-lg transition-all active:scale-95",
    iconClose: "p-3 hover:bg-stone-100 rounded-full transition-colors active:scale-90 text-stone-400",
    iconCloseSquare: "p-3 hover:bg-stone-100 rounded-2xl text-stone-400 transition-colors",
    actionPill: "flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-stone-200 shadow-sm",
    actionPillActive: "flex items-center gap-2 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-stone-900 shadow-sm",
    headerControl: "px-3 py-2 bg-stone-100/80 hover:bg-stone-200/80 text-stone-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 border border-stone-200/40 shadow-xs",
    supportPill: "flex items-center gap-1 px-1.5 py-1.5 lg:gap-1.5 lg:px-2 xl:px-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 bg-[#FF5E5B] hover:bg-[#e04e4b] text-white shadow-sm",
  },

  // Form controls & inputs
  input: {
    baseText: "w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-300 transition-all font-mono text-sm",
    textarea: "w-full px-6 py-5 bg-stone-50 border border-stone-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all font-mono text-sm resize-none leading-relaxed",
    textareaCode: "w-full h-[400px] bg-stone-50 border-2 border-stone-100 rounded-3xl p-6 font-mono text-xs text-stone-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none",
    search: "w-full pl-9 pr-8 py-2 bg-stone-100 hover:bg-stone-50 focus:bg-white text-xs text-stone-800 placeholder-stone-400 rounded-xl border border-transparent focus:border-stone-200 shadow-inner focus:shadow-none transition-all outline-none",
    numberBox: "w-full bg-white border border-stone-200 rounded-xl px-2 py-1.5 text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-stone-900/5",
    numberBoxLg: "w-full bg-white border-2 border-blue-100 rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all",
    label: "text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1",
    labelMini: "text-[8px] font-black uppercase tracking-widest text-stone-400",
  },

  // Icon container badges
  iconWrapper: {
    danger: "w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100",
    amber: "w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100",
    neutral: "w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center border border-stone-200",
    blue: "w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm",
    dark: "w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center shadow-lg shadow-stone-900/20",
    smBox: "w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-stone-100 shadow-sm",
  },

  // Badges & Counter tags
  badge: {
    counter: "text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded uppercase",
    counterFaint: "text-[10px] font-bold text-stone-300 bg-stone-100 px-2 py-0.5 rounded uppercase",
    timeTag: "text-[10px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded",
  },

  // Panel & banner containers
  panel: {
    banner: "flex items-center justify-between bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3",
    card: "p-4 bg-stone-50 border border-stone-200 rounded-2xl",
    cardInteractive: "flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-2xl group hover:bg-white hover:shadow-md transition-all relative overflow-hidden cursor-pointer",
    cardInteractiveActive: "flex items-center justify-between p-4 bg-white border-stone-900 ring-1 ring-stone-900 rounded-2xl shadow-md transition-all relative overflow-hidden cursor-pointer",
    emptyPlaceholder: "text-center py-12 border-2 border-dashed border-stone-100 rounded-[2rem] bg-stone-50/50",
  },

  // Theme & Color Swatch Cards
  swatch: {
    card: "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative text-left group",
    cardSelected: "border-stone-900 shadow-md ring-2 ring-stone-900/10",
    cardUnselected: "border-stone-100 hover:border-stone-300 hover:shadow-sm bg-stone-50/50",
    categoryBadge: "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
    pillBase: "w-full text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between text-xs font-semibold",
    pillActive: "border-stone-900 bg-stone-900 text-white shadow-md shadow-stone-900/20",
    pillInactive: "border-stone-200 hover:border-stone-400 bg-white text-stone-700 hover:bg-stone-50",
  },

  // Error alert boxes
  alert: {
    error: "mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-left animate-in slide-in-from-top-2 duration-300",
  }
} as const;

