import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function imageToCompressedBase64(inputPath: string, maxWidth: number): Promise<string> {
  const buffer = fs.readFileSync(inputPath);
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.format) {
    throw new Error(`Cannot read image metadata for ${inputPath}`);
  }

  const targetWidth = Math.min(metadata.width, maxWidth);
  const targetHeight = Math.round((targetWidth / metadata.width) * (metadata.height || targetWidth));

  const resized = await image
    .resize(targetWidth, targetHeight, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer();

  const base64 = resized.toString('base64');
  return `data:image/jpeg;base64,${base64}`;
}

async function main() {
  const heroPath = path.join(process.cwd(), 'public', 'uploads', 'hero', 'hero-default.png');
  const aboutPath = path.join(process.cwd(), 'public', 'uploads', 'about', 'about-default.png');

  console.log('Compressing hero image...');
  const heroBase64 = await imageToCompressedBase64(heroPath, 1200);
  console.log(`Hero: ${Math.round(heroBase64.length / 1024)}KB (base64)`);

  console.log('Compressing about image...');
  const aboutBase64 = await imageToCompressedBase64(aboutPath, 800);
  console.log(`About: ${Math.round(aboutBase64.length / 1024)}KB (base64)`);

  const content = `export const HERO_IMAGE = \`${heroBase64}\`;
export const ABOUT_IMAGE = \`${aboutBase64}\`;
`;

  fs.writeFileSync(path.join(process.cwd(), 'prisma', 'seed-images.ts'), content);
  console.log('Done');
}

main().catch(console.error);