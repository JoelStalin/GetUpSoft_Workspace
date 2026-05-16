import React from 'react';
import { Package, Tag, Layers, ArrowUpRight, Search, Plus, Filter, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Badge } from '@getupsoft/ui';

export const Products: React.FC = () => {
  const mockProducts = [
    { id: 1, name: 'Servicios de Consultoría IT', category: 'Servicios', stock: '∞', price: '45,000.00', status: 'ACTIVE' },
    { id: 2, name: 'Licencia SaaS Premium', category: 'Software', stock: '999', price: '2,500.00', status: 'ACTIVE' },
    { id: 3, name: 'Soporte Técnico Especializado', category: 'Servicios', stock: '0', price: '1,200.00', status: 'OUT_OF_STOCK' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">INVENTORY_GRID</h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] mt-1">Resource Management & Catalog Matrix</p>
        </div>
        <Button variant="glow" className="h-12 px-8">
          <Plus className="w-4 h-4 mr-2" />
          <span>NEW_RESOURCE_ENTRY</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-3xl flex items-center space-x-4 hover:border-cyan-500/20 transition-all group">
          <div className="bg-cyan-500/10 p-4 rounded-2xl text-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest font-black">TOTAL_ITEMS</p>
            <p className="text-3xl font-black text-white tracking-tighter italic">1,240</p>
          </div>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-3xl flex items-center space-x-4 hover:border-pink-500/20 transition-all group">
          <div className="bg-pink-500/10 p-4 rounded-2xl text-pink-400 group-hover:shadow-[0_0_15px_rgba(236,72,153,0.1)] transition-all">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest font-black">CATEGORIES</p>
            <p className="text-3xl font-black text-white tracking-tighter italic">12</p>
          </div>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-3xl flex items-center space-x-4 hover:border-green-500/20 transition-all group">
          <div className="bg-green-500/10 p-4 rounded-2xl text-green-400 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-all">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest font-black">STOCK_HEALTH</p>
            <p className="text-3xl font-black text-white tracking-tighter italic">84%</p>
          </div>
        </div>
      </div>

      <Card className="border-zinc-800/50 overflow-hidden">
        <div className="p-6 border-b border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <Input 
              placeholder="Search catalog by SKU, UID or Name..." 
              className="pl-11 bg-black/30 border-transparent focus:border-cyan-500/20"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-[10px] font-black font-mono tracking-widest uppercase text-zinc-500">
              <Filter className="w-3 h-3 mr-2" /> Sort_Grid
            </Button>
            <Button variant="outline" size="sm" className="bg-zinc-800 border-transparent h-9 w-9 p-0">
               <LayoutGrid className="w-4 h-4 text-zinc-400" />
            </Button>
          </div>
        </div>
        
        <div className="divide-y divide-zinc-900">
          {mockProducts.map((p) => (
            <div key={p.id} className="p-6 flex items-center justify-between hover:bg-cyan-500/[0.01] transition-colors group cursor-pointer">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-700 font-black text-xl group-hover:border-cyan-500/20 group-hover:text-cyan-400 transition-all">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="text-base font-bold text-zinc-200 group-hover:text-white transition-colors">{p.name}</h4>
                    <Badge variant={p.status === 'ACTIVE' ? 'cyan' : 'destructive'} className="text-[8px] font-black uppercase tracking-tighter h-4">
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">{p.category}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-12">
                <div className="text-right hidden md:block">
                  <p className="text-[9px] text-zinc-500 uppercase font-mono font-black tracking-widest mb-1">ALLOCATION</p>
                  <p className="text-sm font-black text-zinc-300 font-mono italic">{p.stock}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-zinc-500 uppercase font-mono font-black tracking-widest mb-1">VALUATION</p>
                  <p className="text-base font-black text-cyan-400 font-mono tracking-tighter">${p.price}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-zinc-700 group-hover:text-white transition-all">
                  <ArrowUpRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
