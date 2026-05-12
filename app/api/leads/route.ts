import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  const { email, company, role, audit_slug } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Save to Supabase
  const { error } = await supabase
    .from("leads")
    .insert([{ email, company, role, audit_slug }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send confirmation email via Resend
  await resend.emails.send({
    from: "Credex Audit <onboarding@resend.dev>",
    to: email,
    subject: "Your AI Spend Audit is ready",
    html: `<p>Hi there,</p>
           <p>Your audit report is ready. Share it with your team:</p>
           <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/audit/${audit_slug}">View Audit</a></p>
           <p>— Credex Team</p>`,
  });

  return NextResponse.json({ success: true });
}