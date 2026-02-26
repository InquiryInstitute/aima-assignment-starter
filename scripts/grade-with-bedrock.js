#!/usr/bin/env node
/**
 * Grade AIMA exercise answers using AWS Bedrock.
 * Run in GitHub Actions; requires AWS credentials via secrets.
 *
 * Usage: node scripts/grade-with-bedrock.js [exercise-path]
 * Example: node scripts/grade-with-bedrock.js exercises/ch01/ex_1.md
 *
 * Exit: 0 = pass, 1 = fail
 */

import fs from 'fs';

const EXERCISE_PATH = process.argv[2] || 'exercises/ch01/ex_1.md';
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';
const REGION = process.env.AWS_REGION || 'us-east-1';

const RUBRICS = {
  'exercises/ch01/ex_1.md': {
    question: 'Define in your own words: (a) intelligence, (b) artificial intelligence, (c) agent, (d) rationality, (e) logical reasoning.',
    rubric: 'Each definition should be in the student\'s own words, show understanding of the AIMA textbook concepts, and be substantive (not one word). Pass if at least 4 of 5 definitions are adequate.',
  },
};

async function invokeBedrock(prompt) {
  const { BedrockRuntimeClient, InvokeModelCommand } = await import(
    '@aws-sdk/client-bedrock-runtime'
  );
  const client = new BedrockRuntimeClient({ region: REGION });
  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 500,
    messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
  });
  const response = await client.send(
    new InvokeModelCommand({
      contentType: 'application/json',
      body,
      modelId: MODEL_ID,
    })
  );
  const decoded = new TextDecoder().decode(response.body);
  const parsed = JSON.parse(decoded);
  const text = parsed.content?.[0]?.text || '';
  return text.trim();
}

function extractAnswer(content) {
  const match = content.match(/\*\*Answer:\*\*\s*([\s\S]*?)(?=\n#|\n\*\*|\z)/i) ||
    content.match(/<!-- Write your answer below -->\s*([\s\S]*?)(?=\n<!--|\z)/i) ||
    content.match(/\*\*Answer:\*\*\s*([\s\S]*)/i);
  return (match ? match[1].trim() : content).replace(/<!--[\s\S]*?-->/g, '').trim();
}

async function main() {
  if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_SESSION_TOKEN) {
    console.error('AWS credentials required. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and optionally AWS_REGION.');
    process.exit(1);
  }

  const rubric = RUBRICS[EXERCISE_PATH];
  if (!rubric) {
    console.error('No rubric for', EXERCISE_PATH);
    process.exit(1);
  }

  let content;
  try {
    content = fs.readFileSync(EXERCISE_PATH, 'utf8');
  } catch (e) {
    console.error('File not found:', EXERCISE_PATH);
    process.exit(1);
  }

  const answer = extractAnswer(content);
  if (!answer || answer.length < 20) {
    console.error('Answer too short or empty. Please write a substantive response.');
    process.exit(1);
  }

  const prompt = `You are grading an AIMA (Artificial Intelligence: A Modern Approach) exercise.

Question: ${rubric.question}

Rubric: ${rubric.rubric}

Student's answer:
---
${answer}
---

Respond with exactly one line in this format:
PASS: <brief reason>
or
FAIL: <brief reason>`;
  const result = invokeBedrock(prompt).catch((e) => {
    console.error('Bedrock error:', e.message);
    process.exit(1);
  });

  const response = await result;
  const passed = /^PASS:/i.test(response);
  console.log(response);
  process.exit(passed ? 0 : 1);
}

main();
