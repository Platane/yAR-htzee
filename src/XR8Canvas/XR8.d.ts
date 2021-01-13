export type XR8 = {
  run: (o: any) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  clearCameraPipelineModules: () => void;
  addCameraPipelineModule: (p: XR8Pipeline) => void;
  addCameraPipelineModules: (ps: XR8Pipeline[]) => void;

  XrDevice: XrDevice;
  XrConfig: XrConfig;

  GlTextureRenderer: {
    pipelineModule: () => XR8Pipeline;
  };
  XrController: {
    pipelineModule: () => XR8Pipeline;
    configure: (o: any) => void;
    /**
     * Sync the xr controller's 6DoF position and camera parameters with our scene.
     */
    updateCameraProjectionMatrix: (camera: {
      origin: { x: number; y: number; z: number };
      facing: { x: number; y: number; z: number; w: number };
    }) => void;
  };
  MediaRecorder: {
    pipelineModule: () => XR8Pipeline;
    configure: (o: any) => void;
    recordVideo: (
      o: RecordOptions & {
        onError: (event: any) => void;
        onVideoReady: (res: { videoBlob: Blob }) => void;
        onStart: () => void;
        onStop: () => void;
      }
    ) => any;
    stopRecording: () => void;
  };
  CanvasScreenshot: {
    pipelineModule: () => XR8Pipeline;
    configure: (o: any) => void;
    takeScreenshot: (o: RecordOptions) => Promise<any>;
  };
};

type RecordOptions = {
  onProcessFrame: (o: {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
  }) => void;
};

type XrConfig = {
  device: () => {
    MOBILE: "mobile" & { _opaque: true };
    ANY: "any" & { _opaque: true };
  };
  camera: () => {
    FRONT: "front" & { _opaque: true };
    BACK: "back" & { _opaque: true };
  };
};

type XrDevice = {
  IncompatibilityReasons: {
    UNSPECIFIED: 0 & { _opaque: true };
    UNSUPPORTED_OS: 1 & { _opaque: true };
    UNSUPPORTED_BROWSER: 2 & { _opaque: true };
    MISSING_DEVICE_ORIENTATION: 3 & { _opaque: true };
    MISSING_USER_MEDIA: 4 & { _opaque: true };
    MISSING_WEB_ASSEMBLY: 5 & { _opaque: true };
  };
  deviceEstimate: () => {
    locale: string;
    os: string;
    osVersion: string;
    manufacturer: string;
    model: string;
  };

  incompatibleReasons: (options?: {
    allowedDevices?: ReturnType<XrConfig["device"]>[];
  }) => XrDevice["IncompatibilityReasons"][keyof XrDevice["IncompatibilityReasons"]][];

  incompatibleReasonDetails: (options?: {
    allowedDevices?: ReturnType<XrConfig["device"]>[];
  }) => { inAppBrowser: string; inAppBrowserType: string };

  isDeviceBrowserCompatible: (options?: {
    allowedDevices?: ReturnType<XrConfig["device"]>[];
  }) => boolean;
};

export type XR8Pipeline = {
  name: string;

  onException?: (error: Error) => void;

  onStart?: (o: {
    canvas: HTMLCanvasElement;
    GLctx: WebGLRenderingContext | WebGL2RenderingContext;
    isWebgl2: boolean;
    videoWidth: number;
    videoHeight: number;
    canvasWidth: number;
    canvasHeight: number;
  }) => void;

  onCameraStatusChange?: (o: {
    status: "requesting" | "hasStream" | "hasVideo" | "failed";
    video?: HTMLVideoElement;
    stream?: MediaStream;
  }) => void;

  onDetach?: (o: { framework: any }) => void;

  onUpdate?: (o: {
    fps: number;
    framework: any;
    frameStartResult: any;
    processGpuResult: any;
    processCpuResult?: {
      reality?: {
        rotation?: { x: number; y: number; z: number; w: number };
        position?: { x: number; y: number; z: number };
        intrinsics: number[];
        trackingStatus: "NORMAL" | "UNSPECIFIED" | "NOT_AVAILABLE" | "LIMITED";
      };
    };
  }) => void;

  onRender?: () => void;

  onCanvasSizeChange?: (o: {
    videoWidth: number;
    videoHeight: number;
    canvasWidth: number;
    canvasHeight: number;
    GLctx: WebGLRenderingContext | WebGL2RenderingContext;
  }) => void;

  onVideoSizeChange?: (o: {
    videoWidth: number;
    videoHeight: number;
    canvasWidth: number;
    canvasHeight: number;
    GLctx: WebGLRenderingContext | WebGL2RenderingContext;
  }) => void;
};
