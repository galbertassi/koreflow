const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// The nav item for metas might look like { name: "Metas", href: "/metas", icon: Target },
// Let's just find and comment it out or remove it using a regex.
code = code.replace(/\{[^}]*name:\s*["']Metas["'][^}]*\},\s*/g, '');

fs.writeFileSync('src/components/layout/Sidebar.tsx', code, 'utf8');
console.log('Metas removed from sidebar');
