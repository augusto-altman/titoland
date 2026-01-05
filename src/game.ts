import {
  GameWorld,
  ItemType,
  Position,
  ResourceType,
  TerrainType,
  Tile,
} from "./types.js";

export class Game {
  private world: GameWorld;
  private readonly gridSize = 20;

  constructor() {
    this.world = this.createWorld();
  }

  private createWorld(): GameWorld {
    const grid: Tile[][] = [];

    // Generate terrain using simple noise-like algorithm
    for (let y = 0; y < this.gridSize; y++) {
      grid[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        grid[y][x] = this.generateTile(x, y);
      }
    }

    return {
      size: this.gridSize,
      grid,
      agent: {
        position: { x: 10, y: 10 }, // Start in middle
        inventory: {},
        isActive: false,
      },
    };
  }

  private generateTile(x: number, y: number): Tile {
    // Simple procedural generation
    const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    const random = seed - Math.floor(seed);

    let terrain: TerrainType;
    let resource: ResourceType | undefined;
    let resourceAmount: number | undefined;

    // Water around edges
    if (x < 2 || x >= this.gridSize - 2 || y < 2 || y >= this.gridSize - 2) {
      if (random < 0.3) {
        terrain = "water";
      } else {
        terrain = "grass";
      }
    } else if (random < 0.2) {
      terrain = "forest";
      resource = "wood";
      resourceAmount = Math.floor(random * 20) + 5;
    } else if (random < 0.35) {
      terrain = "mountain";
      resource = "stone";
      resourceAmount = Math.floor(random * 15) + 3;
    } else if (random < 0.45) {
      terrain = "desert";
      resource = "sand";
      resourceAmount = Math.floor(random * 10) + 2;
    } else {
      terrain = "grass";
      if (random > 0.8) {
        resource = "food";
        resourceAmount = Math.floor(random * 5) + 1;
      }
    }

    return { terrain, resource, resourceAmount };
  }

  public getWorld(): GameWorld {
    return this.world;
  }

  public getAgent() {
    return this.world.agent;
  }

  public getTileAt(pos: Position): Tile | null {
    if (this.isValidPosition(pos)) {
      return this.world.grid[pos.y][pos.x];
    }
    return null;
  }

  public isValidPosition(pos: Position): boolean {
    return (
      pos.x >= 0 && pos.x < this.gridSize && pos.y >= 0 && pos.y < this.gridSize
    );
  }

  public setAgentPosition(pos: Position): boolean {
    if (this.isValidPosition(pos)) {
      const tile = this.getTileAt(pos);
      if (tile && tile.terrain !== "water") {
        this.world.agent.position = pos;
        return true;
      }
    }
    return false;
  }

  public addToInventory(item: string, amount: number): void {
    if (!this.world.agent.inventory[item]) {
      this.world.agent.inventory[item] = 0;
    }
    this.world.agent.inventory[item] += amount;
  }

  public removeFromInventory(item: string, amount: number): boolean {
    if (this.world.agent.inventory[item] >= amount) {
      this.world.agent.inventory[item] -= amount;
      if (this.world.agent.inventory[item] === 0) {
        delete this.world.agent.inventory[item];
      }
      return true;
    }
    return false;
  }

  public hasInInventory(item: string, amount: number): boolean {
    return (this.world.agent.inventory[item] || 0) >= amount;
  }

  public removeResourceFromTile(pos: Position, amount: number): boolean {
    const tile = this.getTileAt(pos);
    if (
      tile &&
      tile.resource &&
      tile.resourceAmount &&
      tile.resourceAmount >= amount
    ) {
      tile.resourceAmount -= amount;
      if (tile.resourceAmount === 0) {
        tile.resource = undefined;
        tile.resourceAmount = undefined;
      }
      return true;
    }
    return false;
  }

  public placeStructure(pos: Position, structure: ItemType): boolean {
    const tile = this.getTileAt(pos);
    if (tile && !tile.structure && tile.terrain !== "water") {
      tile.structure = structure;
      return true;
    }
    return false;
  }

  public reset(): void {
    this.world = this.createWorld();
  }
}
