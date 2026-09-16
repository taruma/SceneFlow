import React from 'react';
import { ListTree, ChevronDown, ChevronRight } from 'lucide-react';
import { TocItem } from '../types';
import { cn } from '../../../lib/utils';

interface ScriptOutlineSidebarProps {
  showToc: boolean;
  tocItems: TocItem[];
  visibleTocItems: TocItem[];
  activeTocId: string | null;
  descendantCountMap: Map<string, number>;
  collapsibleItemIds: string[];
  areAllCollapsed: boolean;
  collapsedSectionIds: Set<string>;
  toggleSectionCollapse: (id: string, e?: React.MouseEvent) => void;
  toggleCollapseAll: (e?: React.MouseEvent) => void;
  handleNavigateToSection: (item: TocItem) => void;
}

interface OutlineItemRowProps {
  item: TocItem;
  isActive: boolean;
  descendantCount: number;
  isCollapsed: boolean;
  onNavigate: (item: TocItem) => void;
  onToggleCollapse: (id: string, e?: React.MouseEvent) => void;
}

const OutlineItemRow = React.memo(function OutlineItemRow({
  item,
  isActive,
  descendantCount,
  isCollapsed,
  onNavigate,
  onToggleCollapse,
}: OutlineItemRowProps) {
  const hasChildren = descendantCount > 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseDown={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate(item);
        }
      }}
      onClick={() => onNavigate(item)}
      title={`Jump to line ${item.lineIdx + 1}: ${item.title}`}
      className={cn(
        "group w-full text-left rounded-md transition-colors flex items-center justify-between gap-1.5 select-none cursor-pointer [content-visibility:auto] [contain-intrinsic-size:26px]",
        item.level === 0 ? "py-1 pl-1.5 pr-2 mt-1.5 first:mt-0 font-bold" : 
        item.level === 1 ? "py-1 pl-4 pr-2 font-semibold" : 
        item.level === 2 ? "py-0.5 pl-6 pr-2 font-medium" : 
        "py-0.5 pl-8 pr-2 font-normal",
        isActive
          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold ring-1 ring-inset ring-purple-500/25"
          : "hover:bg-surface-hover/80 text-text-body hover:text-text-main"
      )}
    >
      <div className="flex items-center gap-1 min-w-0 flex-1">
        {/* Collapsible Chevron Button or Placeholder */}
        {hasChildren ? (
          <button
            type="button"
            aria-label={isCollapsed ? `Expand ${item.title}` : `Collapse ${item.title}`}
            onClick={(e) => onToggleCollapse(item.id, e)}
            className="w-4 h-4 flex items-center justify-center -ml-0.5 rounded text-text-faint hover:text-text-main hover:bg-surface-hover transition-colors shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight size={11} className="text-text-muted transition-transform" />
            ) : (
              <ChevronDown size={11} className="text-text-muted transition-transform" />
            )}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {/* Dot / bullet indicator based on type & level */}
        {item.type === 'part' && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
        )}
        {item.type === 'scene' && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
        )}
        {item.type === 'heading' && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
        )}
        {item.type === 'staging' && (
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
        )}
        {item.type === 'brief' && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        )}
        {item.type === 'directive' && (
          <span className="w-1 h-1 rounded-full bg-text-faint/50 group-hover:bg-purple-400 shrink-0" />
        )}

        {/* Title */}
        <span className={cn(
          "truncate",
          item.level === 0 && "text-[11px] text-text-main",
          item.level === 1 && "text-[10.5px]",
          item.level === 2 && "text-[10px]",
          item.level >= 3 && "text-[9.5px] text-text-muted group-hover:text-text-main tracking-wide"
        )}>
          {item.title}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* Collapsed Badge Indicator */}
        {isCollapsed && hasChildren && (
          <span 
            className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-surface border border-border-subtle text-text-faint group-hover:text-purple-500 transition-colors"
            title={`${descendantCount} nested ${descendantCount === 1 ? 'item' : 'items'} hidden`}
          >
            +{descendantCount}
          </span>
        )}

        {/* Line number */}
        <span className="text-[9px] font-mono text-text-faint/60 group-hover:text-text-muted tabular-nums">
          L{item.lineIdx + 1}
        </span>
      </div>
    </div>
  );
});

export const ScriptOutlineSidebar = React.memo(function ScriptOutlineSidebar({
  showToc,
  tocItems,
  visibleTocItems,
  activeTocId,
  descendantCountMap,
  collapsibleItemIds,
  areAllCollapsed,
  collapsedSectionIds,
  toggleSectionCollapse,
  toggleCollapseAll,
  handleNavigateToSection,
}: ScriptOutlineSidebarProps) {
  if (!showToc) return null;

  return (
    <div className="w-56 sm:w-60 md:w-64 bg-surface-subtle/30 flex flex-col shrink-0 overflow-hidden animate-in slide-in-from-left-2 duration-200">
      
      {/* Outline Header (Exact h-9 to lock horizon) */}
      <div className="h-9 px-3 border-b border-border-subtle bg-surface-subtle/50 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-1.5 text-text-muted">
          <ListTree size={12} className="text-purple-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-main">
            Outline
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {collapsibleItemIds.length > 0 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={toggleCollapseAll}
              title={areAllCollapsed ? "Expand all sections" : "Collapse all sections"}
              className="px-1.5 py-0.5 rounded text-[9px] font-medium text-text-muted hover:text-text-main hover:bg-surface-hover/80 transition-colors border border-border-subtle/60 bg-surface/50"
            >
              {areAllCollapsed ? "Expand All" : "Collapse All"}
            </button>
          )}
          <span className="text-[9px] font-mono text-text-faint px-1.5 py-0.2 rounded-full bg-surface border border-border-subtle/60">
            {tocItems.length}
          </span>
        </div>
      </div>

      {/* Outline Items Tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
        {visibleTocItems.length > 0 ? (
          visibleTocItems.map((item) => (
            <OutlineItemRow
              key={item.id}
              item={item}
              isActive={activeTocId === item.id}
              descendantCount={descendantCountMap.get(item.id) || 0}
              isCollapsed={collapsedSectionIds.has(item.id)}
              onNavigate={handleNavigateToSection}
              onToggleCollapse={toggleSectionCollapse}
            />
          ))
        ) : (
          <div className="p-4 text-center space-y-1.5 text-text-faint">
            <p className="text-[11px] font-bold text-text-muted">No sections found</p>
            <p className="text-[9.5px] leading-relaxed">
              Sections like <code className="font-mono text-purple-500">I. PART</code>, <code className="font-mono text-purple-500">INT./EXT.</code>, or <code className="font-mono text-purple-500">[[STAGING]]</code> will appear here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
});
