# Shotly

A web app for creating iPhone App Store preview screenshots with a locked canvas (1242 × 2688 pixels) and preset layouts.

## Features

- **Locked Canvas Size**: 1242 × 2688 pixels (iPhone App Store standard)
- **Interactive Grid Editor**: Edit up to 5 screenshots directly in the grid preview
- **Drag & Resize**: Move and resize images and text elements directly on the canvas
- **Multiple Text Elements**: Add multiple text boxes with custom fonts, sizes, and colors
- **Background Options**: Solid colors or gradients
- **Safe Zone Guides**: Visual guides for content placement
- **Export Options**: Export individual PNGs or batch export all sizes as ZIP
- **Multi-Locale Support**: Create localized versions of your screenshots

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Option 2: Deploy via GitHub

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect it's a Vite project
6. Click "Deploy"

The `vercel.json` file is already configured for optimal Vercel deployment.

### Vercel Configuration

The project includes a `vercel.json` file with:
- Build command: `npm run build`
- Output directory: `dist`
- SPA routing support (all routes redirect to index.html)

## Usage

1. **Select a Slide**: Click on one of the 5 slide slots in the grid
2. **Upload Image**: Click "Upload Image" in the left sidebar
3. **Edit Image**: Click the image in the grid preview to select it, then drag to move or drag corners to resize
4. **Add Text**: Click "Add Text" in the left sidebar, then click the text in the grid to edit it
5. **Customize**: Use the left sidebar to change backgrounds, fonts, colors, and more
6. **Export**: Use the right sidebar to export PNG or ZIP files

## Project Structure

```
src/
├── components/          # React components
│   ├── CanvasStage.tsx # Main canvas editor
│   ├── ScreenshotGrid.tsx # Grid preview/editor
│   ├── SidebarLeft.tsx # Controls sidebar
│   └── SidebarRight.tsx # Preview & export sidebar
├── config/             # Configuration files
│   ├── iphoneModels.ts # iPhone model sizes
│   └── locales.ts      # Locale definitions
├── presets/            # Layout presets
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
    ├── exportPng.ts    # PNG export
    └── exportZip.ts    # ZIP batch export
```

## Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Konva.js** - Canvas rendering
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## License

MIT
