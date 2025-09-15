import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export default function PieChartCard({
  data,
  title,
}: {
  data: { name: string; value: number }[];
  title?: string;
}) {
  const filtered = data.filter((d) => d.value > 0);
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded p-4">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={filtered} dataKey="value" nameKey="name" outerRadius={90} label>
              {filtered.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

