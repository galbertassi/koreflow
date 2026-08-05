const fs = require('fs');

// Update login page
let loginCode = fs.readFileSync('src/app/login/page.tsx', 'utf8');
const oldLoginLogo = `width={160}
              height={44}`;
const newLoginLogo = `width={220}
              height={60}`;

if (loginCode.includes(oldLoginLogo)) {
  loginCode = loginCode.replace(oldLoginLogo, newLoginLogo);
  fs.writeFileSync('src/app/login/page.tsx', loginCode, 'utf8');
  console.log('Login logo resized!');
} else {
  // Let's try inline replace for login page just in case
  const oldLoginLogoInline = `width={160} height={44}`;
  const newLoginLogoInline = `width={220} height={60}`;
  if (loginCode.includes(oldLoginLogoInline)) {
     loginCode = loginCode.replace(oldLoginLogoInline, newLoginLogoInline);
     fs.writeFileSync('src/app/login/page.tsx', loginCode, 'utf8');
     console.log('Login logo resized (inline)!');
  } else {
     console.log('Login logo snippet not found.');
  }
}

// Update sidebar
let sidebarCode = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
const oldSidebarLogo = `width={180} height={60}`;
const newSidebarLogo = `width={240} height={80}`;

if (sidebarCode.includes(oldSidebarLogo)) {
  sidebarCode = sidebarCode.replace(oldSidebarLogo, newSidebarLogo);
  fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebarCode, 'utf8');
  console.log('Sidebar logo resized!');
} else {
  console.log('Sidebar logo snippet not found.');
}
