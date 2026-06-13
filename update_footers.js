const fs = require('fs');
let code = fs.readFileSync('src/app/login/page.tsx', 'utf8');

// Replace left column footer
code = code.replace(
  /<p className="hidden lg:block text-xs tracking-widest" style={{ color: "#C0C0C0" }}>\s*POWERED BY KORE \| DIGITAL EXPERIENCES\s*<\/p>/g,
  `<p className="hidden lg:block text-xs tracking-widest" style={{ color: "#C0C0C0" }}>\n            &copy; 2026 KORE. Todos os direitos reservados.\n          </p>`
);

// Replace right column footer
code = code.replace(
  /<p className="text-center text-xs tracking-widest" style={{ color: "#C0C0C0" }}>\s*POWERED BY KORE \| DIGITAL EXPERIENCES\s*<\/p>/g,
  `<p className="text-center text-xs tracking-widest" style={{ color: "#C0C0C0" }}>\n                Powered By KORE | Digital Experiences\n              </p>`
);

fs.writeFileSync('src/app/login/page.tsx', code, 'utf8');
console.log('Updated footers!');
