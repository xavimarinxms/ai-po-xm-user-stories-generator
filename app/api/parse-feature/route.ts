/**
 * app/api/parse-feature/route.ts
 * Calls Groq (Llama 3.1 8B) to extract structured fields from free-text input.
 * Returns: { featureTitle, persona, mainGoal, benefit, context }
 */

import Groq from 'groq-sdk';
import type { NextRequest } from 'next/server';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Llama sometimes returns raw, unescaped control characters (literal
 * newlines, tabs) inside JSON string values instead of \n / \t. That's
 * invalid JSON and makes JSON.parse throw "Bad control character in
 * string literal". This escapes control characters that appear *inside*
 * string literals only, leaving the JSON structure (outside strings)
 * untouched.
 */
function safeJsonParse<T>(text: string): T {
  let inString = false;
  let escaped = false;
  let result = '';
  for (const ch of text) {
    if (inString) {
      if (escaped) {
        result += ch;
        escaped = false;
      } else if (ch === '\\') {
        result += ch;
        escaped = true;
      } else if (ch === '"') {
        result += ch;
        inString = false;
      } else if (ch === '\n') {
        result += '\\n';
      } else if (ch === '\r') {
        result += '\\r';
      } else if (ch === '\t') {
        result += '\\t';
      } else if (ch.charCodeAt(0) < 0x20) {
        // Drop other stray control characters.
      } else {
        result += ch;
      }
    } else {
      result += ch;
      if (ch === '"') inString = true;
    }
  }
  return JSON.parse(result) as T;
}

const SYSTEM_PROMPT = `You are a Product Owner assistant.
Given a free-text description of a software feature, extract the following fields and return ONLY valid JSON — no markdown, no explanation, just the JSON object.

Fields to extract:
- featureTitle: short name for the feature (3-6 words, title case)
- persona: the type of user who benefits (e.g. "registered user", "admin", "guest")
- mainGoal: what the user wants to do (start with a verb, no "I want to" prefix)
- benefit: the reason/outcome (no "so that" prefix)
- context: any additional details or constraints mentioned (can be empty string)

Rules:
- If a field cannot be inferred, use a sensible default based on context
- Keep mainGoal and benefit concise (max 15 words each)
- Return ONLY the JSON object, nothing else`;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return Response.json(
        { error: 'Please provide a feature description of at least 10 characters.' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: 'GROQ_API_KEY is not configured. Add it to your .env.local file.' },
        { status: 500 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Feature description: "${text.trim()}"` },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '';

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: 'Could not parse AI response. Please try again or fill the fields manually.' },
        { status: 500 }
      );
    }

    const parsed = safeJsonParse<Record<string, unknown>>(jsonMatch[0]);

    const required = ['featureTitle', 'persona', 'mainGoal', 'benefit'];
    for (const field of required) {
      if (!parsed[field]) parsed[field] = '';
    }
    if (!parsed.context) parsed.context = '';

    return Response.json(parsed);
  } catch (err) {
    console.error('[parse-feature route]', err);
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
