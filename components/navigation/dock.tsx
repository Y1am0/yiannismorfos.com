"use client";

import React from "react";
import { useWindowManager } from "@/components/windowManager";
import { apps } from "@/lib/appList";
import appComponents from "@/lib/appList"; // Import the component mapping
import AppIcon from "@/components/appIcon";

const Dock: React.FC = () => {
  const { openWindow, setActiveWindow } = useWindowManager();

  const handleOpenWindow = (key: string) => {
    const Component = appComponents[key]; // Get the component from the mapping
    if (Component) {
      openWindow(
        <Component />,
        key,
        apps.find((app) => app.key === key)?.name || "App"
      );
      setActiveWindow(key); // Bring the window to the front
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-200/50 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-center space-x-4">
      {apps.map((app) => (
        <div
          key={app.key}
          onClick={() => handleOpenWindow(app.key)}
          className="dock-icon cursor-pointer"
        >
          <AppIcon src={app.icon} alt={app.name} />
        </div>
      ))}
    </div>
  );
};

export default Dock;
