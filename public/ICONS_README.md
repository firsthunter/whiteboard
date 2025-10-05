# PWA Icons Placeholder

To complete your PWA setup, you need to add icon files in this directory.

## Required Icon Sizes

Create the following PNG files:

- `icon-192x192.png` - 192x192 pixels
- `icon-256x256.png` - 256x256 pixels
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels

## Quick Icon Generation

### Online Tools (Recommended)

1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator

   - Upload a square logo (512x512 or larger)
   - Download generated icons
   - Place in `/public` folder

2. **Favicon.io**: https://favicon.io
   - Generate from text, image, or emoji
   - Download and extract
   - Rename files to match required names

### Design Requirements

- **Format**: PNG with transparency
- **Background**: Solid color or transparent
- **Safe Area**: Keep important content within 80% of icon area
- **Contrast**: Ensure icon is visible on various backgrounds

## Icon Design Tips

### Colors

Use your brand colors:

- Primary: #3B82F6 (Blue)
- Background: White or transparent
- Text/Logo: High contrast color

### Content Ideas

- Letters: "WB" for White Board
- Symbol: Graduation cap, book, or chalkboard icon
- Logo: Your custom logo design

### Testing Icons

After adding icons:

1. Build the app: `npm run build`
2. Start production server: `npm run start`
3. Open Chrome DevTools > Application > Manifest
4. Verify all icons load correctly

## Current Placeholder

The manifest.json currently references these icons. Make sure to create them or update the manifest.json file to point to your actual icons.

## Apple Touch Icon

Also create `apple-touch-icon.png` (180x180) for iOS devices.

## Example: Simple Icon Creation

If you want a quick placeholder, you can create a simple colored square with text:

1. Open any image editor (Photoshop, Figma, Canva, etc.)
2. Create a 512x512 canvas
3. Fill with solid color (#3B82F6)
4. Add "WB" text in white, centered
5. Export as PNG
6. Use online tool to generate other sizes

Then replace these placeholders with professional icons when ready.
