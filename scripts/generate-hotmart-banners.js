const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve('public/afiliados/hotmart');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Carregar imagens de referência e logos em base64
function getBase64(relPath) {
  const full = path.resolve(relPath);
  const data = fs.readFileSync(full);
  const ext = path.extname(full).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : 'image/png';
  return `data:${mime};base64,${data.toString('base64')}`;
}

const logoNav = getBase64('public/flow-navegador.svg');
const logoWhite = getBase64('public/logo-white.svg');
const imgOrganize = getBase64('public/afiliados/kore-flow-organize-suas-demandas.png');
const imgClareza = getBase64('public/afiliados/kore-flow-clareza-visual.png');
const imgIntegrada = getBase64('public/afiliados/kore-flow-operacao-integrada.png');
const imgProdutividade = getBase64('public/afiliados/kore-flow-produtividade-organizacao.png');
const imgFluxo = getBase64('public/afiliados/kore-flow-operacao-em-um-unico-fluxo.png');

const configs = [
  // 1. banner-250x250.png
  {
    w: 250,
    h: 250,
    filename: 'banner-250x250.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; }
  html, body { width: 250px; height: 250px; background: #07080B; overflow: hidden; position: relative; }
  .glow { position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(0,0,0,0) 70%); pointer-events: none; }
  .container { width: 250px; height: 250px; display: flex; flex-direction: column; justify-content: space-between; padding: 12px 14px; border: 1px solid rgba(255,255,255,0.08); }
  .header { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 7px; }
  .brand img { width: 20px; height: 20px; border-radius: 5px; }
  .brand-name { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: -0.2px; }
  .brand-name span { color: #A78BFA; }
  .badge { font-size: 8px; font-weight: 700; color: #C4B5FD; background: rgba(139,92,246,0.18); border: 1px solid rgba(139,92,246,0.3); padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .content { display: flex; flex-direction: column; gap: 4px; margin-top: 2px; }
  .headline { font-size: 14px; font-weight: 800; color: #FFFFFF; line-height: 1.2; letter-spacing: -0.3px; }
  .sub { font-size: 9.5px; color: #9CA3AF; line-height: 1.3; }
  .preview { width: 100%; height: 92px; border-radius: 7px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); position: relative; background: #12131A; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
  .preview img { width: 100%; height: 100%; object-fit: cover; object-position: center 30%; }
  .cta { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: #fff; font-size: 10.5px; font-weight: 700; padding: 7px 12px; border-radius: 6px; text-align: center; letter-spacing: 0.2px; box-shadow: 0 2px 8px rgba(139,92,246,0.4); }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="container">
    <div class="header">
      <div class="brand">
        <img src="${logoNav}" alt="KORE Flow">
        <span class="brand-name">KORE <span>Flow</span></span>
      </div>
      <span class="badge">Gestão</span>
    </div>
    <div class="content">
      <h2 class="headline">Organize suas Demandas</h2>
      <p class="sub">Centralize tarefas e prazos em um só fluxo.</p>
    </div>
    <div class="preview">
      <img src="${imgOrganize}" alt="Dashboard">
    </div>
    <div class="cta">Conhecer Plataforma →</div>
  </div>
</body>
</html>`
  },

  // 2. banner-300x250.png
  {
    w: 300,
    h: 250,
    filename: 'banner-300x250.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; }
  html, body { width: 300px; height: 250px; background: #07080B; overflow: hidden; position: relative; }
  .glow { position: absolute; top: -40px; right: -40px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(0,0,0,0) 70%); pointer-events: none; }
  .container { width: 300px; height: 250px; display: flex; flex-direction: column; justify-content: space-between; padding: 13px 16px; border: 1px solid rgba(255,255,255,0.08); }
  .header { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 8px; }
  .brand img { width: 22px; height: 22px; border-radius: 5px; }
  .brand-name { font-size: 14px; font-weight: 700; color: #fff; letter-spacing: -0.2px; }
  .brand-name span { color: #A78BFA; }
  .badge { font-size: 8.5px; font-weight: 700; color: #C4B5FD; background: rgba(139,92,246,0.18); border: 1px solid rgba(139,92,246,0.3); padding: 2px 7px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .content { display: flex; flex-direction: column; gap: 3px; }
  .headline { font-size: 16px; font-weight: 800; color: #FFFFFF; line-height: 1.2; letter-spacing: -0.4px; }
  .headline span { color: #A78BFA; }
  .sub { font-size: 10px; color: #9CA3AF; line-height: 1.3; }
  .preview { width: 100%; height: 96px; border-radius: 7px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); position: relative; background: #12131A; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
  .preview img { width: 100%; height: 100%; object-fit: cover; object-position: center 25%; }
  .cta { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: #fff; font-size: 11px; font-weight: 700; padding: 7.5px 14px; border-radius: 6px; text-align: center; letter-spacing: 0.2px; box-shadow: 0 2px 10px rgba(139,92,246,0.4); }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="container">
    <div class="header">
      <div class="brand">
        <img src="${logoNav}" alt="KORE Flow">
        <span class="brand-name">KORE <span>Flow</span></span>
      </div>
      <span class="badge">Produtividade</span>
    </div>
    <div class="content">
      <h2 class="headline">Mais Clareza, <span>Menos Caos.</span></h2>
      <p class="sub">Dashboard executivo e controle estratégico de demandas.</p>
    </div>
    <div class="preview">
      <img src="${imgClareza}" alt="Dashboard">
    </div>
    <div class="cta">Experimente o KORE Flow →</div>
  </div>
</body>
</html>`
  },

  // 3. banner-336x280.png
  {
    w: 336,
    h: 280,
    filename: 'banner-336x280.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; }
  html, body { width: 336px; height: 280px; background: #07080B; overflow: hidden; position: relative; }
  .glow { position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; background: radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(0,0,0,0) 70%); pointer-events: none; }
  .container { width: 336px; height: 280px; display: flex; flex-direction: column; justify-content: space-between; padding: 15px 18px; border: 1px solid rgba(255,255,255,0.08); }
  .header { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 8px; }
  .brand img { width: 24px; height: 24px; border-radius: 6px; }
  .brand-name { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -0.2px; }
  .brand-name span { color: #A78BFA; }
  .badge { font-size: 9px; font-weight: 700; color: #C4B5FD; background: rgba(139,92,246,0.18); border: 1px solid rgba(139,92,246,0.3); padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .content { display: flex; flex-direction: column; gap: 4px; }
  .headline { font-size: 17px; font-weight: 800; color: #FFFFFF; line-height: 1.2; letter-spacing: -0.4px; }
  .sub { font-size: 10.5px; color: #9CA3AF; line-height: 1.35; }
  .tags { display: flex; gap: 6px; margin-top: 2px; }
  .tag { font-size: 9px; font-weight: 600; color: #E5E7EB; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); padding: 2px 7px; border-radius: 4px; }
  .preview { width: 100%; height: 105px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); position: relative; background: #12131A; box-shadow: 0 4px 14px rgba(0,0,0,0.5); }
  .preview img { width: 100%; height: 100%; object-fit: cover; object-position: center 25%; }
  .cta { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: #fff; font-size: 11.5px; font-weight: 700; padding: 8.5px 16px; border-radius: 7px; text-align: center; letter-spacing: 0.2px; box-shadow: 0 2px 10px rgba(139,92,246,0.4); }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="container">
    <div class="header">
      <div class="brand">
        <img src="${logoNav}" alt="KORE Flow">
        <span class="brand-name">KORE <span>Flow</span></span>
      </div>
      <span class="badge">Software de Gestão</span>
    </div>
    <div class="content">
      <h2 class="headline">Controle Total da sua Operação</h2>
      <p class="sub">Organize prazos, clientes e tarefas sem esquecer nada.</p>
      <div class="tags">
        <span class="tag">✓ Timer Inteligente</span>
        <span class="tag">✓ Visão em Tempo Real</span>
      </div>
    </div>
    <div class="preview">
      <img src="${imgOrganize}" alt="Dashboard">
    </div>
    <div class="cta">Conheça o KORE Flow →</div>
  </div>
</body>
</html>`
  },

  // 4. banner-468x60.png (Ultra Horizontal)
  {
    w: 468,
    h: 60,
    filename: 'banner-468x60.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; }
  html, body { width: 468px; height: 60px; background: #07080B; overflow: hidden; position: relative; }
  .glow { position: absolute; left: 160px; top: -30px; width: 140px; height: 120px; background: radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(0,0,0,0) 70%); pointer-events: none; }
  .container { width: 468px; height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; border: 1px solid rgba(255,255,255,0.08); }
  .left { display: flex; align-items: center; gap: 8px; }
  .left img { width: 28px; height: 28px; border-radius: 6px; }
  .brand-text { display: flex; flex-direction: column; }
  .brand-name { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: -0.2px; line-height: 1.1; }
  .brand-name span { color: #A78BFA; }
  .brand-tag { font-size: 7.5px; font-weight: 600; color: #A78BFA; text-transform: uppercase; letter-spacing: 0.5px; }
  .center { display: flex; flex-direction: column; gap: 2px; }
  .headline { font-size: 12px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.2px; line-height: 1.15; }
  .sub { font-size: 9px; color: #9CA3AF; line-height: 1.15; }
  .cta { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: #fff; font-size: 10.5px; font-weight: 700; padding: 7px 14px; border-radius: 6px; text-align: center; white-space: nowrap; box-shadow: 0 2px 8px rgba(139,92,246,0.4); }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="container">
    <div class="left">
      <img src="${logoNav}" alt="KORE Flow">
      <div class="brand-text">
        <span class="brand-name">KORE <span>Flow</span></span>
        <span class="brand-tag">Gestão de Demandas</span>
      </div>
    </div>
    <div class="center">
      <span class="headline">Do Caos à Clareza na sua Operação</span>
      <span class="sub">Centralize prazos, tarefas e equipe em um só lugar.</span>
    </div>
    <div class="cta">Testar Grátis →</div>
  </div>
</body>
</html>`
  },

  // 5. banner-728x90.png (Leaderboard)
  {
    w: 728,
    h: 90,
    filename: 'banner-728x90.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; }
  html, body { width: 728px; height: 90px; background: #07080B; overflow: hidden; position: relative; }
  .glow { position: absolute; left: 320px; top: -40px; width: 220px; height: 160px; background: radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(0,0,0,0) 70%); pointer-events: none; }
  .container { width: 728px; height: 90px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; border: 1px solid rgba(255,255,255,0.08); }
  .left { display: flex; align-items: center; gap: 12px; }
  .left img { width: 40px; height: 40px; border-radius: 8px; }
  .brand-text { display: flex; flex-direction: column; gap: 2px; }
  .brand-name { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.3px; line-height: 1.1; }
  .brand-name span { color: #A78BFA; }
  .badge { font-size: 8.5px; font-weight: 700; color: #C4B5FD; background: rgba(139,92,246,0.18); border: 1px solid rgba(139,92,246,0.3); padding: 1px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; align-self: flex-start; }
  .center { display: flex; flex-direction: column; gap: 4px; }
  .headline { font-size: 14px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px; line-height: 1.2; }
  .headline span { color: #A78BFA; }
  .features { display: flex; gap: 12px; font-size: 10px; color: #9CA3AF; }
  .features span { color: #4ADE80; font-weight: 700; margin-right: 3px; }
  .preview { width: 130px; height: 62px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); background: #12131A; box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
  .preview img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; }
  .cta { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: #fff; font-size: 12px; font-weight: 700; padding: 10px 18px; border-radius: 7px; text-align: center; white-space: nowrap; box-shadow: 0 2px 12px rgba(139,92,246,0.4); }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="container">
    <div class="left">
      <img src="${logoNav}" alt="KORE Flow">
      <div class="brand-text">
        <span class="brand-name">KORE <span>Flow</span></span>
        <span class="badge">Gestão Executiva</span>
      </div>
    </div>
    <div class="center">
      <h2 class="headline">Organize sua Operação em um <span>Único Fluxo</span></h2>
      <div class="features">
        <div><span>✓</span> Sem tarefas esquecidas</div>
        <div><span>✓</span> Controle de tempo</div>
        <div><span>✓</span> Visão em tempo real</div>
      </div>
    </div>
    <div class="preview">
      <img src="${imgProdutividade}" alt="Preview">
    </div>
    <div class="cta">Experimente Grátis →</div>
  </div>
</body>
</html>`
  },

  // 6. banner-160x600.png (Wide Skyscraper)
  {
    w: 160,
    h: 600,
    filename: 'banner-160x600.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; }
  html, body { width: 160px; height: 600px; background: #07080B; overflow: hidden; position: relative; }
  .glow { position: absolute; top: -30px; left: -20px; width: 180px; height: 180px; background: radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(0,0,0,0) 70%); pointer-events: none; }
  .container { width: 160px; height: 600px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 18px 12px 16px 12px; border: 1px solid rgba(255,255,255,0.08); text-align: center; }
  .brand { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .brand img { width: 36px; height: 36px; border-radius: 8px; }
  .brand-name { font-size: 14px; font-weight: 700; color: #fff; letter-spacing: -0.2px; }
  .brand-name span { color: #A78BFA; }
  .badge { font-size: 8px; font-weight: 700; color: #C4B5FD; background: rgba(139,92,246,0.18); border: 1px solid rgba(139,92,246,0.3); padding: 2px 7px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
  .headlines { display: flex; flex-direction: column; gap: 4px; }
  .headline { font-size: 14px; font-weight: 800; color: #FFFFFF; line-height: 1.25; letter-spacing: -0.3px; }
  .sub { font-size: 9.5px; color: #9CA3AF; line-height: 1.3; }
  .preview { width: 136px; height: 160px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); position: relative; background: #12131A; box-shadow: 0 4px 14px rgba(0,0,0,0.5); }
  .preview img { width: 100%; height: 100%; object-fit: cover; object-position: center 15%; }
  .benefits { display: flex; flex-direction: column; gap: 6px; width: 100%; }
  .pill { font-size: 9px; font-weight: 600; color: #E5E7EB; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); padding: 5px 6px; border-radius: 6px; text-align: left; display: flex; align-items: center; gap: 5px; }
  .pill span { color: #A78BFA; font-size: 10px; }
  .footer { width: 100%; display: flex; flex-direction: column; gap: 8px; }
  .tagline { font-size: 9px; color: #A78BFA; font-weight: 600; }
  .cta { background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); color: #fff; font-size: 11px; font-weight: 700; padding: 8px 10px; border-radius: 7px; text-align: center; letter-spacing: 0.2px; width: 100%; box-shadow: 0 2px 10px rgba(139,92,246,0.4); }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="container">
    <div class="brand">
      <img src="${logoNav}" alt="KORE Flow">
      <span class="brand-name">KORE <span>Flow</span></span>
      <span class="badge">Gestão de Demandas</span>
    </div>
    <div class="headlines">
      <h2 class="headline">Demandas de todo lado?</h2>
      <p class="sub">Centralize em um único fluxo organizado.</p>
    </div>
    <div class="preview">
      <img src="${imgFluxo}" alt="Timeline">
    </div>
    <div class="benefits">
      <div class="pill"><span>⚡</span> Timer Inteligente</div>
      <div class="pill"><span>📊</span> Dashboard Executivo</div>
      <div class="pill"><span>🎯</span> Prazos & Entregas</div>
    </div>
    <div class="footer">
      <span class="tagline">Mais Clareza. Menos Caos.</span>
      <div class="cta">Comece Grátis →</div>
    </div>
  </div>
</body>
</html>`
  }
];

const results = [];

configs.forEach(({ w, h, filename, html }) => {
  const tempHtml = path.resolve(outputDir, `_temp_${filename}.html`);
  const targetPng = path.resolve(outputDir, filename);

  fs.writeFileSync(tempHtml, html, 'utf-8');

  const cmd = `"${chromePath}" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=${w},${h} --screenshot="${targetPng}" "file://${tempHtml}"`;
  execSync(cmd);

  if (fs.existsSync(tempHtml)) {
    fs.unlinkSync(tempHtml);
  }

  // Validação IHDR
  const buf = Buffer.alloc(24);
  const fd = fs.openSync(targetPng, 'r');
  fs.readSync(fd, buf, 0, 24, 0);
  fs.closeSync(fd);

  const realW = buf.readUInt32BE(16);
  const realH = buf.readUInt32BE(20);
  const size = fs.statSync(targetPng).size;

  results.push({
    filename,
    expected: `${w}x${h}`,
    real: `${realW}x${realH}`,
    match: realW === w && realH === h,
    sizeBytes: size
  });
});

console.table(results);

const allPassed = results.every(r => r.match);
if (!allPassed) {
  console.error('ERRO: Algumas dimensões não bateram exatamente!');
  process.exit(1);
} else {
  console.log('SUCESSO: Todas as 6 dimensões bateram 100% com os requisitos!');
}
