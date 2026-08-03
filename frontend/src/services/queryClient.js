import { QueryClient } from "@tanstack/react-query";

// Put this at src/services/queryClient.js
// Imported once, in main.jsx, and wrapped around <App />.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});