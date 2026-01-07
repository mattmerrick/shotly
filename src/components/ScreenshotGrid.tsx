import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../presets/layoutPresets';
import { Screenshot } from '../types/screenshot';
import { BackgroundType, gradientColors } from '../types';
import { Plus, X } from 'lucide-react';

interface ScreenshotGridProps {
  screenshots: Screenshot[];
  onScreenshotChange: (screenshot: Screenshot) => void;
  onScreenshotAdd: () => void;
  onScreenshotDelete: (id: string) => void;
  onScreenshotSelect: (id: string) => void;
  selectedScreenshotId: string | null;
}

const GRID_COLS = 5;
const PREVIEW_SCALE = 0.15; // Larger scale for easier editing

export const ScreenshotGrid: React.FC<ScreenshotGridProps> = ({
  screenshots,
  onScreenshotChange,
  onScreenshotAdd,
  onScreenshotDelete,
  onScreenshotSelect,
  selectedScreenshotId,
}) => {
  const imageGroupRefs = useRef<Map<string, Konva.Group>>(new Map());
  const imageTransformerRefs = useRef<Map<string, Konva.Transformer>>(new Map());
  const textRefs = useRef<Map<string, Konva.Text>>(new Map());
  const textTransformerRefs = useRef<Map<string, Konva.Transformer>>(new Map());
  const [selectedImageIds, setSelectedImageIds] = useState<Map<string, string | null>>(new Map());
  const [selectedTextIds, setSelectedTextIds] = useState<Map<string, string | null>>(new Map());

  // Ensure we always have 5 slots
  const displayScreenshots = [...screenshots];
  while (displayScreenshots.length < GRID_COLS) {
    displayScreenshots.push(null as any);
  }

  const handleScreenshotClick = (screenshot: Screenshot | null, index: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (screenshot) {
      onScreenshotSelect(screenshot.id);
    } else {
      // Add new screenshot
      onScreenshotAdd();
    }
  };

  // Handle image drag end in grid
  const handleImageDragEnd = (screenshotId: string, imageId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const screenshot = screenshots.find(s => s.id === screenshotId);
    if (!screenshot) return;

    const node = e.target;
    const newX = Math.max(0, Math.min(node.x(), CANVAS_WIDTH - node.width()));
    const newY = Math.max(0, Math.min(node.y(), CANVAS_HEIGHT - node.height()));

    const updatedImages = screenshot.screenshotImages.map(img =>
      img.id === imageId
        ? {
            ...img,
            element: {
              ...img.element,
              x: newX,
              y: newY,
            },
          }
        : img
    );
    onScreenshotChange({ ...screenshot, screenshotImages: updatedImages });
  };

  // Handle image transform end in grid
  const handleImageTransformEnd = (screenshotId: string, imageId: string) => {
    const screenshot = screenshots.find(s => s.id === screenshotId);
    if (!screenshot) return;

    const selectedGroup = imageGroupRefs.current.get(`${screenshotId}-${imageId}`);
    if (!selectedGroup) return;

    const screenshotImg = screenshot.screenshotImages.find((img) => img.id === imageId);
    if (!screenshotImg) return;

    const node = selectedGroup;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(50, Math.min(node.width() * scaleX, CANVAS_WIDTH));
    const newHeight = Math.max(50, Math.min(node.height() * scaleY, CANVAS_HEIGHT));

    const aspectRatio = screenshotImg.element.width / screenshotImg.element.height;
    let finalWidth = newWidth;
    let finalHeight = newHeight;

    if (Math.abs(scaleX - scaleY) < 0.1) {
      finalHeight = finalWidth / aspectRatio;
    }

    const newX = Math.max(0, Math.min(node.x(), CANVAS_WIDTH - finalWidth));
    const newY = Math.max(0, Math.min(node.y(), CANVAS_HEIGHT - finalHeight));

    node.x(newX);
    node.y(newY);
    node.width(finalWidth);
    node.height(finalHeight);

    const updatedImages = screenshot.screenshotImages.map((img) =>
      img.id === imageId
        ? {
            ...img,
            element: {
              ...img.element,
              x: newX,
              y: newY,
              width: finalWidth,
              height: finalHeight,
            },
          }
        : img
    );
    onScreenshotChange({ ...screenshot, screenshotImages: updatedImages });
  };

  // Handle text drag end in grid
  const handleTextDragEnd = (screenshotId: string, textId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const screenshot = screenshots.find(s => s.id === screenshotId);
    if (!screenshot) return;

    const node = e.target;
    const newX = Math.max(0, Math.min(node.x(), CANVAS_WIDTH - node.width()));
    const newY = Math.max(0, Math.min(node.y(), CANVAS_HEIGHT - node.height()));

    const updatedTexts = screenshot.textElements.map(el =>
      el.id === textId
        ? { ...el, x: newX, y: newY }
        : el
    );
    onScreenshotChange({ ...screenshot, textElements: updatedTexts });
  };

  // Handle text transform end in grid
  const handleTextTransformEnd = (screenshotId: string, textId: string) => {
    const screenshot = screenshots.find(s => s.id === screenshotId);
    if (!screenshot) return;

    const selectedText = textRefs.current.get(`${screenshotId}-${textId}`);
    if (!selectedText) return;

    const node = selectedText;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    const currentElement = screenshot.textElements.find(el => el.id === textId);
    if (!currentElement) return;

    const newFontSize = Math.max(12, Math.min(200, currentElement.fontSize * scaleX));
    const newMaxWidth = Math.max(50, Math.min(CANVAS_WIDTH, currentElement.maxWidth * scaleX));

    const newX = Math.max(0, Math.min(node.x(), CANVAS_WIDTH - newMaxWidth));
    const newY = Math.max(0, Math.min(node.y(), CANVAS_HEIGHT));

    node.x(newX);
    node.y(newY);

    const updatedTexts = screenshot.textElements.map((el) =>
      el.id === textId
        ? {
            ...el,
            x: newX,
            y: newY,
            fontSize: newFontSize,
            maxWidth: newMaxWidth,
          }
        : el
    );
    onScreenshotChange({ ...screenshot, textElements: updatedTexts });
  };

  // Handle image click in grid
  const handleImageClick = (screenshotId: string, imageId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    setSelectedImageIds(prev => {
      const newMap = new Map(prev);
      newMap.set(screenshotId, imageId);
      return newMap;
    });
    setSelectedTextIds(prev => {
      const newMap = new Map(prev);
      newMap.set(screenshotId, null);
      return newMap;
    });
  };

  // Handle text click in grid
  const handleTextClick = (screenshotId: string, textId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    setSelectedImageIds(prev => {
      const newMap = new Map(prev);
      newMap.set(screenshotId, null);
      return newMap;
    });
    setSelectedTextIds(prev => {
      const newMap = new Map(prev);
      newMap.set(screenshotId, textId);
      return newMap;
    });
  };

  // Update transformers when selections change
  useEffect(() => {
    screenshots.forEach(screenshot => {
      const selectedImageId = selectedImageIds.get(screenshot.id);
      const selectedTextId = selectedTextIds.get(screenshot.id);
      const imageTransformer = imageTransformerRefs.current.get(screenshot.id);
      const textTransformer = textTransformerRefs.current.get(screenshot.id);

      if (selectedImageId && imageTransformer) {
        const attachImageTransformer = () => {
          const imageGroup = imageGroupRefs.current.get(`${screenshot.id}-${selectedImageId}`);
          if (imageGroup) {
            imageTransformer.nodes([imageGroup]);
            imageTransformer.getLayer()?.batchDraw();
            return true;
          }
          return false;
        };
        
        if (!attachImageTransformer()) {
          // Retry if ref not ready
          setTimeout(() => attachImageTransformer(), 50);
        }
        
        // Clear text transformer
        if (textTransformer) {
          textTransformer.nodes([]);
          textTransformer.getLayer()?.batchDraw();
        }
      } else if (imageTransformer) {
        imageTransformer.nodes([]);
        imageTransformer.getLayer()?.batchDraw();
      }

      if (selectedTextId && textTransformer) {
        const attachTextTransformer = () => {
          const textNode = textRefs.current.get(`${screenshot.id}-${selectedTextId}`);
          if (textNode) {
            textTransformer.nodes([textNode]);
            textTransformer.getLayer()?.batchDraw();
            return true;
          }
          return false;
        };
        
        if (!attachTextTransformer()) {
          // Retry if ref not ready
          setTimeout(() => attachTextTransformer(), 50);
        }
        
        // Clear image transformer
        if (imageTransformer) {
          imageTransformer.nodes([]);
          imageTransformer.getLayer()?.batchDraw();
        }
      } else if (textTransformer) {
        textTransformer.nodes([]);
        textTransformer.getLayer()?.batchDraw();
      }
    });
  }, [screenshots, selectedScreenshotId, selectedImageIds, selectedTextIds]);

  return (
    <div className="p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Screenshots</h2>
        <p className="text-xs text-gray-500 mt-0.5">Create up to 5 App Store screenshots</p>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {displayScreenshots.map((screenshot, index) => {
          const isEmpty = !screenshot;
          const isSelected = screenshot?.id === selectedScreenshotId;
          const gradient = screenshot
            ? gradientColors.find((g) => g.id === screenshot.gradientId)
            : null;
          const gradientColorsArray = gradient?.colors || ['#FFFFFF', '#000000'];

          return (
            <div
              key={screenshot?.id || `empty-${index}`}
              className={`relative group cursor-pointer ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {isEmpty ? (
                <button
                  onClick={() => handleScreenshotClick(null, index)}
                  className="w-full aspect-[9/19] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <Plus size={20} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 font-medium">Add</span>
                </button>
              ) : (
                <div className="relative">
                  <div
                    className={`w-full aspect-[9/19] bg-white rounded-lg shadow-lg overflow-hidden border-2 transition-all ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Stage
                      width={CANVAS_WIDTH * PREVIEW_SCALE}
                      height={CANVAS_HEIGHT * PREVIEW_SCALE}
                      scaleX={PREVIEW_SCALE}
                      scaleY={PREVIEW_SCALE}
                      onClick={(e) => {
                        const target = e.target;
                        const stage = target.getStage();
                        const isBackground = target === stage || target.getClassName() === 'Rect';
                        if (isBackground) {
                          handleScreenshotClick(screenshot, index);
                          // Clear selections
                          setSelectedImageIds(prev => {
                            const newMap = new Map(prev);
                            newMap.set(screenshot.id, null);
                            return newMap;
                          });
                          setSelectedTextIds(prev => {
                            const newMap = new Map(prev);
                            newMap.set(screenshot.id, null);
                            return newMap;
                          });
                        }
                      }}
                    >
                      <Layer>
                        {/* Background */}
                        {screenshot.backgroundType === 'solid' ? (
                          <Rect
                            x={0}
                            y={0}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            fill={screenshot.solidColor}
                            listening={false}
                          />
                        ) : (
                          <Rect
                            x={0}
                            y={0}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                            fillLinearGradientEndPoint={{
                              x: gradient?.direction === 'horizontal' ? CANVAS_WIDTH : 0,
                              y: gradient?.direction === 'vertical' ? CANVAS_HEIGHT : 0,
                            }}
                            fillLinearGradientColorStops={[
                              0,
                              gradientColorsArray[0],
                              1,
                              gradientColorsArray[1],
                            ]}
                            listening={false}
                          />
                        )}

                        {/* Screenshot Images - Fully Editable */}
                        {screenshot.screenshotImages.map((screenshotImg) => {
                          const isImageSelected = selectedImageIds.get(screenshot.id) === screenshotImg.id;
                          return (
                            <Group
                              key={screenshotImg.id}
                              ref={(node) => {
                                if (node) {
                                  imageGroupRefs.current.set(`${screenshot.id}-${screenshotImg.id}`, node);
                                } else {
                                  imageGroupRefs.current.delete(`${screenshot.id}-${screenshotImg.id}`);
                                }
                              }}
                              x={screenshotImg.element.x}
                              y={screenshotImg.element.y}
                              width={screenshotImg.element.width}
                              height={screenshotImg.element.height}
                              draggable={true}
                              onDragEnd={(e) => handleImageDragEnd(screenshot.id, screenshotImg.id, e)}
                              onClick={(e) => handleImageClick(screenshot.id, screenshotImg.id, e)}
                              onTap={(e) => handleImageClick(screenshot.id, screenshotImg.id, e)}
                              onTransformEnd={() => handleImageTransformEnd(screenshot.id, screenshotImg.id)}
                              clipFunc={(ctx) => {
                                const radius = screenshot.roundedCorners
                                  ? screenshotImg.element.borderRadius
                                  : 0;
                                ctx.beginPath();
                                if (radius > 0) {
                                  ctx.moveTo(radius, 0);
                                  ctx.lineTo(
                                    screenshotImg.element.width - radius,
                                    0
                                  );
                                  ctx.quadraticCurveTo(
                                    screenshotImg.element.width,
                                    0,
                                    screenshotImg.element.width,
                                    radius
                                  );
                                  ctx.lineTo(
                                    screenshotImg.element.width,
                                    screenshotImg.element.height - radius
                                  );
                                  ctx.quadraticCurveTo(
                                    screenshotImg.element.width,
                                    screenshotImg.element.height,
                                    screenshotImg.element.width - radius,
                                    screenshotImg.element.height
                                  );
                                  ctx.lineTo(radius, screenshotImg.element.height);
                                  ctx.quadraticCurveTo(
                                    0,
                                    screenshotImg.element.height,
                                    0,
                                    screenshotImg.element.height - radius
                                  );
                                  ctx.lineTo(0, radius);
                                  ctx.quadraticCurveTo(0, 0, radius, 0);
                                } else {
                                  ctx.rect(
                                    0,
                                    0,
                                    screenshotImg.element.width,
                                    screenshotImg.element.height
                                  );
                                }
                                ctx.clip();
                              }}
                            >
                              <KonvaImage
                                image={screenshotImg.image}
                                width={screenshotImg.element.width}
                                height={screenshotImg.element.height}
                                shadowBlur={screenshot.dropShadow ? 20 : 0}
                                shadowColor="rgba(0, 0, 0, 0.3)"
                                shadowOffsetX={screenshot.dropShadow ? 0 : 0}
                                shadowOffsetY={screenshot.dropShadow ? 10 : 0}
                                shadowOpacity={screenshot.dropShadow ? 1 : 0}
                                listening={true}
                                onClick={(e) => {
                                  e.evt.stopPropagation();
                                  handleImageClick(screenshot.id, screenshotImg.id, e);
                                }}
                                onTap={(e) => {
                                  e.evt.stopPropagation();
                                  handleImageClick(screenshot.id, screenshotImg.id, e);
                                }}
                              />
                              {/* Selection border */}
                              {isImageSelected && (
                                <Rect
                                  x={-2}
                                  y={-2}
                                  width={screenshotImg.element.width + 4}
                                  height={screenshotImg.element.height + 4}
                                  stroke="#3B82F6"
                                  strokeWidth={2}
                                  dash={[5, 5]}
                                  listening={false}
                                />
                              )}
                            </Group>
                          );
                        })}

                        {/* Transformer for selected image */}
                        <Transformer
                          ref={(node) => {
                            if (node) {
                              imageTransformerRefs.current.set(screenshot.id, node);
                            } else {
                              imageTransformerRefs.current.delete(screenshot.id);
                            }
                          }}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 50) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                          rotateEnabled={false}
                          borderEnabled={true}
                          borderStroke="#3B82F6"
                          borderStrokeWidth={2}
                          anchorFill="#3B82F6"
                          anchorStroke="#FFFFFF"
                          anchorStrokeWidth={2}
                          anchorSize={6}
                        />

                        {/* Text Elements - Fully Editable */}
                        {screenshot.textElements.map((element) => {
                          const isTextSelected = selectedTextIds.get(screenshot.id) === element.id;
                          return (
                            <Text
                              key={element.id}
                              ref={(node) => {
                                if (node) {
                                  textRefs.current.set(`${screenshot.id}-${element.id}`, node);
                                } else {
                                  textRefs.current.delete(`${screenshot.id}-${element.id}`);
                                }
                              }}
                              x={element.x}
                              y={element.y}
                              text={element.text}
                              fontSize={element.fontSize}
                              fontFamily={element.fontFamily}
                              fontWeight={element.fontWeight}
                              fill={element.fill}
                              width={element.maxWidth}
                              align={element.align}
                              verticalAlign="top"
                              lineHeight={element.lineHeight}
                              wrap="word"
                              draggable={true}
                              onDragEnd={(e) => handleTextDragEnd(screenshot.id, element.id, e)}
                              onClick={(e) => {
                                e.evt.stopPropagation();
                                handleTextClick(screenshot.id, element.id, e);
                              }}
                              onTap={(e) => {
                                e.evt.stopPropagation();
                                handleTextClick(screenshot.id, element.id, e);
                              }}
                              onTransformEnd={() => handleTextTransformEnd(screenshot.id, element.id)}
                              stroke={isTextSelected ? '#3B82F6' : undefined}
                              strokeWidth={isTextSelected ? 2 : 0}
                              shadowBlur={isTextSelected ? 3 : 0}
                              shadowColor={isTextSelected ? '#3B82F6' : undefined}
                              shadowOpacity={isTextSelected ? 0.5 : 0}
                            />
                          );
                        })}

                        {/* Transformer for selected text */}
                        <Transformer
                          ref={(node) => {
                            if (node) {
                              textTransformerRefs.current.set(screenshot.id, node);
                            } else {
                              textTransformerRefs.current.delete(screenshot.id);
                            }
                          }}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 30) {
                              return oldBox;
                            }
                            return newBox;
                          }}
                          rotateEnabled={false}
                          borderEnabled={true}
                          borderStroke="#3B82F6"
                          borderStrokeWidth={2}
                          anchorFill="#3B82F6"
                          anchorStroke="#FFFFFF"
                          anchorStrokeWidth={2}
                          anchorSize={6}
                        />
                      </Layer>
                    </Stage>
                  </div>

                  {/* Delete button - only show on hover, no edit button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this screenshot?')) {
                        onScreenshotDelete(screenshot.id);
                      }
                    }}
                    className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <X size={14} />
                  </button>

                  {/* Screenshot Number Badge */}
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                    #{index + 1}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

