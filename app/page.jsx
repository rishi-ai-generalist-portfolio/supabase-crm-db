// app/page.jsx
// UC-001 Task 1-3: Landing page showcasing products, linking to Contact form.
import Link from 'next/link';

const PRODUCTS = [
  {
    title: 'SMB Workflow Automation',
    description:
      'AI-driven automation that handles repetitive back-office work for small and mid-sized businesses — invoicing, scheduling, follow-ups, and more.',
  },
  {
    title: 'WhatsApp Marketing & Automation',
    description:
      'Reach customers where they already are. Automated WhatsApp campaigns, order updates, and AI-assisted customer replies at scale.',
  },
  {
    title: 'AI Customer Support Assistant',
    description:
      'A trained AI assistant that answers customer questions instantly, escalating to a human only when it truly needs to.',
  },
  {
    title: 'Sales Pipeline Intelligence',
    description:
      'Automatically score and route leads, so your sales team spends time on the opportunities most likely to close.',
  },
];

export default function LandingPage() {
  return (
    <main>
      <nav className="xyz-navbar">
        <div className="brand">XYZ Software Solutions</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="#products">Products</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>

      <section className="xyz-hero">
        <h1>AI automation that runs your business, not the other way around</h1>
        <p>
          We build practical AI-powered tools for small and mid-sized businesses —
          from workflow automation to WhatsApp marketing — so your team can focus
          on growth, not busywork.
        </p>
        <Link href="/contact" className="xyz-btn">
          Talk to Our Team
        </Link>
      </section>

      <section id="products" className="xyz-section">
        <h2>Our Products</h2>
        <div className="xyz-grid">
          {PRODUCTS.map((p) => (
            <div className="xyz-card" key={p.title}>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="xyz-section" style={{ textAlign: 'center' }}>
        <h2>Ready to see it in action?</h2>
        <p style={{ color: 'var(--xyz-muted)', marginBottom: 24 }}>
          Tell us a bit about your business and we'll follow up within one business day.
        </p>
        <Link href="/contact" className="xyz-btn" style={{ background: 'var(--xyz-indigo)', color: 'white' }}>
          Get in Touch
        </Link>
      </section>
    </main>
  );
}
