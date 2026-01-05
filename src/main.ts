import { Game } from "./game.js";
import { Renderer } from "./renderer.js";
import { Agent } from "./agent.js";

class App {
  private game: Game;
  private renderer: Renderer;
  private agent: Agent;
  private renderInterval: number | null = null;

  // UI Elements
  private canvas: HTMLCanvasElement;
  private startBtn: HTMLButtonElement;
  private stopBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;
  private goalInput: HTMLTextAreaElement;
  private apiKeyInput: HTMLInputElement;
  private agentPosSpan: HTMLSpanElement;
  private agentInventorySpan: HTMLSpanElement;
  private agentStateSpan: HTMLSpanElement;
  private activityLog: HTMLDivElement;

  constructor() {
    // Get DOM elements
    this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    this.startBtn = document.getElementById("startBtn") as HTMLButtonElement;
    this.stopBtn = document.getElementById("stopBtn") as HTMLButtonElement;
    this.resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
    this.goalInput = document.getElementById(
      "goalInput"
    ) as HTMLTextAreaElement;
    this.apiKeyInput = document.getElementById(
      "apiKeyInput"
    ) as HTMLInputElement;
    this.agentPosSpan = document.getElementById("agentPos") as HTMLSpanElement;
    this.agentInventorySpan = document.getElementById(
      "agentInventory"
    ) as HTMLSpanElement;
    this.agentStateSpan = document.getElementById(
      "agentState"
    ) as HTMLSpanElement;
    this.activityLog = document.getElementById("activityLog") as HTMLDivElement;

    // Initialize game
    this.game = new Game();
    this.renderer = new Renderer(this.canvas, this.game);
    this.agent = new Agent(this.game, this.log.bind(this));

    // Set up event listeners
    this.startBtn.addEventListener("click", () => this.startAgent());
    this.stopBtn.addEventListener("click", () => this.stopAgent());
    this.resetBtn.addEventListener("click", () => this.resetWorld());

    // Start render loop
    this.startRenderLoop();

    // Initial render
    this.renderer.render();
    this.updateUI();

    this.log("Welcome to AI Agent Resource World!", "info");
    this.log(
      "Enter your Gemini API key and a goal, then click Start Agent",
      "info"
    );
  }

  private startRenderLoop(): void {
    this.renderInterval = window.setInterval(() => {
      this.renderer.render();
      this.updateUI();
    }, 100); // Render at ~10 FPS
  }

  private async startAgent(): Promise<void> {
    const goal = this.goalInput.value.trim();
    const apiKey = this.apiKeyInput.value.trim();

    if (!goal) {
      this.log("Please enter a goal for the agent", "error");
      return;
    }

    if (!apiKey) {
      this.log("Please enter your Gemini API key", "error");
      return;
    }

    // Update UI
    this.startBtn.disabled = true;
    this.stopBtn.disabled = false;
    this.goalInput.disabled = true;
    this.apiKeyInput.disabled = true;
    this.agentStateSpan.textContent = "Running";

    // Set API key and start agent
    this.agent.setApiKey(apiKey);
    await this.agent.start(goal);

    // Agent finished
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
    this.goalInput.disabled = false;
    this.apiKeyInput.disabled = false;
    this.agentStateSpan.textContent = "Completed";
  }

  private stopAgent(): void {
    this.agent.stop();
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
    this.goalInput.disabled = false;
    this.apiKeyInput.disabled = false;
    this.agentStateSpan.textContent = "Stopped";
  }

  private resetWorld(): void {
    if (this.agent.isAgentRunning()) {
      this.stopAgent();
    }

    this.game.reset();
    this.renderer.render();
    this.updateUI();
    this.activityLog.innerHTML = "";
    this.log("World reset!", "info");
  }

  private updateUI(): void {
    const agent = this.game.getAgent();

    // Update position
    this.agentPosSpan.textContent = `(${agent.position.x}, ${agent.position.y})`;

    // Update inventory
    const inventoryItems = Object.entries(agent.inventory)
      .map(([item, amount]) => `${item}: ${amount}`)
      .join(", ");
    this.agentInventorySpan.textContent = inventoryItems || "Empty";
  }

  private log(message: string, type: "info" | "success" | "error"): void {
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    this.activityLog.appendChild(entry);
    this.activityLog.scrollTop = this.activityLog.scrollHeight;
  }
}

// Initialize app when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new App());
} else {
  new App();
}
