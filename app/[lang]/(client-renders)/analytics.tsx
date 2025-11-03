"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { useEffect, useState } from "react";

export default function ClientAnalytics() {
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean>(false);

  useEffect(() => {
    const accepted = localStorage.getItem("zesty-cookie-consent");
    if (accepted === "true") {
      setCookiesAccepted(true);
    }
  }, []);

  useEffect(() => {
    const handleCookieConsentChange = (event: Event) => {
      const accepted = localStorage.getItem("zesty-cookie-consent");
      setCookiesAccepted(accepted === "true");
    }

    window.addEventListener("zesty-cookie-consent-changed", handleCookieConsentChange);

    return () => window.removeEventListener("zesty-cookie-consent-changed", handleCookieConsentChange);
  }, []);

  if (!cookiesAccepted) {
    return (
      <div className="hidden" id="cookies-rejected">Cookies rejected.</div>
    );
  }

  return (
    <section>
      <Analytics />
      <SpeedInsights />
    </section>
  );
}