import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { X, Minus, Plus } from 'lucide-react';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'accent' | 'ghost' | 'soft' | 'danger'; size?: 'sm' | 'md' | 'lg'; icon?: ReactNode };
export function Button({ variant = 'primary', size = 'md', icon, className, children, ...p }: BtnProps) {
  const v = {
    primary: 'bg-forest text-onforest hover:brightness-110 shadow-card',
    accent: 'bg-sunset text-white hover:brightness-105 shadow-card',
    ghost: 'text-ink hover:bg-raised',
    soft: 'bg-raised text-ink hover:bg-sand/70',
    danger: 'bg-danger/10 text-danger hover:bg-danger/20',
  }[variant];
  const s = { sm: 'h-9 px-3 text-sm gap-1.5', md: 'h-11 px-4 gap-2', lg: 'h-14 px-6 text-lg gap-2.5' }[size];
  return <button {...p} className={cx('inline-flex items-center justify-center rounded-full font-bold transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none', v, s, className)}>{icon}{children}</button>;
}

export function Card({ className, children, as: As = 'div', ...p }: { className?: string; children: ReactNode; as?: any; [k: string]: any }) {
  return <As {...p} className={cx('rounded-xl2 border border-line bg-surface shadow-card', className)}>{children}</As>;
}

/** Israeli trail-marking blaze: white · colour · white. Used as the app's category marker. */
export function Blaze({ color, className, vertical }: { color: string; className?: string; vertical?: boolean }) {
  return (
    <span aria-hidden className={cx('inline-flex shrink-0 overflow-hidden rounded-[3px] border border-black/10', vertical ? 'h-5 w-2.5 flex-col' : 'h-2.5 w-5', className)}>
      <span className="flex-1 bg-white" /><span className="flex-1" style={{ background: color }} /><span className="flex-1 bg-white" />
    </span>
  );
}

export function Chip({ active, onClick, children, className, ...p }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string; [k: string]: any }) {
  return (
    <button type="button" aria-pressed={!!active} onClick={onClick} {...p}
      className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold transition',
        active ? 'border-forest bg-forest text-onforest' : 'border-line bg-surface text-ink hover:border-moss', className)}>{children}</button>
  );
}

export function Badge({ tone = 'muted', children, className }: { tone?: 'ok' | 'warn' | 'danger' | 'info' | 'muted' | 'accent'; children: ReactNode; className?: string }) {
  const t = { ok: 'bg-ok/12 text-ok', warn: 'bg-warn/15 text-warn', danger: 'bg-danger/12 text-danger', info: 'bg-info/12 text-info', muted: 'bg-raised text-muted', accent: 'bg-sunset/15 text-sunset' }[tone];
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold', t, className)}>{children}</span>;
}

export function Sheet({ open, onClose, title, children, wide, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    addEventListener('keydown', k);
    setTimeout(() => ref.current?.querySelector<HTMLElement>('input,select,textarea,button:not([data-close])')?.focus(), 30);
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; prev?.focus?.(); };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fade absolute inset-0 bg-black/45 backdrop-blur-[2px]" onClick={onClose} />
      <div ref={ref} className={cx('rise relative flex max-h-[92dvh] w-full flex-col rounded-t-[1.75rem] bg-surface shadow-lift sm:rounded-[1.75rem]', wide ? 'sm:max-w-3xl' : 'sm:max-w-lg')}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="font-display text-xl">{title}</h2>
          <button data-close onClick={onClose} aria-label="סגירה" className="grid h-10 w-10 place-items-center rounded-full hover:bg-raised"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="safe-b flex gap-2 border-t border-line px-5 pt-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 99, label, id }: { value: number; onChange: (n: number) => void; min?: number; max?: number; label: string; id?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2">
      <span id={id} className="font-semibold">{label}</span>
      <div className="flex items-center gap-2" role="group" aria-labelledby={id}>
        <button type="button" aria-label={`הפחתה ${label}`} onClick={() => onChange(Math.max(min, value - 1))} className="grid h-9 w-9 place-items-center rounded-full bg-raised hover:bg-sand"><Minus size={16} /></button>
        <output className="num w-7 text-center text-lg font-bold" aria-live="polite">{value}</output>
        <button type="button" aria-label={`הוספה ${label}`} onClick={() => onChange(Math.min(max, value + 1))} className="grid h-9 w-9 place-items-center rounded-full bg-raised hover:bg-sand"><Plus size={16} /></button>
      </div>
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; icon?: ReactNode }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)}
          className={cx('flex min-w-[6.5rem] flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition',
            value === o.v ? 'border-forest bg-forest/8 text-forest ring-2 ring-forest/30' : 'border-line bg-surface hover:border-moss')}>{o.icon}{o.label}</button>
      ))}
    </div>
  );
}

export function Ring({ pct, size = 64, stroke = 7, label }: { pct: number; size?: number; stroke?: number; label?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label ?? `${pct}%`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={pct >= 100 ? 'rgb(var(--ok))' : 'rgb(var(--sunset))'} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset .5s' }} />
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" fill="rgb(var(--ink))" fontSize={size * 0.26} fontWeight={800} className="num">{pct}%</text>
    </svg>
  );
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('space-y-3', className)}>
      <div className="flex items-end justify-between gap-3"><h2 className="font-display text-xl md:text-2xl">{title}</h2>{action}</div>
      {children}
    </section>
  );
}

export function Empty({ icon, title, body, action }: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl2 border border-dashed border-line px-6 py-10 text-center">
      {icon && <div className="mb-1 text-moss">{icon}</div>}
      <p className="font-display text-lg">{title}</p>
      {body && <p className="max-w-sm text-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-surface px-3 py-3">
      <span><span className="block font-semibold">{label}</span>{desc && <span className="block text-sm text-muted">{desc}</span>}</span>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span aria-hidden className="relative h-7 w-12 shrink-0 rounded-full bg-line transition peer-checked:bg-forest peer-focus-visible:ring-2 peer-focus-visible:ring-sunset after:absolute after:right-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:-translate-x-5" />
    </label>
  );
}

let toastTimer: any;
export function toast(msg: string) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); el.className = 'pointer-events-none fixed left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-bg shadow-lift transition-opacity'; el.style.bottom = 'calc(96px + env(safe-area-inset-bottom))'; document.body.appendChild(el); }
  el.textContent = msg; el.style.opacity = '1'; clearTimeout(toastTimer); toastTimer = setTimeout(() => (el!.style.opacity = '0'), 2600);
}
