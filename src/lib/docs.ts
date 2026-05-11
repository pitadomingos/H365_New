import fs from 'fs';
import path from 'path';

const docsDirectory = path.join(process.cwd(), 'docs');

export interface DocMetadata {
  slug: string;
  title: string;
  fileName: string;
}

export function getDocsList(): DocMetadata[] {
  if (!fs.existsSync(docsDirectory)) return [];
  
  const fileNames = fs.readdirSync(docsDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      // Simplistic title generation from slug
      const title = slug
        .split(/[_-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        slug,
        title,
        fileName
      };
    });
}

export function getDocBySlug(slug: string): string | null {
  const fullPath = path.join(docsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;
  
  return fs.readFileSync(fullPath, 'utf8');
}
