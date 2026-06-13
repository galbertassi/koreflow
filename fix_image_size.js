const fs = require('fs');

// 1. Update kore-ai/page.tsx
let koreAiCode = fs.readFileSync('src/app/(dashboard)/kore-ai/page.tsx', 'utf8');

const oldIconKoreAi = `<div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#8B5CF6]/20 border border-[#8B5CF6]/10 overflow-hidden p-1">
              <img src="/kore_ai.png" alt="KORE AI" className="w-full h-full object-contain rounded-2xl" />
            </div>`;

const newIconKoreAi = `<div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mx-auto mb-0 drop-shadow-2xl">
              <img src="/kore_ai.png" alt="KORE AI" className="w-full h-full object-contain" />
            </div>`;

koreAiCode = koreAiCode.replace(oldIconKoreAi, newIconKoreAi);
fs.writeFileSync('src/app/(dashboard)/kore-ai/page.tsx', koreAiCode);

// 2. Update dashboard/page.tsx
let dashboardCode = fs.readFileSync('src/app/(dashboard)/page.tsx', 'utf8');

const oldIconDash = `<div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-2xl shadow-[#8B5CF6]/40 border border-[#8B5CF6]/20 overflow-hidden flex items-center justify-center relative p-1">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <img src="/kore_ai.png" alt="KORE AI" className="w-full h-full object-contain rounded-xl relative z-10" />
          </div>`;

const newIconDash = `<div className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center relative drop-shadow-2xl">
            <img src="/kore_ai.png" alt="KORE AI" className="w-full h-full object-contain relative z-10" />
          </div>`;

dashboardCode = dashboardCode.replace(oldIconDash, newIconDash);
fs.writeFileSync('src/app/(dashboard)/page.tsx', dashboardCode);

console.log('Images updated to be larger and without background!');
