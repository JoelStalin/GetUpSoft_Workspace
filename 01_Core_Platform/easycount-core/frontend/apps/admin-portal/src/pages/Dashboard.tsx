import { Activity, Building2, Coins } from "lucide-react";
import { CardKPI } from "../components/CardKPI";
import { useAdminInvoices, useDashboardKpis } from "../api/dashboard";

export function DashboardPage() {
  const kpisQuery = useDashboardKpis();
  const invoicesQuery = useAdminInvoices({ page: 1, size: 10 });
  const kpis = kpisQuery.data;
  const invoices = invoicesQuery.data;

  const amountDue = kpis ? Number(kpis.amount_due_month ?? 0) : 0;

  const cards = [
    {
      title: "CompaÃ±Ã­as activas",
      value: kpis ? String(kpis.companies_active) : "â€¦",
      subtitle: "Tenants con integraciÃ³n DGII operativa",
      icon: <Building2 className="h-5 w-5 text-primary" aria-hidden />,
    },
    {
      title: "Comprobantes del mes",
      value: kpis ? kpis.invoices_month.toLocaleString("es-DO") : "â€¦",
      subtitle: "e-CF emitidos (todas las compaÃ±Ã­as)",
      icon: <Activity className="h-5 w-5 text-primary" aria-hidden />,
    },
    {
      title: "Monto a facturar (mes)",
      value: kpis
        ? amountDue.toLocaleString("es-DO", {
            style: "currency",
            currency: "DOP",
            maximumFractionDigits: 2,
          })
        : "â€¦",
      subtitle: "Cargos por uso acumulados",
      icon: <Coins className="h-5 w-5 text-primary" aria-hidden />,
    },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Panel principal</h1>
        <p className="text-sm text-slate-300">
          Monitorea la salud de los tenants, mÃ©tricas de facturaciÃ³n electrÃ³nica y cumplimiento operativo.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((kpi) => (
          <CardKPI key={kpi.title} {...kpi} />
        ))}
      </section>

      {kpisQuery.isError ? (
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-4 text-sm text-rose-200">
          No se pudo cargar el resumen del dashboard.
        </div>
      ) : null}

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Comprobantes recientes</h2>
          <p className="text-xs text-slate-400">
            Mostrando {invoices?.items.length ?? 0} de {invoices?.total ?? 0}
          </p>
        </header>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-300">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">CompaÃ±Ã­a</th>
                <th className="px-3 py-2 text-left">ENCF</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Estado DGII</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoices?.items.map((item) => (
                <tr key={item.id} className="border-b border-slate-800/80 hover:bg-slate-900/40">
                  <td className="px-3 py-2">{new Date(item.fecha_emision).toLocaleString()}</td>
                  <td className="px-3 py-2 font-medium text-slate-100">{item.tenant_name}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-400">{item.encf}</td>
                  <td className="px-3 py-2">{item.tipo_ecf}</td>
                  <td className="px-3 py-2">{item.estado_dgii}</td>
                  <td className="px-3 py-2 text-right">
                    {Number(item.total).toLocaleString("es-DO", {
                      style: "currency",
                      currency: "DOP",
                    })}
                  </td>
                </tr>
              ))}
              {invoicesQuery.isLoading ? (
                <tr>
                  <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={6}>
                    Cargando comprobantesâ€¦
                  </td>
                </tr>
              ) : null}
              {invoicesQuery.isError ? (
                <tr>
                  <td className="px-3 py-6 text-center text-sm text-rose-200" colSpan={6}>
                    No se pudo cargar el listado de comprobantes.
                  </td>
                </tr>
              ) : null}
              {invoices && invoices.items.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={6}>
                    No hay comprobantes registrados aÃºn.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">PrÃ³ximas acciones</h2>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>â€¢ Validar ambiente de certificaciÃ³n de nuevos clientes.</li>
          <li>â€¢ Revisar alertas de planes con consumo atÃ­pico.</li>
          <li>â€¢ Confirmar renovaciÃ³n de certificados digitales.</li>
        </ul>
      </section>
    </div>
  );
}

