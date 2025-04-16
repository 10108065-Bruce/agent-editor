// scripts/add-nojekyll.js
import { writeFileSync, mkdirSync } from 'fs';

mkdirSync('dist', { recursive: true });
writeFileSync('dist/.nojekyll', '');
console.log('✅ .nojekyll created in dist/');
