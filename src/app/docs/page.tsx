import React from 'react';
import Link from 'next/link';
import { getDocsList } from '@/lib/docs';
import { 
  Book, 
  FileText, 
  ChevronRight, 
  Settings, 
  ShieldCheck, 
  Network, 
  Zap,
  Globe
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function DocsPage() {
  const docs = getDocsList();

  const getIcon = (slug: string) => {
    if (slug.includes('security')) return <ShieldCheck className="w-5 h-5 text-red-500" />;
    if (slug.includes('interoperability')) return <Network className="w-5 h-5 text-blue-500" />;
    if (slug.includes('architecture') || slug.includes('blueprint')) return <Settings className="w-5 h-5 text-slate-500" />;
    if (slug.includes('offline')) return <Zap className="w-5 h-5 text-amber-500" />;
    if (slug.includes('api')) return <Globe className="w-5 h-5 text-teal-500" />;
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-teal-600 mb-2">
          <Book className="w-6 h-6" />
          <span className="font-bold tracking-widest uppercase text-sm">Documentation Center</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Technical Documentation</h1>
        <p className="text-slate-500 max-w-2xl">
          Comprehensive guides and architectural deep-dives for the HealthFlow Public Hospital Digital SaaS Platform.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc) => (
          <Link key={doc.slug} href={`/docs/${doc.slug}`}>
            <Card className="hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group h-full">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-teal-50 transition-colors">
                  {getIcon(doc.slug)}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg font-bold group-hover:text-teal-700 transition-colors">
                  {doc.title}
                </CardTitle>
                <CardDescription className="mt-1">
                  Technical specifications and deployment guidelines for {doc.slug.replace(/_/g, ' ')}.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <footer className="pt-8 border-t border-slate-100 italic text-slate-400 text-sm text-center">
        Authored by Ministry of Health Digital Transformation Office & Clinical Informatics Team
      </footer>
    </div>
  );
}
