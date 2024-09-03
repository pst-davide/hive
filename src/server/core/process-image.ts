import sharp from 'sharp';

export async function preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    return sharp(imageBuffer)
    .greyscale() // Converti in scala di grigi
    .normalize() // Migliora il contrasto
    .toBuffer();
}