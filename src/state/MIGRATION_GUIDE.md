# Redux Toolkit Migration Guide

## Overview

This guide outlines the migration from Context API to Redux Toolkit for state management.

## Migration Status

### ✅ Completed
- Redux store setup with Redux Toolkit
- Auth slice created
- Messages slice created  
- Notifications slice created
- PublicChat slice created
- Timeline slice already migrated

### ⚠️ In Progress
- Component migration from Context API to Redux hooks
- Removing duplicate state management

### 📝 TODO
- Remove Context API files after all components are migrated
- Migrate Jotai atoms for userProfile and npubFromNostrAddress
- Update all components to use Redux hooks

## Migration Steps for Components

### 1. Replace Context imports
```typescript
// Before
import { AppContext } from '@/context/AppContext'
const { auth, timeline, messages } = useContext(AppContext)

// After
import { useAppSelector } from '@/state/hooks'
const auth = useAppSelector(state => state.auth)
const timeline = useAppSelector(state => state.timeline)
const messages = useAppSelector(state => state.messages)
```

### 2. Replace dispatch calls
```typescript
// Before
import { OperationType } from '@/context/actions'
dispatch({ type: OperationType.LoginSuccess, user })

// After
import { useAppDispatch } from '@/state/hooks'
import { loginSuccess } from '@/state/features/auth/authSlice'
const dispatch = useAppDispatch()
dispatch(loginSuccess(user))
```

### 3. Update async actions
For async operations, create thunks in the respective slices:

```typescript
// In slice file
export const fetchUserData = createAsyncThunk(
  'auth/fetchUser',
  async (userId: string, { extra }) => {
    // Use services from extra argument
    const { userService } = extra
    return await userService.getUser(userId)
  }
)
```

## State Structure Mapping

### Auth State
- Context: `auth.status`, `auth.loggedInUser`, `auth.nostrClient`
- Redux: `state.auth.status`, `state.auth.loggedInUser`, `state.auth.nostrClient`

### Timeline State  
- Context: `timeline.notes`, `timeline.status`
- Redux: `state.timeline.notes`, `state.timeline.status`

### Messages State
- Context: `messages.conversations`, `messages.status`
- Redux: `state.messages.conversations`, `state.messages.status`

### Notifications State
- Context: `notifications.notifications`, `notifications.status`
- Redux: `state.notifications.notifications`, `state.notifications.status`

## Components to Migrate

Priority order for migration:

1. **High Priority** (Core functionality)
   - Navigation components
   - Authentication flow
   - Home page

2. **Medium Priority** (Feature components)
   - Timeline components
   - Message components
   - Notification components

3. **Low Priority** (Utility components)
   - Settings
   - Public Chat
   - User profiles

## Testing Migration

After migrating each component:
1. Verify state updates correctly
2. Check async operations work
3. Ensure no Context API usage remains
4. Test error handling

## Cleanup

Once all components are migrated:
1. Delete `/src/context` directory
2. Remove AppProvider from App.tsx
3. Update documentation
4. Remove unused Jotai atoms