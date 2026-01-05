# AI Agent Resource World

A browser-based simulation game where AI agents interact with a grid-based resource world using the Gemini API.

## Features

- Visual 2D grid world with different terrains (grass, forest, mountain, water, desert)
- AI agent powered by Google Gemini API
- Resource gathering and crafting system
- Real-time visualization of agent actions
- Activity logging and inventory tracking

## Setup

1. Install dependencies:

```bash
npm install
```

2. Build the TypeScript code:

```bash
npm run build
```

3. Start a local web server:

```bash
npm run serve
```

4. Open your browser to `http://localhost:8080`

## How to Use

1. Enter your Google Gemini API key in the input field
2. Set a goal for the agent (e.g., "Gather 10 wood and 5 stone, then build a shelter")
3. Click "Start Agent" and watch it work!

## Available Tools

The agent has access to these tools:

- **move(direction)** - Move north, south, east, or west
- **look()** - Observe surroundings within a 2-tile radius
- **gather(resource)** - Collect wood, stone, sand, or food from current tile
- **craft(item)** - Create items: axe, pickaxe, campfire
- **build(structure)** - Construct shelter or campfire
- **getInventory()** - Check current inventory

## Example Goals

- "Gather 10 wood and 5 stone"
- "Build a shelter"
- "Craft an axe and a pickaxe"
- "Explore the world and gather at least 3 different resources"
- "Build a campfire at position (15, 15)"

## Terrain Types

- **Grass** (Green) - Open terrain, may contain food
- **Forest** (Brown) - Contains wood
- **Mountain** (Gray) - Contains stone
- **Desert** (Orange) - Contains sand
- **Water** (Blue) - Cannot traverse

## Development

Watch mode for development:

```bash
npm run watch
```

This will automatically recompile TypeScript files when you make changes.
