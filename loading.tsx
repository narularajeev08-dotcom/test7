import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initializing Tech Studio...</p>
    </div>
  );
}
