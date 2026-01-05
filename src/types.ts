export type TerrainType = "grass" | "forest" | "mountain" | "water" | "desert";
export type ResourceType = "wood" | "stone" | "sand" | "food";
export type ItemType =
  | ResourceType
  | "axe"
  | "pickaxe"
  | "shelter"
  | "campfire";
export type Direction = "north" | "south" | "east" | "west";

export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  terrain: TerrainType;
  resource?: ResourceType;
  resourceAmount?: number;
  structure?: ItemType;
}

export interface Inventory {
  [key: string]: number;
}

export interface AgentState {
  position: Position;
  inventory: Inventory;
  isActive: boolean;
}

export interface GameWorld {
  size: number;
  grid: Tile[][];
  agent: AgentState;
}

export interface TileInfo {
  position: Position;
  relativePosition: Position;
  terrain: TerrainType;
  resource?: ResourceType;
  resourceAmount?: number;
  structure?: ItemType;
}

export interface ToolResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

// Gemini API types
export interface GeminiFunctionCall {
  name: string;
  args: Record<string, unknown>;
}

export interface GeminiPart {
  text?: string;
  functionCall?: GeminiFunctionCall;
}

export interface GeminiFunctionResponse {
  functionResponse: {
    name: string;
    response: ToolResult;
  };
}

export interface GeminiContent {
  role: "user" | "model";
  parts: Array<GeminiPart | GeminiFunctionResponse>;
}

export interface GeminiResponse {
  candidates?: Array<{
    content: GeminiContent;
  }>;
}
