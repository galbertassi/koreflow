"use client";

import { useModal } from "@/hooks/use-modal";
import { useStore } from "@/hooks/use-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createDemand } from "@/app/(dashboard)/demandas/actions";

function CreateExecutionModal() {
  const { closeModal } = useModal();
  const { addExecucao } = useStore();
  const [cliente, setCliente] = useState("");
  const [titulo, setTitulo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [prioridade, setPrioridade] = useState("Media");
  const [tipoPlanejamento, setTipoPlanejamento] = useState("Previsto");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!titulo.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const res = await createDemand({
        title: titulo,
        client_name: cliente,
        priority: prioridade === "Alta" ? "HIGH" : prioridade === "Baixa" ? "LOW" : "MEDIUM",
        type: tipoPlanejamento === "Demanda Extra" ? "OUT_OF_SCOPE" : "IN_SCOPE",
        description: observacao
      });

      if (!res.success) {
        alert("Erro ao criar tarefa: " + res.error);
        setIsSubmitting(false);
        return;
      }

      setCliente("");
      setTitulo("");
      setPrioridade("Media");
      setTipoPlanejamento("Previsto");
      setObservacao("");
      closeModal();
    } catch (e: any) {
      alert("Exceção ao criar tarefa: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Nova Execucao</DialogTitle>
          <DialogDescription>Registre uma nova execucao no seu sistema.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exec-cliente">Cliente</Label>
              <Input id="exec-cliente" placeholder="Ex: Kore Flow" value={cliente} onChange={(e) => setCliente(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exec-title">Atividade *</Label>
              <Input id="exec-title" placeholder="Ex: Landing Page" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exec-tipo">Demanda</Label>
              <select id="exec-tipo" value={tipoPlanejamento} onChange={(e) => setTipoPlanejamento(e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="Previsto">Previsto</option>
                <option value="Demanda Extra">Demanda Extra</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exec-priority">Prioridade</Label>
              <select id="exec-priority" value={prioridade} onChange={(e) => setPrioridade(e.target.value)} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exec-obs" className="text-foreground font-semibold text-[13px]">Observação (Opcional)</Label>
            <textarea 
              id="exec-obs" 
              placeholder="Adicione links, detalhes, orientações ou notas sobre essa demanda..." 
              value={observacao} 
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/20 resize-y placeholder:text-muted-foreground/60"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!titulo.trim() || isSubmitting} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white disabled:opacity-40">
            {isSubmitting ? "Criando..." : "Criar Tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateProjectModal() {
  const { closeModal } = useModal();
  const { addProjeto } = useStore();
  const [nome, setNome] = useState("");
  const [cliente, setCliente] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const handleSubmit = () => {
    if (!nome.trim()) return;
    addProjeto({ nome, cliente, status: "Ativo" });
    closeModal();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
          <DialogDescription>Agrupe execucoes em torno de um objetivo maior.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proj-name">Nome do Projeto *</Label>
            <Input id="proj-name" placeholder="Ex: Lancamento Produto X" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="proj-client">Cliente</Label>
            <Input id="proj-client" placeholder="Ex: Cliente A" value={cliente} onChange={(e) => setCliente(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-start">Inicio</Label>
              <Input id="proj-start" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proj-end">Prazo final</Label>
              <Input id="proj-end" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!nome.trim()} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white disabled:opacity-40">
            Criar Projeto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateGoalModal() {
  const { closeModal } = useModal();
  const { addMeta } = useStore();
  const [titulo, setTitulo] = useState("");
  const [valorAlvo, setValorAlvo] = useState("");
  const [prazo, setPrazo] = useState("");

  const handleSubmit = () => {
    if (!titulo.trim()) return;
    addMeta({ titulo, valorAlvo, prazo });
    closeModal();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Nova Meta</DialogTitle>
          <DialogDescription>Defina um objetivo mensuravel para acompanhar seu progresso.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal-title">Titulo da Meta *</Label>
            <Input id="goal-title" placeholder="Ex: Aumentar receita em 20%" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-value">Valor alvo</Label>
              <Input id="goal-value" placeholder="Ex: 20000" type="number" value={valorAlvo} onChange={(e) => setValorAlvo(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="goal-deadline">Prazo</Label>
              <Input id="goal-deadline" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!titulo.trim()} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white disabled:opacity-40">
            Criar Meta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreatePlanningModal() {
  const { closeModal } = useModal();
  const { addPlanejamento } = useStore();
  const [nome, setNome] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  const handleSubmit = () => {
    if (!nome.trim()) return;
    addPlanejamento({ nome, inicio, fim });
    closeModal();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Novo Planejamento</DialogTitle>
          <DialogDescription>Inicie o planejamento estrategico de um ciclo ou periodo.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plan-title">Nome do Ciclo *</Label>
            <Input id="plan-title" placeholder="Ex: Planejamento Junho 2025" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-start">Inicio</Label>
              <Input id="plan-start" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan-end">Fim</Label>
              <Input id="plan-end" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={closeModal}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!nome.trim()} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white disabled:opacity-40">
            Criar Planejamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ModalManager() {
  const { type, isOpen } = useModal();
  if (!isOpen || !type) return null;
  return (
    <>
      {type === "CREATE_EXECUTION" && <CreateExecutionModal />}
      {type === "CREATE_PROJECT" && <CreateProjectModal />}
      {type === "CREATE_GOAL" && <CreateGoalModal />}
      {type === "CREATE_PLANNING" && <CreatePlanningModal />}
    </>
  );
}
