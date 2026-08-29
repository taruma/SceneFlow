import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, BookOpen, Film, ArrowUpRight, Sparkles } from "lucide-react";
import { EXAMPLE_SECTIONS, Example } from "../examples";
import { useEscapeKey } from "../hooks/useEscapeKey";

function formatDateString(dateStr?: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return `${months[month - 1]} ${day}, ${year}`;
}

interface MobileLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (path: string, title: string) => void;
}

export function MobileLibraryModal({ isOpen, onClose, onSelectExample }: MobileLibraryModalProps) {
  useEscapeKey(onClose, isOpen);

  const [searchQuery, setSearchQuery] = React.useState("");

  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  const categories = ["All", "Featured", ...EXAMPLE_SECTIONS.map((s) => s.label)];

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

  const getFilteredItems = (): Example[] => {
    let items: Example[] = [];
    if (selectedCategory === "All") {
      items = EXAMPLE_SECTIONS.filter((s) => !s.hideFromAll).flatMap((s) => s.items);
    } else if (selectedCategory === "Featured") {
      items = EXAMPLE_SECTIONS.flatMap((s) => s.items.filter((i) => i.featured));
    } else {
      const sec = EXAMPLE_SECTIONS.find((s) => s.label === selectedCategory);
      items = sec ? sec.items : [];
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags?.some((t) => t.toLowerCase().includes(q)) ||
          i.volume?.toLowerCase().includes(q)
      );
    }

    // Default to newest first
    return [...items].sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateB - dateA;
    });
  };

  const itemsList = getFilteredItems();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-h-[88vh] bg-surface border-t border-border-main rounded-t-2xl flex flex-col overflow-hidden text-text-main shadow-2xl"
          >
            {/* Sheet Handle */}
            <div className="pt-2.5 pb-1 flex justify-center items-center">
              <div className="w-10 h-1 bg-surface-muted rounded-full" />
            </div>

            {/* Header */}
            <div className="px-4 py-2.5 border-b border-border-subtle flex items-center justify-between shrink-0 bg-surface-subtle">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-text-main">
                    Library Catalogue
                  </h2>
                  <p className="text-[10px] text-text-muted font-mono">
                    {itemsList.length} script{itemsList.length !== 1 ? "s" : ""} available
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-text-faint hover:text-text-main rounded-full bg-surface-muted hover:bg-surface-hover active:scale-95 transition-all"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 pb-2 shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint" />
                <input
                  type="text"
                  placeholder="Search titles, tags, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-subtle border border-border-main rounded-xl pl-9 pr-8 py-2 text-xs text-text-main placeholder-text-placeholder focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-main"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills (Horizontal Scroll) */}
            <div className="px-3 pb-2 shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
              {categories.map((cat) => {
                const count = getCategoryCount(cat);
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? "bg-amber-500 text-stone-950 font-bold shadow-sm shadow-amber-500/20"
                        : "bg-surface-muted text-text-muted border border-border-main hover:text-text-main active:bg-surface-hover"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                        isSelected
                          ? "bg-stone-950/20 text-stone-950 font-bold"
                          : "bg-surface-hover/80 text-text-faint"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Script List Container */}
            <div className="flex-1 overflow-y-auto custom-dark-scrollbar px-3 py-2 space-y-2.5 divide-y divide-border-subtle">
              {itemsList.length === 0 ? (
                <div className="py-12 text-center text-text-faint font-mono text-xs">
                  No scripts found matching your filter.
                </div>
              ) : (
                itemsList.map((item) => {
                  const categoryLabel = getItemSectionLabel(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectExample(item.path, item.title);
                        onClose();
                      }}
                      className="pt-2.5 first:pt-0 group active:scale-[0.99] transition-transform cursor-pointer"
                    >
                      <div className="p-3 rounded-xl bg-surface-subtle border border-border-main hover:border-amber-500/40 active:bg-surface-hover transition-colors">
                        {/* Meta Tags */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {categoryLabel && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                <Film size={8} />
                                {categoryLabel}
                              </span>
                            )}
                            {item.featured && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-400 text-stone-950 flex items-center gap-0.5 font-bold">
                                <Sparkles size={8} />
                                Featured
                              </span>
                            )}
                          </div>
                          {item.releaseDate && (
                            <span className="text-[10px] text-text-faint font-mono">
                              {formatDateString(item.releaseDate)}
                            </span>
                          )}
                        </div>

                        {/* Title & Arrow */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-xs font-bold text-text-main group-hover:text-amber-500 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <ArrowUpRight size={14} className="text-text-faint shrink-0 group-hover:text-amber-500 transition-colors" />
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed mb-2">
                          {item.description}
                        </p>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-surface-muted text-text-faint border border-border-subtle"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer Action */}
            <div className="p-3 border-t border-border-subtle bg-surface-subtle text-center shrink-0">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-btn-secondary-bg hover:bg-btn-secondary-hover text-btn-secondary-text font-bold text-xs active:scale-[0.99] transition-all"
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
