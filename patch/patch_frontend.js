const fs = require('fs');
const file = './apps/chambre-noire/src/pages/CarnetDeRoutesPage.tsx';
let code = fs.readFileSync(file, 'utf8');

// We need to import getSubdomain
if (!code.includes('getSubdomain')) {
  code = code.replace(
    "import remarkGfm from 'remark-gfm';",
    "import remarkGfm from 'remark-gfm';\nimport { getSubdomain } from '../utils/domain';"
  );
}

// And pass it to the fetch queries
code = code.replace(
  "fetch('/api/projects/public/all').then(r => r.json()),",
  "fetch(`/api/projects/public/all?user=${getSubdomain() || 'jac'}`).then(r => r.json()),"
);

code = code.replace(
  "fetch('/api/photos/public/standalone').then(r => r.json()),",
  "fetch(`/api/photos/public/standalone?user=${getSubdomain() || 'jac'}`).then(r => r.json()),"
);

code = code.replace(
  "fetch('/api/users/public/profile').then(r => r.json()).catch(() => null),",
  "fetch(`/api/users/public/profile?user=${getSubdomain() || 'jac'}`).then(r => r.json()).catch(() => null),"
);

fs.writeFileSync(file, code);
