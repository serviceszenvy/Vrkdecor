'use client';

import { useActionState } from 'react';
import type {
  OccasionRow,
  PackageRow,
  ServiceRow,
  StyleRow,
  TestimonialRow,
} from '@/lib/db/types';
import {
  DESCRIPTION_MAX,
  NAME_MAX,
  TESTIMONIAL_BODY_MAX,
} from '@/lib/validation/admin';
import {
  saveOccasionAction,
  savePackageAction,
  saveServiceAction,
  saveStyleAction,
  saveTestimonialAction,
} from '../actions/content';
import { idleActionState } from '../action-state';
import { Feedback, Field, SubmitButton, echoed } from './admin-ui';

/**
 * Forms for the admin-managed vocabulary and page content.
 *
 * Each one creates a row when it is given no id and updates when it is given
 * one, so the "add" form at the top of a list and the "edit" form on a row are
 * the same component with the same rules.
 *
 * None of them offers a delete. Occasions, styles and services are referenced
 * by designs with ON DELETE RESTRICT, and their slugs are public URLs, so
 * switching a term to inactive is the operation that actually does what an
 * admin means. The reasoning is recorded in `features/admin/actions/content.ts`.
 */

function StatusField({ error, value }: { error: string | undefined; value: string }) {
  return (
    <Field
      name="status"
      label="Status"
      required
      error={error}
      hint="Inactive hides it from the public website and from new designs, without touching existing work."
    >
      {(props) => (
        <select {...props} defaultValue={value}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      )}
    </Field>
  );
}

function SortOrderField({
  error,
  value,
}: {
  error: string | undefined;
  value: string;
}) {
  return (
    <Field
      name="sortOrder"
      label="Order"
      error={error}
      hint="Lower numbers appear first."
    >
      {(props) => <input {...props} type="number" defaultValue={value} />}
    </Field>
  );
}

function SlugField({
  error,
  value,
  hint,
}: {
  error: string | undefined;
  value: string;
  hint: string;
}) {
  return (
    <Field name="slug" label="Web address" error={error} hint={hint}>
      {(props) => <input {...props} type="text" maxLength={80} defaultValue={value} />}
    </Field>
  );
}

export function OccasionForm({ occasion }: { occasion?: OccasionRow }) {
  const [state, formAction] = useActionState(saveOccasionAction, idleActionState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      data-testid="occasion-form"
    >
      {occasion ? <input type="hidden" name="occasionId" value={occasion.id} /> : null}
      <Feedback state={state} />

      <Field name="name" label="Name" required error={state.errors.name}>
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={NAME_MAX}
            defaultValue={echoed(state, 'name', occasion?.name)}
          />
        )}
      </Field>

      <Field
        name="secondaryTerm"
        label="Tamil term"
        error={state.errors.secondaryTerm}
        hint='Shown alongside the English name, as in "Engagement / Nichayathartham".'
      >
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={NAME_MAX}
            defaultValue={echoed(state, 'secondaryTerm', occasion?.secondary_term)}
          />
        )}
      </Field>

      <SlugField
        error={state.errors.slug}
        value={echoed(state, 'slug', occasion?.slug)}
        hint="Leave blank to build one from the name. Changing it changes the public filter link."
      />

      <Field name="description" label="Description" error={state.errors.description}>
        {(props) => (
          <textarea
            {...props}
            rows={3}
            maxLength={DESCRIPTION_MAX}
            defaultValue={echoed(state, 'description', occasion?.description)}
          />
        )}
      </Field>

      <StatusField
        error={state.errors.status}
        value={echoed(state, 'status', occasion?.status ?? 'active')}
      />
      <SortOrderField
        error={state.errors.sortOrder}
        value={echoed(state, 'sortOrder', occasion?.sort_order ?? 0)}
      />

      <div>
        <SubmitButton>{occasion ? 'Save occasion' : 'Add occasion'}</SubmitButton>
      </div>
    </form>
  );
}

export function StyleForm({ style }: { style?: StyleRow }) {
  const [state, formAction] = useActionState(saveStyleAction, idleActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4" data-testid="style-form">
      {style ? <input type="hidden" name="styleId" value={style.id} /> : null}
      <Feedback state={state} />

      <Field name="name" label="Name" required error={state.errors.name}>
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={NAME_MAX}
            defaultValue={echoed(state, 'name', style?.name)}
          />
        )}
      </Field>

      <SlugField
        error={state.errors.slug}
        value={echoed(state, 'slug', style?.slug)}
        hint="Leave blank to build one from the name."
      />

      <StatusField
        error={state.errors.status}
        value={echoed(state, 'status', style?.status ?? 'active')}
      />
      <SortOrderField
        error={state.errors.sortOrder}
        value={echoed(state, 'sortOrder', style?.sort_order ?? 0)}
      />

      <div>
        <SubmitButton>{style ? 'Save style' : 'Add style'}</SubmitButton>
      </div>
    </form>
  );
}

export function ServiceForm({ service }: { service?: ServiceRow }) {
  const [state, formAction] = useActionState(saveServiceAction, idleActionState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      data-testid="service-form"
    >
      {service ? <input type="hidden" name="serviceId" value={service.id} /> : null}
      <Feedback state={state} />

      <Field name="name" label="Name" required error={state.errors.name}>
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={NAME_MAX}
            defaultValue={echoed(state, 'name', service?.name)}
          />
        )}
      </Field>

      <SlugField
        error={state.errors.slug}
        value={echoed(state, 'slug', service?.slug)}
        hint="Leave blank to build one from the name."
      />

      <Field name="description" label="Description" error={state.errors.description}>
        {(props) => (
          <textarea
            {...props}
            rows={3}
            maxLength={DESCRIPTION_MAX}
            defaultValue={echoed(state, 'description', service?.description)}
          />
        )}
      </Field>

      <Field
        name="deliveryModel"
        label="Delivered by"
        required
        error={state.errors.deliveryModel}
        hint="Partner-vendor services are labelled as such on the public site, which the requirements ask for explicitly."
      >
        {(props) => (
          <select
            {...props}
            defaultValue={echoed(
              state,
              'deliveryModel',
              service?.delivery_model ?? 'in_house',
            )}
          >
            <option value="in_house">VRK Decor</option>
            <option value="partner_vendor">Trusted partner vendor</option>
          </select>
        )}
      </Field>

      <StatusField
        error={state.errors.status}
        value={echoed(state, 'status', service?.status ?? 'active')}
      />
      <SortOrderField
        error={state.errors.sortOrder}
        value={echoed(state, 'sortOrder', service?.sort_order ?? 0)}
      />

      <div>
        <SubmitButton>{service ? 'Save service' : 'Add service'}</SubmitButton>
      </div>
    </form>
  );
}

export function PackageForm({ pkg }: { pkg?: PackageRow }) {
  const [state, formAction] = useActionState(savePackageAction, idleActionState);

  const startingPriceRupees =
    pkg?.starting_price === null || pkg?.starting_price === undefined
      ? ''
      : String(Math.round(pkg.starting_price / 100));

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      data-testid="package-form"
    >
      {pkg ? <input type="hidden" name="packageId" value={pkg.id} /> : null}
      <Feedback state={state} />

      <Field name="name" label="Package name" required error={state.errors.name}>
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={NAME_MAX}
            defaultValue={echoed(state, 'name', pkg?.name)}
          />
        )}
      </Field>

      <SlugField
        error={state.errors.slug}
        value={echoed(state, 'slug', pkg?.slug)}
        hint="Leave blank to build one from the name."
      />

      <Field
        name="description"
        label="What it includes"
        error={state.errors.description}
      >
        {(props) => (
          <textarea
            {...props}
            rows={4}
            maxLength={DESCRIPTION_MAX}
            defaultValue={echoed(state, 'description', pkg?.description)}
          />
        )}
      </Field>

      <Field
        name="pricingMode"
        label="Pricing"
        required
        error={state.errors.pricingMode}
        hint="Packages are the only place the website may show a price, and only as an approved starting figure."
      >
        {(props) => (
          <select
            {...props}
            defaultValue={echoed(
              state,
              'pricingMode',
              pkg?.pricing_mode ?? 'custom_quote',
            )}
          >
            <option value="custom_quote">Custom quote</option>
            <option value="starting_from">Starting from a price</option>
          </select>
        )}
      </Field>

      <Field
        name="startingPrice"
        label="Starting price"
        error={state.errors.startingPrice}
        hint="Whole rupees, no decimals. Leave blank for a custom quote."
      >
        {(props) => (
          <input
            {...props}
            type="text"
            inputMode="numeric"
            defaultValue={echoed(state, 'startingPrice', startingPriceRupees)}
          />
        )}
      </Field>

      <Field
        name="status"
        label="Status"
        required
        error={state.errors.status}
        hint="Only published packages appear on the website."
      >
        {(props) => (
          <select
            {...props}
            defaultValue={echoed(state, 'status', pkg?.status ?? 'draft')}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        )}
      </Field>

      <SortOrderField
        error={state.errors.sortOrder}
        value={echoed(state, 'sortOrder', pkg?.sort_order ?? 0)}
      />

      <div>
        <SubmitButton>{pkg ? 'Save package' : 'Add package'}</SubmitButton>
      </div>
    </form>
  );
}

export function TestimonialForm({ testimonial }: { testimonial?: TestimonialRow }) {
  const [state, formAction] = useActionState(saveTestimonialAction, idleActionState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      data-testid="testimonial-form"
    >
      {testimonial ? (
        <input type="hidden" name="testimonialId" value={testimonial.id} />
      ) : null}
      <Feedback state={state} />

      <Field name="name" label="Customer name" required error={state.errors.name}>
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={NAME_MAX}
            defaultValue={echoed(state, 'name', testimonial?.name)}
          />
        )}
      </Field>

      <Field
        name="body"
        label="What they said"
        required
        error={state.errors.body}
        hint="Their words, not a summary. Only publish what the customer has agreed to."
      >
        {(props) => (
          <textarea
            {...props}
            rows={5}
            maxLength={TESTIMONIAL_BODY_MAX}
            defaultValue={echoed(state, 'body', testimonial?.body)}
          />
        )}
      </Field>

      <Field name="eventType" label="Occasion" error={state.errors.eventType}>
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={NAME_MAX}
            placeholder="Wedding"
            defaultValue={echoed(state, 'eventType', testimonial?.event_type)}
          />
        )}
      </Field>

      <Field
        name="approvalStatus"
        label="Approval"
        required
        error={state.errors.approvalStatus}
        hint="Only approved testimonials appear on the website."
      >
        {(props) => (
          <select
            {...props}
            defaultValue={echoed(
              state,
              'approvalStatus',
              testimonial?.approval_status ?? 'pending',
            )}
          >
            <option value="pending">Pending review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
      </Field>

      <Field name="displayOrder" label="Order" error={state.errors.displayOrder}>
        {(props) => (
          <input
            {...props}
            type="number"
            defaultValue={echoed(
              state,
              'displayOrder',
              testimonial?.display_order ?? 0,
            )}
          />
        )}
      </Field>

      <div>
        <SubmitButton>
          {testimonial ? 'Save testimonial' : 'Add testimonial'}
        </SubmitButton>
      </div>
    </form>
  );
}
