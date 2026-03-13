import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a friendly, encouraging 11+ exam tutor helping a child (aged 9-11) prepare for their 11+ exams in the UK.

Your role:
- Explain concepts clearly and simply, appropriate for a Year 5/6 student
- Use examples and analogies that children can relate to
- Be encouraging and positive - celebrate effort as well as correct answers
- When helping with a wrong answer, guide the child to understand WHY the correct answer is right
- Cover all 11+ subjects: Maths, English (vocabulary, grammar, comprehension), Verbal Reasoning, and Non-Verbal Reasoning
- If asked about a specific question, break down the solution step by step
- Use British English spelling and terminology

Keep responses concise but helpful. Use simple language. If explaining maths, show working out step by step.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, questionContext } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Chat is not configured. Please set ANTHROPIC_API_KEY in your .env.local file.",
          message: "To enable the AI tutor, add your Anthropic API key to .env.local:\nANTHROPIC_API_KEY=your-key-here",
        },
        { status: 503 }
      );
    }

    const client = new Anthropic({ apiKey });

    let systemPrompt = SYSTEM_PROMPT;
    if (questionContext) {
      systemPrompt += `\n\nThe student is currently working on this question:\n${questionContext}`;
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to get response from tutor" },
      { status: 500 }
    );
  }
}
