'use client';
// app/sales/leads/[id]/page.jsx
// UC-002 Task 6-9: Lead detail with a status dropdown. Saving:
//  - "In-progress" or "Disqualified" -> update lead, go back to dashboard
//  - "Qualified" -> update lead, then route to the Convert form
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const STATUS_OPTIONS = ['New', 'In-progress', 'Qualified', 'Disqualified'];

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/leads/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
        setStatus(data.lead.status);
      } else {
        setError('Could not load this lead.');
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      console.log("Step 1");
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      console.log("Step 2");
      if (!res.ok) throw new Error('Could not update lead status.');

      if (status === 'Qualified') {
        router.push(`/sales/leads/${id}/convert`);
      } else {
        router.push('/sales');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error && !lead) {
    return <main className="xyz-section">{error}</main>;
  }
  if (!lead) {
    return <main className="xyz-section">Loading…</main>;
  }

  return (
    <main>
      <nav className="xyz-navbar">
        <div className="brand">XYZ Software Solutions — Sales</div>
        <a href="/sales">Back to dashboard</a>
      </nav>

      <section className="xyz-section">
        <h1>Lead: {lead.name}</h1>
        <div className="xyz-form" style={{ margin: 0, maxWidth: 480 }}>
          <p><strong>Company:</strong> {lead.company || '—'}</p>
          <p><strong>Email:</strong> {lead.email}</p>

          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {error && <p className="xyz-error">{error}</p>}

          <button
            className="xyz-btn"
            style={{ marginTop: 24, width: '100%' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </section>
    </main>
  );
}
