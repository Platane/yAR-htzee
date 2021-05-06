import type { XR8 } from "./XR8";

/**
 *
 * load 8th wall sdk once
 * resolve with XR8 when it's ready
 */
export const getXR8 = (): XR8 | null => (window as any).XR8 || null;

export const xr8Hosted = window.location.host.endsWith("8thwall.app");

/**
 *
 * load 8th wall sdk once
 * resolve with XR8 when it's ready
 */
export const loadXR8 = async (apiKey: string) => {
  // in 8thwall demo page, the script is loaded automatically
  if (!xr8Hosted) {
    const src = `//apps.8thwall.com/xrweb?appKey=${apiKey}`;
    await loadScript(src);
  }

  const xr8 = getXR8();
  if (xr8) return xr8;
  else {
    await new Promise((resolve: any) =>
      window.addEventListener("xrloaded", resolve)
    );
    return getXR8()!;
  }
};

export const loadScript = (src: string) =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.addEventListener("load", resolve);
    script.addEventListener("error", reject);
    script.src = src;
    document.body.appendChild(script);
  });
