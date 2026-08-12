'use client';

/**
 * Portable guided-tour overlay for an individual PO Suite tool.
 *
 * Drop this single file into any tool repo (components/tour/TourProvider.tsx),
 * wrap the app with it in app/layout.tsx, and tag the elements you want to
 * highlight with data-tour="input | sample | run | results | export".
 *
 * It works standalone and embedded:
 *  - Standalone: the user starts the tour from <TourButton /> or the floating
 *    trigger rendered when `floating` is set.
 *  - Embedded in the suite (?embed=1): the suite's "Tour this tool" button
 *    posts { type: 'po-tour:start' } to the iframe and this provider answers
 *    with { type: 'po-tour:ready' }, so the suite knows the tool owns the tour.
 *
 * No persistence by design: a tour only runs when the user asks for it.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TourStep {
  /** data-tour value to highlight. Omit for a centred step (welcome). */
  target?: string;
  kicker: string;
  title: string;
  body: string;
  place?: TourPlacement;
}

interface TourContextValue {
  startTour: () => void;
  stopTour: () => void;
  isRunning: boolean;
  hasTour: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used inside <TourProvider>');
  return ctx;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  /** The target's own corner radius, so the ring is framed to its shape. */
  radius: number;
}

const W = 340;
const FALLBACK_H = 210;
const M = 16;
const GAP = 16;

type Side = 'top' | 'bottom' | 'left' | 'right';
const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, Math.max(lo, hi)));

interface TourProviderProps {
  /** The steps for THIS tool — import them from lib/tour.ts. */
  steps: TourStep[];
  children: React.ReactNode;
  /** Render a floating "Take the tour" trigger bottom-right. Default true. */
  floating?: boolean;
}

export default function TourProvider({ steps, children, floating = true }: TourProviderProps) {
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const [tipH, setTipH] = useState(FALLBACK_H);
  const raf = useRef<number | null>(null);
  const timer = useRef<number | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  const step = running ? steps[Math.min(index, steps.length - 1)] : undefined;

  const stopTour = useCallback(() => {
    setRunning(false);
    setIndex(0);
    setRect(null);
  }, []);

  const measure = useCallback(
    (i: number) => {
      const target = steps[i]?.target;
      const el = target ? document.querySelector<HTMLElement>(`[data-tour="${target}"]`) : null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      // Bring a partially visible target fully into view before measuring,
      // otherwise the ring clamps against the edge and crops the element it
      // is framing. Instant, not smooth: a smooth scroll would still be
      // running when we re-read the rect. Pinned elements (sticky header,
      // fixed bars) are skipped — scrolling moves the page but not them,
      // which only knocks the ring out of place.
      let pinned = false;
      for (let node: HTMLElement | null = el; node && node !== document.body; node = node.parentElement) {
        const pos = getComputedStyle(node).position;
        if (pos === 'fixed' || pos === 'sticky') {
          pinned = true;
          break;
        }
      }
      if (!pinned && (r.top < 60 || r.bottom > window.innerHeight - 24)) {
        window.scrollTo(
          0,
          Math.max(0, window.scrollY + r.top - (window.innerHeight - r.height) / 2),
        );
        const a = el.getBoundingClientRect();
        setRect({ top: a.top, left: a.left, width: a.width, height: a.height, radius });
        return;
      }
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height, radius });
    },
    [steps],
  );

  /**
   * rAF alone is unreliable when the tool runs inside the suite's iframe
   * (throttled / offscreen), so a timer backs it up. Measuring twice is
   * harmless. The index is passed explicitly so a queued measurement cannot
   * read stale state.
   */
  const scheduleMeasure = useCallback(
    (i: number) => {
      if (raf.current) cancelAnimationFrame(raf.current);
      if (timer.current) window.clearTimeout(timer.current);
      raf.current = requestAnimationFrame(() => requestAnimationFrame(() => measure(i)));
      timer.current = window.setTimeout(() => measure(i), 60);
    },
    [measure],
  );

  const startTour = useCallback(() => {
    if (!steps.length) return;
    setRunning(true);
    setIndex(0);
    scheduleMeasure(0);
  }, [steps.length, scheduleMeasure]);

  const goTo = useCallback(
    (next: number) => {
      if (next >= steps.length) {
        stopTour();
        return;
      }
      const i = Math.max(0, next);
      setIndex(i);
      scheduleMeasure(i);
    },
    [steps.length, stopTour, scheduleMeasure],
  );

  useEffect(() => {
    setVp({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  /** Bridge: let the parent suite start this tool's own tour. */
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data as { type?: string } | null;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'po-tour:ping' || data.type === 'po-tour:start') {
        // Answer first so the suite knows a tool-level tour exists.
        e.source?.postMessage?.(
          { type: 'po-tour:ready', hasTour: steps.length > 0 },
          { targetOrigin: e.origin } as WindowPostMessageOptions,
        );
        if (data.type === 'po-tour:start') startTour();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [startTour, steps.length]);

  useEffect(() => {
    if (!running) return;
    const onResize = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      measure(index);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stopTour();
      if (e.key === 'ArrowRight' || e.key === 'Enter') goTo(index + 1);
      if (e.key === 'ArrowLeft') goTo(index - 1);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
    };
  }, [running, index, measure, goTo, stopTour]);

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const value = useMemo<TourContextValue>(
    () => ({ startTour, stopTour, isRunning: running, hasTour: steps.length > 0 }),
    [startTour, stopTour, running, steps.length],
  );

  /** Measure the card so tall copy never gets clamped over its own target. */
  useEffect(() => {
    if (!tipRef.current) return;
    const h = tipRef.current.getBoundingClientRect().height;
    if (h && Math.abs(h - tipH) > 1) setTipH(h);
  });

  /** Ring clamped to the viewport, so a full-height target still reads as a frame. */
  const padding = rect && (rect.height > vp.h * 0.6 || rect.width > vp.w * 0.6) ? 4 : 8;
  const ring = rect
    ? {
        top: Math.max(M / 2, rect.top - padding),
        left: Math.max(M / 2, rect.left - padding),
        right: Math.min(vp.w - M / 2, rect.left + rect.width + padding),
        bottom: Math.min(vp.h - M / 2, rect.top + rect.height + padding),
      }
    : null;

  /**
   * Pick the side that actually has room, instead of clamping a fixed side
   * back into the viewport — clamping is what drops the card on its target.
   */
  const tip = (() => {
    if (!ring) {
      return {
        top: Math.max(M, vp.h / 2 - tipH / 2),
        left: Math.max(M, vp.w / 2 - W / 2),
      };
    }

    const room: Record<Side, number> = {
      right: vp.w - ring.right - GAP - M,
      left: ring.left - GAP - M,
      bottom: vp.h - ring.bottom - GAP - M,
      top: ring.top - GAP - M,
    };
    const preferred = (step?.place ?? 'bottom') as Side;
    const order: Side[] = [preferred, OPPOSITE[preferred], 'bottom', 'top', 'right', 'left'];
    const fits = (s: Side) => (s === 'left' || s === 'right' ? room[s] >= W : room[s] >= tipH);

    const place = (s: Side) => {
      let top: number;
      let left: number;
      if (s === 'right') {
        left = ring.right + GAP;
        top = clamp(ring.top, M, vp.h - tipH - M);
      } else if (s === 'left') {
        left = ring.left - GAP - W;
        top = clamp(ring.top, M, vp.h - tipH - M);
      } else if (s === 'top') {
        top = ring.top - GAP - tipH;
        left = clamp(ring.left, M, vp.w - W - M);
      } else {
        top = ring.bottom + GAP;
        left = clamp(ring.left, M, vp.w - W - M);
      }
      return {
        side: s,
        top: clamp(top, M, vp.h - tipH - M),
        left: clamp(left, M, vp.w - W - M),
      };
    };

    const overlap = (p: { top: number; left: number }) =>
      Math.max(0, Math.min(p.left + W, ring.right) - Math.max(p.left, ring.left)) *
      Math.max(0, Math.min(p.top + tipH, ring.bottom) - Math.max(p.top, ring.top));

    // When a side genuinely fits, use it. When none does — short viewport,
    // large target, the common case inside the suite's iframe — pick the
    // candidate that covers the target the least, rather than clamping a
    // preferred side back on top of it.
    const fitting = order.find(fits);
    const pos = fitting
      ? place(fitting)
      : (['bottom', 'top', 'right', 'left'] as Side[])
          .map(place)
          .sort((a, b) => overlap(a) - overlap(b) || room[b.side] - room[a.side])[0];

    return { top: Math.round(pos.top), left: Math.round(pos.left) };
  })();

  return (
    <TourContext.Provider value={value}>
      {children}

      {floating && !running && steps.length > 0 && (
        <button
          type="button"
          onClick={startTour}
          className="fixed bottom-5 right-5 z-[90] text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-full pl-4 pr-4 py-2.5 shadow-lg transition-colors"
        >
          Take the tour
        </button>
      )}

      {running && step && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Guided tour">
          <div onClick={stopTour} className={`absolute inset-0 ${rect ? '' : 'bg-gray-900/60'}`} />

          {ring && (
            <div
              className="absolute border-2 border-brand-500 pointer-events-none transition-all duration-300 ease-out"
              style={{
                top: ring.top,
                left: ring.left,
                width: ring.right - ring.left,
                height: ring.bottom - ring.top,
                borderRadius: Math.min((rect?.radius ?? 6) + padding, (ring.bottom - ring.top) / 2),
                boxShadow: '0 0 0 9999px rgba(17, 24, 39, 0.6)',
              }}
            />
          )}

          <div
            ref={tipRef}
            className="absolute w-[340px] bg-white border border-gray-200 rounded-2xl p-5 shadow-xl transition-all duration-300 ease-out"
            style={{ top: tip.top, left: tip.left }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
                {step.kicker}
              </span>
              <span className="text-[11px] font-medium text-gray-400">
                {index + 1} / {steps.length}
              </span>
            </div>

            <p className="mt-2.5 text-[15px] font-bold text-gray-900 leading-snug">{step.title}</p>
            <p className="mt-1.5 text-[13px] text-gray-600 leading-relaxed">{step.body}</p>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      i === index ? 'w-4 bg-brand-500' : 'w-1.5 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={stopTour}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 px-1.5 py-1.5 transition-colors"
                >
                  Skip
                </button>
                {index > 0 && (
                  <button
                    onClick={() => goTo(index - 1)}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => goTo(index + 1)}
                  className="text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-3.5 py-1.5 transition-colors whitespace-nowrap"
                >
                  {index >= steps.length - 1 ? 'Get started' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TourContext.Provider>
  );
}

/** Header trigger for the tool's own tour. */
export function TourButton({ label = 'Tour this tool', className }: { label?: string; className?: string }) {
  const { startTour, hasTour } = useTour();
  if (!hasTour) return null;
  return (
    <button
      type="button"
      onClick={startTour}
      className={
        className ??
        'text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap'
      }
    >
      {label}
    </button>
  );
}
