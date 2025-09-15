import React from 'react';

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  // Provide this to make the column sortable
  sortAccessor?: (row: T) => string | number | null | undefined;
};

export function Table<T extends Record<string, any>>({
  columns,
  data,
  keyField,
}: {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
}) {
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');

  const onHeaderClick = (col: Column<T>) => {
    if (!col.sortAccessor) return;
    const k = String(col.key);
    if (sortKey === k) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(k);
      setSortDir('asc');
    }
  };

  const sorted = React.useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => String(c.key) === sortKey);
    if (!col || !col.sortAccessor) return data;
    const acc = col.sortAccessor;
    const arr = [...data];
    arr.sort((a, b) => {
      const av = acc(a);
      const bv = acc(b);
      const aNull = av == null as boolean;
      const bNull = bv == null as boolean;
      if (aNull && bNull) return 0;
      if (aNull) return 1; // nulls last
      if (bNull) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return av - bv;
      }
      return String(av).localeCompare(String(bv));
    });
    if (sortDir === 'desc') arr.reverse();
    return arr;
  }, [data, columns, sortKey, sortDir]);

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((col) => {
              const sortable = !!col.sortAccessor;
              const isActive = sortable && sortKey === String(col.key);
              const indicator = isActive ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';
              return (
                <th
                  key={String(col.key)}
                  className={`px-4 py-2 text-left text-sm font-medium ${sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => onHeaderClick(col)}
                >
                  {col.header}{indicator}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {sorted.map((row) => (
            <tr key={String(row[keyField])}>
              {columns.map((col) => (
                <td key={String(col.key)} className={`px-4 py-2 text-sm ${col.className ?? ''}`}>
                  {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-center text-sm text-gray-500" colSpan={columns.length}>
                Aucun élément
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
