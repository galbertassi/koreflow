const fs = require('fs');
let code = fs.readFileSync('src/app/login/page.tsx', 'utf8');

const oldLogo = `              <Image
                src="/logo-white.svg"
                alt="KORE"
                width={80}
                height={30}
                className="object-contain"
              />`;

const newLogo = `              <Image
                src="/logo-white.svg"
                alt="KORE"
                width={110}
                height={40}
                className="object-contain"
              />`;

if (code.includes(oldLogo)) {
  code = code.replace(oldLogo, newLogo);
  fs.writeFileSync('src/app/login/page.tsx', code, 'utf8');
  console.log('Logo resized!');
} else {
  console.log('Logo snippet not found.');
}
