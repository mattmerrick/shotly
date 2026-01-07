import React, { useRef, useState } from 'react';
import { Upload, Plus, Trash2, Image as ImageIcon, Type, Settings, Palette, Layers, Eye, Globe } from 'lucide-react';
import { solidColors, gradientColors, BackgroundType } from '../types';
import { TextElement, DEFAULT_TEXT_ELEMENT } from '../types/textElement';
import { ImageElement, DEFAULT_IMAGE_ELEMENT } from '../types/imageElement';
import { ScreenshotImage } from '../types/screenshot';
import { SUPPORTED_LOCALES } from '../config/locales';

interface SidebarLeftProps {
  screenshotImages: ScreenshotImage[];
  onScreenshotImagesChange: (images: ScreenshotImage[]) => void;
  selectedImageId: string | null;
  onSelectedImageChange: (id: string | null) => void;
  textElements: TextElement[];
  selectedTextId: string | null;
  onTextElementsChange: (elements: TextElement[]) => void;
  onSelectedTextChange: (id: string | null) => void;
  backgroundType: BackgroundType;
  onBackgroundTypeChange: (type: BackgroundType) => void;
  selectedSolidColor: string;
  onSolidColorChange: (color: string) => void;
  selectedGradient: string;
  onGradientChange: (gradientId: string) => void;
  showSafeZones: boolean;
  onShowSafeZonesChange: (show: boolean) => void;
  roundedCorners: boolean;
  onRoundedCornersChange: (rounded: boolean) => void;
  dropShadow: boolean;
  onDropShadowChange: (shadow: boolean) => void;
  locale?: string;
  onLocaleChange?: (locale: string) => void;
  onReset: () => void;
  onEnsureScreenshotExists?: () => void; // Callback to ensure a screenshot slot exists
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  screenshotImages,
  onScreenshotImagesChange,
  selectedImageId,
  onSelectedImageChange,
  textElements,
  selectedTextId,
  onTextElementsChange,
  onSelectedTextChange,
  backgroundType,
  onBackgroundTypeChange,
  selectedSolidColor,
  onSolidColorChange,
  selectedGradient,
  onGradientChange,
  showSafeZones,
  onShowSafeZonesChange,
  roundedCorners,
  onRoundedCornersChange,
  dropShadow,
  onDropShadowChange,
  locale,
  onLocaleChange,
  onReset,
  onEnsureScreenshotExists,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      alert('Please select a PNG or JPEG image.');
      if (e.target) e.target.value = '';
      return;
    }

    setIsUploadingImages(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Ensure a screenshot slot exists before uploading
        if (!onEnsureScreenshotExists) {
          alert('Please select a screenshot slot first by clicking on it in the grid above.');
          setIsUploadingImages(false);
          return;
        }
        
        // Ensure screenshot exists (will create if needed)
        onEnsureScreenshotExists();
        
        // Replace existing images with the new one (single image per screenshot)
        const newImage: ScreenshotImage = {
          id: `img-${Date.now()}`,
          image: img,
          element: {
            ...DEFAULT_IMAGE_ELEMENT,
            // Center the image on canvas
            x: DEFAULT_IMAGE_ELEMENT.x,
            y: DEFAULT_IMAGE_ELEMENT.y,
          },
        };
        
        // Replace all images with just this one
        onScreenshotImagesChange([newImage]);
        // Select the uploaded image immediately so it's editable
        // Use a small delay to ensure the image is rendered and transformer can attach
        setTimeout(() => {
          onSelectedImageChange(newImage.id);
        }, 100);
        setIsUploadingImages(false);
      };
      img.onerror = () => {
        console.error('Failed to load image:', file.name);
        alert('Failed to load image. Please try again.');
        setIsUploadingImages(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      console.error('Failed to read file:', file.name);
      alert('Failed to read file. Please try again.');
      setIsUploadingImages(false);
    };
    reader.readAsDataURL(file);

    // Reset file input so same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDeleteImage = (id: string) => {
    onScreenshotImagesChange(screenshotImages.filter((img) => img.id !== id));
    if (selectedImageId === id) {
      onSelectedImageChange(null);
    }
  };


  const handleAddText = () => {
    const newElement: TextElement = {
      ...DEFAULT_TEXT_ELEMENT,
      id: `text-${Date.now()}`,
      y: textElements.length > 0 
        ? Math.max(...textElements.map(e => e.y)) + 100 
        : DEFAULT_TEXT_ELEMENT.y,
    };
    onTextElementsChange([...textElements, newElement]);
    onSelectedTextChange(newElement.id);
  };

  const handleUpdateText = (id: string, updates: Partial<TextElement>) => {
    onTextElementsChange(
      textElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const handleDeleteText = (id: string) => {
    onTextElementsChange(textElements.filter((el) => el.id !== id));
    if (selectedTextId === id) {
      onSelectedTextChange(null);
    }
  };

  const selectedText = textElements.find((el) => el.id === selectedTextId);
  const selectedImage = screenshotImages.find((img) => img.id === selectedImageId);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Shotly</h1>
        <p className="text-xs text-gray-500">App Store size: 1242×2688</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Upload Screenshots Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Upload size={16} />
            Upload Image to This Slide
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => {
              if (!onEnsureScreenshotExists) {
                alert('Please select a slide first by clicking on it in the grid above.');
                return;
              }
              fileInputRef.current?.click();
            }}
            disabled={isUploadingImages}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isUploadingImages ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                {screenshotImages.length > 0 ? 'Replace Image' : 'Upload Image'}
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {screenshotImages.length > 0 
              ? 'Click to replace the current image' 
              : '1. Click a slide above → 2. Upload image → 3. Edit it on canvas'}
          </p>
          
          {/* Screenshot Images List */}
          {screenshotImages.length > 0 && (
            <div className="mt-3 space-y-2">
              {screenshotImages.map((screenshotImg, index) => (
                <div
                  key={screenshotImg.id}
                  onClick={() => {
                    if (selectedImageId === screenshotImg.id) {
                      onSelectedImageChange(null);
                    } else {
                      onSelectedImageChange(screenshotImg.id);
                      onSelectedTextChange(null);
                    }
                  }}
                  className={`p-2 border rounded-lg cursor-pointer transition-all ${
                    selectedImageId === screenshotImg.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <ImageIcon size={16} className="text-gray-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 truncate">
                        Screenshot {index + 1}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(screenshotImg.id);
                      }}
                      className="ml-2 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Image Controls */}
        {selectedImage && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ImageIcon size={16} />
              Image Settings
            </h3>
            <p className="text-xs text-blue-700 mb-3 bg-blue-100 p-2 rounded">
              💡 Tip: Click and drag the image on canvas to move it. Drag the corners to resize/zoom.
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Width
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedImage.element.width)}
                    onChange={(e) => {
                      const updatedImages = screenshotImages.map((img) =>
                        img.id === selectedImage.id
                          ? {
                              ...img,
                              element: {
                                ...img.element,
                                width: parseInt(e.target.value) || 100,
                              },
                            }
                          : img
                      );
                      onScreenshotImagesChange(updatedImages);
                    }}
                    min="50"
                    max="1242"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Height
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedImage.element.height)}
                    onChange={(e) => {
                      const updatedImages = screenshotImages.map((img) =>
                        img.id === selectedImage.id
                          ? {
                              ...img,
                              element: {
                                ...img.element,
                                height: parseInt(e.target.value) || 100,
                              },
                            }
                          : img
                      );
                      onScreenshotImagesChange(updatedImages);
                    }}
                    min="50"
                    max="2688"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    X Position
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedImage.element.x)}
                    onChange={(e) => {
                      const updatedImages = screenshotImages.map((img) =>
                        img.id === selectedImage.id
                          ? {
                              ...img,
                              element: {
                                ...img.element,
                                x: parseInt(e.target.value) || 0,
                              },
                            }
                          : img
                      );
                      onScreenshotImagesChange(updatedImages);
                    }}
                    min="0"
                    max="1242"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Y Position
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedImage.element.y)}
                    onChange={(e) => {
                      const updatedImages = screenshotImages.map((img) =>
                        img.id === selectedImage.id
                          ? {
                              ...img,
                              element: {
                                ...img.element,
                                y: parseInt(e.target.value) || 0,
                              },
                            }
                          : img
                      );
                      onScreenshotImagesChange(updatedImages);
                    }}
                    min="0"
                    max="2688"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Border Radius: {selectedImage.element.borderRadius}px
                </label>
                <input
                  type="range"
                  value={selectedImage.element.borderRadius}
                  onChange={(e) => {
                    const updatedImages = screenshotImages.map((img) =>
                      img.id === selectedImage.id
                        ? {
                            ...img,
                            element: {
                              ...img.element,
                              borderRadius: parseInt(e.target.value),
                            },
                          }
                        : img
                    );
                    onScreenshotImagesChange(updatedImages);
                  }}
                  min="0"
                  max="100"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Locale Selector */}
        {onLocaleChange && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Globe size={16} />
              Language / Locale
            </label>
            <select
              value={locale || 'en'}
              onChange={(e) => onLocaleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {SUPPORTED_LOCALES.map((loc) => (
                <option key={loc.code} value={loc.code}>
                  {loc.flag} {loc.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Select language for text display and export
            </p>
          </div>
        )}

        {/* Text Elements Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Type size={16} />
              Text Elements
            </label>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {textElements.length}
            </span>
          </div>
          <button
            onClick={handleAddText}
            className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 mb-3"
          >
            <Plus size={16} />
            Add Text
          </button>
          {textElements.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Type size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-500">No text elements yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "Add Text" to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {textElements.map((element) => (
                <div
                  key={element.id}
                  onClick={() => {
                    onSelectedTextChange(element.id);
                    onSelectedImageChange(null);
                  }}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTextId === element.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {element.text || 'Empty text'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {element.fontSize}px • {element.fontFamily.split(',')[0]}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteText(element.id);
                      }}
                      className="ml-2 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Text Editor */}
        {selectedText && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Type size={16} />
              Edit Text
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Text Content ({locale && SUPPORTED_LOCALES.find(l => l.code === locale)?.label || 'Default'})
                </label>
                <textarea
                  value={selectedText.text}
                  onChange={(e) =>
                    handleUpdateText(selectedText.id, { text: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder="Enter your text"
                />
              </div>
              
              {/* Translation Inputs */}
              {locale && locale !== 'en' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Translation ({SUPPORTED_LOCALES.find(l => l.code === locale)?.label})
                  </label>
                  <textarea
                    value={selectedText.translations?.[locale] || ''}
                    onChange={(e) => {
                      const translations = selectedText.translations || {};
                      handleUpdateText(selectedText.id, {
                        translations: {
                          ...translations,
                          [locale]: e.target.value,
                        },
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder={`Enter ${SUPPORTED_LOCALES.find(l => l.code === locale)?.label} translation`}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Font Size
                  </label>
                  <input
                    type="number"
                    value={selectedText.fontSize}
                    onChange={(e) =>
                      handleUpdateText(selectedText.id, {
                        fontSize: parseInt(e.target.value) || 12,
                      })
                    }
                    onWheel={(e) => {
                      e.preventDefault();
                      e.currentTarget.focus();
                      const delta = e.deltaY > 0 ? -1 : 1;
                      const newSize = Math.max(
                        12,
                        Math.min(200, selectedText.fontSize + delta)
                      );
                      handleUpdateText(selectedText.id, { fontSize: newSize });
                    }}
                    min="12"
                    max="200"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Font Weight
                  </label>
                  <select
                    value={String(selectedText.fontWeight)}
                    onChange={(e) =>
                      handleUpdateText(selectedText.id, {
                        fontWeight: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="300">Light</option>
                    <option value="400">Regular</option>
                    <option value="500">Medium</option>
                    <option value="600">Semi Bold</option>
                    <option value="700">Bold</option>
                    <option value="800">Extra Bold</option>
                    <option value="900">Black</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Font Family
                </label>
                <select
                  value={selectedText.fontFamily}
                  onChange={(e) =>
                    handleUpdateText(selectedText.id, {
                      fontFamily: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="system-ui, -apple-system, sans-serif">
                    System (SF Pro)
                  </option>
                  <option value="Helvetica Neue, Helvetica, Arial, sans-serif">
                    Helvetica Neue
                  </option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="Times New Roman, Times, serif">
                    Times New Roman
                  </option>
                  <option value="Courier New, Courier, monospace">
                    Courier New
                  </option>
                  <option value="Verdana, Geneva, sans-serif">Verdana</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Impact, Charcoal, sans-serif">Impact</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedText.fill}
                    onChange={(e) =>
                      handleUpdateText(selectedText.id, { fill: e.target.value })
                    }
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedText.fill}
                    onChange={(e) =>
                      handleUpdateText(selectedText.id, { fill: e.target.value })
                    }
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Alignment
                </label>
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() =>
                        handleUpdateText(selectedText.id, { align })
                      }
                      className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                        selectedText.align === align
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {align.charAt(0).toUpperCase() + align.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Background Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Palette size={16} />
            Background
          </label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => onBackgroundTypeChange('solid')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                backgroundType === 'solid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Solid
            </button>
            <button
              onClick={() => onBackgroundTypeChange('gradient')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                backgroundType === 'gradient'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  onClick={() => onSolidColorChange(color.color)}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    selectedSolidColor === color.color
                      ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.color }}
                  title={color.name}
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
                    onClick={() => onGradientChange(gradient.id)}
                    className={`h-12 rounded-lg border-2 transition-all ${
                      selectedGradient === gradient.id
                        ? 'border-blue-500 ring-2 ring-blue-200 scale-105'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ background: gradientString }}
                    title={gradient.name}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Settings size={16} />
            Settings
          </label>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Show Safe Zones
                </span>
              </div>
              <input
                type="checkbox"
                checked={showSafeZones}
                onChange={(e) => onShowSafeZonesChange(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-sm font-medium text-gray-700">
                Rounded Corners
              </span>
              <input
                type="checkbox"
                checked={roundedCorners}
                onChange={(e) => onRoundedCornersChange(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-sm font-medium text-gray-700">
                Drop Shadow
              </span>
              <input
                type="checkbox"
                checked={dropShadow}
                onChange={(e) => onDropShadowChange(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <button
          onClick={onReset}
          className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Reset All
        </button>
      </div>
    </div>
  );
};
