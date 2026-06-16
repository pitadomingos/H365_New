import React, { useState, useEffect } from 'react';
const H365_BASE = (import.meta.env.VITE_API_BASE ?? 'http://localhost:3000').replace(/\/$/, '');

import { jsPDF } from 'jspdf';
import { useLocale, LocaleProvider } from '@/context/locale-context';
import {
  useChaemUser, ChaemUserProvider, CHAEM_MOCK_USERS, ROLE_META,
  type ChaemRole
} from '@/context/chaem-user-context';
import {
  ShieldCheck, Search, PlusCircle, FileText,
  TrendingUp, TrendingDown, Building2, MapPin, Globe,
  Home, BarChart2, ClipboardList, ArrowLeft, CheckSquare,
  Square, Save, ChevronDown, Activity, Bell,
  Stethoscope, Microscope, Lock, ChevronRight
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface OccupationalExam {
  id: string;
  patientId: string;
  patientName: string;
  sector: string;
  sectorLabel: string;
  examType: string;
  date: string;
  companyName: string;
  doctorName: string;
  status: 'Apto' | 'Apto com Restrições' | 'Inapto Temporário' | 'Inapto';
  notes: string;
  formSnapshot?: FormState;
}

interface DiagnosticTest {
  id: string;
  name: string;
  purpose: string;
  parameters: string;
  statusOptions: string[];
}

interface SectorConfig {
  label: string;
  emoji: string;
  tests: DiagnosticTest[];
}

type ExamStage = 'Admissional' | 'Periódico' | 'Demissional';
type DashLevel = 'facility' | 'district' | 'provincial' | 'national';
type AppView = 'dashboard' | 'exams' | 'new-exam';

// ─────────────────────────────────────────────────────────────────────────────
// SECTOR DIAGNOSTIC CONFIG — Dynamic Form Engine
// ─────────────────────────────────────────────────────────────────────────────

const SECTOR_CONFIG: Record<string, SectorConfig> = {
  mining: {
    label: 'Mineração & Pedreiras',
    emoji: '⛏️',
    tests: [
      {
        id: 'xray', name: 'Radiografia de Tórax (Classificação OIT)',
        purpose: 'Rastreio mandatório de pneumoconiose por exposição a poeira de sílica e poeiras minerais.',
        parameters: 'Classificação ILO: perfil, tamanho e abundância de opacidades (p/q/r); anomalias pleurais',
        statusOptions: ['Normal', 'Anormal — Requer Revisão Radiologista', 'Baseline Arquivada'],
      },
      {
        id: 'spirometry', name: 'Espirometria (Função Pulmonar)',
        purpose: 'Monitorização da capacidade pulmonar em trabalhadores expostos a poeira e sílica cristalina.',
        parameters: 'FEV1, FVC, FEV1/FVC ratio, PEF; comparar % de variação com baseline admissional',
        statusOptions: ['Normal (≥80% previsto)', 'Padrão Restritivo', 'Padrão Obstrutivo', 'Misto', 'Pendente Lab'],
      },
      {
        id: 'audiometry', name: 'Audiometria (Tom Puro — Bilateral)',
        purpose: 'Mandatório para exposição a ruído ≥85dB(A) de maquinaria pesada e detonações.',
        parameters: 'Frequências 500, 1k, 2k, 3k, 4k, 6k, 8 kHz — ambos os ouvidos; STS conforme OSHA 1910.95',
        statusOptions: ['Normal', 'Perda Leve (≤25dB)', 'PAIR Confirmada (>25dB)', 'Baseline Arquivada'],
      },
      {
        id: 'biomonitoring', name: 'Monitorização Biológica (Metais Pesados)',
        purpose: 'Rastreio de exposição sistémica a metais pesados e agentes químicos da operação mineira.',
        parameters: 'Chumbo sérico (BEI <30µg/dL), Mercúrio urinário (<35µg/g creat.), Manganês sérico, Creatinina',
        statusOptions: ['Dentro dos BEIs (ACGIH)', 'Elevado — Acção Necessária', 'Crítico — Afastar do Posto', 'Pendente Lab'],
      },
      {
        id: 'msk', name: 'Avaliação Musculoesquelética (FCE)',
        purpose: 'Avaliação de lesões por esforço repetitivo e transporte manual de cargas pesadas.',
        parameters: 'Mobilidade da coluna (Schober), força de preensão (dinamómetro), levantamento funcional (NIOSH eq.)',
        statusOptions: ['Apto Pleno', 'Restrição de Carga — Especificar kg', 'Inapto para Trabalho Físico Pesado'],
      },
    ],
  },
  healthcare: {
    label: 'Saúde & Farmácia',
    emoji: '🏥',
    tests: [
      {
        id: 'immunization', name: 'Estado de Imunização (Cobertura Vacinal)',
        purpose: 'Verificação obrigatória de cobertura vacinal para agentes infecciosos de risco ocupacional.',
        parameters: 'Hep B Anti-HBs ≥10 mIU/mL, Varicela IgG, DTP reforço (10a), Influenza (anual), COVID-19 primária',
        statusOptions: ['Completo e Actualizado', 'Incompleto — Completar antes de iniciar funções', 'Contra-indicado (Documentar Justificação)'],
      },
      {
        id: 'tb', name: 'Rastreio de Tuberculose (IGRA / Mantoux)',
        purpose: 'Triagem de TB latente e activa em profissionais de saúde com exposição directa a doentes.',
        parameters: 'QuantiFERON-TB Gold IN-TUBE (ou TST Mantoux ≥10mm); Rx Tórax se resultado reactivo',
        statusOptions: ['Negativo', 'Positivo — Encaminhar Pneumologia Urgente', 'Indeterminado — Repetir em 4 semanas'],
      },
      {
        id: 'bloodborne', name: 'Rastreio Bloodborne (Consentido)',
        purpose: 'Triagem voluntária e confidencial de patogénios de transmissão sanguínea em contexto ocupacional.',
        parameters: 'HIV Ag/Ab combo 4ª geração, HBsAg, Anti-HCV, VDRL/RPR',
        statusOptions: ['Todos Negativos', 'Reactivo — Encaminhar Confidencialmente', 'Recusado — Documentar e Arquivar'],
      },
      {
        id: 'vision_color', name: 'Acuidade Visual & Discriminação de Cores',
        purpose: 'Essencial para trabalho laboratorial, dispensação de medicamentos e triagem clínica precisa.',
        parameters: 'Snellen longe (6/6) e perto (N5), 15 placas Ishihara (cores), pressão intraocular (<21mmHg)',
        statusOptions: ['Normal Sem Correcção', 'Normal Corrigido (Óculos/Lentes — Obrigatório)', 'Défice Significativo — Avaliar Aptidão'],
      },
      {
        id: 'latex', name: 'Rastreio de Alergia ao Látex',
        purpose: 'Triagem de sensibilização a látex em profissionais de saúde com uso frequente de luvas cirúrgicas.',
        parameters: 'Questionário de sintomas ASTM F1671; IgE sérica específica ao látex (ImmunoCAP) se história positiva',
        statusOptions: ['Sem Sensibilização', 'Sensibilizado — Protocolo Látex-Free Obrigatório', 'Alergia Confirmada — EPI Alternativo Permanente'],
      },
    ],
  },
  construction: {
    label: 'Construção & Infraestrutura',
    emoji: '🏗️',
    tests: [
      {
        id: 'fce', name: 'Avaliação de Capacidade Funcional (FCE)',
        purpose: 'Avaliação da aptidão física para trabalho físico intenso, levantamento de cargas e manuseio de materiais.',
        parameters: 'Força de preensão ≥30kg (H)/≥20kg (M), levantamento isoinercial (NIOSH), Step test cardiovascular',
        statusOptions: ['Apto Pleno', 'Apto com Restrição de Carga (Especificar kg)', 'Inapto para Trabalho Físico Pesado'],
      },
      {
        id: 'vestibular', name: 'Avaliação Vestibular & Equilíbrio (Trabalho em Altura)',
        purpose: 'Mandatório para trabalhadores em andaimes, telhados e estruturas a >2m de altitude (EN 363).',
        parameters: 'Romberg modificado, BESS Score (≤10 erros aceitável), rastreio de acrofobia (EVA)',
        statusOptions: ['Aprovado para Trabalho em Altura', 'Aprovado com Supervisão Constante', 'Contra-indicado para Trabalho em Altura >2m'],
      },
      {
        id: 'vision_eq', name: 'Rastreio Visual (Operação de Equipamentos Pesados)',
        purpose: 'Avaliação visual para operadores de gruas, escavadoras, dumpers e outros equipamentos de construção.',
        parameters: 'Snellen mínimo 6/12 corrigido, campo visual periférico ≥120° horizontal, visão de profundidade (estereopsia)',
        statusOptions: ['Aprovado para Operação', 'Aprovado com Lentes Correctoras Obrigatórias', 'Inapto para Operação de Equipamento Pesado'],
      },
      {
        id: 'audiometry_c', name: 'Audiometria (Ruído de Estaleiro)',
        purpose: 'Exposição a ruído elevado de ferramentas de percussão, compressores, vibradores e veículos de obra.',
        parameters: 'Tom puro 500Hz–8kHz bilateral; NIHL screening conforme ISO 1999:2013 e OSHA 29 CFR 1926.52',
        statusOptions: ['Normal', 'Perda Leve ≤25dB', 'PAIR Confirmada — Notificar e Referenciar'],
      },
      {
        id: 'spirometry_c', name: 'Espirometria (Poeiras de Construção)',
        purpose: 'Monitorização de exposição a poeiras de cimento Portland, sílica cristalina e amianto (Decreto 44/2016).',
        parameters: 'FEV1, FVC, FEV1/FVC ratio; Rx Tórax se FVC <80% do previsto ou história de exposição a amianto',
        statusOptions: ['Normal', 'Padrão Restritivo — Investigar Exposição', 'Obstrutivo — Investigar e Controlar Exposição'],
      },
    ],
  },
  chemical: {
    label: 'Química & Manufatura',
    emoji: '⚗️',
    tests: [
      {
        id: 'biomon_chem', name: 'Monitorização Biológica de Solventes',
        purpose: 'Quantificação de marcadores de exposição a solventes orgânicos industriais e pesticidas organofosforados.',
        parameters: 'Ác. Hipúrico urinário (tolueno), Ác. Mandélico (estireno), Acetona urinária; Colinesterase eritrocitária (pesticidas OP)',
        statusOptions: ['Dentro dos BEIs (ACGIH 2024)', 'Acima dos BEIs — Acção Imediata', 'Crítico — Afastar do Agente de Imediato'],
      },
      {
        id: 'spirometry_chem', name: 'Espirometria & DLCO (Vapores Químicos)',
        purpose: 'Monitorização de função pulmonar em exposição a vapores ácidos, isocianatos e gases de amónia/cloro.',
        parameters: 'FEV1, FVC, FEV1/FVC, DLCO (capacidade de difusão); comparar % variação com baseline admissional',
        statusOptions: ['Normal', 'Redução ≥10% vs. Baseline — Investigar', 'Comprometimento Grave — Interditar Posto Imediatamente'],
      },
      {
        id: 'derm', name: 'Rastreio Dermatológico (Dermatite de Contacto)',
        purpose: 'Avaliação de lesões cutâneas por exposição a agentes corrosivos, alergénios industriais e solventes.',
        parameters: 'Inspeção mãos/antebraços/pescoço; Patch Test série ICDRG se história positiva; registo fotográfico documentado',
        statusOptions: ['Sem Lesões Activas', 'Irritação Leve — Reforçar EPI (Luvas Apropriadas)', 'Dermatite Confirmada — Encaminhar Dermatologia'],
      },
      {
        id: 'liver_kidney', name: 'Função Hepática & Renal (Painel)',
        purpose: 'Monitorização de toxicidade sistémica por solventes clorados, metais pesados e agentes hepatotóxicos.',
        parameters: 'ALT, AST, GGT, FA, Bilirrubina T/D; Creatinina sérica, Ureia, TFG estimada (CKD-EPI), Proteinúria (dipstick)',
        statusOptions: ['Dentro dos Limites Normais', 'Alterações Leves — Monitorizar Mensalmente', 'Hepato/Nefrotóxico — Afastar do Agente'],
      },
      {
        id: 'hemato', name: 'Painel Hematológico (Mielossupressão)',
        purpose: 'Detecção de mielossupressão por exposição a benzeno, agentes alquilantes e solventes aromáticos.',
        parameters: 'Hemograma completo: WBC + diferencial, RBC, Hb, Ht, Plaquetas; Reticulócitos se WBC <4.000/µL',
        statusOptions: ['Dentro dos Limites Normais', 'Leucopenia/Trombocitopenia — Encaminhar Urgente', 'Anemia por Exposição Tóxica — Afastar e Investigar'],
      },
    ],
  },
  logistics: {
    label: 'Logística & Condução Comercial',
    emoji: '🚛',
    tests: [
      {
        id: 'vision_drv', name: 'Acuidade Visual & Campo Visual (Condutores)',
        purpose: 'Mandatório para condutores comerciais — Snellen mínimo legal 6/12 corrigido (INAV / DPCA Moçambique).',
        parameters: 'Snellen longe/perto, 15 placas Ishihara (cores), campo visual periférico ≥120° horizontal (confrontação)',
        statusOptions: ['Aprovado para Condução (Visão Normal)', 'Aprovado — Lentes Correctoras Obrigatórias em Serviço', 'Inapto — Défice Visual Significativo (Legal)'],
      },
      {
        id: 'osa', name: 'Rastreio de Apneia do Sono (OSA)',
        purpose: 'Avaliação de risco de sonolência diurna excessiva em condutores de longa distância e nocturnos.',
        parameters: 'Epworth Sleepiness Scale (ESE ≥10 = risco), STOP-BANG Questionnaire, IMC; Polissonografia se indicado',
        statusOptions: ['Baixo Risco (ESE <10)', 'Risco Moderado — Investigação Obrigatória', 'OSA Confirmada — Tratamento CPAP Obrigatório antes de Conduzir'],
      },
      {
        id: 'cardio_drv', name: 'Avaliação Cardiovascular (Risco de Evento Agudo)',
        purpose: 'Triagem de risco de AVC e EAM em condutores profissionais (alto risco por natureza da função).',
        parameters: 'ECG 12 derivações em repouso, PA bilateral, Colesterol total/HDL/LDL, Glicemia em jejum, HbA1c',
        statusOptions: ['Sem Contra-indicação Cardiovascular', 'Risco Moderado — Controlo Médico Regular Obrigatório', 'Alto Risco Cardiovascular — Inapto para Condução Profissional'],
      },
      {
        id: 'reflex', name: 'Tempo de Reacção & Avaliação de Reflexos',
        purpose: 'Avaliação da capacidade de resposta rápida em situações de emergência na condução profissional.',
        parameters: 'Ruler Drop Test (referência <25cm), Finger Tapping Test, tempo de resposta visual simples (<250ms)',
        statusOptions: ['Dentro dos Padrões Aceitáveis (<250ms)', 'Abaixo dos Padrões — Investigar Causa (Medicação/Doença)', 'Inapto — Reflexos Clinicamente Comprometidos'],
      },
      {
        id: 'toxicology_drv', name: 'Rastreio de Substâncias Psicoactivas',
        purpose: 'Detecção mandatória de álcool, drogas ilícitas e medicamentos sedativos em condutores profissionais.',
        parameters: 'Alcoolémia (bafómetro, limite 0.0‰ em serviço), Painel urinário 5: Cannabis, Cocaína, Opioides, Anfetaminas, Benzodiazepinas',
        statusOptions: ['Negativo — Apto para Condução', 'Positivo — Afastar Imediatamente do Veículo', 'Recusou Teste — Registar e Notificar Empregador (Equivale a Positivo)'],
      },
    ],
  },
  oil_gas: {
    label: 'Petróleo & Gás (Offshore/Onshore)',
    emoji: '🛢️',
    tests: [
      {
        id: 'er_fit', name: 'Aptidão para Emergência & Resgate (OGUK Medical)',
        purpose: 'Verificação de capacidade física para uso de SCBA e evacuação de plataformas e instalações offshore.',
        parameters: 'VO2max estimado ≥35 mL/kg/min (OGUK Step test), SCBA donning <60s, evacuação de emergência simulada',
        statusOptions: ['Aprovado para Funções de Emergência (OGUK Fit)', 'Aprovado com Restrições Específicas (Documentar)', 'Inapto para Funções de Emergência Offshore'],
      },
      {
        id: 'audio_og', name: 'Audiometria (Plataformas, Perfuração & Refinarias)',
        purpose: 'Exposição contínua a ruído >90dB(A) de turbinas, motores de perfuração, compressores e processos de refinação.',
        parameters: 'Tom puro bilateral 500Hz–8kHz; registar uso e tipo de EPI auditivo; câmbios de turno offshore (28/28, 14/14)',
        statusOptions: ['Normal (≤25dB todas frequências)', 'PAIR Leve (26–40dB) — Monitorizar', 'PAIR Significativa — Notificar DUAT e Suspender Exposição'],
      },
      {
        id: 'psych', name: 'Rastreio Psicológico (Resiliência & Isolamento)',
        purpose: 'Avaliação de saúde mental para trabalhadores em isolamento prolongado offshore (rotação 28/28 ou 14/14).',
        parameters: 'GHQ-28 (saúde geral), PHQ-9 (depressão ≥10 = positivo), GAD-7 (ansiedade), CAGE (abuso substâncias); entrevista estruturada',
        statusOptions: ['Psicologicamente Apto (Todos Negativos)', 'Em Observação — Suporte Psicológico Recomendado', 'Inapto para Isolamento Prolongado — Reclassificar Função'],
      },
      {
        id: 'resp_og', name: 'Espirometria & DLCO (Vapores de Hidrocarbonetos)',
        purpose: 'Monitorização de função pulmonar por exposição a vapores de hidrocarbonetos aromáticos, H2S e benzeno.',
        parameters: 'FEV1, FVC, FEV1/FVC, DLCO (difusão pulmonar do CO); Rx Tórax anual; Broncoprovocação se indicada clinicamente',
        statusOptions: ['Normal', 'Redução Significativa vs. Baseline (>10%) — Rever Exposição', 'Comprometimento Grave — Afastar da Área Operacional'],
      },
      {
        id: 'liver_og', name: 'Painéis Hepático & Renal (Hidrocarbonetos)',
        purpose: 'Avaliação de toxicidade orgânica sistémica por hidrocarbonetos aromáticos e químicos de fluido de perfuração.',
        parameters: 'ALT, AST, GGT, FA, Bilirrubina T/D; Creatinina, TFG estimada (CKD-EPI); Benzeno urinário (SPME-GC/MS)',
        statusOptions: ['Dentro dos Limites Normais', 'Alterações Leves — Monitorizar Bi-mensalmente', 'Hepato/Nefrotoxicidade — Protocolo Urgente H365 CHAEM'],
      },
      {
        id: 'heat_cardio', name: 'Avaliação Cardiovascular (Stress Térmico)',
        purpose: 'Avaliação de risco cardiovascular em ambientes de calor extremo (plataformas tropicais, deserto, refinarias).',
        parameters: 'ECG 12D, PA bilateral, FC repouso, WBGT exposure rating (°C), osmolalidade urinária (hidratação)',
        statusOptions: ['Apto para Exposição Térmica (WBGT ≤33°C)', 'Risco Moderado — Hidratação Reforçada e Pausas', 'Alto Risco — Contra-indicado WBGT >28°C (Protocolo Térmico)'],
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STAGE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<ExamStage, { colorClass: string; bgClass: string; borderClass: string; focus: string; actions: string[] }> = {
  'Admissional': {
    colorClass: 'text-blue-700', bgClass: 'bg-blue-50', borderClass: 'border-blue-200',
    focus: 'Estabelecer valores de BASELINE, documentar condições pré-existentes e emitir Declaração de Aptidão formal para o posto.',
    actions: [
      'Documentar TODOS os resultados como BASELINE de referência futura no H365',
      'Verificar historial médico pré-emprego e condições crónicas declaradas (e não declaradas)',
      'Fotografar e registar lesões cutâneas ou condições pré-existentes visíveis',
      'Explicar ao trabalhador os riscos específicos do posto de trabalho e EPIs necessários',
      'Emitir AMA (Atestado Médico de Aptidão) admissional assinado, carimbado e arquivado no H365',
    ],
  },
  'Periódico': {
    colorClass: 'text-teal-700', bgClass: 'bg-teal-50', borderClass: 'border-teal-200',
    focus: 'Análise comparativa com baseline e rastreio de exposição cumulativa dentro dos Limites de Exposição Biológica (BEIs/ACGIH).',
    actions: [
      'Recuperar e comparar TODOS os resultados com valores de baseline admissional arquivados',
      'Documentar variação percentual crítica (ex: "FVC reduziu 8% vs. baseline 2023 — investigar")',
      'Verificar acumulação de exposição: limite de turno vs. limite cumulativo anual (TWA/STEL)',
      'Registar alterações e adequação de EPI (Equipamento de Protecção Individual) actualmente utilizados',
      'Emitir AMA periódico com registo comparativo de evolução clínica longitudinal',
    ],
  },
  'Demissional': {
    colorClass: 'text-violet-700', bgClass: 'bg-violet-50', borderClass: 'border-violet-200',
    focus: 'Mitigação de responsabilidade legal, clearance toxicológica terminal e documentação definitiva do estado fisiológico final.',
    actions: [
      'Efectuar clearance toxicológica completa e final (obrigatório para sectores de risco biológico e químico)',
      'Documentar e comparar estado de saúde actual vs. baseline admissional (delta longitudinal completo)',
      'Emitir Relatório de Saúde Ocupacional Final com validade legal (assinado e carimbado)',
      'Notificar formalmente o empregador de quaisquer condições relacionadas com o trabalho detectadas',
      'Registar como "Trabalhador Saído" no H365 — preservar dados por mínimo 20 anos (Lei n.º 4/2007)',
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// KPI DASHBOARD DATA — 4 MISAU Administrative Levels
// ─────────────────────────────────────────────────────────────────────────────

const KPI_LEVELS = {
  facility: {
    title: 'Unidade Sanitária',
    subtitle: 'Hospital / Centro de Saúde CHAEM',
    Icon: Home,
    sparkData: [32, 28, 41, 39, 44, 42, 47],
    sparkColor: '#0d9488',
    kpis: [
      { label: 'Exames Realizados Hoje', value: '47', unit: '', trend: '+12%', up: true, color: 'teal', desc: 'vs. média semanal' },
      { label: 'Tempo Médio de Atendimento', value: '34', unit: ' min', trend: '-8 min', up: true, color: 'blue', desc: 'Admissão → AMA emitido' },
      { label: 'Taxa de Aptidão Restrita', value: '14.2', unit: '%', trend: '+2.1%', up: false, color: 'amber', desc: 'Apto c/ restrições activas' },
      { label: 'Alertas Biológicos Críticos', value: '3', unit: '', trend: 'Hoje', up: false, color: 'rose', desc: 'Requerem acção imediata' },
      { label: 'Absenteísmo a Exames', value: '7.3', unit: '%', trend: '-1.2%', up: true, color: 'violet', desc: 'Exames periódicos perdidos' },
    ],
  },
  district: {
    title: 'Nível Distrital (DDS)',
    subtitle: 'Direcção Distrital de Saúde',
    Icon: Building2,
    sparkData: [58, 61, 60, 63, 65, 66, 68],
    sparkColor: '#2563eb',
    kpis: [
      { label: 'Cumprimento de Rastreio Sectorial', value: '68', unit: '%', trend: '+5%', up: true, color: 'teal', desc: 'Empresas conformes no distrito' },
      { label: 'Incidência Doenças Profissionais', value: '23', unit: '/10k', trend: '-3/10k', up: true, color: 'blue', desc: 'Trabalhadores afectados' },
      { label: 'Contratos Empresariais Activos', value: '112', unit: '', trend: '+8 novos', up: true, color: 'indigo', desc: 'Empresas com protocolo H365' },
      { label: 'Utilização Média por Unidade', value: '78', unit: '%', trend: 'Estável', up: null, color: 'amber', desc: 'Variância entre unidades DDS' },
    ],
  },
  provincial: {
    title: 'Nível Provincial (DPS)',
    subtitle: 'Direcção Provincial de Saúde',
    Icon: MapPin,
    sparkData: [3.1, 3.4, 3.2, 3.6, 3.8, 3.9, 4.2],
    sparkColor: '#7c3aed',
    kpis: [
      { label: 'Índice de Risco Provincial', value: 'Moderado', unit: '', trend: 'Estável', up: null, color: 'orange', desc: 'Mapa de hazards sectorial' },
      { label: 'Rácio de Inaptidão por Sector', value: '8.7', unit: '%', trend: '-0.3%', up: true, color: 'teal', desc: 'Trabalhadores declarados Inaptos' },
      { label: 'Tempo Médio Lab Provincial', value: '4.2', unit: ' dias', trend: '-1.1d', up: true, color: 'blue', desc: 'Processamento toxicológico ref.' },
      { label: 'Receita Ciclo H365 (Mês)', value: '4.2M', unit: ' MZN', trend: '+18%', up: true, color: 'emerald', desc: 'Facturação exames corporativos' },
    ],
  },
  national: {
    title: 'Nível Nacional (MISAU Central)',
    subtitle: 'Ministério da Saúde de Moçambique',
    Icon: Globe,
    sparkData: [51, 53, 55, 55, 57, 59, 61],
    sparkColor: '#059669',
    kpis: [
      { label: 'Índice Nacional Saúde Ocupacional', value: '61', unit: '/100', trend: '+4 pts', up: true, color: 'teal', desc: 'Saúde da força laboral formal' },
      { label: 'Doenças Profissionais Notificáveis', value: '1,847', unit: '', trend: 'Acum. anual', up: null, color: 'rose', desc: 'Notificadas ao MISAU Central' },
      { label: 'Taxa de Penetração CHAEM/H365', value: '34', unit: '%', trend: '+9%', up: true, color: 'blue', desc: 'Unidades activas no módulo' },
      { label: 'Alertas Sentinela Cross-App', value: '12', unit: '', trend: 'Este mês', up: null, color: 'amber', desc: 'Escalados para H365 principal' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COLOR UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const CC: Record<string, { bg: string; text: string; border: string }> = {
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
};

// ─────────────────────────────────────────────────────────────────────────────
// SPARKLINE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function Sparkline({ data, color = '#14b8a6' }: { data: number[]; color?: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const W = 80, H = 32, P = 4;
  const pts = data.map((v, i) => ({
    x: P + (i / (data.length - 1)) * (W - 2 * P),
    y: H - P - ((v - min) / range) * (H - 2 * P),
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg width={W} height={H} className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
      <circle cx={last.x} cy={last.y} r="3.5" fill={color} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({ kpi }: { kpi: (typeof KPI_LEVELS)['facility']['kpis'][0] }) {
  const cc = CC[kpi.color] ?? CC.teal;
  return (
    <div className={`rounded-2xl border p-5 ${cc.bg} ${cc.border}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${cc.text} opacity-60`}>{kpi.label}</p>
      <div className="flex items-baseline gap-0.5 mb-1">
        <span className={`text-2xl font-extrabold tracking-tight ${cc.text}`}>{kpi.value}</span>
        {kpi.unit && <span className={`text-sm font-semibold ${cc.text} opacity-60`}>{kpi.unit}</span>}
      </div>
      <p className={`text-[11px] mb-3 ${cc.text} opacity-40`}>{kpi.desc}</p>
      <div>
        {kpi.up === true && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />{kpi.trend}
          </span>
        )}
        {kpi.up === false && (
          <span className="text-xs font-bold text-rose-600 flex items-center gap-0.5">
            <TrendingDown className="w-3 h-3" />{kpi.trend}
          </span>
        )}
        {kpi.up === null && (
          <span className={`text-xs font-bold ${cc.text} opacity-50`}>{kpi.trend}</span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD VIEW
// ─────────────────────────────────────────────────────────────────────────────

function DashboardView({
  level, setLevel, allowedLevels, exams, onNewExam,
}: {
  level: DashLevel;
  setLevel: (l: DashLevel) => void;
  allowedLevels: DashLevel[];
  exams: OccupationalExam[];
  onNewExam?: () => void;
}) {
  const ld = KPI_LEVELS[level];
  const levels: Array<{ key: DashLevel; label: string; Icon: React.ElementType }> = [
    { key: 'facility', label: 'Unidade', Icon: Home },
    { key: 'district', label: 'Distrito (DDS)', Icon: Building2 },
    { key: 'provincial', label: 'Província (DPS)', Icon: MapPin },
    { key: 'national', label: 'Nacional (MISAU)', Icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Level Tabs — RBAC-locked */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {levels.map(({ key, label, Icon }) => {
          const allowed = allowedLevels.includes(key);
          return (
            <button key={key}
              onClick={() => allowed && setLevel(key)}
              title={!allowed ? 'Nível de acesso restrito para o seu perfil' : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                !allowed
                  ? 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed'
                  : level === key
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-600'
              }`}>
              {!allowed
                ? <Lock className="w-3.5 h-3.5" />
                : <Icon className="w-4 h-4" />}
              {label}
            </button>
          );
        })}
      </div>

      {/* Level header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{ld.title}</h2>
          <p className="text-sm text-slate-400">{ld.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-100 rounded-xl">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-teal-700">L-LAN Activa</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ld.kpis.map((kpi, i) => <KpiCard key={i} kpi={kpi as any} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trend Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-700 text-sm">Tendência — Últimos 7 Dias</h3>
              <p className="text-xs text-slate-400 mt-0.5">{ld.title}</p>
            </div>
            <Sparkline data={ld.sparkData} color={ld.sparkColor} />
          </div>
          <div className="space-y-3">
            {ld.kpis.slice(0, 3).map((kpi, i) => {
              const rawNum = parseFloat(String(kpi.value).replace(/[^0-9.]/g, ''));
              const isNumeric = !isNaN(rawNum) && rawNum > 0;
              // Scale: if value looks like a large number (M suffix or >100), clamp differently
              const isMillion = String(kpi.value).includes('M');
              const pct = isNumeric
                ? isMillion ? Math.min((rawNum / 10) * 100, 100)
                  : Math.min(rawNum, 100)
                : 28; // qualitative/non-numeric → show at 28% with hatching
              const cc = CC[kpi.color] ?? CC.teal;
              const barColors: Record<string, string> = {
                teal: 'bg-teal-400', blue: 'bg-blue-400', amber: 'bg-amber-400',
                rose: 'bg-rose-400', violet: 'bg-violet-400', indigo: 'bg-indigo-400',
                orange: 'bg-orange-400', emerald: 'bg-emerald-400',
              };
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-36 shrink-0 truncate">{kpi.label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all chaem-bar ${isNumeric ? barColors[kpi.color] || 'bg-teal-400' : 'bg-slate-300'}`}
                      style={{ '--bar-w': `${pct}%`, '--bar-op': isNumeric ? '1' : '0.5' } as React.CSSProperties}
                    />
                  </div>
                  <span className={`text-xs font-bold ${cc.text} shrink-0 min-w-[3rem] text-right`}>{kpi.value}{kpi.unit}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Exams Quick View */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700 text-sm">Exames Recentes (L-LAN)</h3>
            {onNewExam && (
              <button onClick={onNewExam} className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors">
                <PlusCircle className="w-3.5 h-3.5" />Novo Exame
              </button>
            )}
          </div>
          {exams.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum exame registado</p>
              <p className="text-xs mt-1">Registe o primeiro exame para sincronizar na L-LAN</p>
            </div>
          ) : (
            <div className="space-y-2">
              {exams.slice(0, 5).map(exam => (
                <div key={exam.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-base shrink-0">
                    {SECTOR_CONFIG[exam.sector]?.emoji || '🏥'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{exam.patientName}</p>
                    <p className="text-xs text-slate-400 truncate">{exam.examType} • {exam.companyName} • {exam.date}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                    exam.status === 'Apto' ? 'bg-emerald-100 text-emerald-700' :
                    exam.status === 'Inapto' ? 'bg-rose-100 text-rose-700' :
                    exam.status === 'Inapto Temporário' ? 'bg-orange-100 text-orange-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{exam.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── SECTOR ANALYTICS CHARTS ── */}
      {(() => {
        // Derive per-sector stats from real stored exams
        const sectors = Object.entries(SECTOR_CONFIG).map(([key, cfg]) => {
          const sx = exams.filter(e => e.sector === key);
          return {
            key, emoji: cfg.emoji, label: cfg.label,
            total: sx.length,
            apto:    sx.filter(e => e.status === 'Apto').length,
            aptoR:   sx.filter(e => e.status === 'Apto com Restrições').length,
            inaptoT: sx.filter(e => e.status === 'Inapto Temporário').length,
            inapto:  sx.filter(e => e.status === 'Inapto').length,
          };
        });
        const withData   = sectors.filter(s => s.total > 0);
        const maxTotal   = Math.max(...sectors.map(s => s.total), 1);
        const totalEx    = exams.length;
        const totApto    = exams.filter(e => e.status === 'Apto').length;
        const totAptoR   = exams.filter(e => e.status === 'Apto com Restrições').length;
        const totInaptoT = exams.filter(e => e.status === 'Inapto Temporário').length;
        const totInapto  = exams.filter(e => e.status === 'Inapto').length;
        const donutSlots = [
          { label: 'Apto',               count: totalEx > 0 ? totApto    : 6, color: '#10b981' },
          { label: 'Apto c/ Restrições', count: totalEx > 0 ? totAptoR   : 2, color: '#f59e0b' },
          { label: 'Inapto Temporário',  count: totalEx > 0 ? totInaptoT : 1, color: '#f97316' },
          { label: 'Inapto',             count: totalEx > 0 ? totInapto  : 1, color: '#ef4444' },
        ];
        const donutTotal  = donutSlots.reduce((a, b) => a + b.count, 0) || 1;
        const isDemo      = totalEx === 0;
        const riskSectors = [...withData].sort((a, b) => (b.inapto + b.inaptoT) - (a.inapto + a.inaptoT));

        // Build SVG donut segments
        const R = 50, cx = 68, cy = 68, sw = 18;
        const circ = 2 * Math.PI * R;
        let offset = 0;
        const segs = donutSlots.map(s => {
          const da = (s.count / donutTotal) * circ;
          const seg = { ...s, da, off: -offset };
          offset += da;
          return seg;
        });

        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Análise por Sector Industrial</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {totalEx > 0
                    ? `${totalEx} exame${totalEx !== 1 ? 's' : ''} registados — dados reais L-LAN`
                    : 'Nenhum exame ainda — gráficos de demonstração abaixo'}
                </p>
              </div>
              <BarChart2 className="w-5 h-5 text-teal-400 shrink-0" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* ── Chart A: Sector Stacked Bar ── */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-0.5">
                  Exames por Sector
                </h4>
                <p className="text-[10px] text-slate-400 mb-4">
                  Cada barra mostra a proporção de aptidão dentro do sector
                </p>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {[
                    { color: 'bg-emerald-500', label: 'Apto' },
                    { color: 'bg-amber-400',   label: 'Apto c/ Rest.' },
                    { color: 'bg-orange-400',  label: 'Inapto Temp.' },
                    { color: 'bg-rose-500',    label: 'Inapto' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                      <span className="text-[9px] font-bold text-slate-500">{l.label}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {(withData.length > 0 ? withData : [
                    { key:'mining',    emoji:'⛏️', label:'Mineração',   total:8, apto:5, aptoR:2, inaptoT:1, inapto:0 },
                    { key:'healthcare',emoji:'🏥', label:'Saúde',       total:6, apto:5, aptoR:1, inaptoT:0, inapto:0 },
                    { key:'construction',emoji:'🏗️',label:'Construção', total:4, apto:2, aptoR:1, inaptoT:1, inapto:0 },
                  ].map(s => ({ ...s, maxTotal: 8 }))).map(s => {
                    const t = s.total || 1;
                    const w = (s.total / maxTotal) * 100;
                    const ap = (s.apto    / t) * 100;
                    const ar = (s.aptoR   / t) * 100;
                    const it = (s.inaptoT / t) * 100;
                    const ip = (s.inapto  / t) * 100;
                    return (
                      <div key={s.key} className={isDemo && withData.length === 0 ? 'opacity-40' : ''}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-slate-700">{s.emoji} {s.label}</span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {isDemo && withData.length === 0 ? 'DEMO' : `${s.total} exam.`}
                          </span>
                        </div>
                        {/* Outer bar width ∝ sector total vs max; inner segments = status % */}
                        <div className="w-full h-6 bg-slate-100 rounded-lg overflow-hidden">
                          <div className="h-full flex chaem-bar" style={{ '--bar-w': `${w}%` } as React.CSSProperties}>
                            {ap > 0 && <div className="h-full bg-emerald-500 chaem-bar" style={{ '--bar-w': `${ap}%` } as React.CSSProperties} title={`Apto: ${s.apto}`} />}
                            {ar > 0 && <div className="h-full bg-amber-400 chaem-bar"   style={{ '--bar-w': `${ar}%` } as React.CSSProperties} title={`Apto c/ Restrições: ${s.aptoR}`} />}
                            {it > 0 && <div className="h-full bg-orange-400 chaem-bar"  style={{ '--bar-w': `${it}%` } as React.CSSProperties} title={`Inapto Temp.: ${s.inaptoT}`} />}
                            {ip > 0 && <div className="h-full bg-rose-500 chaem-bar"    style={{ '--bar-w': `${ip}%` } as React.CSSProperties} title={`Inapto: ${s.inapto}`} />}
                          </div>
                        </div>
                        {/* Sub-labels */}
                        {!(isDemo && withData.length === 0) && (
                          <div className="flex gap-3 mt-1 text-[9px] font-bold">
                            {s.apto    > 0 && <span className="text-emerald-600">✓ {s.apto}</span>}
                            {s.aptoR   > 0 && <span className="text-amber-600">⚠ {s.aptoR}</span>}
                            {s.inaptoT > 0 && <span className="text-orange-600">↺ {s.inaptoT}</span>}
                            {s.inapto  > 0 && <span className="text-rose-600">✗ {s.inapto}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {isDemo && withData.length === 0 && (
                  <p className="text-[10px] text-center text-slate-300 italic mt-4 pt-3 border-t border-slate-100">
                    Registe exames para ver dados reais por sector
                  </p>
                )}
              </div>

              {/* ── Chart B: Aptitude Donut ── */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-0.5">
                  Distribuição de Aptidão Global
                </h4>
                <p className="text-[10px] text-slate-400 mb-4">Todos os sectores combinados</p>
                <div className="flex items-center gap-5">
                  {/* SVG Donut */}
                  <div className="shrink-0 relative">
                    <svg width={136} height={136} viewBox="0 0 136 136">
                      <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
                      {segs.map((s, i) => (
                        <circle key={i} cx={cx} cy={cy} r={R} fill="none"
                          stroke={s.color} strokeWidth={sw}
                          strokeOpacity={isDemo ? 0.25 : 0.92}
                          strokeDasharray={`${s.da.toFixed(2)} ${(circ - s.da).toFixed(2)}`}
                          strokeDashoffset={s.off.toFixed(2)}
                          transform={`rotate(-90, ${cx}, ${cy})`}
                        />
                      ))}
                      {/* Centre */}
                      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="900" fill="#1e293b">
                        {totalEx > 0 ? totalEx : '—'}
                      </text>
                      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="9" fontWeight="700" fill="#94a3b8" letterSpacing="1">
                        EXAMES
                      </text>
                      {isDemo && (
                        <text x={cx} y={cy + 24} textAnchor="middle" fontSize="8" fontWeight="700" fill="#cbd5e1">DEMO</text>
                      )}
                    </svg>
                  </div>
                  {/* Legend + values */}
                  <div className="flex-1 space-y-3">
                    {donutSlots.map(s => {
                      const pct = totalEx > 0 ? ((s.count / donutTotal) * 100).toFixed(0) : null;
                      return (
                        <div key={s.label} className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-sm shrink-0 chaem-swatch" style={{ '--seg-color': s.color } as React.CSSProperties} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-700 leading-none">{s.label}</p>
                            {totalEx > 0 && (
                              <p className="text-[9px] text-slate-400 mt-0.5">{s.count} exame{s.count !== 1 ? 's' : ''} · {pct}%</p>
                            )}
                          </div>
                          {totalEx > 0 && (
                            <span className="text-xs font-extrabold shrink-0 chaem-seg-text" style={{ '--seg-color': s.color } as React.CSSProperties}>{pct}%</span>
                          )}
                        </div>
                      );
                    })}
                    {totalEx > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-emerald-600">
                          Taxa de Aptidão: {((totApto / totalEx) * 100).toFixed(1)}%
                        </p>
                        <p className="text-[9px] text-slate-400">Apto pleno s/ restrições</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Chart C: Critical Sector Alerts ── */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                    Sectores com Maior Concentração de Risco
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Ordenado por inaptidões confirmadas + temporárias
                  </p>
                </div>
                <Activity className="w-4 h-4 text-rose-400 shrink-0" />
              </div>
              {riskSectors.length === 0 ? (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Stethoscope className="w-8 h-8 text-slate-200 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-400">Sem dados — registe exames para ver alertas por sector</p>
                    <p className="text-xs text-slate-300 mt-0.5">Os sectores com maior risco serão listados aqui por ordem de prioridade</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {riskSectors.map((s, i) => {
                    const riskN = s.inapto + s.inaptoT;
                    const riskPct = s.total > 0 ? Math.round((riskN / s.total) * 100) : 0;
                    const lvl = riskN === 0 ? 'low' : riskPct >= 25 ? 'high' : 'mid';
                    return (
                      <div key={s.key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        lvl === 'high' ? 'bg-rose-50 border-rose-200' :
                        lvl === 'mid'  ? 'bg-amber-50 border-amber-200' :
                        'bg-emerald-50 border-emerald-100'
                      }`}>
                        <span className="text-[10px] font-extrabold text-slate-400 w-4 text-center shrink-0">#{i+1}</span>
                        <span className="text-lg shrink-0">{s.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{s.label}</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">
                            {s.total} exam. · {s.apto} Apto · {riskN} em risco
                          </p>
                        </div>
                        {/* Mini progress bar for risk % */}
                        <div className="w-20 h-1.5 bg-white/60 rounded-full overflow-hidden shrink-0">
                          <div className={`h-full rounded-full chaem-bar ${
                            lvl === 'high' ? 'bg-rose-500' : lvl === 'mid' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} style={{ '--bar-w': `${Math.max(riskPct, lvl === 'low' ? 4 : riskPct)}%` } as React.CSSProperties} />
                        </div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                          lvl === 'high' ? 'bg-rose-100 text-rose-700' :
                          lvl === 'mid'  ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {lvl === 'low' ? '✓ OK' : `${riskPct}% risco`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Sentinel Alert Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg shadow-teal-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">Sistema de Alerta Sentinela CHAEM → H365 Principal</p>
            <p className="text-xs text-teal-100 mt-1 leading-relaxed">
              Casos críticos detectados (TB+, toxicidade severa, doença profissional notificável) são automaticamente
              escalados para o painel de Vigilância Epidemiológica do H365 a nível do DDS e DPS — bridging saúde
              ocupacional com segurança pública.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-3xl font-extrabold">12</div>
            <div className="text-xs text-teal-200">alertas/mês</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAM FORM VIEW — Dynamic Sector Engine
// ─────────────────────────────────────────────────────────────────────────────

interface FormState {
  patientId: string; patientName: string; companyName: string; hazards: string;
  bp: string; hr: string; temp: string; heightWeight: string;
  weight: string; height: string;
  systems: Record<string, boolean>;
  vitalsNotes: string;
  testResults: Record<string, { status: string; notes: string }>;
  stageActions: Record<number, boolean>;
  determination: string; restrictions: string; reviewDays: string; physicianLicense: string;
}

const defaultForm: FormState = {
  patientId: '', patientName: '', companyName: '', hazards: '',
  bp: '', hr: '', temp: '', heightWeight: '',
  weight: '', height: '',
  systems: { cardiovascular: false, respiratory: false, musculoskeletal: false, dermatological: false },
  vitalsNotes: '', testResults: {}, stageActions: {},
  determination: '', restrictions: '', reviewDays: '', physicianLicense: '',
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PDF HELPER  — loadImg + generateAMAPdf
// ─────────────────────────────────────────────────────────────────────────────

/** Fetches a public asset URL and returns a base64 data-URI string for jsPDF */
/** Module-level image cache — loaded once at startup, before any user clicks */
let _cachedMisauImg: string | null = null;
let _cachedH365Img: string | null = null;

async function preloadPdfImages(): Promise<void> {
  try {
    const fetchB64 = async (src: string): Promise<string | null> => {
      try {
        const res = await fetch(src);
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise<string>(resolve => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.readAsDataURL(blob);
        });
      } catch { return null; }
    };
    [_cachedMisauImg, _cachedH365Img] = await Promise.all([
      fetchB64('/misau_logo.png'),
      fetchB64('/logo.png'),
    ]);
  } catch { /* silently ignore */ }
}
// Pre-load at module initialisation (runs before any user interaction)
preloadPdfImages();

interface AMAPayload {
  patientId: string; patientName: string; companyName: string;
  sectorLabel: string; sector: string;
  examType: string; examDate: string; examId: string;
  physicianLicense: string;
  hazards?: string;
  bp?: string; hr?: string; temp?: string; heightWeight?: string;
  systems?: Record<string, boolean>;
  vitalsNotes?: string;
  testResults?: Record<string, { status: string; notes: string }>;
  determination: string;
  restrictions?: string;
  reviewDays?: string;
}

/** Synchronous PDF generator — safe to call inside onClick (user-gesture context preserved) */
function generateAMAPdf(payload: AMAPayload): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const margin = 18;
  const colW = W - margin * 2;
  let y = 0;

  const misauImg = _cachedMisauImg;
  const h365Img  = _cachedH365Img;

  const drawLine = (x1: number, y1: number, x2: number, y2: number, color = '#e2e8f0') => {
    doc.setDrawColor(color); doc.line(x1, y1, x2, y2);
  };
  const fillRect = (x: number, ry: number, w: number, h: number, fill: string) => {
    doc.setFillColor(fill); doc.rect(x, ry, w, h, 'F');
  };
  const txt = (text: string, x: number, ty: number, size: number, bold: boolean,
               color = '#1e293b', align: 'left' | 'center' | 'right' = 'left') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(color);
    doc.text(text, x, ty, { align });
  };
  const field = (label: string, value: string, x: number, fy: number) => {
    txt(label.toUpperCase(), x, fy, 6.5, true, '#64748b');
    txt(value || '\u2014', x, fy + 4.5, 9, false, '#1e293b');
  };

  const sectorCfg = payload.sector ? SECTOR_CONFIG[payload.sector] : null;

  // ── HEADER ─────────────────────────────────────────────────────────────────
  fillRect(0, 0, W, 38, '#0f766e');
  fillRect(0, 38, W, 3, '#14b8a6');

  // MISAU logo left
  if (misauImg) {
    try { doc.addImage(misauImg, 'PNG', margin, 4, 22, 30); } catch { /* fallback */ }
  }
  if (!misauImg) {
    fillRect(margin, 6, 22, 26, '#0d9488');
    txt('MISAU', margin + 11, 19, 7, true, '#ffffff', 'center');
  }

  // Central header text
  txt('REP\u00daBLICA DE MO\u00c7AMBIQUE', W / 2, 10, 7, false, '#99f6e4', 'center');
  txt('MINIST\u00c9RIO DA SA\u00daDE \u2014 MISAU', W / 2, 17, 10, true, '#ffffff', 'center');
  txt('CHAEM \u2014 Centro de Sa\u00fade Ambiental e do Ecossistema', W / 2, 24, 8, false, '#ccfbf1', 'center');
  txt('Direc\u00e7\u00e3o de Sa\u00fade Ocupacional e Higiene Industrial', W / 2, 30, 7, false, '#99f6e4', 'center');

  // H365 logo right
  if (h365Img) {
    try { doc.addImage(h365Img, 'PNG', W - margin - 22, 4, 22, 22); } catch { /* fallback */ }
  }
  if (!h365Img) {
    fillRect(W - margin - 22, 6, 22, 22, '#0d9488');
    txt('H365', W - margin - 11, 14, 8, true, '#ffffff', 'center');
    txt('CHAEM', W - margin - 11, 20, 6, false, '#99f6e4', 'center');
  }

  txt(`N.\u00ba: ${payload.examId}`, W - margin, 35, 6.5, false, '#ccfbf1', 'right');
  y = 48;

  // ── TITLE ─────────────────────────────────────────────────────────────────
  txt('ATESTADO M\u00c9DICO DE APTID\u00c3O (AMA)', W / 2, y + 7, 14, true, '#0f766e', 'center');
  txt(`Exame ${payload.examType.toUpperCase()} \u2014 ${payload.sectorLabel.toUpperCase()}`, W / 2, y + 14, 9, false, '#475569', 'center');
  txt(payload.examDate, W / 2, y + 20, 8, false, '#94a3b8', 'center');
  y += 26; drawLine(margin, y, W - margin, y, '#14b8a6'); y += 6;

  // ── SECTION 1: Patient ─────────────────────────────────────────────────────
  fillRect(margin, y, colW, 7, '#f1fafb');
  txt('1. IDENTIFICA\u00c7\u00c3O DO TRABALHADOR', margin + 3, y + 5, 8, true, '#0f766e');
  y += 10;
  const halfW = (colW - 6) / 2;
  field('N.\u00ba BI / NUIT', payload.patientId, margin, y);
  field('Nome Completo', payload.patientName, margin + halfW + 6, y);
  y += 12;
  field('Empresa / Empregador', payload.companyName, margin, y);
  y += 12;
  field('Sector / Ind\u00fastria', payload.sectorLabel, margin, y);
  field('Tipo de Exame', payload.examType, margin + halfW + 6, y);
  y += 12;
  if (payload.hazards) { field('Riscos Ocupacionais', payload.hazards, margin, y); y += 12; }
  drawLine(margin, y, W - margin, y); y += 6;

  // ── SECTION 2: Vitals ─────────────────────────────────────────────────────
  fillRect(margin, y, colW, 7, '#f1fafb');
  txt('2. SINAIS VITAIS & ANTECEDENTES', margin + 3, y + 5, 8, true, '#0f766e');
  y += 10;
  const thirdW = (colW - 12) / 3;
  const vitals = [
    { l: 'Tens\u00e3o Arterial', v: payload.bp || '' },
    { l: 'Freq. Card\u00edaca', v: payload.hr ? `${payload.hr} bpm` : '' },
    { l: 'Temperatura', v: payload.temp ? `${payload.temp} \u00b0C` : '' },
    { l: 'Altura / Peso', v: payload.heightWeight || '' },
  ].filter(v => v.v);
  let vIdx = 0;
  vitals.forEach((v, i) => { field(v.l, v.v, margin + (i % 3) * (thirdW + 6), y); vIdx = i; if (i % 3 === 2) y += 12; });
  if (vitals.length > 0 && vIdx % 3 !== 2) y += 12;
  const activeSystems = Object.entries(payload.systems || {}).filter(([, v]) => v).map(([k]) => k);
  if (activeSystems.length > 0) { field('Sistemas com Altera\u00e7\u00f5es', activeSystems.join(', '), margin, y); y += 12; }
  if (payload.vitalsNotes) { field('Observa\u00e7\u00f5es Cl\u00ednicas', payload.vitalsNotes, margin, y); y += 12; }
  drawLine(margin, y, W - margin, y); y += 6;

  // ── SECTION 3: Tests + Results Summary ────────────────────────────────────
  const testResults = payload.testResults || {};
  const tests = sectorCfg?.tests || [];
  const filledTests = tests.filter(t => testResults[t.id]?.status || testResults[t.id]?.notes);

  if (filledTests.length > 0) {
    fillRect(margin, y, colW, 7, '#f1fafb');
    txt('3. PAINEL DIAGN\u00d3STICO SECTORIAL', margin + 3, y + 5, 8, true, '#0f766e');
    y += 10;
    tests.forEach((test, idx) => {
      const result = testResults[test.id];
      if (!result?.status && !result?.notes) return;
      if (y > 248) { doc.addPage(); y = 20; }
      const isOk   = /normal|apt|negat|dentro|aprovad/i.test(result?.status || '');
      const isWarn = /aten|limiar|suspeito/i.test(result?.status || '');
      const sc = isOk ? '#16a34a' : isWarn ? '#d97706' : '#dc2626';
      fillRect(margin, y, colW, 6, idx % 2 === 0 ? '#f8fafc' : '#ffffff');
      txt(`${idx + 1}. ${test.name}`, margin + 2, y + 4.5, 8, true, '#334155');
      if (result?.status) txt(`\u25cf ${result.status}`, W - margin - 2, y + 4.5, 7.5, true, sc, 'right');
      y += 8;
      if (result?.notes) { txt(`   Notas: ${result.notes}`, margin + 3, y, 7.5, false, '#64748b'); y += 5; }
      y += 1;
    });

    // Results summary box
    if (y > 220) { doc.addPage(); y = 20; }
    const passed = filledTests.filter(t => /normal|apt|negat|dentro|aprovad/i.test(testResults[t.id]?.status || '')).length;
    const warned = filledTests.filter(t => /aten|limiar|suspeito/i.test(testResults[t.id]?.status || '')).length;
    const failed = filledTests.length - passed - warned;
    const total  = filledTests.length;
    y += 2;
    fillRect(margin, y, colW, 28, '#f1fafb');
    doc.setDrawColor('#e2e8f0'); doc.rect(margin, y, colW, 28);
    txt('RESUMO DOS RESULTADOS', margin + 4, y + 7, 8, true, '#334155');
    const cellW = (colW - 8) / 4;
    const summaryItems = [
      { label: 'Total Testes', value: String(total),  color: '#475569', bg: '#f1f5f9' },
      { label: 'Normais / Aptos', value: String(passed), color: '#16a34a', bg: '#f0fdf4' },
      { label: 'Em Aten\u00e7\u00e3o',   value: String(warned), color: '#d97706', bg: '#fffbeb' },
      { label: 'Cr\u00edticos',       value: String(failed), color: '#dc2626', bg: '#fef2f2' },
    ];
    summaryItems.forEach((item, i) => {
      const cx = margin + 4 + i * (cellW + 2);
      fillRect(cx, y + 11, cellW, 13, item.bg);
      txt(item.value, cx + cellW / 2, y + 20, 14, true, item.color, 'center');
      txt(item.label, cx + cellW / 2, y + 25, 6, false, item.color, 'center');
    });
    y += 34;
    drawLine(margin, y, W - margin, y); y += 6;
  }

  // ── SECTION 4: Determination ──────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  const det = payload.determination || 'N/A';
  const detColor = det === 'Apto' ? '#16a34a' : det === 'Apto com Restri\u00e7\u00f5es' ? '#d97706' : det === 'Inapto Tempor\u00e1rio' ? '#ea580c' : '#dc2626';
  const detBg    = det === 'Apto' ? '#f0fdf4' : det === 'Apto com Restri\u00e7\u00f5es' ? '#fffbeb' : det === 'Inapto Tempor\u00e1rio' ? '#fff7ed' : '#fef2f2';
  fillRect(margin, y, colW, 18, detBg);
  doc.setDrawColor(detColor); doc.setLineWidth(0.8); doc.rect(margin, y, colW, 18); doc.setLineWidth(0.2);
  txt('DETERMINA\u00c7\u00c3O CL\u00cdNICA (AMA)', margin + 4, y + 6, 8, true, '#64748b');
  txt(det.toUpperCase(), margin + 4, y + 14, 14, true, detColor);
  if (payload.restrictions) txt('Restri\u00e7\u00f5es: ' + payload.restrictions.slice(0, 55), W / 2 + 2, y + 10, 7.5, false, '#92400e');
  if (payload.reviewDays)   txt(`Revis\u00e3o em ${payload.reviewDays} dias`, W / 2 + 2, y + 10, 8, true, '#9a3412');
  y += 24;

  // ── SECTION 5: Signature ─────────────────────────────────────────────────
  y += 4;
  if (y > 240) { doc.addPage(); y = 20; }
  fillRect(margin, y, colW, 30, '#f8fafc');
  doc.setDrawColor('#e2e8f0'); doc.rect(margin, y, colW, 30);
  txt('M\u00c9DICO RESPONS\u00c1VEL / ASSINATURA', margin + 4, y + 6, 7, true, '#64748b');
  txt(payload.physicianLicense || '\u2014', margin + 4, y + 13, 9, true, '#1e293b');
  txt('Assinatura e Carimbo:', margin + 4, y + 21, 7, false, '#94a3b8');
  drawLine(margin + 4, y + 28, margin + 80, y + 28, '#94a3b8');
  txt('DATA DE EMISS\u00c3O', W - margin - 50, y + 6, 7, true, '#64748b');
  txt(payload.examDate, W - margin - 50, y + 13, 9, true, '#1e293b');
  const nextYr = new Date(); nextYr.setFullYear(nextYr.getFullYear() + 1);
  txt('Pr\u00f3xima Revis\u00e3o:', W - margin - 50, y + 21, 7, false, '#94a3b8');
  txt(nextYr.toLocaleDateString('pt-MZ', { month: 'long', year: 'numeric' }), W - margin - 50, y + 27, 8, true, '#0f766e');
  y += 36;

  // ── FOOTER ────────────────────────────────────────────────────────────────
  fillRect(0, 277, W, 20, '#0f172a');
  txt('CHAEM \u2014 Sistema H365 | MISAU, Rep\u00fablica de Mo\u00e7ambique', W / 2, 285, 6.5, false, '#94a3b8', 'center');
  txt(`Doc. ${payload.examId} | ${payload.examDate} | V\u00e1lido apenas com assinatura e carimbo originais`, W / 2, 291, 6, false, '#475569', 'center');
  txt('Sigilo m\u00e9dico \u2014 Lei n.\u00ba 4/2007 de 7 de Fevereiro (Estatuto do SNS)', W / 2, 296, 5.5, false, '#334155', 'center');

  const safeName = payload.patientName.replace(/\s+/g, '_');
  const fileName = `Estado_Medico_${safeName}_${payload.examType}_${payload.examDate}.pdf`;
  try {
    // Use explicit anchor download to bypass service worker blob interception
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch {
    // Fallback to jsPDF native save
    doc.save(fileName);
  }
}



function ExamFormView({
  onSave, onCancel, physicianName, physicianCrm,
}: {
  onSave: (e: OccupationalExam) => void;
  onCancel: () => void;
  physicianName?: string;
  physicianCrm?: string;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState('');
  const [examStage, setExamStage] = useState<ExamStage>('Admissional');
  const [form, setForm] = useState<FormState>({
    ...defaultForm,
    physicianLicense: physicianName ? `${physicianName}${physicianCrm ? ` — Cédula ${physicianCrm}` : ''}` : '',
  });

  // ── Patient Search State ────────────────────────────────────────────────────
  const [patientQuery, setPatientQuery] = useState('');
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [isPatientSearching, setIsPatientSearching] = useState(false);
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  // Debounced live search against H365 main app
  useEffect(() => {
    if (patientQuery.length < 2) {
      setPatientResults([]);
      setPatientDropdownOpen(false);
      return;
    }
    setIsPatientSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${H365_BASE}/api/patients/search?q=${encodeURIComponent(patientQuery)}&limit=8`
        );
        if (res.ok) {
          const data = await res.json();
          setPatientResults(data.patients || []);
          setPatientDropdownOpen((data.patients || []).length > 0);
        }
      } catch {
        setPatientResults([]);
      } finally {
        setIsPatientSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [patientQuery]);

  const selectPatient = (p: any) => {
    setSelectedPatient(p);
    setForm(prev => ({ ...prev, patientId: p.nationalId, patientName: p.fullName }));
    setPatientQuery(p.fullName);
    setPatientDropdownOpen(false);
  };

  const getInitials = (name: string) =>
    name ? name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  // ── BMI / BP auto-computation ───────────────────────────────────────────────
  const weightVal = parseFloat(form.weight || '');
  const heightVal = parseFloat(form.height || '');
  const bmiCalc = (!isNaN(weightVal) && !isNaN(heightVal) && weightVal > 0 && heightVal > 0)
    ? weightVal / Math.pow(heightVal / 100, 2) : null;

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Abaixo do Peso', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (bmi < 25)   return { label: 'Normal',         color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (bmi < 30)   return { label: 'Excesso de Peso',color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    if (bmi < 35)   return { label: 'Obesidade Grau 1',color:'bg-orange-100 text-orange-700 border-orange-200' };
    return              { label: 'Obesidade Grau 2+', color: 'bg-rose-100 text-rose-700 border-rose-200' };
  };

  const getBPStatus = (bp: string) => {
    if (!bp || !bp.includes('/')) return null;
    const [sysStr, diaStr] = bp.split('/');
    const sys = parseInt(sysStr, 10), dia = parseInt(diaStr, 10);
    if (isNaN(sys) || isNaN(dia)) return null;
    if (sys < 90 || dia < 60)                                   return { label: 'Hipotensão',       color: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (sys < 120 && dia < 80)                                   return { label: 'Normal',            color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (sys >= 120 && sys <= 129 && dia < 80)                    return { label: 'Elevada',           color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { label: 'HTA Grau 1',       color: 'bg-orange-100 text-orange-700 border-orange-200' };
    if (sys > 180 || dia > 120)                                  return { label: 'Crise Hipert.',    color: 'bg-red-200 text-red-800 border-red-300' };
    return                                                         { label: 'HTA Grau 2',       color: 'bg-rose-100 text-rose-700 border-rose-200' };
  };

  const bmiStatus = bmiCalc !== null ? getBMIStatus(bmiCalc) : null;
  const bpStatus  = getBPStatus(form.bp);

  const sectorCfg = selectedSector ? SECTOR_CONFIG[selectedSector] : null;
  const stageCfg  = STAGE_CONFIG[examStage];

  const setField = (key: keyof FormState, val: string) => setForm(p => ({ ...p, [key]: val }));
  const setTestResult = (testId: string, field: 'status' | 'notes', val: string) =>
    setForm(p => ({ ...p, testResults: { ...p.testResults, [testId]: { ...p.testResults[testId], [field]: val } } }));
  const toggleSystem = (sys: string) =>
    setForm(p => ({ ...p, systems: { ...p.systems, [sys]: !p.systems[sys] } }));
  const toggleStageAction = (idx: number) =>
    setForm(p => ({ ...p, stageActions: { ...p.stageActions, [idx]: !p.stageActions[idx] } }));

  const canProceedStep1 = !!(form.patientId && form.patientName && form.companyName && selectedSector);
  const canSave = !!(form.patientId && form.patientName && form.companyName && selectedSector && form.determination);

  const STEP_LABELS = [
    { num: 1, label: 'Paciente & Vitais' },
    { num: 2, label: 'Painel Diagnóstico' },
    { num: 3, label: 'Acções do Exame' },
    { num: 4, label: 'Determinação Clínica' },
  ];

  const statusButtonColor = (opt: string, selected: boolean) => {
    if (!selected) return 'bg-white border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600';
    const lower = opt.toLowerCase();
    if (lower.includes('normal') || lower.includes('negat') || lower.includes('apt') || lower.includes('aprovad') || lower.includes('completo') || lower.includes('dentro') || lower.includes('todos neg'))
      return 'bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm';
    if (lower.includes('inapto') || lower.includes('crítico') || lower.includes('positivo') || lower.includes('afastar') || lower.includes('contra-ind') || lower.includes('urgente'))
      return 'bg-rose-100 border-rose-300 text-rose-800 shadow-sm';
    return 'bg-amber-100 border-amber-300 text-amber-800 shadow-sm';
  };

  // ── PDF Generation: Estado Médico / AMA ─────────────────────────────────────
  const generateEstadoMedico = () => {
    if (!form.patientName || !selectedSector || !form.determination) {
      alert('Preencha pelo menos: Nome do Paciente, Sector e Determinação Clínica antes de gerar o documento.');
      return false;
    }
    const examDate = new Date().toLocaleDateString('pt-MZ', { day:'2-digit', month:'long', year:'numeric' });
    const docId = `CHAEM-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    const hw = (form.weight && form.height)
      ? `${form.height}cm / ${form.weight}kg`
      : form.heightWeight;
    generateAMAPdf({
      patientId: form.patientId,
      patientName: form.patientName,
      companyName: form.companyName,
      sectorLabel: sectorCfg?.label || selectedSector,
      sector: selectedSector,
      examType: examStage,
      examDate,
      examId: docId,
      physicianLicense: form.physicianLicense,
      hazards: form.hazards,
      bp: form.bp, hr: form.hr, temp: form.temp,
      heightWeight: hw,
      systems: form.systems,
      vitalsNotes: form.vitalsNotes,
      testResults: form.testResults,
      determination: form.determination,
      restrictions: form.restrictions,
      reviewDays: form.reviewDays,
    });
    return true;
  };

  const handleSave = async () => {
    if (!form.patientId || !form.patientName || !form.companyName || !selectedSector || !form.determination) {
      alert('Preencha todos os campos obrigatórios: BI, Nome, Empresa, Sector e Determinação Clínica.');
      return;
    }
    const examId = `EXM-${Math.floor(Math.random() * 100000)}`;
    const examRecord = {
      id: examId,
      patientId: form.patientId, patientName: form.patientName,
      sector: selectedSector, sectorLabel: sectorCfg?.label || selectedSector,
      examType: examStage, date: new Date().toISOString().split('T')[0],
      companyName: form.companyName, doctorName: form.physicianLicense || 'Dr. Admin CHAEM',
      status: form.determination as OccupationalExam['status'],
      notes: form.hazards,
      formSnapshot: { ...form },
    };
    onSave(examRecord);
    try {
      await fetch(`${H365_BASE}/api/chaem/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examRecord),
      });
      console.log('[CHAEM L-LAN] Exam synced to H365 hub:', examId);
    } catch (e) {
      console.warn('[CHAEM L-LAN] Hub sync failed (offline?) — data saved locally only');
    }
  };

  return (
    <div className="space-y-5 pb-8">

      {/* ── STEPPER BAR ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((step, idx) => (
            <React.Fragment key={step.num}>
              <button
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-bold ${
                  currentStep === step.num
                    ? 'bg-teal-600 text-white shadow-md'
                    : currentStep > step.num
                    ? 'text-teal-600 bg-teal-50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-extrabold border-2 shrink-0 ${
                  currentStep === step.num
                    ? 'border-white/40 bg-white/20 text-white'
                    : currentStep > step.num
                    ? 'border-teal-400 bg-teal-100 text-teal-700'
                    : 'border-slate-300 text-slate-400'
                }`}>
                  {currentStep > step.num ? '✓' : step.num}
                </span>
                <span className="hidden md:inline">{step.label}</span>
              </button>
              {idx < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full ${
                  currentStep > step.num ? 'bg-teal-400' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          STEP 1 — PACIENTE & VITAIS
      ════════════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="space-y-4">

          {/* Patient Search Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-slate-800">Paciente & Identificação</h2>
                <p className="text-xs text-slate-400">Pesquise no sistema H365 ou introduza manualmente</p>
              </div>
            </div>

            {/* Live Search Input */}
            <div className="relative mb-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                Pesquisar Paciente (H365) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                {isPatientSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <input
                  id="patientSearchInput"
                  title="Pesquisar paciente"
                  placeholder="Nome, BI ou Distrito..."
                  value={patientQuery}
                  onChange={e => { setPatientQuery(e.target.value); if (!e.target.value) setSelectedPatient(null); }}
                  onFocus={() => patientResults.length > 0 && setPatientDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setPatientDropdownOpen(false), 200)}
                  className="w-full h-11 pl-9 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                />
              </div>

              {/* Dropdown Results */}
              {patientDropdownOpen && patientResults.length > 0 && (
                <div className="absolute z-30 top-full mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                  {patientResults.map(p => (
                    <button
                      key={p.nationalId}
                      type="button"
                      onMouseDown={() => selectPatient(p)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-extrabold shrink-0">
                        {getInitials(p.fullName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{p.fullName}</p>
                        <p className="text-xs text-slate-400 font-mono">
                          {p.nationalId} · {p.age}a · {p.gender === 'Male' ? 'M' : p.gender === 'Female' ? 'F' : 'O'} · {p.district}
                        </p>
                      </div>
                      {p.status && (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                          {p.status}
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium">{patientResults.length} resultado(s) da base H365</p>
                  </div>
                </div>
              )}
              {patientQuery.length >= 2 && !isPatientSearching && patientResults.length === 0 && (
                <div className="absolute z-30 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
                  <p className="text-xs text-slate-500 text-center">Nenhum paciente encontrado no H365. Continue abaixo para entrada manual.</p>
                </div>
              )}
            </div>

            {/* Selected Patient Banner */}
            {selectedPatient && (
              <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-xl mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-sm font-extrabold shrink-0">
                  {getInitials(selectedPatient.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-teal-800 text-sm">{selectedPatient.fullName}</p>
                  <p className="text-xs text-teal-600 font-mono">
                    {selectedPatient.nationalId} · {selectedPatient.age} anos · {selectedPatient.district}, {selectedPatient.province}
                  </p>
                </div>
                <button type="button"
                  onClick={() => { setSelectedPatient(null); setPatientQuery(''); setForm(p => ({ ...p, patientId: '', patientName: '' })); }}
                  className="text-teal-500 hover:text-rose-500 transition-colors text-xl font-bold shrink-0">×
                </button>
              </div>
            )}

            {/* Manual fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'patientId', key: 'patientId', label: 'BI / ID Paciente', placeholder: 'ex: 1234567890A', mono: true },
                { id: 'patientName', key: 'patientName', label: 'Nome Completo', placeholder: 'Nome completo do trabalhador', mono: false },
                { id: 'companyName', key: 'companyName', label: 'Empresa / Empregador', placeholder: 'Nome da empresa empregadora', mono: false },
              ].map(f => (
                <div key={f.id} className="space-y-1.5">
                  <label htmlFor={f.id} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {f.label} <span className="text-rose-500">*</span>
                  </label>
                  <input id={f.id} title={f.label} placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setField(f.key as keyof FormState, e.target.value)}
                    className={`w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${f.mono ? 'font-mono' : ''}`}
                  />
                </div>
              ))}
            </div>

            {/* Sector + Exam Stage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Sector / Indústria <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="sector" title="Sector de actividade"
                    value={selectedSector}
                    onChange={e => { setSelectedSector(e.target.value); setForm(p => ({ ...p, testResults: {}, stageActions: {} })); }}
                    className="w-full h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
                  >
                    <option value="">— Sector —</option>
                    {Object.entries(SECTOR_CONFIG).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Tipo de Exame <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  {(['Admissional', 'Periódico', 'Demissional'] as ExamStage[]).map(stage => (
                    <button key={stage} type="button" onClick={() => setExamStage(stage)}
                      className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all border-2 ${
                        examStage === stage
                          ? stage === 'Admissional' ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : stage === 'Periódico' ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                            : 'bg-violet-600 text-white border-violet-600 shadow-md'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}>{stage}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hazards */}
            <div className="mt-4 space-y-1.5">
              <label htmlFor="hazards" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Hazards Específicos do Posto (Opcional)
              </label>
              <input id="hazards" title="Hazards do posto"
                placeholder="ex: Poeira de sílica, ruído >90dB, trabalho em altura >5m..."
                value={form.hazards} onChange={e => setField('hazards', e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Vitals Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-800 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-slate-300" />
              <h3 className="font-bold text-white text-sm">SECÇÃO 1 — Sinais Vitais & Exame Físico Baseline</h3>
            </div>
            <div className="p-5 space-y-4">
              {/* 5-column vitals grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { id: 'bp',     key: 'bp',     label: 'Tensão Arterial', placeholder: '120/80 mmHg' },
                  { id: 'hr',     key: 'hr',     label: 'FC (bpm)',        placeholder: '72 bpm' },
                  { id: 'temp',   key: 'temp',   label: 'Temperatura °C',  placeholder: '36.5' },
                  { id: 'weight', key: 'weight', label: 'Peso (kg)',        placeholder: '70' },
                  { id: 'height', key: 'height', label: 'Altura (cm)',      placeholder: '175' },
                ].map(f => (
                  <div key={f.id} className="space-y-1.5">
                    <label htmlFor={f.id} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{f.label}</label>
                    <input id={f.id} title={f.label} placeholder={f.placeholder}
                      value={(form as any)[f.key]}
                      onChange={e => setField(f.key as keyof FormState, e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                ))}
              </div>

              {/* Auto-computed status badges */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">IMC</span>
                  <span className="text-sm font-extrabold text-slate-800">
                    {bmiCalc !== null ? bmiCalc.toFixed(1) : '—'}
                  </span>
                  {bmiStatus && bmiCalc !== null && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bmiStatus.color}`}>
                      {bmiStatus.label}
                    </span>
                  )}
                </div>
                {bpStatus && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TA</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bpStatus.color}`}>
                      {bpStatus.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Systems */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Sistemas Gerais Avaliados</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(form.systems).map(sys => (
                    <button key={sys} type="button" onClick={() => toggleSystem(sys)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                        form.systems[sys] ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}>
                      {form.systems[sys] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      {{ cardiovascular: 'Cardiovascular', respiratory: 'Respiratório', musculoskeletal: 'Musculoesquelético', dermatological: 'Dermatológico' }[sys]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical notes */}
              <div className="space-y-1.5">
                <label htmlFor="vitalsNotes" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Notas Clínicas — Sinais Vitais</label>
                <textarea id="vitalsNotes" title="Notas clínicas"
                  placeholder="Observações relevantes do exame físico geral..."
                  value={form.vitalsNotes} onChange={e => setField('vitalsNotes', e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 h-20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Step 1 Nav */}
          <div className="flex justify-end">
            <button type="button" onClick={() => setCurrentStep(2)}
              disabled={!canProceedStep1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                canProceedStep1
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}>
              Próximo: Painel Diagnóstico <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STEP 2 — PAINEL DIAGNÓSTICO
      ════════════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {selectedSector && (
            <div className="flex items-center gap-2 px-4 py-3 bg-teal-600/10 border border-teal-200 rounded-xl">
              <span className="text-xl">{sectorCfg?.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-teal-700">
                  Painel activado: <span className="font-extrabold">{sectorCfg?.label}</span> — {examStage}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-teal-600 font-bold">
                <Activity className="w-3 h-3" />
                {sectorCfg?.tests.length} testes
              </div>
            </div>
          )}

          {sectorCfg ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-teal-600 to-teal-700 flex items-center gap-3">
                <span className="text-2xl">{sectorCfg.emoji}</span>
                <div>
                  <h3 className="font-bold text-white">SECÇÃO 2 — Painel Diagnóstico: {sectorCfg.label}</h3>
                  <p className="text-xs text-teal-200">{sectorCfg.tests.length} testes · OSHA / NIOSH / MISAU · {examStage}</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {sectorCfg.tests.map((test, idx) => (
                  <div key={test.id} className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-xs font-extrabold text-teal-700 shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-800">{test.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 italic">{test.purpose}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Parâmetros a Medir / Registar</p>
                          <p className="text-xs text-slate-600">{test.parameters}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Estado / Resultado do Teste</p>
                          <div className="flex flex-wrap gap-2">
                            {test.statusOptions.map(opt => {
                              const sel = form.testResults[test.id]?.status === opt;
                              return (
                                <button key={opt} type="button" onClick={() => setTestResult(test.id, 'status', opt)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${statusButtonColor(opt, sel)}`}>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <input
                          title={`Notas — ${test.name}`}
                          placeholder={`Notas / valores numéricos: ${test.name.split('(')[0].trim()}...`}
                          value={form.testResults[test.id]?.notes || ''}
                          onChange={e => setTestResult(test.id, 'notes', e.target.value)}
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
              <Microscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-bold text-lg">Seleccione um Sector no Passo 1</p>
              <p className="text-slate-400 text-sm mt-1">Volte ao Passo 1 para seleccionar o sector</p>
            </div>
          )}

          <div className="flex justify-between">
            <button type="button" onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button type="button" onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100 transition-all">
              Próximo: Acções <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STEP 3 — ACÇÕES DO EXAME
      ════════════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${stageCfg.bgClass} ${stageCfg.borderClass}`}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className={`w-5 h-5 ${stageCfg.colorClass}`} />
              <h3 className={`font-bold ${stageCfg.colorClass}`}>SECÇÃO 3 — Acções Específicas: Exame {examStage}</h3>
            </div>
            <p className={`text-sm italic mb-4 ${stageCfg.colorClass} opacity-70`}>{stageCfg.focus}</p>
            <div className="space-y-2">
              {stageCfg.actions.map((action, idx) => (
                <button key={idx} type="button" onClick={() => toggleStageAction(idx)}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-sm transition-all text-left ${
                    form.stageActions[idx] ? 'bg-white/90 border-current shadow-sm' : 'bg-white/50 border-white/50'
                  }`}>
                  {form.stageActions[idx]
                    ? <CheckSquare className={`w-4 h-4 shrink-0 mt-0.5 ${stageCfg.colorClass}`} />
                    : <Square className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />}
                  <span className={form.stageActions[idx] ? `font-bold ${stageCfg.colorClass}` : 'text-slate-600'}>
                    {action}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button type="button" onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-100 transition-all">
              Próximo: Determinação <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          STEP 4 — DETERMINAÇÃO CLÍNICA
      ════════════════════════════════════════════════════ */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-300" />
              <h3 className="font-bold text-white text-sm">SECÇÃO 4 — Determinação Clínica & Assinatura Médica</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { value: 'Apto', label: '✅ Apto para o Posto', sub: 'Sem restrições — Aptidão plena', color: 'emerald' },
                  { value: 'Apto com Restrições', label: '⚠️ Apto com Restrições', sub: 'Especificar restrições abaixo', color: 'amber' },
                  { value: 'Inapto Temporário', label: '🔄 Inapto Temporário', sub: 'Requer revisão médica em X dias', color: 'orange' },
                  { value: 'Inapto', label: '🚫 Inapto para o Posto', sub: 'Contra-indicação médica definitiva', color: 'rose' },
                ] as const).map(opt => {
                  const isSelected = form.determination === opt.value;
                  return (
                    <button key={opt.value} type="button" onClick={() => setField('determination', opt.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? opt.color === 'emerald' ? 'border-emerald-400 bg-emerald-50'
                          : opt.color === 'amber' ? 'border-amber-400 bg-amber-50'
                          : opt.color === 'orange' ? 'border-orange-400 bg-orange-50'
                          : 'border-rose-400 bg-rose-50'
                          : 'border-slate-100 bg-white hover:border-slate-300'
                      }`}>
                      <div className={`font-bold text-sm ${
                        isSelected
                          ? opt.color === 'emerald' ? 'text-emerald-800'
                          : opt.color === 'amber' ? 'text-amber-800'
                          : opt.color === 'orange' ? 'text-orange-800'
                          : 'text-rose-800'
                          : 'text-slate-700'
                      }`}>{opt.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{opt.sub}</div>
                    </button>
                  );
                })}
              </div>

              {form.determination === 'Apto com Restrições' && (
                <div className="space-y-1.5">
                  <label htmlFor="restrictions" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Restrições Específicas</label>
                  <input id="restrictions" title="Restrições" value={form.restrictions} onChange={e => setField('restrictions', e.target.value)}
                    placeholder="ex: Sem levantamento >15kg; sem trabalho em altura; uso obrigatório de protectores auditivos..."
                    className="w-full h-10 px-3 rounded-xl border border-amber-200 bg-amber-50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              )}
              {form.determination === 'Inapto Temporário' && (
                <div className="space-y-1.5">
                  <label htmlFor="reviewDays" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Revisão Médica em (dias)</label>
                  <input id="reviewDays" title="Revisão em dias" value={form.reviewDays} onChange={e => setField('reviewDays', e.target.value)}
                    placeholder="ex: 30"
                    className="w-full h-10 px-3 rounded-xl border border-orange-200 bg-orange-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="physicianLicense" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Médico Responsável / N.º Cédula CRM <span className="text-rose-500">*</span>
                </label>
                <input id="physicianLicense" title="Médico e Cédula" value={form.physicianLicense} onChange={e => setField('physicianLicense', e.target.value)}
                  placeholder="Dr./Dra. Nome Completo — Cédula N.º XXXX/CRM-MZ"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button type="button" onClick={() => setCurrentStep(3)}
                className="flex items-center gap-2 px-4 py-3 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button type="button" onClick={onCancel}
                className="px-4 py-3 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={handleSave}
                disabled={!canSave}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  canSave
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-200'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}>
                <Save className="w-4 h-4" />
                Guardar & Emitir AMA (L-LAN)
              </button>
            </div>
            <button type="button" onClick={() => generateEstadoMedico()}
              className="w-full h-11 border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
              <FileText className="w-4 h-4" />
              Descarregar Estado Médico (PDF)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAM DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ExamDetailModal({ exam, onClose }: { exam: OccupationalExam; onClose: () => void }) {
  const snap = exam.formSnapshot;
  const sectorCfg = exam.sector ? SECTOR_CONFIG[exam.sector] : null;

  const generatePdf = () => {
    const snap = exam.formSnapshot;
    const examDate = new Date(exam.date).toLocaleDateString('pt-MZ', { day:'2-digit', month:'long', year:'numeric' });
    generateAMAPdf({
      patientId: exam.patientId,
      patientName: exam.patientName,
      companyName: exam.companyName,
      sectorLabel: exam.sectorLabel,
      sector: exam.sector,
      examType: exam.examType,
      examDate,
      examId: exam.id,
      physicianLicense: snap?.physicianLicense || exam.doctorName || '',
      hazards: snap?.hazards,
      bp: snap?.bp, hr: snap?.hr, temp: snap?.temp,
      heightWeight: (snap?.height && snap?.weight)
        ? `${snap.height}cm / ${snap.weight}kg`
        : snap?.heightWeight,
      systems: snap?.systems,
      vitalsNotes: snap?.vitalsNotes,
      testResults: snap?.testResults,
      determination: snap?.determination || exam.status,
      restrictions: snap?.restrictions,
      reviewDays: snap?.reviewDays,
    });
  };

  const statusColors: Record<string, string> = {
    'Apto': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Apto com Restr\u00ed\u00e7\u00f5es': 'bg-amber-100 text-amber-800 border-amber-300',
    'Inapto Tempor\u00e1rio': 'bg-orange-100 text-orange-800 border-orange-300',
    'Inapto': 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-teal-700 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-extrabold text-lg">{exam.patientName}</h2>
            <p className="text-teal-200 text-xs font-mono mt-0.5">{exam.id} &bull; {exam.date} &bull; {exam.examType}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg font-bold">&times;</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Status badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-3 py-1.5 rounded-full text-sm font-extrabold border ${statusColors[exam.status] || 'bg-slate-100 text-slate-700'}`}>{exam.status}</span>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full">{SECTOR_CONFIG[exam.sector]?.emoji} {exam.sectorLabel}</span>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full">{exam.companyName}</span>
          </div>

          {/* Patient Info */}
          <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm border border-slate-100">
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BI / NUIT</p><p className="font-bold text-slate-800 mt-0.5">{exam.patientId || '\u2014'}</p></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">M\u00e9dico Respons\u00e1vel</p><p className="font-bold text-slate-800 mt-0.5">{snap?.physicianLicense || exam.doctorName || '\u2014'}</p></div>
            {snap?.bp && <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tens\u00e3o Arterial</p><p className="font-bold text-slate-800 mt-0.5">{snap.bp}</p></div>}
            {snap?.hr && <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Freq. Card\u00edaca</p><p className="font-bold text-slate-800 mt-0.5">{snap.hr} bpm</p></div>}
            {snap?.temp && <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temperatura</p><p className="font-bold text-slate-800 mt-0.5">{snap.temp} \u00b0C</p></div>}
{(() => {
              const hw = (snap?.height && snap?.weight)
                ? `${snap.height}cm / ${snap.weight}kg`
                : snap?.heightWeight;
              const bmi = (snap?.height && snap?.weight)
                ? (parseFloat(snap.weight) / Math.pow(parseFloat(snap.height) / 100, 2)).toFixed(1)
                : null;
              return hw ? (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Altura / Peso / IMC</p>
                  <p className="font-bold text-slate-800 mt-0.5">{hw}{bmi ? ` · IMC ${bmi}` : ''}</p>
                </div>
              ) : null;
            })()}
          </div>

          {/* Diagnostic Tests */}
          {snap && sectorCfg && Object.keys(snap.testResults).length > 0 && (
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Painel Diagn\u00f3stico</h3>
              <div className="space-y-2">
                {sectorCfg.tests.map(test => {
                  const r = snap.testResults[test.id];
                  if (!r?.status && !r?.notes) return null;
                  const isOk = (r?.status || '').toLowerCase().match(/normal|apt|negat|dentro|aprovad/);
                  const isWarn = (r?.status || '').toLowerCase().match(/aten|limiar|suspeito/);
                  return (
                    <div key={test.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${isOk ? 'bg-emerald-400' : isWarn ? 'bg-amber-400' : 'bg-rose-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700">{test.name}</p>
                        {r?.status && <p className={`text-xs mt-0.5 font-bold ${isOk ? 'text-emerald-600' : isWarn ? 'text-amber-600' : 'text-rose-600'}`}>{r.status}</p>}
                        {r?.notes && <p className="text-xs text-slate-500 mt-0.5 italic">{r.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Restrictions / Review */}
          {(snap?.restrictions || snap?.reviewDays) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              {snap.restrictions && <p className="text-sm font-bold text-amber-800">Restri\u00e7\u00f5es: <span className="font-normal">{snap.restrictions}</span></p>}
              {snap.reviewDays && <p className="text-sm font-bold text-orange-800 mt-1">Revis\u00e3o m\u00e9dica em: <span className="font-normal">{snap.reviewDays} dias</span></p>}
            </div>
          )}

          {/* Clinical notes */}
          {snap?.vitalsNotes && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Observa\u00e7\u00f5es Cl\u00ednicas</p>
              <p className="text-sm text-slate-700">{snap.vitalsNotes}</p>
            </div>
          )}

          {!snap && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Nota:</strong> Este exame foi registado sem snapshot completo. Os dados cl\u00ednicos detalhados n\u00e3o est\u00e3o dispon\u00edveis. O PDF ser\u00e1 gerado com os dados dispon\u00edveis no registo.
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50">
          <button onClick={onClose} className="flex-1 h-10 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
            Fechar
          </button>
          <button onClick={generatePdf}
            className="flex-[2] h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-100">
            <FileText className="w-4 h-4" />
            Descarregar Estado M\u00e9dico (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAM HISTORY VIEW
// ─────────────────────────────────────────────────────────────────────────────

function ExamHistoryView({ exams, onNewExam }: { exams: OccupationalExam[]; onNewExam?: () => void }) {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedExam, setSelectedExam] = useState<OccupationalExam | null>(null);
  const filtered = exams.filter(e => {
    const matchText = [e.patientName, e.patientId, e.companyName, e.sectorLabel].some(v => v?.toLowerCase().includes(search.toLowerCase()));
    const matchSector = !sectorFilter || e.sector === sectorFilter;
    const matchStatus = !statusFilter || e.status === statusFilter;
    const matchType   = !typeFilter   || e.examType === typeFilter;
    return matchText && matchSector && matchStatus && matchType;
  });
  return (
    <div className="space-y-4">
      {/* Search + filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input title="Pesquisar" placeholder="Pesquisar por BI, Nome, Empresa..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        {/* Sector filter */}
        <div className="relative">
          <select title="Filtrar por sector" value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}
            className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer">
            <option value="">Todos os Sectores</option>
            {Object.entries(SECTOR_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {/* Exam type filter */}
        <div className="relative">
          <select title="Filtrar por tipo" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer">
            <option value="">Todos os Tipos</option>
            <option value="Admissional">Admissional</option>
            <option value="Periódico">Periódico</option>
            <option value="Demissional">Demissional</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {/* Status filter */}
        <div className="relative">
          <select title="Filtrar por aptidão" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer">
            <option value="">Toda a Aptidão</option>
            <option value="Apto">✅ Apto</option>
            <option value="Apto com Restrições">⚠️ Apto c/ Restrições</option>
            <option value="Inapto Temporário">🔄 Inapto Temporário</option>
            <option value="Inapto">🚫 Inapto</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {/* Clear filters */}
        {(sectorFilter || statusFilter || typeFilter || search) && (
          <button onClick={() => { setSectorFilter(''); setStatusFilter(''); setTypeFilter(''); setSearch(''); }}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">
            Limpar ✕
          </button>
        )}
        {onNewExam && (
          <button onClick={onNewExam}
            className="h-10 px-4 bg-teal-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm ml-auto">
            <PlusCircle className="w-4 h-4" />Novo Exame
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Paciente / BI</th>
                <th className="px-5 py-3">Sector</th>
                <th className="px-5 py-3">Empresa</th>
                <th className="px-5 py-3">Tipo</th>
                <th className="px-5 py-3">Aptidão</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Stethoscope className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold">Nenhum exame encontrado</p>
                    <p className="text-slate-300 text-xs mt-1">Registe o primeiro exame para sincronizar na L-LAN</p>
                  </td>
                </tr>
              ) : filtered.map(exam => (
                <tr key={exam.id} onClick={() => setSelectedExam(exam)} className="hover:bg-teal-50 transition-colors cursor-pointer group">
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap text-xs font-mono">{exam.date}</td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-800">{exam.patientName}</div>
                    <div className="text-xs text-slate-400 font-mono">{exam.patientId}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{SECTOR_CONFIG[exam.sector]?.emoji || '🏥'}</span>
                      <span className="text-xs text-slate-600 hidden lg:block">{exam.sectorLabel}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 text-sm">{exam.companyName}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      exam.examType === 'Admissional' ? 'bg-blue-50 text-blue-700' :
                      exam.examType === 'Periódico' ? 'bg-teal-50 text-teal-700' : 'bg-violet-50 text-violet-700'
                    }`}>{exam.examType}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      exam.status === 'Apto' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      exam.status === 'Inapto' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      exam.status === 'Inapto Temporário' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>{exam.status}</span>
                  </td>
                  <td className="px-3 py-4"><span className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-500 text-xs font-bold flex items-center gap-1"><FileText className="w-3.5 h-3.5" />AMA</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">{filtered.length} exame{filtered.length !== 1 ? 's' : ''} {search ? 'encontrado' : 'total'}{filtered.length !== 1 ? 's' : ''}</span>
          <span className="text-xs font-bold text-teal-600">L-LAN Sincronizado</span>
        </div>
      </div>
      {selectedExam && <ExamDetailModal exam={selectedExam} onClose={() => setSelectedExam(null)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCESS DENIED VIEW
// ─────────────────────────────────────────────────────────────────────────────

function AccessDenied({ requiredRole }: { requiredRole: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-rose-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">Acesso Restrito</h3>
      <p className="text-slate-400 text-sm max-w-xs">
        Esta área requer permissões de <strong>{requiredRole}</strong>.
        Contacte o administrador do sistema para solicitar acesso.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE SWITCHER (dev/demo — mirrors H365 app-shell.tsx pattern)
// ─────────────────────────────────────────────────────────────────────────────

function RoleSwitcher() {
  const { user, setUser, roleMeta } = useChaemUser();
  const [open, setOpen] = useState(false);

  const roles = Object.keys(CHAEM_MOCK_USERS) as ChaemRole[];

  return (
    <div className="relative">
      <button
        id="role-switcher-btn"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
          roleMeta.badgeClass
        }`}
      >
        <span className="hidden sm:block max-w-[120px] truncate">{roleMeta.labelPt}</span>
        <ChevronRight className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trocar Perfil (Demo)</p>
              <p className="text-xs text-slate-500 mt-0.5">Simula diferentes papéis RBAC</p>
            </div>
            <div className="py-1">
              {roles.map(role => {
                const meta = ROLE_META[role];
                const mockUser = CHAEM_MOCK_USERS[role];
                const isActive = user.role === role;
                return (
                  <button
                    key={role}
                    onClick={() => { setUser(mockUser); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      isActive ? 'bg-teal-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold ${meta.bgColor} ${meta.color}`}>
                      {mockUser.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-700 truncate">{mockUser.name}</span>
                        {isActive && <div className="w-1.5 h-1.5 bg-teal-500 rounded-full shrink-0" />}
                      </div>
                      <span className={`text-[10px] font-bold ${meta.color}`}>{meta.labelPt}</span>
                      {mockUser.jurisdiction.facility && (
                        <p className="text-[10px] text-slate-400 truncate">{mockUser.jurisdiction.facility}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CHAEM APP (RBAC-aware)
// ─────────────────────────────────────────────────────────────────────────────

function ChaemApp() {
  const { currentLocale, toggleLocale } = useLocale();
  const { user, roleMeta, can } = useChaemUser();

  // Default view depends on role capabilities
  const defaultView: AppView = can('viewDashboard') ? 'dashboard' : 'exams';
  const [view, setView] = useState<AppView>(defaultView);

  // Dashboard level locked to the role's max permitted level
  const defaultLevel = (roleMeta.dashLevels[roleMeta.dashLevels.length - 1] ?? 'facility') as DashLevel;
  const [dashLevel, setDashLevel] = useState<DashLevel>(defaultLevel);

  const [exams, setExams] = useState<OccupationalExam[]>([]);

  // Reset view + dashboard level whenever role changes
  React.useEffect(() => {
    const nextView: AppView = can('viewDashboard') ? 'dashboard' : 'exams';
    setView(nextView);
    const nextLevel = (roleMeta.dashLevels[roleMeta.dashLevels.length - 1] ?? 'facility') as DashLevel;
    setDashLevel(nextLevel);
  }, [user.role]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem('h365_occupational_exams');
      if (stored) setExams(JSON.parse(stored));
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const saveExam = (exam: OccupationalExam) => {
    const updated = [exam, ...exams];
    setExams(updated);
    localStorage.setItem('h365_occupational_exams', JSON.stringify(updated));
    setView('exams');
    alert(`✅ Exame registado e sincronizado na L-LAN!\n\n👤 Paciente: ${exam.patientName}\n🏭 Sector: ${exam.sectorLabel}\n📋 Tipo: ${exam.examType}\n🩺 AMA: ${exam.status}`);
  };

  // Permitted dashboard levels for this role — restrict the level tabs shown
  const handleSetDashLevel = (level: DashLevel) => {
    if (roleMeta.dashLevels.includes(level)) setDashLevel(level);
  };

  // Build role-aware nav
  type NavItem = { key: AppView; label: string; Icon: React.ElementType; show: boolean };
  const NAV_ALL: NavItem[] = [
    { key: 'dashboard', label: 'Painel KPI', Icon: BarChart2, show: can('viewDashboard') },
    { key: 'exams', label: 'Registos', Icon: ClipboardList, show: true },
    { key: 'new-exam', label: 'Novo Exame', Icon: PlusCircle, show: can('registerExams') },
  ];
  const NAV = NAV_ALL.filter(n => n.show);

  // Jurisdiction subtitle for facility-scoped roles
  const scopeLabel = user.jurisdiction.facility
    ? user.jurisdiction.facility
    : user.jurisdiction.district
    ? `Distrito: ${user.jurisdiction.district}`
    : user.jurisdiction.province
    ? `Província: ${user.jurisdiction.province}`
    : 'Âmbito Nacional';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight text-slate-800 tracking-tight">CHAEM</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                Saúde Ocupacional & Higiene • MISAU
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {NAV.map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setView(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  view === key ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Role Switcher (dev/demo) */}
            <RoleSwitcher />

            <button onClick={toggleLocale}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              {currentLocale === 'en' ? 'EN' : 'PT'}
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs ${
                roleMeta.bgColor
              } ${roleMeta.color}`}>
                {user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-700 leading-tight">{user.name}</p>
                <p className={`text-[10px] font-bold ${roleMeta.color}`}>{roleMeta.labelPt}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Jurisdiction banner for scoped roles */}
      {user.role !== 'NATIONAL_ADMIN' && (
        <div className="bg-slate-800 text-white">
          <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center gap-2">
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleMeta.badgeClass}`}>
              {roleMeta.labelPt}
            </div>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">{scopeLabel}</span>
            {user.crmNumber && (
              <><ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-400 font-mono">{user.crmNumber}</span></>
            )}
          </div>
        </div>
      )}

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {view === 'new-exam' && (
              <button onClick={() => setView('exams')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors mb-1">
                <ArrowLeft className="w-4 h-4" />Voltar para Registos
              </button>
            )}
            <h2 className="text-xl font-bold text-slate-800">
              {view === 'dashboard' ? 'Painel de Indicadores (KPI)' :
               view === 'exams' ? 'Histórico de Exames L-LAN' : 'Novo Exame Ocupacional'}
            </h2>
            <p className="text-sm text-slate-400">
              {view === 'dashboard'
                ? `Métricas ${user.role === 'NATIONAL_ADMIN' ? 'nacionais' : `— ${scopeLabel}`}`
                : view === 'exams'
                ? `${exams.length} exame${exams.length !== 1 ? 's' : ''} ${can('viewAllExams') ? 'na base de dados' : 'registados por si'}`
                : 'Formulário dinâmico gerado por sector e tipo de exame'}
            </p>
          </div>
          {/* Only show Novo Exame button if role permits exam registration */}
          {view !== 'new-exam' && can('registerExams') && (
            <button onClick={() => setView('new-exam')}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-100 transition-all">
              <PlusCircle className="w-4 h-4" />Novo Exame
            </button>
          )}
        </div>

        {/* RBAC-gated views */}
        {view === 'dashboard' && (
          can('viewDashboard')
            ? <DashboardView
                level={dashLevel}
                setLevel={handleSetDashLevel}
                allowedLevels={roleMeta.dashLevels}
                exams={exams}
                onNewExam={can('registerExams') ? () => setView('new-exam') : undefined}
              />
            : <AccessDenied requiredRole="Administrador (MISAU)" />
        )}
        {view === 'exams' && (
          <ExamHistoryView
            exams={can('viewAllExams') ? exams : exams.filter(e => e.doctorName === user.name)}
            onNewExam={can('registerExams') ? () => setView('new-exam') : undefined}
          />
        )}
        {view === 'new-exam' && (
          can('registerExams')
            ? <ExamFormView onSave={saveExam} onCancel={() => setView('exams')} physicianName={user.name} physicianCrm={user.crmNumber} />
            : <AccessDenied requiredRole="Médico ou Enfermeiro de Saúde Ocupacional" />
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex md:hidden z-20">
        {NAV.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setView(key)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold transition-colors ${
              view === key ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
            }`}>
            <Icon className="w-5 h-5" />{label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <LocaleProvider>
      <ChaemUserProvider>
        <ChaemApp />
      </ChaemUserProvider>
    </LocaleProvider>
  );
}

export default App;
