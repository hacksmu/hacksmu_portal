import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        {/* MUST be present */}
        <Main />
        {/* MUST be present */}
        <NextScript />
      </body>
    </Html>
  );
}
