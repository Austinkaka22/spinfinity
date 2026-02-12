import Link from "next/link";
import { signInStaffAction } from "@/lib/auth/actions";

type StaffLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return typeof value === "string" && value.length > 0 ? value : null;
}

export default async function StaffLoginPage({ searchParams }: StaffLoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = readParam(params.error);
  const next = readParam(params.next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Staff Login</h1>
        <p className="mt-2 text-sm text-slate-600">
          Admins, staff, and drivers sign in here.
        </p>
        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {decodeURIComponent(error)}
          </p>
        ) : null}
        <form action={signInStaffAction} className="mt-6 space-y-4">
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-slate-300 focus:ring-2"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
          >
            Continue
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Customer?{" "}
          <Link href="/customer/login" className="font-medium text-slate-900 underline">
            Login here
          </Link>
        </p>
      </section>
    </main>
  );
}
