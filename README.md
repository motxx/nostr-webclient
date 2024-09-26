# Nostr Web Client

Nostr web client developed using React and TypeScript.

## Installation

```
bun i
```

## Usage

To start the development server:

```
bun start
```

## Project Structure

This project follows a clean architecture approach, separating concerns into distinct layers:

- `src/components/`: Reusable UI components
- `src/features/`: Feature-specific components and logic
- `src/domain/`: Core business logic, including entities, repositories, and use cases
- `src/infrastructure/`: External services and data storage implementations
- `src/hooks/`: Custom React hooks for shared logic
- `src/context/`: React context for global state management
- `src/state/`: Global state management (actions, atoms, selectors)
- `src/utils/`: Utility functions and helpers

The business logic is encapsulated within the domain layer, specifically in `src/domain/use_cases`, which abstracts away the infrastructure layer for better separation of concerns.

## Notes

This project was originally licensed under the MIT License. As of 2024-06-22 (after commit 0efec96), the license has been changed to the AGPL.
