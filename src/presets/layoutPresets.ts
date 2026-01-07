// iOS App Store Screenshot Specifications
// iPhone 14 Pro Max: 1290 x 2796 points (physical)
// For App Store: 1242 x 2688 pixels (logical)
// Safe area: 80px margins, 140px top status bar exclusion

export const CANVAS_WIDTH = 1242;
export const CANVAS_HEIGHT = 2688;

// Safe zone boundaries for iOS
export const SAFE_ZONE_MARGIN = 80;
export const SAFE_ZONE_TOP = 140;

// Default image frame positions (iOS-friendly)
export const DEFAULT_IMAGE_FRAME = {
  x: 121, // Within safe zone
  y: 300,
  width: 1000,
  height: 1400,
  borderRadius: 40,
};
