import React, { createContext, useEffect, useState } from 'react';
import LoadingOverlay from 'react-loading-overlay';
export const LoadingContext = createContext();

export default function LoadingContextProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  console.log('loadingContextProvider isLoading', isLoading);
  useEffect(() => setIsLoading(false), [setIsLoading]);
  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      <LoadingOverlay
        styles={{
          wrapper: { height: '100vh' },
        }}
        active={isLoading}
      >
        {children}
      </LoadingOverlay>
    </LoadingContext.Provider>
  );
}
