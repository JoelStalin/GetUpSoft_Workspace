import { useMemo, useState } from "react";

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
    description: "Activacion rapida para equipos que necesitan alertas, borradores y aprobacion humana.",
    highlights: [
      "1 workspace cliente",
      "Telegram o SMS",
      "Borradores asistidos con revision humana",
      "Costo modelo + fee de servicio del 50%",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    monthly: "US$349/mes",
    description: "Operacion multicanal con trazabilidad, reglas y panel para aprobaciones.",
    highlights: [
      "Hasta 3 canales conectados",
      "Telegram, WhatsApp y SMS",
      "Ledger de consumo y metricas",
      "Entornos y politicas por cliente",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    monthly: "Custom",
    description: "Implementacion con integraciones dedicadas, MCP y hardening operativo.",
    highlights: [
      "Multi-tenant y RBAC",
      "Conectores MCP reutilizables",
      "SLA y observabilidad",
      "Integracion con billing y backoffice",
    ],
  },
];

const channels: Channel[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Canal premium para notificaciones y aprobaciones con plantillas verificadas.",
    fee: "Fee por mensaje + proveedor",
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    description: "Provision rapida para alertas operativas, aprobaciones y panel liviano.",
    fee: "Fee por workspace activo",
  },
  {
    id: "sms",
    name: "SMS",
    description: "Canal de respaldo para alertas urgentes via Twilio, Vonage o AWS SNS.",
    fee: "Fee por SMS + costo carrier",
  },
];

const permissions = [
  "Leer matches y eventos de conversacion en modo auditado.",
  "Generar borradores asistidos por IA con aprobacion humana obligatoria.",
  "Enviar notificaciones externas al responsable del cliente.",
  "Registrar costos, consumo de tokens y auditoria operativa.",
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
    <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <header className="grid gap-8 lg:grid-cols-[0.95fr,1.05fr] lg:items-end">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Chatbot Portal
          </p>
          <h1 className="text-4xl font-semibold text-ink sm:text-5xl">
            Onboarding comercial para {`chatbot.getupsoft.com`}
          </h1>
        </div>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          Portal inicial para que cada cliente configure permisos, seleccione su plan, conecte
          canales y deje aprobada la operacion segura del asistente. El envio de mensajes sigue
          sujeto a revision humana.
        </p>
      </header>

      <section className="mt-14 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <article className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Provisioning
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              Cloudflare-ready
            </span>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">Empresa</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
                defaultValue="GetUpSoft Client Workspace"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">Responsable operativo</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
                defaultValue="owner@getupsoft.com"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink">Objetivo del workspace</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-accent focus:bg-white"
                defaultValue="Recibir matches, alertas y borradores asistidos con control de costos, aprobacion humana y trazabilidad operativa."
              />
            </label>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Permisos del cliente
              </p>
              <div className="mt-4 space-y-3">
                {permissions.map((item) => (
                  <label
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                  >
                    <input className="mt-1 h-4 w-4 rounded border-slate-300 accent-teal-700" defaultChecked type="checkbox" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Modo de aprobacion
              </p>
              <div className="mt-4 space-y-3">
                {[
                  {
                    id: "human",
                    title: "Revision humana obligatoria",
                    description: "Ningun mensaje sale sin aprobacion explicita del cliente.",
                  },
                  {
                    id: "hybrid",
                    title: "Hibrido con borradores",
                    description: "Se automatizan alertas y costos; el operador aprueba respuestas.",
                  },
                ].map((option) => (
                  <button
                    key={option.id}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      approvalMode === option.id
                        ? "border-ink bg-ink text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                    onClick={() => setApprovalMode(option.id)}
                    type="button"
                  >
                    <p className="text-sm font-semibold">{option.title}</p>
                    <p className={`mt-2 text-sm leading-6 ${approvalMode === option.id ? "text-white/80" : "text-slate-600"}`}>
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <article className="rounded-[30px] border border-slate-200 bg-slate-950 p-7 text-white shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/55">
              Plan activo
            </p>
            <div className="mt-5 space-y-3">
              {plans.map((item) => (
                <button
                  key={item.id}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    selectedPlan === item.id
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 bg-black/15 hover:border-white/20"
                  }`}
                  onClick={() => setSelectedPlan(item.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-base font-semibold">{item.name}</p>
                    <span className="text-sm text-white/70">{item.monthly}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/70">{item.description}</p>
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_16px_44px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Canales conectados
            </p>
            <div className="mt-5 space-y-3">
              {channels.map((channel) => {
                const enabled = selectedChannels.includes(channel.id);
                return (
                  <button
                    key={channel.id}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      enabled
                        ? "border-accent bg-teal-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                    onClick={() => toggleChannel(channel.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-base font-semibold text-ink">{channel.name}</p>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {enabled ? "Conectado" : "Pendiente"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{channel.description}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {channel.fee}
                    </p>
                  </button>
                );
              })}
            </div>
          </article>
        </aside>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-[1fr,0.95fr]">
        <article className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            Resumen comercial
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-ink">
            {plan.name} listo para provisionarse en el subdominio.
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {plan.highlights.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[30px] border border-slate-200 bg-slate-50 p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            Siguiente paso operativo
          </p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
            <p>
              1. Crear el custom domain <span className="font-semibold">chatbot.getupsoft.com</span> en
              Cloudflare y apuntarlo al mismo deploy de Pages o al origin dedicado.
            </p>
            <p>
              2. Conectar credenciales de WhatsApp Business, Telegram Bot y proveedor SMS desde el panel
              seguro.
            </p>
            <p>
              3. Completar backend para guardar consentimientos, billing, webhooks y estado de canal.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="inline-flex items-center rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="mailto:ops@getupsoft.com?subject=Activacion%20chatbot.getupsoft.com"
            >
              Solicitar activacion
            </a>
            <a
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-accent hover:text-accent"
              href="/contacto"
            >
              Hablar con operaciones
            </a>
          </div>
        </article>
      </section>
    </div>
  );
}
