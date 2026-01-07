export type IphoneModel = {
  id: string;
  label: string;
  width: number;
  height: number;
};

export const IPHONE_MODELS: IphoneModel[] = [
  { id: 'iphone_67', label: 'iPhone 6.7″', width: 1290, height: 2796 },
  { id: 'iphone_65', label: 'iPhone 6.5″', width: 1242, height: 2688 },
  { id: 'iphone_61', label: 'iPhone 6.1″', width: 1170, height: 2532 },
  { id: 'iphone_55', label: 'iPhone 5.5″', width: 1242, height: 2208 },
];

// Canonical size (design size)
export const CANONICAL_WIDTH = 1242;
export const CANONICAL_HEIGHT = 2688;

