
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileText, BookOpenCheck, FolderTree } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function BackendSchemaRoadmapPage() {

  // Helper to render code blocks nicely
  const CodeBlock = ({ children, lang = "bash" }: { children: React.ReactNode, lang?: string }) => (
    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto my-2">
      <code className={`language-${lang} font-mono`}>{children}</code>
    </pre>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Database className="h-8 w-8" /> H365: Backend Development Plan
        </h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">1. Introduction</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            This document outlines a phased roadmap and architectural considerations for developing the backend for the H365 Hospital Management System.
            The backend will be built using Node.js with the Express framework and MySQL as the database, hosted on Aiven.
            Detailed SQL table schemas will be managed via migration scripts in the backend repository.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">2. Technology Stack</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <ul>
            <li><strong>Backend Framework:</strong> Node.js with Express.js</li>
            <li><strong>Database:</strong> MySQL (hosted on Aiven)</li>
            <li><strong>Authentication:</strong> JWT (JSON Web Tokens)</li>
            <li><strong>ORM/Query Builder (Recommended):</strong> Sequelize, Knex.js, or TypeORM (or use a direct MySQL driver like `mysql2`)</li>
            <li><strong>Database Migration Tool (Recommended):</strong> Integrated with ORM, or standalone like `db-migrate`, `flyway`.</li>
            <li><strong>Validation:</strong> A library like Joi or express-validator</li>
            <li><strong>Logging:</strong> Winston or Pino</li>
            <li><strong>API Documentation (Recommended):</strong> Swagger/OpenAPI (using tools like `swagger-jsdoc` and `swagger-ui-express`)</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">3. Data Modeling & Interoperability (Blueprint)</CardTitle>
          <CardDescription>Logical representation of core entities for multi-tenant national scale.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            H365 uses a &quot;Blueprint&quot; approach to define data shapes before physical implementation. This ensures consistency across the MySQL backend and any future microservices.
          </p>
          <CodeBlock lang="json">{
`{
  "entities": {
    "Patient": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "nationalId": { "type": "string", "description": "Unique National identifier" },
        "fullName": { "type": "string" },
        "facilityId": { "type": "string", "description": "Home facility ID" }
      },
      "required": ["nationalId", "fullName"]
    },
    "ClinicalEncounter": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "patientId": { "type": "string" },
        "visitType": { "enum": ["OPD", "ER", "Maternity", "Ward"] },
        "observations": { "type": "array", "items": { "$ref": "#/entities/Observation" } }
      }
    },
    "FinancialClaim": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "encounterId": { "type": "string" },
        "amount": { "type": "number" },
        "status": { "enum": ["Draft", "Submitted", "Paid", "Rejected"] }
      }
    }
  }
}`
}
          </CodeBlock>
          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="text-sm font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <BookOpenCheck className="h-4 w-4" /> OpenHIE Interoperability
            </h4>
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
              All backend endpoints must support FHIR-compliant responses for clinical data exchange. The Patient Registry acts as a Master Patient Index (MPI) node.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">4. Phased Development Roadmap</CardTitle>
          <CardDescription>A high-level overview of development phases. API details are in `docs/api_endpoints.md`.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <section>
            <h3 className="text-lg font-semibold mb-2">Phase 1: Core Infrastructure, User Management &amp; Patient Registration</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Establish the basic backend server, database connection, authentication, and core patient registration API.
            </p>
            <h4 className="font-medium mt-3 mb-1">Key Functionalities:</h4>
            <ul className="list-disc list-inside text-sm pl-4">
              <li>User Login/Logout, Get Current User.</li>
              <li>Register New Patient (Individual &amp; Bulk Stub).</li>
              <li>Search/Get Patient Details.</li>
            </ul>
          </section>
          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-2">Phase 2: Appointments &amp; Visiting Patients (Intake)</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Implement appointment scheduling and the workflow for patients arriving at the hospital.
            </p>
             <h4 className="font-medium mt-3 mb-1">Key Functionalities:</h4>
            <ul className="list-disc list-inside text-sm pl-4">
              <li>List Doctors.</li>
              <li>Create/Read/Update/Delete Appointments.</li>
              <li>Record Patient Visits &amp; Manage Hospital-Wide Waiting List.</li>
            </ul>
          </section>
          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-2">Phase 3: Consultations (General &amp; Specialist) &amp; Diagnostic Orders</h3>
             <h4 className="font-medium mt-3 mb-1">Key Functionalities:</h4>
            <ul className="list-disc list-inside text-sm pl-4">
              <li>Save/Finalize Consultations (General &amp; Specialist).</li>
              <li>Save/Retrieve Consultation Drafts.</li>
              <li>Submit Lab &amp; Imaging Orders linked to Consultations.</li>
              <li>Manage Referrals (for Specialists).</li>
              <li>Implement Notifications for results/referrals.</li>
            </ul>
          </section>
          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-2">Phase 4: Ward Management &amp; In-Patient Care</h3>
            <h4 className="font-medium mt-3 mb-1">Key Functionalities:</h4>
            <ul className="list-disc list-inside text-sm pl-4">
              <li>Manage Ward Information &amp; Bed Status.</li>
              <li>Admit Patients to Wards.</li>
              <li>Manage In-Patient Details (Vitals, Treatment Plan, Medication Schedules, Doctor Notes).</li>
              <li>Handle Patient Discharge &amp; Transfer.</li>
            </ul>
          </section>
          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-2">Phase 5: Laboratory &amp; Imaging Management (Core Workflows)</h3>
             <h4 className="font-medium mt-3 mb-1">Key Functionalities:</h4>
            <ul className="list-disc list-inside text-sm pl-4">
                <li>Manage Lab &amp; Imaging Requests (Status updates, Result/Report entry).</li>
                <li>Basic Reagent/Consumable Inventory for Lab &amp; Imaging.</li>
                <li>Submit Requisitions for Lab Reagents &amp; Imaging Consumables.</li>
                <li>Log Equipment Malfunctions.</li>
            </ul>
          </section>
          <Separator />

          <section>
            <h3 className="text-lg font-semibold mb-2">Phase 6: Pharmacy &amp; Drug Dispensing</h3>
             <h4 className="font-medium mt-3 mb-1">Key Functionalities:</h4>
            <ul className="list-disc list-inside text-sm pl-4">
                <li>Manage Pending Prescriptions &amp; Dispense Medications.</li>
                <li>Pharmacy Inventory Management.</li>
                <li>Submit Requisitions for Pharmacy Stock.</li>
            </ul>
          </section>
          <Separator />
          
          <section>
            <h3 className="text-lg font-semibold mb-2">Phase 7: Specialized Modules &amp; Advanced Features</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Implement Maternity Care, Emergency Room, Epidemic Control, Campaigns, Comprehensive Reporting, Billing, Telemedicine, etc. Database schemas for these will be defined as each module is tackled.
            </p>
             <h4 className="font-medium mt-3 mb-1">Key Functionalities (Examples):</h4>
            <ul className="list-disc list-inside text-sm pl-4">
              <li>Maternity: Antenatal visit logging, birth plan management.</li>
              <li>Emergency Room: Triage, ER patient tracking.</li>
              <li>Epidemic Control: Case tracking, contact tracing.</li>
            </ul>
          </section>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">5. Data Considerations for Dynamic Lists &amp; History</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-sm text-muted-foreground">
              Many dynamic lists and historical views in the application are derived by querying and combining data from multiple base tables.
            </p>
            <h4 className="font-medium mt-3 mb-1">Patient Visit History:</h4>
            <p className="text-sm text-muted-foreground">
              This is not stored in a single table. It&apos;s a derived view or a result of querying and combining data from `Visits`, `Appointments`, `Consultations`, and `Admissions` tables, all linked by `patientId` and ordered by date. The backend API serving this history (e.g., `GET /api/v1/patients/&#123;patientId&#125;/history`) would handle this complex query logic.
            </p>
             <h4 className="font-medium mt-3 mb-1">Waiting Lists:</h4>
            <p className="text-sm text-muted-foreground">
              The `Visits` table (with its `status`, `department`, `facilityId`, and `visitDate` fields) serves as the basis for various waiting lists. Different modules (e.g., Consultation Room, Lab, Imaging) would query this table with appropriate filters (e.g., by department, status=&apos;Waiting&apos;, facilityId).
            </p>
             <h4 className="font-medium mt-3 mb-1">Lab/Imaging Notifications:</h4>
            <p className="text-sm text-muted-foreground">
              A dedicated `Notifications` table is crucial. This table links users to events like &quot;Lab result ready&quot; or &quot;New referral&quot;. The backend would create entries in this table when relevant events occur.
            </p>
            <h4 className="font-medium mt-3 mb-1">Incomplete/Drafted Consultations:</h4>
            <p className="text-sm text-muted-foreground">
              The `Consultations` table, with its `status` field (e.g., &apos;Draft&apos;, &apos;Completed&apos;) and `consultingDoctorId`, is queried to populate lists of drafted consultations for a specific doctor (e.g., via `GET /api/v1/consultations/drafts?doctorId=&#123;id&#125;`).
            </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FolderTree className="h-6 w-6" /> 6. Proposed Backend Folder Structure (Node.js/Express)
          </CardTitle>
          <CardDescription>A modular structure for organizing backend code.</CardDescription>
        </CardHeader>
        <CardContent>
            <CodeBlock lang="bash">{
`h365-backend/
├── .env
├── ca.pem
├── package.json
├── package-lock.json
├── .gitignore
└── src/
    ├── app.js               # Main Express application setup
    ├── config/
    │   ├── database.config.js
    │   ├── jwt.config.js
    │   └── index.js
    ├── api/
    │   ├── index.js           # Main API router
    │   ├── auth/
    │   │   ├── auth.routes.js
    │   │   ├── auth.controller.js
    │   │   └── auth.service.js
    │   ├── dashboard/
    │   │   ├── dashboard.routes.js
    │   │   └── dashboard.controller.js 
    │   ├── patients/
    │   │   ├── patient.routes.js
    │   │   ├── patient.controller.js
    │   │   ├── patient.service.js
    │   │   └── patient.model.js
    │   ├── visits/
    │   │   ├── visit.routes.js
    │   │   └── visit.controller.js 
    │   ├── appointments/
    │   │   ├── appointment.routes.js
    │   │   └── appointment.controller.js 
    │   ├── consultations/
    │   │   ├── consultation.routes.js
    │   │   └── consultation.controller.js 
    │   ├── maternity/
    │   │   ├── maternity.routes.js
    │   │   └── maternity.controller.js 
    │   ├── wards/
    │   │   ├── ward.routes.js
    │   │   └── ward.controller.js 
    │   ├── laboratory/
    │   │   ├── laboratory.routes.js
    │   │   └── laboratory.controller.js 
    │   ├── imaging/
    │   │   ├── imaging.routes.js
    │   │   └── imaging.controller.js 
    │   ├── pharmacy/
    │   │   ├── pharmacy.routes.js
    │   │   └── pharmacy.controller.js 
    │   ├── equipment/
    │   │   ├── equipment.routes.js
    │   │   └── equipment.controller.js
    │   └── notifications/
    │       ├── notification.routes.js
    │       └── notification.controller.js
    ├── services/ # Business logic layer for each module (e.g., patients.service.js)
    ├── models/   # Data Access Layer for each entity (e.g., patients.model.js)
    ├── middleware/
    │   ├── auth.middleware.js
    │   ├── error.handler.js
    │   ├── request.logger.js
    │   └── validate.request.js
    ├── utils/
    │   ├── errorHandler.js
    │   └── responseHandler.js
    └── db/
        ├── connect.js           # MySQL connection pool setup
        ├── migrations/          # For database schema changes
        └── seeders/             # For initial data population
`}
            </CodeBlock>
            <p className="text-sm text-muted-foreground mt-2">
                <strong>Note:</strong> The `services/` and `models/` directories can either be top-level as shown, or individual `*.service.js` and `*.model.js` files can reside within their respective module folders under `api/` (e.g., `api/patients/patient.service.js`). The choice depends on project size and team preference.
            </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">7. Key Backend Considerations</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
           <ul className="list-disc list-inside text-sm pl-4 space-y-1">
            <li><strong>Error Handling:</strong> Consistent error responses (e.g., standard JSON error objects with status codes).</li>
            <li><strong>Validation:</strong> Robust input validation for all API requests (e.g., using Joi or express-validator).</li>
            <li><strong>Security:</strong> Password hashing (e.g., bcrypt), protection against SQL injection, XSS, CSRF. Implement HTTPS.</li>
            <li><strong>Data Integrity:</strong> Use of database transactions for operations involving multiple table updates.</li>
            <li><strong>Hierarchical Data Access:</strong> Design logic for filtering and aggregating data based on user role and their assigned facility level (hospital, district, province, national). Ensure clinicians can access patient records nationwide for direct care.</li>
            <li><strong>Logging:</strong> Comprehensive logging for API requests, errors, and significant events for debugging and auditing.</li>
            <li><strong>Configuration Management:</strong> Securely manage database credentials, API keys, and other sensitive configurations using environment variables.</li>
            <li><strong>Scalability:</strong> Design with scalability in mind (e.g., efficient queries, potential for read replicas, caching strategies).</li>
            <li><strong>Testing:</strong> Implement unit, integration, and end-to-end tests for the backend APIs.</li>
            <li><strong>Database Migrations:</strong> Use a migration tool (e.g., db-migrate, Sequelize migrations, Knex migrations) to manage schema changes versionally.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

    