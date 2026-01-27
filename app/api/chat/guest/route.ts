import { NextResponse } from "next/server";

export const runtime = "nodejs";

type GuestChatPayload = {
  message?: string;
  guestId?: string;
};

type WebhookResponse =
  | {
      reply?: string;
      response?: string;
      text?: string;
      error?: string;
    }
  | null;

const parseWebhookResponse = (raw: string): WebhookResponse => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as WebhookResponse;
  } catch {
    return null;
  }
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GuestChatPayload;
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Guest chat is not configured." },
        { status: 500 },
      );
    }

    const threadId = body.guestId?.trim()
      ? `guest-${body.guestId.trim()}`
      : "guest-anon";

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.MAKE_WEBHOOK_API_KEY
          ? { "x-make-apikey": process.env.MAKE_WEBHOOK_API_KEY }
          : {}),
      },
      body: JSON.stringify({
        message,
        threadId,
        user: {
          id: threadId,
          email: "",
          name: "Guest",
        },
      }),
    });

    const raw = await webhookResponse.text();
    const parsed = parseWebhookResponse(raw);

    if (!webhookResponse.ok) {
      return NextResponse.json(
        { error: parsed?.error || "Unable to get AI response." },
        { status: webhookResponse.status },
      );
    }

    const assistantText =
      parsed?.reply ||
      parsed?.response ||
      parsed?.text ||
      raw ||
      "Thanks for the context. How can I help next?";

    return NextResponse.json({ reply: assistantText });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to send guest chat message",
        details: String(error),
      },
      { status: 500 },
    );
  }
}

