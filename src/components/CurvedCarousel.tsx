import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Ban, Compass, Layers, Leaf, RefreshCw, Search, Sprout } from 'lucide-react';

export interface CurvedCarouselItem {
  id: string;
  title: string;
  meta: string;
  /** Optional verdict indicator (never color alone — rendered with icon + text) */
  verdict?: 'biodegradable' | 'not-biodegradable';
  /** Optional secondary line such as greener alternative */
  secondaryMeta?: string;
  /** Shared media crop coordinates so one asset loads once across all cards */
  cropPosition?: string;
  /** Optional override image URL (defaults to shared botanical media) */
  imageUrl?: string;
  /** Icon type rendered inside the bottom-left small frosted round badge */
  iconType?: 'leaf' | 'ban' | 'search' | 'layers' | 'refresh' | 'sprout' | 'compass';
}

interface CurvedCarouselProps {
  items: CurvedCarouselItem[];
  onSelect?: (item: CurvedCarouselItem) => void;
  selectedId?: string;
  sharedImageUrl?: string;
  ariaLabel: string;
}

const DEFAULT_CROPS = [
  '12% 18%',
  '48% 24%',
  '82% 20%',
  '25% 65%',
  '62% 70%',
  '35% 42%',
  '78% 58%',
  '18% 82%',
];

const BASE_GAP = 26;

function renderBadgeIcon(item: CurvedCarouselItem) {
  if (item.iconType === 'leaf' || item.verdict === 'biodegradable') {
    return <Leaf className="w-3.5 h-3.5 text-white" aria-hidden="true" />;
  }
  if (item.iconType === 'ban' || item.verdict === 'not-biodegradable') {
    return <Ban className="w-3.5 h-3.5 text-gray-200" aria-hidden="true" />;
  }
  if (item.iconType === 'search') {
    return <Search className="w-3.5 h-3.5 text-white" aria-hidden="true" />;
  }
  if (item.iconType === 'layers') {
    return <Layers className="w-3.5 h-3.5 text-white" aria-hidden="true" />;
  }
  if (item.iconType === 'refresh') {
    return <RefreshCw className="w-3.5 h-3.5 text-white" aria-hidden="true" />;
  }
  if (item.iconType === 'sprout') {
    return <Sprout className="w-3.5 h-3.5 text-white" aria-hidden="true" />;
  }
  return <Compass className="w-3.5 h-3.5 text-white" aria-hidden="true" />;
}

export const CurvedCarousel: React.FC<CurvedCarouselProps> = ({
  items,
  onSelect,
  selectedId,
  sharedImageUrl = '/assets/aistudio/image_1_1ba20a32.png',
  ariaLabel,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [viewportWidth, setViewportWidth] = useState(1440);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  // Mutable animation state stored in refs for zero-jank 60fps RAF loop
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerStartXRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const focusPausedRef = useRef(false);
  const hoveredRef = useRef<number | null>(null);
  const focusedRef = useRef<number | null>(null);

  useEffect(() => {
    focusPausedRef.current = isFocused;
  }, [isFocused]);

  useEffect(() => {
    hoveredRef.current = hoveredIdx;
  }, [hoveredIdx]);

  useEffect(() => {
    focusedRef.current = focusedIdx;
  }, [focusedIdx]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(mq.matches);
    updateMotion();
    mq.addEventListener('change', updateMotion);

    const updateSize = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.clientWidth);
      } else {
        setViewportWidth(window.innerWidth);
      }
    };
    updateSize();

    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      mq.removeEventListener('change', updateMotion);
      ro.disconnect();
    };
  }, []);

  // Responsive scale factor:
  // Desktop (1440): scale = 1 -> center 170x280, edges up to ~370px tall
  // Tablet (768): scale = 0.88
  // Mobile (390): scale = 0.65 -> entire curved band ~250px tall
  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;
  const scale = isMobile ? 0.62 : isTablet ? 0.86 : 1;

  const centerWidth = Math.round(170 * scale);
  const centerHeight = Math.round(280 * scale);
  const gap = Math.round(BASE_GAP * (isMobile ? 0.65 : 1));
  const stepUnit = centerWidth + gap;

  // Ensure enough virtual cards in the ring so edges bleed smoothly off both sides
  const minTrackCount = Math.max(items.length, Math.ceil((viewportWidth + 600) / stepUnit) + 2);
  const repeatFactor = Math.max(1, Math.ceil(minTrackCount / Math.max(1, items.length)));
  const ringItems = Array.from({ length: repeatFactor }, () => items).flat();
  const totalTrackLength = ringItems.length * stepUnit;

  // Geometry updater applied directly to card DOM nodes each animation frame
  const layoutCards = useCallback(() => {
    if (ringItems.length === 0) return;
    const halfView = Math.max(240, viewportWidth / 2);
    const bandHeight = isMobile ? 250 : isTablet ? 340 : 400;

    for (let i = 0; i < ringItems.length; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;

      // Wrap position cleanly into [-totalTrackLength/2, +totalTrackLength/2]
      let rawX = (i * stepUnit - offsetRef.current) % totalTrackLength;
      if (rawX < -totalTrackLength / 2) rawX += totalTrackLength;
      if (rawX > totalTrackLength / 2) rawX -= totalTrackLength;

      const norm = Math.max(-1.25, Math.min(1.25, rawX / halfView));
      const absNorm = Math.abs(norm);

      // Center cards ~170x280; edge cards grow wider & taller up to ~370px tall (scaled on mobile)
      const edgeExpand = absNorm * absNorm;
      const cardWidth = centerWidth + 64 * scale * edgeExpand;
      const cardHeight = centerHeight + 90 * scale * edgeExpand;

      // Preserve ~26px gap by gently pushing outer cards outward as they widen
      const gapCompensation = Math.sign(norm) * 28 * scale * edgeExpand;
      const screenX = viewportWidth / 2 + rawX + gapCompensation - cardWidth / 2;

      // Gentle arch: rises slightly in the center and drops toward edges
      const baseTop = (bandHeight - cardHeight) / 2;
      const archDropY = 18 * scale * edgeExpand;
      const isActive = hoveredRef.current === i || focusedRef.current === i;
      const liftY = isActive ? -8 : 0;

      // Inside-of-a-cylinder 3D perspective:
      // Rotating edge cards inward around Y makes the outer vertical edge closer to the camera,
      // hence visibly taller than the inner vertical edge!
      const rotateYDeg = -norm * 26;
      const translateZ = 75 * scale * edgeExpand;

      el.style.width = `${cardWidth.toFixed(1)}px`;
      el.style.height = `${cardHeight.toFixed(1)}px`;
      el.style.transform = `translate3d(${screenX.toFixed(1)}px, ${(baseTop + archDropY + liftY).toFixed(1)}px, ${translateZ.toFixed(1)}px) rotateY(${rotateYDeg.toFixed(2)}deg)`;
      el.style.zIndex = `${Math.round(10 + absNorm * 20 + (isActive ? 40 : 0))}`;
      el.style.opacity = absNorm > 1.22 ? '0' : '1';
    }
  }, [
    ringItems.length,
    viewportWidth,
    isMobile,
    isTablet,
    stepUnit,
    totalTrackLength,
    centerWidth,
    centerHeight,
    scale,
  ]);

  // 60fps RAF loop for auto-scroll (50 units/s) + momentum decay (~95%/s)
  useEffect(() => {
    if (reducedMotion) {
      layoutCards();
      return;
    }

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (!draggingRef.current) {
        if (Math.abs(velocityRef.current) > 8) {
          offsetRef.current += velocityRef.current * dt;
          // Decay ~95% per second -> multiply by 0.05^dt
          velocityRef.current *= Math.pow(0.05, dt);
        } else {
          velocityRef.current = 0;
          if (!focusPausedRef.current) {
            // Auto-scroll right-to-left at 50 units per second
            offsetRef.current += 50 * dt;
          }
        }
      }

      layoutCards();
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reducedMotion, layoutCards]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    draggingRef.current = true;
    setIsDragging(true);
    pointerStartXRef.current = e.clientX;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    dragDistanceRef.current = 0;
    velocityRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const now = performance.now();
    const dx = e.clientX - lastPointerXRef.current;
    const dt = Math.max(0.004, (now - lastPointerTimeRef.current) / 1000);

    // Follow drag 1:1
    offsetRef.current -= dx;
    dragDistanceRef.current += Math.abs(dx);
    velocityRef.current = -dx / dt;

    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = now;
    layoutCards();
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
  };

  const stepByCard = (direction: -1 | 1) => {
    if (reducedMotion && containerRef.current) {
      containerRef.current.scrollBy({ left: direction * stepUnit, behavior: 'smooth' });
      return;
    }
    velocityRef.current = direction * 680;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepByCard(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepByCard(-1);
    }
  };

  // Reduced-motion fallback: clean static horizontally scrollable row
  if (reducedMotion) {
    return (
      <div
        ref={containerRef}
        role="region"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className="w-full overflow-x-auto glass-scrollbar px-6 md:px-12 lg:px-16 py-4"
      >
        <div className="flex gap-[26px] w-max">
          {items.map((item, idx) => {
            const isSelected = selectedId === item.id;
            const imgSrc = item.imageUrl || sharedImageUrl;
            const crop = item.cropPosition || DEFAULT_CROPS[idx % DEFAULT_CROPS.length];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect?.(item)}
                style={{ width: centerWidth, height: centerHeight }}
                className={`relative shrink-0 rounded-[15px] overflow-hidden liquid-glass border text-left transition-transform duration-200 hover:-translate-y-1.5 focus-visible:-translate-y-1.5 cursor-pointer ${
                  isSelected
                    ? 'border-white'
                    : 'border-white/20 hover:border-white/60 focus-visible:border-white/60'
                }`}
              >
                <div
                  className={`absolute inset-0 bg-no-repeat pointer-events-none opacity-90 ${
                    item.imageUrl ? 'scale-[1.16]' : ''
                  }`}
                  style={{
                    backgroundImage: `url(${imgSrc})`,
                    backgroundSize: item.imageUrl ? 'cover' : '260% 260%',
                    backgroundPosition: item.imageUrl ? 'center' : crop,
                  }}
                  aria-hidden="true"
                />
                <div className="relative z-10 h-full p-4 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/35 to-black/20">
                  <div className="space-y-1.5 mb-3">
                    {item.verdict && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-white font-medium">
                        {item.verdict === 'biodegradable' ? (
                          <Leaf className="w-3 h-3 text-white" aria-hidden="true" />
                        ) : (
                          <Ban className="w-3 h-3 text-gray-200" aria-hidden="true" />
                        )}
                        <span>
                          {item.verdict === 'biodegradable' ? 'Biodegradable' : 'Not biodegradable'}
                        </span>
                      </div>
                    )}
                    <div className="text-sm sm:text-base font-medium text-white leading-tight">
                      {item.title}
                    </div>
                    <p className="text-xs text-gray-200 truncate">{item.meta}</p>
                    {item.secondaryMeta && (
                      <p className="text-[11px] text-gray-300 truncate">{item.secondaryMeta}</p>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full liquid-glass border border-white/25 flex items-center justify-center shrink-0">
                    {renderBadgeIcon(item)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => setIsFocused(false)}
      style={{
        height: isMobile ? 250 : isTablet ? 340 : 400,
        perspective: isMobile ? '650px' : '980px',
        perspectiveOrigin: '50% 50%',
      }}
      className={`relative w-full overflow-hidden select-none touch-pan-y ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {ringItems.map((item, idx) => {
        const isSelected = selectedId === item.id;
        const imgSrc = item.imageUrl || sharedImageUrl;
        const crop = item.cropPosition || DEFAULT_CROPS[idx % DEFAULT_CROPS.length];

        return (
          <button
            key={`${item.id}-${idx}`}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            type="button"
            tabIndex={idx < items.length ? 0 : -1}
            aria-hidden={idx >= items.length ? true : undefined}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            onFocus={() => setFocusedIdx(idx)}
            onBlur={() => setFocusedIdx(null)}
            onClick={() => {
              if (dragDistanceRef.current > 6) return;
              onSelect?.(item);
            }}
            className={`absolute top-0 left-0 rounded-[15px] overflow-hidden liquid-glass border text-left transition-[border-color] duration-200 focus:outline-none cursor-inherit ${
              isSelected
                ? 'border-white'
                : hoveredIdx === idx || focusedIdx === idx
                  ? 'border-white/70'
                  : 'border-white/20'
            }`}
            style={{
              transformStyle: 'preserve-3d',
              willChange: 'transform',
            }}
          >
            {/* Full-bleed background media (per-item illustration or cropped shared sprite) */}
            <div
              className={`absolute inset-0 bg-no-repeat pointer-events-none ${
                item.imageUrl ? 'scale-[1.16]' : ''
              }`}
              style={{
                backgroundImage: `url(${imgSrc})`,
                backgroundSize: item.imageUrl ? 'cover' : '260% 260%',
                backgroundPosition: item.imageUrl ? 'center' : crop,
              }}
              aria-hidden="true"
            />

            {/* Liquid-glass content surface over artwork */}
            <div className="relative z-10 h-full w-full p-3.5 sm:p-4 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/35 to-black/20">
              <div className="space-y-1 mb-2.5 sm:mb-3 min-w-0">
                {item.verdict && (
                  <div className="inline-flex items-center gap-1.5 text-[11px] text-white font-medium [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
                    {item.verdict === 'biodegradable' ? (
                      <Leaf className="w-3 h-3 text-white shrink-0" aria-hidden="true" />
                    ) : (
                      <Ban className="w-3 h-3 text-gray-200 shrink-0" aria-hidden="true" />
                    )}
                    <span className="truncate">
                      {item.verdict === 'biodegradable' ? 'Biodegradable' : 'Not biodegradable'}
                    </span>
                  </div>
                )}

                <div className="text-sm sm:text-base font-medium text-white leading-snug truncate [text-shadow:0_1px_8px_rgba(0,0,0,0.85)]">
                  {item.title}
                </div>

                <p className="text-[11px] sm:text-xs text-gray-200 truncate [text-shadow:0_1px_6px_rgba(0,0,0,0.85)]">
                  {item.meta}
                </p>

                {item.secondaryMeta && (
                  <p className="text-[11px] text-gray-300 truncate [text-shadow:0_1px_6px_rgba(0,0,0,0.85)]">
                    {item.secondaryMeta}
                  </p>
                )}
              </div>

              {/* Small frosted round icon at bottom-left */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full liquid-glass border border-white/25 flex items-center justify-center shrink-0">
                {renderBadgeIcon(item)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
