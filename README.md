# Flow Builder

A visual workflow builder built with Next.js and React Flow.

![Flow Builder Demo](https://res.cloudinary.com/dvyyybjb2/image/upload/fl_preserve_transparency/v1772276036/image_qfnhe1.jpg?_s=public-apps)

[![Watch Demo](https://img.youtube.com/vi/mFOXFO4F6yI/0.jpg)](https://youtu.be/mFOXFO4F6yI)

## Getting Started

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- **Visual Canvas** - Drag, add, and delete nodes on an interactive canvas
- **Node Types** - Trigger, Agent, and Action node types with distinct icons
- **Edge Connections** - Connect nodes by dragging from handles
- **Node Sidebar** - Edit node name, type, and description
- **Start Node** - Designate any node as the start node
- **Validation** - Real-time validation with inline error messages
- **Keyboard Shortcuts** - Press Delete to remove selected nodes
- **Import/Export** - Export flow as JSON

## Design Choices

- **State Management**: Zustand store for centralized flow state
- **UI Components**: Shadcn UI for consistent, accessible components
- **Canvas**: React Flow (@xyflow/react) for node-based editor
- **Node Structure**: Custom node components with header, body, footer
- **Edge Rendering**: Custom ConditionEdge with conditional labels
- **Validation**: Real-time validation on every state change

## Project Structure

```
components/flow/
├── builder/          # Main flow canvas
├── edges/            # Custom edge components
├── nodes/            # Node components & sidebar
└── toolbar/          # Toolbar controls

lib/
├── store.ts          # Zustand state management
├── types.ts          # TypeScript interfaces
└── utils.ts          # Utility functions
```