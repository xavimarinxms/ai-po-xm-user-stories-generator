/**
 * csvExport.ts
 * Converts generated user stories to a downloadable CSV file.
 */

import type { Story } from '@/types';
import { storyToClassic, storyToGherkin } from './storyTemplates';

const escapeCell = (str: unknown): string => {
  if (str == null) return '';
  const s = String(str);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const row = (cells: unknown[]): string => cells.map(escapeCell).join(',');

export function storiesToCSV(stories: Story[], featureTitle = ''): string {
  const headers = [
    'Story #', 'Feature', 'Title', 'Priority',
    'Persona', 'I want to', 'So that',
    'Acceptance Criteria', 'Gherkin',
  ];

  const lines = [row(headers)];

  for (const story of stories) {
    lines.push(
      row([
        story.index,
        featureTitle,
        story.title,
        story.priority,
        story.classic.persona,
        story.classic.want,
        story.classic.soThat,
        story.acceptanceCriteria.join(' | '),
        storyToGherkin(story),
      ])
    );
  }

  return lines.join('\n');
}

export function downloadCSV(stories: Story[], featureTitle: string): void {
  const csv = storiesToCSV(stories, featureTitle);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const slug = featureTitle
    ? featureTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : 'user-stories';
  link.download = `${slug}-user-stories.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
