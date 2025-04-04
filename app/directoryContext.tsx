"use client";

import React, { createContext, useContext, useState } from 'react';

interface DirectoryContextType {
  directory: string;
  setDirectory: React.Dispatch<React.SetStateAction<string>>;
}

const DirectoryContext = createContext<DirectoryContextType | undefined>(undefined);

export const DirectoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [directory, setDirectory] = useState("C:\\honey\\root");

  return (
    <DirectoryContext.Provider value={{ directory, setDirectory }}>
      {children}
    </DirectoryContext.Provider>
  );
};

export const useDirectory = () => {
  const context = useContext(DirectoryContext);
  if (context === undefined) {
    throw new Error('useDirectory must be used within a DirectoryProvider');
  }
  return context;
};
