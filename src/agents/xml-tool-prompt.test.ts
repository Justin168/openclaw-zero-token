import { describe, expect, it } from "vitest";
import {
  buildXmlToolPromptSection,
  getXmlToolReminder,
  type XmlToolSpec,
} from "./xml-tool-prompt.js";

describe("xml-tool-prompt", () => {
  it("returns empty string when tools array is empty", () => {
    expect(buildXmlToolPromptSection([])).toBe("");
  });

  it("builds tool prompt section with one tool", () => {
    const tools: XmlToolSpec[] = [
      {
        name: "ping",
        description: "Return OK.",
        parameters: {},
      },
    ];
    const out = buildXmlToolPromptSection(tools);
    expect(out).toContain("## Tool Use Instructions");
    expect(out).toContain("<tool_call id=\"unique_id\" name=\"tool_name\">");
    expect(out).toContain("#### ping");
    expect(out).toContain("Return OK.");
    expect(out).toContain("Parameters: {}");
  });

  it("builds tool prompt section with multiple tools", () => {
    const tools: XmlToolSpec[] = [
      { name: "exec", description: "Run command", parameters: { command: {} } },
      { name: "read_file", description: "Read file", parameters: { path: {} } },
    ];
    const out = buildXmlToolPromptSection(tools);
    expect(out).toContain("#### exec");
    expect(out).toContain("#### read_file");
    expect(out).toContain("Run command");
    expect(out).toContain("Read file");
  });

  it("getXmlToolReminder returns non-empty hint", () => {
    const reminder = getXmlToolReminder();
    expect(reminder).toContain("tool_call");
    expect(reminder).toContain("SYSTEM HINT");
  });
});
