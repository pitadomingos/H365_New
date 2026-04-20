
"use client"; 

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Languages } from "lucide-react";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from '@/lib/i18n';
import { FrontendArchitectureDiagram } from "@/components/diagrams/frontend-architecture-diagram";


export default function TechnicalOverviewPage() {
  const { currentLocale } = useLocale(); // Removed toggleLocale as global toggle is in AppShell
  const t = getTranslator(currentLocale);

  const renderListItem = (titleKey: string, descKey: string) => (
    <li className="mb-3">
      <strong className="text-primary/90">{t(titleKey)}:</strong>
      <p className="text-base text-muted-foreground mt-0.5 ml-1">{t(descKey)}</p>
    </li>
  );

  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Info className="h-8 w-8" /> {t('techOverview.pageTitle')}
          </h1>
          {/* Global Language Toggle is in AppShell header */}
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{t('techOverview.section1.title')}</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-base">
              {t('techOverview.section1.content')}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{t('techOverview.section2.title')}</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <ul className="list-none p-0">
              {renderListItem('techOverview.section2.itemFrontend.title', 'techOverview.section2.itemFrontend.desc')}
              {renderListItem('techOverview.section2.itemUI.title', 'techOverview.section2.itemUI.desc')}
              {renderListItem('techOverview.section2.itemStyling.title', 'techOverview.section2.itemStyling.desc')}
              {renderListItem('techOverview.section2.itemAI.title', 'techOverview.section2.itemAI.desc')}
              {renderListItem('techOverview.section2.itemState.title', 'techOverview.section2.itemState.desc')}
              {renderListItem('techOverview.section2.itemDeployment.title', 'techOverview.section2.itemDeployment.desc')}
              {renderListItem('techOverview.section2.itemPWA.title', 'techOverview.section2.itemPWA.desc')}
              {renderListItem('techOverview.section2.itemLocalNode.title', 'techOverview.section2.itemLocalNode.desc')}
            </ul>
             <h4 className="font-semibold text-lg mt-6 mb-2">{t('techOverview.section2.subsectionFrontendArch.title')}</h4>
             <p className="text-base text-muted-foreground">{t('techOverview.section2.subsectionFrontendArch.desc')}</p>
            <FrontendArchitectureDiagram />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{t('techOverview.section3.title')}</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-4">
            <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionDashboard.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionDashboard.itemOverview.title', 'techOverview.section3.subsectionDashboard.itemOverview.desc')}
                {renderListItem('techOverview.section3.subsectionDashboard.itemSummaryCards.title', 'techOverview.section3.subsectionDashboard.itemSummaryCards.desc')}
                {renderListItem('techOverview.section3.subsectionDashboard.itemQuickActions.title', 'techOverview.section3.subsectionDashboard.itemQuickActions.desc')}
                {renderListItem('techOverview.section3.subsectionDashboard.itemVisualAnalytics.title', 'techOverview.section3.subsectionDashboard.itemVisualAnalytics.desc')}
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionPatientReg.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionPatientReg.itemIndividualBulk.title', 'techOverview.section3.subsectionPatientReg.itemIndividualBulk.desc')}
                {renderListItem('techOverview.section3.subsectionPatientReg.itemPhotoCapture.title', 'techOverview.section3.subsectionPatientReg.itemPhotoCapture.desc')}
              </ul>
            </section>
             <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionVisitingPatients.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionVisitingPatients.itemSearchModal.title', 'techOverview.section3.subsectionVisitingPatients.itemSearchModal.desc')}
                {renderListItem('techOverview.section3.subsectionVisitingPatients.itemVisitEntry.title', 'techOverview.section3.subsectionVisitingPatients.itemVisitEntry.desc')}
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionAppointments.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionAppointments.itemSchedulingListCalendar.title', 'techOverview.section3.subsectionAppointments.itemSchedulingListCalendar.desc')}
                {renderListItem('techOverview.section3.subsectionAppointments.itemNotifications.title', 'techOverview.section3.subsectionAppointments.itemNotifications.desc')}
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionConsultation.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionConsultation.itemLayout.title', 'techOverview.section3.subsectionConsultation.itemLayout.desc')}
                {renderListItem('techOverview.section3.subsectionConsultation.itemVitalsSymptomsAI.title', 'techOverview.section3.subsectionConsultation.itemVitalsSymptomsAI.desc')}
                {renderListItem('techOverview.section3.subsectionConsultation.itemOrders.title', 'techOverview.section3.subsectionConsultation.itemOrders.desc')}
              </ul>
            </section>
             <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionSpecializations.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionSpecializations.itemTailoredConsult.title', 'techOverview.section3.subsectionSpecializations.itemTailoredConsult.desc')}
              </ul>
            </section>
             <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionMaternity.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionMaternity.itemFeatures.title', 'techOverview.section3.subsectionMaternity.itemFeatures.desc')}
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionWard.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionWard.itemFeatures.title', 'techOverview.section3.subsectionWard.itemFeatures.desc')}
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionLab.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionLab.itemFeatures.title', 'techOverview.section3.subsectionLab.itemFeatures.desc')}
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionImaging.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionImaging.itemFeatures.title', 'techOverview.section3.subsectionImaging.itemFeatures.desc')}
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionPharmacy.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionPharmacy.itemFeatures.title', 'techOverview.section3.subsectionPharmacy.itemFeatures.desc')}
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionER.title')}</h4>
              <ul className="list-none p-0">
                 {renderListItem('techOverview.section3.subsectionER.itemFeatures.title', 'techOverview.section3.subsectionER.itemFeatures.desc')}
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionEpidemic.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionEpidemic.itemFeatures.title', 'techOverview.section3.subsectionEpidemic.itemFeatures.desc')}
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionCampaigns.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionCampaigns.itemFeatures.title', 'techOverview.section3.subsectionCampaigns.itemFeatures.desc')}
              </ul>
            </section>
            <section>
              <h4 className="font-semibold text-lg">{t('techOverview.section3.subsectionReporting.title')}</h4>
              <ul className="list-none p-0">
                {renderListItem('techOverview.section3.subsectionReporting.itemFeatures.title', 'techOverview.section3.subsectionReporting.itemFeatures.desc')}
              </ul>
            </section>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{t('techOverview.section4.title')}</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <ul className="list-none p-0">
              {renderListItem('techOverview.section4.itemPrimaryColor.title', 'techOverview.section4.itemPrimaryColor.desc')}
              {renderListItem('techOverview.section4.itemSecondaryColors.title', 'techOverview.section4.itemSecondaryColors.desc')}
              {renderListItem('techOverview.section4.itemAccentColor.title', 'techOverview.section4.itemAccentColor.desc')}
              {renderListItem('techOverview.section4.itemTypography.title', 'techOverview.section4.itemTypography.desc')}
              {renderListItem('techOverview.section4.itemLayout.title', 'techOverview.section4.itemLayout.desc')}
              {renderListItem('techOverview.section4.itemTheme.title', 'techOverview.section4.itemTheme.desc')}
              {renderListItem('techOverview.section4.itemIcons.title', 'techOverview.section4.itemIcons.desc')}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{t('techOverview.section5.title')}</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <ul className="list-none p-0">
              {renderListItem('techOverview.section5.itemBackend.title', 'techOverview.section5.itemBackend.desc')}
              {renderListItem('techOverview.section5.itemRealtime.title', 'techOverview.section5.itemRealtime.desc')}
              {renderListItem('techOverview.section5.itemHL7FHIR.title', 'techOverview.section5.itemHL7FHIR.desc')}
              {renderListItem('techOverview.section5.itemInstrumentIntegration.title', 'techOverview.section5.itemInstrumentIntegration.desc')}
              {renderListItem('techOverview.section5.itemBiomedicalEngineering.title', 'techOverview.section5.itemBiomedicalEngineering.desc')}
              {renderListItem('techOverview.section5.itemAdvancedReporting.title', 'techOverview.section5.itemAdvancedReporting.desc')}
              {renderListItem('techOverview.section5.itemCampaignManagement.title', 'techOverview.section5.itemCampaignManagement.desc')}
              {renderListItem('techOverview.section5.itemWarehouseManagement.title', 'techOverview.section5.itemWarehouseManagement.desc')}
              {renderListItem('techOverview.section5.itemSecurityCompliance.title', 'techOverview.section5.itemSecurityCompliance.desc')}
              {renderListItem('techOverview.section5.itemUserRoles.title', 'techOverview.section5.itemUserRoles.desc')}
              {renderListItem('techOverview.section5.itemOffline.title', 'techOverview.section5.itemOffline.desc')}
              {renderListItem('techOverview.section5.itemI18nFull.title', 'techOverview.section5.itemI18nFull.desc')}
              {renderListItem('techOverview.section5.itemPatientPortal.title', 'techOverview.section5.itemPatientPortal.desc')}
              {renderListItem('techOverview.section5.itemMedicationAdherence.title', 'techOverview.section5.itemMedicationAdherence.desc')}
              {renderListItem('techOverview.section5.itemBilling.title', 'techOverview.section5.itemBilling.desc')}
              {renderListItem('techOverview.section5.itemTelemedicine.title', 'techOverview.section5.itemTelemedicine.desc')}
              {renderListItem('techOverview.section5.itemAdvancedAnalyticsBI.title', 'techOverview.section5.itemAdvancedAnalyticsBI.desc')}
              {renderListItem('techOverview.section5.itemBloodBank.title', 'techOverview.section5.itemBloodBank.desc')}
            </ul>
          </CardContent>
        </Card>
      </div>
  );
}
