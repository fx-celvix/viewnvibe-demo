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
        } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
            // Skip if filename is already webp (e.g. accidentally named image.webp.jpg? Unlikely but safe)

            const ext = path.extname(file);
            const newFilePath = filePath.substring(0, filePath.lastIndexOf(ext)) + '.webp';

            try {
                console.log(`Converting: ${filePath} -> ${newFilePath}`);

                await sharp(filePath)
                    .rotate() // Auto-rotate fixes orientation
                    .resize({ width: 1920, withoutEnlargement: true }) // Max width 1920 for web
                    .webp({ quality: 75, effort: 4 }) // Effort 4 is balanced speed/compression
                    .toFile(newFilePath);

                // Verify new file exists and has size
                if (fs.existsSync(newFilePath) && fs.statSync(newFilePath).size > 0) {
                    fs.unlinkSync(filePath); // Delete original
                    console.log(`Deleted original: ${filePath}`);
                }
            } catch (err) {
                console.error(`Error processing ${filePath}:`, err.message);
            }
        }
    }
}

console.log('Starting conversion to WebP...');
processDirectory(directory).then(() => console.log('All images converted to WebP.'));
