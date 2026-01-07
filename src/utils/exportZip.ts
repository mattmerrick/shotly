import { Stage } from 'konva/lib/Stage';
import { Layer } from 'konva/lib/Layer';
import { CANONICAL_WIDTH, CANONICAL_HEIGHT, IPHONE_MODELS } from '../config/iphoneModels';
import { Screenshot } from '../types/screenshot';

/**
 * Scales a canvas design from canonical size to target size
 * Maintains aspect ratio and centers content
 */
function scaleDesignToSize(
  stage: Stage,
  targetWidth: number,
  targetHeight: number
): string {
  // Calculate scale to fit target dimensions while maintaining aspect ratio
  const scaleX = targetWidth / CANONICAL_WIDTH;
  const scaleY = targetHeight / CANONICAL_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  // Store original stage properties
  const originalScaleX = stage.scaleX();
  const originalScaleY = stage.scaleY();
  const originalX = stage.x();
  const originalY = stage.y();
  const originalWidth = stage.width();
  const originalHeight = stage.height();

  try {
    // Temporarily set stage to target size with scale
    stage.scaleX(scale);
    stage.scaleY(scale);
    stage.width(targetWidth / scale);
    stage.height(targetHeight / scale);
    
    // Center the content if needed
    const scaledWidth = CANONICAL_WIDTH * scale;
    const scaledHeight = CANONICAL_HEIGHT * scale;
    const offsetX = (targetWidth - scaledWidth) / 2;
    const offsetY = (targetHeight - scaledHeight) / 2;
    stage.x(offsetX);
    stage.y(offsetY);
    
    stage.draw();

    const dataURL = stage.toDataURL({
      pixelRatio: 1,
      width: targetWidth,
      height: targetHeight,
    });

    return dataURL;
  } finally {
    // Always restore original stage properties
    stage.scaleX(originalScaleX);
    stage.scaleY(originalScaleY);
    stage.x(originalX);
    stage.y(originalY);
    stage.width(originalWidth);
    stage.height(originalHeight);
    stage.draw();
  }
}

/**
 * Exports all iPhone sizes and locales as a ZIP file
 * @param stage - Konva Stage instance (at canonical size)
 * @param safeZoneLayer - Safe zone layer to hide during export
 * @param screenshot - Screenshot data with localized texts
 * @param selectedLocale - Currently selected locale for rendering
 */
export async function exportZip(
  stage: Stage,
  safeZoneLayer: Layer,
  screenshot: Screenshot,
  selectedLocale: string = 'en'
): Promise<void> {
  // Dynamically import JSZip
  const JSZipModule = await import('jszip');
  const JSZip = JSZipModule.default;

  const zip = new JSZip();
  const wasVisible = safeZoneLayer.visible();
  safeZoneLayer.visible(false);
  stage.draw();

  // Get localized text for current locale
  const localeText = screenshot.localizedTexts.find((lt) => lt.locale === selectedLocale) ||
    screenshot.localizedTexts[0] ||
    { locale: 'en', headline: '', subtext: '' };

  // Export for each iPhone model
  for (const model of IPHONE_MODELS) {
    const dataURL = scaleDesignToSize(stage, model.width, model.height);
    const base64Data = dataURL.split(',')[1];
    const filename = `screenshotpros_${model.id}_${localeText.locale}.png`;
    zip.file(filename, base64Data, { base64: true });
  }

  // Export all locales for canonical size
  for (const localeText of screenshot.localizedTexts) {
    // Note: In a real implementation, you'd re-render with locale-specific text
    // For now, we'll export the canonical size with locale suffix
    const dataURL = scaleDesignToSize(stage, CANONICAL_WIDTH, CANONICAL_HEIGHT);
    const base64Data = dataURL.split(',')[1];
    const filename = `screenshotpros_canonical_${localeText.locale}.png`;
    zip.file(filename, base64Data, { base64: true });
  }

  // Restore safe zone layer
  safeZoneLayer.visible(wasVisible);
  stage.draw();

  // Generate and download ZIP
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `screenshotpros_export_${screenshot.name.replace(' ', '_')}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

