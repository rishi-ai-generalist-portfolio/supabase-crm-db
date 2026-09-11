// app/api/deals/[id]/route.js
// UC-002 Task 11-13: GET a single Deal (with Contact); PATCH updates its
// stage, enforcing one-way progression, and emails SalesMgrEmail +
// CEOEmail when the deal closes (Won or Lost). This file is new — it
// follows the same GET/PATCH pattern as app/api/leads/[id]/route.js.
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { sendMail } from '../../../../lib/mailer';

const SELECTABLE_STAGES = ['Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];
const TERMINAL_STAGES = ['Closed Won', 'Closed Lost'];

function getSelectableStages(currentStage) {
  if (TERMINAL_STAGES.includes(currentStage)) return [currentStage];
  if (currentStage === 'Discovery') return SELECTABLE_STAGES;
  const idx = SELECTABLE_STAGES.indexOf(currentStage);
  return SELECTABLE_STAGES.slice(idx === -1 ? 0 : idx);
}

export async function GET(request, { params }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('deal')
    .select('*, contact:contact_id (name, email)')
    .eq('deal_id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Deal not found.' }, { status: 404 });
  }
  return NextResponse.json({ deal: data });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { stage } = body;

  const { data: existing, error: fetchError } = await supabase
    .from('deal')
    .select('*, contact:contact_id (name, email)')
    .eq('deal_id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Deal not found.' }, { status: 404 });
  }

  // Task 11: once Closed Won/Closed Lost, the status can never change again.
  if (TERMINAL_STAGES.includes(existing.stage)) {
    return NextResponse.json(
      { error: 'This deal is closed and its status cannot be changed.' },
      { status: 400 }
    );
  }

  // Task 11: no reverting to Discovery, and no skipping backward once past it.
  const allowed = getSelectableStages(existing.stage);
  if (!allowed.includes(stage)) {
    return NextResponse.json({ error: 'Invalid status transition.' }, { status: 400 });
  }

  const { data: deal, error } = await supabase
    .from('deal')
    .update({ stage })
    .eq('deal_id', id)
    .select('*, contact:contact_id (name, email)')
    .single();

  if (error) {
    console.error('Deal update failed:', error);
    return NextResponse.json({ error: 'Could not update deal.' }, { status: 500 });
  }

  // Task 13: notify Sales Manager + CEO when the deal closes.
  if (TERMINAL_STAGES.includes(stage)) {
    const recipients = [process.env.SalesMgrEmail, process.env.CEOEmail].filter(Boolean);
    if (recipients.length) {
      await sendMail({
        to: recipients.join(','),
        subject: `Deal ${stage}: ${deal.contact?.name || 'Unknown contact'} — $${Number(deal.amount).toLocaleString()}`,
        html: `
          <p>A deal has moved to <strong>${stage}</strong>.</p>
          <ul>
            <li><strong>Deal ID:</strong> ${deal.deal_id}</li>
            <li><strong>Contact:</strong> ${deal.contact?.name || '—'} (${deal.contact?.email || '—'})</li>
            <li><strong>Amount:</strong> $${Number(deal.amount).toLocaleString()}</li>
            <li><strong>Close Date:</strong> ${deal.close_date || '—'}</li>
            <li><strong>Final Status:</strong> ${stage}</li>
          </ul>
        `,
      });
    }
  }

  return NextResponse.json({ deal });
}