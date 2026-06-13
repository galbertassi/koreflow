const fs = require('fs');
let code = fs.readFileSync('src/app/login/page.tsx', 'utf8');

// 1. Remove logo from left column, keep only text
const oldLeft = `          {/* Rodap\u00e9 desktop */}
          <div className="hidden lg:flex flex-col gap-3">
            <Image
              src="/logo-white.svg"
              alt="KORE"
              width={72}
              height={28}
              className="object-contain opacity-40"
            />
            <p className="text-xs tracking-widest" style={{ color: "#C0C0C0" }}>
              POWERED BY KORE | DIGITAL EXPERIENCES
            </p>
          </div>`;

const newLeft = `          {/* Rodap\u00e9 desktop */}
          <p className="hidden lg:block text-xs tracking-widest" style={{ color: "#C0C0C0" }}>
            POWERED BY KORE | DIGITAL EXPERIENCES
          </p>`;

// 2. Add logo to right column below card
const oldRight = `            {/* Rodap\u00e9 mobile */}
            <p className="lg:hidden text-center text-xs tracking-widest mt-8" style={{ color: "#C0C0C0" }}>
              POWERED BY KORE | DIGITAL EXPERIENCES
            </p>
          </div>`;

const newRight = `            {/* Logo + rodap\u00e9 direita */}
            <div className="flex flex-col items-center gap-2 mt-7">
              <Image
                src="/logo-white.svg"
                alt="KORE"
                width={88}
                height={32}
                className="object-contain"
              />
              <p className="text-center text-[11px] tracking-widest" style={{ color: "#C0C0C0" }}>
                POWERED BY KORE | DIGITAL EXPERIENCES
              </p>
            </div>
          </div>`;

if (code.includes(oldLeft)) {
  code = code.replace(oldLeft, newLeft);
  console.log('Left column: OK');
} else {
  console.log('Left column: NOT FOUND - checking current structure...');
  const idx = code.indexOf('Rodap\u00e9 desktop');
  console.log('Found at char:', idx, '| Snippet:', code.substring(idx, idx + 200));
}

if (code.includes(oldRight)) {
  code = code.replace(oldRight, newRight);
  console.log('Right column: OK');
} else {
  console.log('Right column: NOT FOUND');
}

fs.writeFileSync('src/app/login/page.tsx', code, 'utf8');
