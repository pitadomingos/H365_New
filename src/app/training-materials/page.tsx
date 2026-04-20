
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenCheck } from "lucide-react";

export default function TrainingMaterialsPage() {
  return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BookOpenCheck className="h-8 w-8" /> Training Materials
          </h1>
        </div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>H365 Training Resources</CardTitle>
            <CardDescription>Resources to help users learn and effectively use the H365 system.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Feature under development. This section will provide access to various training materials, including tutorial videos, interactive guides, presentations, and quick reference sheets for all user roles.</p>
            <h3 className="mt-4 font-semibold text-lg">Potential Materials:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2 text-sm">
              <li>Role-based video tutorials (e.g., &quot;Patient Registration for Receptionists&quot;, &quot;Using the Consultation Form for Doctors&quot;).</li>
              <li>Interactive simulations of key workflows.</li>
              <li>Downloadable PDF quick start guides.</li>
              <li>Presentation slides for group training sessions.</li>
              <li>FAQ for common training questions.</li>
              <li>Glossary of terms used in H365.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
  );
}
      