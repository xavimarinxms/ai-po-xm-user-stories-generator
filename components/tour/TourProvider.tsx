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
}

const W = 340;
const H = 210;
const PAD = 8;
const M = 16;

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
  const raf = useRef<number | null>(null);

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
      if (r.top < M || r.bottom > window.innerHeight - M) {
        window.scrollTo({
          top: window.scrollY + r.top - window.innerHeight / 2 + r.height / 2,
          behavior: 'smooth',
        });
        window.setTimeout(() => {
          const a = el.getBoundingClientRect();
          setRect({ top: a.top, left: a.left, width: a.width, height: a.height });
        }, 320);
        return;
      }
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    },
    [steps],
  );

  /** Index passed explicitly so a queued measure cannot read stale state. */
  const scheduleMeasure = useCallback(
    (i: number) => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => requestAnimationFrame(() => measure(i)));
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
  }, []);

  const value = useMemo<TourContextValue>(
    () => ({ startTour, stopTour, isRunning: running, hasTour: steps.length > 0 }),
    [startTour, stopTour, running, steps.length],
  );

  const tip = (() => {
    if (!rect) {
      return {
        top: Math.max(M, vp.h / 2 - H / 2),
        left: Math.max(M, vp.w / 2 - W / 2),
      };
    }
    const place = step?.place ?? 'bottom';
    let top = rect.top + rect.height + 18;
    let left = rect.left;
    if (place === 'right') {
      left = rect.left + rect.width + 20;
      top = rect.top;
    } else if (place === 'left') {
      left = rect.left - W - 20;
      top = rect.top;
    } else if (place === 'top') {
      top = rect.top - H - 18;
    }
    if (left + W > vp.w - M) left = vp.w - W - M;
    if (left < M) left = M;
    if (top + H > vp.h - M) top = vp.h - H - M;
    if (top < M) top = M;
    return { top: Math.round(top), left: Math.round(left) };
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

          {rect && (
            <div
              className="absolute rounded-2xl border-2 border-brand-500 pointer-events-none transition-all duration-300 ease-out"
              style={{
                top: rect.top - PAD,
                left: rect.left - PAD,
                width: rect.width + PAD * 2,
                height: rect.height + PAD * 2,
                boxShadow: '0 0 0 9999px rgba(17, 24, 39, 0.6)',
              }}
            />
          )}

          <div
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
