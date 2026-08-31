import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-neutral-600">
        The page you are looking for does not exist or is no longer available.
      </p>
      <Link className="text-neutral-900 underline underline-offset-4" href="/">
        Return to the home page
      </Link>
    </main>
  );
}
