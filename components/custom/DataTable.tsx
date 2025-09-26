// components/custom/DataTable.tsx (UPDATED)
import React, { ReactNode } from 'react'; // <-- Import ReactNode

// Defines the universal Column structure
export interface DataTableColumn {
  accessorKey?: string; // Made optional to allow columns like 'actions'
  id: string; // Add 'id' as a required key for all columns (or fall back to accessorKey)
  header: string;
  cell?: (props: { row: { original: any } }) => ReactNode; // Use ReactNode for flexibility
}

interface DataTableProps {
  columns: DataTableColumn[]; // Use the new interface
  data: any[];
  filterColumn: string;
}

export const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {

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
                // Use column.id here, falling back to accessorKey if needed
                key={column.id || column.accessorKey} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map(column => (
                <td 
                  // Use column.id here, falling back to accessorKey if needed
                  key={column.id || column.accessorKey} 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {/* Access data using accessorKey or just render cell content */}
                  {column.cell 
                    ? column.cell({ row: { original: row } }) 
                    : row[column.accessorKey!]} 
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};