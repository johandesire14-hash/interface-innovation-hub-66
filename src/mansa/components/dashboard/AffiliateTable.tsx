import type { ReactNode } from "react";

export function AffiliateTable({ columns, children, empty }: { columns: string[]; children?: ReactNode; empty?: string | undefined }) {
  return <div className="overflow-x-auto border-y border-border">
    <table className="w-full min-w-[520px] table-fixed text-left text-sm">
      <thead className="bg-muted/40 text-xs text-muted-foreground">
        <tr>{columns.map((column) => <th key={column} scope="col" className="px-4 py-4 font-medium">{column}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-border">{empty ? <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">{empty}</td></tr> : children}</tbody>
    </table>
  </div>;
}

export const affiliateCell = "px-4 py-4 align-top break-words tabular-nums";
export const affiliateTab = "min-h-11 rounded-none border-b-2 border-transparent px-4 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none";