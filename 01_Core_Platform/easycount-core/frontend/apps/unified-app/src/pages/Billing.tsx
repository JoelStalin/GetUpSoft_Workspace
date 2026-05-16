import React from 'react';
import { useLedgerEntries } from '../api/accounting';
import { useAuthStore } from '../store/auth-store';
import { FileText, Search, Plus, Filter, Download, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Badge } from '@getupsoft/ui';

export const Billing: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useLedgerEntries(user?.tenantId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">LEDGER_V2</h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] mt-1">Transactional Integrity & Fiscal Audit</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="font-mono text-[10px] tracking-widest border-zinc-800">
            <Download className="w-3 h-3 mr-2" /> EXPORT_CSV
          </Button>
          <Button variant="glow" size="sm" className="font-mono text-[10px] tracking-widest px-6">
            <Plus className="w-3 h-3 mr-2" /> NEW_ENTRY
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-zinc-900/30 p-2 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <Input 
            placeholder="Search by reference, NCF or description..." 
            className="pl-11 bg-transparent border-transparent focus:border-cyan-500/20"
          />
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto px-2">
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white uppercase text-[10px] font-black">
            <Filter className="w-3 h-3 mr-2" /> Filter_By_State
          </Button>
        </div>
      </div>

      <Card className="border-zinc-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/20 text-zinc-500 text-[9px] uppercase tracking-[0.2em] font-mono border-b border-zinc-800/50">
                <th className="px-6 py-5 font-black">ISO_Timestamp</th>
                <th className="px-6 py-5 font-black">Identifier_Ref</th>
                <th className="px-6 py-5 font-black">Entry_Description</th>
                <th className="px-6 py-5 font-black text-right">Debit_Flux</th>
                <th className="px-6 py-5 font-black text-right">Credit_Flux</th>
                <th className="px-6 py-5 font-black text-center">OP_Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="h-2 bg-zinc-800 rounded-full w-full opacity-20"></div>
                    </td>
                  </tr>
                ))
              ) : data?.items.length ? (
                data.items.map((entry) => (
                  <tr key={entry.id} className="hover:bg-cyan-500/[0.02] transition-colors group cursor-pointer">
                    <td className="px-6 py-5 text-xs text-zinc-400 font-mono">
                      {new Date(entry.fecha).toISOString().split('T')[0]}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-200 group-hover:text-cyan-400 transition-colors">
                          {entry.referencia}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-tighter">
                          {entry.encf || 'CORE_SYSTEM_ENTRY'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs text-zinc-500 italic max-w-xs truncate">
                      {entry.descripcion || '—'}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex items-center space-x-1.5 text-red-500/80 font-mono text-xs font-bold">
                        <ArrowDownLeft className="w-3 h-3" />
                        <span>-{parseFloat(entry.debit).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex items-center space-x-1.5 text-green-500/80 font-mono text-xs font-bold">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>+{parseFloat(entry.credit).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <Badge className="bg-zinc-800 text-[8px] font-black uppercase tracking-widest border-zinc-700">COMMITTED</Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center space-y-4 opacity-20">
                      <FileText className="w-12 h-12 text-zinc-400" />
                      <p className="text-xs font-mono uppercase tracking-[0.3em]">No records found in current segment</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
