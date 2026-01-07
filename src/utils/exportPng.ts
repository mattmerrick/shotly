import { Stage } from 'konva/lib/Stage';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../presets/layoutPresets';

/**
 * Exports the Konva stage as a PNG image
 * @param stage - Konva Stage instance
 * @param safeZoneLayer - The safe zone layer to hide during export
 * @param filename - Output filename (default: screenshotpros_appstore_01.png)
 */
export function exportPng(
  stage: Stage,
  safeZoneLayer: any,
  filename: string = 'screenshotpros_appstore_01.png'
): void {
  // Hide safe zone layer before export
  const wasVisible = safeZoneLayer.visible();
  safeZoneLayer.visible(false);
  
  // Store original scale and size
  const originalScaleX = stage.scaleX();
  const originalScaleY = stage.scaleY();
  const originalWidth = stage.width();
  const originalHeight = stage.height();
  
  // Set stage to full resolution for export
  stage.scaleX(1);
  stage.scaleY(1);
  stage.width(CANVAS_WIDTH);
  stage.height(CANVAS_HEIGHT);
  stage.draw();

  // Export at full resolution (logical size: 1242x2688)
  const dataURL = stage.toDataURL({
    pixelRatio: 1,
  });

  // Restore original stage properties
  stage.scaleX(originalScaleX);
  stage.scaleY(originalScaleY);
  stage.width(originalWidth);
  stage.height(originalHeight);
  safeZoneLayer.visible(wasVisible);
  stage.draw();

  // Trigger download
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

