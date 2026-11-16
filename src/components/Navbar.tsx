import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AppPage } from '../types/disposal';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

type NavPhase = 'expanded' | 'collapsing' | 'compact' | 'expanding';
type CollapseSubStep = 'idle' | 'fade-links' | 'crt-vert' | 'crt-point' | 'flying';
type ExpandSubStep = 'idle' | 'widen' | 'flash-line' | 'open-height' | 'rise-links';

const NAV_LINKS: { label: string; page: AppPage }[] = [
  { label: 'Check', page: 'checker' },
  { label: 'Database', page: 'database' },
  { label: 'Alternatives', page: 'alternatives' },
  { label: 'How It Works', page: 'how-it-works' },
];

// Ensures the initial drop/rise entrance plays strictly once per app load
let hasPlayedInitialEntrance = false;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [phase, setPhase] = useState<NavPhase>('expanded');
  const [collapseStep, setCollapseStep] = useState<CollapseSubStep>('idle');
  const [expandStep, setExpandStep] = useState<ExpandSubStep>('idle');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [litOpacity, setLitOpacity] = useState(0);
  const [litInstant, setLitInstant] = useState(false);
  const [animateEntrance] = useState(() => {
    if (hasPlayedInitialEntrance) return false;
    hasPlayedInitialEntrance = true;
    return true;
  });

  // Refs for state machine timers, RAF flying orb, scroll tracking, and geometry
  const phaseRef = useRef<NavPhase>('expanded');
  const navRef = useRef<HTMLElement | null>(null);
  const oButtonRef = useRef<HTMLButtonElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const manualPinScrollRef = useRef<number | null>(null);
  const [flyingActive, setFlyingActive] = useState(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const clearScheduled = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setFlyingActive(false);
  }, []);

  useEffect(() => {
    return () => clearScheduled();
  }, [clearScheduled]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const launchFlyingDot = useCallback(
    (startX: number, startY: number) => {
      setFlyingActive(true);
      const startTime = performance.now();
      const duration = 780;

      const step = (now: number) => {
        const rawT = Math.min(1, (now - startTime) / duration);
        const u = easeInOutCubic(rawT);

        // Live measurement of target "o" center at current frame
        const oRect = oButtonRef.current?.getBoundingClientRect();
        const endX = oRect ? oRect.left + oRect.width / 2 : startX;
        const endY = oRect ? oRect.top + oRect.height / 2 : startY;

        // Curved quadratic Bezier control point dipping smoothly below the chord
        const ctrlX = (startX + endX) * 0.5;
        const ctrlY = Math.max(startY, endY) + 42;

        const inv = 1 - u;
        const x = inv * inv * startX + 2 * inv * u * ctrlX + u * u * endX;
        const y = inv * inv * startY + 2 * inv * u * ctrlY + u * u * endY;

        // Scale bloom halo up midway along path then smoothly down into "o"
        const scale = rawT < 0.5 ? 0.8 + rawT * 1.3 : 1.45 - (rawT - 0.5) * 1.9;

        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${Math.max(0.35, scale).toFixed(3)})`;
          dotRef.current.style.opacity = rawT > 0.94 ? `${(1 - rawT) / 0.06}` : '1';
        }

        if (rawT < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
          setFlyingActive(false);

          // Step 5: Flash --lit halo 0.9 -> 0 over 0.9s inside the "o" button
          setLitInstant(true);
          setLitOpacity(0.9);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setLitInstant(false);
              setLitOpacity(0);
            });
          });

          // Step 6: Settle into compact pill
          setCollapseStep('idle');
          setPhase('compact');
          phaseRef.current = 'compact';
        }
      };

      rafRef.current = requestAnimationFrame(step);
    },
    []
  );

  const runCollapse = useCallback(() => {
    if (phaseRef.current !== 'expanded') return;
    setDrawerOpen(false);

    if (reducedMotion) {
      setPhase('compact');
      phaseRef.current = 'compact';
      return;
    }

    clearScheduled();
    const navRect = navRef.current?.getBoundingClientRect();
    const startX = navRect ? navRect.left + navRect.width / 2 : window.innerWidth / 2;
    const startY = navRect ? navRect.top + navRect.height / 2 : 52;

    setPhase('collapsing');
    phaseRef.current = 'collapsing';
    setCollapseStep('fade-links'); // 0..300ms

    schedule(() => {
      setCollapseStep('crt-vert'); // 300..600ms: inner collapses vertically to 2px horizontal white line
    }, 300);

    schedule(() => {
      setCollapseStep('crt-point'); // 600..760ms: horizontal line shortens to center point
    }, 600);

    schedule(() => {
      setCollapseStep('flying'); // 760..1540ms: compact pill narrows & glowing dot flies Bezier to "o"
      launchFlyingDot(startX, startY);
    }, 760);
  }, [clearScheduled, launchFlyingDot, reducedMotion, schedule]);

  const runExpand = useCallback(() => {
    if (phaseRef.current !== 'compact') return;

    if (reducedMotion) {
      setPhase('expanded');
      phaseRef.current = 'expanded';
      return;
    }

    clearScheduled();
    setPhase('expanding');
    phaseRef.current = 'expanding';
    setExpandStep('widen'); // 0..320ms: pill widens back to full bar

    schedule(() => {
      setExpandStep('flash-line'); // 320..480ms: point flashes center -> thin horizontal line
    }, 320);

    schedule(() => {
      setExpandStep('open-height'); // 480..720ms: line opens vertically to full height
    }, 480);

    schedule(() => {
      setExpandStep('rise-links'); // 720..1620ms: links & button rise 10px staggered 60ms
    }, 720);

    schedule(() => {
      setExpandStep('idle');
      setPhase('expanded');
      phaseRef.current = 'expanded';
    }, 1620);
  }, [clearScheduled, reducedMotion, schedule]);

  const handleToggleO = () => {
    // Ignore clicks while a transition is actively running
    if (phaseRef.current === 'collapsing' || phaseRef.current === 'expanding') return;
    manualPinScrollRef.current = window.scrollY;
    if (phaseRef.current === 'expanded') {
      runCollapse();
    } else if (phaseRef.current === 'compact') {
      runExpand();
    }
  };

  // Scroll behavior: bg opacity shift past 24px + auto-collapse down / auto-expand up
  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    setScrolled(window.scrollY > 24);

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);

      const prevY = lastScrollYRef.current;
      const delta = y - prevY;
      lastScrollYRef.current = y;

      // Respect recent manual toggle until user scrolls meaningfully (> 32px)
      if (manualPinScrollRef.current !== null) {
        if (Math.abs(y - manualPinScrollRef.current) < 32) {
          return;
        }
        manualPinScrollRef.current = null;
      }

      if (phaseRef.current === 'collapsing' || phaseRef.current === 'expanding') return;

      if (delta > 6 && y > 72 && phaseRef.current === 'expanded') {
        runCollapse();
      } else if ((delta < -8 || y <= 24) && phaseRef.current === 'compact') {
        runExpand();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [runCollapse, runExpand]);

  const handleNav = (page: AppPage) => {
    setDrawerOpen(false);
    onNavigate(page);
  };

  // Determine layout & visual flags from state machine
  const isCompactLayout =
    phase === 'compact' || (phase === 'collapsing' && collapseStep === 'flying');
  const isPressedState = phase === 'compact' || phase === 'collapsing';
  const showFullNavItems =
    phase === 'expanded' ||
    (phase === 'collapsing' && collapseStep === 'fade-links') ||
    (phase === 'expanding' && (expandStep === 'open-height' || expandStep === 'rise-links'));
  const hideNavItemsFade = phase === 'collapsing' && collapseStep === 'fade-links';
  const riseNavItemsIn = phase === 'expanding' && expandStep === 'rise-links';
  const hideWordmarkDuringCrt =
    phase === 'collapsing' && (collapseStep === 'crt-vert' || collapseStep === 'crt-point');
  const hideWordmarkDuringExpandBeam =
    phase === 'expanding' && (expandStep === 'flash-line' || expandStep === 'open-height');

  return (
    <>
      {/* Flying Bezier Dot Portal (renders only during step 4 of collapse) */}
      {flyingActive && (
        <div
          ref={dotRef}
          aria-hidden="true"
          className="fixed top-0 left-0 z-[60] pointer-events-none flex items-center justify-center"
        >
          {/* Radial bloom halo (~6x core radius) */}
          <span
            className="w-14 h-14 rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.28) 38%, rgba(255,255,255,0) 72%)',
            }}
          />
          {/* Crisp white core */}
          <span className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,1)]" />
        </div>
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 lg:px-16 pt-6 pointer-events-none ${
          animateEntrance && !reducedMotion ? 'animate-nav-drop' : ''
        }`}
      >
        <nav
          ref={navRef}
          aria-label="Primary navigation"
          className={`pointer-events-auto liquid-glass px-4 py-2 flex items-center justify-between transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${
            reducedMotion ? 'duration-150' : 'duration-300'
          } ${
            scrolled ? 'liquid-glass-scrolled' : ''
          } ${
            isCompactLayout
              ? 'w-fit rounded-full gap-0 pr-5'
              : 'w-full rounded-xl gap-4 sm:gap-8'
          }`}
        >
          {/* CRT / Expand Center Line Overlay */}
          {(phase === 'collapsing' &&
            (collapseStep === 'crt-vert' || collapseStep === 'crt-point')) ||
          (phase === 'expanding' &&
            (expandStep === 'flash-line' || expandStep === 'open-height')) ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <span
                key={`${collapseStep}-${expandStep}`}
                className={`block bg-white shadow-[0_0_16px_rgba(255,255,255,0.95)] ${
                  collapseStep === 'crt-vert'
                    ? 'animate-crt-vert'
                    : collapseStep === 'crt-point'
                      ? 'animate-crt-point rounded-full'
                      : expandStep === 'flash-line'
                        ? 'animate-crt-flash-line rounded-full'
                        : 'animate-crt-open-height'
                }`}
              />
            </div>
          ) : null}

          {/* Zone 1: Brand Wordmark "SmartDisposal" with inline SVG power-leaf "o" button */}
          <div
            style={
              animateEntrance && !reducedMotion ? { animationDelay: '320ms' } : undefined
            }
            className={`inline-flex items-baseline text-2xl font-semibold tracking-tight text-white whitespace-nowrap shrink-0 transition-opacity duration-200 ${
              animateEntrance && !reducedMotion ? 'animate-nav-rise' : ''
            } ${
              hideWordmarkDuringCrt || hideWordmarkDuringExpandBeam ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <button
              type="button"
              onClick={() => handleNav('landing')}
              className="hover:text-gray-300 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 rounded"
            >
              SmartDisp
            </button>

            {/* The signature "o" power-style leaf toggle button */}
            <button
              ref={oButtonRef}
              type="button"
              onClick={handleToggleO}
              aria-pressed={isPressedState}
              aria-expanded={!isPressedState}
              aria-label={isPressedState ? 'Expand navigation' : 'Collapse navigation'}
              style={{ '--lit': litOpacity } as React.CSSProperties}
              className="relative inline-flex items-center justify-center mx-[0.5px] translate-y-[2.5px] text-white cursor-pointer transition-all duration-150 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.85)] active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 rounded-full"
            >
              {/* Blurred white halo ring driven by CSS variable --lit */}
              <span
                aria-hidden="true"
                style={{ opacity: 'var(--lit, 0)' }}
                className={`absolute -inset-2 rounded-full bg-white blur-md pointer-events-none ${
                  litInstant ? 'transition-none' : 'transition-opacity duration-[900ms] ease-out'
                }`}
              />
              <svg
                viewBox="0 0 50 62"
                aria-hidden="true"
                className="relative z-10 w-[18px] h-[22px] overflow-visible"
              >
                {/* Open circle path */}
                <path
                  d="M14.2 22.6 A19 19 0 1 0 35.8 22.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4.6"
                  strokeLinecap="round"
                />
                {/* Vertical power tick */}
                <path
                  d="M25 6.5 V33"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4.6"
                  strokeLinecap="round"
                />
                {/* Leaf-green accent nestled inside the circle */}
                <path
                  d="M25 46 C25 39.2 30.2 35.6 35.2 36.2 C34.8 41.8 30.6 46 25 46 Z"
                  fill="#4ade80"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => handleNav('landing')}
              className="hover:text-gray-300 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 rounded"
            >
              sal
            </button>
          </div>

          {/* Zone 2: Center Links (hidden on mobile, md+) */}
          {showFullNavItems && (
            <div
              className={`hidden md:flex items-center gap-8 transition-all duration-300 ${
                hideNavItemsFade ? 'opacity-0 scale-95 pointer-events-none' : ''
              }`}
            >
              {NAV_LINKS.map((link, idx) => {
                const isActive = currentPage === link.page;
                const delayMs = hideNavItemsFade
                  ? idx * 60
                  : riseNavItemsIn
                    ? idx * 60
                    : animateEntrance
                      ? 380 + idx * 60
                      : 0;
                return (
                  <button
                    key={link.page}
                    type="button"
                    data-active={isActive ? 'true' : 'false'}
                    onClick={() => handleNav(link.page)}
                    style={{
                      transitionDelay: hideNavItemsFade ? `${idx * 60}ms` : undefined,
                      animationDelay:
                        animateEntrance && !reducedMotion && !riseNavItemsIn
                          ? `${delayMs}ms`
                          : riseNavItemsIn && !reducedMotion
                            ? `${idx * 60}ms`
                            : undefined,
                    }}
                    className={`nav-link-wipe text-sm whitespace-nowrap shrink-0 cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4 rounded ${
                      isActive ? 'text-white' : 'text-white hover:text-gray-300'
                    } ${
                      (animateEntrance || riseNavItemsIn) && !reducedMotion
                        ? 'animate-nav-rise'
                        : ''
                    } ${hideNavItemsFade ? 'opacity-0 scale-95' : ''}`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Zone 3: Right Primary Action + Mobile Hamburger */}
          {showFullNavItems && (
            <div
              style={{
                transitionDelay: hideNavItemsFade ? `${NAV_LINKS.length * 60}ms` : undefined,
                animationDelay:
                  animateEntrance && !reducedMotion && !riseNavItemsIn
                    ? `${380 + NAV_LINKS.length * 60}ms`
                    : riseNavItemsIn && !reducedMotion
                      ? `${NAV_LINKS.length * 60}ms`
                      : undefined,
              }}
              className={`flex items-center gap-2 sm:gap-3 shrink-0 transition-all duration-300 ${
                (animateEntrance || riseNavItemsIn) && !reducedMotion ? 'animate-nav-rise' : ''
              } ${hideNavItemsFade ? 'opacity-0 scale-95 pointer-events-none' : ''}`}
            >
              <button
                type="button"
                onClick={() => handleNav('checker')}
                className="bg-white text-black px-3.5 py-1.5 sm:px-6 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                Check a Product
              </button>

              <button
                type="button"
                onClick={() => setDrawerOpen((prev) => !prev)}
                aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={drawerOpen}
                className="md:hidden p-1.5 sm:p-2 rounded-lg liquid-glass border border-white/20 text-white hover:bg-white hover:text-black transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              >
                {drawerOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Glass Drawer with staggered rise-in */}
        {drawerOpen && !isCompactLayout && (
          <div className="pointer-events-auto md:hidden mt-3 liquid-glass rounded-xl border border-white/20 p-5 space-y-4">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link, idx) => (
                <button
                  key={link.page}
                  type="button"
                  onClick={() => handleNav(link.page)}
                  style={
                    !reducedMotion ? { animationDelay: `${idx * 60}ms` } : undefined
                  }
                  className={`text-left text-base py-2 px-3 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 ${
                    !reducedMotion ? 'animate-nav-rise' : ''
                  } ${
                    currentPage === link.page
                      ? 'bg-white text-black font-medium'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                style={!reducedMotion ? { animationDelay: '240ms' } : undefined}
                className={`text-left text-base py-2 px-3 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 ${
                  !reducedMotion ? 'animate-nav-rise' : ''
                } ${
                  currentPage === 'dashboard'
                    ? 'bg-white text-black font-medium'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                Saved &amp; Switches
              </button>
              <button
                type="button"
                onClick={() => handleNav('admin')}
                style={!reducedMotion ? { animationDelay: '300ms' } : undefined}
                className={`text-left text-base py-2 px-3 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 ${
                  !reducedMotion ? 'animate-nav-rise' : ''
                } ${
                  currentPage === 'admin'
                    ? 'bg-white text-black font-medium'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                Admin Registry
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
