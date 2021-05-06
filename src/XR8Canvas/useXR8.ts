import { loadXR8 } from "./getXR8";
import { useAsset } from "use-asset";

/**
 * load XR8 sdk
 */
export const useXR8 = (xr8ApiKey: string) => useAsset(loadXR8, xr8ApiKey);
