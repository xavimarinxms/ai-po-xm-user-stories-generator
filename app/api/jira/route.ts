/**
 * app/api/jira/route.ts
 * Server-side proxy to Jira REST API v3.
 * Keeps credentials out of the browser and avoids CORS issues.
 */

import type { NextRequest } from 'next/server';
import type { JiraConfig, JiraStoryPayload } from '@/types';

interface RequestBody extends JiraConfig {
  story: JiraStoryPayload;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { domain, email, apiToken, projectKey, story } = body;

    if (!domain || !email || !apiToken || !projectKey || !story) {
      return Response.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const adfDoc = buildADF(story);

    const jiraPayload = {
      fields: {
        project: { key: projectKey },
        summary: story.title,
        issuetype: { name: 'Story' },
        description: adfDoc,
      },
    };

    const credentials = Buffer.from(`${email}:${apiToken}`).toString('base64');
    const jiraUrl = `https://${domain}/rest/api/3/issue`;

    const jiraRes = await fetch(jiraUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(jiraPayload),
    });

    const jiraData = await jiraRes.json();

    if (!jiraRes.ok) {
      const errorMessages = jiraData?.errors
        ? Object.values(jiraData.errors).join('. ')
        : jiraData?.errorMessages?.join('. ') || 'Unknown Jira error';
      return Response.json({ error: errorMessages }, { status: jiraRes.status });
    }

    const issueKey: string = jiraData.key;
    const issueUrl = `https://${domain}/browse/${issueKey}`;

    return Response.json({ key: issueKey, url: issueUrl });
  } catch (err) {
    console.error('[Jira API route]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── ADF builder ─────────────────────────────────────────────────────────────

type AdfNode =
  | { type: 'paragraph'; content: { type: 'text'; text: string }[] }
  | { type: 'heading'; attrs: { level: number }; content: { type: 'text'; text: string }[] }
  | { type: 'bulletList'; content: { type: 'listItem'; content: { type: 'paragraph'; content: { type: 'text'; text: string }[] }[] }[] }
  | { type: 'codeBlock'; attrs: { language: string }; content: { type: 'text'; text: string }[] };

const adfParagraph = (text: string): AdfNode => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
});

const adfHeading = (text: string, level = 3): AdfNode => ({
  type: 'heading',
  attrs: { level },
  content: [{ type: 'text', text }],
});

const adfBulletList = (items: string[]): AdfNode => ({
  type: 'bulletList',
  content: items.map((item) => ({
    type: 'listItem',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
  })),
});

const adfCodeBlock = (text: string): AdfNode => ({
  type: 'codeBlock',
  attrs: { language: 'gherkin' },
  content: [{ type: 'text', text }],
});

function buildADF(story: JiraStoryPayload) {
  return {
    version: 1,
    type: 'doc',
    content: [
      adfHeading('User Story', 3),
      adfParagraph(`As a ${story.persona}, I want to ${story.want}, so that ${story.soThat}.`),
      adfHeading('Acceptance Criteria', 3),
      adfBulletList(story.acceptanceCriteria),
      adfHeading('Gherkin Scenarios', 3),
      adfCodeBlock(story.gherkinText),
    ],
  };
}
