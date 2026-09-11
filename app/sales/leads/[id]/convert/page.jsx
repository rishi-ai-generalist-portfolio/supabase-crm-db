'use client';
// app/sales/leads/[id]/convert/page.jsx
// UC-002 Task 9-10: Captures Contact + Deal details for a Qualified lead.
// On submit, POSTs to /api/convert which creates the Contact and Deal.
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ConvertLeadPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    amount: '',
    closeDate: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill Contact name/email from the Lead so the rep isn't retyping.
  useEffect(() => {
    async function prefill() {
      const res = await fetch(`/api/leads/${id}`);
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({ ...f, name: data.lead.name, email: data.lead.email }));
      }
    }
    prefill();
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id, ...form }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not convert this lead.');
      }
      const { deal } = await res.json();
      router.push(`/sales`); // could route to a dedicated deal page instead
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <nav className="xyz-navbar">
        <div className="brand">XYZ Software Solutions — Sales</div>
        <a href="/sales">Back to dashboard</a>
      </nav>

      <section className="xyz-section">
        <h1>Convert Lead</h1>
        <p style={{ color: 'var(--xyz-muted)' }}>
          This lead is Qualified. Confirm the Contact details and set up the new Deal.
        </p>

        <form className="xyz-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Contact Name</label>
          <input id="name" name="name" required value={form.name} onChange={handleChange} />

          <label htmlFor="email">Contact Email</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />

          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" value={form.phone} onChange={handleChange} />

          <label htmlFor="amount">Deal Amount</label>
          <input id="amount" name="amount" type="number" min="0" step="0.01" required value={form.amount} onChange={handleChange} />

          <label htmlFor="closeDate">Expected Close Date</label>
          <input id="closeDate" name="closeDate" type="date" value={form.closeDate} onChange={handleChange} />

          {error && <p className="xyz-error">{error}</p>}

          <button className="xyz-btn" style={{ marginTop: 24, width: '100%' }} disabled={submitting}>
            {submitting ? 'Creating…' : 'Submit'}
          </button>
        </form>
      </section>
    </main>
  );
}
