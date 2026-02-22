import type { XR8 } from "./XR8";

/**
 *
 * load 8th wall sdk once
 * resolve with XR8 when it's ready
 */
export const getXR8 = (): XR8 | null => (window as any).XR8 || null;

export const xr8Hosted =
  typeof window !== "undefined" && window.location.host.endsWith("8thwall.app");

/**
 *
 * load 8th wall sdk once
 * resolve with XR8 when it's ready
 */
export const loadXR8 = async () => {
  // in 8thwall demo page, the script is loaded automatically
  if (!xr8Hosted) {
    const xrUrl = "./8thwall-sdk/xr.js";
    await loadScript(xrUrl);
  }

  let xr8 = getXR8();
  if (!xr8) {
    await new Promise((resolve: any) =>
      window.addEventListener("xrloaded", resolve)
    );
    xr8 = getXR8()!;
  }
  await xr8.loadChunk("slam");

  return xr8;
};

export const loadScript = (src: string) =>
  new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.addEventListener("load", resolve);
    script.addEventListener("error", reject);
    script.src = src;
    document.body.appendChild(script);
  });
