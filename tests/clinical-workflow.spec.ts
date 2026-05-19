import { test, expect } from '@playwright/test';

test.describe('H365 Core Clinical Workflow', () => {

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
    // Wait for calendar popover and click a day button containing the text "15"
    await page.locator('button:has-text("15")').last().click({ force: true });

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
    await expect(page.locator('.text-sm.font-semibold').filter({ hasText: /Registration Complete|Registo Concluído/i }).first()).toBeVisible({ timeout: 10000 });

    // 3. Navigate to Consultation Room
    await page.goto('/treatment-recommendation');
    
    // Select the first patient from the mock waiting list
    const firstPatient = page.locator('ul.space-y-3 > li').first();
    await expect(firstPatient).toBeVisible();
    await firstPatient.click();

    // 4. Fill out Consultation Form
    await page.fill('input[name="bodyTemperature"]', '37.2');
    await page.fill('input[name="weight"]', '75');
    await page.fill('input[name="height"]', '180');
    await page.fill('input[name="bloodPressure"]', '120/80');

    await page.fill('textarea[name="symptoms"]', 'Patient complains of mild headache and fever for 2 days.');

    // Click Get AI Recommendation
    await page.click('button >> text=/Get AI Recommendation|Obter Recomendação de IA/i');
    
    // Wait for the recommendation to appear (mock AI usually takes ~1-3s)
    await page.waitForSelector('button >> text=/Accept Suggestion|Aceitar Sugestão/i', { state: 'visible', timeout: 8000 });

    // Accept AI suggestion
    await page.click('button >> text=/Accept Suggestion|Aceitar Sugestão/i');

    // Order Lab Tests
    await page.click('button >> text=/Add Diagnostics|Adicionar Diagnósticos/i');
    // Select Malaria from the dialog
    await page.click('div[role="menuitemcheckbox"] >> text=/Malaria/i', { timeout: 2000 }).catch(() => null); // It might be a different structure, so try/catch or just optional
    // Try clicking close or clicking outside to close dialog if it's a popover/dropdown
    await page.keyboard.press('Escape');

    // Provide Doctor Comments
    await page.fill('textarea[name="doctorComments"]', 'Prescribed paracetamol. Follow up in 3 days if symptoms persist.');

    // Save/Complete Consultation
    await page.click('button[type="submit"] >> text=/Save & Complete|Guardar e Concluir/i');

    // Wait for success toast
    await expect(page.locator('.text-sm.font-semibold').filter({ hasText: /Consultation Saved|Consulta Guardada/i }).first()).toBeVisible({ timeout: 10000 });
  });
});
