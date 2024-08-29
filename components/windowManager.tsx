"use client";

import { createContext, useContext, useState } from "react";
import WindowContainer from "./window/windowContainer";

interface WindowManagerContextType {
  windows: {
    content: React.ReactNode;
    key: string;
    appName: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }[];
  activeWindowKey: string | null;
  openWindow: (content: React.ReactNode, key: string, appName: string) => void;
  closeWindow: (key: string) => void;
  setActiveWindow: (key: string) => void;
  updateWindowPosition: (
    index: number,
    position: { x: number; y: number }
  ) => void;
  updateWindowSize: (
    index: number,
    size: { width: number; height: number }
  ) => void;
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(
  null
);

export const useWindowManager = (): WindowManagerContextType => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error(
      "useWindowManager must be used within a WindowManagerProvider"
    );
  }
  return context;
};

export const WindowManagerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [windows, setWindows] = useState<
    {
      content: React.ReactNode;
      key: string;
      appName: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
    }[]
  >([]);

  const [activeWindowKey, setActiveWindowKey] = useState<string | null>(null);

  const openWindow = (
    content: React.ReactNode,
    key: string,
    appName: string
  ) => {
    setWindows((prev) => {
      if (prev.some((window) => window.key === key)) {
        setActiveWindowKey(key);
        return prev;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const initialX = (viewportWidth - 1020) / 2;
      const initialY = (viewportHeight - 640) / 2;

      const newWindows = [
        ...prev,
        {
          content,
          key,
          appName,
          position: { x: initialX, y: initialY },
          size: { width: 1020, height: 640 },
        },
      ];

      setActiveWindowKey(key);
      return newWindows;
    });
  };

  const closeWindow = (key: string) => {
    setWindows((prev) => prev.filter((window) => window.key !== key));
    setActiveWindowKey((prevKey) => (prevKey === key ? null : prevKey));
  };

  const setActiveWindow = (key: string) => {
    setActiveWindowKey(key);
  };

  const updateWindowPosition = (
    index: number,
    position: { x: number; y: number }
  ) => {
    setWindows((prev) =>
      prev.map((window, i) => (i === index ? { ...window, position } : window))
    );
  };

  const updateWindowSize = (
    index: number,
    size: { width: number; height: number }
  ) => {
    setWindows((prev) =>
      prev.map((window, i) => (i === index ? { ...window, size } : window))
    );
  };

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        activeWindowKey,
        openWindow,
        closeWindow,
        setActiveWindow,
        updateWindowPosition,
        updateWindowSize,
      }}
    >
      {children}
      {windows.map((window, index) => (
        <WindowContainer
          key={window.key}
          onClose={() => closeWindow(window.key)}
          initialPosition={window.position}
          initialSize={window.size}
          onPositionChange={(position) => updateWindowPosition(index, position)}
          onSizeChange={(size) => updateWindowSize(index, size)}
          isActive={activeWindowKey === window.key}
          onClick={() => setActiveWindow(window.key)}
        >
          {window.content}
        </WindowContainer>
      ))}
    </WindowManagerContext.Provider>
  );
};
