const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.resolve('public/afiliados/hotmart');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Converter assets para base64 data-uri puro
function getBase64(relPath) {
  const full = path.resolve(relPath);
  const data = fs.readFileSync(full);
  const ext = path.extname(full).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : 'image/png';
  return `data:${mime};base64,${data.toString('base64')}`;
}

const logoIcon = getBase64('public/flow-navegador.svg');
const imgDemanda = getBase64('public/demanda.png');
const imgControle = getBase64('public/controle de demanda.png');
const imgTimer = getBase64('public/Timer Inteligente.png');
const imgEtiquetas = getBase64('public/etiquetas.png');

const configs = [
  // -------------------------------------------------------------
  // 1. banner-250x250.png (Square)
  // Tema: "Demandas de todo lado?" -> Transição tipográfica -> KORE Flow
  // -------------------------------------------------------------
  {
    w: 250,
    h: 250,
    filename: 'banner-250x250.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; -webkit-font-smoothing: antialiased; }
  html, body { width: 250px; height: 250px; background: #050508; overflow: hidden; position: relative; }
  .ambient { position: absolute; top: -30px; right: -30px; width: 140px; height: 140px; background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(5,5,8,0) 70%); pointer-events: none; }
  .container { width: 250px; height: 250px; display: flex; flex-direction: column; justify-content: space-between; padding: 14px 14px 12px 14px; border: 1px solid rgba(255,255,255,0.08); position: relative; z-index: 1; }
  
  .header { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 7px; }
  .brand img { width: 18px; height: 18px; border-radius: 4px; }
  .brand-name { font-size: 11.5px; font-weight: 700; color: #E2E8F0; letter-spacing: -0.2px; }
  .brand-name span { color: #A78BFA; }

  .headline-block { margin-top: 4px; }
  .headline { font-size: 16.5px; font-weight: 800; color: #FFFFFF; line-height: 1.15; letter-spacing: -0.4px; }

  /* Representação tipográfica do Caos / Fontes de Demanda */
  .chaos-grid { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
  .source-tag { font-size: 10.5px; font-weight: 500; color: #94A3B8; background: #0E0F16; border: 1px solid rgba(255,255,255,0.07); padding: 3px 7px; border-radius: 4px; letter-spacing: -0.1px; }
  .source-tag.dim { color: #64748B; }

  /* Interface Real KORE Flow como prova visual */
  .preview-wrap { width: 100%; height: 64px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #0A0B10; box-shadow: 0 4px 12px rgba(0,0,0,0.6); position: relative; margin-top: 4px; }
  .preview-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: 10% 28%; }

  .footer { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.06); }
  .statement { font-size: 10.5px; font-weight: 600; color: #CBD5E1; letter-spacing: -0.1px; }
  .cta { font-size: 11px; font-weight: 700; color: #A78BFA; letter-spacing: -0.1px; }
</style>
</head>
<body>
  <div class="ambient"></div>
  <div class="container">
    <div class="header">
      <div class="brand">
        <img src="${logoIcon}" alt="KORE Flow">
        <span class="brand-name">KORE <span>Flow</span></span>
      </div>
    </div>
    <div class="headline-block">
      <h2 class="headline">Demandas de<br>todo lado?</h2>
      <div class="chaos-grid">
        <span class="source-tag">WhatsApp</span>
        <span class="source-tag dim">E-mail</span>
        <span class="source-tag">Reuniões</span>
        <span class="source-tag dim">Ligações</span>
      </div>
    </div>
    <div class="preview-wrap">
      <img src="${imgDemanda}" alt="Lista Real KORE Flow">
    </div>
    <div class="footer">
      <span class="statement">Centralize em um só fluxo.</span>
      <span class="cta">Conheça →</span>
    </div>
  </div>
</body>
</html>`
  },

  // -------------------------------------------------------------
  // 2. banner-300x250.png (Medium Rectangle)
  // Tema: "Sua memória não deveria ser seu sistema de gestão."
  // -------------------------------------------------------------
  {
    w: 300,
    h: 250,
    filename: 'banner-300x250.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; -webkit-font-smoothing: antialiased; }
  html, body { width: 300px; height: 250px; background: #050507; overflow: hidden; position: relative; }
  .ambient { position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; background: radial-gradient(circle, rgba(139,92,246,0.14) 0%, rgba(5,5,7,0) 70%); pointer-events: none; }
  .container { width: 300px; height: 250px; display: flex; flex-direction: column; justify-content: space-between; padding: 15px 16px 13px 16px; border: 1px solid rgba(255,255,255,0.08); position: relative; z-index: 1; }
  
  .header { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 7px; }
  .brand img { width: 20px; height: 20px; border-radius: 4px; }
  .brand-name { font-size: 12px; font-weight: 700; color: #E2E8F0; letter-spacing: -0.2px; }
  .tagline { font-size: 10.5px; font-weight: 600; color: #94A3B8; }

  .content { display: flex; flex-direction: column; gap: 5px; margin-top: 3px; }
  .headline { font-size: 16px; font-weight: 800; color: #FFFFFF; line-height: 1.22; letter-spacing: -0.4px; }
  .headline span { color: #A78BFA; }
  .sub { font-size: 11px; color: #94A3B8; line-height: 1.35; letter-spacing: -0.1px; }

  /* Interface Real da Lista de Demandas */
  .preview-wrap { width: 100%; height: 72px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #0B0C12; box-shadow: 0 4px 14px rgba(0,0,0,0.6); position: relative; }
  .preview-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: 10% 26%; }

  .footer { display: flex; align-items: center; justify-content: space-between; padding-top: 4px; }
  .note { font-size: 10px; color: #64748B; font-weight: 500; }
  .cta-btn { background: #13141E; border: 1px solid rgba(139,92,246,0.35); color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 6px; letter-spacing: -0.1px; box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
</style>
</head>
<body>
  <div class="ambient"></div>
  <div class="container">
    <div class="header">
      <div class="brand">
        <img src="${logoIcon}" alt="KORE Flow">
        <span class="brand-name">KORE Flow</span>
      </div>
      <span class="tagline">Gestão de Demandas</span>
    </div>
    <div class="content">
      <h2 class="headline">Sua memória não deveria ser <span>seu sistema de gestão.</span></h2>
      <p class="sub">Demandas importantes precisam de um lugar para existir.</p>
    </div>
    <div class="preview-wrap">
      <img src="${imgDemanda}" alt="Interface KORE Flow">
    </div>
    <div class="footer">
      <span class="note">Sem tarefas esquecidas</span>
      <div class="cta-btn">Conhecer Plataforma →</div>
    </div>
  </div>
</body>
</html>`
  },

  // -------------------------------------------------------------
  // 3. banner-336x280.png (Large Rectangle)
  // Tema: "Você sabe o que precisa ser feito agora?" + Prioridades reais
  // -------------------------------------------------------------
  {
    w: 336,
    h: 280,
    filename: 'banner-336x280.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; -webkit-font-smoothing: antialiased; }
  html, body { width: 336px; height: 280px; background: #050507; overflow: hidden; position: relative; }
  .ambient { position: absolute; top: -40px; right: -40px; width: 180px; height: 180px; background: radial-gradient(circle, rgba(139,92,246,0.13) 0%, rgba(5,5,7,0) 70%); pointer-events: none; }
  .container { width: 336px; height: 280px; display: flex; flex-direction: column; justify-content: space-between; padding: 16px 18px 14px 18px; border: 1px solid rgba(255,255,255,0.08); position: relative; z-index: 1; }
  
  .header { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 8px; }
  .brand img { width: 22px; height: 22px; border-radius: 5px; }
  .brand-name { font-size: 13px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.2px; }
  .brand-tag { font-size: 10.5px; font-weight: 600; color: #A78BFA; }

  .content { display: flex; flex-direction: column; gap: 4px; margin-top: 2px; }
  .headline { font-size: 17.5px; font-weight: 800; color: #FFFFFF; line-height: 1.2; letter-spacing: -0.4px; }
  .sub { font-size: 11.5px; color: #94A3B8; line-height: 1.35; letter-spacing: -0.1px; }

  /* 4 Prioridades Reais do KORE Flow em Linha Editorial */
  .priorities-row { display: flex; align-items: center; gap: 6px; margin: 4px 0; }
  .p-badge { font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px; letter-spacing: 0.2px; }
  .p-urgente { color: #FCA5A5; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); }
  .p-alta { color: #FDBA74; background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.25); }
  .p-media { color: #FDE047; background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.25); }
  .p-baixa { color: #CBD5E1; background: rgba(148,163,184,0.1); border: 1px solid rgba(148,163,184,0.2); }

  /* Interface Real da Demanda com Timer e Detalhe */
  .preview-wrap { width: 100%; height: 74px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #0B0C12; box-shadow: 0 4px 14px rgba(0,0,0,0.6); position: relative; }
  .preview-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: 12% 16%; }

  .footer { display: flex; align-items: center; justify-content: space-between; padding-top: 4px; }
  .statement { font-size: 10.5px; color: #64748B; font-weight: 500; }
  .cta-btn { background: #141520; border: 1px solid rgba(139,92,246,0.4); color: #FFFFFF; font-size: 11.5px; font-weight: 700; padding: 7px 16px; border-radius: 6px; letter-spacing: -0.1px; }
</style>
</head>
<body>
  <div class="ambient"></div>
  <div class="container">
    <div class="header">
      <div class="brand">
        <img src="${logoIcon}" alt="KORE Flow">
        <span class="brand-name">KORE Flow</span>
      </div>
      <span class="brand-tag">Priorização</span>
    </div>
    <div class="content">
      <h2 class="headline">Você sabe o que precisa ser feito agora?</h2>
      <p class="sub">Organize prioridades. Execute com clareza.</p>
    </div>
    <div class="priorities-row">
      <span class="p-badge p-urgente">● URGENTE</span>
      <span class="p-badge p-alta">● ALTA</span>
      <span class="p-badge p-media">● MÉDIA</span>
      <span class="p-badge p-baixa">● BAIXA</span>
    </div>
    <div class="preview-wrap">
      <img src="${imgControle}" alt="Painel KORE Flow">
    </div>
    <div class="footer">
      <span class="statement">Controle total da operação</span>
      <div class="cta-btn">Conheça o KORE Flow →</div>
    </div>
  </div>
</body>
</html>`
  },

  // -------------------------------------------------------------
  // 4. banner-468x60.png (Full Banner Horizontal)
  // Tema: "Organize. Priorize. Execute." (Sem dashboard, legibilidade 100%)
  // -------------------------------------------------------------
  {
    w: 468,
    h: 60,
    filename: 'banner-468x60.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; -webkit-font-smoothing: antialiased; }
  html, body { width: 468px; height: 60px; background: #050508; overflow: hidden; position: relative; }
  .ambient { position: absolute; left: 160px; top: -30px; width: 160px; height: 120px; background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(5,5,8,0) 70%); pointer-events: none; }
  .container { width: 468px; height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border: 1px solid rgba(255,255,255,0.08); position: relative; z-index: 1; }
  
  .left { display: flex; align-items: center; gap: 8px; }
  .left img { width: 24px; height: 24px; border-radius: 5px; }
  .brand-name { font-size: 13.5px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px; line-height: 1; }
  .brand-name span { color: #A78BFA; }

  .divider { width: 1px; height: 26px; background: rgba(255,255,255,0.1); margin: 0 12px; }

  .center { display: flex; flex-direction: column; justify-content: center; gap: 2px; flex: 1; }
  .headline { font-size: 13.5px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.2px; line-height: 1.15; }
  .sub { font-size: 10.5px; color: #94A3B8; letter-spacing: -0.1px; line-height: 1.15; }

  .cta-btn { background: #13141F; border: 1px solid rgba(139,92,246,0.4); color: #FFFFFF; font-size: 11.5px; font-weight: 700; padding: 6px 14px; border-radius: 6px; white-space: nowrap; letter-spacing: -0.1px; }
</style>
</head>
<body>
  <div class="ambient"></div>
  <div class="container">
    <div class="left">
      <img src="${logoIcon}" alt="KORE Flow">
      <span class="brand-name">KORE <span>Flow</span></span>
    </div>
    <div class="divider"></div>
    <div class="center">
      <span class="headline">Organize. Priorize. Execute.</span>
      <span class="sub">Todas as suas demandas em um único fluxo.</span>
    </div>
    <div class="cta-btn">Conheça →</div>
  </div>
</body>
</html>`
  },

  // -------------------------------------------------------------
  // 5. banner-728x90.png (Leaderboard Horizontal)
  // Tema: "Uma operação inteira. Em um único fluxo."
  // -------------------------------------------------------------
  {
    w: 728,
    h: 90,
    filename: 'banner-728x90.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; -webkit-font-smoothing: antialiased; }
  html, body { width: 728px; height: 90px; background: #050508; overflow: hidden; position: relative; }
  .ambient { position: absolute; left: 340px; top: -40px; width: 220px; height: 160px; background: radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(5,5,8,0) 70%); pointer-events: none; }
  .container { width: 728px; height: 90px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; border: 1px solid rgba(255,255,255,0.08); position: relative; z-index: 1; }
  
  .brand-block { display: flex; align-items: center; gap: 9px; }
  .brand-block img { width: 32px; height: 32px; border-radius: 6px; }
  .brand-text { display: flex; flex-direction: column; }
  .brand-name { font-size: 15px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px; line-height: 1.1; }
  .brand-tag { font-size: 10px; font-weight: 600; color: #94A3B8; }

  .divider { width: 1px; height: 44px; background: rgba(255,255,255,0.1); margin: 0 16px; }

  .message-block { display: flex; flex-direction: column; gap: 4px; flex: 1; }
  .headline { font-size: 15.5px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px; line-height: 1.15; }
  .headline span { color: #A78BFA; }
  .concepts-row { display: flex; gap: 8px; font-size: 10.5px; color: #94A3B8; font-weight: 500; }
  .concepts-row span { color: #64748B; margin-left: 8px; }

  /* Recorte real da interface de controle de tempo e demandas */
  .preview-wrap { width: 130px; height: 58px; border-radius: 5px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #0B0C12; margin: 0 16px; flex-shrink: 0; }
  .preview-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: 10% 28%; }

  .action-block { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
  .cta-btn { background: #131420; border: 1px solid rgba(139,92,246,0.45); color: #FFFFFF; font-size: 11.5px; font-weight: 700; padding: 8px 15px; border-radius: 6px; white-space: nowrap; letter-spacing: -0.1px; }
  .sub-cta { font-size: 10px; color: #64748B; }
</style>
</head>
<body>
  <div class="ambient"></div>
  <div class="container">
    <div class="brand-block">
      <img src="${logoIcon}" alt="KORE Flow">
      <div class="brand-text">
        <span class="brand-name">KORE Flow</span>
        <span class="brand-tag">Gestão de Demandas</span>
      </div>
    </div>
    <div class="divider"></div>
    <div class="message-block">
      <h2 class="headline">Uma operação inteira. Em um <span>único fluxo.</span></h2>
      <div class="concepts-row">
        Demandas <span>•</span> Prioridades <span>•</span> Tempo <span>•</span> Histórico
      </div>
    </div>
    <div class="preview-wrap">
      <img src="${imgDemanda}" alt="KORE Flow Interface">
    </div>
    <div class="action-block">
      <div class="cta-btn">Conheça o KORE Flow →</div>
      <span class="sub-cta">Teste grátis por 14 dias</span>
    </div>
  </div>
</body>
</html>`
  },

  // -------------------------------------------------------------
  // 6. banner-160x600.png (Wide Skyscraper Vertical)
  // Tema: Narrativa Vertical: Caos -> Filtro KORE Flow -> Clareza
  // Interface REAL recortada de demanda.png (sem usar arte promocional)
  // -------------------------------------------------------------
  {
    w: 160,
    h: 600,
    filename: 'banner-160x600.png',
    html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; -webkit-font-smoothing: antialiased; }
  html, body { width: 160px; height: 600px; background: #050508; overflow: hidden; position: relative; }
  .ambient-top { position: absolute; top: -30px; left: -20px; width: 180px; height: 180px; background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(5,5,8,0) 70%); pointer-events: none; }
  .container { width: 160px; height: 600px; display: flex; flex-direction: column; justify-content: space-between; padding: 18px 12px 16px 12px; border: 1px solid rgba(255,255,255,0.08); position: relative; z-index: 1; }

  /* Zona 1: A Dor das Demandas Dispersas */
  .zone-top { display: flex; flex-direction: column; gap: 8px; text-align: center; }
  .brand-mini { display: flex; align-items: center; justify-content: center; gap: 5px; margin-bottom: 2px; }
  .brand-mini img { width: 16px; height: 16px; border-radius: 4px; }
  .brand-mini span { font-size: 11px; font-weight: 700; color: #94A3B8; letter-spacing: -0.2px; }

  .headline-top { font-size: 14.5px; font-weight: 800; color: #FFFFFF; line-height: 1.22; letter-spacing: -0.3px; }

  .sources-flow { display: flex; flex-direction: column; align-items: center; gap: 3px; margin-top: 4px; }
  .source-item { font-size: 11px; font-weight: 600; color: #94A3B8; background: #0E0F16; border: 1px solid rgba(255,255,255,0.06); padding: 3px 12px; border-radius: 4px; width: 110px; }
  .arrow-down { font-size: 10px; color: #475569; line-height: 1; }

  /* Zona 2: A Transição KORE Flow e Interface Real */
  .zone-mid { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; margin: 4px 0; }
  .divider-line { width: 100%; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.3) 50%, transparent 100%); }
  
  .kore-tag { font-size: 11px; font-weight: 800; color: #A78BFA; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
  .sub-mid { font-size: 11.5px; font-weight: 700; color: #FFFFFF; line-height: 1.25; letter-spacing: -0.2px; }

  /* Recorte vertical REAL puro de demanda.png */
  .preview-wrap { width: 136px; height: 140px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #0A0B10; box-shadow: 0 4px 14px rgba(0,0,0,0.6); position: relative; margin-top: 2px; }
  .preview-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: 8% 28%; }

  /* Zona 3: Desfecho e CTA */
  .zone-bottom { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; width: 100%; }
  .conclusion { font-size: 12px; font-weight: 700; color: #E2E8F0; line-height: 1.3; letter-spacing: -0.2px; }
  .conclusion span { color: #A78BFA; }

  .cta-btn { background: #141522; border: 1px solid rgba(139,92,246,0.45); color: #FFFFFF; font-size: 11.5px; font-weight: 700; padding: 8px 10px; border-radius: 6px; width: 100%; letter-spacing: -0.1px; box-shadow: 0 2px 10px rgba(0,0,0,0.5); }
</style>
</head>
<body>
  <div class="ambient-top"></div>
  <div class="container">
    <div class="zone-top">
      <div class="brand-mini">
        <img src="${logoIcon}" alt="KORE Flow">
        <span>KORE Flow</span>
      </div>
      <h2 class="headline-top">Você recebe demandas de todo lado?</h2>
      <div class="sources-flow">
        <div class="source-item">WhatsApp</div>
        <div class="arrow-down">↓</div>
        <div class="source-item">E-mail</div>
        <div class="arrow-down">↓</div>
        <div class="source-item">Reuniões</div>
        <div class="arrow-down">↓</div>
        <div class="source-item">Ligações</div>
      </div>
    </div>

    <div class="zone-mid">
      <div class="divider-line"></div>
      <span class="kore-tag">KORE FLOW</span>
      <p class="sub-mid">Um único lugar para organizar tudo.</p>
      <div class="preview-wrap">
        <img src="${imgDemanda}" alt="Interface Real KORE Flow">
      </div>
    </div>

    <div class="zone-bottom">
      <div class="conclusion">
        Menos caos.<br><span>Mais clareza.</span>
      </div>
      <div class="cta-btn">Conheça →</div>
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

  // Validação IHDR física
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

// Geração da Montagem Consolidada da Campanha (preview-campanha.png)
const previewHtmlPath = path.resolve(outputDir, '_preview_board.html');
const previewPngPath = path.resolve(outputDir, 'preview-campanha.png');

const b250 = getBase64('public/afiliados/hotmart/banner-250x250.png');
const b300 = getBase64('public/afiliados/hotmart/banner-300x250.png');
const b336 = getBase64('public/afiliados/hotmart/banner-336x280.png');
const b468 = getBase64('public/afiliados/hotmart/banner-468x60.png');
const b728 = getBase64('public/afiliados/hotmart/banner-728x90.png');
const b160 = getBase64('public/afiliados/hotmart/banner-160x600.png');

const previewBoardHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif; }
  body { width: 1200px; height: 980px; background: #070709; color: #F8FAFC; padding: 40px; display: flex; flex-direction: column; gap: 32px; overflow: hidden; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
  .title { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
  .title span { color: #A78BFA; }
  .desc { font-size: 13px; color: #94A3B8; }

  .board-layout { display: flex; gap: 36px; align-items: flex-start; }
  .left-col { display: flex; flex-direction: column; gap: 28px; }
  .horizontals { display: flex; flex-direction: column; gap: 20px; }
  .rectangles { display: flex; gap: 24px; align-items: flex-end; }

  .banner-card { display: flex; flex-direction: column; gap: 8px; }
  .card-label { font-size: 11px; font-weight: 700; color: #64748B; letter-spacing: 0.5px; text-transform: uppercase; }
  .img-frame { border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 8px 30px rgba(0,0,0,0.8); border-radius: 4px; overflow: hidden; display: inline-block; background: #000; }
  .img-frame img { display: block; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">KORE <span>Flow</span> — Campanha de Banners Hotmart</h1>
      <p class="desc">Apresentação consolidada das 6 peças publicitárias para validação</p>
    </div>
    <div style="font-size: 12px; color: #A78BFA; font-weight: 600; background: rgba(139,92,246,0.12); border: 1px solid rgba(139,92,246,0.3); padding: 6px 14px; border-radius: 6px;">
      Estética Editorial B2B / SaaS Premium
    </div>
  </div>

  <div class="board-layout">
    <!-- Coluna Esquerda: Horizontais e Retângulos -->
    <div class="left-col">
      <div class="horizontals">
        <div class="banner-card">
          <span class="card-label">728 × 90 px — Leaderboard Horizontal</span>
          <div class="img-frame"><img src="${b728}"></div>
        </div>
        <div class="banner-card">
          <span class="card-label">468 × 60 px — Full Banner Horizontal</span>
          <div class="img-frame"><img src="${b468}"></div>
        </div>
      </div>

      <div class="rectangles">
        <div class="banner-card">
          <span class="card-label">336 × 280 px — Large Rectangle</span>
          <div class="img-frame"><img src="${b336}"></div>
        </div>
        <div class="banner-card">
          <span class="card-label">300 × 250 px — Medium Rectangle</span>
          <div class="img-frame"><img src="${b300}"></div>
        </div>
        <div class="banner-card">
          <span class="card-label">250 × 250 px — Square</span>
          <div class="img-frame"><img src="${b250}"></div>
        </div>
      </div>
    </div>

    <!-- Coluna Direita: Skyscraper Vertical -->
    <div class="banner-card">
      <span class="card-label">160 × 600 px — Wide Skyscraper Vertical</span>
      <div class="img-frame"><img src="${b160}"></div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(previewHtmlPath, previewBoardHtml, 'utf-8');
execSync(`"${chromePath}" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,980 --screenshot="${previewPngPath}" "file://${previewHtmlPath}"`);
if (fs.existsSync(previewHtmlPath)) fs.unlinkSync(previewHtmlPath);

console.log('Preview consolidada da campanha gerada em: public/afiliados/hotmart/preview-campanha.png');
