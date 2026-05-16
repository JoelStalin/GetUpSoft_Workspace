import React from 'react';
import { useAuthStore } from '../store/auth-store';
import { useTenantSettings } from '../api/accounting';
import { Settings as SettingsIcon, Database, Mail, Globe, Lock, Save, Loader2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input } from '@getupsoft/ui';

export const Settings: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useTenantSettings(user?.tenantId || undefined);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">CONFIGURACIÓN</h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] mt-1">System Core Control Panel</p>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-600 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>RECURSIVE_SYNC_ACTIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center space-x-3 p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all">
            <SettingsIcon className="w-5 h-5" />
            <span className="font-bold text-sm tracking-tight">GENERAL</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-4 rounded-2xl hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 transition-all group">
            <Database className="w-5 h-5 group-hover:text-pink-500 transition-colors" />
            <span className="font-bold text-sm tracking-tight uppercase">ODOO_ERP</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-4 rounded-2xl hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 transition-all group">
            <Mail className="w-5 h-5 group-hover:text-cyan-500 transition-colors" />
            <span className="font-bold text-sm tracking-tight uppercase">EMAILS</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-4 rounded-2xl hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 transition-all group">
            <Lock className="w-5 h-5 group-hover:text-purple-500 transition-colors" />
            <span className="font-bold text-sm tracking-tight uppercase">SECURITY</span>
          </button>
        </aside>

        <div className="lg:col-span-3">
          <Card className="border-zinc-800/50">
            <CardHeader className="border-b border-zinc-800/50 pb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Globe className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl">Global Parameters</CardTitle>
              </div>
              <CardDescription>Configure regional settings and communication protocols.</CardDescription>
            </CardHeader>

            <CardContent className="pt-8 space-y-8">
              {isLoading ? (
                <div className="flex flex-col items-center py-12 space-y-4">
                  <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  <span className="font-mono text-xs text-zinc-600">QUERYING_DATA_LAKE...</span>
                </div>
              ) : (
                <>
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest ml-1">Moneda Base</label>
                      <Input 
                        value={data?.moneda || 'DOP'} 
                        disabled 
                        className="bg-black/80 font-mono text-cyan-400 border-zinc-800/50"
                      />
                      <p className="text-[9px] text-zinc-600 px-1 italic">Read-only system constant.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest ml-1">Región de Despliegue</label>
                      <Input 
                        value="America/Santo_Domingo" 
                        disabled 
                        className="bg-black/80 font-mono text-zinc-400 border-zinc-800/50"
                      />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center space-x-2 text-zinc-400">
                      <Mail className="w-4 h-4" />
                      <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-white">Mail Handlers</h4>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest ml-1">Correo de Facturación</label>
                      <Input 
                        type="email" 
                        placeholder="admin@enterprise.com"
                        defaultValue={data?.correo_facturacion || ''} 
                        className="bg-zinc-950 border-zinc-800 focus:border-cyan-500/30 transition-all text-sm"
                      />
                      <p className="text-[9px] text-zinc-600 px-1">Receiver for all DGII XML delivery receipts.</p>
                    </div>
                  </section>

                  <div className="pt-8 border-t border-zinc-800/50 flex justify-between items-center">
                    <div className="text-[9px] text-zinc-700 font-mono uppercase">
                      Last Updated: {data?.updated_at ? new Date(data.updated_at).toLocaleString() : 'NEVER'}
                    </div>
                    <Button variant="glow" className="h-12 px-10">
                      <Save className="w-4 h-4 mr-2" />
                      <span>COMMIT_CHANGES</span>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
