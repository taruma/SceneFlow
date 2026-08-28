import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, BookOpen, Film, Notebook, Compass, ArrowUpRight, Lock, Clapperboard, Sparkles } from "lucide-react";
import { EXAMPLE_SECTIONS, Example } from "../examples";
import { UI_TOKENS } from "../styles/tokens/ui";
import { useEscapeKey } from "../hooks/useEscapeKey";

function formatDateString(dateStr?: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `${months[month - 1]} ${day}, ${year}`;
}

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (path: string, title: string) => void;
}

export function LibraryModal({ isOpen, onClose, onSelectExample }: LibraryModalProps) {
  useEscapeKey(onClose, isOpen);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [sortBy, setSortBy] = React.useState<"newest" | "oldest" | "alphabetical">("newest");


  // Handle reset search if requested
  const handleClearSearch = () => setSearchQuery("");

  const categories = ["All", "Featured", ...EXAMPLE_SECTIONS.map((s) => s.label)];

  // Get total items counts for badges
  const getCategoryCount = (category: string) => {
    if (category === "All") {
      return EXAMPLE_SECTIONS.filter((s) => !s.hideFromAll).reduce((sum, s) => sum + s.items.length, 0);
    }
    if (category === "Featured") {
      return EXAMPLE_SECTIONS.reduce((sum, s) => sum + s.items.filter((item) => item.featured).length, 0);
    }
    const sec = EXAMPLE_SECTIONS.find((s) => s.label === category);
    return sec ? sec.items.length : 0;
  };

  const getItemSectionLabel = (itemId: string): string => {
    const sec = EXAMPLE_SECTIONS.find((s) => s.items.some((item) => item.id === itemId));
    return sec ? sec.label : "";
  };

  // Filter examples based on search and selected category
  const filteredSections = (selectedCategory === "All"
    ? [
        {
          label: "All Works",
          icon: "compass",
          items: EXAMPLE_SECTIONS.filter((s) => !s.hideFromAll).flatMap((s) => s.items),
        },
      ]
    : selectedCategory === "Featured"
    ? [
        {
          label: "Featured Works",
          icon: "sparkles",
          items: EXAMPLE_SECTIONS.flatMap((s) => s.items).filter((item) => item.featured),
        },
      ]
    : EXAMPLE_SECTIONS.map((section) => {
        // Determine if we should show this section based on category selection
        const matchesCategory = selectedCategory === section.label;

        if (!matchesCategory) {
          return { ...section, items: [] };
        }

        return section;
      })
  ).map((section) => {
    const matchedItems = section.items.filter((item) => {
      const formattedDate = formatDateString(item.releaseDate);
      const tagsStr = item.tags ? item.tags.join(" ") : "";
      const matchText = `${item.title} ${item.description} ${item.releaseDate || ""} ${formattedDate} ${tagsStr} ${item.volume || ""}`.toLowerCase();
      return matchText.includes(searchQuery.toLowerCase());
    });

    const sortedItems = [...matchedItems].sort((a, b) => {
      // Prioritize items with path (not disabled) to be at the top, and push those without path (disabled) to the bottom
      const disabledA = !a.path;
      const disabledB = !b.path;
      if (disabledA && !disabledB) return 1;
      if (!disabledA && disabledB) return -1;

      if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      }

      const rA = a.releaseDate || "";
      const rB = b.releaseDate || "";

      // Push items without release date to the bottom in chronological contexts
      if (!rA && rB) return 1;
      if (rA && !rB) return -1;
      if (!rA && !rB) return a.title.localeCompare(b.title);

      if (sortBy === "newest") {
        return rB.localeCompare(rA) || a.title.localeCompare(b.title);
      } else {
        return rA.localeCompare(rB) || a.title.localeCompare(b.title);
      }
    });

    return {
      ...section,
      items: sortedItems,
    };
  }).filter((section) => section.items.length > 0);

  const totalFilteredCount = filteredSections.reduce((sum, s) => sum + s.items.length, 0);

  // Helper to assign icons to categories conceptually or from config
  const getCategoryIcon = (label: string, size = 14) => {
    if (label === "All") return <Compass size={size} />;
    if (label === "Featured" || label === "Featured Works") {
      return <Sparkles size={size} className="text-amber-500 fill-amber-500/10" />;
    }
    const section = EXAMPLE_SECTIONS.find((s) => s.label === label);
    const icon = section?.icon || "";
    switch (icon.toLowerCase()) {
      case "film":
        return <Film size={size} className="text-amber-500" />;
      case "notebook":
        return <Notebook size={size} className="text-emerald-500" />;
      case "clapperboard":
        return <Clapperboard size={size} className="text-rose-500" />;
      case "bookopen":
      case "book-open":
        return <BookOpen size={size} className="text-indigo-400" />;
      default:
        const cleanLabel = label.toLowerCase();
        if (cleanLabel.includes("film") || cleanLabel.includes("short") || cleanLabel.includes("scene")) return <Film size={size} className="text-amber-500" />;
        if (cleanLabel.includes("written") || cleanLabel.includes("motion")) return <Notebook size={size} className="text-emerald-500" />;
        return <BookOpen size={size} className="text-text-faint" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 hidden lg:flex items-center justify-center p-2 sm:p-4 lg:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-overlay-bg backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className={UI_TOKENS.modal.containerLibrary}
          >
            {/* Header: Title & Close Button */}
            <div className={UI_TOKENS.modal.header}>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-btn-primary-bg text-btn-primary-text rounded-lg">
                  <BookOpen size={14} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-main leading-none">
                    Library Catalogue
                  </h3>
                  <p className="text-[9px] text-text-faint font-mono tracking-wide mt-1">Explore scripts, interactive examples & custom volumes</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={UI_TOKENS.button.iconCloseSm}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Filter bar: Live Search */}
            <div className="p-3 md:p-4 border-b border-border-subtle bg-surface-subtle flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scripts, themes, volumes..."
                  className={UI_TOKENS.input.search}
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[9px] font-black uppercase tracking-widest text-text-faint hover:text-text-main transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Sort selector controls */}
                <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-border-subtle-trans w-full sm:w-auto">
                  <button
                    onClick={() => setSortBy("newest")}
                    className={`flex-1 sm:flex-initial text-center px-3 py-1.5 md:px-2.5 md:py-1 text-[10px] md:text-[9px] font-bold tracking-wider uppercase rounded-lg transition-all ${
                      sortBy === "newest"
                        ? UI_TOKENS.button.sortButtonActive
                        : UI_TOKENS.button.sortButtonInactive
                    }`}
                  >
                    Latest
                  </button>
                  <button
                    onClick={() => setSortBy("oldest")}
                    className={`flex-1 sm:flex-initial text-center px-3 py-1.5 md:px-2.5 md:py-1 text-[10px] md:text-[9px] font-bold tracking-wider uppercase rounded-lg transition-all ${
                      sortBy === "oldest"
                        ? UI_TOKENS.button.sortButtonActive
                        : UI_TOKENS.button.sortButtonInactive
                    }`}
                  >
                    Oldest
                  </button>
                  <button
                    onClick={() => setSortBy("alphabetical")}
                    className={`flex-1 sm:flex-initial text-center px-3 py-1.5 md:px-2.5 md:py-1 text-[10px] md:text-[9px] font-bold tracking-wider uppercase rounded-lg transition-all ${
                      sortBy === "alphabetical"
                        ? UI_TOKENS.button.sortButtonActive
                        : UI_TOKENS.button.sortButtonInactive
                    }`}
                  >
                    A-Z
                  </button>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono text-text-faint px-1">
                  <Compass size={12} />
                  <span>Showing {totalFilteredCount} matching entries</span>
                </div>
              </div>
            </div>

            {/* Main Segmented Area */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Column: Category Sidebar */}
              <div className="w-full md:w-56 bg-surface-subtle border-b md:border-b-0 md:border-r border-border-subtle flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto p-2.5 md:p-2 gap-1.5 md:gap-1 scrollbar-hide shrink-0 touch-pan-x md:touch-pan-y">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  const count = getCategoryCount(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center justify-between md:justify-between gap-2.5 px-3.5 py-2.5 md:px-3 md:py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all shrink-0 md:shrink [content-visibility:auto] ${
                        isActive
                          ? "bg-btn-primary-bg text-btn-primary-text shadow-sm"
                          : "text-text-muted hover:bg-surface-hover hover:text-text-main select-none"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {cat === "All" ? <Compass size={14} /> : getCategoryIcon(cat)}
                        <span>{cat}</span>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                          isActive ? "bg-white/20 text-white" : "bg-surface-hover text-text-body"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Interactive Grid */}
              <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-4 md:space-y-6">
                {filteredSections.length > 0 ? (
                  filteredSections.map((section) => (
                    <div key={section.label} className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
                        {getCategoryIcon(section.label)}
                        <h4 className="text-[10px] font-bold text-text-faint uppercase tracking-[0.15em]">
                          {section.label}
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
                        {section.items.map((example) => {
                          const isDisabled = !example.path;
                          return (
                            <button
                              key={example.id}
                              disabled={isDisabled}
                              onClick={() => {
                                if (isDisabled) return;
                                onSelectExample(example.path, example.title);
                                onClose();
                              }}
                              className={`group flex flex-col items-start justify-between p-3 md:p-3.5 w-full text-left border rounded-xl transition-all duration-300 relative overflow-hidden ${
                                isDisabled
                                  ? "bg-surface-subtle/60 border-border-main/50 opacity-60 cursor-not-allowed"
                                  : example.featured
                                    ? "bg-amber-50/[0.25] border-amber-200/80 hover:border-amber-400 shadow-[0_2px_8px_rgba(245,158,11,0.02)] hover:shadow-[0_6px_22px_rgba(245,158,11,0.07)] hover:bg-amber-50/[0.45] active:scale-[0.98] cursor-pointer"
                                    : "bg-surface border-border-subtle hover:border-border-main hover:shadow-md active:scale-[0.98] cursor-pointer"
                              }`}
                            >
                              <div className="w-full">
                                {/* Section Category Indicator Row */}
                                {(selectedCategory === "All" || selectedCategory === "Featured") && (() => {
                                  const itemSecLabel = getItemSectionLabel(example.id);
                                  return (
                                    <div className={`flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md w-fit border transition-all ${
                                      example.featured
                                        ? "bg-amber-100/40 border-amber-200/30 text-amber-850"
                                        : "bg-surface-muted border-border-subtle-trans text-text-muted"
                                    }`}>
                                      <span className="shrink-0 flex items-center justify-center">
                                        {getCategoryIcon(itemSecLabel, 10)}
                                      </span>
                                      <span className={`text-[8.5px] font-black uppercase tracking-[0.12em] ${
                                        example.featured ? "text-amber-900/80" : "text-text-muted"
                                      }`}>
                                        {itemSecLabel}
                                      </span>
                                    </div>
                                  );
                                })()}

                                {/* Top Metadata: Date & Volume indicator */}
                                <div className="flex flex-wrap items-center gap-1.5 mb-1.5 w-full">
                                  {example.featured && (
                                    <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-amber-700 bg-amber-100/55 border border-amber-200/45 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                      <Sparkles size={8} className="text-amber-500 fill-amber-500/10 animate-[pulse_2s_infinite]" />
                                      Featured
                                    </span>
                                  )}
                                  {example.releaseDate && (
                                    <span className="text-[9px] font-mono text-text-faint tracking-tight">
                                      {formatDateString(example.releaseDate)}
                                    </span>
                                  )}
                                  {example.releaseDate && example.volume && (
                                    <span className="text-text-faint select-none text-[9px]">•</span>
                                  )}
                                  {example.volume && (
                                    <span className={`text-[8px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md ${
                                      isDisabled
                                        ? "bg-surface-hover text-text-faint"
                                        : example.featured
                                          ? "bg-amber-100/70 text-amber-800 border border-amber-200/20"
                                          : "bg-amber-100/70 text-amber-700 border border-amber-200/10"
                                    }`}>
                                      {example.volume}
                                    </span>
                                  )}
                                </div>

                                {/* Primary Title block */}
                                <div className="flex items-start justify-between gap-2.5 w-full">
                                  <span className={`text-xs font-bold leading-snug transition-colors ${
                                    example.featured 
                                      ? "text-amber-950 group-hover:text-amber-900" 
                                      : "text-text-body group-hover:text-text-main"
                                  }`}>
                                    {example.title}
                                  </span>
                                  {isDisabled ? (
                                    <Lock
                                      size={11}
                                      className="text-text-faint group-hover:text-text-muted transition-colors shrink-0 mt-0.5"
                                    />
                                  ) : (
                                    <ArrowUpRight
                                      size={12}
                                      className={`transition-all shrink-0 mt-0.5 ${
                                        example.featured
                                          ? "text-amber-400 group-hover:text-amber-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                          : "text-text-faint group-hover:text-text-body group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                      }`}
                                    />
                                  )}
                                </div>

                                {/* Script Description */}
                                <p className={`text-[10.5px] md:text-[10px] font-medium leading-relaxed mt-1.5 ${
                                  example.featured ? "text-amber-800/80" : "text-text-muted"
                                }`}>
                                  {example.description}
                                </p>
                                
                                {/* Segmented Tags badges line */}
                                {example.tags && example.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-3.5">
                                    {example.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className={`text-[8px] font-mono font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md border transition-all duration-200 ${
                                          isDisabled
                                            ? "bg-surface-muted text-text-faint border-border-subtle-trans"
                                            : example.featured
                                              ? "bg-amber-100/40 text-amber-800 border-amber-200/30 group-hover:bg-amber-100/70 group-hover:text-amber-950 group-hover:border-amber-300/40"
                                              : "bg-surface-muted text-text-muted border-border-subtle-trans group-hover:bg-surface-hover group-hover:text-text-main group-hover:border-border-main"
                                        }`}
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <BookOpen size={24} className="text-text-faint animate-pulse mb-3" />
                    <h5 className="text-xs font-bold text-text-body">No matching scripts found</h5>
                    <p className="text-[10px] text-text-faint max-w-xs mt-1">
                      Try resetting your search query or selecting a different category from the sidebar menu instead.
                    </p>
                    <button
                      onClick={handleClearSearch}
                      className="mt-4 px-3 py-1.5 bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover active:scale-95 text-[9px] font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all"
                    >
                      Reset Filter
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border-subtle bg-surface-subtle flex items-center justify-between">
              <span className="hidden sm:inline text-[8px] font-mono text-text-faint">
                Press <kbd className="bg-surface-muted border border-border-main rounded px-1 text-[7px] text-text-muted font-bold">ESC</kbd> to exit at any time.
              </span>
              <button
                onClick={onClose}
                className="text-[10px] sm:text-[9px] font-bold uppercase tracking-widest text-text-muted hover:text-text-main transition-colors p-1 md:p-0 ml-auto sm:ml-0"
              >
                Close Catalogue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
