# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clinical-workflow.spec.ts >> H365 Core Clinical Workflow >> should complete a full patient registration and consultation workflow
- Location: tests\clinical-workflow.spec.ts:5:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("15")').last()

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e6]:
      - generic [ref=e8]:
        - link "H365 Logo H365" [ref=e9] [cursor=pointer]:
          - /url: /
          - img "H365 Logo" [ref=e10]
          - heading "H365" [level=1] [ref=e11]
        - button "Toggle sidebar" [ref=e12] [cursor=pointer]:
          - img
      - list [ref=e14]:
        - generic [ref=e15]: Clinical Operations
        - listitem [ref=e16]:
          - link "Dashboard" [ref=e17] [cursor=pointer]:
            - /url: /
            - img [ref=e18]
            - generic [ref=e23]: Dashboard
        - listitem [ref=e24]:
          - link "Appointments" [ref=e25] [cursor=pointer]:
            - /url: /appointments
            - img [ref=e26]
            - generic [ref=e28]: Appointments
        - listitem [ref=e29]:
          - link "Visiting Patients" [ref=e30] [cursor=pointer]:
            - /url: /visiting-patients
            - img [ref=e31]
            - generic [ref=e36]: Visiting Patients
        - listitem [ref=e37]:
          - link "Consultation Room" [ref=e38] [cursor=pointer]:
            - /url: /treatment-recommendation
            - img [ref=e39]
            - generic [ref=e44]: Consultation Room
        - listitem [ref=e45]:
          - link "Clinical Notes & History" [ref=e46] [cursor=pointer]:
            - /url: /clinical-notes
            - img [ref=e47]
            - generic [ref=e50]: Clinical Notes & History
        - listitem [ref=e51]:
          - link "Digital Prescriptions" [ref=e52] [cursor=pointer]:
            - /url: /prescription-management
            - img [ref=e53]
            - generic [ref=e56]: Digital Prescriptions
        - listitem [ref=e57]:
          - link "Specializations" [ref=e58] [cursor=pointer]:
            - /url: /specializations
            - img [ref=e59]
            - generic [ref=e61]: Specializations
        - listitem [ref=e62]:
          - link "Maternity Care" [ref=e63] [cursor=pointer]:
            - /url: /maternity-care
            - img [ref=e64]
            - generic [ref=e67]: Maternity Care
        - listitem [ref=e68]:
          - link "Pediatrics (PAV)" [ref=e69] [cursor=pointer]:
            - /url: /pediatrics
            - img [ref=e70]
            - generic [ref=e73]: Pediatrics (PAV)
        - listitem [ref=e74]:
          - link "Chronic Disease Clinic" [ref=e75] [cursor=pointer]:
            - /url: /chronic-care
            - img [ref=e76]
            - generic [ref=e80]: Chronic Disease Clinic
        - listitem [ref=e81]:
          - link "Mental Health & Psych" [ref=e82] [cursor=pointer]:
            - /url: /mental-health
            - img [ref=e83]
            - generic [ref=e91]: Mental Health & Psych
        - listitem [ref=e92]:
          - link "Operation Theatre (OT)" [ref=e93] [cursor=pointer]:
            - /url: /operation-theatre
            - img [ref=e94]
            - generic [ref=e100]: Operation Theatre (OT)
        - listitem [ref=e101]:
          - link "Nutrition & Dietetics" [ref=e102] [cursor=pointer]:
            - /url: /nutrition
            - img [ref=e103]
            - generic [ref=e106]: Nutrition & Dietetics
        - listitem [ref=e107]:
          - link "Ward Management" [ref=e108] [cursor=pointer]:
            - /url: /ward-management
            - img [ref=e109]
            - generic [ref=e112]: Ward Management
        - generic [ref=e113]: Ancillary & Support
        - listitem [ref=e114]:
          - link "Laboratory" [ref=e115] [cursor=pointer]:
            - /url: /laboratory-management
            - img [ref=e116]
            - generic [ref=e120]: Laboratory
        - listitem [ref=e121]:
          - link "Imaging" [ref=e122] [cursor=pointer]:
            - /url: /imaging-management
            - img [ref=e123]
            - generic [ref=e126]: Imaging
        - listitem [ref=e127]:
          - link "Drug Dispensing" [ref=e128] [cursor=pointer]:
            - /url: /pharmacy
            - img [ref=e129]
            - generic [ref=e132]: Drug Dispensing
        - listitem [ref=e133]:
          - link "Blood Bank" [ref=e134] [cursor=pointer]:
            - /url: /blood-bank
            - img [ref=e135]
            - generic [ref=e138]: Blood Bank
        - listitem [ref=e139]:
          - link "Emergency Room" [ref=e140] [cursor=pointer]:
            - /url: /emergency-room
            - img [ref=e141]
            - generic [ref=e146]: Emergency Room
        - listitem [ref=e147]:
          - link "Telemedicine" [ref=e148] [cursor=pointer]:
            - /url: /telemedicine
            - img [ref=e149]
            - generic [ref=e152]: Telemedicine
        - generic [ref=e153]: Public Health
        - listitem [ref=e154]:
          - link "Public Health Dashboard" [ref=e155] [cursor=pointer]:
            - /url: /public-health-dashboard
            - img [ref=e156]
            - generic [ref=e158]: Public Health Dashboard
        - listitem [ref=e159]:
          - link "Epidemic Control" [ref=e160] [cursor=pointer]:
            - /url: /epidemic-control
            - img [ref=e161]
            - generic [ref=e171]: Epidemic Control
        - listitem [ref=e172]:
          - link "Public Health Messaging" [ref=e173] [cursor=pointer]:
            - /url: /public-health-messaging
            - img [ref=e174]
            - generic [ref=e177]: Public Health Messaging
        - listitem [ref=e178]:
          - link "Campaigns" [ref=e179] [cursor=pointer]:
            - /url: /campaigns
            - img [ref=e180]
            - generic [ref=e183]: Campaigns
        - listitem [ref=e184]:
          - link "Analytics & BI" [ref=e185] [cursor=pointer]:
            - /url: /analytics-bi
            - img [ref=e186]
            - generic [ref=e198]: Analytics & BI
        - generic [ref=e199]: Administration
        - listitem [ref=e200]:
          - link "Patient Registration" [ref=e201] [cursor=pointer]:
            - /url: /patient-registration
            - img [ref=e202]
            - generic [ref=e206]: Patient Registration
        - listitem [ref=e207]:
          - link "Reporting" [ref=e208] [cursor=pointer]:
            - /url: /reporting
            - img [ref=e209]
            - generic [ref=e213]: Reporting
        - listitem [ref=e214]:
          - link "Billing & Finance" [ref=e215] [cursor=pointer]:
            - /url: /billing
            - img [ref=e216]
            - generic [ref=e218]: Billing & Finance
        - listitem [ref=e219]:
          - link "General Inventory" [ref=e220] [cursor=pointer]:
            - /url: /inventory-management
            - img [ref=e221]
            - generic [ref=e225]: General Inventory
        - listitem [ref=e226]:
          - link "Master Patient Index" [ref=e227] [cursor=pointer]:
            - /url: /mpi-reconciliation
            - img [ref=e228]
            - generic [ref=e237]: Master Patient Index
        - listitem [ref=e238]:
          - link "Staff Management" [ref=e239] [cursor=pointer]:
            - /url: /staff-management
            - img [ref=e240]
            - generic [ref=e252]: Staff Management
        - listitem [ref=e253]:
          - link "Facility Configuration" [ref=e254] [cursor=pointer]:
            - /url: /facility-configuration
            - img [ref=e255]
            - generic [ref=e256]: Facility Configuration
        - listitem [ref=e257]:
          - link "Biomedical Engineering" [ref=e258] [cursor=pointer]:
            - /url: /biomedical-engineering
            - img [ref=e259]
            - generic [ref=e262]: Biomedical Engineering
        - generic [ref=e263]: Technical & Documentation
        - listitem [ref=e264]:
          - link "System Activity Log" [ref=e265] [cursor=pointer]:
            - /url: /system-activity-log
            - img [ref=e266]
            - generic [ref=e269]: System Activity Log
        - listitem [ref=e270]:
          - link "System Node Status" [ref=e271] [cursor=pointer]:
            - /url: /system-status
            - img [ref=e272]
            - generic [ref=e277]: System Node Status
        - listitem [ref=e278]:
          - link "Technical Overview" [ref=e279] [cursor=pointer]:
            - /url: /technical-overview
            - img [ref=e280]
            - generic [ref=e282]: Technical Overview
        - listitem [ref=e283]:
          - link "System Documentation" [ref=e284] [cursor=pointer]:
            - /url: /docs
            - img [ref=e285]
            - generic [ref=e288]: System Documentation
        - listitem [ref=e289]:
          - link "Backend Roadmap" [ref=e290] [cursor=pointer]:
            - /url: /backend-schema-roadmap
            - img [ref=e291]
            - generic [ref=e295]: Backend Roadmap
        - listitem [ref=e296]:
          - link "Architecture Options" [ref=e297] [cursor=pointer]:
            - /url: /architecture-options
            - img [ref=e298]
            - generic [ref=e303]: Architecture Options
        - listitem [ref=e304]:
          - link "Training Materials" [ref=e305] [cursor=pointer]:
            - /url: /training-materials
            - img [ref=e306]
            - generic [ref=e309]: Training Materials
        - listitem [ref=e310]:
          - link "To-Do List" [ref=e311] [cursor=pointer]:
            - /url: /todo-list
            - img [ref=e312]
            - generic [ref=e315]: To-Do List
        - generic [ref=e316]: Mobile Experience
        - listitem [ref=e317]:
          - link "Patient Portal" [ref=e318] [cursor=pointer]:
            - /url: /patient-portal/login
            - img [ref=e319]
            - generic [ref=e321]: Patient Portal
      - list [ref=e323]:
        - listitem [ref=e324]:
          - link "Notifications" [ref=e325] [cursor=pointer]:
            - /url: /notifications
            - img [ref=e326]
            - generic [ref=e329]: Notifications
        - listitem [ref=e330]:
          - link "Settings" [ref=e331] [cursor=pointer]:
            - /url: /settings
            - img [ref=e332]
            - generic [ref=e335]: Settings
        - listitem [ref=e336]:
          - link "Logout" [ref=e337] [cursor=pointer]:
            - /url: /logout
            - img [ref=e338]
            - generic [ref=e341]: Logout
    - generic [ref=e342]:
      - banner [ref=e343]:
        - button "DR Dr. Afonso Dhlakama" [ref=e345] [cursor=pointer]:
          - generic [ref=e347]: DR
          - generic [ref=e348]: Dr. Afonso Dhlakama
      - main [ref=e349]:
        - generic [ref=e351]:
          - generic [ref=e352]:
            - heading "Patient Registration" [level=1] [ref=e353]:
              - img [ref=e354]
              - text: Patient Registration
            - link "Go to Visiting Patients" [ref=e357] [cursor=pointer]:
              - /url: /visiting-patients
              - img
              - text: Go to Visiting Patients
          - generic [ref=e358]:
            - generic [ref=e360]:
              - generic [ref=e361]:
                - generic [ref=e362]: New Patient Details
                - generic [ref=e363]: Please fill in the patient's information accurately. This form is for hospital reception use.
              - generic [ref=e364]:
                - generic [ref=e365]:
                  - generic [ref=e369]:
                    - img [ref=e370]
                    - paragraph [ref=e374]: Click "Enable Camera" to start.
                  - generic [ref=e375]:
                    - heading "Personal Information" [level=3] [ref=e376]
                    - generic [ref=e377]:
                      - generic [ref=e378]:
                        - generic [ref=e379]: National ID Number *
                        - textbox "National ID Number *" [ref=e380]:
                          - /placeholder: e.g., 1234567890
                          - text: ID-1779194098453
                        - paragraph [ref=e381]: Patient's National ID must be unique.
                      - generic [ref=e382]:
                        - generic [ref=e383]: Full Name *
                        - textbox "Full Name *" [ref=e384]:
                          - /placeholder: e.g., John Michael Smith
                          - text: Playwright Test Patient
                    - generic [ref=e385]:
                      - generic [ref=e386]:
                        - generic [ref=e387]: Date of Birth *
                        - button "Pick a date" [active] [ref=e388] [cursor=pointer]:
                          - img
                          - generic [ref=e389]: Pick a date
                      - generic [ref=e390]:
                        - generic [ref=e391]: Gender *
                        - combobox "Gender *" [ref=e392] [cursor=pointer]:
                          - generic: Select gender
                          - img [ref=e393]
                        - combobox [ref=e395]
                    - generic [ref=e396]:
                      - text: Allergies (comma-separated if multiple)
                      - textbox "Allergies (comma-separated if multiple)" [ref=e397]:
                        - /placeholder: e.g., Penicillin, Dust Mites, Peanuts
                    - generic [ref=e398]:
                      - text: Chronic Conditions (comma-separated)
                      - textbox "Chronic Conditions (comma-separated)" [ref=e399]:
                        - /placeholder: e.g., Hypertension, Diabetes, Asthma
                    - generic [ref=e400]:
                      - heading "Patient Photo Capture *" [level=3] [ref=e401]:
                        - img [ref=e402]
                        - text: Patient Photo Capture
                        - generic [ref=e405]: "*"
                      - paragraph [ref=e406]: Capture a clear photo. Aim for a passport-style image. Photo is mandatory for this form.
                      - generic [ref=e407]:
                        - button "Enable Camera" [ref=e408] [cursor=pointer]:
                          - img
                          - text: Enable Camera
                        - button "Mock Photo" [ref=e409] [cursor=pointer]
                - generic [ref=e410]:
                  - generic [ref=e411]:
                    - heading "Contact Information" [level=3] [ref=e412]
                    - generic [ref=e413]:
                      - generic [ref=e414]:
                        - generic [ref=e415]: Phone/Cell Number *
                        - textbox "Phone/Cell Number *" [ref=e416]:
                          - /placeholder: e.g., (555) 123-4567
                      - generic [ref=e417]:
                        - text: Email Address
                        - textbox "Email Address" [ref=e418]:
                          - /placeholder: e.g., john.smith@example.com
                    - generic [ref=e419]:
                      - generic [ref=e420]: Full Address *
                      - textbox "Full Address *" [ref=e421]:
                        - /placeholder: e.g., 123 Main St, Anytown, State, ZIP
                  - generic [ref=e422]:
                    - heading "Location & Origin" [level=3] [ref=e423]
                    - generic [ref=e424]:
                      - generic [ref=e425]:
                        - generic [ref=e426]: District *
                        - textbox "District *" [ref=e427]:
                          - /placeholder: e.g., Central District
                      - generic [ref=e428]:
                        - generic [ref=e429]: Province *
                        - textbox "Province *" [ref=e430]:
                          - /placeholder: e.g., Capital Province
                      - generic [ref=e431]:
                        - text: Home Hospital/Clinic
                        - textbox "Home Hospital/Clinic" [ref=e432]:
                          - /placeholder: e.g., City General Hospital
                  - generic [ref=e433]:
                    - heading "Next of Kin (Optional)" [level=3] [ref=e434]
                    - generic [ref=e435]:
                      - generic [ref=e436]:
                        - text: Full Name
                        - textbox "Full Name" [ref=e437]:
                          - /placeholder: e.g., Jane Smith (Spouse)
                      - generic [ref=e438]:
                        - text: Contact Number
                        - textbox "Contact Number" [ref=e439]:
                          - /placeholder: e.g., (555) 987-6543
                    - generic [ref=e440]:
                      - text: Address
                      - textbox "Address" [ref=e441]:
                        - /placeholder: e.g., 456 Oak Ave, Anytown
                  - generic [ref=e442]:
                    - heading "Bulk Patient Registration" [level=3] [ref=e443]:
                      - img [ref=e444]
                      - text: Bulk Patient Registration
                    - paragraph [ref=e447]: Upload an Excel or CSV file to register multiple patients at once. Download the template for the correct format. Photos must be added individually post-registration.
                    - button "Download CSV Template" [ref=e448] [cursor=pointer]:
                      - img
                      - text: Download CSV Template
                    - generic [ref=e449]:
                      - text: Upload File
                      - button "Upload File" [ref=e450]
                    - button "Upload and Process File" [disabled]:
                      - img
                      - text: Upload and Process File
              - button "Register Patient" [ref=e452] [cursor=pointer]
            - generic [ref=e453]:
              - generic [ref=e454]:
                - generic [ref=e455]:
                  - generic [ref=e456]: Today's Waiting List at HealthFlow Central Hospital
                  - generic [ref=e457]: Patients currently awaiting service.
                - generic [ref=e458]:
                  - generic [ref=e459]:
                    - img [ref=e460]
                    - paragraph [ref=e462]: Loading waiting list...
                  - button "Refresh List" [disabled]:
                    - img
                    - text: Refresh List
              - generic [ref=e463]:
                - generic [ref=e465]:
                  - img [ref=e466]
                  - text: Reception Quick Tips
                - generic [ref=e468]:
                  - paragraph [ref=e469]: Ensure patient details are entered accurately.
                  - paragraph [ref=e470]: Verify National ID for all new and returning patients.
                  - paragraph [ref=e471]: For emergencies, follow standard hospital protocol.
                  - paragraph [ref=e472]: Keep patient discussions confidential.
      - contentinfo [ref=e473]:
        - paragraph [ref=e474]: © 2026 H365. All rights reserved.
        - paragraph [ref=e475]: Version 0.1.0 (Prototype)
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('H365 Core Clinical Workflow', () => {
  4  | 
  5  |   test('should complete a full patient registration and consultation workflow', async ({ page }) => {
  6  |     // 1. Navigate to Patient Registration
  7  |     await page.goto('/patient-registration');
  8  |     
  9  |     // Verify we are on the page
  10 |     await expect(page.locator('h1').filter({ hasText: /Patient Registration|Registo de Paciente/i })).toBeVisible();
  11 | 
  12 |     // 2. Fill out Patient Registration Form
  13 |     const uniqueId = `ID-${Date.now()}`;
  14 |     await page.fill('input[id="nationalId"]', uniqueId);
  15 |     await page.fill('input[id="fullName"]', 'Playwright Test Patient');
  16 |     
  17 |     // Fill Date of Birth (Calendar Popover)
  18 |     await page.locator('label[for="dob"]').locator('..').locator('button').click();
  19 |     // Wait for calendar popover and click a day button containing the text "15"
> 20 |     await page.locator('button:has-text("15")').last().click({ force: true });
     |                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  21 | 
  22 |     // Fill gender
  23 |     await page.click('button[role="combobox"]');
  24 |     await page.click('div[role="option"] >> text=/Male|Masculino/i');
  25 | 
  26 |     // Fill contact & address
  27 |     await page.fill('input[id="contactNumber"]', '1234567890');
  28 |     await page.fill('textarea[id="address"]', '123 Test Street');
  29 |     await page.fill('input[id="district"]', 'Central');
  30 |     await page.fill('input[id="province"]', 'Maputo');
  31 | 
  32 |     // Handle Mock Photo Capture
  33 |     const mockPhotoBtn = page.locator('#mock-photo-btn');
  34 |     if (await mockPhotoBtn.isVisible()) {
  35 |       await mockPhotoBtn.click();
  36 |     }
  37 | 
  38 |     // Submit form (it might be in English or Portuguese)
  39 |     await page.click('button[type="submit"]');
  40 | 
  41 |     // Wait for success toast
  42 |     await expect(page.locator('.text-sm.font-semibold').filter({ hasText: /Registration Complete|Registo Concluído/i }).first()).toBeVisible({ timeout: 10000 });
  43 | 
  44 |     // 3. Navigate to Consultation Room
  45 |     await page.goto('/treatment-recommendation');
  46 |     
  47 |     // Select the first patient from the mock waiting list
  48 |     const firstPatient = page.locator('ul.space-y-3 > li').first();
  49 |     await expect(firstPatient).toBeVisible();
  50 |     await firstPatient.click();
  51 | 
  52 |     // 4. Fill out Consultation Form
  53 |     await page.fill('input[name="bodyTemperature"]', '37.2');
  54 |     await page.fill('input[name="weight"]', '75');
  55 |     await page.fill('input[name="height"]', '180');
  56 |     await page.fill('input[name="bloodPressure"]', '120/80');
  57 | 
  58 |     await page.fill('textarea[name="symptoms"]', 'Patient complains of mild headache and fever for 2 days.');
  59 | 
  60 |     // Click Get AI Recommendation
  61 |     await page.click('button >> text=/Get AI Recommendation|Obter Recomendação de IA/i');
  62 |     
  63 |     // Wait for the recommendation to appear (mock AI usually takes ~1-3s)
  64 |     await page.waitForSelector('button >> text=/Accept Suggestion|Aceitar Sugestão/i', { state: 'visible', timeout: 8000 });
  65 | 
  66 |     // Accept AI suggestion
  67 |     await page.click('button >> text=/Accept Suggestion|Aceitar Sugestão/i');
  68 | 
  69 |     // Order Lab Tests
  70 |     await page.click('button >> text=/Add Diagnostics|Adicionar Diagnósticos/i');
  71 |     // Select Malaria from the dialog
  72 |     await page.click('div[role="menuitemcheckbox"] >> text=/Malaria/i', { timeout: 2000 }).catch(() => null); // It might be a different structure, so try/catch or just optional
  73 |     // Try clicking close or clicking outside to close dialog if it's a popover/dropdown
  74 |     await page.keyboard.press('Escape');
  75 | 
  76 |     // Provide Doctor Comments
  77 |     await page.fill('textarea[name="doctorComments"]', 'Prescribed paracetamol. Follow up in 3 days if symptoms persist.');
  78 | 
  79 |     // Save/Complete Consultation
  80 |     await page.click('button[type="submit"] >> text=/Save & Complete|Guardar e Concluir/i');
  81 | 
  82 |     // Wait for success toast
  83 |     await expect(page.locator('.text-sm.font-semibold').filter({ hasText: /Consultation Saved|Consulta Guardada/i }).first()).toBeVisible({ timeout: 10000 });
  84 |   });
  85 | });
  86 | 
```