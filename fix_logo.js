const fs = require('fs');

let sidebarCode = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const oldLogoArea = `      {/* Logo Area */}
      <div className="px-6 py-8 flex flex-col items-center justify-center gap-0">
        <div className="flex items-center justify-center w-full">
          <Image src="/favicon_kore.svg" alt="KORE FLOW" width={160} height={160} className="object-contain" priority />
        </div>
        <h1 className="font-medium tracking-[0.15em] text-lg uppercase leading-none text-sidebar-foreground/90 -mt-4">Kore Flow</h1>
      </div>`;

const newLogoArea = `      {/* Logo Area */}
      <div className="px-6 py-8 flex flex-col items-center justify-center gap-0">
        <div className="flex items-center justify-center w-full">
          <Image src="/KOREFLOW.svg" alt="KORE FLOW" width={180} height={60} className="object-contain" priority />
        </div>
      </div>`;

if (sidebarCode.includes(oldLogoArea)) {
  sidebarCode = sidebarCode.replace(oldLogoArea, newLogoArea);
  fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebarCode);
  console.log('Logo substituída com sucesso no Sidebar!');
} else {
  console.log('Não foi possível encontrar o bloco da logo no arquivo. Talvez já tenha sido alterado?');
}
