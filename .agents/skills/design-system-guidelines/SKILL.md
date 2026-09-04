---
name: design-system-guidelines
description: Enterprise B2B SaaS design system guidelines for RoboBid AI based on shadcn/ui and Tremor design patterns.
---

# RoboBid AI — Enterprise Design System Guidelines

## Core Principles
1. **Clarity & Information Hierarchy**:
   - Primary metrics, urgent deadlines (D-Day), and blocking compliance issues must be visually distinct at a glance.
   - Use high-contrast color tokens with subtle borders (`border-border/50`) and soft elevation.
2. **Accessible & Responsive**:
   - Support dark mode natively with Slate/Indigo tokens without excessive glare.
   - Ensure full touch and screen responsiveness on 390px (mobile), 768px (tablet), 1440px+ (desktop).
3. **Micro-Interactions & Immediate Feedback**:
   - Provide toast notifications for all state-changing actions (save, seed, delete, sync).
   - Use subtle transitions (`transition-all duration-200`) for interactive elements like cards, buttons, and tabs.
4. **Data Density with Breathing Room**:
   - Follow an 8pt layout grid.
   - Combine dense data tables with clear summary metric cards.
