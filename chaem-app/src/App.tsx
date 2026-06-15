import React, { useState, useEffect } from 'react';
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
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
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
              const val = parseFloat(String(kpi.value).replace(/[^0-9.]/g, '')) || 0;
              const maxVal = 100;
              const pct = Math.min((val / maxVal) * 100, 100);
              const cc = CC[kpi.color] ?? CC.teal;
              const barColors: Record<string, string> = {
                teal: 'bg-teal-400', blue: 'bg-blue-400', amber: 'bg-amber-400',
                rose: 'bg-rose-400', violet: 'bg-violet-400', indigo: 'bg-indigo-400',
                orange: 'bg-orange-400', emerald: 'bg-emerald-400',
              };
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-36 shrink-0 truncate">{kpi.label}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColors[kpi.color] || 'bg-teal-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={`text-xs font-bold ${cc.text} shrink-0`}>{kpi.value}{kpi.unit}</span>
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
  systems: Record<string, boolean>;
  vitalsNotes: string;
  testResults: Record<string, { status: string; notes: string }>;
  stageActions: Record<number, boolean>;
  determination: string; restrictions: string; reviewDays: string; physicianLicense: string;
}

const defaultForm: FormState = {
  patientId: '', patientName: '', companyName: '', hazards: '',
  bp: '', hr: '', temp: '', heightWeight: '',
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
  const [selectedSector, setSelectedSector] = useState('');
  const [examStage, setExamStage] = useState<ExamStage>('Admissional');
  const [form, setForm] = useState<FormState>({
    ...defaultForm,
    physicianLicense: physicianName ? `${physicianName}${physicianCrm ? ` — Cédula ${physicianCrm}` : ''}` : '',
  });

  const sectorCfg = selectedSector ? SECTOR_CONFIG[selectedSector] : null;
  const stageCfg = STAGE_CONFIG[examStage];

  const setField = (key: keyof FormState, val: string) => setForm(p => ({ ...p, [key]: val }));
  const setTestResult = (testId: string, field: 'status' | 'notes', val: string) =>
    setForm(p => ({ ...p, testResults: { ...p.testResults, [testId]: { ...p.testResults[testId], [field]: val } } }));
  const toggleSystem = (sys: string) =>
    setForm(p => ({ ...p, systems: { ...p.systems, [sys]: !p.systems[sys] } }));
  const toggleStageAction = (idx: number) =>
    setForm(p => ({ ...p, stageActions: { ...p.stageActions, [idx]: !p.stageActions[idx] } }));

  // ── PDF Generation: Estado Médico / AMA ───────────────────────────────────────
  // ── PDF Generation: Estado Médico / AMA (delegates to shared generateAMAPdf)
  const generateEstadoMedico = () => {
    if (!form.patientName || !selectedSector || !form.determination) {
      alert('Preencha pelo menos: Nome do Paciente, Sector e Determinação Clínica antes de gerar o documento.');
      return false;
    }
    const examDate = new Date().toLocaleDateString('pt-MZ', { day:'2-digit', month:'long', year:'numeric' });
    const docId = `CHAEM-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
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
      bp: form.bp, hr: form.hr, temp: form.temp, heightWeight: form.heightWeight,
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
      alert('Preencha todos os campos: BI, Nome, Empresa, Sector e Determinacao Clinica.');
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
    // Save locally (L-LAN localStorage)
    onSave(examRecord);
    // Sync to shared H365 hub (cross-origin bridge at port 3000)
    try {
      await fetch('http://localhost:3000/api/chaem/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examRecord),
      });
      console.log('[CHAEM L-LAN] Exam synced to H365 hub:', examId);
    } catch (e) {
      console.warn('[CHAEM L-LAN] Hub sync failed (offline?) — data saved locally only');
    }
  };

  const statusButtonColor = (opt: string, selected: boolean) => {
    if (!selected) return 'bg-white border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600';
    const lower = opt.toLowerCase();
    if (lower.includes('normal') || lower.includes('negat') || lower.includes('apt') || lower.includes('aprovad') || lower.includes('completo') || lower.includes('dentro') || lower.includes('todos neg'))
      return 'bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm';
    if (lower.includes('inapto') || lower.includes('crítico') || lower.includes('positivo') || lower.includes('afastar') || lower.includes('contra-ind') || lower.includes('urgente'))
      return 'bg-rose-100 border-rose-300 text-rose-800 shadow-sm';
    return 'bg-amber-100 border-amber-300 text-amber-800 shadow-sm';
  };

  return (
    <div className="space-y-5 pb-8">

      {/* ── HEADER: Sector + Stage + Patient ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-800">Formulário de Exame Ocupacional CHAEM</h2>
            <p className="text-xs text-slate-400">Sistema H365 • MISAU • {new Date().toLocaleDateString('pt-MZ')}</p>
          </div>
        </div>

        {/* Sector + Stage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Sector / Indústria <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="sector" title="Sector de actividade"
                value={selectedSector}
                onChange={e => { setSelectedSector(e.target.value); setForm(p => ({ ...p, testResults: {}, stageActions: {} })); }}
                className="w-full h-11 pl-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer"
              >
                <option value="">— Seleccionar Sector —</option>
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
                  className={`flex-1 h-11 rounded-xl text-sm font-bold transition-all border-2 ${
                    examStage === stage
                      ? stage === 'Admissional' ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : stage === 'Periódico' ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                        : 'bg-violet-600 text-white border-violet-600 shadow-md'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >{stage}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Patient Info */}
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
                value={(form as any)[f.key]} onChange={e => setField(f.key as keyof FormState, e.target.value)}
                className={`w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${f.mono ? 'font-mono' : ''}`}
              />
            </div>
          ))}
        </div>

        {/* Hazards */}
        <div className="mt-4 space-y-1.5">
          <label htmlFor="hazards" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Hazards Específicos do Posto (Opcional)
          </label>
          <input id="hazards" title="Hazards do posto" placeholder="ex: Poeira de sílica, ruído >90dB, trabalho em altura >5m, solventes, calor excessivo..."
            value={form.hazards} onChange={e => setField('hazards', e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Active panel indicator */}
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
            {sectorCfg?.tests.length} testes carregados
          </div>
        </div>
      )}

      {/* ── SECTION 1: Vitals ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-800 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-slate-300" />
          <h3 className="font-bold text-white text-sm">SECÇÃO 1 — Exame Físico Sistémico (Sinais Vitais & Baseline)</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'bp', key: 'bp', label: 'Pressão Arterial', placeholder: '120/80 mmHg' },
              { id: 'hr', key: 'hr', label: 'FC (bpm)', placeholder: '72 bpm' },
              { id: 'temp', key: 'temp', label: 'Temperatura (°C)', placeholder: '36.5 °C' },
              { id: 'heightWeight', key: 'heightWeight', label: 'Altura / Peso', placeholder: '175cm / 70kg' },
            ].map(f => (
              <div key={f.id} className="space-y-1.5">
                <label htmlFor={f.id} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{f.label}</label>
                <input id={f.id} title={f.label} placeholder={f.placeholder}
                  value={(form as any)[f.key]} onChange={e => setField(f.key as keyof FormState, e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>
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

      {/* ── SECTION 2: Sector-Specific Panel ── */}
      {sectorCfg ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-teal-600 to-teal-700 flex items-center gap-3">
            <span className="text-2xl">{sectorCfg.emoji}</span>
            <div>
              <h3 className="font-bold text-white">SECÇÃO 2 — Painel Diagnóstico Específico: {sectorCfg.label}</h3>
              <p className="text-xs text-teal-200">{sectorCfg.tests.length} testes alinhados com normas OSHA / NIOSH / MISAU • {examStage}</p>
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
          <p className="text-slate-600 font-bold text-lg">Seleccione um Sector para activar o Painel Diagnóstico</p>
          <p className="text-slate-400 text-sm mt-1">Cada sector gera 5–6 testes clínicos específicos alinhados com OSHA/NIOSH/MISAU</p>
        </div>
      )}

      {/* ── SECTION 3: Stage-Specific Actions ── */}
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

      {/* ── SECTION 4: Clinical Determination ── */}
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
                placeholder="ex: Sem levantamento >15kg; sem trabalho em altura; uso obrigatório de protectores auditivos classe 3..."
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
          <button type="button" onClick={onCancel}
            className="flex-1 h-12 border border-slate-200 bg-white text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={handleSave}
            className="flex-[2] h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
            <Save className="w-4 h-4" />
            Guardar & Emitir AMA (L-LAN)
          </button>
        </div>
        <button type="button" onClick={() => generateEstadoMedico()}
          className="w-full h-11 border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
          <FileText className="w-4 h-4" />
          Descarregar Estado Medico (PDF)
        </button>
      </div>
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
      bp: snap?.bp, hr: snap?.hr, temp: snap?.temp, heightWeight: snap?.heightWeight,
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
            {snap?.heightWeight && <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Altura / Peso</p><p className="font-bold text-slate-800 mt-0.5">{snap.heightWeight}</p></div>}
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
  const [selectedExam, setSelectedExam] = useState<OccupationalExam | null>(null);
  const filtered = exams.filter(e =>
    [e.patientName, e.patientId, e.companyName, e.sectorLabel].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input title="Pesquisar" placeholder="Pesquisar por BI, Nome, Empresa ou Sector..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        {onNewExam && (
          <button onClick={onNewExam}
            className="h-10 px-4 bg-teal-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-sm">
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
