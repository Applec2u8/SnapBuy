const fs = require('fs');
const path = require('path');

const dir = 'd:/Dev/clone/SnapBuy/src/pages/VendorDashboard/components';

function traverseDir(d) {
  const files = fs.readdirSync(d);
  files.forEach(file => {
    const fullPath = path.join(d, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      // Fix supabase
      content = content.replace(/from '\.\.\/\.\.\/\.\.\/lib\/supabase'/g, "from '../../../../lib/supabase'");
      
      // Fix useAuthStore
      content = content.replace(/from '\.\.\/\.\.\/\.\.\/store\/useAuthStore'/g, "from '../../../../store/useAuthStore'");
      
      // Fix Skeleton
      content = content.replace(/from '\.\.\/\.\.\/\.\.\/components\/ui\/(.*?)'/g, "from '../../../../components/ui/$1'");

      // Also there might be some sibling imports like:
      // import { ... } from '../utils/...' or from '../hooks/...'
      // Wait, in `VendorQuota.tsx` there was `../utils/quotaHelpers`. I manually fixed it in `VendorQuota` to `../../utils`.
      // What about other files? Let's check imports that were `./something` which should now be `../something`.
      
      fs.writeFileSync(fullPath, content);
    }
  });
}

traverseDir(dir);
console.log('Fixed imports in components');
