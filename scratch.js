import fs from 'fs';
const appJsContent = fs.readFileSync('./public/app.js', 'utf8');
const match = appJsContent.match(/function createHomeOverview\(\) \{([\s\S]*?)return section;/);
console.log(match[1]);
