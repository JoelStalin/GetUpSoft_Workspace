import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Camera, Send } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);

  const { data: proposals, isLoading: proposalsLoading } = trpc.instaai.getTodayProposals.useQuery();
  const { data: config } = trpc.instaai.getScheduleConfig.useQuery();
  const { data: history } = trpc.instaai.getPublishingHistory.useQuery({ limit: 10 });

  const utils = trpc.useUtils();
  const approveMutation = trpc.instaai.approvePhoto.useMutation({
    onSuccess: () => utils.instaai.getTodayProposals.invalidate(),
  });
  const rejectMutation = trpc.instaai.rejectPhoto.useMutation({
    onSuccess: () => utils.instaai.getTodayProposals.invalidate(),
  });
  const publishMutation = trpc.instaai.publishApprovedPhotos.useMutation({
    onSuccess: () => {
      utils.instaai.getTodayProposals.invalidate();
      utils.instaai.getPublishingHistory.invalidate();
      toast.success("Photos published successfully!");
    },
    onError: (error) => toast.error(`Publish failed: ${error.message}`),
  });
  const generateMutation = trpc.instaai.generateDailyProposals.useMutation({
    onSuccess: () => {
      utils.instaai.getTodayProposals.invalidate();
      toast.success("Proposals generated!");
    },
    onError: (error) => toast.error(`Generation failed: ${error.message}`),
  });

  if (loading || proposalsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={48} />
      </div>
    );
  }

  const handleApprove = (photoId: number) => {
    approveMutation.mutate({ photoId });
    setSelectedPhotos([...selectedPhotos, photoId]);
  };

  const handleReject = (photoId: number) => {
    rejectMutation.mutate({ photoId });
    setSelectedPhotos(selectedPhotos.filter((id) => id !== photoId));
  };

  const handlePublish = () => {
    publishMutation.mutate();
  };

  return (
    <DashboardLayout title="Insta AI Manager">
      <div className="space-y-12">
        {/* Header Extra Info */}
        <div className="flex justify-between items-end border-b border-border pb-8">
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-accent">Status: Active</p>
            <h2 className="text-4xl font-bold tracking-tighter uppercase mt-2">Content Pipeline</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Operator</p>
            <p className="text-sm font-bold uppercase">{user?.name || "Anonymous"}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Today's Proposals", value: `${proposals?.photos.length || 0}/10` },
            { label: "Approved", value: `${selectedPhotos.length}/5` },
            { label: "Published Today", value: "0" },
            { label: "Total Published", value: history?.length || 0 },
          ].map((stat) => (
            <div key={stat.label} className="nothing-card group hover:border-foreground transition-colors">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-4">{stat.label}</p>
              <div className="text-3xl font-bold tracking-tighter uppercase">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Photo Proposals */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold uppercase tracking-tight">Daily Proposals</h3>
              <div className="nothing-pill">Source: Google Drive</div>
            </div>

            {!proposals || proposals.photos.length === 0 ? (
              <div className="nothing-card text-center py-24">
                <Camera className="mx-auto mb-6 text-muted-foreground" size={48} />
                <p className="text-muted-foreground uppercase text-xs tracking-widest mb-8">System Idle: No Proposals</p>
                <Button
                  className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/80 font-bold uppercase text-[10px] tracking-widest"
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? "Processing..." : "Generate Proposals"}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proposals.photos.map((photo: any) => (
                  <div key={photo.id} className="nothing-card p-0 group overflow-hidden flex flex-col">
                    {photo.thumbnailUrl && (
                      <div className="relative aspect-[4/5] overflow-hidden border-b border-border">
                        <img
                          src={photo.thumbnailUrl}
                          alt={photo.fileName}
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-mono text-muted-foreground mb-4 uppercase">{photo.fileName}</p>
                        <p className="text-sm leading-relaxed mb-8">{photo.caption}</p>
                      </div>
                      <div className="flex gap-4">
                        <Button
                          size="sm"
                          className="flex-1 rounded-full bg-foreground text-background font-bold uppercase text-[9px] tracking-widest"
                          onClick={() => handleApprove(photo.id)}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-full border-border hover:bg-accent hover:text-white hover:border-accent font-bold uppercase text-[9px] tracking-widest"
                          onClick={() => handleReject(photo.id)}
                          disabled={rejectMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Publish Control */}
            <div className="nothing-card">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Queue Control</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                    <span className="text-muted-foreground">Ready</span>
                    <span>{selectedPhotos.length}/5</span>
                  </div>
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-700"
                      style={{ width: `${(selectedPhotos.length / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <Button
                  className="w-full rounded-full bg-foreground text-background hover:bg-foreground/80 font-bold uppercase text-[10px] tracking-widest py-6"
                  onClick={handlePublish}
                  disabled={selectedPhotos.length === 0 || publishMutation.isPending}
                >
                  {publishMutation.isPending ? "Executing..." : "Execute Publication"}
                </Button>
              </div>
            </div>

            {/* Schedule Config */}
            <div className="nothing-card">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Parameters</h3>
              <div className="space-y-6 text-[11px] uppercase font-bold tracking-widest">
                <div className="flex justify-between border-b border-border pb-4">
                  <span className="text-muted-foreground">Sync Time</span>
                  <span>{config?.proposalTime || "09:00"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-4">Active Slots</span>
                  <div className="grid grid-cols-2 gap-2">
                    {config?.publishingSlots?.map((slot: string) => (
                      <div key={slot} className="bg-muted px-3 py-2 rounded-lg text-center">
                        {slot}
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-border hover:bg-foreground hover:text-background transition-colors text-[9px] mt-4"
                  size="sm"
                >
                  Configure Engine
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
