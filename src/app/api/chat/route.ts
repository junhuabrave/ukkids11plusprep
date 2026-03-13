import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

function buildSystemPrompt(childName?: string, childAge?: number): string {
  const age = childAge || 10;
  const name = childName || "the student";
  const yearGroup = age <= 8 ? "Year 4" : age === 9 ? "Year 5" : age === 10 ? "Year 6" : "Year 7";

  return `You are a friendly, encouraging 11+ exam tutor helping ${name ? name : "a child"} (aged ${age}, ${yearGroup}) prepare for their 11+ exams in the UK.

Your role:
- Explain concepts clearly and simply, appropriate for a ${age}-year-old (${yearGroup}) student
- Use examples and analogies that a ${age}-year-old can relate to
- Be encouraging and positive - celebrate effort as well as correct answers
- When helping with a wrong answer, guide ${name} to understand WHY the correct answer is right
- Cover all 11+ subjects: Maths, English (vocabulary, grammar, comprehension), Verbal Reasoning, and Non-Verbal Reasoning
- If asked about a specific question, break down the solution step by step
- Use British English spelling and terminology
${name && name !== "the student" ? `- Address the child as ${name}` : ""}

Keep responses concise but helpful. Use simple language appropriate for age ${age}. If explaining maths, show working out step by step.`;
}

type Provider = "anthropic" | "openai";

function getProvider(): { provider: Provider; apiKey: string } | null {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey && anthropicKey !== "your-api-key-here") {
    return { provider: "anthropic", apiKey: anthropicKey };
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && openaiKey !== "your-api-key-here") {
    return { provider: "openai", apiKey: openaiKey };
  }

  return null;
}

async function chatWithAnthropic(
  apiKey: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

async function chatWithOpenAI(
  apiKey: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
  });

  return response.choices[0]?.message?.content || "";
}

export async function POST(request: NextRequest) {
  try {
    const { messages, questionContext, childName, childAge } = await request.json();

    const config = getProvider();
    if (!config) {
      return NextResponse.json(
        {
          error: "Chat is not configured.",
          message:
            "To enable the AI tutor, add one of these to your .env.local file:\n\nANTHROPIC_API_KEY=your-key-here\n  or\nOPENAI_API_KEY=your-key-here",
        },
        { status: 503 }
      );
    }

    let systemPrompt = buildSystemPrompt(childName, childAge);
    if (questionContext) {
      systemPrompt += `\n\nThe student is currently working on this question:\n${questionContext}`;
    }

    let text: string;
    if (config.provider === "anthropic") {
      text = await chatWithAnthropic(config.apiKey, systemPrompt, messages);
    } else {
      text = await chatWithOpenAI(config.apiKey, systemPrompt, messages);
    }

    return NextResponse.json({ message: text, provider: config.provider });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to get response from tutor" },
      { status: 500 }
    );
  }
}
