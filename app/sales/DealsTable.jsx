'use client';
// app/sales/DealsTable.jsx
// UC-002 Task 3: Pagination for the Open Pipeline Deals table — same
// approach as LeadsTable.jsx. Markup/logic matches the original inline
// table in app/sales/page.jsx exactly; only pagination was added.
import Link from 'next/link';
import { useState } from 'react';

const PAGE_SIZE = 5;

export default function DealsTable({ deals }) {
  const [start, setStart] = useState(0);
  const total = deals.length;
  const maxStart = Math.max(0, total - PAGE_SIZE);
  const visible = deals.slice(start, start + PAGE_SIZE);

  return (
    <>
      <table className="xyz-table">
        <thead>
          <tr>
            <th>Deal ID</th>
            <th>Contact</th>
            <th>Amount</th>
            <th>Stage</th>
            <th>Close Date</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((deal) => (
            <tr key={deal.deal_id}>
              <td>
                <Link href={`/sales/deals/${deal.deal_id}`}>
                  {deal.deal_id.slice(0, 8)}…
                </Link>
              </td>
              <td>{deal.contact?.name || '—'}</td>
              <td>${Number(deal.amount).toLocaleString()}</td>
              <td><span className="xyz-badge">{deal.stage}</span></td>
              <td>{deal.close_date || '—'}</td>
            </tr>
          ))}
          {total === 0 && (
            <tr><td colSpan={5} style={{ color: 'var(--xyz-muted)' }}>No open deals.</td></tr>
          )}
        </tbody>
      </table>

      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <button
            className="xyz-btn"
            onClick={() => setStart((s) => Math.max(0, s - PAGE_SIZE))}
            disabled={start === 0}
            type="button"
          >
            ‹ Prev
          </button>
          <input
            type="range"
            min={0}
            max={maxStart}
            step={PAGE_SIZE}
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
            style={{ flex: 1 }}
            aria-label="Scroll through deals"
          />
          <button
            className="xyz-btn"
            onClick={() => setStart((s) => Math.min(maxStart, s + PAGE_SIZE))}
            disabled={start >= maxStart}
            type="button"
          >
            Next ›
          </button>
          <span style={{ color: 'var(--xyz-muted)', fontSize: 14, whiteSpace: 'nowrap' }}>
            {start + 1}–{Math.min(start + PAGE_SIZE, total)} of {total}
          </span>
        </div>
      )}
    </>
  );
}
