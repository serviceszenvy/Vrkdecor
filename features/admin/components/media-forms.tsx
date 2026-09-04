'use client';

import { useActionState } from 'react';
import {
  MAX_PORTFOLIO_IMAGE_MB,
  MAX_PORTFOLIO_UPLOAD_BATCH,
  MIN_PORTFOLIO_IMAGE_EDGE,
  PORTFOLIO_ACCEPT_ATTRIBUTE,
} from '@/lib/uploads';
import { ALT_TEXT_MAX, CAPTION_MAX } from '@/lib/validation/admin';
import {
  addDesignVideoAction,
  updateAltTextAction,
  uploadDesignImagesAction,
} from '../actions/media';
import { idleActionState } from '../action-state';
import { Feedback, Field, SubmitButton, echoed } from './admin-ui';

/**
 * Media forms for a Design: uploads, alt text and videos.
 *
 * The file inputs are plain `<input type="file">` elements, so they work with
 * JavaScript disabled exactly like the quote form's. Every limit stated on
 * screen is re-applied server-side by `lib/uploads`, and the `accept` attribute
 * is a hint to the file picker rather than a control.
 */

export function ImageUploadForm({
  designId,
  hasCover,
}: {
  designId: string;
  hasCover: boolean;
}) {
  const [state, formAction] = useActionState(uploadDesignImagesAction, idleActionState);

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="flex flex-col gap-4"
      data-testid="image-upload-form"
    >
      <input type="hidden" name="designId" value={designId} />
      <Feedback state={state} />

      <Field
        name="images"
        label="Add photographs"
        required
        hint={`JPG, PNG or WEBP. Up to ${MAX_PORTFOLIO_UPLOAD_BATCH} at a time, ${MAX_PORTFOLIO_IMAGE_MB} MB each, at least ${MIN_PORTFOLIO_IMAGE_EDGE} pixels on the shorter edge. AVIF and HEIC are not accepted, export as JPG first.`}
      >
        {(props) => (
          <input
            {...props}
            type="file"
            multiple
            accept={PORTFOLIO_ACCEPT_ATTRIBUTE}
            data-testid="design-image-input"
            className="border-line-soft bg-surface file:bg-brand-50 hover:file:bg-brand-100 file:text-brand-800 w-full rounded-xl border px-3 py-2 text-base file:mr-3 file:min-h-9 file:cursor-pointer file:rounded-full file:border-0 file:px-4 file:py-2 file:text-sm"
          />
        )}
      </Field>

      <label className="border-line-soft hover:border-brand-300 hover:bg-brand-50/60 flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors">
        <input
          type="checkbox"
          name="asCover"
          value="on"
          defaultChecked={!hasCover}
          className="accent-brand-700 mt-0.5 size-5 shrink-0"
        />
        <span className="text-sm">
          Use as the cover image
          <span className="text-ink-muted block text-xs">
            {hasCover
              ? 'Replaces the current cover. Upload one image when this is ticked.'
              : 'This design has no cover yet, and it needs one before it can be published.'}
          </span>
        </span>
      </label>

      <div>
        <SubmitButton pendingLabel="Uploading…" testId="upload-images">
          Upload
        </SubmitButton>
      </div>
    </form>
  );
}

export function AltTextForm({
  designId,
  imageId,
  altText,
}: {
  designId: string;
  imageId: string;
  altText: string | null;
}) {
  const [state, formAction] = useActionState(updateAltTextAction, idleActionState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="designId" value={designId} />
      <input type="hidden" name="imageId" value={imageId} />

      <label htmlFor={`alt-${imageId}`} className="text-xs font-medium">
        Image description
        <span className="text-ink-muted font-normal">
          {' '}
          — what a screen reader will say
        </span>
      </label>
      <input
        id={`alt-${imageId}`}
        name="altText"
        type="text"
        maxLength={ALT_TEXT_MAX}
        defaultValue={altText ?? ''}
        placeholder="Gold and ivory mandap with floral pillars"
        aria-invalid={state.errors.altText ? true : undefined}
        className="border-line-soft bg-surface min-h-11 w-full rounded-xl border px-3 py-2 text-sm"
      />
      {state.status !== 'idle' && state.message ? (
        <p
          className={
            state.status === 'saved' ? 'text-ink-muted text-xs' : 'text-xs text-red-700'
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <div>
        <SubmitButton size="sm" variant="outline" pendingLabel="Saving…">
          Save description
        </SubmitButton>
      </div>
    </form>
  );
}

export function VideoForm({ designId }: { designId: string }) {
  const [state, formAction] = useActionState(addDesignVideoAction, idleActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4" data-testid="video-form">
      <input type="hidden" name="designId" value={designId} />
      <Feedback state={state} />

      <Field name="provider" label="Provider" required error={state.errors.provider}>
        {(props) => (
          <select {...props} defaultValue={echoed(state, 'provider', 'youtube')}>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="vimeo">Vimeo</option>
          </select>
        )}
      </Field>

      <Field
        name="url"
        label="Video URL"
        required
        error={state.errors.url}
        hint="The public link to the video or reel. It must be https and belong to the provider you chose."
      >
        {(props) => (
          <input
            {...props}
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            defaultValue={echoed(state, 'url', '')}
          />
        )}
      </Field>

      <Field name="caption" label="Caption" error={state.errors.caption}>
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={CAPTION_MAX}
            defaultValue={echoed(state, 'caption', '')}
          />
        )}
      </Field>

      <Field name="sortOrder" label="Order" error={state.errors.sortOrder}>
        {(props) => (
          <input
            {...props}
            type="number"
            defaultValue={echoed(state, 'sortOrder', '0')}
          />
        )}
      </Field>

      <div>
        <SubmitButton variant="outline">Add video</SubmitButton>
      </div>
    </form>
  );
}
