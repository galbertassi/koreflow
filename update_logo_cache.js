const fs = require('fs');

function bypassCache(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  let newCode = code.replace(/src="\/KOREFLOW.svg"/g, 'src="/KOREFLOW.svg?v=2" unoptimized');
  
  // se ja tiver unoptimized, nao duplica
  newCode = newCode.replace(/unoptimized unoptimized/g, 'unoptimized');
  
  if (code !== newCode) {
    fs.writeFileSync(filePath, newCode, 'utf8');
    console.log('Updated ' + filePath);
  } else {
    console.log('No changes needed in ' + filePath);
  }
}

bypassCache('src/app/login/page.tsx');
bypassCache('src/components/layout/Sidebar.tsx');

