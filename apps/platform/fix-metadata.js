const fs = require('fs');

let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');

layout = layout.replace(
  /export const metadata: Metadata = \{[\s\S]*?title: "KORE FLOW",[\s\S]*?description: "Sistema operacional pessoal premium",\s*\};/,
  `export const metadata: Metadata = {
  title: "KORE FLOW | Operations & Workflow",
  description: "Sistema operacional pessoal premium",
  icons: {
    icon: "/flow-navegador.svg",
  },
};`
);

fs.writeFileSync('src/app/layout.tsx', layout);
