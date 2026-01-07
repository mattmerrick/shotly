import React from 'react';
import { TextElement, FONT_FAMILIES, FONT_WEIGHTS } from '../types/textElement';

interface TextElementEditorProps {
  element: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
  onDelete: () => void;
  isSelected: boolean;
}

export const TextElementEditor: React.FC<TextElementEditorProps> = ({
  element,
  onUpdate,
  onDelete,
  isSelected,
}) => {
  return (
    <div
      className={`p-4 border-2 rounded-lg mb-3 transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Text Element</h3>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Delete
        </button>
      </div>

      {/* Text Input */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Text
        </label>
        <textarea
          value={element.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Enter your text"
        />
      </div>

      {/* Font Family */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Font Family
        </label>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size & Weight */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Font Size
          </label>
          <input
            type="number"
            value={element.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 12 })}
            min="12"
            max="200"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Font Weight
          </label>
          <select
            value={String(element.fontWeight)}
            onChange={(e) => onUpdate({ fontWeight: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FONT_WEIGHTS.map((weight) => (
              <option key={weight.value} value={weight.value}>
                {weight.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Text Color */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Text Color
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={element.fill}
            onChange={(e) => onUpdate({ fill: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Alignment */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Alignment
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => onUpdate({ align })}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                element.align === align
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Max Width */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Max Width: {element.maxWidth}px
        </label>
        <input
          type="range"
          value={element.maxWidth}
          onChange={(e) => onUpdate({ maxWidth: parseInt(e.target.value) })}
          min="200"
          max="1200"
          className="w-full"
        />
      </div>
    </div>
  );
};

