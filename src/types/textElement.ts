export type TextElement = {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number | string;
  fill: string;
  maxWidth: number;
  align: 'left' | 'center' | 'right';
  lineHeight: number;
  draggable: boolean;
  // Locale-specific text translations
  translations?: Record<string, string>; // key: locale code (e.g., 'en', 'es', 'fr'), value: translated text
};

export const FONT_FAMILIES = [
  { value: 'system-ui, -apple-system, sans-serif', label: 'System (SF Pro)' },
  { value: 'Helvetica Neue, Helvetica, Arial, sans-serif', label: 'Helvetica Neue' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, Times, serif', label: 'Times New Roman' },
  { value: 'Courier New, Courier, monospace', label: 'Courier New' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Impact, Charcoal, sans-serif', label: 'Impact' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
];

export const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' },
];

export const DEFAULT_TEXT_ELEMENT: Omit<TextElement, 'id'> = {
  text: 'Your Text Here',
  x: 121,
  y: 200,
  fontSize: 48,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontWeight: 700,
  fill: '#000000',
  maxWidth: 1000,
  align: 'left',
  lineHeight: 1.2,
  draggable: true,
};

