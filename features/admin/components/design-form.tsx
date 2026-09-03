'use client';

import { useActionState } from 'react';
import type { DesignRow, OccasionRow, ServiceRow, StyleRow } from '@/lib/db/types';
import { PARTNER_VENDOR_LABEL } from '@/lib/content';
import {
  DESCRIPTION_MAX,
  LOCATION_MAX,
  NAME_MAX,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
} from '@/lib/validation/admin';
import { createDesignAction, updateDesignAction } from '../actions/designs';
import { idleActionState } from '../action-state';
import {
  CheckboxGroup,
  Feedback,
  Field,
  SubmitButton,
  echoed,
  echoedList,
} from './admin-ui';

/**
 * The Design details form.
 *
 * One component for creating and editing, because the fields and the rules are
 * identical and two copies would drift. The only difference is which action it
 * posts to and whether a hidden id travels with it.
 *
 * Publication is deliberately NOT a field here. Requirements & SOW section 9
 * treats publishing as its own decision with its own precondition (a design
 * needs a cover image before it can go live), so it lives on its own control
 * next to the images rather than as a dropdown an admin can change while typing
 * a description.
 */
export function DesignForm({
  design,
  occasions,
  styles,
  services,
  selectedStyleIds,
  selectedServiceIds,
}: {
  design: DesignRow | null;
  occasions: OccasionRow[];
  styles: StyleRow[];
  services: ServiceRow[];
  selectedStyleIds: string[];
  selectedServiceIds: string[];
}) {
  const [state, formAction] = useActionState(
    design ? updateDesignAction : createDesignAction,
    idleActionState,
  );

  const startingPriceRupees =
    design?.starting_price === null || design?.starting_price === undefined
      ? ''
      : String(Math.round(design.starting_price / 100));

  return (
    <form action={formAction} className="flex flex-col gap-6" data-testid="design-form">
      {design ? <input type="hidden" name="designId" value={design.id} /> : null}

      <Feedback state={state} />

      <Field
        name="name"
        label="Design name"
        required
        error={state.errors.name}
        hint="What VRK Decor calls this celebration. Shown as the title everywhere."
      >
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={NAME_MAX}
            defaultValue={echoed(state, 'name', design?.name)}
          />
        )}
      </Field>

      <Field
        name="slug"
        label="Web address"
        error={state.errors.slug}
        hint="Leave blank to build one from the name. Changing it changes the public URL and breaks any link already shared."
      >
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={80}
            placeholder="golden-mandap-setting"
            defaultValue={echoed(state, 'slug', design?.slug)}
          />
        )}
      </Field>

      <Field name="occasionId" label="Occasion" error={state.errors.occasionId}>
        {(props) => (
          <select
            {...props}
            defaultValue={echoed(state, 'occasionId', design?.occasion_id)}
          >
            <option value="">Not set</option>
            {occasions.map((occasion) => (
              <option key={occasion.id} value={occasion.id}>
                {occasion.name}
                {occasion.secondary_term ? ` / ${occasion.secondary_term}` : ''}
                {occasion.status === 'inactive' ? ' (inactive)' : ''}
              </option>
            ))}
          </select>
        )}
      </Field>

      <CheckboxGroup
        legend="Styles"
        name="styleIds"
        hint="Used by the public style filter. A design may have several."
        options={styles.map((style) => ({
          id: style.id,
          label: style.name,
          note: style.status === 'inactive' ? 'Inactive' : undefined,
        }))}
        selected={echoedList(state, 'styleIds', selectedStyleIds)}
      />

      <CheckboxGroup
        legend="Services shown"
        name="serviceIds"
        hint="What this celebration included. Used by the public service filter."
        options={services.map((service) => ({
          id: service.id,
          label: service.name,
          note:
            service.delivery_model === 'partner_vendor'
              ? PARTNER_VENDOR_LABEL
              : service.status === 'inactive'
                ? 'Inactive'
                : undefined,
        }))}
        selected={echoedList(state, 'serviceIds', selectedServiceIds)}
      />

      <Field
        name="location"
        label="Location"
        error={state.errors.location}
        hint="The town or city this celebration took place in."
      >
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={LOCATION_MAX}
            defaultValue={echoed(state, 'location', design?.location)}
          />
        )}
      </Field>

      <Field
        name="description"
        label="Description"
        error={state.errors.description}
        hint="Shown on the design page. Related images reuse it, so describe the celebration rather than one photograph."
      >
        {(props) => (
          <textarea
            {...props}
            rows={5}
            maxLength={DESCRIPTION_MAX}
            defaultValue={echoed(state, 'description', design?.description)}
          />
        )}
      </Field>

      <Field
        name="pricingMode"
        label="Pricing"
        required
        error={state.errors.pricingMode}
      >
        {(props) => (
          <select
            {...props}
            defaultValue={echoed(
              state,
              'pricingMode',
              design?.quote_mode ?? 'custom_quote',
            )}
          >
            <option value="custom_quote">Custom quote (recommended)</option>
            <option value="starting_from">Starting from a price</option>
          </select>
        )}
      </Field>

      <Field
        name="startingPrice"
        label="Starting price"
        error={state.errors.startingPrice}
        hint='Whole rupees, no decimals. Only for "starting from" designs; leave blank for a custom quote.'
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

      <div>
        <label className="border-line-soft hover:border-brand-300 hover:bg-brand-50/60 flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors">
          <input
            type="checkbox"
            name="featured"
            value="on"
            defaultChecked={
              state.values?.featured !== undefined
                ? state.values.featured === 'on'
                : (design?.featured ?? false)
            }
            className="accent-brand-700 mt-0.5 size-5 shrink-0"
          />
          <span className="text-sm">
            Featured
            <span className="text-ink-muted block text-xs">
              Featured designs appear first in the portfolio and on the home page.
            </span>
          </span>
        </label>
      </div>

      <Field
        name="seoTitle"
        label="Search engine title"
        error={state.errors.seoTitle}
        hint="Leave blank to use the design name."
      >
        {(props) => (
          <input
            {...props}
            type="text"
            maxLength={SEO_TITLE_MAX}
            defaultValue={echoed(state, 'seoTitle', design?.seo_title)}
          />
        )}
      </Field>

      <Field
        name="seoDescription"
        label="Search engine description"
        error={state.errors.seoDescription}
        hint="Leave blank to use the description above."
      >
        {(props) => (
          <textarea
            {...props}
            rows={2}
            maxLength={SEO_DESCRIPTION_MAX}
            defaultValue={echoed(state, 'seoDescription', design?.seo_description)}
          />
        )}
      </Field>

      <div>
        <SubmitButton testId="design-submit">
          {design ? 'Save design' : 'Create design'}
        </SubmitButton>
      </div>
    </form>
  );
}
