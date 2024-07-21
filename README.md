# Zapstr - Nostr Client

Zapstr is a Nostr client developed using React and TypeScript.

## Installation

```
bun i
```

## Usage

To start the development server:

```
bun start
```

## Directory Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context for global state management
├── data/           # Mock data
├── domain/         # Domain layer (entities, repositories, use cases)
├── features/       # Feature-specific components and logic
├── hooks/          # Reusable custom React hooks
├── infrastructure/ # Infrastructure layer (nostr services, storage)
├── state/          # Global state management (actions, atoms, selectors)
└── utils/          # Utility functions and helpers
```

## Note

This project was originally licensed under the MIT License. As of 2024-06-22 (after commit 0efec96), the license has been changed to the AGPL.
