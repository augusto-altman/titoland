import { Game } from "./game.js";
import { Direction, ItemType, TileInfo, ToolResult } from "./types.js";

export class AgentTools {
  constructor(private game: Game) {}

  // Move in a direction
  move(direction: string): ToolResult {
    const validDirections: Direction[] = ["north", "south", "east", "west"];
    if (!validDirections.includes(direction as Direction)) {
      return {
        success: false,
        message: `Invalid direction: ${direction}. Must be one of: ${validDirections.join(
          ", "
        )}`,
      };
    }

    const agent = this.game.getAgent();
    const currentPos = agent.position;
    let newPos = { ...currentPos };

    switch (direction as Direction) {
      case "north":
        newPos.y -= 1;
        break;
      case "south":
        newPos.y += 1;
        break;
      case "east":
        newPos.x += 1;
        break;
      case "west":
        newPos.x -= 1;
        break;
    }

    if (this.game.setAgentPosition(newPos)) {
      return {
        success: true,
        message: `Moved ${direction} to position (${newPos.x}, ${newPos.y})`,
        data: { position: newPos },
      };
    } else {
      return {
        success: false,
        message: `Cannot move ${direction} - obstacle or boundary in the way`,
      };
    }
  }

  // Look around current position
  look(): ToolResult {
    const agent = this.game.getAgent();
    const pos = agent.position;
    const viewRadius = 2;
    const visible: TileInfo[] = [];

    for (let dy = -viewRadius; dy <= viewRadius; dy++) {
      for (let dx = -viewRadius; dx <= viewRadius; dx++) {
        const checkPos = { x: pos.x + dx, y: pos.y + dy };
        const tile = this.game.getTileAt(checkPos);

        if (tile) {
          const info: TileInfo = {
            position: checkPos,
            relativePosition: { x: dx, y: dy },
            terrain: tile.terrain,
            resource: tile.resource,
            resourceAmount: tile.resourceAmount,
            structure: tile.structure,
          };

          visible.push(info);
        }
      }
    }

    return {
      success: true,
      message: `Looking around position (${pos.x}, ${pos.y})`,
      data: { tiles: visible, currentPosition: pos },
    };
  }

  // Gather resource from current tile
  gather(resource: string): ToolResult {
    const agent = this.game.getAgent();
    const pos = agent.position;
    const tile = this.game.getTileAt(pos);

    if (!tile) {
      return { success: false, message: "Invalid position" };
    }

    if (
      tile.resource === resource &&
      tile.resourceAmount &&
      tile.resourceAmount > 0
    ) {
      const amountToGather = Math.min(5, tile.resourceAmount); // Gather up to 5 at a time
      this.game.removeResourceFromTile(pos, amountToGather);
      this.game.addToInventory(resource, amountToGather);

      return {
        success: true,
        message: `Gathered ${amountToGather} ${resource}`,
        data: { resource, amount: amountToGather },
      };
    }

    return {
      success: false,
      message: `No ${resource} available at current position`,
    };
  }

  // Craft an item
  craft(item: string): ToolResult {
    const recipes: { [key: string]: { [resource: string]: number } } = {
      axe: { wood: 3, stone: 2 },
      pickaxe: { wood: 2, stone: 3 },
      campfire: { wood: 5, stone: 3 },
    };

    const recipe = recipes[item];
    if (!recipe) {
      return {
        success: false,
        message: `Unknown item: ${item}. Available items: ${Object.keys(
          recipes
        ).join(", ")}`,
      };
    }

    // Check if we have all required resources
    for (const [resource, amount] of Object.entries(recipe)) {
      if (!this.game.hasInInventory(resource, amount)) {
        return {
          success: false,
          message: `Need ${amount} ${resource} to craft ${item}, but only have ${
            this.game.getAgent().inventory[resource] || 0
          }`,
        };
      }
    }

    // Consume resources
    for (const [resource, amount] of Object.entries(recipe)) {
      this.game.removeFromInventory(resource, amount);
    }

    // Add crafted item
    this.game.addToInventory(item, 1);

    return {
      success: true,
      message: `Crafted ${item}`,
      data: { item },
    };
  }

  // Build a structure at current location
  build(structure: string): ToolResult {
    const buildRequirements: { [key: string]: { [resource: string]: number } } =
      {
        shelter: { wood: 10, stone: 5 },
        campfire: { wood: 3, stone: 2 },
      };

    const requirements = buildRequirements[structure];
    if (!requirements) {
      return {
        success: false,
        message: `Unknown structure: ${structure}. Available: ${Object.keys(
          buildRequirements
        ).join(", ")}`,
      };
    }

    // Check if we have all required resources
    for (const [resource, amount] of Object.entries(requirements)) {
      if (!this.game.hasInInventory(resource, amount)) {
        return {
          success: false,
          message: `Need ${amount} ${resource} to build ${structure}`,
        };
      }
    }

    const pos = this.game.getAgent().position;
    if (!this.game.placeStructure(pos, structure as ItemType)) {
      return {
        success: false,
        message: "Cannot build here - location occupied or invalid",
      };
    }

    // Consume resources
    for (const [resource, amount] of Object.entries(requirements)) {
      this.game.removeFromInventory(resource, amount);
    }

    return {
      success: true,
      message: `Built ${structure} at position (${pos.x}, ${pos.y})`,
      data: { structure, position: pos },
    };
  }

  // Get inventory
  getInventory(): ToolResult {
    const inventory = this.game.getAgent().inventory;
    const items = Object.entries(inventory).map(([item, amount]) => ({
      item,
      amount,
    }));

    return {
      success: true,
      message: `Inventory contains ${items.length} item types`,
      data: { inventory: items },
    };
  }
}

// Gemini function declarations
export const toolDefinitions = [
  {
    name: "move",
    description:
      "Move the agent in a specified direction (north, south, east, west). Cannot move through water or beyond boundaries.",
    parameters: {
      type: "object",
      properties: {
        direction: {
          type: "string",
          enum: ["north", "south", "east", "west"],
          description: "The direction to move",
        },
      },
      required: ["direction"],
    },
  },
  {
    name: "look",
    description:
      "Observe the surrounding area within a 2-tile radius. Returns information about terrain, resources, and structures.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "gather",
    description:
      "Gather a resource from the current tile. Resources include: wood (from forest), stone (from mountain), sand (from desert), food (from grass). Gathers up to 5 units at a time.",
    parameters: {
      type: "object",
      properties: {
        resource: {
          type: "string",
          enum: ["wood", "stone", "sand", "food"],
          description: "The resource to gather",
        },
      },
      required: ["resource"],
    },
  },
  {
    name: "craft",
    description:
      "Craft an item from resources in inventory. Recipes: axe (3 wood, 2 stone), pickaxe (2 wood, 3 stone), campfire (5 wood, 3 stone).",
    parameters: {
      type: "object",
      properties: {
        item: {
          type: "string",
          enum: ["axe", "pickaxe", "campfire"],
          description: "The item to craft",
        },
      },
      required: ["item"],
    },
  },
  {
    name: "build",
    description:
      "Build a structure at the current location. Requirements: shelter (10 wood, 5 stone), campfire (3 wood, 2 stone). Cannot build on water or occupied tiles.",
    parameters: {
      type: "object",
      properties: {
        structure: {
          type: "string",
          enum: ["shelter", "campfire"],
          description: "The structure to build",
        },
      },
      required: ["structure"],
    },
  },
  {
    name: "getInventory",
    description:
      "Check the current inventory to see what items and resources are available.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
];
