import { Game } from "./game.js";
import { AgentTools, toolDefinitions } from "./tools.js";
import { GeminiContent, ToolResult } from "./types.js";

export type LogCallback = (
  message: string,
  type: "info" | "success" | "error"
) => void;

export class Agent {
  private tools: AgentTools;
  private isRunning: boolean = false;
  private conversationHistory: GeminiContent[] = [];
  private apiKey: string = "";
  private maxIterations: number = 30;

  constructor(private game: Game, private onLog: LogCallback) {
    this.tools = new AgentTools(game);
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
  }

  public async start(goal: string): Promise<void> {
    if (!this.apiKey) {
      this.onLog("Error: API key not provided", "error");
      return;
    }

    this.isRunning = true;
    this.conversationHistory = [];
    this.onLog(`Starting agent with goal: ${goal}`, "info");

    // Initial system message
    const systemPrompt = `You are an AI agent in a grid-based resource world. Your goal is: ${goal}

You have access to tools to interact with the world. Use them strategically to accomplish your goal.

The world consists of:
- Grass: Open terrain, may have food
- Forest: Contains wood (gather with 'gather' tool)
- Mountain: Contains stone (gather with 'gather' tool)
- Desert: Contains sand (gather with 'gather' tool)
- Water: Cannot walk through

Available actions:
- move: Navigate the world
- look: Observe your surroundings
- gather: Collect resources from your current tile
- craft: Create items from resources
- build: Construct structures
- getInventory: Check what you're carrying

Start by using 'look' to understand your surroundings, then plan your actions to achieve the goal.
Be efficient and strategic. If you accomplish the goal, explain what you did.`;

    this.conversationHistory.push({
      role: "user",
      parts: [{ text: systemPrompt }],
    });

    await this.runLoop();
  }

  public stop(): void {
    this.isRunning = false;
    this.onLog("Agent stopped", "info");
  }

  private async runLoop(): Promise<void> {
    let iteration = 0;

    while (this.isRunning && iteration < this.maxIterations) {
      iteration++;
      this.onLog(`--- Iteration ${iteration} ---`, "info");

      try {
        const response = await this.callGemini();

        if (!response) {
          this.onLog("No response from Gemini", "error");
          break;
        }

        // Check if there are function calls
        const functionCalls = this.extractFunctionCalls(response);

        if (functionCalls.length === 0) {
          // No more function calls, agent is done or responding
          const textResponse = this.extractText(response);
          if (textResponse) {
            this.onLog(`Agent: ${textResponse}`, "success");
          }
          this.onLog("Agent completed its task", "success");
          break;
        }

        // Execute function calls
        const functionResponses = [];
        for (const call of functionCalls) {
          const result = await this.executeTool(call.name, call.args);
          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: result,
            },
          });

          const status = result.success ? "success" : "error";
          this.onLog(
            `${call.name}(${JSON.stringify(call.args)}): ${result.message}`,
            status
          );
        }

        // Add function responses to conversation
        this.conversationHistory.push({
          role: "model",
          parts: functionCalls.map((call) => ({
            functionCall: {
              name: call.name,
              args: call.args,
            },
          })),
        });

        this.conversationHistory.push({
          role: "user",
          parts: functionResponses,
        });

        // Small delay between iterations
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        this.onLog(`Error: ${error}`, "error");
        break;
      }
    }

    if (iteration >= this.maxIterations) {
      this.onLog("Reached maximum iterations", "info");
    }

    this.isRunning = false;
  }

  private async callGemini(): Promise<GeminiContent | undefined> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: this.conversationHistory,
      tools: [
        {
          functionDeclarations: toolDefinitions,
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content;
  }

  private extractFunctionCalls(
    content: GeminiContent | undefined
  ): Array<{ name: string; args: Record<string, unknown> }> {
    if (!content || !content.parts) return [];

    const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
    for (const part of content.parts) {
      if ("functionCall" in part && part.functionCall) {
        calls.push({
          name: part.functionCall.name,
          args: part.functionCall.args || {},
        });
      }
    }
    return calls;
  }

  private extractText(content: GeminiContent | undefined): string {
    if (!content || !content.parts) return "";

    for (const part of content.parts) {
      if ("text" in part && part.text) {
        return part.text;
      }
    }
    return "";
  }

  private async executeTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<ToolResult> {
    let result: ToolResult;

    switch (name) {
      case "move":
        result = this.tools.move(String(args.direction || ""));
        break;
      case "look":
        result = this.tools.look();
        break;
      case "gather":
        result = this.tools.gather(String(args.resource || ""));
        break;
      case "craft":
        result = this.tools.craft(String(args.item || ""));
        break;
      case "build":
        result = this.tools.build(String(args.structure || ""));
        break;
      case "getInventory":
        result = this.tools.getInventory();
        break;
      default:
        result = { success: false, message: `Unknown tool: ${name}` };
    }

    return result;
  }

  public isAgentRunning(): boolean {
    return this.isRunning;
  }
}
