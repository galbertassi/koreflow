const fs = require('fs');

// 1. Update kore-ai/page.tsx
let koreAiCode = fs.readFileSync('src/app/(dashboard)/kore-ai/page.tsx', 'utf8');

const oldIcon = `<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#8B5CF6]/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>`;

const newIcon = `<div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#8B5CF6]/20 border border-[#8B5CF6]/10 overflow-hidden p-1">
              <img src="/kore_ai.png" alt="KORE AI" className="w-full h-full object-contain rounded-2xl" />
            </div>`;

koreAiCode = koreAiCode.replace(oldIcon, newIcon);
fs.writeFileSync('src/app/(dashboard)/kore-ai/page.tsx', koreAiCode);

// 2. Update dashboard/page.tsx
let dashboardCode = fs.readFileSync('src/app/(dashboard)/page.tsx', 'utf8');

const oldEnd = `      </div>

    </div>
  );
}`;

const newEnd = `      </div>

      {/* Botão Flutuante KORE AI */}
      <div className="fixed bottom-6 right-6 z-50 animate-bounce" style={{ animationDuration: '3s' }}>
        <a href="/kore-ai" className="group flex flex-col items-center gap-2 cursor-pointer hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-2xl shadow-[#8B5CF6]/40 border border-[#8B5CF6]/20 overflow-hidden flex items-center justify-center relative p-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img src="/kore_ai.png" alt="KORE AI" className="w-full h-full object-contain rounded-xl relative z-10" />
          </div>
          <span className="bg-foreground text-background text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 tracking-wider">
            KORE AI
          </span>
        </a>
      </div>

    </div>
  );
}`;

dashboardCode = dashboardCode.replace(oldEnd, newEnd);
fs.writeFileSync('src/app/(dashboard)/page.tsx', dashboardCode);

console.log('Images added successfully!');
