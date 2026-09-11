// app/api/leads/route.js
// UC-001 Task 6: Inserts a Lead record, then a follow-up Task
// (Title: "Contact the customer", due date = today + 1, Status: "Pending",
// Parent_Type: "Lead", Parent_ID: the new Lead's ID).
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { sendMail } from '../../../lib/mailer';

export async function GET() {
  const { data, error } = await supabase
    .from('lead')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load leads:', error);
    return NextResponse.json({ error: 'Could not load leads.' }, { status: 500 });
  }
  return NextResponse.json({ leads: data });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, company, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    // 1. Insert the Lead
    const { data: lead, error: leadError } = await supabase
      .from('lead')
      .insert([{ name, company: company || null, email, status: 'New' }])
      .select()
      .single();

    if (leadError) {
      console.error('Lead insert failed:', leadError);
      return NextResponse.json({ error: 'Could not save lead.' }, { status: 500 });
    }
    // --- Task 6: notify the Sales Rep of the new Lead. ---
    if (process.env.SalesRepEmail) {
      await sendMail({
        to: process.env.SalesRepEmail,
        subject: `New Lead: ${lead.name}${lead.company ? ` (${lead.company})` : ''}`,
        html: `
          <p>A new Lead was captured from the website contact form.</p>
          <ul>
            <li><strong>Name:</strong> ${lead.name}</li>
            <li><strong>Company:</strong> ${lead.company || '—'}</li>
            <li><strong>Email:</strong> ${lead.email}</li>
            <li><strong>Status:</strong> ${lead.status}</li>
            <li><strong>Lead ID:</strong> ${lead.lead_id}</li>
          </ul>
        `,
      });
    }
    // --- End Task 6 ---

    // 2. Insert the follow-up Task, linked to the new Lead
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);

    const { error: taskError } = await supabase.from('task').insert([
      {
        title: 'Contact the customer',
        due_date: dueDate.toISOString().slice(0, 10),
        status: 'Pending',
        parent_type: 'Lead',
        parent_id: lead.lead_id,
      },
    ]);

    if (taskError) {
      console.error('Task insert failed:', taskError);
      // Lead was created successfully even if the task failed; surface a
      // 207-style partial success rather than losing the lead entirely.
      return NextResponse.json(
        { warning: 'Lead saved, but the follow-up task could not be created.', lead },
        { status: 201 }
      );
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error creating lead:', err);
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
