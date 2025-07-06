import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const criticalImages = [
  'a3236bd1-0ba5-41b5-a422-ef2a60c43cd4.png', // Old Ganesha
  'f002c96a-d091-4373-9cc7-72487af38606.png', // Couple caricature
  'b0b6e6c1-770d-4a6e-8f9c-7f3bdcd7c3a4.png'  // New Ganesha (transparent)
];

const inputDir = path.join(__dirname, '../public/lovable-uploads');
const outputDir = path.join(__dirname, '../public/lovable-uploads');

async function optimizeImages() {
  console.log('Starting image optimization...');
  
  for (const imageName of criticalImages) {
    const inputPath = path.join(inputDir, imageName);
    const baseName = path.parse(imageName).name;
    
    try {
      // Create WebP version
      const webpPath = path.join(outputDir, `${baseName}.webp`);
      await sharp(inputPath)
        .webp({ quality: 85, effort: 6 })
        .toFile(webpPath);
      console.log(`✅ Created WebP: ${baseName}.webp`);
      
      // Create low-quality placeholder (10% quality, 20px width)
      const placeholderPath = path.join(outputDir, `${baseName}-placeholder.jpg`);
      await sharp(inputPath)
        .resize(20, null, { withoutEnlargement: true })
        .jpeg({ quality: 10, progressive: true })
        .blur(0.5)
        .toFile(placeholderPath);
      console.log(`✅ Created placeholder: ${baseName}-placeholder.jpg`);
      
      // Create medium quality version for faster loading
      const mediumPath = path.join(outputDir, `${baseName}-medium.webp`);
      await sharp(inputPath)
        .resize(400, null, { withoutEnlargement: true })
        .webp({ quality: 70, effort: 4 })
        .toFile(mediumPath);
      console.log(`✅ Created medium quality: ${baseName}-medium.webp`);
      
    } catch (error) {
      console.error(`❌ Error processing ${imageName}:`, error.message);
    }
  }
  
  console.log('Image optimization complete!');
}

// Check if sharp is available
try {
  await import('sharp');
  optimizeImages();
} catch (error) {
  console.log('Sharp not found. Installing dependencies...');
  console.log('Please run: npm install sharp');
  console.log('Then run: node scripts/optimize-images.js');
} 