import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SAFE_ZONE_MARGIN, SAFE_ZONE_TOP } from '../presets/layoutPresets';
import { BackgroundType, gradientColors } from '../types';
import { TextElement } from '../types/textElement';
import { ScreenshotImage } from '../types/screenshot';

interface CanvasStageProps {
  screenshotImages: ScreenshotImage[];
  onScreenshotImagesChange: (images: ScreenshotImage[]) => void;
  selectedImageId: string | null;
  onSelectedImageChange: (id: string | null) => void;
  textElements: TextElement[];
  selectedTextId: string | null;
  onTextElementsChange: (elements: TextElement[]) => void;
  onSelectedTextChange: (id: string | null) => void;
  backgroundType: BackgroundType;
  solidColor: string;
  gradientId: string;
  showSafeZones: boolean;
  roundedCorners: boolean;
  dropShadow: boolean;
  locale?: string;
  onStageReady: (stage: Konva.Stage, safeZoneLayer: Konva.Layer) => void;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  screenshotImages,
  onScreenshotImagesChange,
  selectedImageId,
  onSelectedImageChange,
  textElements,
  selectedTextId,
  onTextElementsChange,
  onSelectedTextChange,
  backgroundType,
  solidColor,
  gradientId,
  showSafeZones,
  roundedCorners,
  dropShadow,
  locale,
  onStageReady,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const safeZoneLayerRef = useRef<Konva.Layer>(null);
  const imageGroupRefs = useRef<Map<string, Konva.Group>>(new Map());
  const imageTransformerRef = useRef<Konva.Transformer>(null);
  const textRefs = useRef<Map<string, Konva.Text>>(new Map());
  const textTransformerRef = useRef<Konva.Transformer>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate scale to fit canvas in container
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const containerWidth = container.clientWidth - 40;
      const containerHeight = container.clientHeight - 40;

      const scaleX = containerWidth / CANVAS_WIDTH;
      const scaleY = containerHeight / CANVAS_HEIGHT;
      const newScale = Math.min(scaleX, scaleY, 1);

      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Notify parent when stage is ready
  useEffect(() => {
    if (stageRef.current && safeZoneLayerRef.current && onStageReady) {
      onStageReady(stageRef.current, safeZoneLayerRef.current);
    }
  }, [onStageReady]);

  // Update transformer when image is selected
  useEffect(() => {
    if (imageTransformerRef.current) {
      if (selectedImageId) {
        const attachTransformer = () => {
          const selectedGroup = imageGroupRefs.current.get(selectedImageId);
          if (selectedGroup && imageTransformerRef.current) {
            imageTransformerRef.current.nodes([selectedGroup]);
            imageTransformerRef.current.getLayer()?.batchDraw();
            return true;
          }
          return false;
        };

        // Try immediately
        if (!attachTransformer()) {
          // If not ready, try with increasing delays
          const tryAttach = (attempt = 0) => {
            if (attempt < 5) {
              setTimeout(() => {
                if (!attachTransformer() && attempt < 4) {
                  tryAttach(attempt + 1);
                }
              }, 50 * (attempt + 1));
            }
          };
          tryAttach();
        }
        // Clear text transformer when image is selected
        if (textTransformerRef.current) {
          textTransformerRef.current.nodes([]);
          textTransformerRef.current.getLayer()?.batchDraw();
        }
      } else {
        imageTransformerRef.current.nodes([]);
        imageTransformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedImageId, screenshotImages]);

  // Update transformer when text is selected
  useEffect(() => {
    if (textTransformerRef.current) {
      if (selectedTextId) {
        const attachTransformer = () => {
          const selectedText = textRefs.current.get(selectedTextId);
          if (selectedText && textTransformerRef.current) {
            textTransformerRef.current.nodes([selectedText]);
            textTransformerRef.current.getLayer()?.batchDraw();
            return true;
          }
          return false;
        };

        // Try immediately
        if (!attachTransformer()) {
          // If not ready, try with increasing delays
          const tryAttach = (attempt = 0) => {
            if (attempt < 5) {
              setTimeout(() => {
                if (!attachTransformer() && attempt < 4) {
                  tryAttach(attempt + 1);
                }
              }, 50 * (attempt + 1));
            }
          };
          tryAttach();
        }
        // Clear image transformer when text is selected
        if (imageTransformerRef.current) {
          imageTransformerRef.current.nodes([]);
          imageTransformerRef.current.getLayer()?.batchDraw();
        }
      } else {
        textTransformerRef.current.nodes([]);
        textTransformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedTextId, textElements]);

  // Handle image drag end
  const handleImageDragEnd = (imageId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const screenshotImg = screenshotImages.find((img) => img.id === imageId);
    if (!screenshotImg) return;

    const newX = Math.max(0, Math.min(node.x(), CANVAS_WIDTH - screenshotImg.element.width));
    const newY = Math.max(0, Math.min(node.y(), CANVAS_HEIGHT - screenshotImg.element.height));

    node.x(newX);
    node.y(newY);

    const updatedImages = screenshotImages.map((img) =>
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
    onScreenshotImagesChange(updatedImages);
  };

  // Handle image transform end (resize)
  const handleImageTransformEnd = (imageId: string) => {
    const selectedGroup = imageGroupRefs.current.get(imageId);
    if (!selectedGroup) return;

    const screenshotImg = screenshotImages.find((img) => img.id === imageId);
    if (!screenshotImg) return;

    const node = selectedGroup;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and update dimensions
    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(100, Math.min(node.width() * scaleX, CANVAS_WIDTH));
    const newHeight = Math.max(100, Math.min(node.height() * scaleY, CANVAS_HEIGHT));

    // Keep aspect ratio
    const aspectRatio = screenshotImg.element.width / screenshotImg.element.height;
    let finalWidth = newWidth;
    let finalHeight = newHeight;

    if (Math.abs(scaleX - scaleY) < 0.1) {
      // User is scaling proportionally
      finalHeight = finalWidth / aspectRatio;
    }

    // Constrain to canvas bounds
    const newX = Math.max(0, Math.min(node.x(), CANVAS_WIDTH - finalWidth));
    const newY = Math.max(0, Math.min(node.y(), CANVAS_HEIGHT - finalHeight));

    node.x(newX);
    node.y(newY);
    node.width(finalWidth);
    node.height(finalHeight);

    const updatedImages = screenshotImages.map((img) =>
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
    onScreenshotImagesChange(updatedImages);
  };

  // Handle image click
  const handleImageClick = (imageId: string) => {
    onSelectedImageChange(imageId);
    onSelectedTextChange(null);
  };

  // Handle text drag end
  const handleTextDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const newX = Math.max(0, Math.min(node.x(), CANVAS_WIDTH - node.width()));
    const newY = Math.max(0, Math.min(node.y(), CANVAS_HEIGHT - node.height()));

    node.x(newX);
    node.y(newY);

    onTextElementsChange(
      textElements.map((el) =>
        el.id === id ? { ...el, x: newX, y: newY } : el
      )
    );
  };

  // Handle text click
  const handleTextClick = (id: string) => {
    onSelectedTextChange(id);
    onSelectedImageChange(null);
  };

  // Get gradient colors
  const gradient = gradientColors.find((g) => g.id === gradientId);
  const gradientColorsArray = gradient?.colors || ['#FFFFFF', '#000000'];

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center bg-gray-50 p-5 overflow-auto"
    >
      <Stage
        ref={stageRef}
        width={CANVAS_WIDTH * scale}
        height={CANVAS_HEIGHT * scale}
        scaleX={scale}
        scaleY={scale}
        onClick={(e) => {
          // Deselect if clicking on stage background (not on an image or text)
          const target = e.target;
          const stage = target.getStage();
          const isBackground = target === stage || 
                               (target.getClassName && target.getClassName() === 'Rect' && !target.hasName('safe-zone'));
          if (isBackground) {
            onSelectedImageChange(null);
            onSelectedTextChange(null);
          }
        }}
      >
        {/* Main content layer */}
        <Layer>
          {/* Background */}
          {backgroundType === 'solid' ? (
            <Rect
              x={0}
              y={0}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              fill={solidColor}
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
            />
          )}

          {/* Screenshot Images */}
          {screenshotImages.map((screenshotImg) => {
            const isSelected = selectedImageId === screenshotImg.id;
            return (
              <Group
                key={screenshotImg.id}
                ref={(node) => {
                  if (node) {
                    imageGroupRefs.current.set(screenshotImg.id, node);
                    // Update transformer when ref is set
                    if (isSelected && imageTransformerRef.current) {
                      imageTransformerRef.current.nodes([node]);
                      imageTransformerRef.current.getLayer()?.batchDraw();
                    }
                  } else {
                    imageGroupRefs.current.delete(screenshotImg.id);
                  }
                }}
                x={screenshotImg.element.x}
                y={screenshotImg.element.y}
                width={screenshotImg.element.width}
                height={screenshotImg.element.height}
                draggable={true}
                onDragEnd={(e) => handleImageDragEnd(screenshotImg.id, e)}
                onClick={(e) => {
                  e.evt.stopPropagation();
                  handleImageClick(screenshotImg.id);
                }}
                onTap={(e) => {
                  e.evt.stopPropagation();
                  handleImageClick(screenshotImg.id);
                }}
                onTransformEnd={() => handleImageTransformEnd(screenshotImg.id)}
                clipFunc={(ctx) => {
                  const radius = roundedCorners ? screenshotImg.element.borderRadius : 0;
                  ctx.beginPath();
                  if (radius > 0) {
                    ctx.moveTo(radius, 0);
                    ctx.lineTo(screenshotImg.element.width - radius, 0);
                    ctx.quadraticCurveTo(
                      screenshotImg.element.width,
                      0,
                      screenshotImg.element.width,
                      radius
                    );
                    ctx.lineTo(screenshotImg.element.width, screenshotImg.element.height - radius);
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
                    ctx.rect(0, 0, screenshotImg.element.width, screenshotImg.element.height);
                  }
                  ctx.clip();
                }}
              >
                <KonvaImage
                  image={screenshotImg.image}
                  width={screenshotImg.element.width}
                  height={screenshotImg.element.height}
                  shadowBlur={dropShadow ? 20 : 0}
                  shadowColor="rgba(0, 0, 0, 0.3)"
                  shadowOffsetX={dropShadow ? 0 : 0}
                  shadowOffsetY={dropShadow ? 10 : 0}
                  shadowOpacity={dropShadow ? 1 : 0}
                  listening={true}
                  onClick={(e) => {
                    e.evt.stopPropagation();
                    handleImageClick(screenshotImg.id);
                  }}
                  onTap={(e) => {
                    e.evt.stopPropagation();
                    handleImageClick(screenshotImg.id);
                  }}
                />
                {/* Selection border */}
                {isSelected && (
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
            ref={imageTransformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resize to maintain minimum size
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
            anchorSize={8}
          />

          {/* Text Elements */}
          {textElements.map((element) => {
            const isSelected = selectedTextId === element.id;
            return (
              <Text
                key={element.id}
                ref={(node) => {
                  if (node) {
                    textRefs.current.set(element.id, node);
                  } else {
                    textRefs.current.delete(element.id);
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
                onDragEnd={(e) => handleTextDragEnd(element.id, e)}
                onClick={(e) => {
                  e.evt.stopPropagation();
                  handleTextClick(element.id);
                }}
                onTap={(e) => {
                  e.evt.stopPropagation();
                  handleTextClick(element.id);
                }}
                onTransformEnd={() => handleTextTransformEnd(element.id)}
                stroke={isSelected ? '#3B82F6' : undefined}
                strokeWidth={isSelected ? 2 : 0}
                shadowBlur={isSelected ? 5 : 0}
                shadowColor={isSelected ? '#3B82F6' : undefined}
                shadowOpacity={isSelected ? 0.5 : 0}
              />
            );
          })}

          {/* Transformer for selected text */}
          <Transformer
            ref={textTransformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resize to maintain minimum size
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
            anchorSize={8}
          />
        </Layer>

        {/* Safe zone overlay layer (excluded from export) */}
        <Layer ref={safeZoneLayerRef} visible={showSafeZones}>
          {/* Main safe zone boundary - thicker and more visible */}
          <Rect
            x={SAFE_ZONE_MARGIN}
            y={SAFE_ZONE_MARGIN}
            width={CANVAS_WIDTH - SAFE_ZONE_MARGIN * 2}
            height={CANVAS_HEIGHT - SAFE_ZONE_MARGIN * 2}
            stroke="#FF0000"
            strokeWidth={4}
            dash={[15, 8]}
            opacity={0.7}
            listening={false}
          />
          {/* Status bar exclusion zone */}
          <Rect
            x={0}
            y={0}
            width={CANVAS_WIDTH}
            height={SAFE_ZONE_TOP}
            fill="rgba(255, 0, 0, 0.15)"
            listening={false}
          />
          {/* Top status bar boundary line */}
          <Rect
            x={0}
            y={SAFE_ZONE_TOP}
            width={CANVAS_WIDTH}
            height={4}
            fill="#FF0000"
            opacity={0.7}
            listening={false}
          />
          {/* Grid lines - thicker */}
          {Array.from({ length: 5 }).map((_, i) => (
            <Rect
              key={`h-${i}`}
              x={SAFE_ZONE_MARGIN + (i * (CANVAS_WIDTH - SAFE_ZONE_MARGIN * 2)) / 4}
              y={SAFE_ZONE_MARGIN}
              width={2}
              height={CANVAS_HEIGHT - SAFE_ZONE_MARGIN * 2}
              stroke="#CCCCCC"
              strokeWidth={2}
              opacity={0.4}
              listening={false}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
