const fs = require('fs');

// Patch Layout.tsx
const layoutFile = './apps/luminaview-manager/src/components/Layout.tsx';
let layoutCode = fs.readFileSync(layoutFile, 'utf8');
if (!layoutCode.includes('getAppUrl')) {
  layoutCode = layoutCode.replace(
    "import { Link, useLocation } from 'react-router-dom';",
    "import { Link, useLocation } from 'react-router-dom';\nimport { getAppUrl } from '../utils/urls';"
  );
  layoutCode = layoutCode.replace(
    "href={`http://localhost:8081/?user=${user.name.toLowerCase()}`}",
    "href={getAppUrl('blog', user.name)}"
  );
  fs.writeFileSync(layoutFile, layoutCode);
}

// Patch BlogManager.tsx
const blogFile = './apps/luminaview-manager/src/pages/BlogManager.tsx';
let blogCode = fs.readFileSync(blogFile, 'utf8');
if (!blogCode.includes('getAppUrl')) {
  blogCode = blogCode.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { getAppUrl } from '../utils/urls';"
  );
  blogCode = blogCode.replace(
    "return `http://localhost:8081/?user=${slug}`;",
    "return getAppUrl('blog', slug);"
  );
  fs.writeFileSync(blogFile, blogCode);
}

// Patch PortfolioPage.tsx
const portfolioFile = './apps/luminaview-manager/src/pages/PortfolioPage.tsx';
let portfolioCode = fs.readFileSync(portfolioFile, 'utf8');
if (!portfolioCode.includes('getAppUrl')) {
  portfolioCode = portfolioCode.replace(
    "import React, { useState, useEffect, useCallback } from 'react';",
    "import React, { useState, useEffect, useCallback } from 'react';\nimport { getAppUrl } from '../utils/urls';"
  );
  portfolioCode = portfolioCode.replace(
    "href={user?.name\n    ? `http://localhost:8081/?user=${name}`",
    "href={user?.name\n    ? getAppUrl('blog', name)"
  );
  portfolioCode = portfolioCode.replace(
    "window.location.href = `http://localhost:8090`;",
    "window.location.href = getAppUrl('portfolio', user?.name || 'jac');"
  );
  fs.writeFileSync(portfolioFile, portfolioCode);
}

