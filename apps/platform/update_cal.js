const fs = require('fs');

let headerCode = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

if (!headerCode.includes('PlusCircle')) {
  headerCode = headerCode.replace(
    'ChevronRight } from "lucide-react";',
    'ChevronRight, PlusCircle } from "lucide-react";'
  );
}

// We need to inject the viewDate state right after isCalendarOpen state
const oldStateStr = `  const [time, setTime] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);`;

const newStateStr = `  const [time, setTime] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };`;

headerCode = headerCode.replace(oldStateStr, newStateStr);

const oldDaysLogic = `  const daysInMonth = new Date(time.getFullYear(), time.getMonth() + 1, 0).getDate();
  const firstDay = new Date(time.getFullYear(), time.getMonth(), 1).getDay();
  const days = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));`;

const newDaysLogic = `  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array(firstDay).fill(null).concat(Array.from({length: daysInMonth}, (_, i) => i + 1));
  
  const isToday = (d: number | null) => d === time.getDate() && viewDate.getMonth() === time.getMonth() && viewDate.getFullYear() === time.getFullYear();`;

headerCode = headerCode.replace(oldDaysLogic, newDaysLogic);

// Now update the JSX part
// Find the <div className="flex items-center justify-between mb-4">...</div> and the days map
const oldJSXStr = `            <div className="absolute top-[calc(100%+8px)] right-0 w-80 bg-white rounded-2xl shadow-xl border border-border/50 p-4 z-50">
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
            </div>`;

const newJSXStr = `            <div className="absolute top-[calc(100%+8px)] right-0 w-80 bg-white rounded-2xl shadow-xl border border-border/50 p-4 z-50 cursor-default" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary"><ChevronLeft className="w-4 h-4" /></button>
                <span className="font-semibold capitalize text-sm">{format(viewDate, "MMMM yyyy", { locale: ptBR })}</span>
                <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary"><ChevronRight className="w-4 h-4" /></button>
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
                      isToday(d) ? "bg-[#8B5CF6] text-white font-bold shadow-md" : 
                      "hover:bg-secondary text-foreground"
                    }\`}
                  >
                    {d || ""}
                  </button>
                ))}
              </div>
              
              <button className="w-full mt-4 flex items-center justify-center gap-2 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <PlusCircle className="w-4 h-4" /> Agendar Evento
              </button>

              <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Horário Atual</span>
                <span className="text-sm font-bold text-[#8B5CF6]">{format(time, "HH:mm:ss")}</span>
              </div>
            </div>`;

// Use replace but we have to be careful with template literals in regex
// It's safer to use indexOf/substring or split/join if exact match fails.
let index = headerCode.indexOf('<div className="absolute top-[calc(100%+8px)]');
if (index !== -1) {
  let endIndex = headerCode.indexOf('</div>\n        </div>', index);
  if (endIndex !== -1) {
     let oldBlock = headerCode.substring(index, endIndex + 6);
     headerCode = headerCode.replace(oldBlock, newJSXStr);
  } else {
     console.log("Could not find endIndex");
  }
} else {
  console.log("Could not find startIndex");
}

fs.writeFileSync('src/components/layout/Header.tsx', headerCode);
console.log("Added month navigation and Agendar Evento button to calendar.");
