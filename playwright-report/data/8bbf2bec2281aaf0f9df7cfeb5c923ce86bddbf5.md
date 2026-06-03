# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clinical-workflow.spec.ts >> H365 Core Clinical Workflow >> should complete a full patient registration and consultation workflow
- Location: tests\clinical-workflow.spec.ts:7:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('ul.space-y-3 > li').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('ul.space-y-3 > li').first()

```

```yaml
- text: Internal Server Error
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('H365 Core Clinical Workflow', () => {
  4  | 
  5  |   test.setTimeout(60000);
  6  | 
  7  |   test('should complete a full patient registration and consultation workflow', async ({ page }) => {
  8  |     // 1. Navigate to Patient Registration
  9  |     await page.goto('/patient-registration');
  10 |     
  11 |     // Verify we are on the page
  12 |     await expect(page.locator('h1').filter({ hasText: /Patient Registration|Registo de Paciente/i })).toBeVisible();
  13 | 
  14 |     // 2. Fill out Patient Registration Form
  15 |     const uniqueId = `ID-${Date.now()}`;
  16 |     await page.fill('input[id="nationalId"]', uniqueId);
  17 |     await page.fill('input[id="fullName"]', 'Playwright Test Patient');
  18 |     
  19 |     // Fill Date of Birth (Calendar Popover)
  20 |     await page.locator('label[for="dob"]').locator('..').locator('button').click();
  21 |     // Wait for the calendar popover content to appear
  22 |     const calendarPopover = page.locator('[data-radix-popper-content-wrapper]').first();
  23 |     await calendarPopover.waitFor({ state: 'visible', timeout: 10000 });
  24 |     // Click day 15 inside the calendar (exact match to avoid matching '15' in month/year dropdowns)
  25 |     await calendarPopover.locator('button').filter({ hasText: /^15$/ }).first().click();
  26 | 
  27 |     // Fill gender
  28 |     await page.click('button[role="combobox"]');
  29 |     await page.click('div[role="option"] >> text=/Male|Masculino/i');
  30 | 
  31 |     // Fill contact & address
  32 |     await page.fill('input[id="contactNumber"]', '1234567890');
  33 |     await page.fill('textarea[id="address"]', '123 Test Street');
  34 |     await page.fill('input[id="district"]', 'Central');
  35 |     await page.fill('input[id="province"]', 'Maputo');
  36 | 
  37 |     // Handle Mock Photo Capture
  38 |     const mockPhotoBtn = page.locator('#mock-photo-btn');
  39 |     if (await mockPhotoBtn.isVisible()) {
  40 |       await mockPhotoBtn.click();
  41 |     }
  42 | 
  43 |     // Submit form (it might be in English or Portuguese)
  44 |     await page.click('button[type="submit"]');
  45 | 
  46 |     // Wait for success toast
  47 |     await expect(page.locator('.text-sm.font-semibold').filter({ hasText: /Patient Registered|Paciente Registrado/i }).first()).toBeVisible({ timeout: 10000 });
  48 | 
  49 |     // 3. Navigate to Consultation Room
  50 |     await page.goto('/treatment-recommendation');
  51 |     
  52 |     // Select the first patient from the mock waiting list
  53 |     const firstPatient = page.locator('ul.space-y-3 > li').first();
> 54 |     await expect(firstPatient).toBeVisible();
     |                                ^ Error: expect(locator).toBeVisible() failed
  55 |     await firstPatient.click();
  56 | 
  57 |     // 4. Fill Vitals
  58 |     await page.fill('input[name="bodyTemperature"]', '38.5');
  59 |     await page.fill('input[name="weight"]', '70');
  60 |     await page.fill('input[name="height"]', '175');
  61 |     await page.fill('input[name="bloodPressure"]', '120/80');
  62 | 
  63 |     // Navigate to Step 2
  64 |     await page.click('button:has-text("Next")');
  65 | 
  66 |     await page.fill('textarea[name="symptoms"]', 'Patient complains of mild headache and fever for 2 days.');
  67 |     await page.fill('textarea[name="doctorComments"]', 'Prescribed paracetamol. Follow up in 3 days if symptoms persist.');
  68 | 
  69 |     // Navigate to Step 3
  70 |     await page.click('button:has-text("Next")');
  71 | 
  72 |     // Click Get AI Recommendation
  73 |     await page.click('button >> text=/Get AI Recommendation|Obter Recomendação de IA/i');
  74 |     
  75 |     // Navigate to Step 4
  76 |     await page.click('button:has-text("Next")');
  77 | 
  78 |     // Wait for AI recommendation result
  79 |     await page.waitForSelector('text="Use AI Diagnosis"', { timeout: 15000 });
  80 | 
  81 |     // Finalize Diagnosis and Prescribe
  82 |     await page.fill('textarea[name="finalDiagnosis"]', 'Common Cold');
  83 |     await page.fill('textarea[name="finalPrescription"]', 'Paracetamol 500mg, Rest');
  84 | 
  85 |     // Complete Consultation
  86 |     await page.click('button >> text=/Finalize Consultation|Finalizar Consulta/i');
  87 |     // Modal outcome selection
  88 |     await page.click('button >> text=/Send Home|Mandar para Casa/i');
  89 | 
  90 |     // Wait for success toast
  91 |     await expect(page.locator('.text-sm.font-semibold').filter({ hasText: /Consultation Finished|Consulta Terminada/i }).first()).toBeVisible({ timeout: 10000 });
  92 |   });
  93 | });
  94 | 
```