import { TextElement } from './textElement';
import { ImageElement } from './imageElement';
import { BackgroundType } from './index';
import { LocalizedText } from './locale';

export type ScreenshotImage = {
  id: string;
  image: HTMLImageElement;
  element: ImageElement;
};

export type Screenshot = {
  id: string;
  name: string;
  screenshotImages: ScreenshotImage[]; // Multiple images per screenshot
  textElements: TextElement[];
  localizedTexts: LocalizedText[]; // Locale-specific text variations
  backgroundType: BackgroundType;
  solidColor: string;
  gradientId: string;
  roundedCorners: boolean;
  dropShadow: boolean;
};

export const createEmptyScreenshot = (id: string, name: string): Screenshot => ({
  id,
  name,
  screenshotImages: [],
  textElements: [],
  localizedTexts: [
    { locale: 'en', headline: '', subtext: '' }, // Default locale
  ],
  backgroundType: 'solid',
  solidColor: '#FFFFFF',
  gradientId: 'sunset',
  roundedCorners: true,
  dropShadow: true,
});
