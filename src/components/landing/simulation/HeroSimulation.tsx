"use client";

import { useEffect, useState, useRef } from "react";
import { HeroDashboard } from "./HeroDashboard/HeroDashboard";
import { getPerspectiveTransform } from "./perspectiveMath";

// Ajuste Fino dos 4 Cantos (em porcentagem do tamanho da imagem)
const INITIAL_CORNERS = {
  topLeft: { x: 38.5, y: 16.8 },
  topRight: { x: 96.0, y: 9.6 },
  bottomRight: { x: 96.0, y: 78.0 },
  bottomLeft: { x: 38.2, y: 74.2 },
};

// Modo de Debug: true = Mostra painel de controle e marcadores para ajuste fino. false = Produção.
const DEBUG_MODE = false;

export function HeroSimulation() {
  const [mounted, setMounted] = useState(false);
  const [matrix3d, setMatrix3d] = useState<string>("none");
  const [corners, setCorners] = useState(INITIAL_CORNERS);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateMatrix = () => {
      if (!containerRef.current) return;

      // Encontrar o wrapper da imagem. HeroSimulation está dentro de um div relative que contém a img.
      const parent = containerRef.current.parentElement;
      if (!parent) return;

      const w = parent.clientWidth;
      const h = parent.clientHeight;

      // Tamanho interno virtual do Dashboard (em pixels).
      // Usamos uma resolução "desktop" base e forçamos o HeroDashboard a ter esse tamanho.
      const virtualWidth = 1280;
      const virtualHeight = 800;

      // Calcular coordenadas absolutas dos 4 cantos baseados nas porcentagens
      const activeCorners = DEBUG_MODE ? corners : INITIAL_CORNERS;
      const p1 = { x: (activeCorners.topLeft.x / 100) * w, y: (activeCorners.topLeft.y / 100) * h };
      const p2 = { x: (activeCorners.topRight.x / 100) * w, y: (activeCorners.topRight.y / 100) * h };
      const p3 = { x: (activeCorners.bottomRight.x / 100) * w, y: (activeCorners.bottomRight.y / 100) * h };
      const p4 = { x: (activeCorners.bottomLeft.x / 100) * w, y: (activeCorners.bottomLeft.y / 100) * h };

      const matrix = getPerspectiveTransform(virtualWidth, virtualHeight, p1, p2, p3, p4);
      setMatrix3d(matrix);
    };

    // Usar ResizeObserver para ser resiliente ao carregamento da imagem
    let resizeObserver: ResizeObserver | null = null;
    
    if (containerRef.current && containerRef.current.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        updateMatrix();
      });
      resizeObserver.observe(containerRef.current.parentElement);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [mounted, corners]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none"
    >
      {/* 
        A camada de simulação com a matriz 3D aplicada.
        Fixamos um tamanho base para que o Dashboard nunca deforme 
        e a matriz distorça os pixels exatos para os 4 cantos.
      */}
      <div
        className="absolute origin-top-left overflow-hidden rounded-md"
        style={{
          width: "1280px",
          height: "800px",
          transform: matrix3d,
          backfaceVisibility: "hidden",
          opacity: matrix3d === "none" ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
          // Debugging Visual
          border: DEBUG_MODE ? "4px solid #10b981" : "none",
          backgroundColor: DEBUG_MODE ? "rgba(16, 185, 129, 0.2)" : "transparent",
        }}
      >
        {/* Aumenta a área útil em 25% (1600x1000) reduzindo a escala para caber nos 1280x800.
            Isso dá mais espaço para as telas, resolvendo o problema de "muito zoom" cortando conteúdo,
            sem quebrar a matemática da perspectiva 3D da div pai. */}
        <div style={{ width: "1600px", height: "1000px", transform: "scale(0.8)", transformOrigin: "0 0" }}>
          <HeroDashboard />
        </div>
      </div>

      {/* Marcadores de Debug para ajudar no posicionamento */}
      {DEBUG_MODE && (
        <>
          <DebugMarker x={corners.topLeft.x} y={corners.topLeft.y} label="TL" />
          <DebugMarker x={corners.topRight.x} y={corners.topRight.y} label="TR" />
          <DebugMarker x={corners.bottomRight.x} y={corners.bottomRight.y} label="BR" />
          <DebugMarker x={corners.bottomLeft.x} y={corners.bottomLeft.y} label="BL" />

          {/* Painel de Controle (Tools) */}
          <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-xl text-xs z-[9999] flex flex-col gap-3 pointer-events-auto shadow-2xl backdrop-blur-md border border-white/20 w-[320px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Ajuste de Perspectiva
              </h3>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(corners, null, 2));
                  alert("Configuração JSON copiada para a área de transferência!");
                }}
                className="bg-indigo-600 hover:bg-indigo-500 transition-colors text-white px-3 py-1.5 rounded-md text-[10px] font-semibold tracking-wider uppercase"
              >
                Copiar JSON
              </button>
            </div>
            
            <p className="text-white/60 text-[10px] leading-tight mb-2">
              Ajuste as posições X e Y (em %) de cada canto para encaixar perfeitamente no monitor do mockup.
            </p>

            {(Object.keys(corners) as (keyof typeof corners)[]).map(key => (
              <div key={key} className="flex flex-col gap-2 border-b border-white/10 pb-3 last:border-0 last:pb-0">
                <span className="font-semibold text-indigo-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                
                {/* Eixo X */}
                <div className="flex gap-2 items-center bg-white/5 p-1.5 rounded">
                  <span className="w-4 font-bold text-white/50">X</span>
                  <input 
                    type="range" min="0" max="100" step="0.1" 
                    value={corners[key as keyof typeof corners].x} 
                    onChange={e => setCorners(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof corners], x: parseFloat(e.target.value) } }))}
                    className="flex-1 accent-indigo-500 h-1"
                  />
                  <span className="w-10 text-right font-mono text-white/80">{corners[key as keyof typeof corners].x.toFixed(1)}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setCorners(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof corners], x: prev[key as keyof typeof corners].x - 0.1 } }))}
                      className="bg-white/10 w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 hover:text-indigo-300 transition-colors"
                    >-</button>
                    <button 
                      onClick={() => setCorners(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof corners], x: prev[key as keyof typeof corners].x + 0.1 } }))}
                      className="bg-white/10 w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 hover:text-indigo-300 transition-colors"
                    >+</button>
                  </div>
                </div>

                {/* Eixo Y */}
                <div className="flex gap-2 items-center bg-white/5 p-1.5 rounded">
                  <span className="w-4 font-bold text-white/50">Y</span>
                  <input 
                    type="range" min="0" max="100" step="0.1" 
                    value={corners[key as keyof typeof corners].y} 
                    onChange={e => setCorners(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof corners], y: parseFloat(e.target.value) } }))}
                    className="flex-1 accent-indigo-500 h-1"
                  />
                  <span className="w-10 text-right font-mono text-white/80">{corners[key as keyof typeof corners].y.toFixed(1)}</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setCorners(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof corners], y: prev[key as keyof typeof corners].y - 0.1 } }))}
                      className="bg-white/10 w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 hover:text-indigo-300 transition-colors"
                    >-</button>
                    <button 
                      onClick={() => setCorners(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof corners], y: prev[key as keyof typeof corners].y + 0.1 } }))}
                      className="bg-white/10 w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 hover:text-indigo-300 transition-colors"
                    >+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DebugMarker({ x, y, label }: { x: number, y: number, label: string }) {
  return (
    <div
      className="absolute w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(99,102,241,0.8)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto z-50 transition-all duration-75"
      style={{ left: `${x}%`, top: `${y}%` }}
      title={label}
    >
      <span className="absolute -top-6 text-[10px] font-mono bg-black/80 backdrop-blur-sm border border-white/10 text-white px-1.5 py-0.5 rounded whitespace-nowrap shadow-xl">
        {label} ({x.toFixed(1)}, {y.toFixed(1)})
      </span>
    </div>
  );
}
