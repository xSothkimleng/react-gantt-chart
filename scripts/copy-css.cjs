// scripts/copy-css.cjs
const fs = require('fs');
const path = require('path');

// Helper function to read and process CSS files
function processCSS(filePath) {
  const css = fs.readFileSync(filePath, 'utf8');

  // Replace @import statements with the contents of the imported files
  return css.replace(/@import '([^']+)';/g, (match, importPath) => {
    const resolvedPath = path.resolve(path.dirname(filePath), importPath);
    if (fs.existsSync(resolvedPath)) {
      return processCSS(resolvedPath);
    }
    return match; // Keep the import if the file doesn't exist
  });
}

// Ensure the dist directory exists
const distDir = path.resolve(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Process the main styles/index.css file which should import all other CSS files
const indexCssFile = path.resolve(__dirname, '../src/styles/index.css');
let processedCSS = '';

if (fs.existsSync(indexCssFile)) {
  processedCSS += processCSS(indexCssFile);
}

// Add any additional CSS not captured by imports
const styleFile = path.resolve(__dirname, '../style.css');
if (fs.existsSync(styleFile)) {
  const styleContent = fs.readFileSync(styleFile, 'utf8');
  processedCSS += '\n' + styleContent;
}

// Write the consolidated styles to the dist directory
fs.writeFileSync(path.resolve(distDir, 'style.css'), processedCSS);
console.log('Successfully copied and processed CSS to dist directory');
