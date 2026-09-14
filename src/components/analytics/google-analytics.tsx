import Script from "next/script";

// Renders nothing until NEXT_PUBLIC_GA_MEASUREMENT_ID is set — get this
// from Google Analytics (Admin → Data Streams → your web stream →
// Measurement ID, looks like "G-XXXXXXXXXX") and add it as an env var.
// No code change needed once that's set; this reads it at request time.
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
