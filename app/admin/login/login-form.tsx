'use client';

import { useActionState } from 'react';
import { signInAction } from '@/features/admin/actions/auth';
import { idleActionState } from '@/features/admin/action-state';
import { Feedback, Field, SubmitButton } from '@/features/admin/components/admin-ui';

/**
 * The sign-in form.
 *
 * The email is echoed back after a failure so it need not be retyped. The
 * password never is: a page that re-renders a password into the DOM puts it in
 * the browser's memory, in any page cache and in a screenshot.
 */
export function LoginForm() {
  const [state, formAction] = useActionState(signInAction, idleActionState);

  const email = typeof state.values?.email === 'string' ? state.values.email : '';

  return (
    <form action={formAction} className="flex flex-col gap-5" data-testid="login-form">
      <Feedback state={state} />

      <Field name="email" label="Email address" required error={state.errors.email}>
        {(props) => (
          <input {...props} type="email" autoComplete="username" defaultValue={email} />
        )}
      </Field>

      <Field name="password" label="Password" required error={state.errors.password}>
        {(props) => (
          <input {...props} type="password" autoComplete="current-password" />
        )}
      </Field>

      <SubmitButton pendingLabel="Signing in…" testId="sign-in" fullWidth>
        Sign in
      </SubmitButton>
    </form>
  );
}
