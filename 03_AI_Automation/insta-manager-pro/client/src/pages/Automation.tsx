import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Play, RotateCw, Trash2, MessageSquare, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AutomationPage() {
  const [isStarting, setIsStarting] = useState(false);
  const utils = trpc.useUtils();

  const historyQuery = trpc.automation.getJobHistory.useQuery({ limit: 10 });
  const startUnfollow = trpc.automation.startUnfollow.useMutation({
    onSuccess: () => {
      toast.success("Unfollow engine started in background");
      utils.automation.getJobHistory.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const startMassDM = trpc.automation.startMassDM.useMutation({
    onSuccess: () => {
      toast.success("Mass DM engine started in background");
      utils.automation.getJobHistory.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <DashboardLayout title="Automation Control Center">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Bot Controls */}
        <div className="nothing-card">
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Available Engines</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Trigger Python automation bots manually</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/30 border border-border/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-foreground text-background">
                  <RotateCw className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">Unfollow Non-Followers</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Smart cleanup using Python Engine</p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => startUnfollow.mutate()}
                disabled={startUnfollow.isPending}
                className="rounded-full bg-foreground text-background hover:bg-foreground/80 font-bold uppercase text-[9px] tracking-widest px-6"
              >
                {startUnfollow.isPending ? "Starting..." : "Execute"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/30 border border-border/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-accent text-white">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-tight">Mass DM Outreach</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Targeted prospecting automation</p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={() => startMassDM.mutate({})}
                disabled={startMassDM.isPending}
                className="rounded-full bg-accent text-white hover:bg-accent/80 font-bold uppercase text-[9px] tracking-widest px-6"
              >
                {startMassDM.isPending ? "Starting..." : "Execute"}
              </Button>
            </div>
          </div>
        </div>

        {/* Job History */}
        <div className="nothing-card">
          <div className="flex flex-row items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Execution Logs</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Recent automation activity</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => historyQuery.refetch()} className="rounded-full hover:bg-muted">
              <RotateCw className={`w-4 h-4 ${historyQuery.isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {historyQuery.data?.map((job) => (
                <div key={job.id} className="p-4 rounded-2xl border border-border/50 bg-muted/20 text-[10px] uppercase font-bold tracking-widest">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-muted-foreground">{job.jobType}</span>
                    <span 
                      className={`${
                        job.status === 'completed' ? 'text-green-500' :
                        job.status === 'failed' ? 'text-accent' :
                        'text-blue-500 animate-pulse'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-2">Timestamp: {new Date(job.createdAt).toLocaleString()}</p>
                  {job.error && (
                    <div className="flex items-start mt-4 p-4 rounded-xl bg-accent/10 text-accent lowercase font-normal tracking-normal text-xs">
                      <AlertCircle className="w-3 h-3 mr-3 mt-0.5 shrink-0" />
                      <p>{job.error}</p>
                    </div>
                  )}
                </div>
              ))}
              {historyQuery.data?.length === 0 && (
                <p className="text-center text-muted-foreground py-12 uppercase text-[10px] tracking-[0.2em]">No operational history</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </DashboardLayout>
  );
}
