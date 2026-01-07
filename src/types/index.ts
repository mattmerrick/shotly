export type BackgroundType = 'solid' | 'gradient';

export type SolidColor = {
  id: string;
  name: string;
  color: string;
};

export type GradientColor = {
  id: string;
  name: string;
  colors: string[];
  direction: 'vertical' | 'horizontal';
};

export const solidColors: SolidColor[] = [
  { id: 'white', name: 'White', color: '#FFFFFF' },
  { id: 'black', name: 'Black', color: '#000000' },
  { id: 'gray-light', name: 'Light Gray', color: '#F5F5F5' },
  { id: 'gray-dark', name: 'Dark Gray', color: '#2C2C2C' },
  { id: 'blue', name: 'Blue', color: '#007AFF' },
  { id: 'purple', name: 'Purple', color: '#AF52DE' },
  { id: 'pink', name: 'Pink', color: '#FF2D55' },
  { id: 'orange', name: 'Orange', color: '#FF9500' },
  { id: 'green', name: 'Green', color: '#34C759' },
  { id: 'red', name: 'Red', color: '#FF3B30' },
];

export const gradientColors: GradientColor[] = [
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#FF6B6B', '#FFE66D'],
    direction: 'vertical',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#4ECDC4', '#44A3D3'],
    direction: 'vertical',
  },
  {
    id: 'purple-dream',
    name: 'Purple Dream',
    colors: ['#667EEA', '#764BA2'],
    direction: 'vertical',
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: ['#134E5E', '#71B280'],
    direction: 'vertical',
  },
  {
    id: 'fire',
    name: 'Fire',
    colors: ['#F09819', '#EDDE5D'],
    direction: 'vertical',
  },
  {
    id: 'cool-blue',
    name: 'Cool Blue',
    colors: ['#2193B0', '#6DD5ED'],
    direction: 'vertical',
  },
  {
    id: 'pink-purple',
    name: 'Pink Purple',
    colors: ['#F093FB', '#F5576C'],
    direction: 'vertical',
  },
  {
    id: 'dark-night',
    name: 'Dark Night',
    colors: ['#0C0C0C', '#1A1A2E'],
    direction: 'vertical',
  },
];
