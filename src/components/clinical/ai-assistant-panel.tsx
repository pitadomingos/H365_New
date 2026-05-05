"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertCircle, ShieldCheck, History, Send, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { cn } from "@/lib/utils";
import { addToQueue, getAIQueue, syncQueue, type AIQueueItem } from "@/lib/clinical-ai-queue";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from "@/lib/i18n";

interface AIAssistantPanelProps {
  context?: string;
  department?: string;
  patientData?: any;
  onAcceptSuggestion?: (suggestion: string) => void;
}

export function AIAssistantPanel({ context, department, patientData, onAcceptSuggestion }: AIAssistantPanelProps) {
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Check queue status on mount
  React.useEffect(() => {
    const queue = getAIQueue();
    setPendingCount(queue.filter(i => i.status === 'pending').length);
    
    // Simple online/offline detection
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

    // If offline or if user chooses deferred audit
    if (isOfflineMode) {
      handleQueueRequest();
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("AI Integration Key Missing. Please configure system environment.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const clinicalContext = `
        You are a Clinical Decision Support Assistant for a public health hospital.
        Department: ${department || "General"}
        Role: Assistive only (not autonomous). Your suggestions must be reviewed by a qualified clinician.
        Patient Data Context: ${JSON.stringify(patientData || {})}
        Instructions: Provide concise, evidence-based clinical reasoning or summaries. 
        Always include a disclaimer that the final decision rests with the attending provider.
        IMPORTANT: Your response MUST be in the following language: ${currentLocale === 'pt' ? 'Portuguese' : 'English'}.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `${clinicalContext}\n\nClinical Inquiry: ${prompt || (currentLocale === 'pt' ? 'Analise os dados atuais do paciente para potenciais anomalias ou otimizações de tratamento.' : 'Analyze the current patient data for potential anomalies or treatment optimizations.')}`,
      });

      const resultText = response.response.text();
      setResult(resultText || t('ai.assistant.result.noInsight'));
    } catch (err: any) {
      console.error("AI Assistant Error:", err);
      // Fallback to queue if network fails
      setError(t('ai.assistant.error.connectivity'));
      setTimeout(() => {
        handleQueueRequest();
      }, 2000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQueueRequest = () => {
    addToQueue({
      requestId: Math.random().toString(36).substring(7),
      department: department || "General",
      prompt: prompt || (currentLocale === 'pt' ? "Auditoria Completa do Caso" : "Full Case Audit"),
      context: patientData,
      patientName: patientData?.fullName,
      patientId: patientData?.id,
      locale: currentLocale
    });
    setPendingCount(prev => prev + 1);
    setResult(t('ai.assistant.result.queued'));
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
