// Define a simple storage for our functions
type ZoomFunction = () => void;

// Storage for our functions
let zoomInFunction: ZoomFunction | null = null;
let zoomOutFunction: ZoomFunction | null = null;

// Function to register the zoom functions from the provider
export function registerZoomFunctions(zoomIn: ZoomFunction, zoomOut: ZoomFunction) {
  zoomInFunction = zoomIn;
  zoomOutFunction = zoomOut;
}

// Functions that can be called from anywhere
export function zoomIn() {
  if (zoomInFunction) {
    zoomInFunction();
  }
}

export function zoomOut() {
  if (zoomOutFunction) {
    zoomOutFunction();
  }
}
