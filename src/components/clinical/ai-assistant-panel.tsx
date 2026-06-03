"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertCircle, ShieldCheck, History, Send, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { addToQueue, getAIQueue, syncQueue, type AIQueueItem } from "@/lib/clinical-ai-queue";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from "@/lib/i18n";
import { sanitizePatientData, sanitizeText } from "@/lib/phi-sanitizer";

function getLocalFallbackSuggestion(department?: string, patientData?: any, currentLocale?: string): string {
  const isPt = currentLocale === 'pt';
  const complaint = (patientData?.chiefComplaint || "").toLowerCase();
  
  if (department === "Emergency Room") {
    if (complaint.includes("chest") || complaint.includes("dor") || complaint.includes("peito")) {
      return isPt 
        ? `**Sugestão Offline Local (Protocolo de Dor Torácica)**:\n1. Obter ECG de 12 derivações imediatamente.\n2. Administrar Aspirina 300mg VO se não houver contraindicação.\n3. Monitorar sinais vitais continuamente. Alto risco de IAM.\n4. Manter desfibrilador ao lado do leito.`
        : `**Local Offline Suggestion (Chest Pain Protocol)**:\n1. Immediately obtain 12-lead ECG and Troponin levels.\n2. Administer Aspirin 300mg PO if not contraindicated.\n3. Monitor vitals continuously. High risk of myocardial infarction.\n4. Keep emergency resuscitation cart at bedside.`;
    }
    return isPt 
      ? `**Sugestão Offline Local (Protocolo de Triagem Urgente)**:\n1. Avaliar Vias Aéreas, Respiração e Circulação (ABC).\n2. Estabelecer acesso venoso periférico se instável.\n3. Iniciar monitorização contínua de sinais vitais.`
      : `**Local Offline Suggestion (Urgent Triage Protocol)**:\n1. Assess ABCs (Airway, Breathing, Circulation).\n2. Establish IV access if unstable.\n3. Monitor vital signs continuously.`;
  }
  
  return isPt 
    ? `**Sugestão Offline Local (Protocolo Geral)**:\n1. Revisar histórico clínico, alergias e medicações ativas.\n2. Realizar exame físico direcionado à queixa principal.\n3. Solicitar exames básicos de triagem (Hemograma, PCR) se indicado.`
    : `**Local Offline Suggestion (General Protocol)**:\n1. Review clinical history, active allergies, and medications.\n2. Perform physical examination targeted to chief complaint.\n3. Order basic screening tests (CBC, CRP) as indicated.`;
}

// Client-side session caching for AI recommendations to prevent redundant LLM generation overhead
const getAICacheKey = (prompt: string, department?: string, patientData?: any) => {
  const patientHash = patientData ? `${patientData.id || ''}-${patientData.chiefComplaint || ''}-${JSON.stringify(patientData.vitals || {})}` : '';
  return `ai_cache_${department || 'general'}_${prompt.trim()}_${patientHash}`;
};

const getCachedAIResult = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(key);
};

const setCachedAIResult = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    console.warn("AI cache write failed:", e);
  }
};

interface AIAssistantPanelProps {
  context?: string;
  department?: string;
  patientData?: any;
  onAcceptSuggestion?: (suggestion: string) => void;
}

export function AIAssistantPanel({ context, department, patientData, onAcceptSuggestion }: AIAssistantPanelProps) {
  const { currentLocale } = useLocale();
  const t = useMemo(() => getTranslator(currentLocale), [currentLocale]);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const queue = getAIQueue();
    setPendingCount(queue.filter(i => i.status === 'pending').length);
    
    const updateOnlineStatus = () => setIsOfflineMode(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    setIsOfflineMode(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleAIRequest = async () => {
    if (!prompt.trim() && !patientData) return;

    const sanitizedPatient = sanitizePatientData(patientData);
    const sanitizedPrompt = sanitizeText(prompt);

    if (isOfflineMode) {
      handleQueueRequest();
      const offlineSug = getLocalFallbackSuggestion(department, sanitizedPatient, currentLocale);
      setResult(`${offlineSug}\n\n*${t('ai.assistant.result.queued')}*`);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(""); // Clear previous result to prepare for incoming stream

    const cacheKey = getAICacheKey(sanitizedPrompt, department, sanitizedPatient);
    const cachedResult = getCachedAIResult(cacheKey);

    if (cachedResult) {
      setResult(cachedResult);
      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await fetch('/api/clinical-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: sanitizedPrompt || (currentLocale === 'pt' ? 'Analise os dados atuais do paciente para potenciais anomalias ou otimizações de tratamento.' : 'Analyze the current patient data for potential anomalies or treatment optimizations.'),
          department,
          patientData: sanitizedPatient,
          currentLocale,
          context
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze data");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Unable to read streaming response from AI assistant API");
      }

      const decoder = new TextDecoder("utf-8");
      let done = false;
      let streamedResult = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          streamedResult += chunk;
          setResult(streamedResult);
        }
      }

      // Save streamed result in memory cache
      setCachedAIResult(cacheKey, streamedResult);
    } catch (err: any) {
      console.error("AI Assistant Error:", err);
      setError(t('ai.assistant.error.connectivity'));
      const localSug = getLocalFallbackSuggestion(department, sanitizedPatient, currentLocale);
      setResult(`${localSug}\n\n*${t('ai.assistant.result.queued')}*`);
      setTimeout(() => {
        handleQueueRequest();
      }, 2000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQueueRequest = () => {
    const sanitizedPatient = sanitizePatientData(patientData);
    addToQueue({
      requestId: Math.random().toString(36).substring(7),
      department: department || "General",
      prompt: prompt || (currentLocale === 'pt' ? "Auditoria Completa do Caso" : "Full Case Audit"),
      context: sanitizedPatient,
      patientName: sanitizedPatient?.fullName || "REDACTED_PATIENT",
      patientId: sanitizedPatient?.id,
      locale: currentLocale
    });
    setPendingCount(prev => prev + 1);
    setPrompt("");
    setError(null);
  };

  const handleSync = async () => {
    setIsAnalyzing(true);
    try {
      await syncQueue((id, res, err) => {
        if (res) setPendingCount(prev => Math.max(0, prev - 1));
      });
      setShowQueue(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className={cn("border-primary/20 shadow-sm transition-all duration-300", isOfflineMode ? "bg-orange-50/50" : "bg-primary/5")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            {t('ai.assistant.title')}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isOfflineMode && (
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 gap-1 flex items-center">
                <WifiOff className="h-3 w-3" /> {t('ai.assistant.badge.offline')}
              </Badge>
            )}
            <Badge variant="outline" className="bg-background/50 border-primary/20 text-[10px] uppercase tracking-wider">
              {t('ai.assistant.badge.decisionSupport')}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          {isOfflineMode 
            ? t('ai.assistant.desc.offline')
            : t('ai.assistant.desc.online')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea 
            placeholder={isOfflineMode ? t('ai.assistant.placeholder.offline') : t('ai.assistant.placeholder.online')} 
            className="text-sm bg-background/80 resize-none min-h-[80px]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex justify-between items-center">
             <Button
               variant="ghost"
               size="sm"
               className="text-[10px] flex items-center gap-1.5 h-8"
               onClick={() => setShowQueue(!showQueue)}
             >
               <History className="h-3.5 w-3.5" />
               {t('ai.assistant.button.auditQueue')} ({pendingCount})
             </Button>
            <Button 
                size="sm" 
                onClick={handleAIRequest} 
                disabled={isAnalyzing}
                className={cn(isOfflineMode ? "bg-orange-600 hover:bg-orange-700" : "bg-primary hover:bg-primary/90")}
            >
              {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isOfflineMode ? <RefreshCw className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />)}
              {isAnalyzing ? t('ai.assistant.button.analyzing') : (isOfflineMode ? t('ai.assistant.button.queueForAudit') : t('ai.assistant.button.queryAI'))}
            </Button>
          </div>
        </div>

        {showQueue && (
           <div className="border rounded-md bg-background/80 max-h-[200px] overflow-y-auto p-2 space-y-2">
              <div className="flex justify-between items-center px-1 mb-2">
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground">{t('ai.assistant.history.title')}</h4>
                {pendingCount > 0 && !isOfflineMode && (
                  <Button variant="link" size="sm" className="h-auto p-0 text-[10px]" onClick={handleSync}>{t('ai.assistant.button.syncNow')}</Button>
                )}
              </div>
              {getAIQueue().map((item) => (
                <div key={item.id} className="text-[10px] p-2 border rounded bg-background flex justify-between items-start">
                   <div className="space-y-1">
                      <p className="font-semibold">{item.patientName || (currentLocale === 'pt' ? 'Paciente Anónimo' : 'Anonymous Patient')}</p>
                      <p className="text-muted-foreground line-clamp-1">{item.prompt}</p>
                      {item.result && <p className="text-primary italic mt-1 bg-primary/5 p-1 rounded">{t('ai.assistant.history.insightAvailable')}</p>}
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      {item.status === 'completed' ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Loader2 className={cn("h-3 w-3", item.status === 'syncing' ? "animate-spin" : "text-muted-foreground")} />}
                      <span className="text-[9px] opacity-50">{new Date(item.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>
              ))}
              {getAIQueue().length === 0 && <p className="text-center text-[10px] py-4 text-muted-foreground">{t('ai.assistant.history.empty')}</p>}
           </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex gap-2 text-destructive text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="p-4 bg-background border rounded-md shadow-sm relative group overflow-hidden">
               <div className={cn("absolute top-0 left-0 w-1 h-full", isOfflineMode && result.includes(t('ai.assistant.result.queued')) ? "bg-orange-500" : "bg-primary")} />
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                   <ShieldCheck className="h-3 w-3" /> {isOfflineMode && result.includes(t('ai.assistant.result.queued')) ? t('ai.assistant.result.queueConfirmation') : t('ai.assistant.result.verifiableSuggestion')}
                 </span>
                 <span className="text-[10px] text-muted-foreground">{new Date().toLocaleTimeString()}</span>
               </div>
               <div className={cn("text-sm leading-relaxed whitespace-pre-wrap text-foreground", !result.includes(t('ai.assistant.result.queued')) && "italic")}>
                 {result}
               </div>

               {onAcceptSuggestion && !result.includes(t('ai.assistant.result.queued')) && (
                 <div className="mt-4 flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs h-8 border-primary/30 hover:bg-primary/10"
                      onClick={() => onAcceptSuggestion(result)}
                    >
                      <ShieldCheck className="h-4 w-4 mr-1.5 text-primary" />
                      {t('ai.assistant.result.acceptSuggestion')}
                    </Button>
                  </div>
               )}

               <div className="mt-4 pt-2 border-t border-dashed flex justify-between items-center opacity-70">
                 <p className="text-[10px] text-muted-foreground flex items-center gap-1 italic">
                    <AlertCircle className="h-3 w-3" /> {t('ai.assistant.result.clinicianReview')}
                 </p>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowQueue(true)}><History className="h-3 w-3"/></Button>
               </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-4 justify-center">
        <p className="text-[9px] text-muted-foreground uppercase font-medium">
          {t('ai.assistant.footer.auditTrail')}
        </p>
      </CardFooter>
    </Card>
  );
}
