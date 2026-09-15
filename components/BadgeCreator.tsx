'use client';

import { useMemo, useRef, useState } from 'react';
import BadgeCanvas from './BadgeCanvas';
import PhotoPicker from './PhotoPicker';
import ShareBar from './ShareBar';
import { COPY } from '@/lib/content';
import { track, type BadgeEvent } from '@/lib/analytics';
import { badgeSchema, validateField, type BadgeFields } from '@/lib/validation';

type Field = keyof BadgeFields;

function TextField({
  field, value, error, required, onChange,
}: {
  field: Field;
  value: string;
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  const copy = COPY.form[field];
  const id = `field-${field}`;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {copy.label}
        </label>
        {!required && <span className="text-xs text-muted">{COPY.form.optional}</span>}
      </div>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={40}
        required={required}
        placeholder={copy.placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base outline-none transition focus:border-primary"
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : (
        'hint' in copy && <p className="mt-2 text-xs text-muted">{copy.hint}</p>
      )}
    </div>
  );
}

export default function BadgeCreator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const started = useRef(false);
  const completed = useRef(false);

  const [fields, setFields] = useState({ name: '', role: '', company: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [photo, setPhoto] = useState<ImageBitmap>();
  const [zoom, setZoom] = useState(1);

  const valid = badgeSchema.safeParse(fields).success;

  function once(ref: React.RefObject<boolean>, event: BadgeEvent) {
    if (ref.current) return;
    ref.current = true;
    track(event);
  }

  function update(field: Field, value: string) {
    once(started, 'badge_started');
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: validateField(field, value) }));
    if (field === 'name' && value.trim().length >= 2) once(completed, 'badge_completed');
  }

  const data = useMemo(
    () => ({
      name: fields.name.trim() || 'Your name',
      role: fields.role.trim() || undefined,
      company: fields.company.trim() || undefined,
      photo,
      crop: { x: 0, y: 0, zoom },
    }),
    [fields, photo, zoom],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
      {/* Preview first on mobile — seeing the badge is what motivates finishing the form. */}
      <div className="lg:order-2 lg:sticky lg:top-8">
        <h2 className="mb-3 font-display text-sm font-semibold tracking-wide text-muted uppercase">
          {COPY.preview.label}
        </h2>
        <BadgeCanvas data={data} canvasRef={canvasRef} />
      </div>

      <div className="lg:order-1">
        <div className="space-y-6">
          <TextField
            field="name"
            required
            value={fields.name}
            error={errors.name}
            onChange={(v) => update('name', v)}
          />

          <PhotoPicker
            photo={photo}
            zoom={zoom}
            onPhoto={(next) => {
              setPhoto(next);
              if (next) track('photo_added');
            }}
            onZoom={setZoom}
          />

          <TextField
            field="role"
            value={fields.role}
            error={errors.role}
            onChange={(v) => update('role', v)}
          />
          <TextField
            field="company"
            value={fields.company}
            error={errors.company}
            onChange={(v) => update('company', v)}
          />
        </div>

        <div className="mt-8">
          <ShareBar
            canvasRef={canvasRef}
            disabled={!valid}
            role={fields.role.trim() || undefined}
            company={fields.company.trim() || undefined}
            onEvent={(name) => track(name as BadgeEvent)}
          />
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted">{COPY.disclaimer}</p>
      </div>
    </div>
  );
}
