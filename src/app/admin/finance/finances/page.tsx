import { AdminPageSection } from "@/app/admin/_components/admin-page-section";
import {
  createFinanceAccountAction,
  createFinanceAdjustmentAction,
  createFinanceExpenseAction,
  createFinanceReceiveAction,
  updateFinanceAccountAction,
} from "@/app/admin/actions";
import { fetchAdminFinancesData } from "@/app/admin/data";

export default async function AdminFinancesPage() {
  const { accounts, balances, transactions, activeSuppliers } = await fetchAdminFinancesData();

  const byType = (type: "cash" | "mpesa" | "bank") => balances.find((b) => b.type === type)?.balance ?? 0;
  const total = balances.reduce((sum, b) => sum + Number(b.balance), 0);

  return (
    <div className="space-y-6">
      <AdminPageSection title="Balances" description="Live account balances from finance transactions.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[{label:"Cash", value:byType("cash")},{label:"Mpesa", value:byType("mpesa")},{label:"Bank", value:byType("bank")},{label:"Total", value:total}].map((card) => (
            <article key={card.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">{card.label} balance</p><p className="mt-1 text-2xl font-semibold text-[var(--brand-primary-dark)]">KES {card.value.toFixed(2)}</p></article>
          ))}
        </div>
      </AdminPageSection>

      <AdminPageSection title="Receive money" description="Record incoming funds.">
        <form action={createFinanceReceiveAction} className="grid gap-3 md:grid-cols-3">
          <input name="amount" type="number" min={0.01} step={0.01} required placeholder="Amount" className="rounded-md border border-slate-300 px-3 py-2" />
          <select name="account_id" required className="rounded-md border border-slate-300 px-3 py-2"><option value="">Select account</option>{accounts.filter((a)=>a.is_active).map((account)=><option key={account.id} value={account.id}>{account.name}</option>)}</select>
          <input name="note" placeholder="Note (optional)" className="rounded-md border border-slate-300 px-3 py-2" />
          <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white md:col-span-3">Receive</button>
        </form>
      </AdminPageSection>

      <AdminPageSection title="Expenses" description="Record outgoing expenses.">
        <form action={createFinanceExpenseAction} className="grid gap-3 md:grid-cols-3">
          <input name="amount" type="number" min={0.01} step={0.01} required placeholder="Amount" className="rounded-md border border-slate-300 px-3 py-2" />
          <select name="category" required className="rounded-md border border-slate-300 px-3 py-2"><option value="">Category</option><option value="supplies">Supplies</option><option value="salaries">Salaries</option><option value="rent">Rent</option><option value="utilities">Utilities</option><option value="other">Other</option></select>
          <select name="account_id" required className="rounded-md border border-slate-300 px-3 py-2"><option value="">Select account</option>{accounts.filter((a)=>a.is_active).map((account)=><option key={account.id} value={account.id}>{account.name}</option>)}</select>
          <select name="supplier_id" className="rounded-md border border-slate-300 px-3 py-2"><option value="">Supplier (optional)</option>{activeSuppliers.map((supplier)=><option key={supplier.id} value={supplier.id}>{supplier.company_name}</option>)}</select>
          <input name="note" placeholder="Note" className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2" />
          <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white md:col-span-3">Add Expense</button>
        </form>
      </AdminPageSection>

      <AdminPageSection title="Account management" description="Create, edit, deactivate accounts and set opening balances via adjustments.">
        <div className="space-y-3">
          <form action={createFinanceAccountAction} className="grid gap-3 rounded-lg border border-slate-200 p-3 md:grid-cols-4">
            <input name="name" required placeholder="Account name" className="rounded-md border border-slate-300 px-3 py-2" />
            <select name="type" className="rounded-md border border-slate-300 px-3 py-2"><option value="cash">Cash</option><option value="mpesa">Mpesa</option><option value="bank">Bank</option></select>
            <label className="flex items-center gap-2 text-sm"><input name="is_active" type="checkbox" defaultChecked /> Active</label>
            <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">Create account</button>
          </form>
          {accounts.map((account) => (
            <div key={account.id} className="rounded-lg border border-slate-200 p-3">
              <form action={updateFinanceAccountAction} className="grid gap-3 md:grid-cols-4">
                <input type="hidden" name="id" value={account.id} />
                <input name="name" defaultValue={account.name} className="rounded-md border border-slate-300 px-3 py-2" />
                <select name="type" defaultValue={account.type} className="rounded-md border border-slate-300 px-3 py-2"><option value="cash">Cash</option><option value="mpesa">Mpesa</option><option value="bank">Bank</option></select>
                <label className="flex items-center gap-2 text-sm"><input name="is_active" type="checkbox" defaultChecked={account.is_active} /> Active</label>
                <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">Save</button>
              </form>
              <form action={createFinanceAdjustmentAction} className="mt-3 grid gap-3 md:grid-cols-4">
                <input type="hidden" name="account_id" value={account.id} />
                <select name="direction" className="rounded-md border border-slate-300 px-3 py-2"><option value="in">Adjustment In</option><option value="out">Adjustment Out</option></select>
                <input name="amount" type="number" min={0.01} step={0.01} required placeholder="Amount" className="rounded-md border border-slate-300 px-3 py-2" />
                <input name="note" placeholder="Opening balance / adjustment note" className="rounded-md border border-slate-300 px-3 py-2" />
                <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">Post adjustment</button>
              </form>
            </div>
          ))}
        </div>
      </AdminPageSection>

      <AdminPageSection title="Recent transactions" description="Latest finance activity.">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700"><tr><th className="border-b border-slate-200 px-3 py-2">Time</th><th className="border-b border-slate-200 px-3 py-2">Type</th><th className="border-b border-slate-200 px-3 py-2">Direction</th><th className="border-b border-slate-200 px-3 py-2">Amount</th><th className="border-b border-slate-200 px-3 py-2">Category</th><th className="border-b border-slate-200 px-3 py-2">Note</th></tr></thead>
            <tbody>{transactions.map((txn) => <tr key={String(txn.id)} className="odd:bg-white even:bg-slate-50/40"><td className="border-b border-slate-100 px-3 py-2">{new Date(String(txn.created_at)).toLocaleString()}</td><td className="border-b border-slate-100 px-3 py-2">{String(txn.txn_type)}</td><td className="border-b border-slate-100 px-3 py-2">{String(txn.direction)}</td><td className="border-b border-slate-100 px-3 py-2">KES {Number(txn.amount).toFixed(2)}</td><td className="border-b border-slate-100 px-3 py-2">{String(txn.category ?? "-")}</td><td className="border-b border-slate-100 px-3 py-2">{String(txn.note ?? "-")}</td></tr>)}</tbody>
          </table>
        </div>
      </AdminPageSection>
    </div>
  );
}
