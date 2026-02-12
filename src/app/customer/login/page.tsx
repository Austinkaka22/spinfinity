import Link from "next/link";
import { signInCustomerAction } from "@/lib/auth/actions";

type CustomerLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return typeof value === "string" && value.length > 0 ? value : null;
}

export default async function CustomerLoginPage({
  searchParams,
}: CustomerLoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = readParam(params.error);
  const success = readParam(params.success);
  const next = readParam(params.next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Customer Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to track your orders and manage your details.
        </p>
        {success ? (
          <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Account created. You can now sign in.
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {decodeURIComponent(error)}
          </p>
        ) : null}
        <form action={signInCustomerAction} className="mt-6 space-y-4">
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          <button className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white">
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          New customer?{" "}
          <Link href="/customer/sign-up" className="font-medium text-slate-900 underline">
            Create account
          </Link>
        </p>
      </section>
    </main>
  );
}
