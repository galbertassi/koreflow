const fs = require('fs');
let page = fs.readFileSync('src/app/(dashboard)/page.tsx', 'utf8');

// Fix demands extra filter
page = page.replace(
  'const demandasExtras = execucoes.filter(e => e.categoria.toLowerCase().includes("urgente") || e.categoria.toLowerCase().includes("extra"));',
  'const demandasExtras = execucoes.filter(e => e.tipoPlanejamento === "Demanda Extra" || e.categoria.toLowerCase().includes("urgente") || e.categoria.toLowerCase().includes("extra"));'
);

// Fix totalVal for chart
page = page.replace(
  'const chartData = [',
  'const totalValChart = entregues + producao + aguardando + extras + risco || 1;\n  const chartData = ['
);

// Fix chart slice offset
page = page.replace(
  'offset: offsetAcc',
  'offset: 0'
);
page = page.replace(
  'offset: (offsetAcc += entregues)',
  'offset: entregues'
);
page = page.replace(
  'offset: (offsetAcc += producao)',
  'offset: entregues + producao'
);
page = page.replace(
  'offset: (offsetAcc += aguardando)',
  'offset: entregues + producao + aguardando'
);
page = page.replace(
  'offset: (offsetAcc += extras)',
  'offset: entregues + producao + aguardando + extras'
);

// Fix svg strokes
page = page.replace(
  'const strokeDasharray = getStrokeDashArray(d.value, execucoes.length, circumference);',
  'const strokeDasharray = getStrokeDashArray(d.value, totalValChart, circumference);'
);
page = page.replace(
  'const strokeDashoffset = getStrokeDashOffset(d.offset, execucoes.length, circumference);',
  'const strokeDashoffset = getStrokeDashOffset(d.offset, totalValChart, circumference);'
);

// Fix table label "Previsto"
page = page.replace(
  '<span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Previsto</span>',
  '<span className={`text-[10px] font-bold px-2 py-1 rounded ${e.tipoPlanejamento === "Demanda Extra" ? "text-orange-500 bg-orange-500/10" : "text-emerald-500 bg-emerald-500/10"}`}>\n                        {e.tipoPlanejamento || "Previsto"}\n                      </span>'
);

fs.writeFileSync('src/app/(dashboard)/page.tsx', page);
console.log('Dashboard updated');
