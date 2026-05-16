import { FileText, ScanBarcode, ShieldCheck } from "lucide-react";
import { CardKPI } from "../components/CardKPI";

const KPIS = [
  {
    title: "Comprobantes emitidos",
    value: "1,245",
    subtitle: "Ãšltimos 30 dÃ­as",
    icon: <FileText className="h-5 w-5 text-primary" aria-hidden />,
  },
  {
    title: "RFCE enviados",
    value: "842",
    subtitle: "Procesados en modo resumen",
    icon: <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />,
  },
  {
    title: "RI descargadas",
    value: "692",
    subtitle: "Con QR y hash de seguridad",
    icon: <ScanBarcode className="h-5 w-5 text-primary" aria-hidden />,
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Resumen del tenant</h1>
        <p className="text-sm text-slate-300">
          Seguimiento operativo de envÃ­os DGII, planes tarifarios y controles de aprobaciÃ³n.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {KPIS.map((kpi) => (
          <CardKPI key={kpi.title} {...kpi} />
        ))}
      </section>
      <section className="space-y-3 text-sm text-slate-300">
        <h2 className="text-lg font-semibold text-white">PrÃ³ximas acciones</h2>
        <ul className="space-y-2">
          <li>â€¢ Subir nuevo certificado .p12 antes de que expire el actual.</li>
          <li>â€¢ Revisar aprobaciones comerciales pendientes (ACECF).</li>
          <li>â€¢ Ejecutar conciliaciÃ³n con Odoo para facturas del mes.</li>
        </ul>
      </section>
    </div>
  );
}

