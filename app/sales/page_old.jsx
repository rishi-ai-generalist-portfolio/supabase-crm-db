// app/sales/page.jsx
// UC-002 Task 1-5: Sales team dashboard. Server component — fetches
// fresh data on every request (no client-side caching of pipeline data).
//
// URL to reach this page: /sales  (e.g. https://your-app.vercel.app/sales)
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

async function getLeads() {
  const { data, error } = await supabase
    .from('lead')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Failed to load leads:', error);
    return [];
  }
  return data;
}

async function getOpenDeals() {
  const { data, error } = await supabase
    .from('deal')
    .select('*, contact:contact_id (name)')
    .not('stage', 'in', '("Closed Won","Closed Lost")')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to load deals:', error);
    return [];
  }
  return data;
}

export default async function SalesDashboard() {
  const [leads, deals] = await Promise.all([getLeads(), getOpenDeals()]);

  return (
    <main>
      <nav className="xyz-navbar">
        <div className="brand">XYZ Software Solutions — Sales</div>
        <a href="/">Main site</a>
      </nav>

      <section className="xyz-section">
        <h1>Leads</h1>
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
            {leads.map((lead) => (
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
            {leads.length === 0 && (
              <tr><td colSpan={5} style={{ color: 'var(--xyz-muted)' }}>No leads yet.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="xyz-section">
        <h1>Open Pipeline Deals</h1>
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
            {deals.map((deal) => (
              <tr key={deal.deal_id}>
                <td>
                  {/* Deal detail page can be added the same way as the
                      Lead detail page below if you want deal-stage editing
                      from this table too. */}
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
            {deals.length === 0 && (
              <tr><td colSpan={5} style={{ color: 'var(--xyz-muted)' }}>No open deals.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
