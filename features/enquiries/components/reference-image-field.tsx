'use client';

import { useId, useState } from 'react';
import { MAX_REFERENCE_IMAGES_PER_ENQUIRY } from '@/lib/storage/buckets';
import {
  MAX_REFERENCE_IMAGE_BYTES,
  MAX_REFERENCE_IMAGE_MB,
  REFERENCE_ACCEPT_ATTRIBUTE,
} from '@/lib/uploads/limits';

/**
 * The private reference-image control (Requirements & SOW section 13).
 *
 * A plain `<input type="file" multiple>`, so it works with JavaScript disabled
 * exactly like the rest of the form. Everything else here is enhancement: the
 * chosen filenames are listed back, and an obviously wrong selection is called
 * out before the customer waits for an upload.
 *
 * None of the checks in this file are security. `accept`, `multiple` and the
 * messages below are conveniences that a browser can be told to ignore. The
 * server reads the bytes of every file and decides for itself
 * (`lib/uploads/reference-images.ts`), and the private bucket applies its own
 * type and size limits after that.
 *
 * The privacy promise is stated on the control itself, because that is where
 * the customer decides whether to attach a photograph of their family home or
 * a screenshot from a friend's wedding.
 */
export function ReferenceImageField() {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const [chosen, setChosen] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setChosen(files.map((file) => file.name));

    if (files.length > MAX_REFERENCE_IMAGES_PER_ENQUIRY) {
      setWarning(
        `Please choose at most ${MAX_REFERENCE_IMAGES_PER_ENQUIRY} images. Only your first ${MAX_REFERENCE_IMAGES_PER_ENQUIRY} would be kept.`,
      );
      return;
    }

    if (files.some((file) => file.size > MAX_REFERENCE_IMAGE_BYTES)) {
      setWarning(`Each image needs to be ${MAX_REFERENCE_IMAGE_MB} MB or smaller.`);
      return;
    }

    setWarning(null);
  }

  return (
    <div className="flex flex-col gap-1.5" data-testid="reference-image-field">
      <label htmlFor={inputId} className="text-sm font-medium">
        Inspiration images
        <span className="text-ink-muted font-normal"> (optional)</span>
      </label>

      <p id={hintId} className="text-ink-muted text-sm">
        Up to {MAX_REFERENCE_IMAGES_PER_ENQUIRY} pictures of a look you like. JPG, PNG
        or WEBP, {MAX_REFERENCE_IMAGE_MB} MB or less each.{' '}
        <strong className="font-medium">
          These stay private to your enquiry. They are never published on this website
          or shown to anyone outside the VRK Decor team.
        </strong>
      </p>

      <input
        id={inputId}
        name="referenceImages"
        type="file"
        multiple
        accept={REFERENCE_ACCEPT_ATTRIBUTE}
        onChange={onChange}
        aria-describedby={hintId}
        data-testid="reference-image-input"
        className="border-line-soft bg-surface file:bg-brand-50 hover:file:bg-brand-100 file:text-brand-800 w-full rounded-xl border px-3 py-2.5 text-base file:mr-3 file:min-h-9 file:cursor-pointer file:rounded-full file:border-0 file:px-4 file:py-2 file:text-sm"
      />

      {warning ? (
        <p className="text-sm text-red-700" role="status">
          {warning}
        </p>
      ) : null}

      {chosen.length > 0 ? (
        <ul
          className="text-ink-muted flex list-disc flex-col gap-0.5 pl-5 text-sm"
          data-testid="reference-image-list"
        >
          {chosen.map((name, index) => (
            <li key={`${name}-${index}`}>{name}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
