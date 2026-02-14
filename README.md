# Prompted Video — Strategy + Remotion + Claude Code

A business intelligence dashboard paired with a programmatic video system, built with React, TypeScript, and Remotion. The interactive web app analyzes multi-branch financial performance across Texas regions, while Remotion renders a professional 90-second animated video — entirely from code, no video editor involved.

## Video Overview

[![Watch the video](https://img.youtube.com/vi/qssE-EdGl4w/maxresdefault.jpg)](https://www.youtube.com/watch?v=qssE-EdGl4w)

**[Watch on YouTube →](https://www.youtube.com/watch?v=qssE-EdGl4w)**

This video walks through all the apps we've been building in this project. Every frame of the video component — the animations, transitions, charts, particle effects, and typography — is generated entirely by code using [Remotion](https://www.remotion.dev/). No after-effects, no screen recordings, no manual editing. The video is a React component rendered to MP4.

## What's In the Project

### Interactive Web Dashboard

Five pages of data visualization for a fictional multi-branch financial institution:

- **Executive Overview** — KPI dashboard with profit trends, member growth, NPS scores, digital adoption
- **Branch Comparison** — Side-by-side performance analysis with ranking across 4 Texas regions
- **Geographic Map** — Interactive Leaflet map with branch locations colored by performance metrics
- **Digital Transformation** — Digital adoption metrics, transaction channels, mobile app statistics
- **What-If Analysis** — Scenario modeling with sliders for interest rates and growth projections

### Code-Generated Video (Remotion)

A 90-second animated presentation (1920×1080, 30fps) composed of 5 scenes, all written as React components:

1. **Opening** — Glow orb fade-in with typewriter text
2. **Foundation** — Data flow particles with progressive messaging about semantic data layers
3. **Data Products** — Dashboard visualization with animated KPI cards, charts, and a Texas branch network map
4. **AI Orchestration** — Node graph showing a central hub connected to Claude, Gemini, and ChatGPT via MCP links with orbital animations
5. **Closing** — Converging particles, logo reveal, and call to action

Custom animation components include spring physics, particle systems, orbital node positioning, traveling dots along SVG paths, and frame-interpolated fades — all expressed as TypeScript.

## Tech Stack

- **React 19** + **TypeScript 5.9** + **Vite 7**
- **Remotion 4** for programmatic video rendering
- **Tailwind CSS 4** + **shadcn/ui** + **Radix UI**
- **Recharts** for data visualization
- **React Leaflet** for geographic mapping

## Getting Started

```bash
npm install
npm run dev          # Start the web dashboard
```

### Remotion Video

```bash
npm run remotion:studio   # Open Remotion Studio to preview the video
npm run remotion:render   # Render to out/video.mp4
```

## Project Structure

```
src/
├── pages/              # Dashboard route components
├── components/         # UI components (shadcn, shared, layout, charts)
├── remotion/
│   ├── Root.tsx         # Composition registration
│   ├── Video.tsx        # Main video component sequencing all scenes
│   ├── scenes/          # 5 animated scene components
│   ├── components/      # Animation primitives (particles, typewriter, node graph, etc.)
│   └── lib/             # Timing constants, design tokens, sample data
├── data/               # Branch performance JSON + coordinates
├── context/            # Global filter state
├── lib/                # Utilities, formatters, constants
└── types/              # TypeScript interfaces
```
