import React, { useState, useCallback } from 'react';
import { SidebarLeft } from './components/SidebarLeft';
import { CanvasStage } from './components/CanvasStage';
import { SidebarRight } from './components/SidebarRight';
import { ScreenshotGrid } from './components/ScreenshotGrid';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BackgroundType, solidColors, gradientColors } from './types';
import { TextElement, DEFAULT_TEXT_ELEMENT } from './types/textElement';
import { Screenshot, createEmptyScreenshot, ScreenshotImage } from './types/screenshot';
import { exportPng } from './utils/exportPng';
import { exportZip } from './utils/exportZip';
import { DEFAULT_LOCALE } from './config/locales';
import { FileArchive, Loader2 } from 'lucide-react';
import Konva from 'konva';

function App() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [selectedScreenshotId, setSelectedScreenshotId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);
  const [stageRef, setStageRef] = useState<Konva.Stage | null>(null);
  const [safeZoneLayerRef, setSafeZoneLayerRef] = useState<Konva.Layer | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Get current screenshot being edited
  const currentScreenshot = screenshots.find((s) => s.id === selectedScreenshotId);

  const handleScreenshotAdd = useCallback(() => {
    const newScreenshot = createEmptyScreenshot(
      `screenshot-${Date.now()}`,
      `Screenshot ${screenshots.length + 1}`
    );
    setScreenshots([...screenshots, newScreenshot]);
    setSelectedScreenshotId(newScreenshot.id);
    setSelectedTextId(null);
    setSelectedImageId(null);
  }, [screenshots]);

  const handleScreenshotChange = useCallback((screenshot: Screenshot) => {
    setScreenshots(
      screenshots.map((s) => (s.id === screenshot.id ? screenshot : s))
    );
  }, [screenshots]);

  const handleScreenshotDelete = useCallback((id: string) => {
    setScreenshots(screenshots.filter((s) => s.id !== id));
    if (selectedScreenshotId === id) {
      const remaining = screenshots.filter((s) => s.id !== id);
      setSelectedScreenshotId(remaining.length > 0 ? remaining[0].id : null);
    }
  }, [screenshots, selectedScreenshotId]);

  const handleScreenshotSelect = useCallback((id: string) => {
    setSelectedScreenshotId(id);
    setSelectedTextId(null);
    setSelectedImageId(null);
  }, []);

  // Ensure a screenshot exists (auto-create if needed)
  const handleEnsureScreenshotExists = useCallback(() => {
    if (!currentScreenshot) {
      // Auto-create first screenshot if none exists
      const newScreenshot = createEmptyScreenshot(
        `screenshot-${Date.now()}`,
        `Screenshot ${screenshots.length + 1}`
      );
      setScreenshots([...screenshots, newScreenshot]);
      setSelectedScreenshotId(newScreenshot.id);
      setSelectedTextId(null);
      setSelectedImageId(null);
    }
  }, [currentScreenshot, screenshots]);

  // Update screenshot images
  const handleScreenshotImagesChange = useCallback((images: ScreenshotImage[]) => {
    const screenshotId = currentScreenshot?.id || handleEnsureScreenshotExists();
    const targetScreenshot = screenshots.find(s => s.id === screenshotId) || currentScreenshot;
    
    if (targetScreenshot) {
      handleScreenshotChange({
        ...targetScreenshot,
        screenshotImages: images,
      });
    }
  }, [currentScreenshot, handleScreenshotChange, screenshots, handleEnsureScreenshotExists]);

  const handleStageReady = useCallback((stage: Konva.Stage, safeZoneLayer: Konva.Layer) => {
    setStageRef(stage);
    setSafeZoneLayerRef(safeZoneLayer);
  }, []);

  const handleExportPng = useCallback(() => {
    if (stageRef && safeZoneLayerRef && currentScreenshot) {
      exportPng(stageRef, safeZoneLayerRef, `shotly_appstore_${currentScreenshot.name.replace(' ', '_')}.png`);
    }
  }, [stageRef, safeZoneLayerRef, currentScreenshot]);

  const handleExportZip = useCallback(async () => {
    if (!stageRef || !safeZoneLayerRef || !currentScreenshot) {
      alert('Canvas not ready. Please wait a moment and try again.');
      return;
    }

    setIsExportingZip(true);
    try {
      await exportZip(stageRef, safeZoneLayerRef, currentScreenshot, locale);
    } catch (error) {
      console.error('Error exporting ZIP:', error);
      alert('Error exporting ZIP file. Please try again.');
    } finally {
      setIsExportingZip(false);
    }
  }, [stageRef, safeZoneLayerRef, currentScreenshot, locale]);

  const handleReset = useCallback(() => {
    if (currentScreenshot) {
      const resetScreenshot = createEmptyScreenshot(
        currentScreenshot.id,
        currentScreenshot.name
      );
      handleScreenshotChange(resetScreenshot);
      setSelectedTextId(null);
      setSelectedImageId(null);
    }
  }, [currentScreenshot, handleScreenshotChange]);

  // Update text elements
  const handleTextElementsChange = useCallback((elements: TextElement[]) => {
    if (currentScreenshot) {
      handleScreenshotChange({
        ...currentScreenshot,
        textElements: elements,
      });
    }
  }, [currentScreenshot, handleScreenshotChange]);


  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
        {/* Top Header with Export Button */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Shotly</h1>
          <button
            onClick={handleExportZip}
            disabled={isExportingZip || !currentScreenshot}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            {isExportingZip ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileArchive size={18} />
                Export All Sizes (ZIP)
              </>
            )}
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Always visible */}
            <SidebarLeft
              screenshotImages={currentScreenshot?.screenshotImages || []}
              onScreenshotImagesChange={handleScreenshotImagesChange}
              selectedImageId={selectedImageId}
              onSelectedImageChange={setSelectedImageId}
              textElements={currentScreenshot?.textElements || []}
              selectedTextId={selectedTextId}
              onTextElementsChange={handleTextElementsChange}
              onSelectedTextChange={setSelectedTextId}
              backgroundType={currentScreenshot?.backgroundType || 'solid'}
              onBackgroundTypeChange={(type) => {
                if (currentScreenshot) {
                  handleScreenshotChange({
                    ...currentScreenshot,
                    backgroundType: type,
                  });
                }
              }}
              selectedSolidColor={currentScreenshot?.solidColor || solidColors[0].color}
              onSolidColorChange={(color) => {
                if (currentScreenshot) {
                  handleScreenshotChange({
                    ...currentScreenshot,
                    solidColor: color,
                  });
                }
              }}
              selectedGradient={currentScreenshot?.gradientId || gradientColors[0].id}
              onGradientChange={(gradientId) => {
                if (currentScreenshot) {
                  handleScreenshotChange({
                    ...currentScreenshot,
                    gradientId,
                  });
                }
              }}
              showSafeZones={showSafeZones}
              onShowSafeZonesChange={setShowSafeZones}
              roundedCorners={currentScreenshot?.roundedCorners ?? true}
              onRoundedCornersChange={(rounded) => {
                if (currentScreenshot) {
                  handleScreenshotChange({
                    ...currentScreenshot,
                    roundedCorners: rounded,
                  });
                }
              }}
              dropShadow={currentScreenshot?.dropShadow ?? true}
              onDropShadowChange={(shadow) => {
                if (currentScreenshot) {
                  handleScreenshotChange({
                    ...currentScreenshot,
                    dropShadow: shadow,
                  });
                }
              }}
              locale={locale}
              onLocaleChange={setLocale}
              onReset={handleReset}
              onEnsureScreenshotExists={handleEnsureScreenshotExists}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Screenshot Grid View */}
              <div className="bg-white border-b border-gray-200">
                <ScreenshotGrid
                  screenshots={screenshots}
                  onScreenshotChange={handleScreenshotChange}
                  onScreenshotAdd={handleScreenshotAdd}
                  onScreenshotDelete={handleScreenshotDelete}
                  onScreenshotSelect={handleScreenshotSelect}
                  selectedScreenshotId={selectedScreenshotId}
                />
              </div>

              {/* Editor View - Canvas and Right Sidebar */}
              {currentScreenshot ? (
                <div className="flex-1 flex overflow-hidden">
                  <CanvasStage
                    screenshotImages={currentScreenshot.screenshotImages}
                    onScreenshotImagesChange={handleScreenshotImagesChange}
                    selectedImageId={selectedImageId}
                    onSelectedImageChange={setSelectedImageId}
                    textElements={currentScreenshot.textElements}
                    selectedTextId={selectedTextId}
                    onTextElementsChange={handleTextElementsChange}
                    onSelectedTextChange={setSelectedTextId}
                    backgroundType={currentScreenshot.backgroundType}
                    solidColor={currentScreenshot.solidColor}
                    gradientId={currentScreenshot.gradientId}
                    showSafeZones={showSafeZones}
                    roundedCorners={currentScreenshot.roundedCorners}
                    dropShadow={currentScreenshot.dropShadow}
                    locale={locale}
                    onStageReady={handleStageReady}
                  />
                  <SidebarRight />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center max-w-md">
                    <p className="text-gray-500 text-lg mb-2 font-semibold">No slide selected</p>
                    <p className="text-gray-400 text-sm mb-4">
                      Click on a slide slot in the grid above to start editing
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                      <p className="text-sm font-semibold text-gray-900 mb-2">How to use:</p>
                      <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                        <li>Click a slide slot in the grid above</li>
                        <li>Upload an image or add text</li>
                        <li>Edit it directly on the canvas</li>
                        <li>Drag to move, resize handles to zoom</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </ErrorBoundary>
  );
}

export default App;
