// app/api/convert/route.js
// UC-002 Task 10: Inserts a Contact, then a Deal (Stage: "Discovery")
// whose contact_id matches the newly created Contact.
//
// Note: the agreed Lead.status values are New / In-progress / Qualified /
// Disqualified (no "Converted" state exists in the schema). The lead is
// left as "Qualified" — its presence on a Deal is what identifies it as
// converted. If you want an explicit terminal state, add "Converted" to
// the check constraint in the migration file and set it here.
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request) {
  try {
    const body = await request.json();
    const { leadId, name, email, phone, amount, closeDate } = body;

    if (!leadId || !name || !email || !amount) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // 1. Create the Contact
    const { data: contact, error: contactError } = await supabase
      .from('contact')
      .insert([{ name, email, phone: phone || null }])
      .select()
      .single();

    if (contactError) {
      console.error('Contact insert failed:', contactError);
      return NextResponse.json({ error: 'Could not create contact.' }, { status: 500 });
    }

    // 2. Create the Deal in the Discovery stage, linked to the new Contact
    const { data: deal, error: dealError } = await supabase
      .from('deal')
      .insert([
        {
          contact_id: contact.contact_id,
          amount,
          stage: 'Discovery',
          close_date: closeDate || null,
        },
      ])
      .select()
      .single();

    if (dealError) {
      console.error('Deal insert failed:', dealError);
      return NextResponse.json({ error: 'Could not create deal.' }, { status: 500 });
    }

    // 3. Confirm the Lead is Qualified (idempotent — it should already be,
    // since this page is only reachable after the rep saved that status).
    await supabase.from('lead').update({ status: 'Qualified' }).eq('lead_id', leadId);

    return NextResponse.json({ contact, deal }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error converting lead:', err);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
