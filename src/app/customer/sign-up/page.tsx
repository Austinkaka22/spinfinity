import Link from "next/link";
import { signUpCustomerAction } from "@/lib/auth/actions";

type CustomerSignUpPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return typeof value === "string" && value.length > 0 ? value : null;
}

export default async function CustomerSignUpPage({
  searchParams,
}: CustomerSignUpPageProps) {
  const params = (await searchParams) ?? {};
  const error = readParam(params.error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create Customer Account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Register once and track all your laundry orders online.
        </p>
        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {decodeURIComponent(error)}
          </p>
        ) : null}
        <form action={signUpCustomerAction} className="mt-6 grid gap-3">
          <input
            name="full_name"
            required
            placeholder="Full name"
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          <input
            name="phone"
            placeholder="Phone number"
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          <textarea
            name="address"
            rows={2}
            placeholder="Address"
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Password"
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          />
          <button className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white">
            Create Account
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/customer/login" className="font-medium text-slate-900 underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
