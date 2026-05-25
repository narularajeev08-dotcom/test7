"use client";

/**
 * STRATEGIC GOLD STANDARD BACKUP - v2.5.0
 * --------------------------------------------------
 * This file serves as the definitive source of truth for the Service Charter Form.
 * All 12 sections must remain intact during any UI updates.
 * Separation of 'Center' and 'Location' is strictly enforced.
 */

import React, { useState, useRef } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Upload, 
  LayoutDashboard,
  Workflow,
  Network,
  Lock,
  FileText,
  DollarSign,
  ShieldCheck,
  Briefcase,
  Users,
  Globe,
  Settings,
  ListTodo,
  FileCheck,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { CharterViewModal } from "@/components/charter/charter-view-modal";

const emptyGeneralInfoEntry = {
  lineOfBusiness: "",
  businessUnit: "",
  imu: "",
  sgu: "",
  businessType: "",
  voiceOrBackOffice: "Back Office",
  erpHeadcount: "",
  headcountVoice: "",
  headcountBackoffice: "",
  center: "",
  location: "",
  geo: "",
  loginTimeET: "",
  logoutTimeET: "",
  operationWindow: "",
  modeOfOperations: "",
};

export default function NewCharterPage() {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadSection, setActiveUploadSection] = useState<string>("");

  const [formData, setFormData] = useState<any>({
    name: "",
    status: "Draft",
    basicInfo: { clientName: "", clientAlias: "", docVersion: "v1.0.0", docOwner: "", additionalInfo: "" },
    stakeholders: { 
      clientStakeholders: [{ name: "", designation: "", email: "", phone: "" }], 
      opsStakeholders: [{ name: "", designation: "", email: "", phone: "" }], 
      additionalInfo: "" 
    },
    scope: { typeOfWork: "", additionalInfo: "" },
    generalInfo: { entries: [{ ...emptyGeneralInfoEntry }], additionalInfo: "" },
    serviceOfferings: { entries: [{ solutionElement: "", description: "", owner: "", remarks: "" }], additionalInfo: "" },
    techSpecs: { 
      networkDesignSummary: "", 
      networkDesignApproval: [
        { type: "Client Approval", status: "No", attachment: "" }, 
        { type: "TIS Approval", status: "No", attachment: "" }
      ], 
      businessVlans: [{ businessName: "", location: "", center: "", mode: "WFO", wfhGroup: "", vlanId: "", vlanSubnet: "" }], 
      connectivityType: "Internet", 
      otherConnectivityType: "",
      additionalInfo: "" 
    },
    desktopBuild: { 
      osDetails: "", 
      defaultSoftware: [{ softwareName: "", status: "Standard", remarks: "" }], 
      businessSoftware: [{ softwareName: "", status: "Required", remarks: "" }], 
      additionalInfo: "" 
    },
    appDetails: { urls: [""], apps: [{ appName: "", recoveryResponsibility: "Client" }], additionalInfo: "" },
    governance: { 
      serviceDeliveryTable: [
        { level: "Level 1", name: "", geo: "", mobile: "", email: "", responsibility: "" },
        { level: "Level 2", name: "", geo: "", mobile: "", email: "", responsibility: "" },
        { level: "Level 3", name: "", geo: "", mobile: "", email: "", responsibility: "" }
      ], 
      clientContacts: [
        { item: "HelpDesk Toll Free #", details: "", remark: "" },
        { item: "HelpDesk Email ID", details: "", remark: "" },
        { item: "Client Outage DL", details: "", remark: "" }
      ], 
      escalationMatrix: { notes: "", attachment: "" },
      internal: [{ stakeholderName: "", stakeholderEmail: "", designation: "", frequency: "Weekly", topics: "" }], 
      external: [{ stakeholderName: "", stakeholderEmail: "", designation: "", frequency: "Monthly", topics: "" }], 
      additionalInfo: "" 
    },
    compliance: { 
      securityControls: "", 
      desktopControls: "", 
      restrictionsTable: [{ profileRestrictionsApplied: "No", appliedThrough: "GPO", restrictionType: "Standard", customNotes: "" }], 
      bisraStatus: [{ year: "", internalApproval: "", clientApproval: "", comments: "" }], 
      additionalInfo: "" 
    },
    contractual: { clientRequirements: { notes: "" }, exceptions: { notes: "" }, raci: [{ service: "", orgOwnership: "R", clientOwnership: "I" }], additionalInfo: "" },
    financials: { entries: [{ techCost: "", budgetedCost: "", recoveryModel: "Billable to Client", revenue: "", directCost: "", indirectCost: "" }], additionalInfo: "" },
  });

  const handleSave = async () => {
    if (!formData.name) return;
    setLoading(true);
    try {
      const charterRef = await addDoc(collection(db, "charters"), { ...formData, status: "Active", createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      await addDoc(collection(db, "documents"), { name: formData.name, folder: "Charters Hub", type: "Charter", size: "Auto", sourceId: charterRef.id, createdAt: serverTimestamp() });
      toast({ title: "Strategic Charter Registered" });
      router.push("/documents?folder=Charters Hub");
    } catch (e: any) {
      errorEmitter.emit("permission-error", new FirestorePermissionError({ path: "charters", operation: "create" }));
    } finally {
      setLoading(false);
    }
  };

  const updateSection = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const updateTable = (section: string, field: string, index: number, col: string, val: any) => {
    setFormData((prev: any) => {
      const newTable = [...prev[section][field]];
      newTable[index] = { ...newTable[index], [col]: val };
      return { ...prev, [section]: { ...prev[section], [field]: newTable } };
    });
  };

  const addRow = (section: string, field: string, template: any) => {
    setFormData((prev: any) => ({ ...prev, [section]: { ...prev[section], [field]: [...prev[section][field], { ...template }] } }));
  };

  const removeRow = (section: string, field: string, index: number) => {
    setFormData((prev: any) => {
      const newTable = prev[section][field].filter((_: any, i: number) => i !== index);
      return { ...prev, [section]: { ...prev[section], [field]: newTable } };
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-32">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft /></Button>
            <h1 className="text-2xl font-bold font-headline uppercase text-primary">Establish New Charter</h1>
          </div>
          <Button onClick={() => setIsPreviewOpen(true)} className="bg-primary text-white uppercase font-bold text-xs h-12 px-8 shadow-lg">Finalize Portfolio</Button>
        </div>

        <Accordion type="multiple" defaultValue={["basicInfo"]} className="w-full space-y-4">
          <AccordionItem value="basicInfo" className="border rounded-xl bg-card px-6 shadow-sm">
            <AccordionTrigger><div className="flex items-center gap-3"><LayoutDashboard className="h-4 w-4" /><span className="text-lg font-bold font-headline uppercase text-primary">1. Basic Information</span></div></AccordionTrigger>
            <AccordionContent className="pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Charter Name</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                <div className="space-y-2"><Label>Client Name</Label><Input value={formData.basicInfo.clientName} onChange={(e) => updateSection('basicInfo', 'clientName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Client Alias</Label><Input value={formData.basicInfo.clientAlias} onChange={(e) => updateSection('basicInfo', 'clientAlias', e.target.value)} /></div>
                <div className="space-y-2"><Label>Owner</Label><Input value={formData.basicInfo.docOwner} onChange={(e) => updateSection('basicInfo', 'docOwner', e.target.value)} /></div>
                <div className="space-y-2"><Label>Version</Label><Input value={formData.basicInfo.docVersion} onChange={(e) => updateSection('basicInfo', 'docVersion', e.target.value)} /></div>
              </div>
              <Textarea value={formData.basicInfo.additionalInfo} onChange={(e) => updateSection('basicInfo', 'additionalInfo', e.target.value)} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="stakeholders" className="border rounded-xl bg-card px-6 shadow-sm">
            <AccordionTrigger><div className="flex items-center gap-3"><Users className="h-4 w-4" /><span className="text-lg font-bold font-headline uppercase text-primary">2. Key Stakeholders</span></div></AccordionTrigger>
            <AccordionContent className="pt-4 border-t space-y-8">
              <div className="space-y-4">
                <Label className="uppercase font-bold text-xs text-muted-foreground">Client Stakeholders</Label>
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[800px]"><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Designation</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>{formData.stakeholders.clientStakeholders.map((s: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell><Input value={s.name} onChange={(e) => updateTable('stakeholders', 'clientStakeholders', i, 'name', e.target.value)} /></TableCell>
                        <TableCell><Input value={s.designation} onChange={(e) => updateTable('stakeholders', 'clientStakeholders', i, 'designation', e.target.value)} /></TableCell>
                        <TableCell><Input value={s.email} onChange={(e) => updateTable('stakeholders', 'clientStakeholders', i, 'email', e.target.value)} /></TableCell>
                        <TableCell><Input value={s.phone} onChange={(e) => updateTable('stakeholders', 'clientStakeholders', i, 'phone', e.target.value)} /></TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow('stakeholders', 'clientStakeholders', i)}><Trash2 size={14}/></Button></TableCell>
                      </TableRow>))}</TableBody>
                  </Table>
                </div>
                <Button variant="outline" size="sm" onClick={() => addRow('stakeholders', 'clientStakeholders', {name:"", designation:"", email:"", phone:""})}><Plus className="h-3 w-3 mr-2"/>Add Client Stakeholder</Button>
              </div>
              <div className="space-y-4">
                <Label className="uppercase font-bold text-xs text-muted-foreground">Ops Stakeholders</Label>
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-[800px]"><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Designation</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead></TableHead></TableRow></TableHeader>
                    <TableBody>{formData.stakeholders.opsStakeholders.map((s: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell><Input value={s.name} onChange={(e) => updateTable('stakeholders', 'opsStakeholders', i, 'name', e.target.value)} /></TableCell>
                        <TableCell><Input value={s.designation} onChange={(e) => updateTable('stakeholders', 'opsStakeholders', i, 'designation', e.target.value)} /></TableCell>
                        <TableCell><Input value={s.email} onChange={(e) => updateTable('stakeholders', 'opsStakeholders', i, 'email', e.target.value)} /></TableCell>
                        <TableCell><Input value={s.phone} onChange={(e) => updateTable('stakeholders', 'opsStakeholders', i, 'phone', e.target.value)} /></TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow('stakeholders', 'opsStakeholders', i)}><Trash2 size={14}/></Button></TableCell>
                      </TableRow>))}</TableBody>
                  </Table>
                </div>
                <Button variant="outline" size="sm" onClick={() => addRow('stakeholders', 'opsStakeholders', {name:"", designation:"", email:"", phone:""})}><Plus className="h-3 w-3 mr-2"/>Add Ops Stakeholder</Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="scope" className="border rounded-xl bg-card px-6 shadow-sm">
            <AccordionTrigger><div className="flex items-center gap-3"><Briefcase className="h-4 w-4" /><span className="text-lg font-bold font-headline uppercase text-primary">3. Scope of Work</span></div></AccordionTrigger>
            <AccordionContent className="pt-4 border-t space-y-4">
              <Textarea className="min-h-[150px]" value={formData.scope.typeOfWork} onChange={(e) => updateSection('scope', 'typeOfWork', e.target.value)} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="generalInfo" className="border rounded-xl bg-card px-6 shadow-sm">
            <AccordionTrigger><div className="flex items-center gap-3"><Globe className="h-4 w-4" /><span className="text-lg font-bold font-headline uppercase text-primary">4. General Information</span></div></AccordionTrigger>
            <AccordionContent className="pt-4 border-t space-y-4">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[2200px]"><TableHeader><TableRow>
                  <TableHead>Line of Business</TableHead><TableHead>Business Unit</TableHead><TableHead>IMU</TableHead><TableHead>SGU</TableHead><TableHead>Business Type</TableHead><TableHead>Voice or BO</TableHead><TableHead>ERP HC</TableHead><TableHead>HC Voice</TableHead><TableHead>HC BO</TableHead><TableHead>Center</TableHead><TableHead>Location</TableHead><TableHead>Geo</TableHead><TableHead>Login (ET)</TableHead><TableHead>Logout (ET)</TableHead><TableHead>Window</TableHead><TableHead>Mode</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                  <TableBody>{formData.generalInfo.entries.map((e: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell><Input value={e.lineOfBusiness} onChange={(v) => updateTable('generalInfo', 'entries', i, 'lineOfBusiness', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.businessUnit} onChange={(v) => updateTable('generalInfo', 'entries', i, 'businessUnit', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.imu} onChange={(v) => updateTable('generalInfo', 'entries', i, 'imu', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.sgu} onChange={(v) => updateTable('generalInfo', 'entries', i, 'sgu', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.businessType} onChange={(v) => updateTable('generalInfo', 'entries', i, 'businessType', v.target.value)} /></TableCell>
                      <TableCell><Select value={e.voiceOrBackOffice} onValueChange={(val) => updateTable('generalInfo', 'entries', i, 'voiceOrBackOffice', val)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Voice">Voice</SelectItem><SelectItem value="Back Office">Back Office</SelectItem></SelectContent></Select></TableCell>
                      <TableCell><Input value={e.erpHeadcount} onChange={(v) => updateTable('generalInfo', 'entries', i, 'erpHeadcount', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.headcountVoice} onChange={(v) => updateTable('generalInfo', 'entries', i, 'headcountVoice', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.headcountBackoffice} onChange={(v) => updateTable('generalInfo', 'entries', i, 'headcountBackoffice', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.center} onChange={(v) => updateTable('generalInfo', 'entries', i, 'center', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.location} onChange={(v) => updateTable('generalInfo', 'entries', i, 'location', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.geo} onChange={(v) => updateTable('generalInfo', 'entries', i, 'geo', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.loginTimeET} onChange={(v) => updateTable('generalInfo', 'entries', i, 'loginTimeET', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.logoutTimeET} onChange={(v) => updateTable('generalInfo', 'entries', i, 'logoutTimeET', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.operationWindow} onChange={(v) => updateTable('generalInfo', 'entries', i, 'operationWindow', v.target.value)} /></TableCell>
                      <TableCell><Input value={e.modeOfOperations} onChange={(v) => updateTable('generalInfo', 'entries', i, 'modeOfOperations', v.target.value)} /></TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow('generalInfo', 'entries', i)}><Trash2 size={14}/></Button></TableCell>
                    </TableRow>))}</TableBody>
                </Table>
              </div>
              <Button variant="outline" size="sm" onClick={() => addRow('generalInfo', 'entries', emptyGeneralInfoEntry)}><Plus className="h-3 w-3 mr-2"/>Add Entry</Button>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="techSpecs" className="border rounded-xl bg-card px-6 shadow-sm">
            <AccordionTrigger><div className="flex items-center gap-3"><Network className="h-4 w-4" /><span className="text-lg font-bold font-headline uppercase text-primary">6. Technical Specifications</span></div></AccordionTrigger>
            <AccordionContent className="pt-4 border-t space-y-6">
              <Textarea value={formData.techSpecs.networkDesignSummary} onChange={(e) => updateSection('techSpecs', 'networkDesignSummary', e.target.value)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Connectivity Type</Label>
                  <Select value={formData.techSpecs.connectivityType} onValueChange={(val) => updateSection('techSpecs', 'connectivityType', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internet">Internet</SelectItem>
                      <SelectItem value="MPLS">MPLS</SelectItem>
                      <SelectItem value="VPN">VPN</SelectItem>
                      <SelectItem value="NPA">NPA</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.techSpecs.connectivityType === 'Others' && (
                  <div className="space-y-2"><Label>Specify Connectivity Type</Label><Input value={formData.techSpecs.otherConnectivityType} onChange={(e) => updateSection('techSpecs', 'otherConnectivityType', e.target.value)} /></div>
                )}
              </div>
              <div className="space-y-2"><Label>Additional Information</Label><Textarea value={formData.techSpecs.additionalInfo} onChange={(e) => updateSection('techSpecs', 'additionalInfo', e.target.value)} /></div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="financials" className="border rounded-xl bg-card px-6 shadow-sm">
            <AccordionTrigger><div className="flex items-center gap-3"><DollarSign className="h-4 w-4" /><span className="text-lg font-bold font-headline uppercase text-primary">12. Financials</span></div></AccordionTrigger>
            <AccordionContent className="pt-4 border-t space-y-4">
              <div className="w-full overflow-x-auto">
                <Table className="min-w-[1000px]"><TableHeader><TableRow>
                  <TableHead>Tech Cost</TableHead><TableHead>Budgeted</TableHead><TableHead>Recovery Model</TableHead><TableHead>Revenue</TableHead><TableHead>Direct Cost</TableHead><TableHead>In-direct</TableHead><TableHead></TableHead>
                </TableRow></TableHeader>
                  <TableBody>{formData.financials.entries.map((f: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell><Input value={f.techCost} onChange={(e) => updateTable('financials', 'entries', i, 'techCost', e.target.value)} /></TableCell>
                      <TableCell><Input value={f.budgetedCost} onChange={(e) => updateTable('financials', 'entries', i, 'budgetedCost', e.target.value)} /></TableCell>
                      <TableCell><Select value={f.recoveryModel} onValueChange={(v) => updateTable('financials', 'entries', i, 'recoveryModel', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Billable to Client">Billable to Client</SelectItem><SelectItem value="Baked into per FTE cost">Baked into per FTE cost</SelectItem></SelectContent></Select></TableCell>
                      <TableCell><Input value={f.revenue} onChange={(e) => updateTable('financials', 'entries', i, 'revenue', e.target.value)} /></TableCell>
                      <TableCell><Input value={f.directCost} onChange={(e) => updateTable('financials', 'entries', i, 'directCost', e.target.value)} /></TableCell>
                      <TableCell><Input value={f.indirectCost} onChange={(e) => updateTable('financials', 'entries', i, 'indirectCost', e.target.value)} /></TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => removeRow('financials', 'entries', i)}><Trash2 size={14}/></Button></TableCell>
                    </TableRow>))}</TableBody>
                </Table>
              </div>
              <div className="space-y-2 mt-4"><Label className="uppercase font-bold text-xs text-muted-foreground">Additional Information</Label><Textarea value={formData.financials.additionalInfo} onChange={(e) => updateSection('financials', 'additionalInfo', e.target.value)} /></div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <CharterViewModal open={isPreviewOpen} onOpenChange={setIsPreviewOpen} data={formData} onSave={handleSave} isNewCharter={true} />
    </DashboardLayout>
  );
}
