// app/sales/page.jsx
import { supabase } from '../../lib/supabaseClient';
import LeadsTable from './LeadsTable';
import DealsTable from './DealsTable';

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
        <LeadsTable leads={leads} />
      </section>

      <section className="xyz-section">
        <h1>Open Pipeline Deals</h1>
        <DealsTable deals={deals} />
      </section>
    </main>
  );
}