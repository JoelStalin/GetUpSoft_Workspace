import React from 'react';
import { useTenants } from '../api/tenants';
import { Building2, Activity, Globe, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@getupsoft/ui';

export const Clients: React.FC = () => {
  const { data, isLoading } = useTenants();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">CLIENTES</h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] mt-1">Enterprise Directory & Certification Control</p>
        </div>
        <Button variant="glow" className="h-12 px-8">
          <Building2 className="w-4 h-4 mr-2" />
          <span>REGISTER_NEW_TENANT</span>
        </Button>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
          <span className="font-mono text-xs text-zinc-600 tracking-widest">DECRYPTING_CLIENT_DATABASE...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((tenant) => (
            <Card key={tenant.id} className="group hover:border-cyan-500/50 transition-all duration-300">
              <CardHeader className="relative">
                <div className="flex justify-between items-start">
                  <div className="bg-zinc-800/50 p-4 rounded-2xl group-hover:bg-cyan-500/10 transition-colors">
                    <Building2 className="w-8 h-8 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black font-mono tracking-widest border ${
                    tenant.env === 'PROD' 
                    ? 'bg-green-500/5 border-green-500/20 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                    : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                  }`}>
                    {tenant.env}_CLUSTER
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-1">
                  <CardTitle className="text-lg truncate group-hover:text-white transition-colors">{tenant.name}</CardTitle>
                  <p className="text-[10px] text-zinc-500 font-mono flex items-center">
                    <Globe className="w-3 h-3 mr-1.5 opacity-50" />
                    ID: {tenant.rnc}
                  </p>
                </div>

                <div className="pt-6 border-t border-zinc-800/50 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">{tenant.status}</span>
                  </div>
                  <button className="flex items-center text-[10px] font-black text-cyan-400 hover:text-white transition-all uppercase tracking-widest">
                    <span>MANAGE</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Empty State / Add Card */}
          <button className="border-2 border-dashed border-zinc-800/50 rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 hover:border-zinc-700 hover:bg-zinc-900/20 transition-all group">
            <div className="p-4 rounded-full bg-zinc-900 text-zinc-600 group-hover:text-zinc-400 transition-colors">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Initialize New Instance</span>
          </button>
        </div>
      )}
    </div>
  );
};
