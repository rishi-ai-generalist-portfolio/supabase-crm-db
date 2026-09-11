'use client';
// app/sales/deals/[id]/page.jsx
// UC-002 Task 11-12: Deal detail page with a Status dropdown.
// Business rule (Task 11): once a Deal leaves "Discovery" it can never
// move back to "Discovery", and once it reaches "Closed Won" or
// "Closed Lost" the status is locked and cannot change again. The same
// rule is enforced again server-side in app/api/deals/[id]/route.js.
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const SELECTABLE_STAGES = ['Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];
const TERMINAL_STAGES = ['Closed Won', 'Closed Lost'];

function getSelectableStages(currentStage) {
  if (TERMINAL_STAGES.includes(currentStage)) return [currentStage];
  if (currentStage === 'Discovery') return SELECTABLE_STAGES;
  const idx = SELECTABLE_STAGES.indexOf(currentStage);
  return SELECTABLE_STAGES.slice(idx === -1 ? 0 : idx);
}

export default function DealDetailPage() {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [stage, setStage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/deals/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDeal(data.deal);
        setStage(data.deal.stage);
      } else {
        setError('Could not load this deal.');
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch(`/api/deals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not update deal status.');
      setDeal(data.deal);
      setStage(data.deal.stage);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (error && !deal) {
    return <main className="xyz-section">{error}</main>;
  }
  if (!deal) {
    return <main className="xyz-section">Loading…</main>;
  }

  const locked = TERMINAL_STAGES.includes(deal.stage);
  const options = getSelectableStages(deal.stage);

  return (
    <main>
      <nav className="xyz-navbar">
        <div className="brand">XYZ Software Solutions — Sales</div>
        <a href="/sales">Back to dashboard</a>
      </nav>

      <section className="xyz-section">
        <h1>Deal: {deal.deal_id.slice(0, 8)}…</h1>
        <div className="xyz-form" style={{ margin: 0, maxWidth: 480 }}>
          <p><strong>Contact:</strong> {deal.contact?.name || '—'}</p>
          <p><strong>Amount:</strong> ${Number(deal.amount).toLocaleString()}</p>
          <p><strong>Close Date:</strong> {deal.close_date || '—'}</p>
          <p><strong>Current Stage:</strong> <span className="xyz-badge">{deal.stage}</span></p>

          <label htmlFor="stage">Status</label>
          <select
            id="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            disabled={locked}
          >
            {options.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {locked && (
            <p style={{ color: 'var(--xyz-muted)', fontSize: 14 }}>
              This deal is closed and its status can no longer be changed.
            </p>
          )}

          {error && <p className="xyz-error">{error}</p>}
          {saved && <p style={{ color: 'green' }}>Saved.</p>}

          <button
            className="xyz-btn"
            style={{ marginTop: 24, width: '100%' }}
            onClick={handleSave}
            disabled={saving || locked}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </section>
    </main>
  );
}
