import React, { useEffect, useRef } from 'react';
import { Leaf, Ban, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { ToastMessage } from '../types/disposal';

export const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  const interactiveProps = onClick
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
      }
    : {};

  return (
    <div
      {...interactiveProps}
      className={`liquid-glass liquid-glass-readable rounded-xl border border-white/25 ${
        onClick ? 'cursor-pointer transition-transform duration-200 hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: 'sm' | 'md' | 'lg' }
> = ({ children, className = '', size = 'md', ...props }) => {
  const sizeClass =
    size === 'sm'
      ? 'px-4 py-2 text-xs'
      : size === 'lg'
        ? 'px-8 py-3 text-base'
        : 'px-6 py-2.5 text-sm';

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 active:scale-[0.99] transition-colors duration-200 whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${sizeClass} ${className}`}
    >
      {children}
    </button>
  );
};

export const GlassButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: 'sm' | 'md' | 'lg'; active?: boolean }
> = ({ children, className = '', size = 'md', active = false, ...props }) => {
  const sizeClass =
    size === 'sm'
      ? 'px-4 py-2 text-xs'
      : size === 'lg'
        ? 'px-8 py-3 text-base'
        : 'px-6 py-2.5 text-sm';

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 liquid-glass liquid-glass-readable border border-white/25 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
        active
          ? 'bg-white text-black'
          : 'text-white hover:bg-white hover:text-black'
      } disabled:opacity-50 disabled:cursor-not-allowed ${sizeClass} ${className}`}
    >
      {children}
    </button>
  );
};

export const VerdictBadge: React.FC<{
  biodegradable: boolean;
  compact?: boolean;
}> = ({ biodegradable, compact = false }) => {
  return (
    <span
      className={`inline-flex items-center gap-2 liquid-glass liquid-glass-readable border border-white/25 rounded-lg text-white font-medium whitespace-nowrap shrink-0 ${
        compact ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
      }`}
    >
      {biodegradable ? (
        <Leaf className="w-3.5 h-3.5 text-emerald-300 shrink-0" aria-hidden="true" />
      ) : (
        <Ban className="w-3.5 h-3.5 text-gray-200 shrink-0" aria-hidden="true" />
      )}
      <span>{biodegradable ? 'Biodegradable' : 'Not biodegradable'}</span>
    </span>
  );
};

export const FilterChip: React.FC<{
  label: string;
  active?: boolean;
  onClick: () => void;
}> = ({ label, active = false, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-2 text-xs sm:text-sm rounded-lg border font-medium transition-colors duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
        active
          ? 'bg-white text-black border-white'
          : 'liquid-glass liquid-glass-readable border-white/25 text-white hover:bg-white hover:text-black'
      }`}
    >
      {label}
    </button>
  );
};

export const TimelineBar: React.FC<{
  percent: number;
  label: string;
  biodegradable: boolean;
}> = ({ percent, label, biodegradable }) => {
  const clamped = Math.max(4, Math.min(100, percent));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 text-xs text-gray-300">
        <span>Decomposition timeline</span>
        <span className="text-white font-medium tabular-nums">{label}</span>
      </div>
      <div
        className="relative h-2.5 w-full rounded-lg liquid-glass border border-white/20 overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Decomposition scale: ${label}`}
      >
        <div
          className={`h-full rounded-lg transition-all duration-500 ${
            biodegradable ? 'bg-white' : 'bg-white/60'
          }`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-gray-300 tabular-nums">
        <span>Days</span>
        <span>Months</span>
        <span>Years</span>
        <span>Centuries+</span>
      </div>
    </div>
  );
};

export const GlassInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { containerClassName?: string }
> = ({ containerClassName = '', className = '', ...props }) => {
  return (
    <input
      {...props}
      className={`w-full liquid-glass liquid-glass-readable border border-white/25 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-200/80 focus:outline-none focus:border-white transition-colors ${containerClassName} ${className}`}
    />
  );
};

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}> = ({ open, onClose, title, children, maxWidthClass = 'max-w-lg' }) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-heading"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidthClass} liquid-glass rounded-xl border border-white/20 p-6 sm:p-8 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 id="modal-heading" className="text-xl sm:text-2xl font-normal text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg liquid-glass border border-white/20 text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto liquid-glass border border-white/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-sm text-white shadow-xl"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.tone === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
            ) : toast.tone === 'error' ? (
              <AlertCircle className="w-4 h-4 text-gray-300 shrink-0" aria-hidden="true" />
            ) : (
              <Info className="w-4 h-4 text-gray-300 shrink-0" aria-hidden="true" />
            )}
            <span className="truncate">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            className="text-gray-300 hover:text-white shrink-0 cursor-pointer p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const ResultSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="Loading result">
      <div className="lg:col-span-2 liquid-glass rounded-xl border border-white/20 p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="h-8 w-56 rounded-lg bg-white/10 glass-shimmer" />
          <div className="h-8 w-36 rounded-lg bg-white/10 glass-shimmer" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="h-20 rounded-xl bg-white/5 glass-shimmer" />
          <div className="h-20 rounded-xl bg-white/5 glass-shimmer" />
        </div>
        <div className="h-12 rounded-xl bg-white/5 glass-shimmer" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-white/10 glass-shimmer" />
          <div className="h-4 w-4/5 rounded bg-white/10 glass-shimmer" />
        </div>
      </div>
      <div className="liquid-glass rounded-xl border border-white/20 p-6 sm:p-8 space-y-5">
        <div className="h-5 w-36 rounded bg-white/10 glass-shimmer" />
        <div className="h-8 w-48 rounded bg-white/10 glass-shimmer" />
        <div className="h-16 rounded bg-white/5 glass-shimmer" />
        <div className="h-11 w-full rounded-lg bg-white/15 glass-shimmer" />
      </div>
    </div>
  );
};

export const NavSafeMask: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId: number | null = null;

    const applyMask = () => {
      rafId = null;
      const scrollY = window.scrollY;
      const rectTop = el.getBoundingClientRect().top;

      // Clear mask completely at scroll top so above-the-fold hero is untouched
      if (scrollY <= 1 && rectTop >= 0) {
        el.style.maskImage = '';
        el.style.webkitMaskImage = '';
        return;
      }

      // Engage smoothly across the first 40px of scroll so text never clashes with fixed navbar
      const p = Math.min(1, Math.max(0, scrollY / 40));
      const clearViewportY = 82 * p;
      const fadeViewportY = 132 * p;

      const localClear = Math.max(0, clearViewportY - rectTop);
      const localFade = Math.max(localClear + 1, fadeViewportY - rectTop);

      const gradient = `linear-gradient(to bottom, transparent 0px, transparent ${localClear.toFixed(1)}px, black ${localFade.toFixed(1)}px, black 100%)`;
      el.style.maskImage = gradient;
      el.style.webkitMaskImage = gradient;
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(applyMask);
    };

    applyMask();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export const BlurredBackgroundLayer: React.FC<{
  imageUrl?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ imageUrl, className = '', children }) => {
  return (
    <div className={`bg-stage ${className}`}>
      {imageUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center pointer-events-none z-0"
          style={{ backgroundImage: `url(${imageUrl})` }}
          aria-hidden="true"
        />
      )}
      <NavSafeMask className="relative z-10 flex-1 flex flex-col">{children}</NavSafeMask>
    </div>
  );
};
