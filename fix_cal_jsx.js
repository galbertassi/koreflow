const fs = require('fs');
let headerCode = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

const oldJSXStr = `          {isCalendarOpen && (
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
          )}`;

const newJSXStr = `          {isCalendarOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-80 bg-white rounded-2xl shadow-xl border border-border/50 p-4 z-50 cursor-default" onClick={(e) => e.stopPropagation()}>
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
            </div>
          )}`;

headerCode = headerCode.replace(oldJSXStr, newJSXStr);
fs.writeFileSync('src/components/layout/Header.tsx', headerCode);
console.log("Fixed Calendar JSX");
