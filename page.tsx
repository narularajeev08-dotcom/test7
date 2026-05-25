"use client";

import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldCheck, 
  Clock, 
  Loader2, 
  Eye, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Plus, 
  FolderOpen, 
  ChevronLeft 
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, doc, deleteDoc, getDocs } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { useRouter } from "navigation";

const BLUEPRINT_MAP: Record<string, string> = {
  "site-to-site-vpn": "Site to Site Internet VPN",
  "internet-local-firewall": "Internet Local Firewall",
  "internet-netskope-swg": "Internet Netskope SWG"
};

export default function DesignRegistryPage() {
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<any>(null);

  const instancesQuery = useMemo(() => query(collection(db, "network-diagrams")), [db]);
  const { data: rawInstances, loading } = useCollection(instancesQuery);

  const groupedByTemplate = useMemo(() => {
    if (!rawInstances) return {};
    
    return rawInstances
      .filter((inst: any) => inst.type === "Template Instance")
      .sort((a: any, b: any) => {
        const dateA = a.updatedAt?.toDate?.() || new Date(0);
        const dateB = b.updatedAt?.toDate?.() || new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .reduce((acc: any, inst: any) => {
        const tid = inst.templateId || "other";
        if (!acc[tid]) acc[tid] = [];
        acc[tid].push(inst);
        return acc;
      }, {});
  }, [rawInstances]);

  const handleDelete = async () => {
    if (!selectedForDelete) return;
    setDeletingId(selectedForDelete.id);
    const instanceRef = doc(db, "network-diagrams", selectedForDelete.id);
    
    try {
      await deleteDoc(instanceRef);
      const docQ = await getDocs(collection(db, "documents"));
      const docMatch = docQ.docs.find(d => d.data().sourceId === selectedForDelete.id);
      if (docMatch) {
        await deleteDoc(doc(db, "documents", docMatch.id));
      }
      toast({ title: "Strategic Design Decommissioned" });
    } catch (e) {
      errorEmitter.emit("permission-error", new FirestorePermissionError({ 
        path: instanceRef.path, 
        operation: "delete" 
      } satisfies SecurityRuleContext));
    } finally {
      setDeletingId(null);
      setIsDeleteDialogOpen(false);
      setSelectedForDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="icon" onClick={() => router.push("/tech-design")} className="h-8 w-8 -ml-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Technical Registry</span>
            <ShieldCheck className="h-3 w-3 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter font-headline text-slate-900 uppercase">Design Registry Hub</h1>
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Root Architectural Repository // Sequential Sub-Folders</p>
        </div>
        <Button asChild variant="outline" className="gap-2 font-black uppercase text-[10px] tracking-widest h-11 border-slate-300">
           <Link href="/standard-designs/blueprints">
              <Plus className="h-4 w-4" /> Initialize New Blueprint
           </Link>
        </Button>
      </div>

      <div className="space-y-16 pb-32">
        {Object.keys(BLUEPRINT_MAP).map((templateId) => {
          const instances = groupedByTemplate[templateId] || [];
          return (
            <section key={templateId} className="space-y-6">
              <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[2rem] border-l-8 border-l-primary">
                <div className="bg-slate-50 px-8 py-6 border-b flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl"><FolderOpen size={24} /></div>
                    <div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-white mb-1">Sub-Folder Category</Badge>
                      <h3 className="text-xl font-bold font-headline uppercase tracking-tight text-slate-900">{BLUEPRINT_MAP[templateId]}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Density</p>
                       <p className="text-xl font-black font-headline text-slate-900">{instances.length} Assets</p>
                  </div>
                </div>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="text-[9px] uppercase font-black tracking-widest pl-8">Client Association</TableHead>
                        <TableHead className="text-[9px] uppercase font-black tracking-widest">Deliverable Name</TableHead>
                        <TableHead className="text-[9px] uppercase font-black tracking-widest">Registry Date</TableHead>
                        <TableHead className="text-right text-[9px] uppercase font-black tracking-widest pr-8">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        [1,2].map(i => (
                          <TableRow key={i}>
                            <TableCell className="pl-8"><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell className="pr-8 text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                          </TableRow>
                        ))
                      ) : instances.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground italic text-[10px] uppercase font-bold tracking-widest">No deliverables committed to this sub-folder.</TableCell></TableRow>
                      ) : (
                        instances.map((inst: any) => (
                          <TableRow key={inst.id} className="group hover:bg-primary/5 transition-colors">
                            <TableCell className="pl-8"><Badge className="bg-slate-900 text-white rounded-md px-3 py-1 text-[9px] font-black tracking-widest uppercase">{inst.clientName || "UNSPECIFIED"}</Badge></TableCell>
                            <TableCell className="font-bold font-headline text-sm uppercase tracking-tight text-slate-900 group-hover:text-primary transition-colors">{inst.name || 'Strategic Design'}</TableCell>
                            <TableCell className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-2"><Clock size={12} />{inst.updatedAt?.toDate ? inst.updatedAt.toDate().toLocaleDateString() : 'Just now'}</div></TableCell>
                            <TableCell className="pr-8 text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary" title="View" asChild>
                                  <Link href={`/standard-designs/view?instanceId=${inst.id}&templateId=${inst.templateId}`}><Eye size={16} /></Link>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary" title="Edit" asChild>
                                  <Link href={`/standard-designs/${inst.templateId}?instanceId=${inst.id}&mode=edit`}><Edit size={16} /></Link>
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-rose-500" title="Delete" onClick={() => { setSelectedForDelete(inst); setIsDeleteDialogOpen(true); }}><Trash2 size={16} /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>
          );
        })}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline uppercase tracking-tighter flex items-center gap-2"><AlertCircle className="h-5 w-5 text-rose-500" />Decommission Deliverable?</AlertDialogTitle>
            <AlertDialogDescription>This action will remove "{selectedForDelete?.name}" from the registry and library. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} className="bg-rose-500 text-white" disabled={!!deletingId}>{deletingId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}Confirm Deletion</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
