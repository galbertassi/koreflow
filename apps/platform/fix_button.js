const fs = require('fs');
let file = fs.readFileSync('src/app/(dashboard)/planejamento/[id]/page.tsx', 'utf8');

// Update button styling to be disabled/primary
file = file.replace(
  '<button onClick={handleAddCliente} className="w-full py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-xs font-semibold transition-colors flex justify-center items-center gap-1">',
  '<button onClick={handleAddCliente} disabled={!novoCliente.trim()} className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors flex justify-center items-center gap-1 ${novoCliente.trim() ? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]" : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed"}`}>'
);

// Update useEffect to ALWAYS select the last client if we add a new one
file = file.replace(
  '  useEffect(() => {\n    if (pl && pl.clientes.length > 0 && !activeClienteId) {\n      setActiveClienteId(pl.clientes[pl.clientes.length - 1].id);\n    }\n  }, [pl?.clientes.length]);',
  '  useEffect(() => {\n    if (pl && pl.clientes.length > 0) {\n      // Always select the newest client if length changes\n      setActiveClienteId(pl.clientes[pl.clientes.length - 1].id);\n    }\n  }, [pl?.clientes.length]);'
);

fs.writeFileSync('src/app/(dashboard)/planejamento/[id]/page.tsx', file);
console.log('Fixed button and auto-selection');
