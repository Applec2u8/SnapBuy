import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src', 'pages', 'VendorDashboard', 'components', 'GuaranteePayment.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace faint print colors with black
content = content.replace(/print:text-slate-[4567]00/g, 'print:text-black');

// Update print borders to be darker
content = content.replace(/print:border-slate-[234]00/g, 'print:border-slate-800');

fs.writeFileSync(filePath, content);
console.log('Replaced print styles for darker text and borders.');
