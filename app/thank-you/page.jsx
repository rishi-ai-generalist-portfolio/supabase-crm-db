// app/thank-you/page.jsx
// UC-001 Task 5: Landing point after a successful Contact form submission.
import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <main>
      <nav className="xyz-navbar">
        <div className="brand">XYZ Software Solutions</div>
        <Link href="/">Back to home</Link>
      </nav>

      <section className="xyz-section" style={{ textAlign: 'center' }}>
        <h1>Thanks for reaching out!</h1>
        <p style={{ color: 'var(--xyz-muted)', maxWidth: 480, margin: '0 auto' }}>
          A member of our team will follow up with you within one business day.
        </p>
        <Link href="/" className="xyz-btn" style={{ marginTop: 32, display: 'inline-block' }}>
          Return to Homepage
        </Link>
      </section>
    </main>
  );
}
