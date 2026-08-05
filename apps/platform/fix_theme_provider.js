const fs = require('fs');
let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
layout = layout.replace('import { ThemeProvider } from "@/components/providers/theme-provider";\n', '');
layout = layout.replace('<ThemeProvider>', '');
layout = layout.replace('</ThemeProvider>', '');
fs.writeFileSync('src/app/layout.tsx', layout);

let dashLayout = fs.readFileSync('src/app/(dashboard)/layout.tsx', 'utf8');
if (!dashLayout.includes('ThemeProvider')) {
  dashLayout = dashLayout.replace('import { StoreProvider } from "@/hooks/use-store";', 'import { StoreProvider } from "@/hooks/use-store";\nimport { ThemeProvider } from "@/components/providers/theme-provider";');
  dashLayout = dashLayout.replace('<StoreProvider>', '<StoreProvider>\n      <ThemeProvider>');
  dashLayout = dashLayout.replace('</StoreProvider>', '  </ThemeProvider>\n    </StoreProvider>');
  fs.writeFileSync('src/app/(dashboard)/layout.tsx', dashLayout);
}

console.log("Moved ThemeProvider to dashboard layout inside StoreProvider");
