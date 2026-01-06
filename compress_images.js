const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const directory = 'public/images';

async function processDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.log(`Directory ${dir} does not exist.`);
        return;
    }
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            await processDirectory(filePath);
        } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
            try {
                console.log(`Processing: ${filePath}`);
                // Read the file buffer to avoid locking issues if ensuring atomic writes
                const inputBuffer = fs.readFileSync(filePath);
                const image = sharp(inputBuffer);
                const metadata = await image.metadata();

                let shouldProcess = false;
                if (metadata.width > 2500 || metadata.size > 1000000) { // arbitrary threshold or just compress all
                    shouldProcess = true;
                }

                // Always compress to ensure quality reduction
                let processed = image;

                // Resize if too large
                if (metadata.width > 2500) {
                    processed = processed.resize({ width: 2500 });
                }

                // Rotate automatically based on EXIF (critical for the rotation issues we faced!)
                processed = processed.rotate();

                // Compress
                if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                    processed = processed.jpeg({ quality: 80, mozjpeg: true });
                } else if (metadata.format === 'png') {
                    processed = processed.png({ quality: 80, compressionLevel: 8 });
                } else if (metadata.format === 'webp') {
                    processed = processed.webp({ quality: 80 });
                }

                const buffer = await processed.toBuffer();
                fs.writeFileSync(filePath, buffer);
                console.log(`Compressed: ${filePath}`);
            } catch (err) {
                console.error(`Error processing ${filePath}:`, err.message);
            }
        }
    }
}

console.log('Starting compression...');
processDirectory(directory).then(() => console.log('All images compressed.'));
