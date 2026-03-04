/**
 * Shared XML-based tool prompt section for web/stream providers that do not
 * support native API tool_calls (e.g. gemini-web, chatgpt-web, manus-api).
 * Same format as deepseek-web, kimi-web, claude-web, etc.: model outputs
 * <tool_call id="..." name="...">{"arg":"value"}</tool_call>, we parse and execute.
 */

export type XmlToolSpec = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

const TOOL_INSTRUCTIONS = `
## Tool Use Instructions
You are equipped with specialized tools to perform actions or retrieve information. To use a tool, output a specific XML tag: <tool_call id="unique_id" name="tool_name">{"arg": "value"}</tool_call>. Rules for tool use:
1. ALWAYS think before calling a tool. Explain your reasoning inside <think> tags.
2. The 'id' attribute should be a unique 8-character string for each call.
3. Wait for the tool result before proceeding with further analysis.

### Special Instructions for Browser Tool
- **Profile 'openclaw' (Independent/Recommended)**: Opens a SEPARATE independent browser window. Use this for consistent, isolated sessions. Highly recommended for complex automation.
- Profile 'chrome' (Shared): Uses your existing Chrome tabs (requires extension). Use this if you need to access personal logins or already open tabs.
- **CONSISTENCY RULE**: Once you have started using a profile (or if you are switched to 'openclaw' due to connection errors), STAY with that profile for the remainder of the session. Do NOT switch back and forth as it will open redundant browser instances.

### Automation Policy
- DO NOT use the 'exec' tool to install secondary automation libraries like Playwright, Selenium, or Puppeteer if the 'browser' tool fails.
- Instead, inform the user about the connection issue or try the alternative browser profile ('openclaw').
- Installing automation tools via 'exec' is slow and redundant; the 'browser' tool is the primary way to interact with web content.

### Available Tools
`;

const TOOL_REMINDER =
  '\n\n[SYSTEM HINT]: Keep in mind your available tools. To use a tool, you MUST output the EXACT XML format: <tool_call id="unique_id" name="tool_name">{"arg": "value"}</tool_call>. Using plain text to describe your action will FAIL to execute the tool.';

/**
 * Build the "Tool Use Instructions" + "Available Tools" section to append to
 * system prompt when context.tools is non-empty. Used by web streams that
 * rely on XML tool_call parsing instead of native API tools.
 */
export function buildXmlToolPromptSection(tools: XmlToolSpec[]): string {
  if (tools.length === 0) {
    return "";
  }
  let out = TOOL_INSTRUCTIONS;
  for (const tool of tools) {
    out += `#### ${tool.name}\n${tool.description}\n`;
    out += `Parameters: ${JSON.stringify(tool.parameters)}\n\n`;
  }
  return out;
}

/**
 * Optional reminder to append to the user prompt on continuing turns (when
 * session/conversationId exists) so the model keeps using the XML format.
 */
export function getXmlToolReminder(): string {
  return TOOL_REMINDER;
}
