import React from 'react';
import { useAuthStore } from '../store/auth-store';
import { 
  LayoutDashboard, 
  BarChart3, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@getupsoft/ui';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  const stats = [
    { label: 'E-CF_TOTAL_OUTPUT', value: '124', change: '+12%', icon: <Zap className="w-5 h-5" />, color: 'text-cyan-400' },
    { label: 'SYSTEM_UPTIME', value: '99.9%', change: 'STABLE', icon: <ShieldCheck className="w-5 h-5" />, color: 'text-green-400' },
    { label: 'PENDING_APPROVALS', value: '12', change: '-4', icon: <Clock className="w-5 h-5" />, color: 'text-pink-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Command_Center
          </h2>
          <div className="flex items-center space-x-3 text-zinc-500 font-mono text-xs">
            <span className="uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-[10px]">User: {user?.email}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
            <span className="text-cyan-500 font-bold uppercase">{user?.role}_ACCESS_GRANTED</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           <Button variant="outline" size="sm" className="font-mono text-[10px] tracking-widest border-zinc-800">
             REFRESH_DATALAKE
           </Button>
           <Button variant="glow" size="sm" className="font-mono text-[10px] tracking-widest">
             GENERATE_REPORT
           </Button>
        </div>
      </header>

      {/* Grid de Stats con Estilo HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-zinc-900/20 border-zinc-800/50 group hover:border-cyan-500/30 transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl bg-zinc-900 border border-zinc-800 ${stat.color} group-hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all`}>
                  {stat.icon}
                </div>
                <span className="text-[10px] font-black font-mono text-zinc-600 bg-zinc-900/50 px-2 py-0.5 rounded uppercase tracking-tighter">
                  {stat.change}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <Card className="lg:col-span-2 border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800/50 pb-6">
            <div>
              <CardTitle className="text-lg">Real-Time Traffic</CardTitle>
              <CardDescription>Live stream of incoming and outgoing fiscal documents.</CardDescription>
            </div>
            <TrendingUp className="w-5 h-5 text-zinc-700" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      {i % 2 === 0 ? <CheckCircle2 className="w-5 h-5 text-green-500/50" /> : <Clock className="w-5 h-5 text-yellow-500/50" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">E-CF_000000{145 + i}</h4>
                      <p className="text-[10px] font-mono text-zinc-600">CLIENT_ID: 101-98765-2 | 12:45:0{i} PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-mono text-zinc-400">$1,240.00</span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-700 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health / Side Panel */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-zinc-900/50 to-black border-zinc-800/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full"></div>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Activity className="w-4 h-4 mr-2 text-cyan-500" />
                SYSTEM_NODE_HEALTH
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono uppercase text-zinc-500">
                  <span>API_CORE_LATENCY</span>
                  <span className="text-green-500">14ms</span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[14%] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono uppercase text-zinc-500">
                  <span>REDIS_CACHE_HIT</span>
                  <span className="text-cyan-500">92%</span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[92%] shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800/50 bg-pink-500/[0.02] border-pink-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">ACTION_REQUIRED</h4>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                Existen 3 certificados próximos a expirar en el cluster de producción. Se recomienda renovación inmediata.
              </p>
              <Button variant="outline" size="sm" className="w-full text-[10px] font-mono border-pink-500/20 text-pink-500 hover:bg-pink-500/10">
                RESOLVE_SECURITY_RISKS
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const Activity = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);
