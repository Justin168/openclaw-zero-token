import type { StreamFn } from "@mariozechner/pi-agent-core";
import {
  createAssistantMessageEventStream,
  type AssistantMessage,
  type TextContent,
  type ToolCall,
  type ToolResultMessage,
} from "@mariozechner/pi-ai";
import { ManusApiClient } from "../providers/manus-api-client.js";
import { buildXmlToolPromptSection, getXmlToolReminder } from "./xml-tool-prompt.js";

const conversationMap = new Map<string, string>();

function parseToolCallsFromFullText(
  text: string,
  emit: (type: "text" | "toolcall" | "toolcall_end", payload: string, toolId?: string) => void,
  toolNameRef: { current: string },
  toolIndexRef: { current: number },
): void {
  const reStart = /<tool_call\s*(?:id=['"]?([^'"]+)['"]?\s*)?name=['"]?([^'"]+)['"]?\s*>/i;
  const reEnd = /<\/tool_call\s*>/i;
  let rest = text;
  let index = 0;
  while (rest.length > 0) {
    const startMatch = rest.match(reStart);
    if (!startMatch) {
      emit("text", rest);
      break;
    }
    const startIdx = startMatch.index!;
    const before = rest.slice(0, startIdx);
    if (before) {
      emit("text", before);
    }
    rest = rest.slice(startIdx + startMatch[0].length);
    const endIdx = rest.search(reEnd);
    if (endIdx === -1) {
      emit("text", rest);
      break;
    }
    const argsStr = rest.slice(0, endIdx);
    rest = rest.slice(endIdx + (rest.match(reEnd)?.[0]?.length ?? 0));
    toolNameRef.current = startMatch[2] ?? "";
    toolIndexRef.current = index;
    emit("toolcall", "", startMatch[1] ?? undefined);
    emit("toolcall", argsStr);
    emit("toolcall_end", "", undefined);
    index++;
  }
}

export function createManusApiStreamFn(apiKey: string): StreamFn {
  const client = new ManusApiClient({ apiKey });

  return (model, context, streamOptions) => {
    const stream = createAssistantMessageEventStream();

    const run = async () => {
      try {
        const sessionKey = (context as unknown as { sessionId?: string }).sessionId || "default";
        const conversationId = conversationMap.get(sessionKey);

        const messages = context.messages || [];
        const systemPrompt = (context as unknown as { systemPrompt?: string }).systemPrompt || "";
        const tools = context.tools || [];
        const toolPrompt = buildXmlToolPromptSection(tools);

        let prompt = "";
        if (tools.length > 0) {
          if (!conversationId) {
            const historyParts: string[] = [];
            let systemPromptContent = systemPrompt;
            if (toolPrompt) {
              systemPromptContent += toolPrompt;
            }
            if (systemPromptContent && !messages.some((m) => (m.role as string) === "system")) {
              historyParts.push(`System: ${systemPromptContent}`);
            }
            for (const m of messages) {
              const role = m.role === "user" || m.role === "toolResult" ? "User" : "Assistant";
              let content = "";
              if (m.role === "toolResult") {
                const tr = m as unknown as ToolResultMessage;
                let resultText = "";
                if (Array.isArray(tr.content)) {
                  for (const part of tr.content) {
                    if (part.type === "text") {
                      resultText += part.text;
                    }
                  }
                }
                content = `\n<tool_response id="${tr.toolCallId}" name="${tr.toolName}">\n${resultText}\n</tool_response>\n`;
              } else if (Array.isArray(m.content)) {
                for (const part of m.content) {
                  if (part.type === "text") {
                    content += (part as TextContent).text;
                  } else if (part.type === "toolCall") {
                    const tc = part as ToolCall;
                    content += `<tool_call id="${tc.id}" name="${tc.name}">${JSON.stringify(tc.arguments)}</tool_call>`;
                  }
                }
              } else {
                content = String(m.content);
              }
              historyParts.push(`${role}: ${content}`);
            }
            prompt = historyParts.join("\n\n");
          } else {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg?.role === "toolResult") {
              const tr = lastMsg as unknown as ToolResultMessage;
              let resultText = "";
              if (Array.isArray(tr.content)) {
                for (const part of tr.content) {
                  if (part.type === "text") {
                    resultText += part.text;
                  }
                }
              }
              prompt = `\n<tool_response id="${tr.toolCallId}" name="${tr.toolName}">\n${resultText}\n</tool_response>\n\nPlease proceed based on this tool result.`;
            } else {
              const lastUserMessage = [...messages].toReversed().find((m) => m.role === "user");
              if (lastUserMessage) {
                if (typeof lastUserMessage.content === "string") {
                  prompt = lastUserMessage.content;
                } else if (Array.isArray(lastUserMessage.content)) {
                  prompt = (lastUserMessage.content as TextContent[])
                    .filter((part) => part.type === "text")
                    .map((part) => part.text)
                    .join("");
                }
              }
            }
            if (toolPrompt) {
              prompt += getXmlToolReminder();
            }
          }
        } else {
          const lastUserMessage = [...messages].toReversed().find((m) => m.role === "user");
          if (lastUserMessage) {
            if (typeof lastUserMessage.content === "string") {
              prompt = lastUserMessage.content;
            } else if (Array.isArray(lastUserMessage.content)) {
              prompt = (lastUserMessage.content as TextContent[])
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("");
            }
          }
        }

        if (!prompt) {
          throw new Error("No message found to send to Manus API");
        }

        console.log(`[ManusApiStream] Starting run for session: ${sessionKey}`);
        console.log(`[ManusApiStream] Conversation ID: ${conversationId || "new"}, tools: ${tools.length}`);

        const agentProfile = model.id?.includes("lite") ? "manus-1.6-lite" : "manus-1.6";
        const text = await client.chat({
          prompt,
          agentProfile,
          taskMode: "chat",
          conversationId: conversationId || undefined,
          signal: streamOptions?.signal,
        });

        if (tools.length === 0) {
          const contentParts: TextContent[] = [{ type: "text", text }];
          const partial: AssistantMessage = {
            role: "assistant",
            content: contentParts,
            api: model.api,
            provider: model.provider,
            model: model.id,
            usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
            stopReason: "stop",
            timestamp: Date.now(),
          };
          stream.push({ type: "text_start", contentIndex: 0, partial });
          stream.push({ type: "text_delta", contentIndex: 0, delta: text, partial });
          stream.push({ type: "done", reason: "stop", message: partial });
          stream.end();
          return;
        }

        const contentParts: (TextContent | ToolCall)[] = [];
        const accumulatedToolCalls: { id: string; name: string; arguments: string }[] = [];
        const indexMap = new Map<string, number>();
        let nextIndex = 0;
        const toolNameRef = { current: "" };
        const toolIndexRef = { current: 0 };

        const createPartial = (): AssistantMessage => ({
          role: "assistant",
          content: [...contentParts],
          api: model.api,
          provider: model.provider,
          model: model.id,
          usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
          stopReason: accumulatedToolCalls.length > 0 ? "toolUse" : "stop",
          timestamp: Date.now(),
        });

        const emit = (type: "text" | "toolcall" | "toolcall_end", payload: string, toolId?: string) => {
          if (type === "text") {
            if (!payload) return;
            const key = "text";
            if (!indexMap.has(key)) {
              const index = nextIndex++;
              indexMap.set(key, index);
              contentParts[index] = { type: "text", text: "" };
              stream.push({ type: "text_start", contentIndex: index, partial: createPartial() });
            }
            const index = indexMap.get(key)!;
            (contentParts[index] as TextContent).text += payload;
            stream.push({ type: "text_delta", contentIndex: index, delta: payload, partial: createPartial() });
          } else if (type === "toolcall") {
            const key = `tool_${toolIndexRef.current}`;
            if (!indexMap.has(key)) {
              const index = nextIndex++;
              indexMap.set(key, index);
              const id = toolId || `call_${Date.now()}_${index}`;
              contentParts[index] = { type: "toolCall", id, name: toolNameRef.current, arguments: {} };
              accumulatedToolCalls.push({ id, name: toolNameRef.current, arguments: "" });
              stream.push({ type: "toolcall_start", contentIndex: index, partial: createPartial() });
            }
            if (payload) {
              const idx = indexMap.get(key)!;
              const last = accumulatedToolCalls[accumulatedToolCalls.length - 1];
              if (last) last.arguments += payload;
              stream.push({ type: "toolcall_delta", contentIndex: idx, delta: payload, partial: createPartial() });
            }
          } else if (type === "toolcall_end") {
            const key = `tool_${toolIndexRef.current}`;
            const idx = indexMap.get(key);
            if (idx !== undefined) {
              const part = contentParts[idx] as ToolCall;
              const last = accumulatedToolCalls[accumulatedToolCalls.length - 1];
              let argStr = last?.arguments ?? "{}";
              let cleaned = argStr.trim();
              if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
              else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
              if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
              cleaned = cleaned.trim();
              try {
                part.arguments = JSON.parse(cleaned);
              } catch {
                part.arguments = { raw: argStr };
              }
              stream.push({ type: "toolcall_end", contentIndex: idx, toolCall: part, partial: createPartial() });
            }
          }
        };

        parseToolCallsFromFullText(text, (t, p, id) => emit(t, p, id), toolNameRef, toolIndexRef);

        const stopReason = accumulatedToolCalls.length > 0 ? "toolUse" : "stop";
        const assistantMessage: AssistantMessage = {
          role: "assistant",
          content: contentParts.length > 0 ? contentParts : [{ type: "text", text }],
          stopReason,
          api: model.api,
          provider: model.provider,
          model: model.id,
          usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
          timestamp: Date.now(),
        };
        stream.push({ type: "done", reason: stopReason, message: assistantMessage });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        stream.push({
          type: "error",
          reason: "error",
          error: {
            role: "assistant",
            content: [],
            stopReason: "error",
            errorMessage,
            api: model.api,
            provider: model.provider,
            model: model.id,
            usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
            timestamp: Date.now(),
          },
        } as any);
      } finally {
        stream.end();
      }
    };

    queueMicrotask(() => void run());
    return stream;
  };
}
