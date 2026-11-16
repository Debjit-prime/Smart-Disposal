import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Ban, Check, Leaf, Search } from 'lucide-react';

export type DemoTabId = 'search' | 'scan' | 'switch';

interface LiveDemoPillProps {
  activeTab?: DemoTabId;
  onTabChange?: (tab: DemoTabId) => void;
  /** Optional locked static preview mode for the component sheet */
  lockedTab?: DemoTabId;
  /** Optional simulated visual state for component sheet previews */
  previewState?: 'default' | 'hover' | 'focus' | 'pressed';
  className?: string;
}

const TABS: { id: DemoTabId; label: string; headline: string }[] = [
  { id: 'search', label: 'Search', headline: 'Search.' },
  { id: 'scan', label: 'Scan', headline: 'Scan.' },
  { id: 'switch', label: 'Switch', headline: 'Switch.' },
];

const TYPED_QUERY = 'Plastic bag';

export const LiveDemoPill: React.FC<LiveDemoPillProps> = ({
  activeTab: controlledTab,
  onTabChange,
  lockedTab,
  previewState = 'default',
  className = '',
}) => {
  const [internalTab, setInternalTab] = useState<DemoTabId>('search');
  const [cycleTick, setCycleTick] = useState(0);
  const [typedCount, setTypedCount] = useState(TYPED_QUERY.length);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [isDocVisible, setIsDocVisible] = useState(
    typeof document === 'undefined' ? true : !document.hidden
  );
  const [reducedMotion, setReducedMotion] = useState(false);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeTab: DemoTabId = lockedTab ?? controlledTab ?? internalTab;
  const activeIdx = Math.max(
    0,
    TABS.findIndex((t) => t.id === activeTab)
  );
  const isPaused =
    Boolean(lockedTab) || reducedMotion || isHovered || isFocusedWithin || !isDocVisible;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);

    const handleVis = () => setIsDocVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVis);

    return () => {
      mq.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', handleVis);
    };
  }, []);

  // Auto-cycle every 3 seconds when active and not paused
  useEffect(() => {
    if (isPaused) return;
    const timer = window.setTimeout(() => {
      const next = TABS[(activeIdx + 1) % TABS.length].id;
      if (controlledTab === undefined) {
        setInternalTab(next);
      }
      onTabChange?.(next);
      setCycleTick((c) => c + 1);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [activeIdx, isPaused, controlledTab, onTabChange, cycleTick]);

  // Typing animation for Search state
  useEffect(() => {
    if (activeTab !== 'search') return;
    if (reducedMotion || lockedTab) {
      setTypedCount(TYPED_QUERY.length);
      return;
    }
    setTypedCount(0);
    let current = 0;
    const interval = window.setInterval(() => {
      current += 1;
      setTypedCount(current);
      if (current >= TYPED_QUERY.length) {
        window.clearInterval(interval);
      }
    }, 85);
    return () => window.clearInterval(interval);
  }, [activeTab, cycleTick, reducedMotion, lockedTab]);

  const selectTab = (tab: DemoTabId, focusIndex?: number) => {
    if (lockedTab) return;
    if (controlledTab === undefined) {
      setInternalTab(tab);
    }
    onTabChange?.(tab);
    setCycleTick((c) => c + 1);
    if (focusIndex !== undefined) {
      tabRefs.current[focusIndex]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (lockedTab) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIdx = (activeIdx + 1) % TABS.length;
      selectTab(TABS[nextIdx].id, nextIdx);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIdx = (activeIdx - 1 + TABS.length) % TABS.length;
      selectTab(TABS[prevIdx].id, prevIdx);
    } else if (e.key === 'Home') {
      e.preventDefault();
      selectTab(TABS[0].id, 0);
    } else if (e.key === 'End') {
      e.preventDefault();
      selectTab(TABS[TABS.length - 1].id, TABS.length - 1);
    }
  };

  const previewRingClass =
    previewState === 'hover'
      ? 'border-white/55 -translate-y-0.5'
      : previewState === 'focus'
        ? 'outline outline-2 outline-white outline-offset-2 border-white/50'
        : previewState === 'pressed'
          ? 'scale-[0.985] border-white/60'
          : 'border-white/25 hover:border-white/50';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocusedWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocusedWithin(false);
        }
      }}
      className={`liquid-glass rounded-xl border p-4 sm:p-5 w-full lg:w-[360px] min-h-[184px] flex flex-col justify-between gap-3.5 transition-all duration-200 ${previewRingClass} ${className}`}
    >
      {/* Top row: Dynamic 2xl font-light headline + 3-tab segmented control */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-2xl font-light tracking-tight text-white leading-none">
          {TABS[activeIdx].headline}
        </span>

        <div
          role="tablist"
          aria-label="Live workflow preview"
          onKeyDown={handleKeyDown}
          className="relative grid grid-cols-3 items-center rounded-lg bg-black/50 border border-white/15 p-0.5 shrink-0"
        >
          {/* Sliding white/10 indicator + 3-second progress line */}
          <div
            aria-hidden="true"
            style={{
              width: 'calc(100% / 3 - 2px)',
              transform: `translateX(${activeIdx * 100}%)`,
            }}
            className="absolute top-0.5 bottom-0.5 left-0.5 rounded-md bg-white/10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden pointer-events-none"
          >
            {!reducedMotion && !lockedTab && (
              <span
                key={`${activeTab}-${cycleTick}`}
                style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                className="block absolute bottom-0 left-0 right-0 h-[1.5px] bg-white animate-demo-progress"
              />
            )}
            {(reducedMotion || lockedTab) && (
              <span className="block absolute bottom-0 left-0 right-0 h-[1.5px] bg-white/80" />
            )}
          </div>

          {TABS.map((tab, idx) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => selectTab(tab.id)}
                className={`relative z-10 px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 ${
                  isActive
                    ? previewState === 'pressed'
                      ? 'text-white font-medium bg-white/15'
                      : 'text-white font-medium'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Morphing Body Area */}
      <div
        key={`${activeTab}-${lockedTab ? 'static' : 'live'}`}
        role="tabpanel"
        aria-label={`${TABS[activeIdx].label} demo state`}
        className="animate-demo-morph space-y-2.5"
      >
        {activeTab === 'search' && (
          <>
            <div className="rounded-lg border border-white/20 bg-black/45 px-3 py-2 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" aria-hidden="true" />
              <span className="text-xs text-white tracking-normal truncate">
                {TYPED_QUERY.slice(0, typedCount)}
                {!reducedMotion && !lockedTab && typedCount < TYPED_QUERY.length && (
                  <span className="inline-block w-[1px] h-3.5 bg-white ml-0.5 align-middle" />
                )}
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs text-white">
              <Ban className="w-3.5 h-3.5 text-gray-200 shrink-0" aria-hidden="true" />
              <span>Not biodegradable. 100+ years.</span>
            </div>
          </>
        )}

        {activeTab === 'scan' && (
          <>
            <div
              className="relative h-9 rounded-lg border border-white/20 bg-black/50 px-3 flex items-center justify-between overflow-hidden"
              aria-hidden="true"
            >
              {/* Crisp geometric barcode bars */}
              <div className="flex items-center justify-between w-full h-5 gap-[2px] opacity-85">
                {[2, 1, 3, 1, 2, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 2, 2, 1, 3, 1, 2].map(
                  (w, barIdx) => (
                    <span
                      key={barIdx}
                      className="bg-white/85 h-full rounded-[0.5px]"
                      style={{ width: `${w * 2}px` }}
                    />
                  )
                )}
              </div>
              {/* Sweeping white scan line */}
              {!reducedMotion && (
                <div className="absolute inset-y-1 left-3 right-3 pointer-events-none overflow-hidden">
                  <div className="w-full h-full animate-scan-sweep">
                    <div className="h-full w-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.95)]" />
                  </div>
                </div>
              )}
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs text-white">
              <Leaf className="w-3.5 h-3.5 text-[#86efac] shrink-0" aria-hidden="true" />
              <span>Paper plate. Biodegradable. Weeks to months.</span>
            </div>
          </>
        )}

        {activeTab === 'switch' && (
          <>
            <div className="rounded-lg border border-white/20 bg-black/45 px-3 py-2 flex items-center justify-between gap-2 text-xs">
              <span className="text-gray-300 truncate">Plastic bag</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" aria-hidden="true" />
              <span className="text-white font-medium truncate">Jute bag</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs text-white">
              <Check className="w-3.5 h-3.5 text-[#86efac] shrink-0" aria-hidden="true" />
              <span>Saves decades of waste.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
