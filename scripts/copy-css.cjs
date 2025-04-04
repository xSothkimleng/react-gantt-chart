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

// Get the main style file
const styleFile = path.resolve(__dirname, '../style.css');
const mainStyleContent = fs.readFileSync(styleFile, 'utf8');

// Process any theme.css or other CSS files referenced by your components
const themeFile = path.resolve(__dirname, '../src/styles/theme.css');
let processedCSS = '';

if (fs.existsSync(themeFile)) {
  processedCSS += processCSS(themeFile) + '\n';
}

// Add the main style.css content
processedCSS += mainStyleContent;

// Write the consolidated styles to the dist directory
fs.writeFileSync(path.resolve(distDir, 'style.css'), processedCSS);
console.log('Successfully copied and processed CSS to dist directory');
