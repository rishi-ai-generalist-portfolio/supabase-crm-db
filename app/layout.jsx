// app/layout.jsx
import './styles/brand.css';

export const metadata = {
  title: 'XYZ Software Solutions Ltd.',
  description: 'AI-powered automation products for growing businesses.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
