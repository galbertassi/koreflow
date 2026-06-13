const fs = require('fs');
let headerCode = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

if (!headerCode.includes('import { useState, useEffect }')) {
  headerCode = headerCode.replace(
    'import { format } from "date-fns";',
    'import { useState, useEffect } from "react";\nimport { format } from "date-fns";'
  );
}

if (!headerCode.includes('Clock')) {
  headerCode = headerCode.replace(
    'ChevronDown } from "lucide-react";',
    'ChevronDown, Clock, ChevronLeft, ChevronRight } from "lucide-react";'
  );
}

const newBody = `
  const [time, setTime] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const daysInMonth = new Date(time.getFullYear(), time.getMonth() + 1, 0).getDate();
  const firstDay = new Date(time.getFullYear(), time.getMonth(), 1).getDay();
  const days = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));
`;

headerCode = headerCode.replace(
  'const currentDate = new Date();\n  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);\n  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);',
  newBody
);

const newDropdown = `        {/* Data e Hora */}
        <div className="relative">
          <button 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="hidden md:flex flex-col justify-center px-5 py-3 bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-border/50 hover:bg-secondary/20 transition-colors text-left"
          >
            <span className="text-[12px] font-medium text-sidebar-foreground/60 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Data e Hora
            </span>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-[18px] w-[18px] text-sidebar-foreground/70" strokeWidth={1.5} />
                <span className="text-[15px] font-medium text-sidebar-foreground tracking-tight flex items-center gap-2">
                  {format(time, "dd MMM yyyy", { locale: ptBR })} 
                  <span className="font-normal text-sidebar-foreground/40">|</span> 
                  {format(time, "HH:mm")}
                </span>
              </div>
              <ChevronDown className={\`h-4 w-4 text-sidebar-foreground/50 transition-transform \${isCalendarOpen ? "rotate-180" : ""}\`} />
            </div>
          </button>

          {isCalendarOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-80 bg-white rounded-2xl shadow-xl border border-border/50 p-4 z-50">
              <div className="flex items-center justify-between mb-4">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary"><ChevronLeft className="w-4 h-4" /></button>
                <span className="font-semibold capitalize text-sm">{format(time, "MMMM yyyy", { locale: ptBR })}</span>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary"><ChevronRight className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                  <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => (
                  <button 
                    key={i} 
                    disabled={!d}
                    className={\`h-9 rounded-lg text-sm flex items-center justify-center transition-colors \${
                      !d ? "" : 
                      d === time.getDate() ? "bg-[#8B5CF6] text-white font-bold shadow-md" : 
                      "hover:bg-secondary text-foreground"
                    }\`}
                  >
                    {d || ""}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Horário Atual</span>
                <span className="text-sm font-bold text-[#8B5CF6]">{format(time, "HH:mm:ss")}</span>
              </div>
            </div>
          )}
        </div>`;

headerCode = headerCode.replace(
  /<div className="hidden md:flex flex-col justify-center px-5 py-3[\s\S]*?<\/div>\n        <\/div>/,
  newDropdown
);

fs.writeFileSync('src/components/layout/Header.tsx', headerCode);
console.log("Updated Header with live clock and calendar popup");
