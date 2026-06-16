"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpenCheck, PlayCircle, FileText, CheckCircle2, Clock,
  ShieldCheck, Video, Search, Download, ChevronRight, GraduationCap,
  Users, Stethoscope, Database, SearchCheck, HelpCircle, Layout,
  ExternalLink, Award, X, ChevronLeft, ChevronDown, Filter,
  HardHat, Tablet, Star, RotateCcw, BookOpen, Briefcase, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'motion/react';
import { cn } from "@/lib/utils";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';

// ─── Types ────────────────────────────────────────────────────────────────────
type MediaType = 'VIDEO' | 'PDF' | 'QUIZ' | 'GUIDE';
type ResourceStatus = 'not_started' | 'in_progress' | 'completed';
type TypeFilter = MediaType | 'ALL';

interface QuizQuestion {
  q: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Resource {
  id: string;
  title: string;
  duration: string;
  type: MediaType;
  desc: string;
  videoUrl?: string;
  guideContent?: string;
  pdfLabel?: string;
  quizQuestions?: QuizQuestion[];
}

interface Pathway {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  resources: Resource[];
}

// ─── Static Color Map (fixes Tailwind JIT purging issue) ─────────────────────
const COLOR_MAP: Record<string, { bg: string; text: string; ring: string; light: string }> = {
  blue:    { bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-600 dark:text-blue-400',    ring: 'ring-blue-300',   light: 'bg-blue-50' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-300', light: 'bg-emerald-50' },
  amber:   { bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-600 dark:text-amber-400',   ring: 'ring-amber-300',  light: 'bg-amber-50' },
  teal:    { bg: 'bg-teal-100 dark:bg-teal-900/30',     text: 'text-teal-600 dark:text-teal-400',     ring: 'ring-teal-300',   light: 'bg-teal-50' },
  violet:  { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-300', light: 'bg-violet-50' },
};

// ─── Icon + Colour per media type ─────────────────────────────────────────────
const TYPE_META: Record<MediaType, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  VIDEO: { icon: PlayCircle, bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-600 dark:text-red-400',    label: 'Vídeo' },
  PDF:   { icon: FileText,   bg: 'bg-blue-50 dark:bg-blue-900/20',  text: 'text-blue-600 dark:text-blue-400',  label: 'PDF' },
  QUIZ:  { icon: SearchCheck,bg: 'bg-amber-50 dark:bg-amber-900/20',text: 'text-amber-600 dark:text-amber-400',label: 'Quiz' },
  GUIDE: { icon: BookOpenCheck, bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600 dark:text-teal-400', label: 'Guia' },
};

// ─── Training Data ─────────────────────────────────────────────────────────────
const PATHWAYS: Pathway[] = [
  {
    id: 'clinical',
    title: 'Clínico — Saúde & Consultas',
    icon: Stethoscope,
    color: 'blue',
    resources: [
      { id: 'c-1', title: 'Fluxo de Consulta Padrão', duration: '12m', type: 'VIDEO',
        desc: 'Guia passo a passo para registar Sinais Vitais e Sintomas na plataforma.',
        videoUrl: 'https://www.youtube.com/embed/8aGhZQkoFbQ' },
      { id: 'c-2', title: 'Prescrições Electrónicas (ePrescribe)', duration: '8m', type: 'VIDEO',
        desc: 'Como gerir o formulário da farmácia hospitalar e emitir prescrições digitais.',
        videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk' },
      { id: 'c-3', title: 'Cuidados de Maternidade & Mapeamento CPP', duration: '15m', type: 'GUIDE',
        desc: 'Fluxo de trabalho detalhado para Consultas Pré-Natais e monitorização de gravidez de alto risco.',
        guideContent: `## Cuidados Pré-Natais no H365\n\n### Registo da Primeira Consulta\n1. Abrir o módulo **Maternidade** no menu lateral\n2. Seleccionar **Nova Paciente CPP** e preencher os dados demográficos\n3. Registar a data da última menstruação (DUM) para calcular automaticamente a Idade Gestacional (IG)\n4. Completar a triagem de risco: anemia, hipertensão, diabetes gestacional\n\n### Visitas de Seguimento\n- O sistema gera automaticamente lembretes para as visitas CPP (1ª, 2ª, 3ª e 4ª)\n- Registar o peso, pressão arterial e altura uterina em cada visita\n- Qualquer valor fora do intervalo normal aciona um alerta clínico\n\n### Classificação de Risco\n| Nível | Critérios | Acção |\n|---|---|---|\n| Baixo | Sem complicações | Seguimento normal |\n| Médio | Hipertensão / Anemia | Referenciar ao especialista |\n| Alto | Pré-eclâmpsia / Diabetes | Internamento imediato |` },
      { id: 'c-4', title: 'Protocolo de Segurança Clínica', duration: '5m', type: 'QUIZ',
        desc: 'Verificação da identidade do paciente e procedimentos de segurança digital.',
        quizQuestions: [
          { q: 'Qual documento é necessário antes de qualquer procedimento clínico?', options: ['Formulário de Consentimento do Paciente', 'Cartão de Seguro', 'Escala do Pessoal', 'Ordem de Fornecimento'], correctIndex: 0, explanation: 'O consentimento informado é obrigatório antes de qualquer acto médico.' },
          { q: 'Quando a identidade do paciente não pode ser verificada, o primeiro passo é:', options: ['Prosseguir sem verificação', 'Contactar um supervisor', 'Pedir ao paciente que regresse', 'Verificar com a farmácia'], correctIndex: 1, explanation: 'Nunca prosseguir sem verificação. Sempre escalar ao supervisor.' },
          { q: 'As prescrições electrónicas devem ser verificadas por:', options: ['Qualquer enfermeiro', 'O médico prescritor', 'Dois profissionais clínicos', 'O director hospitalar'], correctIndex: 1, explanation: 'A responsabilidade legal da prescrição recai sobre o médico prescritor.' },
          { q: 'O que fazer ao detectar um erro num registo clínico?', options: ['Apagar e reescrever', 'Riscar e assinar com data', 'Deixar como está', 'Registar uma correcção com data/hora e assinatura'], correctIndex: 3, explanation: 'Registos digitais exigem uma nota de correcção auditável — nunca apagar.' },
        ]},
      { id: 'c-5', title: 'Gestão de Laboratório & Resultados', duration: '10m', type: 'VIDEO',
        desc: 'Como solicitar análises, receber resultados e integrar com o processo clínico.',
        videoUrl: 'https://www.youtube.com/embed/NmM9HA2MQGI' },
      { id: 'c-6', title: 'Triagem & Urgências', duration: '7m', type: 'GUIDE',
        desc: 'Sistema de triagem de Manchester adaptado ao contexto H365.',
        guideContent: `## Triagem de Manchester no H365\n\n### Níveis de Prioridade\n| Cor | Nível | Tempo Max. de Espera |\n|---|---|---|\n| 🔴 Vermelho | Imediato | 0 min |\n| 🟠 Laranja | Muito Urgente | 10 min |\n| 🟡 Amarelo | Urgente | 60 min |\n| 🟢 Verde | Pouco Urgente | 120 min |\n| 🔵 Azul | Não Urgente | 240 min |\n\n### Como Registar no H365\n1. Aceder ao módulo **Triagem** na barra lateral\n2. Seleccionar **Novo Episódio de Urgência**\n3. Inserir o NI do paciente ou criar registo provisório\n4. Seleccionar o nível de triagem e confirmar os sinais vitais\n5. O sistema atribui automaticamente uma sala e notifica o clínico de plantão` },
      { id: 'c-7', title: 'Avaliação Nutricional & Desnutrição', duration: '9m', type: 'PDF',
        desc: 'Protocolos para avaliação e gestão da desnutrição pediátrica e adulta.',
        pdfLabel: 'H365-Clinical-Nutrition-v2.pdf' },
      { id: 'c-8', title: 'Referência & Contra-Referência', duration: '6m', type: 'GUIDE',
        desc: 'Como referenciar um paciente para outro nível de cuidados e gerir a contra-referência.',
        guideContent: `## Referências no H365\n\n### Tipos de Referência\n- **Interna**: Entre departamentos do mesmo hospital\n- **Externa**: Para outro nível de cuidado (CS → HP → HC → HCM)\n- **Urgente**: Acompanhada de resumo clínico gerado automaticamente\n\n### Passos\n1. No processo clínico, clicar em **Referenciar**\n2. Seleccionar o destino e motivo\n3. O sistema gera uma carta de referência pré-preenchida\n4. Médico assina digitalmente e o sistema notifica a unidade de destino\n5. A contra-referência é recebida automaticamente quando o paciente regressa` },
    ]
  },
  {
    id: 'admin',
    title: 'Administrativo — Registos & Faturação',
    icon: Users,
    color: 'emerald',
    resources: [
      { id: 'a-1', title: 'Registo de Pacientes & Pesquisa MPI', duration: '10m', type: 'VIDEO',
        desc: 'Como identificar univocamente pacientes usando o Índice Mestre de Pacientes.',
        videoUrl: 'https://www.youtube.com/embed/8aGhZQkoFbQ' },
      { id: 'a-2', title: 'Sistemas de Faturação e Seguros de Saúde', duration: '20m', type: 'PDF',
        desc: 'Integração com fundos nacionais de seguros e reconciliação de reclamações.',
        pdfLabel: 'H365-Billing-Insurance-v3.pdf' },
      { id: 'a-3', title: 'Fluxo de Requisição de Inventário', duration: '6m', type: 'VIDEO',
        desc: 'Encomenda de stock ao Armazém Nacional de Medicamentos (CMAM).',
        videoUrl: 'https://www.youtube.com/embed/NmM9HA2MQGI' },
      { id: 'a-4', title: 'Agendamento & Marcações', duration: '8m', type: 'GUIDE',
        desc: 'Gestão do calendário clínico, marcações e gestão de faltas.',
        guideContent: `## Gestão de Marcações no H365\n\n### Criar uma Marcação\n1. Aceder ao módulo **Agenda** no menu lateral\n2. Seleccionar o profissional e a data disponível\n3. Pesquisar o paciente pelo NI ou nome\n4. Confirmar o tipo de consulta (1ª vez, seguimento, urgência)\n5. O sistema envia automaticamente um SMS de confirmação\n\n### Gerir Faltas\n- Após 15 minutos de atraso, o sistema marca como **possível falta**\n- O administrativo pode confirmar falta, remarcar ou contactar o paciente\n- Faltas repetidas geram um alerta na ficha do paciente` },
      { id: 'a-5', title: 'Relatórios Administrativos & DHIS2', duration: '12m', type: 'QUIZ',
        desc: 'Geração de relatórios mensais e exportação para o DHIS2 do MISAU.',
        quizQuestions: [
          { q: 'Com que frequência devem ser enviados os relatórios ao MISAU através do DHIS2?', options: ['Diariamente', 'Semanalmente', 'Mensalmente', 'Anualmente'], correctIndex: 2, explanation: 'Os relatórios de rotina são enviados mensalmente, até ao 5º dia útil do mês seguinte.' },
          { q: 'O que significa MPI no contexto do H365?', options: ['Manual de Procedimentos Internos', 'Índice Mestre de Pacientes', 'Módulo de Pagamento Integrado', 'Mapa de Presença Institucional'], correctIndex: 1, explanation: 'MPI = Master Patient Index, o registo único de identidade do paciente.' },
          { q: 'Ao registar uma fatura de seguro, qual campo é obrigatório?', options: ['Cor preferida do paciente', 'Número da apólice do seguro', 'Nome do familiar mais próximo', 'Distrito de nascimento'], correctIndex: 1, explanation: 'O número da apólice é indispensável para a reconciliação com o fundo de seguros.' },
        ]},
    ]
  },
  {
    id: 'it',
    title: 'TI & Sistemas — Infra & Segurança',
    icon: Database,
    color: 'amber',
    resources: [
      { id: 'i-1', title: 'Sincronização Gerida & Operações Offline', duration: '15m', type: 'VIDEO',
        desc: 'Operar o H365 com baixa largura de banda ou sem conectividade.',
        videoUrl: 'https://www.youtube.com/embed/SqcY0GlETPk' },
      { id: 'i-2', title: 'Controlo de Acesso Baseado em Funções (RBAC)', duration: '12m', type: 'PDF',
        desc: 'Configuração de permissões de utilizadores e grupos de segurança.',
        pdfLabel: 'H365-RBAC-AdminGuide-v2.pdf' },
      { id: 'i-3', title: 'Heartbeat do Sistema & Estado dos Nós', duration: '5m', type: 'GUIDE',
        desc: 'Monitorização da saúde do seu nó hospitalar local.',
        guideContent: `## Monitorização do Nó H365\n\n### Painel de Heartbeat\nAceda a **Configurações → Estado do Sistema** para ver:\n- **Latência da Rede**: < 100ms = verde, 100–500ms = amarelo, > 500ms = vermelho\n- **Uso de Disco**: Alerta quando > 80%\n- **Última Sincronização**: Timestamp da última sincronização bem-sucedida com o servidor central\n\n### Indicadores Críticos\n| Indicador | Estado Normal | Acção Requerida |\n|---|---|---|\n| Sync Queue | < 50 registos | > 200: escalar à TI central |\n| DB Size | < 10 GB | > 15 GB: arquivo |\n| CPU | < 60% | > 85%: reiniciar serviços |\n\n### Quando o Nó Perde Conectividade\n1. O sistema muda automaticamente para modo **offline**\n2. Todos os registos são guardados localmente com marcação de timestamp\n3. Quando a conectividade é restaurada, a sincronização ocorre automaticamente` },
      { id: 'i-4', title: 'Backup & Recuperação de Dados', duration: '10m', type: 'VIDEO',
        desc: 'Procedimentos de backup diário, restauro e testes de recuperação de desastre.',
        videoUrl: 'https://www.youtube.com/embed/8aGhZQkoFbQ' },
      { id: 'i-5', title: 'Resolução de Problemas Comuns', duration: '8m', type: 'GUIDE',
        desc: 'Guia de diagnóstico para os 10 problemas técnicos mais frequentes.',
        guideContent: `## Top 10 Problemas H365 & Soluções\n\n| # | Problema | Solução |\n|---|---|---|\n| 1 | Página não carrega | Limpar cache do browser (Ctrl+Shift+R) |\n| 2 | Login falha | Verificar se o servidor local está activo |\n| 3 | Impressora não responde | Reiniciar serviço de impressão |\n| 4 | Sync pendente há > 1 hora | Verificar conectividade de rede |\n| 5 | Relatório vazio | Verificar intervalo de datas do filtro |\n| 6 | Paciente não encontrado | Pesquisar pelo NI completo |\n| 7 | PDF não gera | Verificar se o módulo de relatórios está activo |\n| 8 | Alerta de disco cheio | Executar arquivo de dados antigos |\n| 9 | Erro 500 no API | Reiniciar o serviço H365 |\n| 10 | Service Worker 404 | Limpar dados do site no browser |` },
      { id: 'i-6', title: 'Avaliação de Competências TI', duration: '10m', type: 'QUIZ',
        desc: 'Certificação de competências para administradores de sistemas H365.',
        quizQuestions: [
          { q: 'O que acontece aos dados quando o H365 perde conectividade?', options: ['Os dados perdem-se', 'O sistema bloqueia', 'Os dados são guardados localmente e sincronizados depois', 'O utilizador é desligado'], correctIndex: 2, explanation: 'O H365 opera em modo offline completo — todos os dados são preservados localmente.' },
          { q: 'Com que frequência devem ser testados os backups?', options: ['Nunca', 'Apenas quando há problemas', 'Mensalmente, com restauro de teste', 'Uma vez por ano'], correctIndex: 2, explanation: 'Backups não testados são backups não fiáveis. Testar mensalmente é a prática recomendada.' },
          { q: 'Qual é o nível de uso de disco que exige acção imediata?', options: ['50%', '65%', '80%', '95%'], correctIndex: 2, explanation: 'Acima de 80% o sistema pode começar a ter falhas de escrita. Actuar preventivamente.' },
          { q: 'Para configurar permissões de utilizador, deve aceder a:', options: ['Relatórios → Exportar', 'Configurações → RBAC → Grupos', 'Pacientes → Editar', 'Farmácia → Stock'], correctIndex: 1, explanation: 'O módulo RBAC está em Configurações e é restrito a administradores de sistema.' },
        ]},
    ]
  },
  {
    id: 'chaem',
    title: 'CHAEM — Saúde Ocupacional',
    icon: HardHat,
    color: 'teal',
    resources: [
      { id: 'ch-1', title: 'Fluxo de Exame Ocupacional CHAEM', duration: '14m', type: 'VIDEO',
        desc: 'Como criar, preencher e finalizar um Atestado Médico de Aptidão (AMA) no sistema CHAEM.',
        videoUrl: 'https://www.youtube.com/embed/NmM9HA2MQGI' },
      { id: 'ch-2', title: 'Classificação de Sectores de Risco', duration: '8m', type: 'GUIDE',
        desc: 'Guia completo dos sectores ocupacionais, riscos associados e exames obrigatórios por sector.',
        guideContent: `## Sectores Ocupacionais & Exames CHAEM\n\n| Sector | Riscos Principais | Exames Obrigatórios |\n|---|---|---|\n| Saúde | Biológico, Radiação | Hemograma, Raio-X Tórax, VIH |\n| Construção | Físico, Quedas | Audiometria, Visão, Musculoskeletal |\n| Alimentação | Microbiológico | Copro, Dermatológico, VHB |\n| Transporte | Fadiga, Stress | Visão, Cardíaco, Psicológico |\n| Mineração | Químico, Pó | Espirometria, Raio-X, Audiometria |\n| Industria | Químico, Ruído | Audiometria, Hemograma completo |\n\n### Determinação de Aptidão\n- **Apto**: Trabalhador sem restrições para a função\n- **Apto com Restrições**: Pode trabalhar com condicionantes específicas\n- **Inapto Temporário**: Aguarda tratamento — reavaliar em data definida\n- **Inapto Permanente**: Incapaz de exercer a função — requerer readaptação` },
      { id: 'ch-3', title: 'Pesquisa de Pacientes via Bridge H365', duration: '6m', type: 'GUIDE',
        desc: 'Como pesquisar e vincular pacientes do H365 SaaS ao CHAEM para exames.',
        guideContent: `## Pesquisa de Pacientes no CHAEM\n\n### Ligação ao H365 SaaS\nO CHAEM está integrado com o H365 SaaS através de uma bridge L-LAN. Para pesquisar um paciente:\n\n1. No formulário de exame, clicar em **🔍 Pesquisar Paciente H365**\n2. Escrever o nome ou número de BI/NUIT\n3. Os resultados aparecem em tempo real a partir do registo central\n4. Clicar no paciente para pré-preencher automaticamente o formulário\n\n### Quando o Servidor Está Offline\n- Inserir manualmente o BI/NUIT no campo correspondente\n- O sistema sincronizará o exame quando a ligação for restaurada\n- O Portal do Paciente verá o exame assim que a sync ocorrer\n\n### Privacidade\nApenas dados de identificação são partilhados (nome, NI, género, idade).\nDados clínicos detalhados não são expostos ao CHAEM por defeito.` },
      { id: 'ch-4', title: 'Avaliação CHAEM — Competências Fundamentais', duration: '8m', type: 'QUIZ',
        desc: 'Certificação para médicos e técnicos CHAEM operadores do sistema.',
        quizQuestions: [
          { q: 'O que significa AMA no contexto CHAEM?', options: ['Avaliação Médica Anual', 'Atestado Médico de Aptidão', 'Autorização Médica de Admissão', 'Análise de Medicina do Ambiente'], correctIndex: 1, explanation: 'AMA = Atestado Médico de Aptidão — o documento central do exame ocupacional.' },
          { q: 'Qual é o exame obrigatório para trabalhadores do sector alimentar?', options: ['Audiometria', 'Raio-X Tórax', 'Coprocultura', 'Espirometria'], correctIndex: 2, explanation: 'O exame coproparasitológico é obrigatório para garantir segurança alimentar.' },
          { q: 'Um trabalhador "Apto com Restrições" significa que:', options: ['Está proibido de trabalhar', 'Pode trabalhar com condições específicas', 'Precisa de nova avaliação imediata', 'Está isento de exames futuros'], correctIndex: 1, explanation: 'Esta determinação permite o trabalho condicionado, com as restrições documentadas no AMA.' },
          { q: 'O Portal do Paciente pode ver os resultados dos exames CHAEM?', options: ['Não, são confidenciais', 'Sim, após sincronização com o servidor H365', 'Apenas se o médico autorizar manualmente', 'Apenas em formato impresso'], correctIndex: 1, explanation: 'Os exames CHAEM são sincronizados automaticamente com o Portal do Paciente via API bridge.' },
        ]},
    ]
  },
  {
    id: 'portal',
    title: 'Portal do Paciente — Administração',
    icon: Tablet,
    color: 'violet',
    resources: [
      { id: 'p-1', title: 'Revisão de Auto-Registos de Pacientes', duration: '7m', type: 'GUIDE',
        desc: 'Como rever e validar registos criados pelos próprios pacientes no Portal.',
        guideContent: `## Gestão de Auto-Registos\n\n### O que é o Auto-Registo\nOs pacientes podem criar o seu próprio registo de saúde através do Portal do Paciente (port 3001). Estes registos entram com o estado **"Self-Registered"** e precisam de validação clínica.\n\n### Processo de Validação\n1. Aceder ao módulo **Pacientes** no H365 SaaS\n2. Filtrar por **Estado: Self-Registered**\n3. Verificar os dados de identidade (NI, data de nascimento, nome)\n4. Se correcto, alterar o estado para **Active**\n5. Se incorreto, contactar o paciente pelo telefone registado\n\n### O que o Paciente Pode Editar\n- Email, telefone, morada\n- Contacto de emergência (nome, relação, telefone)\n\n### O que Requer Validação Clínica\n- Alergias e condições crónicas\n- Medicação actual\n- Histórico de visitas e análises` },
      { id: 'p-2', title: 'Gestão de Medicação & Adesão', duration: '9m', type: 'VIDEO',
        desc: 'Como adicionar medicação ao processo do paciente e monitorizar a adesão através do portal.',
        videoUrl: 'https://www.youtube.com/embed/8aGhZQkoFbQ' },
      { id: 'p-3', title: 'Avaliação — Administração do Portal', duration: '6m', type: 'QUIZ',
        desc: 'Verificação de competências para gestores do Portal do Paciente.',
        quizQuestions: [
          { q: 'Qual o estado inicial de um paciente que se regista no Portal?', options: ['Active', 'Inactive', 'Self-Registered', 'Pending'], correctIndex: 2, explanation: 'Auto-registos entram como "Self-Registered" e aguardam validação clínica.' },
          { q: 'O Portal do Paciente opera em que porta no ambiente de desenvolvimento?', options: ['3000', '3001', '5174', '8080'], correctIndex: 1, explanation: 'O Portal do Paciente opera na porta 3001, o H365 SaaS na 3000 e o CHAEM na 5174.' },
          { q: 'Quando um paciente confirma a toma de medicação no portal, onde é registado?', options: ['Apenas localmente no telemóvel', 'No servidor H365 via API /confirm', 'Numa folha de cálculo separada', 'Não é registado em lado nenhum'], correctIndex: 1, explanation: 'A confirmação de toma é enviada para POST /api/patient-portal/patients/[nid]/medications/[medId]/confirm e guardada no registo central.' },
        ]},
    ]
  },
];

const STORAGE_KEY = 'h365_training_progress';

// ─── Progress Persistence ─────────────────────────────────────────────────────
function loadProgress(): { completed: string[]; inProgress: string[]; lastId: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { completed: [], inProgress: [], lastId: null };
  } catch { return { completed: [], inProgress: [], lastId: null }; }
}
function saveProgress(completed: Set<string>, inProgress: Set<string>, lastId: string | null) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    completed: [...completed], inProgress: [...inProgress], lastId
  }));
}

// ─── Quiz Modal ───────────────────────────────────────────────────────────────
function QuizModal({
  resource, onClose, onPass
}: { resource: Resource; onClose: () => void; onPass: (id: string) => void }) {
  const questions = resource.quizQuestions ?? [];
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = questions[step];
  const passed = score >= Math.ceil(questions.length * 0.75);

  const handleAnswer = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (idx === current.correctIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(s => s + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setDone(true);
    }
  };

  const handleFinish = () => {
    if (passed) onPass(resource.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-800 bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-center gap-3">
            <SearchCheck className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Quiz</p>
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[280px]">{resource.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors" aria-label="Fechar quiz">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          {!done ? (
            <>
              {/* Progress */}
              <div className="flex items-center gap-3 mb-6">
                <Progress value={((step) / questions.length) * 100} className="h-1.5 flex-1" />
                <span className="text-[10px] font-bold text-slate-400 shrink-0">{step + 1}/{questions.length}</span>
              </div>

              {/* Question */}
              <p className="text-base font-bold text-slate-800 dark:text-white mb-5">{current.q}</p>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {current.options.map((opt, i) => {
                  const isCorrect = i === current.correctIndex;
                  const isSelected = i === selected;
                  return (
                    <button key={i} onClick={() => handleAnswer(i)}
                      aria-pressed={isSelected}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border-2 text-sm transition-all duration-200",
                        !revealed ? "border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:bg-amber-50/50" :
                        isCorrect ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200" :
                        isSelected ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" :
                        "border-slate-200 dark:border-slate-700 opacity-50"
                      )}>
                      <span className="font-bold mr-3">{['A', 'B', 'C', 'D'][i]}.</span>{opt}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {revealed && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 mb-4">
                  <p className="text-xs font-bold text-blue-800 dark:text-blue-200 uppercase tracking-wider mb-1">Explicação</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">{current.explanation}</p>
                </motion.div>
              )}

              {revealed && (
                <Button onClick={handleNext} className="w-full h-11 font-bold text-xs uppercase">
                  {step < questions.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </>
          ) : (
            /* Results */
            <div className="text-center space-y-6 py-4">
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center mx-auto text-4xl font-black",
                passed ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
              )}>
                {passed ? <Award className="h-12 w-12" /> : <RotateCcw className="h-12 w-12" />}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                  {score} / {questions.length} correcto{score !== 1 ? 's' : ''}
                </h3>
                <p className={cn("text-sm font-bold mt-1", passed ? "text-emerald-600" : "text-red-600")}>
                  {passed ? '🎉 Aprovado! Competência confirmada.' : '❌ Reprovado. Reveja os materiais e tente novamente.'}
                </p>
              </div>
              <div className="flex gap-3">
                {!passed && (
                  <Button variant="outline" onClick={() => { setStep(0); setSelected(null); setRevealed(false); setScore(0); setDone(false); }}
                    className="flex-1 h-11 text-xs font-bold uppercase">
                    <RotateCcw className="h-4 w-4 mr-2" /> Repetir
                  </Button>
                )}
                <Button onClick={handleFinish} className={cn("h-11 text-xs font-bold uppercase", passed ? "flex-1" : "flex-1")}>
                  {passed ? <><CheckCircle2 className="h-4 w-4 mr-2" />Concluir</> : 'Fechar'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Resource Viewer Modal ────────────────────────────────────────────────────
function ResourceViewerModal({
  resource, onClose, onComplete
}: { resource: Resource; onClose: () => void; onComplete: (id: string) => void }) {
  const typeMeta = TYPE_META[resource.type];
  const Icon = typeMeta.icon;

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = '#';
    // In production: link.href = `/api/training/docs/${resource.pdfLabel}`;
    alert(`PDF: ${resource.pdfLabel}\n\n(Em produção: faz o download do documento do servidor H365)`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className={cn("flex items-center justify-between px-6 py-4 border-b dark:border-slate-800", typeMeta.bg)}>
          <div className="flex items-center gap-3">
            <Icon className={cn("h-5 w-5", typeMeta.text)} />
            <div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest", typeMeta.text)}>{typeMeta.label}</p>
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[320px]">{resource.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors" aria-label="Fechar visualizador">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {resource.type === 'VIDEO' && resource.videoUrl && (
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
                <iframe src={resource.videoUrl} title={resource.title} allowFullScreen
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{resource.desc}</p>
            </div>
          )}

          {resource.type === 'GUIDE' && resource.guideContent && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {resource.guideContent.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-black text-slate-800 dark:text-white mt-6 mb-3 first:mt-0">{line.slice(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-4 mb-2">{line.slice(4)}</h3>;
                if (line.startsWith('| ')) {
                  const cells = line.split('|').filter(Boolean).map(c => c.trim());
                  return <div key={i} className="flex gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800 text-xs">{cells.map((c, j) => <span key={j} className={cn("flex-1", j === 0 ? "font-bold text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400")}>{c}</span>)}</div>;
                }
                if (line.match(/^\d+\./)) return <p key={i} className="text-sm text-slate-700 dark:text-slate-300 my-1 ml-2">{line}</p>;
                if (line.startsWith('- ')) return <p key={i} className="text-sm text-slate-700 dark:text-slate-300 my-0.5 ml-2">• {line.slice(2)}</p>;
                if (!line.trim()) return <div key={i} className="h-2" />;
                return <p key={i} className="text-sm text-slate-600 dark:text-slate-400 my-1">{line}</p>;
              })}
            </div>
          )}

          {resource.type === 'PDF' && (
            <div className="text-center py-12 space-y-6">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-3xl flex items-center justify-center mx-auto">
                <FileText className="h-12 w-12 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">{resource.pdfLabel}</h3>
                <p className="text-xs text-slate-500 mt-1">{resource.desc}</p>
              </div>
              <Button onClick={handleDownloadPdf} className="h-12 px-8 font-bold gap-2">
                <Download className="h-4 w-4" /> Descarregar PDF
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {resource.duration} de formação
          </span>
          <Button onClick={() => { onComplete(resource.id); onClose(); }} size="sm"
            className="h-9 text-xs font-bold uppercase gap-2 bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Marcar como Concluído
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TrainingMaterialsPage() {
  const { currentLocale } = useLocale();
  const t = useMemo(() => getTranslator(currentLocale), [currentLocale]);

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [inProgressIds, setInProgressIds] = useState<Set<string>>(new Set());
  const [lastId, setLastId] = useState<string | null>(null);
  const [activePathway, setActivePathway] = useState('clinical');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Resource | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Load persisted progress
  useEffect(() => {
    setIsMounted(true);
    const { completed, inProgress, lastId: lid } = loadProgress();
    setCompletedIds(new Set(completed));
    setInProgressIds(new Set(inProgress));
    setLastId(lid);
  }, []);

  const markComplete = useCallback((id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev).add(id);
      setInProgressIds(ip => { const n = new Set(ip); n.delete(id); saveProgress(next, n, lastId); return n; });
      saveProgress(next, inProgressIds, lastId);
      return next;
    });
  }, [inProgressIds, lastId]);

  const openResource = useCallback((res: Resource) => {
    setLastId(res.id);
    setInProgressIds(prev => {
      if (completedIds.has(res.id)) return prev;
      const next = new Set(prev).add(res.id);
      saveProgress(completedIds, next, res.id);
      return next;
    });
    if (res.type === 'QUIZ') {
      setActiveQuiz(res);
    } else {
      setActiveResource(res);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedIds, inProgressIds]);

  const resumeLast = useCallback(() => {
    if (!lastId) return;
    for (const p of PATHWAYS) {
      const res = p.resources.find(r => r.id === lastId);
      if (res) { setActivePathway(p.id); openResource(res); break; }
    }
  }, [lastId, openResource]);

  // Computed stats
  const allResources = useMemo(() => PATHWAYS.flatMap(p => p.resources), []);
  const totalAll = allResources.length;
  const completedAll = allResources.filter(r => completedIds.has(r.id)).length;
  const globalPct = totalAll > 0 ? Math.round((completedAll / totalAll) * 100) : 0;

  // Pathway with computed progress
  const pathwaysWithProgress = useMemo(() => PATHWAYS.map(p => {
    const done = p.resources.filter(r => completedIds.has(r.id)).length;
    return { ...p, completedResources: done, totalResources: p.resources.length, progress: Math.round((done / p.resources.length) * 100) };
  }), [completedIds]);

  const currentPathway = pathwaysWithProgress.find(p => p.id === activePathway);

  // Dynamic certificate
  const earnedCert = useMemo(() => {
    const certMap: Record<string, string> = { clinical: 'H365 Clínico Certificado', admin: 'H365 Administrativo Certificado', it: 'H365 TI & Sistemas Certificado', chaem: 'CHAEM Operador Certificado', portal: 'Portal do Paciente Admin Certificado' };
    const completed = pathwaysWithProgress.find(p => p.progress === 100);
    return completed ? certMap[completed.id] : null;
  }, [pathwaysWithProgress]);

  // Filtered resources (cross-pathway search when query active)
  const filteredResources = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (q.length >= 2) {
      // cross-pathway search
      return allResources
        .filter(r => (r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)) && (typeFilter === 'ALL' || r.type === typeFilter))
        .map(r => ({ ...r, pathwayTitle: PATHWAYS.find(p => p.resources.some(pr => pr.id === r.id))?.title }));
    }
    return (currentPathway?.resources ?? [])
      .filter(r => typeFilter === 'ALL' || r.type === typeFilter);
  }, [searchQuery, typeFilter, currentPathway, allResources]);

  const isSearching = searchQuery.length >= 2;

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <GraduationCap className="w-full h-full -rotate-12 translate-x-12 translate-y-12" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-5">
          <Badge className="bg-blue-500 text-white border-none uppercase tracking-widest text-[10px] py-1 px-3">
            {t('training.hero.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {t('training.hero.title')}
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">{t('training.hero.desc')}</p>

          {/* Global progress stats */}
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-center">
              <p className="text-3xl font-black text-white">{globalPct}%</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Concluído</p>
            </div>
            <div className="flex-1 space-y-1.5">
              <Progress value={globalPct} className="h-2 bg-white/10" />
              <p className="text-[10px] text-slate-400">{completedAll} de {totalAll} recursos em {PATHWAYS.length} percursos</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={resumeLast} disabled={!lastId}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-6 h-11 shadow-xl shadow-blue-500/20 disabled:opacity-40">
              {t('training.hero.resume')}
            </Button>
            <Button variant="outline" onClick={() => { /* In production: generate certificate PDF */ alert('Em produção: gera PDF do certificado de formação para download.'); }}
              className="border-slate-700 text-white hover:bg-white/10 font-bold px-6 h-11">
              {t('training.hero.download')}
            </Button>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Sidebar: Pathways */}
        <aside className="lg:col-span-4 space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">
            {t('training.sidebar.pathways')}
          </h3>
          <div className="flex flex-col gap-3">
            {pathwaysWithProgress.map(path => {
              const Icon = path.icon;
              const colors = COLOR_MAP[path.color];
              const isActive = activePathway === path.id;
              return (
                <button key={path.id} onClick={() => { setActivePathway(path.id); setSearchQuery(''); setTypeFilter('ALL'); }}
                  aria-pressed={isActive}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all duration-300 group",
                    isActive ? "bg-white dark:bg-slate-900 border-primary shadow-lg ring-4 ring-primary/10" :
                    "bg-background border-border hover:border-primary/40 hover:shadow-md"
                  )}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", colors.bg, colors.text)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{path.title}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                        {path.completedResources}/{path.totalResources} concluídos
                      </p>
                    </div>
                    {path.progress === 100 && <Award className="h-5 w-5 text-amber-500 shrink-0" aria-label="Percurso completo" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-muted-foreground">{t('training.sidebar.progress')}</span>
                      <span className={colors.text}>{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} className="h-1.5" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Certificate Panel */}
          <Card className="border-none shadow-xl bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-600" /> {t('training.sidebar.certTitle')}
              </CardTitle>
            </CardHeader>
            <div className="px-6 pb-6 space-y-3">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t('training.sidebar.certDesc')}
              </p>
              <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-dashed flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", earnedCert ? "bg-amber-100" : "bg-slate-100")}>
                  {earnedCert ? <Award className="h-6 w-6 text-amber-500" /> : <Lock className="h-6 w-6 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    {earnedCert ? 'Certificado Conquistado' : t('training.sidebar.milestone')}
                  </p>
                  <h5 className="text-xs font-black truncate">{earnedCert ?? 'Complete um percurso para obter'}</h5>
                </div>
              </div>
            </div>
          </Card>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          {/* Search + Filter bar */}
          <div className="bg-background p-4 rounded-2xl border shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Layout className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-base font-black uppercase tracking-tight">
                  {isSearching ? `Resultados para "${searchQuery}"` : currentPathway?.title}
                </h2>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  aria-label="Pesquisar recursos de formação"
                  placeholder={t('training.search.placeholder')}
                  className="pl-9 h-10 text-xs border-none bg-muted/40 focus:bg-background"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Type filter chips */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
              {(['ALL', 'VIDEO', 'PDF', 'QUIZ', 'GUIDE'] as TypeFilter[]).map(f => (
                <button key={f} onClick={() => setTypeFilter(f)}
                  aria-pressed={typeFilter === f}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all",
                    typeFilter === f
                      ? "bg-primary text-white border-primary shadow"
                      : "bg-background border-border text-muted-foreground hover:border-primary/50"
                  )}>
                  {f === 'ALL' ? 'Todos' : TYPE_META[f].label}
                </button>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredResources.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-16 text-muted-foreground space-y-3">
                  <Search className="h-12 w-12 opacity-20 mx-auto" />
                  <p className="font-semibold">Nenhum recurso encontrado</p>
                  <p className="text-xs">Experimente outro termo ou remova os filtros</p>
                </motion.div>
              ) : (
                filteredResources.map((res, i) => {
                  const typeMeta = TYPE_META[res.type];
                  const TypeIcon = typeMeta.icon;
                  const isDone = completedIds.has(res.id);
                  const isInProg = inProgressIds.has(res.id);
                  const status: ResourceStatus = isDone ? 'completed' : isInProg ? 'in_progress' : 'not_started';

                  return (
                    <motion.div key={res.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }} transition={{ delay: i * 0.05 }}>
                      <Card className={cn(
                        "group border-none shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden",
                        isDone ? "bg-slate-50 dark:bg-slate-900/50" : "bg-white dark:bg-slate-900"
                      )}>
                        {/* Status badge */}
                        {isDone && (
                          <div className="absolute top-3 right-3 z-10">
                            <div className="bg-emerald-500 text-white p-1 rounded-full shadow" aria-label="Concluído">
                              <CheckCircle2 className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                        {isInProg && !isDone && (
                          <div className="absolute top-3 right-3 z-10">
                            <div className="bg-amber-400 text-white p-1 rounded-full shadow" aria-label="Em progresso">
                              <Clock className="h-3 w-3" />
                            </div>
                          </div>
                        )}

                        <CardContent className="p-5">
                          <div className="flex flex-col md:flex-row gap-5 items-start">
                            {/* Type icon */}
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", typeMeta.bg)}>
                              <TypeIcon className={cn("h-7 w-7", typeMeta.text)} aria-hidden />
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2 pr-6">
                                <h3 className="text-sm font-bold group-hover:text-primary transition-colors">
                                  {res.title}
                                </h3>
                                <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-slate-200 shrink-0">
                                  {typeMeta.label}
                                </Badge>
                                {(res as any).pathwayTitle && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-blue-200 text-blue-600 shrink-0">
                                    {(res as any).pathwayTitle}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{res.desc}</p>
                              <div className="flex items-center gap-5 pt-1">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                  <Clock className="h-3.5 w-3.5" /> {t('training.resource.estimated')}: {res.duration}
                                </span>
                                <span className={cn(
                                  "flex items-center gap-1.5 text-[10px] font-bold",
                                  status === 'completed' ? "text-emerald-600" :
                                  status === 'in_progress' ? "text-amber-600" : "text-slate-400"
                                )}>
                                  {status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                                   status === 'in_progress' ? <Clock className="h-3.5 w-3.5" /> :
                                   <BookOpen className="h-3.5 w-3.5" />}
                                  {status === 'completed' ? t('training.resource.completed') :
                                   status === 'in_progress' ? t('training.resource.inProgress') : 'Não iniciado'}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                              <Button size="sm" onClick={() => openResource(res)}
                                className={cn(
                                  "gap-2 text-[10px] font-black uppercase h-10 px-5 flex-1 md:flex-none",
                                  isDone ? "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200" : "bg-primary text-white"
                                )}>
                                {isDone ? t('training.action.review') : t('training.action.start')}
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                              {!isDone && (
                                <Button variant="ghost" size="sm" onClick={() => markComplete(res.id)}
                                  className="h-10 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700 gap-1.5 flex-1 md:flex-none">
                                  <CheckCircle2 className="h-4 w-4" /> Concluir
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Support footer */}
          <div className="mt-4 grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden group">
              <CardContent className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-black uppercase">{t('training.support.helpTitle')}</h3>
                  <HelpCircle className="h-8 w-8 text-slate-700 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{t('training.support.helpDesc')}</p>
                <Button onClick={() => window.open('mailto:suporte@h365.mz', '_blank')}
                  className="w-full bg-white text-slate-900 border-none font-bold uppercase text-[10px] h-11">
                  {t('training.support.contact')}
                </Button>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg bg-blue-600 text-white overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <h3 className="text-lg font-black uppercase">{t('training.support.techTitle')}</h3>
                <p className="text-white/80 text-xs leading-relaxed">{t('training.support.techDesc')}</p>
                <Button variant="outline" onClick={() => window.open('https://docs.h365.mz', '_blank')}
                  className="w-full border-white/30 text-white hover:bg-white/10 font-bold uppercase text-[10px] h-11 gap-2">
                  {t('training.support.wiki')} <ExternalLink className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeResource && (
          <ResourceViewerModal
            resource={activeResource}
            onClose={() => setActiveResource(null)}
            onComplete={markComplete}
          />
        )}
        {activeQuiz && (
          <QuizModal
            resource={activeQuiz}
            onClose={() => setActiveQuiz(null)}
            onPass={markComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
