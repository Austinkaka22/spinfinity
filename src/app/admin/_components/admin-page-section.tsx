type AdminPageSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AdminPageSection({
  title,
  description,
  children,
}: AdminPageSectionProps) {
  return (
    <section className="rounded-2xl border border-[var(--brand-line)] bg-white p-6 shadow-sm">
      <header className="mb-4">
        <h2 className="text-xl font-semibold text-[var(--brand-primary)]">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </header>
      {children}
    </section>
  );
}
