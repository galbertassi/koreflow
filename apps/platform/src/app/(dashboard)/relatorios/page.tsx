"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Download, Calendar, Filter, Clock, AlertTriangle, Target, Briefcase } from "lucide-react";
import { useStore } from "@/hooks/use-store";
import { PLANS } from "@/config/plans";

export default function RelatoriosPage() {
  const { companyPlan, openUpgradeModal } = useStore();
  const timeData = [
    { name: "Seg", time: 6, interruptions: 1 },
    { name: "Ter", time: 7.5, interruptions: 3 },
    { name: "Qua", time: 5, interruptions: 2 },
    { name: "Qui", time: 8, interruptions: 0 },
    { name: "Sex", time: 6.5, interruptions: 4 },
  ];

  const scopeData = [
    { name: "Planejado", value: 32, color: "#10b981" },
    { name: "Extra", value: 8, color: "#f97316" },
  ];

  const clientData = [
    { name: "Tech Solutions", hours: 14 },
    { name: "Acme Corp", hours: 8 },
    { name: "E-commerce X", hours: 6 },
    { name: "Marketing Agency", hours: 5 },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Comprovação de Trabalho</h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            Entenda exatamente para onde o seu tempo está indo, prove o valor das suas entregas e justifique atrasos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-border px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors shadow-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" /> Esta Semana
          </button>
          <button className="flex items-center gap-2 bg-white border border-border px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors shadow-sm">
            <Filter className="w-4 h-4 text-muted-foreground" /> Filtros
          </button>
          <button 
            onClick={() => {
              if (!PLANS[companyPlan].canExportPDF) {
                openUpgradeModal();
              } else {
                alert("Preparando PDF..."); // Lógica futura de exportação
              }
            }}
            className="flex items-center gap-2 bg-[#1e1b4b] hover:bg-[#312e81] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-[24px] border border-border/50 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Tempo Total</span>
          </div>
          <h3 className="text-3xl font-semibold text-foreground">33h <span className="text-lg text-muted-foreground">/ 40h</span></h3>
          <p className="text-xs text-muted-foreground mt-2">12% a mais que semana passada</p>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-border/50 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Demandas Extras</span>
          </div>
          <h3 className="text-3xl font-semibold text-foreground">8</h3>
          <p className="text-xs text-orange-600 font-medium mt-2">Tomaram 4h 15m da sua semana</p>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-border/50 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Interrupções</span>
          </div>
          <h3 className="text-3xl font-semibold text-foreground">10</h3>
          <p className="text-xs text-red-600 font-medium mt-2">Você foi interrompido 2h 45m</p>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-border/50 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Concluídas</span>
          </div>
          <h3 className="text-3xl font-semibold text-foreground">24</h3>
          <p className="text-xs text-emerald-600 font-medium mt-2">75% da sua meta semanal</p>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Productivity Curve */}
        <div className="bg-white p-6 rounded-[24px] border border-border/50 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-6">Tempo Investido vs Interrupções</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} />
                <Bar dataKey="time" name="Horas Trabalhadas" fill="#8B5CF6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scope Ratio */}
        <div className="bg-white p-6 rounded-[24px] border border-border/50 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">Planejado vs Extra</h3>
          <div className="flex flex-col items-center justify-center">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scopeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {scopeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 w-full justify-center">
              {scopeData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-medium text-foreground">{item.name} <span className="text-muted-foreground">({item.value})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Top Demanding Clients */}
      <div className="bg-white p-6 rounded-[24px] border border-border/50 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-6">Clientes que mais demandam</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60">
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cliente / Origem</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tempo Total (Semana)</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-full">Representação</th>
              </tr>
            </thead>
            <tbody>
              {clientData.map((client, idx) => {
                const percentage = Math.round((client.hours / 33) * 100);
                return (
                  <tr key={idx} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-foreground">{client.name}</td>
                    <td className="py-4 px-4 text-sm font-mono text-muted-foreground">{client.hours}h 00m</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div className="bg-[#1e1b4b] h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground w-8">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
