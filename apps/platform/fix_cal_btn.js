const fs = require('fs');
let headerCode = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

if (!headerCode.includes('useRouter')) {
  headerCode = headerCode.replace(
    'import { usePathname } from "next/navigation";',
    'import { usePathname, useRouter } from "next/navigation";'
  );
}

if (!headerCode.includes('const { planejamentos, addEvento }')) {
  headerCode = headerCode.replace(
    'const { planejamentos } = useStore();',
    'const { planejamentos, addEvento } = useStore();'
  );
}

if (!headerCode.includes('const router = useRouter();')) {
  headerCode = headerCode.replace(
    'const pathname = usePathname();',
    'const pathname = usePathname();\n  const router = useRouter();'
  );
}

const addEventoStr = `  const handleAddEvento = () => {
    const titulo = window.prompt("Qual o título do evento?");
    if (titulo) {
      addEvento({
        titulo,
        data: viewDate.toISOString(),
        alarme: true,
        notificacao: true
      });
      setIsCalendarOpen(false);
      router.push("/calendario");
    }
  };`;

if (!headerCode.includes('handleAddEvento')) {
  headerCode = headerCode.replace(
    'const handleNextMonth = (e: React.MouseEvent) => {',
    addEventoStr + '\n\n  const handleNextMonth = (e: React.MouseEvent) => {'
  );
}

headerCode = headerCode.replace(
  '<button className="w-full mt-4 flex items-center justify-center gap-2 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20 py-2.5 rounded-xl text-sm font-medium transition-colors">',
  '<button onClick={handleAddEvento} className="w-full mt-4 flex items-center justify-center gap-2 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20 py-2.5 rounded-xl text-sm font-medium transition-colors">'
);

fs.writeFileSync('src/components/layout/Header.tsx', headerCode);
console.log("Button handler added");
