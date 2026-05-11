import React from 'react';
import { getDocBySlug } from '@/lib/docs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ChevronLeft, Calendar, User, Share2 } from 'lucide-react';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DocViewPage({ params }: PageProps) {
  const { slug } = await params;
  const content = getDocBySlug(slug);

  if (!content) {
    notFound();
  }

  const title = slug
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 md:p-12">
        <Link 
          href="/docs" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Documentation Center
        </Link>

        <article className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <header className="p-8 md:p-12 border-b border-slate-50 bg-slate-50/50">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
              {title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: May 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Clinical Informatics Office</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          <div className="p-8 md:p-12 prose prose-slate prose-teal max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-teal-600 prose-img:rounded-3xl prose-table:border prose-table:border-slate-100 prose-th:bg-slate-50 prose-th:p-4 prose-td:p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </article>

        <div className="mt-12 flex items-center justify-between text-slate-400 text-xs uppercase tracking-widest font-bold px-4">
          <span>Digital Transformation Initiative</span>
          <span>HealthFlow v1.08-Alpha</span>
        </div>
      </div>
    </div>
  );
}
