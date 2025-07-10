const sharp = require('sharp');
const path = require('path');

async function optimizeImage(inputPath, outputPath, quality = 80) {
  try {
    await sharp(inputPath)
      .png({ quality })
      .toFile(outputPath);
    console.log(`Optimized ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error);
  }
}

async function optimizeMachInterviewImages() {
  const imagesDir = 'public/images/projects/machinterview';
  
  // Optimize machlanding.png
  await optimizeImage(
    path.join(imagesDir, 'machlanding.png'),
    path.join(imagesDir, 'machlanding-optimized.png'),
    70
  );
  
  // Optimize machinterview.png
  await optimizeImage(
    path.join(imagesDir, 'machinterview.png'),
    path.join(imagesDir, 'machinterview-optimized.png'),
    70
  );
  
  console.log('Image optimization complete!');
}

optimizeMachInterviewImages(); 