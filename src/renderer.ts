import { Game } from "./game.js";
import { TerrainType, Tile } from "./types.js";

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize: number;

  constructor(canvas: HTMLCanvasElement, private game: Game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    const world = game.getWorld();
    this.tileSize = this.canvas.width / world.size;
  }

  private getTerrainColor(terrain: TerrainType): string {
    const colors = {
      grass: "#27ae60",
      forest: "#8b4513",
      mountain: "#7f8c8d",
      water: "#3498db",
      desert: "#f39c12",
    };
    return colors[terrain];
  }

  public render(): void {
    const world = this.game.getWorld();

    // Clear canvas
    this.ctx.fillStyle = "#ecf0f1";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    for (let y = 0; y < world.size; y++) {
      for (let x = 0; x < world.size; x++) {
        const tile = world.grid[y][x];
        this.drawTile(x, y, tile);
      }
    }

    // Draw grid lines
    this.ctx.strokeStyle = "#bdc3c7";
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= world.size; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.tileSize, 0);
      this.ctx.lineTo(i * this.tileSize, this.canvas.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.tileSize);
      this.ctx.lineTo(this.canvas.width, i * this.tileSize);
      this.ctx.stroke();
    }

    // Draw agent
    this.drawAgent();
  }

  private drawTile(x: number, y: number, tile: Tile): void {
    const pixelX = x * this.tileSize;
    const pixelY = y * this.tileSize;

    // Draw terrain
    this.ctx.fillStyle = this.getTerrainColor(tile.terrain);
    this.ctx.fillRect(pixelX, pixelY, this.tileSize, this.tileSize);

    // Draw resource indicator
    if (tile.resource) {
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      this.ctx.font = `${this.tileSize * 0.4}px Arial`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      const symbol = this.getResourceSymbol(tile.resource);
      this.ctx.fillText(
        symbol,
        pixelX + this.tileSize / 2,
        pixelY + this.tileSize / 2
      );
    }

    // Draw structure
    if (tile.structure) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      this.ctx.font = `${this.tileSize * 0.5}px Arial`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      const symbol = this.getStructureSymbol(tile.structure);
      this.ctx.fillText(
        symbol,
        pixelX + this.tileSize / 2,
        pixelY + this.tileSize / 2
      );
    }
  }

  private getResourceSymbol(resource: string): string {
    const symbols: { [key: string]: string } = {
      wood: "🌲",
      stone: "⛰️",
      sand: "🏖️",
      food: "🍎",
    };
    return symbols[resource] || "?";
  }

  private getStructureSymbol(structure: string): string {
    const symbols: { [key: string]: string } = {
      shelter: "🏠",
      campfire: "🔥",
      axe: "🪓",
      pickaxe: "⛏️",
    };
    return symbols[structure] || "📦";
  }

  private drawAgent(): void {
    const agent = this.game.getAgent();
    const pixelX = agent.position.x * this.tileSize;
    const pixelY = agent.position.y * this.tileSize;

    // Draw agent circle
    this.ctx.fillStyle = "red";
    this.ctx.beginPath();
    this.ctx.arc(
      pixelX + this.tileSize / 2,
      pixelY + this.tileSize / 2,
      this.tileSize / 3,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Draw agent border
    this.ctx.strokeStyle = "darkred";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
}
