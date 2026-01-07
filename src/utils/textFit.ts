import { Text } from 'konva/lib/shapes/Text';

/**
 * Measures text width using a temporary canvas context
 */
function measureTextWidth(
  textString: string,
  fontSize: number,
  fontWeight: number | string = 'normal',
  fontFamily: string = 'system-ui, -apple-system, sans-serif'
): number {
  try {
    // Create a temporary canvas for measurement
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      // Fallback: estimate based on character count
      return textString.length * fontSize * 0.6;
    }

    const fontStyle = 'normal';
    const fontVariant = 'normal';
    
    // Convert fontWeight to string if it's a number
    const fontWeightStr = typeof fontWeight === 'number' ? String(fontWeight) : fontWeight;
    
    // Build font string - canvas API expects string format
    const fontString = `${fontStyle} ${fontVariant} ${fontWeightStr} ${fontSize}px ${fontFamily}`;
    context.font = fontString;
    const metrics = context.measureText(textString);

    return metrics.width;
  } catch (error) {
    // Fallback: estimate based on character count
    console.warn('Error measuring text width, using estimate:', error);
    return textString.length * fontSize * 0.6;
  }
}

/**
 * Fits text to a maximum width by reducing font size
 * @param text - Konva Text instance (optional, used to set fontSize if provided)
 * @param textString - The text content
 * @param maxWidth - Maximum allowed width
 * @param maxFontSize - Starting font size
 * @param minFontSize - Minimum font size to allow
 * @param fontWeight - Font weight (number or string)
 * @returns The font size that fits within maxWidth
 */
export function fitTextToWidth(
  text: Text | null,
  textString: string,
  maxWidth: number,
  maxFontSize: number,
  minFontSize: number,
  fontWeight: number | string = 'normal',
  fontFamily: string = 'system-ui, -apple-system, sans-serif'
): number {
  try {
    if (!textString.trim()) {
      return maxFontSize;
    }

    // Measure actual text width (don't rely on text node being ready)
    let textWidth = measureTextWidth(textString, maxFontSize, fontWeight, fontFamily);

    // If text fits, return max font size
    if (textWidth <= maxWidth) {
      // Optionally update text node if provided
      if (text) {
        try {
          text.fontSize(maxFontSize);
        } catch (e) {
          // Ignore if text node isn't ready
        }
      }
      return maxFontSize;
    }

    // Binary search for optimal font size
    let low = minFontSize;
    let high = maxFontSize;
    let bestSize = minFontSize;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      textWidth = measureTextWidth(textString, mid, fontWeight, fontFamily);

      if (textWidth <= maxWidth) {
        bestSize = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // Update text node if provided
    if (text) {
      try {
        text.fontSize(bestSize);
      } catch (e) {
        // Ignore if text node isn't ready
      }
    }

    return bestSize;
  } catch (error) {
    console.error('Error in fitTextToWidth:', error);
    // Return max font size as safe fallback
    return maxFontSize;
  }
}

