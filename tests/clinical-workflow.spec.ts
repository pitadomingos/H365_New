import { test, expect } from '@playwright/test';

test.describe('H365 Core Clinical Workflow', () => {

  test.setTimeout(60000);

  test('should complete a full patient registration and consultation workflow', async ({ page }) => {
    // 1. Navigate to Patient Registration
    await page.goto('/patient-registration');
    
    // Verify we are on the page
    await expect(page.locator('h1').filter({ hasText: /Patient Registration|Registo de Paciente/i })).toBeVisible();

    // 2. Fill out Patient Registration Form
    const uniqueId = `ID-${Date.now()}`;
    await page.fill('input[id="nationalId"]', uniqueId);
    await page.fill('input[id="fullName"]', 'Playwright Test Patient');
    
    // Fill Date of Birth (Calendar Popover)
    await page.locator('label[for="dob"]').locator('..').locator('button').click();
    // Wait for the calendar popover content to appear
    const calendarPopover = page.locator('[data-radix-popper-content-wrapper]').first();
    await calendarPopover.waitFor({ state: 'visible', timeout: 10000 });
    // Click day 15 inside the calendar (exact match to avoid matching '15' in month/year dropdowns)
    await calendarPopover.locator('button').filter({ hasText: /^15$/ }).first().click();

    // Fill gender
    await page.click('button[role="combobox"]');
    await page.click('div[role="option"] >> text=/Male|Masculino/i');

    // Fill contact & address
    await page.fill('input[id="contactNumber"]', '1234567890');
    await page.fill('textarea[id="address"]', '123 Test Street');
    await page.fill('input[id="district"]', 'Central');
    await page.fill('input[id="province"]', 'Maputo');

    // Handle Mock Photo Capture
    const mockPhotoBtn = page.locator('#mock-photo-btn');
    if (await mockPhotoBtn.isVisible()) {
      await mockPhotoBtn.click();
    }

    // Submit form (it might be in English or Portuguese)
    await page.click('button[type="submit"]');

    // Wait for success toast
    await expect(page.locator('.text-sm.font-semibold').filter({ hasText: /Patient Registered|Paciente Registrado/i }).first()).toBeVisible({ timeout: 10000 });

    // 3. Navigate to Consultation Room
    await page.goto('/treatment-recommendation');
    
    // Select the first patient from the mock waiting list
    const firstPatient = page.locator('ul.space-y-3 > li').first();
    await expect(firstPatient).toBeVisible();
    await firstPatient.click();

    // 4. Fill Vitals
    await page.fill('input[name="bodyTemperature"]', '38.5');
    await page.fill('input[name="weight"]', '70');
    await page.fill('input[name="height"]', '175');
    await page.fill('input[name="bloodPressure"]', '120/80');

    // Navigate to Step 2
    await page.click('button:has-text("Next")');

    await page.fill('textarea[name="symptoms"]', 'Patient complains of mild headache and fever for 2 days.');
    await page.fill('textarea[name="doctorComments"]', 'Prescribed paracetamol. Follow up in 3 days if symptoms persist.');

    // Navigate to Step 3
    await page.click('button:has-text("Next")');

    // Click Get AI Recommendation
    await page.click('button >> text=/Get AI Recommendation|Obter Recomendação de IA/i');
    
    // Navigate to Step 4
    await page.click('button:has-text("Next")');

    // Wait for AI recommendation result
    await page.waitForSelector('text="Use AI Diagnosis"', { timeout: 15000 });

    // Finalize Diagnosis and Prescribe
    await page.fill('textarea[name="finalDiagnosis"]', 'Common Cold');
    await page.fill('textarea[name="finalPrescription"]', 'Paracetamol 500mg, Rest');

    // Complete Consultation
    await page.click('button >> text=/Finalize Consultation|Finalizar Consulta/i');
    // Modal outcome selection
    await page.click('button >> text=/Send Home|Mandar para Casa/i');

    // Wait for success toast
    await expect(page.locator('.text-sm.font-semibold').filter({ hasText: /Consultation Finished|Consulta Terminada/i }).first()).toBeVisible({ timeout: 10000 });
  });
});
