let loadPromise: Promise<void> | null = null;

const isRazorpayLoaded = () =>
  Boolean((window as Window & { Razorpay?: unknown }).Razorpay);

export function loadRazorpaySdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout is only available in a browser"));
  }

  if (isRazorpayLoaded()) return Promise.resolve();
  if (loadPromise) return loadPromise;

  let script: HTMLScriptElement | undefined;
  loadPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="checkout.razorpay.com/v1/checkout.js"]',
    );
    const sdkScript = existingScript ?? document.createElement("script");
    script = sdkScript;
    sdkScript.src = "https://checkout.razorpay.com/v1/checkout.js";
    sdkScript.async = true;

    const timeoutId = window.setTimeout(
      () => reject(new Error("Razorpay SDK timed out while loading")),
      20_000,
    );

    sdkScript.addEventListener(
      "load",
      () => {
        window.clearTimeout(timeoutId);
        if (isRazorpayLoaded()) {
          resolve();
        } else {
          reject(new Error("Razorpay SDK loaded but checkout is unavailable"));
        }
      },
      { once: true },
    );
    sdkScript.addEventListener(
      "error",
      () => {
        window.clearTimeout(timeoutId);
        reject(new Error("Razorpay SDK failed to load"));
      },
      { once: true },
    );

    if (!existingScript) document.head.appendChild(sdkScript);
  }).catch((error: unknown) => {
    script?.remove();
    loadPromise = null;
    throw error;
  });

  return loadPromise;
}
