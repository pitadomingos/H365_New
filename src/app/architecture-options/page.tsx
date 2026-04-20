
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Server, Share2, CheckCircle2, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { MicroservicesDiagram } from "@/components/diagrams/microservices-diagram";
import { MonolithicDiagram } from "@/components/diagrams/monolithic-diagram";
import { useLocale } from "@/context/locale-context";
import { getTranslator } from "@/lib/i18n";

export default function ArchitectureOptionsPage() {
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Network className="h-8 w-8" /> {t('architectureOptions.pageTitle')}
        </h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t('architectureOptions.intro.title')}</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            {t('architectureOptions.intro.content')}
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>{t('architectureOptions.intro.isSaaSTitle')}</strong> {t('architectureOptions.intro.isSaaSContent')}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Server className="h-6 w-6" /> {t('architectureOptions.monolithic.title')}</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h4>{t('architectureOptions.monolithic.descriptionH365Title')}</h4>
          <p>
            {t('architectureOptions.monolithic.descriptionH365Content1')}
          </p>
          <p>
            {t('architectureOptions.monolithic.descriptionH365Content2')}
          </p>

          <MonolithicDiagram />

          <h4>{t('architectureOptions.monolithic.pros.title')}</h4>
          <ul>
            <li>{t('architectureOptions.monolithic.pros.item1')}</li>
            <li>{t('architectureOptions.monolithic.pros.item2')}</li>
            <li>{t('architectureOptions.monolithic.pros.item3')}</li>
            <li>{t('architectureOptions.monolithic.pros.item4')}</li>
            <li>{t('architectureOptions.monolithic.pros.item5')}</li>
          </ul>

          <h4>{t('architectureOptions.monolithic.cons.title')}</h4>
          <ul>
            <li>{t('architectureOptions.monolithic.cons.item1')}</li>
            <li>{t('architectureOptions.monolithic.cons.item2')}</li>
            <li>{t('architectureOptions.monolithic.cons.item3')}</li>
            <li>{t('architectureOptions.monolithic.cons.item4')}</li>
            <li>{t('architectureOptions.monolithic.cons.item5')}</li>
            <li>{t('architectureOptions.monolithic.cons.item6')}</li>
          </ul>
        </CardContent>
      </Card>

      <Separator className="my-4" />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><Share2 className="h-6 w-6" /> {t('architectureOptions.microservices.title')}</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h4>{t('architectureOptions.microservices.descriptionH365Title')}</h4>
          <p>
            {t('architectureOptions.microservices.descriptionH365Content1')}
          </p>
          <ul>
            <li>{t('architectureOptions.microservices.descriptionH365Service1')}</li>
            <li>{t('architectureOptions.microservices.descriptionH365Service2')}</li>
            <li>{t('architectureOptions.microservices.descriptionH365Service3')}</li>
            <li>{t('architectureOptions.microservices.descriptionH365Service4')}</li>
            <li>{t('architectureOptions.microservices.descriptionH365Service5')}</li>
            <li>{t('architectureOptions.microservices.descriptionH365Service6')}</li>
            <li>{t('architectureOptions.microservices.descriptionH365Service7')}</li>
            <li>{t('architectureOptions.microservices.descriptionH365Service8')}</li>
            <li>{t('architectureOptions.microservices.descriptionH365Service9')}</li>
            <li>{t('architectureOptions.microservices.descriptionH365Service10')}</li>
            <li><em>{t('architectureOptions.microservices.descriptionH365Service11')}</em></li>
          </ul>
          <p>
            {t('architectureOptions.microservices.descriptionH365Content2')}
          </p>
          
          <MicroservicesDiagram />

          <h4>{t('architectureOptions.microservices.pros.title')}</h4>
          <ul>
            <li>{t('architectureOptions.microservices.pros.item1')}</li>
            <li>{t('architectureOptions.microservices.pros.item2')}</li>
            <li>{t('architectureOptions.microservices.pros.item3')}</li>
            <li>{t('architectureOptions.microservices.pros.item4')}</li>
            <li>{t('architectureOptions.microservices.pros.item5')}</li>
            <li>{t('architectureOptions.microservices.pros.item6')}</li>
          </ul>

          <h4>{t('architectureOptions.microservices.cons.title')}</h4>
          <ul>
            <li>{t('architectureOptions.microservices.cons.item1')}</li>
            <li>{t('architectureOptions.microservices.cons.item2')}</li>
            <li>{t('architectureOptions.microservices.cons.item3')}</li>
            <li>{t('architectureOptions.microservices.cons.item4')}</li>
            <li>{t('architectureOptions.microservices.cons.item5')}</li>
            <li>{t('architectureOptions.microservices.cons.item6')}</li>
            <li>{t('architectureOptions.microservices.cons.item7')}</li>
          </ul>

          <h4>{t('architectureOptions.microservices.whenToConsiderTitle')}</h4>
          <p>
            {t('architectureOptions.microservices.whenToConsiderContent')}
          </p>
        </CardContent>
      </Card>

      <Separator className="my-4" />

      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" /> {t('architectureOptions.hybrid.title')}
          </CardTitle>
          <CardDescription>Optimized for low-bandwidth and intermittent connectivity regions.</CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>{t('architectureOptions.hybrid.description')}</p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" /> {t('architectureOptions.hybrid.pros.title')}
              </h4>
              <ul className="text-sm">
                <li>{t('architectureOptions.hybrid.pros.item1')}</li>
                <li>{t('architectureOptions.hybrid.pros.item2')}</li>
                <li>{t('architectureOptions.hybrid.pros.item3')}</li>
              </ul>
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-amber-600">
                <Info className="h-4 w-4" /> {t('architectureOptions.hybrid.cons.title')}
              </h4>
              <ul className="text-sm">
                <li>{t('architectureOptions.hybrid.cons.item1')}</li>
                <li>{t('architectureOptions.hybrid.cons.item2')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t('architectureOptions.recommendation.title')}</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            {t('architectureOptions.recommendation.content1')}
          </p>
          <ol>
            <li>
              {t('architectureOptions.recommendation.step1')}
            </li>
            <li>
              {t('architectureOptions.recommendation.step2')}
            </li>
            <li>
              {t('architectureOptions.recommendation.step3')}
            </li>
          </ol>
          <p>
            {t('architectureOptions.recommendation.content2')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    