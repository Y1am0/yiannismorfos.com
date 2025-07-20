/**
 * Simple development logger for debugging state changes
 */
export const createDevLogger = (storeName: string) => {
  return (action: string, previousState: unknown, newState: unknown) => {
    if (process.env.NODE_ENV === "development") {
      console.group(`[${storeName}] ${action}`);
      console.log("Previous:", previousState);
      console.log("New:", newState);
      console.groupEnd();
    }
  };
};

/**
 * Performance monitor for state updates
 */
export const createPerfMonitor = (storeName: string) => {
  return (action: string, duration: number) => {
    if (duration > 16 && process.env.NODE_ENV === "development") {
      console.warn(
        `[${storeName}] Slow state update: ${duration.toFixed(
          2
        )}ms for ${action}`
      );
    }
  };
};

/**
 * Simple error handler
 */
export const createErrorHandler = (storeName: string) => {
  return (action: string, error: Error) => {
    console.error(`[${storeName}] Error in ${action}:`, error);
  };
};

/**
 * Development-only state validator
 */
export const validateState = <T extends Record<string, unknown>>(
  state: T,
  storeName: string,
  expectedKeys: (keyof T)[]
): void => {
  if (process.env.NODE_ENV === "development") {
    const missingKeys = expectedKeys.filter((key) => !(key in state));

    if (missingKeys.length > 0) {
      console.warn(`[${storeName}] Missing expected state keys:`, missingKeys);
    }
  }
};

/**
 * Utility for timing operations
 */
export const timeOperation = <T>(
  operation: () => T,
  operationName: string,
  storeName: string
): T => {
  const startTime = performance.now();
  const result = operation();
  const duration = performance.now() - startTime;

  const perfMonitor = createPerfMonitor(storeName);
  perfMonitor(operationName, duration);

  return result;
};
