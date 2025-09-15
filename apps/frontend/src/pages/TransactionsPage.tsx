import TransactionsTable from '../components/TransactionsTable';
import TransactionForm from '../components/TransactionForm';

export default function TransactionsPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Transactions</h2>
      <TransactionForm />
      <TransactionsTable />
    </section>
  );
}
