import './globals.css';

export const metadata = {
  title: 'Controle de Estoque Front',
  description: 'Front-end em Next.js para consumir a API de controle de estoque.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
