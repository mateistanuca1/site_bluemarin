'use client';

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

export type SignaturePadHandle = {
  /** PNG ca base64, fara prefixul "data:image/png;base64,". Null daca e goala. */
  toBase64: () => string | null;
  isEmpty: () => boolean;
  clear: () => void;
};

type Props = {
  ref?: React.Ref<SignaturePadHandle>;
  label?: string;
};

/**
 * Semnatura desenata cu degetul sau mouse-ul. Scrisa de la zero cu Pointer Events,
 * ca sa nu depindem de o librarie externa.
 */
export default function SignaturePad({ ref, label = 'Semnătura' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  /** Redimensioneaza canvas-ul la densitatea ecranului, pastrand desenul. */
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;

    const nextW = Math.round(width * ratio);
    const nextH = Math.round(height * ratio);
    if (canvas.width === nextW && canvas.height === nextH) return;

    // Pastreaza ce era desenat deja.
    const previous = canvas.width && canvas.height ? canvas.toDataURL() : null;
    canvas.width = nextW;
    canvas.height = nextH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#151515';

    if (previous) {
      const img = new window.Image();
      img.onload = () => ctx.drawImage(img, 0, 0, width, height);
      img.src = previous;
    }
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  const pointFrom = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pointFrom(e);
    setEmpty(false);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const p = pointFrom(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const end = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    setEmpty(true);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      isEmpty: () => empty,
      clear,
      toBase64: () => {
        const canvas = canvasRef.current;
        if (!canvas || empty) return null;

        // Pune semnatura pe fond alb — altfel iese neagra pe negru in PDF.
        const flat = document.createElement('canvas');
        flat.width = canvas.width;
        flat.height = canvas.height;
        const ctx = flat.getContext('2d');
        if (!ctx) return null;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, flat.width, flat.height);
        ctx.drawImage(canvas, 0, 0);

        return flat.toDataURL('image/png').split(',')[1] ?? null;
      },
    }),
    [empty, clear],
  );

  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between">
        <span className="text-[12px] font-bold uppercase tracking-wide2 text-ink-soft">
          {label}
          <span className="ml-1 text-accent">*</span>
        </span>
        <button
          type="button"
          onClick={clear}
          className="text-[12px] font-bold uppercase tracking-wide2 text-brand hover:underline"
        >
          Șterge
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
        className="h-[170px] w-full cursor-crosshair touch-none rounded border border-dashed border-brand-300 bg-brand-50/40 transition-colors hover:border-brand"
        aria-label="Zonă de semnătură — desenează cu degetul sau cu mouse-ul"
        role="img"
      />

      <p className="mt-1.5 text-[12.5px] text-ink-muted">
        {empty ? 'Semnează în căsuța de mai sus.' : '✓ Semnătura a fost înregistrată.'}
      </p>
    </div>
  );
}
