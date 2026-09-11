'use client';
// app/sales/LeadsTable.jsx
// UC-002 Task 3: Pagination for the Leads table — 5 records visible at a
// time, with Prev/Next buttons and a scrollbar (range input) to jump
// forward/backward by 5. This is the same table markup that used to be
// inline in app/sales/page.jsx, just wrapped with pagination — no
// existing columns/links were changed or removed.
import Link from 'next/link';
import { useState } from 'react';

const PAGE_SIZE = 5;

export default function LeadsTable({ leads }) {
  const [start, setStart] = useState(0);
  const total = leads.length;
  const maxStart = Math.max(0, total - PAGE_SIZE);
  const visible = leads.slice(start, start + PAGE_SIZE);

  return (
    <>
      <table className="xyz-table">
        <thead>
          <tr>
            <th>Lead ID</th>
            <th>Name</th>
            <th>Company</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((lead) => (
            <tr key={lead.lead_id}>
              <td>
                <Link href={`/sales/leads/${lead.lead_id}`}>
                  {lead.lead_id.slice(0, 8)}…
                </Link>
              </td>
              <td>{lead.name}</td>
              <td>{lead.company || '—'}</td>
              <td>{lead.email}</td>
              <td><span className="xyz-badge">{lead.status}</span></td>
            </tr>
          ))}
          {total === 0 && (
            <tr><td colSpan={5} style={{ color: 'var(--xyz-muted)' }}>No leads yet.</td></tr>
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
            aria-label="Scroll through leads"
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
