// components/custom/DataTable.tsx
import React, { ReactNode } from 'react'; 

// 1. Define the Column structure using a generic <T> for the row data type
export interface DataTableColumn<T extends object> {
  accessorKey?: keyof T | string; 
  id: string; 
  header: string;
  cell?: (props: { row: { original: T } }) => ReactNode; 
}

// 2. Define the Props structure using the same generic <T>
interface DataTableProps<T extends object> {
  columns: DataTableColumn<T>[]; 
  data: T[]; 
  filterColumn: keyof T | string; 
}

// 3. Apply the generic <T> to the functional component itself
export const DataTable = <T extends object>({ data, columns }: DataTableProps<T>) => {

  if (data.length === 0) {
    return <p className="text-center text-slate-500 py-4">No data to display.</p>;
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th 
                // Ensure key is a string
                key={column.id || String(column.accessorKey)} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            // Use rowIndex for the row key
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map(column => (
                <td 
                  // Use a combined string for cell key
                  key={`${rowIndex}-${column.id || String(column.accessorKey)}`} 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {/* 💡 FIX: Explicitly check for cell function, otherwise render the string representation */}
                  {column.cell 
                    ? column.cell({ row: { original: row } }) 
                    // Safely convert the data value to ReactNode (string/number)
                    : String(row[column.accessorKey as keyof T])} 
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};