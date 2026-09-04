import type { CapacitorConfig } from "@capacitor/cli";

// TODO: replace with your real deployed URL once FraudGuard is hosted
// (Vercel/Cloudflare/etc). Capacitor needs a live server because TanStack
// Start's detection API runs server-side — it can't be bundled as static files.
const DEPLOYED_URL = "https://REPLACE-WITH-YOUR-DEPLOYED-URL.example.com";

const config: CapacitorConfig = {
  appId: "pk.fraudguard.app",
  appName: "FraudGuard",
  webDir: "dist", // unused while server.url is set, but required by the type
  server: {
    url: DEPLOYED_URL,
    cleartext: false,
  },
  android: {
    // Lets the native SMS/call-screening code (added in a later step) run
    // even if the WebView hasn't loaded yet.
    allowMixedContent: false,
  },
};

export default config;
