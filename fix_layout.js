const fs = require('fs');
const path = 'c:\\Users\\MY HP\\.gemini\\antigravity\\scratch\\unicare\\src\\app\\dashboard\\layout.tsx';
const content = fs.readFileSync(path, 'utf8');
// Write a small script that we can use to patch the file
console.log('File length:', content.length);
