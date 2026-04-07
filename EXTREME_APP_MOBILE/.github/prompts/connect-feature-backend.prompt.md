---
description: "Connect a React Native screen feature to the backend API. Use when: implementing API integration, adding Redux state management, connecting mobile screens to backend, creating services for data sync"
agent: "agent"
argument-hint: "Screen file and feature to connect (e.g., MyShiftsScreen.tsx - unavailability feature)"
---

# Connect Feature to Backend

Connect a mobile screen feature to the backend with full API integration.

## Target
- **File**: $ARGUMENTS

## Requirements

1. **API Integration**
   - Create or update the API service following existing patterns in `src/services/`
   - Implement CRUD operations as needed (GET, POST, PUT, DELETE)
   - Use the project's existing `apiClient` or HTTP configuration

2. **State Management**
   - Create or update Redux slice in `src/store/slices/`
   - Use `createAsyncThunk` for async operations
   - Track loading, submitting, and error states
   - Register the reducer in the store

3. **Screen Updates**
   - Connect component to Redux using `useSelector` and `useDispatch`
   - Fetch data on mount with `useEffect`
   - Implement proper UI feedback (loading indicators, error alerts, success messages)
   - Add pull-to-refresh where appropriate

4. **TypeScript**
   - Define proper interfaces for API payloads and responses
   - Ensure type safety throughout

5. **Multi-Role Visibility**
   - If data should be visible to Admin/Scheduler/Manager roles, add appropriate API endpoints and UI toggles

## Process

1. First, inspect the existing screen file and identify the feature to connect
2. Review existing API/service patterns in the project
3. Review existing Redux/store patterns
4. Implement the changes directly without placeholder code
5. Ensure the code is production-ready

## Output

- Updated screen file with full backend integration
- New or updated service file
- New or updated Redux slice
- Any required store configuration updates
