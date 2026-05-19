"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { LocalDB } from '@/lib/db';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Activity, PlusCircle, Target, ClipboardList, Loader2, User, CheckCircle2, Clock, Edit2, Trash2, Dumbbell, Brain, Heart, Star } from 'lucide-react';
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ADLItem {
  category: string;
  activity: string;
  level: 0 | 1 | 2 | 3 | 4; // 0=Dependent → 4=Independent
}

interface RehabGoal {
  id: string;
  patientId: string;
  patientName: string;
  goal: string;
  targetDate: string;
  progress: number; // 0-100
  status: 'Active' | 'Achieved' | 'On Hold';
  notes?: string;
}

interface TherapySession {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  therapist: string;
  durationMins: number;
  activitiesCovered: string;
  patientResponse: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  notes: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ADL_CATEGORIES: ADLItem[] = [
  { category: 'Self-Care', activity: 'Feeding', level: 4 },
  { category: 'Self-Care', activity: 'Grooming', level: 3 },
  { category: 'Self-Care', activity: 'Bathing', level: 2 },
  { category: 'Self-Care', activity: 'Dressing', level: 3 },
  { category: 'Mobility', activity: 'Bed Mobility', level: 3 },
  { category: 'Mobility', activity: 'Transfers', level: 2 },
  { category: 'Mobility', activity: 'Ambulation', level: 1 },
  { category: 'Cognition', activity: 'Memory / Orientation', level: 3 },
  { category: 'Cognition', activity: 'Problem Solving', level: 2 },
  { category: 'Communication', activity: 'Verbal Expression', level: 4 },
];

const ADL_LEVEL_LABELS = ['Dependent', 'Max Assist', 'Mod Assist', 'Min Assist', 'Independent'];
const ADL_LEVEL_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];

const DEFAULT_GOALS: RehabGoal[] = [
  { id: 'G001', patientId: 'P001', patientName: 'Eva Green', goal: 'Independent ambulation with walker over 20m', targetDate: '2026-06-15', progress: 65, status: 'Active', notes: 'Good progress on strengthening exercises.' },
  { id: 'G002', patientId: 'P001', patientName: 'Eva Green', goal: 'Independent self-care for upper body dressing', targetDate: '2026-05-30', progress: 80, status: 'Active' },
  { id: 'G003', patientId: 'P002', patientName: 'Tom Hanks', goal: 'Return to community activities 3x/week', targetDate: '2026-07-01', progress: 30, status: 'On Hold', notes: 'Awaiting cardiac clearance.' },
];

const DEFAULT_SESSIONS: TherapySession[] = [
  { id: 'S001', patientId: 'P001', patientName: 'Eva Green', date: new Date(Date.now() - 86400000).toISOString(), therapist: 'OT Amara Silva', durationMins: 45, activitiesCovered: 'Gait training, ADL practice', patientResponse: 'Good', notes: 'Patient motivated and cooperative.' },
  { id: 'S002', patientId: 'P002', patientName: 'Tom Hanks', date: new Date(Date.now() - 172800000).toISOString(), therapist: 'OT Amara Silva', durationMins: 30, activitiesCovered: 'Cognitive exercises, fine motor tasks', patientResponse: 'Fair', notes: 'Fatigue noted mid-session.' },
];

export default function OccupationalTherapyPage() {
  const [goals, setGoals] = useState<RehabGoal[]>([]);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [adlItems, setAdlItems] = useState<ADLItem[]>(ADL_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Goal dialog
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<RehabGoal | null>(null);
  const [goalForm, setGoalForm] = useState({ patientId: '', patientName: '', goal: '', targetDate: '', progress: 0, status: 'Active' as RehabGoal['status'], notes: '' });

  // Session dialog
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState({ patientId: '', patientName: '', therapist: 'OT Amara Silva', durationMins: 45, activitiesCovered: '', patientResponse: 'Good' as TherapySession['patientResponse'], notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const storedGoals = await LocalDB.get<RehabGoal[]>('ot_goals', []);
      const storedSessions = await LocalDB.get<TherapySession[]>('ot_sessions', []);
      setGoals(storedGoals.length ? storedGoals : DEFAULT_GOALS);
      setSessions(storedSessions.length ? storedSessions : DEFAULT_SESSIONS);
      setIsLoading(false);
    };
    load();
  }, []);

  const stats = useMemo(() => ({
    activeGoals: goals.filter(g => g.status === 'Active').length,
    achievedGoals: goals.filter(g => g.status === 'Achieved').length,
    totalSessions: sessions.length,
    avgProgress: goals.length ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0,
  }), [goals, sessions]);

  // ── Goal Handlers ──────────────────────────────────────────────────────────
  const openAddGoal = () => {
    setEditingGoal(null);
    setGoalForm({ patientId: '', patientName: '', goal: '', targetDate: '', progress: 0, status: 'Active', notes: '' });
    setIsGoalDialogOpen(true);
  };

  const openEditGoal = (g: RehabGoal) => {
    setEditingGoal(g);
    setGoalForm({ patientId: g.patientId, patientName: g.patientName, goal: g.goal, targetDate: g.targetDate, progress: g.progress, status: g.status, notes: g.notes || '' });
    setIsGoalDialogOpen(true);
  };

  const saveGoal = async () => {
    if (!goalForm.patientName || !goalForm.goal) { toast({ variant: 'destructive', title: 'Validation', description: 'Patient name and goal are required.' }); return; }
    setIsSaving(true);
    const updated = editingGoal
      ? goals.map(g => g.id === editingGoal.id ? { ...g, ...goalForm } : g)
      : [...goals, { ...goalForm, id: `G-${Date.now()}` }];
    setGoals(updated);
    await LocalDB.save('ot_goals', updated);
    setIsGoalDialogOpen(false);
    setIsSaving(false);
    toast({ title: 'Goal Saved', description: 'Rehabilitation goal updated.' });
  };

  const deleteGoal = async (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    await LocalDB.save('ot_goals', updated);
    toast({ title: 'Goal Removed' });
  };

  // ── Session Handlers ───────────────────────────────────────────────────────
  const saveSession = async () => {
    if (!sessionForm.patientName || !sessionForm.activitiesCovered) { toast({ variant: 'destructive', title: 'Validation', description: 'Patient name and activities are required.' }); return; }
    setIsSaving(true);
    const newSession: TherapySession = { ...sessionForm, id: `S-${Date.now()}`, date: new Date().toISOString() };
    const updated = [newSession, ...sessions];
    setSessions(updated);
    await LocalDB.save('ot_sessions', updated);
    setIsSessionDialogOpen(false);
    setIsSaving(false);
    toast({ title: 'Session Logged', description: `Session recorded for ${sessionForm.patientName}.` });
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Loading Occupational Therapy module...</p>
    </div>
  );

  const responseColor: Record<TherapySession['patientResponse'], string> = {
    Excellent: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    Good: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    Fair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Poor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* Premium Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 p-6 md:p-8 text-white shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Dumbbell className="h-8 w-8" /> Occupational Therapy
            </h1>
            <p className="text-purple-100 mt-2 text-sm md:text-base max-w-2xl">
              Track Activities of Daily Living, manage patient rehabilitation goals, and log therapy sessions for longitudinal recovery monitoring.
            </p>
          </div>
          <div className="flex gap-2 self-start md:self-auto">
            <Button onClick={() => setIsSessionDialogOpen(true)} variant="secondary" className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/20">
              <PlusCircle className="h-4 w-4" /> Log Session
            </Button>
            <Button onClick={openAddGoal} className="gap-2 bg-white text-purple-700 hover:bg-purple-50">
              <Target className="h-4 w-4" /> New Goal
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Goals', value: stats.activeGoals, icon: Target, color: 'text-violet-600', border: 'border-l-violet-600' },
          { label: 'Goals Achieved', value: stats.achievedGoals, icon: CheckCircle2, color: 'text-emerald-600', border: 'border-l-emerald-600' },
          { label: 'Sessions Logged', value: stats.totalSessions, icon: ClipboardList, color: 'text-blue-600', border: 'border-l-blue-600' },
          { label: 'Avg Goal Progress', value: `${stats.avgProgress}%`, icon: Activity, color: 'text-purple-600', border: 'border-l-purple-600' },
        ].map(k => (
          <Card key={k.label} className={`shadow-sm border-l-4 ${k.border} hover:shadow-md transition-all hover:translate-y-[-2px]`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground">{k.label}</CardTitle>
              <k.icon className={`h-5 w-5 ${k.color}`} />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{k.value}</div></CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="goals" className="flex items-center gap-2"><Target className="h-4 w-4" /> Rehab Goals</TabsTrigger>
          <TabsTrigger value="adl" className="flex items-center gap-2"><Brain className="h-4 w-4" /> ADL Assessment</TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Session Log</TabsTrigger>
        </TabsList>

        {/* ── Goals Tab ─────────────────────────────────────────────────────── */}
        <TabsContent value="goals" className="space-y-4">
          {goals.length === 0 ? (
            <Card className="shadow-sm"><CardContent className="py-12 text-center text-muted-foreground">No rehabilitation goals configured yet.</CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {goals.map(g => (
                <Card key={g.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                          <User className="h-4 w-4 text-muted-foreground" /> {g.patientName}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">ID: {g.patientId}</CardDescription>
                      </div>
                      <Badge variant="outline" className={cn('text-xs shrink-0', g.status === 'Achieved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : g.status === 'On Hold' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200')}>
                        {g.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm font-medium leading-snug">{g.goal}</p>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span><span className="font-semibold text-foreground">{g.progress}%</span>
                      </div>
                      <Progress value={g.progress} className="h-2" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> Target: {new Date(g.targetDate).toLocaleDateString()}
                    </div>
                    {g.notes && <p className="text-xs text-muted-foreground italic border-t pt-2">{g.notes}</p>}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => openEditGoal(g)}><Edit2 className="h-3 w-3 mr-1" /> Edit</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteGoal(g.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── ADL Tab ───────────────────────────────────────────────────────── */}
        <TabsContent value="adl">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Activities of Daily Living Assessment</CardTitle>
              <CardDescription>Standardised functional independence scoring (0 = Dependent → 4 = Independent)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Independence Level</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adlItems.map((item, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-semibold text-muted-foreground">{item.category}</TableCell>
                      <TableCell className="font-medium">{item.activity}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0,1,2,3,4].map(l => (
                              <button
                                key={l}
                                onClick={() => setAdlItems(prev => prev.map((it, idx) => idx === i ? {...it, level: l as ADLItem['level']} : it))}
                                className={cn('h-5 w-5 rounded-sm transition-all border', l <= item.level ? ADL_LEVEL_COLORS[item.level] + ' border-transparent' : 'bg-muted border-muted-foreground/20')}
                              />
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{ADL_LEVEL_LABELS[item.level]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sessions Tab ──────────────────────────────────────────────────── */}
        <TabsContent value="sessions">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Therapy Session Log</CardTitle>
                <CardDescription>Chronological record of all completed OT sessions.</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsSessionDialogOpen(true)} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                <PlusCircle className="h-4 w-4" /> Log Session
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Therapist</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Activities</TableHead>
                    <TableHead>Response</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map(s => (
                    <TableRow key={s.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs">{new Date(s.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">{s.patientName}</TableCell>
                      <TableCell className="text-sm">{s.therapist}</TableCell>
                      <TableCell className="text-sm">{s.durationMins} min</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{s.activitiesCovered}</TableCell>
                      <TableCell>
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', responseColor[s.patientResponse])}>
                          {s.patientResponse}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Goal Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Rehabilitation Goal' : 'Add Rehabilitation Goal'}</DialogTitle>
            <DialogDescription>Define a measurable, time-bound recovery target for the patient.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label htmlFor="goalPtName">Patient Name</Label><Input id="goalPtName" value={goalForm.patientName} onChange={e => setGoalForm(p => ({...p, patientName: e.target.value}))} placeholder="Full name" /></div>
              <div className="space-y-1"><Label htmlFor="goalPtId">Patient ID</Label><Input id="goalPtId" value={goalForm.patientId} onChange={e => setGoalForm(p => ({...p, patientId: e.target.value}))} placeholder="P001" /></div>
            </div>
            <div className="space-y-1"><Label htmlFor="goalText">Goal Description</Label><Textarea id="goalText" value={goalForm.goal} onChange={e => setGoalForm(p => ({...p, goal: e.target.value}))} placeholder="e.g. Independent ambulation over 20m with walker" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label htmlFor="goalDate">Target Date</Label><Input id="goalDate" type="date" value={goalForm.targetDate} onChange={e => setGoalForm(p => ({...p, targetDate: e.target.value}))} /></div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={goalForm.status} onValueChange={(v: any) => setGoalForm(p => ({...p, status: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Achieved">Achieved</SelectItem><SelectItem value="On Hold">On Hold</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="goalProgress">Progress: {goalForm.progress}%</Label>
              <input id="goalProgress" type="range" min={0} max={100} step={5} value={goalForm.progress} onChange={e => setGoalForm(p => ({...p, progress: Number(e.target.value)}))} className="w-full accent-violet-600" />
            </div>
            <div className="space-y-1"><Label htmlFor="goalNotes">Clinical Notes</Label><Textarea id="goalNotes" value={goalForm.notes} onChange={e => setGoalForm(p => ({...p, notes: e.target.value}))} placeholder="Optional" rows={2} /></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={saveGoal} disabled={isSaving} className="bg-violet-600 hover:bg-violet-700 text-white">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Session Dialog ────────────────────────────────────────────────── */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Therapy Session</DialogTitle>
            <DialogDescription>Record a completed occupational therapy session.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Patient Name</Label><Input value={sessionForm.patientName} onChange={e => setSessionForm(p => ({...p, patientName: e.target.value}))} placeholder="Full name" /></div>
              <div className="space-y-1"><Label>Patient ID</Label><Input value={sessionForm.patientId} onChange={e => setSessionForm(p => ({...p, patientId: e.target.value}))} placeholder="P001" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Therapist</Label><Input value={sessionForm.therapist} onChange={e => setSessionForm(p => ({...p, therapist: e.target.value}))} /></div>
              <div className="space-y-1"><Label>Duration (mins)</Label><Input type="number" value={sessionForm.durationMins} onChange={e => setSessionForm(p => ({...p, durationMins: Number(e.target.value)}))} min={5} max={180} /></div>
            </div>
            <div className="space-y-1"><Label>Activities Covered</Label><Textarea value={sessionForm.activitiesCovered} onChange={e => setSessionForm(p => ({...p, activitiesCovered: e.target.value}))} placeholder="e.g. Gait training, upper limb strengthening, ADL practice" rows={2} /></div>
            <div className="space-y-1">
              <Label>Patient Response</Label>
              <Select value={sessionForm.patientResponse} onValueChange={(v: any) => setSessionForm(p => ({...p, patientResponse: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['Excellent','Good','Fair','Poor'] as const).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Session Notes</Label><Textarea value={sessionForm.notes} onChange={e => setSessionForm(p => ({...p, notes: e.target.value}))} placeholder="Observations, adjustments, next steps..." rows={2} /></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={saveSession} disabled={isSaving} className="bg-violet-600 hover:bg-violet-700 text-white">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
