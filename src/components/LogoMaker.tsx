import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Circle, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { Plus, Type, Circle as CircleIcon, Square, Trash2, Download, Sparkles } from 'lucide-react';
import { BackgroundType, gradientColors, solidColors } from '../types';
import { FONT_FAMILIES, FONT_WEIGHTS } from '../types/textElement';

const LOGO_SIZE = 1024;

interface LogoElement {
  id: string;
  type: 'text' | 'shape';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  fill?: string;
  shape?: 'circle' | 'rect';
}

export const LogoMaker: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [logoElements, setLogoElements] = useState<LogoElement[]>([
    {
      id: 'logo-1',
      type: 'text',
      x: LOGO_SIZE / 2,
      y: LOGO_SIZE / 2,
      text: 'LOGO',
      fontSize: 120,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontWeight: 800,
      fill: '#000000',
    },
  ]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>('logo-1');
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('solid');
  const [selectedSolidColor, setSelectedSolidColor] = useState('#FFFFFF');
  const [selectedGradient, setSelectedGradient] = useState(gradientColors[0].id);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const containerWidth = container.clientWidth - 40;
      const containerHeight = container.clientHeight - 40;

      const scaleX = containerWidth / LOGO_SIZE;
      const scaleY = containerHeight / LOGO_SIZE;
      const newScale = Math.min(scaleX, scaleY, 0.8);

      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    if (selectedElementId && transformerRef.current) {
      const node = stageRef.current?.findOne(`#${selectedElementId}`);
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedElementId, logoElements]);

  const handleAddText = () => {
    const newElement: LogoElement = {
      id: `logo-${Date.now()}`,
      type: 'text',
      x: LOGO_SIZE / 2,
      y: LOGO_SIZE / 2,
      text: 'TEXT',
      fontSize: 80,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontWeight: 700,
      fill: '#000000',
    };
    setLogoElements([...logoElements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const handleAddShape = (shape: 'circle' | 'rect') => {
    const newElement: LogoElement = {
      id: `logo-${Date.now()}`,
      type: 'shape',
      x: LOGO_SIZE / 2,
      y: LOGO_SIZE / 2,
      width: 200,
      height: 200,
      shape,
      fill: '#3B82F6',
    };
    setLogoElements([...logoElements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const handleDeleteElement = (id: string) => {
    setLogoElements(logoElements.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleElementDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    setLogoElements(
      logoElements.map((el) =>
        el.id === id ? { ...el, x: node.x(), y: node.y() } : el
      )
    );
  };

  const handleElementTransformEnd = (id: string) => {
    const node = stageRef.current?.findOne(`#${id}`) as Konva.Shape;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    setLogoElements(
      logoElements.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            x: node.x(),
            y: node.y(),
            width: el.width ? el.width * scaleX : undefined,
            height: el.height ? el.height * scaleY : undefined,
            fontSize: el.fontSize ? el.fontSize * scaleX : undefined,
          };
        }
        return el;
      })
    );
  };

  const selectedElement = logoElements.find((el) => el.id === selectedElementId);
  const gradient = gradientColors.find((g) => g.id === selectedGradient);
  const gradientColorsArray = gradient?.colors || ['#FFFFFF', '#000000'];

  const handleExportLogo = () => {
    if (!stageRef.current) return;

    const dataURL = stageRef.current.toDataURL({
      pixelRatio: 1,
      width: LOGO_SIZE,
      height: LOGO_SIZE,
    });

    const link = document.createElement('a');
    link.download = 'shotly_logo_1024x1024.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Sparkles size={20} />
            Logo Maker
          </h2>
          <p className="text-xs text-gray-500 mb-6">Size: 1024×1024</p>

          {/* Add Elements */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Elements</h3>
            <div className="space-y-2">
              <button
                onClick={handleAddText}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Text
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAddShape('circle')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <CircleIcon size={16} />
                  Circle
                </button>
                <button
                  onClick={() => handleAddShape('rect')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Square size={16} />
                  Rectangle
                </button>
              </div>
            </div>
          </div>

          {/* Elements List */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Elements ({logoElements.length})
            </h3>
            <div className="space-y-2">
              {logoElements.map((element) => (
                <div
                  key={element.id}
                  onClick={() => setSelectedElementId(element.id)}
                  className={`p-2 border rounded cursor-pointer ${
                    selectedElementId === element.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {element.type === 'text' ? element.text : element.shape}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteElement(element.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Selected Element */}
          {selectedElement && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Edit Element</h3>
              {selectedElement.type === 'text' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Text
                    </label>
                    <input
                      type="text"
                      value={selectedElement.text || ''}
                      onChange={(e) =>
                        setLogoElements(
                          logoElements.map((el) =>
                            el.id === selectedElement.id
                              ? { ...el, text: e.target.value }
                              : el
                          )
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Font Size
                    </label>
                    <input
                      type="number"
                      value={selectedElement.fontSize || 80}
                      onChange={(e) =>
                        setLogoElements(
                          logoElements.map((el) =>
                            el.id === selectedElement.id
                              ? { ...el, fontSize: parseInt(e.target.value) || 80 }
                              : el
                          )
                        )
                      }
                      min="12"
                      max="500"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Font Family
                    </label>
                    <select
                      value={selectedElement.fontFamily || ''}
                      onChange={(e) =>
                        setLogoElements(
                          logoElements.map((el) =>
                            el.id === selectedElement.id
                              ? { ...el, fontFamily: e.target.value }
                              : el
                          )
                        )
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {FONT_FAMILIES.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedElement.fill || '#000000'}
                        onChange={(e) =>
                          setLogoElements(
                            logoElements.map((el) =>
                              el.id === selectedElement.id
                                ? { ...el, fill: e.target.value }
                                : el
                            )
                          )
                        }
                        className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedElement.fill || '#000000'}
                        onChange={(e) =>
                          setLogoElements(
                            logoElements.map((el) =>
                              el.id === selectedElement.id
                                ? { ...el, fill: e.target.value }
                                : el
                            )
                          )
                        }
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
              {selectedElement.type === 'shape' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedElement.fill || '#3B82F6'}
                        onChange={(e) =>
                          setLogoElements(
                            logoElements.map((el) =>
                              el.id === selectedElement.id
                                ? { ...el, fill: e.target.value }
                                : el
                            )
                          )
                        }
                        className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedElement.fill || '#3B82F6'}
                        onChange={(e) =>
                          setLogoElements(
                            logoElements.map((el) =>
                              el.id === selectedElement.id
                                ? { ...el, fill: e.target.value }
                                : el
                            )
                          )
                        }
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Background */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Background</h3>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setBackgroundType('solid')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                  backgroundType === 'solid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Solid
              </button>
              <button
                onClick={() => setBackgroundType('gradient')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                  backgroundType === 'gradient'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Gradient
              </button>
            </div>
            {backgroundType === 'solid' && (
              <div className="grid grid-cols-4 gap-2">
                {solidColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedSolidColor(color.color)}
                    className={`aspect-square rounded border-2 ${
                      selectedSolidColor === color.color
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.color }}
                  />
                ))}
              </div>
            )}
            {backgroundType === 'gradient' && (
              <div className="grid grid-cols-2 gap-2">
                {gradientColors.map((gradient) => {
                  const gradientString =
                    gradient.direction === 'vertical'
                      ? `linear-gradient(to bottom, ${gradient.colors.join(', ')})`
                      : `linear-gradient(to right, ${gradient.colors.join(', ')})`;
                  return (
                    <button
                      key={gradient.id}
                      onClick={() => setSelectedGradient(gradient.id)}
                      className={`h-12 rounded border-2 ${
                        selectedGradient === gradient.id
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-300'
                      }`}
                      style={{ background: gradientString }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center bg-gray-50 p-5 overflow-auto"
        >
          <Stage
            ref={stageRef}
            width={LOGO_SIZE * scale}
            height={LOGO_SIZE * scale}
            scaleX={scale}
            scaleY={scale}
            onClick={(e) => {
              const clickedOnEmpty = e.target === e.target.getStage();
              if (clickedOnEmpty) {
                setSelectedElementId(null);
              }
            }}
          >
            <Layer>
              {/* Background */}
              {backgroundType === 'solid' ? (
                <Rect
                  x={0}
                  y={0}
                  width={LOGO_SIZE}
                  height={LOGO_SIZE}
                  fill={selectedSolidColor}
                />
              ) : (
                <Rect
                  x={0}
                  y={0}
                  width={LOGO_SIZE}
                  height={LOGO_SIZE}
                  fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                  fillLinearGradientEndPoint={{
                    x: gradient?.direction === 'horizontal' ? LOGO_SIZE : 0,
                    y: gradient?.direction === 'vertical' ? LOGO_SIZE : 0,
                  }}
                  fillLinearGradientColorStops={[
                    0,
                    gradientColorsArray[0],
                    1,
                    gradientColorsArray[1],
                  ]}
                />
              )}

              {/* Logo Elements */}
              {logoElements.map((element) => {
                if (element.type === 'text') {
                  return (
                    <Text
                      key={element.id}
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      text={element.text || ''}
                      fontSize={element.fontSize || 80}
                      fontFamily={element.fontFamily || 'system-ui'}
                      fontWeight={element.fontWeight || 700}
                      fill={element.fill || '#000000'}
                      align="center"
                      verticalAlign="middle"
                      offsetX={0}
                      offsetY={0}
                      draggable
                      onDragEnd={(e) => handleElementDragEnd(element.id, e)}
                      onClick={() => setSelectedElementId(element.id)}
                      onTransformEnd={() => handleElementTransformEnd(element.id)}
                    />
                  );
                } else if (element.type === 'shape') {
                  if (element.shape === 'circle') {
                    return (
                      <Circle
                        key={element.id}
                        id={element.id}
                        x={element.x}
                        y={element.y}
                        radius={(element.width || 100) / 2}
                        fill={element.fill || '#3B82F6'}
                        draggable
                        onDragEnd={(e) => handleElementDragEnd(element.id, e)}
                        onClick={() => setSelectedElementId(element.id)}
                        onTransformEnd={() => handleElementTransformEnd(element.id)}
                      />
                    );
                  } else {
                    return (
                      <Rect
                        key={element.id}
                        id={element.id}
                        x={element.x}
                        y={element.y}
                        width={element.width || 200}
                        height={element.height || 200}
                        fill={element.fill || '#3B82F6'}
                        draggable
                        onDragEnd={(e) => handleElementDragEnd(element.id, e)}
                        onClick={() => setSelectedElementId(element.id)}
                        onTransformEnd={() => handleElementTransformEnd(element.id)}
                      />
                    );
                  }
                }
                return null;
              })}

              {/* Transformer */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="mb-6 flex justify-center bg-gray-100 rounded-lg p-4">
            <div
              className="bg-white rounded-lg shadow-lg"
              style={{ width: '200px', height: '200px' }}
            >
              {/* Mini preview would go here */}
            </div>
          </div>
          <button
            onClick={handleExportLogo}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Export Logo (1024×1024)
          </button>
        </div>
      </div>
    </div>
  );
};

