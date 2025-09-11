// pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        {/* MUST be present so your pages render */}
        <Main />
        {/* MUST be present so Next loads its runtime */}
        <NextScript />
      </body>
    </Html>
  );
}
