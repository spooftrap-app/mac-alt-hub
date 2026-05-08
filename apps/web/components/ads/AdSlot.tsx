import Script from "next/script";

export function AdSlot() {
  const publisher = process.env.NEXT_PUBLIC_ETHICALADS_PUBLISHER;

  if (!publisher) {
    return (
      <aside className="ad-slot sponsor-slot" aria-label="Sponsor-ready placement">
        <span>Sponsored</span>
        <div>
          <strong>Quiet sponsor slot available</strong>
          <p>One tasteful catalog placement. No tracking wall, no download confusion.</p>
        </div>
        <a href="mailto:sponsor@macalthub.local">Sponsor</a>
      </aside>
    );
  }

  return (
    <>
      <aside
        className="ad-slot"
        data-ea-publisher={publisher}
        data-ea-type="image"
        data-ea-keywords="macos,developer-tools,productivity,privacy"
        aria-label="Sponsored"
      >
        <span>Sponsored</span>
        <div>
          <strong>Relevant Mac developer tools</strong>
          <p>Privacy-friendly sponsorship powered by EthicalAds.</p>
        </div>
      </aside>
      <Script src="https://media.ethicalads.io/media/client/ethicalads.min.js" strategy="lazyOnload" />
    </>
  );
}
