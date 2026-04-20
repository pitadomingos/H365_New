
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, ListChecks, Loader2 } from "lucide-react";

interface TaskItem {
  text: string;
  subItems?: string[];
}

interface TaskCategory {
  title: string;
  items: TaskItem[];
}

const accomplishedTasks: TaskCategory[] = [
  {
    title: "Application Shell & Navigation",
    items: [
      { text: "Established Next.js application with collapsible sidebar." },
      { text: "Implemented theme toggling (light/dark/system) and consistent footer." },
      { text: "Global language toggle (EN/PT) in header (Dashboard & Tech Overview localized)." },
    ],
  },
  {
    title: "Core Clinical & Admin Modules (UI & Mocked Logic)",
    items: [
      { text: "Dashboard: Snapshot of hospital activity with summary cards & charts (Patient Entry, Daily Attendance). Simulates data fetching." },
      { text: "Patient Registration: Individual/bulk registration (CSV), webcam photo capture, dynamic waiting list display." },
      { text: "Visiting Patients (Intake): Patient search, quick registration modal, visit recording, local waiting list update, mock visit analytics." },
      { text: "Appointments: Scheduling, list/calendar views, mock notifications, simulated API interaction for scheduling." },
      { text: "Consultation Room (General): Three-panel layout, patient search, vitals (BMI calc & status badges), symptom input, AI-assisted decision support (Genkit), diagnostic ordering (labs/imaging via modals), doctor's comments, 'Save Progress', 'Finish Consultation' workflow with simulated API interaction." },
      { text: "Specializations: Mirrors Consultation Room, tailored for specialists with referral context, diagnostic ordering, save progress, and finish consultation with simulated API interaction." },
      { text: "Maternity Care: Patient intake dialog, patient management, antenatal visit logging (modal), diagnostic ordering (labs/imaging via modals), and mock API interaction simulations." },
      { text: "Ward Management: Ward selection, dynamic ward-specific dashboard, patient lists per ward, visual bed status, admit patient from pending list, detailed in-patient care (treatment plans, editable medication schedules via modal, doctor's notes, discharge/transfer workflows with simulated API interaction)." },
      { text: "Laboratory Management: Handles lab requests, detailed result entry modal with auto-interpretation for defined tests, reagent inventory (requisition - single/bulk, duplicate prevention, history log), simulated reagent consumption, and simulated API interaction." },
      { text: "Imaging & Radiology Management: Manages imaging requests, report entry modal (main report & impression), daily summary, and simulated API interaction. Notes future Biomedical Engineering module." },
      { text: "Drug Dispensing Pharmacy: Manages pending prescriptions, pharmacy stock (requisition - single/bulk, duplicate prevention, history log), daily report, and simulated API interaction." },
    ],
  },
  {
    title: "Placeholder Modules Created & Populated",
    items: [
      { text: "Basic pages with titles, descriptions, and potential feature lists for Emergency Room, Epidemic Control, Campaigns, Reporting, Billing & Finance, Telemedicine, Analytics & BI, Blood Bank." },
    ],
  },
  {
    title: "Technical Documentation & UI/UX",
    items: [
      { text: "Technical Overview Page: Comprehensive, bilingual (EN/PT with global toggle) page detailing features, tech stack, UI guidelines, and future scope." },
      { text: "General UI/UX: Consistent ShadCN UI/Tailwind CSS usage, improved button color contrast, resolution of context and hydration errors, `data-ai-hint` for patient photos." },
      { text: "Offline Capabilities & Local Node Infrastructure:" },
      { text: "Implemented PWA support (Serwist) with Asset Caching for offline access." },
      { text: "Developed LocalDB utility for patient registration data persistence using localStorage." },
      { text: "Created Docker-based deployment orchestration (Dockerfile + docker-compose) for hospital LAN facility nodes." },
      { text: "Implemented Sync Queue Manager for automated data reconciliation with the National Cloud." },
    ],
  },
  {
    title: "API Preparation (Frontend Side)",
    items: [
      { text: "Defined conceptual API endpoints for most modules." },
      { text: "Structured most interactive modules to simulate API calls (fetching data, submitting forms), manage loading/error states, and prepare data payloads for defined API contracts." },
    ],
  },
];

const pendingTasks: TaskCategory[] = [
  {
    title: "Full Backend Development (Node.js/Express & MySQL on Aiven)",
    items: [
      { text: "Database Schema Design & Implementation." },
      { text: "API Implementation: Build all defined API endpoints for each module." },
      { text: "Authentication & Authorization (User Login, RBAC)." },
      { text: "Hierarchical Data Access & Aggregation (Hospital, District, Provincial, National)." },
      { text: "Business Logic: Server-side validation, data processing, complex workflows." },
      { text: "Photo Storage Backend Logic (BLOBs or Object Storage)." },
    ],
  },
  {
    title: "Frontend Integration with Real Backend",
    items: [
      { text: "Replace all simulated `fetch` calls with actual HTTP requests." },
      { text: "Implement robust error handling for real network requests." },
      { text: "Integrate real-time data updates (waiting lists, notifications)." },
    ],
  },
  {
    title: "Full Development of Placeholder Modules",
    items: [
      { text: "Emergency Room: UI, frontend logic, backend integration." },
      { text: "Epidemic Control: UI, frontend logic, backend integration." },
      { text: "Campaigns: UI, frontend logic, backend integration." },
      { text: "Reporting (Comprehensive): UI, frontend logic, backend integration." },
      { text: "Billing & Finance: UI, frontend logic, backend integration." },
      { text: "Telemedicine: UI, frontend logic, backend integration." },
      { text: "Analytics & BI: UI, frontend logic, backend integration." },
      { text: "Blood Bank Management: UI, frontend logic, backend integration." },
    ],
  },
  {
    title: "Dedicated Centralized Modules",
    items: [
      { text: "Warehouse Management Module: Central stock control (pharmacy & lab)." },
      { text: "Biomedical Engineering Module: Medical equipment management." },
    ],
  },
  {
    title: "Interoperability & Standards",
    items: [
      { text: "HL7/FHIR Integration for data exchange." },
      { text: "Direct Medical Instrument Integration." },
    ],
  },
  {
    title: "Patient-Facing Features",
    items: [
      { text: "Patient Portal & Mobile Engagement (Access records, appointments, medication reminders with confirmation)." },
    ],
  },
  {
    title: "Advanced Features & Refinements",
    items: [
      { text: "Full Internationalization (i18n) & Localization (l10n): Complete translations (PT, IT, ES, others) for all pages, regional formats." },
      { text: "Advanced Synchronization: Multi-user conflict resolution (OT/CRDT) for concurrent data updates on the cloud." },
      { text: "Edge Connectivity: Dedicated background worker for persistent sync status monitoring." },
      { text: "Comprehensive Security & Compliance (Data privacy laws, audit trails)." },
      { text: "Genkit AI Flow Enhancement: Integrate with live backend for real-time, complete patient data." },
    ],
  },
  {
    title: "Testing, Deployment, & Maintenance",
    items: [
      { text: "Thorough Unit, Integration, and End-to-End Testing." },
      { text: "Establish CI/CD Pipelines." },
      { text: "Plan for ongoing maintenance, updates, and user support." },
      { text: "Develop comprehensive user training materials and system documentation." },
    ],
  },
];


export default function TodoListPage() {
  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ListChecks className="h-8 w-8" /> H365 Project To-Do List
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Accomplished (Frontend Prototype)
            </CardTitle>
            <CardDescription>Key features and modules prototyped in the frontend.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {accomplishedTasks.map((category, index) => (
                <AccordionItem value={`accomplished-${index}`} key={`accomplished-${index}`}>
                  <AccordionTrigger className="text-lg hover:no-underline">{category.title}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                      {category.items.map((item, itemIndex) => (
                        <li key={`accomplished-item-${index}-${itemIndex}`}>
                          {item.text}
                          {item.subItems && (
                            <ul className="list-circle space-y-1 pl-5 mt-1">
                              {item.subItems.map((subItem, subIndex) => (
                                <li key={`accomplished-subitem-${index}-${itemIndex}-${subIndex}`}>{subItem}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              Pending / Future Work
            </CardTitle>
            <CardDescription>Next steps and major areas for full development.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {pendingTasks.map((category, index) => (
                <AccordionItem value={`pending-${index}`} key={`pending-${index}`}>
                  <AccordionTrigger className="text-lg hover:no-underline">{category.title}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                      {category.items.map((item, itemIndex) => (
                        <li key={`pending-item-${index}-${itemIndex}`}>
                          {item.text}
                           {item.subItems && (
                            <ul className="list-circle space-y-1 pl-5 mt-1">
                              {item.subItems.map((subItem, subIndex) => (
                                <li key={`pending-subitem-${index}-${itemIndex}-${subIndex}`}>{subItem}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
  );
}