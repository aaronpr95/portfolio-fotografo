import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../public/images-optimized');

// Crear carpeta de salida
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Configuración de optimización
const MAX_WIDTH = 1920;  // Ancho máximo para galería
const QUALITY = 80;      // Calidad JPEG (80 es buen balance)

async function optimizeImage(filename) {
  const inputPath = path.join(imagesDir, filename);
  const outputPath = path.join(outputDir, filename);
  
  // Ignorar archivos que no son imágenes
  if (!filename.match(/\.(jpg|jpeg|png)$/i)) {
    return;
  }

  try {
    const stats = fs.statSync(inputPath);
    const sizeBefore = (stats.size / 1024 / 1024).toFixed(2);

    await sharp(inputPath)
      .resize(MAX_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: QUALITY,
        progressive: true,
        mozjpeg: true 
      })
      .toFile(outputPath);

    const statsAfter = fs.statSync(outputPath);
    const sizeAfter = (statsAfter.size / 1024 / 1024).toFixed(2);
    const reduction = ((1 - statsAfter.size / stats.size) * 100).toFixed(1);

    console.log(`✅ ${filename}`);
    console.log(`   Antes: ${sizeBefore}MB → Después: ${sizeAfter}MB (${reduction}% reducción)`);
  } catch (error) {
    console.error(`❌ Error procesando ${filename}:`, error.message);
  }
}

async function optimizeAll() {
  console.log('🖼️  Optimizando imágenes...\n');
  
  const files = fs.readdirSync(imagesDir);
  
  for (const file of files) {
    await optimizeImage(file);
  }
  
  console.log('\n✨ ¡Optimización completada!');
  console.log(`📁 Imágenes optimizadas en: ${outputDir}`);
  console.log('\n📝 Próximo paso:');
  console.log('   1. Revisa las imágenes optimizadas');
  console.log('   2. Si se ven bien, reemplaza las originales:');
  console.log('      rm -rf public/images/*.jpg');
  console.log('      mv public/images-optimized/* public/images/');
  console.log('      rm -rf public/images-optimized');
}

optimizeAll();
