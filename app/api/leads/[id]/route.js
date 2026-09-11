// app/api/leads/[id]/route.js
// UC-002 Task 8: GET a single Lead; PATCH updates its status.
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function GET(request, { params }) {
  const { id } = params;
  const { data, error } = await supabase
    .from('lead')
    .select('*')
    .eq('lead_id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
  }
  return NextResponse.json({ lead: data });
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { status } = body;

  const allowed = ['New', 'In-progress', 'Qualified', 'Disqualified'];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('lead')
    .update({ status })
    .eq('lead_id', id)
    .select()
    .single();

  if (error) {
    console.error('Lead update failed:', error);
    return NextResponse.json({ error: 'Could not update lead.' }, { status: 500 });
  }

  return NextResponse.json({ lead: data });
}
