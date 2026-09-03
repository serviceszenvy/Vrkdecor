import { Badge, Button } from '@/components/ui';
import { requireAdminContext } from '@/lib/auth/admin';
import { deleteTestimonialAction } from '@/features/admin/actions/content';
import {
  AdminCard,
  AdminPageHeading,
  AdminShell,
} from '@/features/admin/components/admin-shell';
import { TestimonialForm } from '@/features/admin/components/content-forms';
import { listAllTestimonials } from '@/features/admin/data';

export const dynamic = 'force-dynamic';

/**
 * Testimonials.
 *
 * A testimonial is a real customer's words on a public page, so nothing reaches
 * the website until someone has approved it. New entries start as pending and
 * the public page reads only approved ones, enforced by the
 * `testimonials_public_read` policy rather than by a filter here.
 */
export default async function AdminTestimonialsPage() {
  const { admin, supabase } = await requireAdminContext();
  const testimonials = await listAllTestimonials(supabase);

  const pending = testimonials.filter((row) => row.approval_status === 'pending');

  return (
    <AdminShell admin={admin} current="/admin/testimonials">
      <AdminPageHeading
        title="Testimonials"
        lead={
          pending.length > 0
            ? `${pending.length} awaiting review. Only approved testimonials appear on the website.`
            : 'Only approved testimonials appear on the website.'
        }
      />

      <AdminCard title="Add a testimonial">
        <TestimonialForm />
      </AdminCard>

      {testimonials.length === 0 ? (
        <AdminCard>
          <p className="text-ink-muted text-sm" data-testid="no-testimonials">
            No testimonials yet.
          </p>
        </AdminCard>
      ) : (
        testimonials.map((testimonial) => (
          <AdminCard key={testimonial.id}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="font-display text-xl font-medium">{testimonial.name}</h2>
              <Badge
                tone={testimonial.approval_status === 'approved' ? 'brand' : 'neutral'}
              >
                {testimonial.approval_status === 'approved'
                  ? 'Approved'
                  : testimonial.approval_status === 'rejected'
                    ? 'Rejected'
                    : 'Pending review'}
              </Badge>
              <form action={deleteTestimonialAction} className="ml-auto">
                <input type="hidden" name="testimonialId" value={testimonial.id} />
                <Button type="submit" variant="ghost" size="sm">
                  Delete
                </Button>
              </form>
            </div>
            <TestimonialForm testimonial={testimonial} />
          </AdminCard>
        ))
      )}
    </AdminShell>
  );
}
