// scripts/copy-css.js
const fs = require('fs');
const path = require('path');

// Ensure the dist directory exists
const distDir = path.resolve(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy the style.css file to the dist directory
const styleSrc = path.resolve(__dirname, '../style.css');
const styleDest = path.resolve(distDir, 'style.css');

try {
  if (fs.existsSync(styleSrc)) {
    // Read the source file
    const cssContent = fs.readFileSync(styleSrc, 'utf8');
    // Write to the destination
    fs.writeFileSync(styleDest, cssContent);
    console.log('Successfully copied style.css to dist directory');
  } else {
    console.error('Source style.css file does not exist');
    process.exit(1);
  }
} catch (error) {
  console.error('Error copying CSS file:', error);
  process.exit(1);
}
