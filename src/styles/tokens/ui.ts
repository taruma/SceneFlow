/**
 * Reusable UI Chrome & Theme Swatch Design Tokens (App Shell Scope)
 * Centralized Tailwind class bundles for uniform surfaces, buttons, modals, swatches, badges, and layout shells.
 * Script paper tokens remain strictly isolated in themes.ts, cues.ts, and typography.ts.
 */

export const UI_TOKENS = {
  // Application layout frames & headers
  layout: {
    appHeader: "h-16 border-b border-border-main bg-surface flex items-center justify-between px-3 lg:px-6 shrink-0 z-40 shadow-sm transition-all text-text-main",
    scriptHeader: "h-16 border-b border-border-main flex items-center justify-between px-4 lg:px-8 bg-surface shrink-0 z-20 text-text-main",
    scriptHeaderPlayback: "h-12 border-b border-border-main flex items-center justify-between px-4 lg:px-8 bg-surface shrink-0 z-20 sticky top-0 shadow-sm text-text-main",
    leftPanelBase: "flex flex-col bg-surface border-border-main z-10 text-text-main",
    rightPanelBase: "bg-app flex flex-col overflow-hidden relative transition-all duration-500",
    sectionTitle: "text-xs font-black uppercase tracking-[0.2em] text-text-faint",
    sectionTitleMini: "text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-text-faint",
  },

  // Modal containers & overlays
  modal: {
    overlay: "fixed inset-0 z-[110] flex items-center justify-center p-4 bg-overlay-bg backdrop-blur-sm animate-in fade-in duration-300",
    overlayHeavy: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-overlay-heavy backdrop-blur-sm animate-in fade-in duration-300",
    overlayHighZ: "fixed inset-0 z-[200] flex items-center justify-center p-4 bg-overlay-bg backdrop-blur-sm animate-in fade-in duration-300",
    containerSm: "bg-surface w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border-main text-text-main",
    containerMd: "bg-surface w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border-main text-text-main",
    containerLg: "bg-surface w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border-main text-text-main",
    containerXl: "bg-surface w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-border-main max-h-[90vh] flex flex-col text-text-main",
    containerLibrary: "relative w-full max-w-4xl h-[92vh] sm:h-[85vh] md:h-[80vh] bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border-main text-text-main",
    containerStaging: "relative w-full max-w-2xl max-h-[80vh] bg-surface rounded-xl shadow-2xl overflow-hidden flex flex-col border border-border-main text-text-main",
    header: "flex items-center justify-between px-4 py-3.5 md:px-5 md:py-4 border-b border-border-subtle bg-surface-subtle shrink-0 text-text-main",
    headerSubtle: "flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-subtle shrink-0 text-text-main",
    footer: "px-6 py-3 border-t border-border-subtle bg-surface-subtle flex justify-end shrink-0",
    popover: "fixed z-[100] bg-surface border border-border-main rounded-xl shadow-2xl p-1.5 min-w-[160px] animate-in zoom-in-95 duration-200 text-text-main",
    dialogPad: "p-8 space-y-6 text-center",
    bodyPad: "p-8 lg:p-10 space-y-6",
    title: "text-lg font-bold text-text-main",
    description: "text-sm text-text-muted mt-2",
  },

  // Dropdown menus
  dropdown: {
    menu: "absolute top-full right-0 mt-2 w-44 bg-surface rounded-xl shadow-xl border border-border-main overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 text-text-main",
    menuWide: "absolute top-full right-0 mt-2 w-52 bg-surface rounded-xl shadow-xl border border-border-main overflow-hidden z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 text-text-main",
    header: "p-2 bg-surface-subtle border-b border-border-subtle flex items-center justify-between",
    headerText: "text-[9px] font-black text-text-faint uppercase tracking-widest",
    item: "w-full text-left px-3 py-2 text-xs font-semibold hover:bg-surface-subtle flex items-center justify-between transition-colors text-text-body hover:text-text-main",
    itemActive: "w-full text-left px-3 py-2 text-xs font-semibold bg-surface-subtle text-text-main flex items-center justify-between transition-colors",
  },

  // Button styles
  button: {
    primary: "px-10 py-4 bg-btn-primary-bg text-btn-primary-text rounded-2xl font-bold hover:bg-btn-primary-hover transition-all active:scale-95 shadow-lg shadow-surface-dark/20",
    primaryBlue: "flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20",
    secondary: "px-6 py-3 bg-btn-secondary-bg text-btn-secondary-text rounded-xl font-bold hover:bg-btn-secondary-hover transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
    secondaryWide: "flex-1 py-4 bg-btn-secondary-bg hover:bg-btn-secondary-hover text-btn-secondary-text rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95",
    danger: "px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20",
    dangerSubtle: "px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 text-sm font-semibold rounded-lg transition-all active:scale-95",
    iconClose: "p-3 hover:bg-surface-muted rounded-full transition-colors active:scale-90 text-text-faint hover:text-text-main",
    iconCloseSquare: "p-3 hover:bg-surface-muted rounded-2xl text-text-faint hover:text-text-main transition-colors",
    iconCloseSm: "p-1.5 hover:bg-surface-hover active:scale-95 rounded-full transition-all text-text-faint hover:text-text-main",
    actionPill: "flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-surface-subtle text-text-body rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-border-main shadow-sm",
    actionPillActive: "flex items-center gap-2 px-3 py-1.5 bg-btn-primary-bg text-btn-primary-text rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-btn-primary-bg shadow-sm",
    headerControl: "px-3 py-2 bg-surface-muted hover:bg-surface-hover text-text-body rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 border border-border-subtle-trans shadow-xs",
    supportPill: "flex items-center gap-1 px-1.5 py-1.5 lg:gap-1.5 lg:px-2 xl:px-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 bg-support hover:bg-support-hover text-white shadow-sm",
    headerIconButton: "p-2 rounded-lg transition-all border shadow-sm active:scale-95 flex items-center justify-center bg-surface text-text-muted hover:text-text-main border-border-main",
    headerIconButtonActive: "p-2 rounded-lg transition-all border shadow-sm active:scale-95 flex items-center justify-center bg-btn-primary-bg text-btn-primary-text border-btn-primary-bg",
    modeSwitchContainer: "flex bg-surface-muted p-0.5 lg:p-1 rounded-lg lg:rounded-xl ring-1 ring-border-main scale-90 xl:scale-100",
    modeSwitchActive: "bg-surface shadow-md text-text-main",
    modeSwitchInactive: "text-text-muted hover:text-text-main",
    sortButtonActive: "bg-surface text-text-main shadow-sm",
    sortButtonInactive: "text-text-faint hover:text-text-main",
  },

  // Form controls & inputs
  input: {
    baseText: "w-full pl-10 pr-10 py-3 bg-surface-subtle border border-border-main text-text-main placeholder-text-placeholder rounded-2xl focus:outline-none focus:ring-4 focus:ring-surface-dark/5 focus:border-border-main transition-all font-mono text-sm",
    textarea: "w-full px-6 py-5 bg-surface-subtle border border-border-main text-text-main placeholder-text-placeholder rounded-3xl focus:outline-none focus:ring-4 focus:ring-surface-dark/5 transition-all font-mono text-sm resize-none leading-relaxed",
    textareaCode: "w-full h-[400px] bg-surface-subtle border-2 border-border-subtle rounded-3xl p-6 font-mono text-xs text-text-body focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none",
    search: "w-full pl-9 pr-8 py-2 bg-surface-muted hover:bg-surface-subtle focus:bg-surface text-xs text-text-body placeholder-text-placeholder rounded-xl border border-transparent focus:border-border-main shadow-inner focus:shadow-none transition-all outline-none",
    numberBox: "w-full bg-surface border border-border-main text-text-main rounded-xl px-2 py-1.5 text-[10px] font-mono focus:outline-none focus:ring-2 focus:ring-surface-dark/5",
    numberBoxLg: "w-full bg-surface border-2 border-blue-100 text-text-main rounded-2xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all",
    label: "text-[10px] font-black uppercase tracking-[0.2em] text-text-faint ml-1",
    labelMini: "text-[8px] font-black uppercase tracking-widest text-text-faint",
  },

  // Icon container badges
  iconWrapper: {
    danger: "w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 text-red-500",
    amber: "w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20 text-amber-500",
    neutral: "w-12 h-12 bg-surface-muted rounded-2xl flex items-center justify-center border border-border-main text-text-main",
    blue: "w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-sm text-blue-500",
    dark: "w-12 h-12 bg-btn-primary-bg text-btn-primary-text rounded-2xl flex items-center justify-center shadow-md",
    smBox: "w-8 h-8 bg-surface rounded-lg flex items-center justify-center border border-border-subtle shadow-sm text-text-main",
  },

  // Badges & Counter tags
  badge: {
    counter: "text-[10px] font-bold text-text-faint bg-surface-muted px-2 py-0.5 rounded uppercase",
    counterFaint: "text-[10px] font-bold text-text-placeholder bg-surface-muted px-2 py-0.5 rounded uppercase",
    timeTag: "text-[10px] font-mono font-bold text-text-faint bg-surface-muted px-1.5 py-0.5 rounded",
    currentTimePill: "hidden lg:flex items-center gap-2 px-3 xl:px-4 py-2 bg-surface-dark rounded-xl shadow-inner animate-in fade-in zoom-in duration-500 text-btn-primary-text",
  },

  // Panel & banner containers
  panel: {
    banner: "flex items-center justify-between bg-surface-subtle border border-border-main rounded-2xl px-4 py-3 text-text-main",
    card: "p-4 bg-surface-subtle border border-border-main rounded-2xl text-text-main",
    cardInteractive: "flex items-center justify-between p-4 bg-surface-subtle border border-border-main rounded-2xl group hover:bg-surface hover:shadow-md transition-all relative overflow-hidden cursor-pointer text-text-main",
    cardInteractiveActive: "flex items-center justify-between p-4 bg-surface border-text-main ring-1 ring-text-main rounded-2xl shadow-md transition-all relative overflow-hidden cursor-pointer text-text-main",
    emptyPlaceholder: "text-center py-12 border-2 border-dashed border-border-subtle rounded-[2rem] bg-surface-subtle/50 text-text-faint",
    legendContainer: "flex flex-wrap gap-2 p-3 bg-surface-subtle border border-border-main rounded-2xl text-text-main",
  },

  // Theme & Color Swatch Cards
  swatch: {
    card: "p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative text-left group",
    cardSelected: "border-text-main shadow-md ring-2 ring-text-main/10",
    cardUnselected: "border-border-subtle hover:border-border-main hover:shadow-sm bg-surface-subtle/50",
    categoryBadge: "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
    pillBase: "w-full text-left px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between text-xs font-semibold",
    pillActive: "border-btn-primary-bg bg-btn-primary-bg text-btn-primary-text shadow-md shadow-surface-dark/20",
    pillInactive: "border-border-main hover:border-border-main bg-surface text-text-body hover:bg-surface-subtle",
  },

  // Error alert boxes
  alert: {
    error: "mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-left animate-in slide-in-from-top-2 duration-300 text-red-800",
  }
} as const;
