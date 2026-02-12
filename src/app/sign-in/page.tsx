import { redirect } from "next/navigation";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = (await searchParams) ?? {};
  const next = Array.isArray(params.next) ? params.next[0] : params.next;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const qs = new URLSearchParams();
  if (next) qs.set("next", next);
  if (error) qs.set("error", error);
  redirect(`/staff-login${qs.toString() ? `?${qs.toString()}` : ""}`);
}
