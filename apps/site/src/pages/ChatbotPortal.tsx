import { useMemo, useState } from "react";
import { Section } from "../components/ui/Section";
import { Container } from "../components/ui/Container";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Button } from "../components/ui/Button";

type Plan = {
  id: string;
  name: string;
  monthly: string;
  description: string;
  highlights: string[];
};

type Channel = {
  id: string;
  name: string;
  description: string;
  fee: string;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthly: "US$149/mes",
    description: "Activación rápida para equipos que necesitan alertas, borradores y aprobación humana.",
    highlights: [
      "1 workspace cliente",
      "Telegram o SMS",
      "Borradores asistidos",
      "Costo modelo + 50%",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    monthly: "US$349/mes",
    description: "Operación multicanal con trazabilidad, reglas y panel para aprobaciones.",
    highlights: [
      "Hasta 3 canales",
      "Telegram, WhatsApp y SMS",
      "Ledger de consumo",
      "Entornos por cliente",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    monthly: "Custom",
    description: "Implementación con integraciones dedicadas, MCP y hardening operativo.",
    highlights: [
      "Multi-tenant y RBAC",
      "Conectores MCP",
      "SLA y observabilidad",
      "Integración billing",
    ],
  },
];

const channels: Channel[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Canal premium para notificaciones y aprobaciones con plantillas verificadas.",
    fee: "Fee por mensaje",
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    description: "Provisión rápida para alertas operativas, aprobaciones y panel liviano.",
    fee: "Fee por workspace",
  },
  {
    id: "sms",
    name: "SMS",
    description: "Canal de respaldo para alertas urgentes vía Twilio, Vonage o AWS SNS.",
    fee: "Fee por SMS",
  },
];

const permissions = [
  "Leer matches y eventos de conversación en modo auditado.",
  "Generar borradores asistidos por IA con aprobación humana.",
  "Enviar notificaciones externas al responsable del cliente.",
  "Registrar costos, consumo de tokens y auditoría.",
];

export function ChatbotPortalPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("growth");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["telegram", "sms"]);
  const [approvalMode, setApprovalMode] = useState<string>("human");

  const plan = useMemo(
    () => plans.find((item) => item.id === selectedPlan) ?? plans[1],
    [selectedPlan],
  );

  function toggleChannel(channelId: string) {
    setSelectedChannels((current) =>
      current.includes(channelId)
        ? current.filter((item) => item !== channelId)
        : [...current, channelId],
    );
  }

  return (
    <div className="bg-background">
      <Section className="!py-20 lg:!py-32 border-b border-border">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr,1.1fr] items-end">
            <div className="space-y-6">
              <Eyebrow>Chatbot Portal</Eyebrow>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-text leading-tight">
                Onboarding comercial para <span className="text-primary italic">chatbot.getupsoft.com</span>
              </h1>
            </div>
            <p className="text-xl text-textMuted leading-relaxed max-w-2xl">
              Portal inicial para configurar permisos, seleccionar plan y conectar canales de operación segura. El envío de mensajes sigue sujeto a revisión humana estratégica.
            </p>
          </div>
        </Container>
      </Section>

      <Section background="surface">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
            <article className="p-10 rounded-[40px] bg-background border border-border shadow-soft-xl">
              <div className="flex gap-4 mb-10">
                <span className="px-4 py-1.5 rounded-full bg-accentTealSoft text-accentTeal text-[10px] font-bold uppercase tracking-widest">Provisioning</span>
                <span className="px-4 py-1.5 rounded-full bg-surfaceSoft text-textSubtle text-[10px] font-bold uppercase tracking-widest">Cloudflare-ready</span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-10">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-textSubtle">Empresa</span>
                  <input className="w-full p-4 rounded-2xl bg-surface border border-border focus:border-primary focus:bg-background outline-none transition-all font-medium" defaultValue="GetUpSoft Client Workspace" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-textSubtle">Responsable</span>
                  <input className="w-full p-4 rounded-2xl bg-surface border border-border focus:border-primary focus:bg-background outline-none transition-all font-medium" defaultValue="owner@getupsoft.com" />
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="p-8 rounded-3xl bg-surface border border-border">
                  <Eyebrow className="!mb-6">Permisos</Eyebrow>
                  <div className="space-y-4">
                    {permissions.map(p => (
                      <label key={p} className="flex gap-4 p-4 rounded-2xl bg-background border border-border cursor-pointer hover:border-primary transition-colors">
                        <input type="checkbox" defaultChecked className="mt-1 accent-primary" />
                        <span className="text-sm font-medium text-textMuted">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="p-8 rounded-3xl bg-surface border border-border">
                  <Eyebrow className="!mb-6">Modo Aprobación</Eyebrow>
                  <div className="space-y-4">
                    {["human", "hybrid"].map(mode => (
                      <button key={mode} onClick={() => setApprovalMode(mode)} className={`w-full p-6 rounded-2xl border text-left transition-all ${approvalMode === mode ? "bg-text border-text text-white shadow-soft-xl" : "bg-background border-border text-textMuted hover:border-textSubtle"}`}>
                        <p className="font-bold text-lg mb-2">{mode === "human" ? "Revisión Humana" : "Híbrido IA"}</p>
                        <p className={`text-sm ${approvalMode === mode ? "text-white/70" : "text-textSubtle"}`}>{mode === "human" ? "Aprobación explícita obligatoria." : "Borradores automáticos revisados."}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <aside className="space-y-8">
              <div className="p-10 rounded-[40px] bg-text text-white shadow-soft-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
                <Eyebrow color="primary" className="!text-primarySoft !mb-8">Plan Activo</Eyebrow>
                <div className="space-y-4">
                  {plans.map(p => (
                    <button key={p.id} onClick={() => setSelectedPlan(p.id)} className={`w-full p-6 rounded-2xl border text-left transition-all ${selectedPlan === p.id ? "bg-white/10 border-white/30" : "bg-white/5 border-white/10 hover:border-white/20"}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-lg">{p.name}</span>
                        <span className="text-sm font-bold text-primarySoft">{p.monthly}</span>
                      </div>
                      <p className="text-sm text-white/60">{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-10 rounded-[40px] bg-background border border-border shadow-soft-xl">
                <Eyebrow className="!mb-8">Canales</Eyebrow>
                <div className="space-y-4">
                  {channels.map(c => (
                    <button key={c.id} onClick={() => toggleChannel(c.id)} className={`w-full p-6 rounded-2xl border text-left transition-all ${selectedChannels.includes(c.id) ? "bg-primarySoft/30 border-primary/30" : "bg-surface border-border hover:border-borderStrong"}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-text">{c.name}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedChannels.includes(c.id) ? "text-primary" : "text-textSubtle"}`}>{selectedChannels.includes(c.id) ? "Active" : "Pending"}</span>
                      </div>
                      <p className="text-sm text-textMuted">{c.fee}</p>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </div>
  );
}
