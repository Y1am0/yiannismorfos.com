"use client";

import React, { useState, useEffect } from "react";
import { useWindowManager } from "@/components/windowManager";
import lotusBackground from "@/public/backgrounds/lotus.jpg";
import { apps } from "@/lib/appList";
import appComponents from "@/lib/appList"; // Import the component mapping
import Image from "next/image";
import AppIcon from "./appIcon";
import { Rnd } from "react-rnd";

interface AppPosition {
  x: number;
  y: number;
}

const Desktop: React.FC = () => {
  const { openWindow, setActiveWindow } = useWindowManager();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [positions, setPositions] = useState<{ [key: string]: AppPosition }>(
    {}
  );
  const [positionsCalculated, setPositionsCalculated] = useState(false);

  const iconSize = 80;
  const gap = 20; // Gap between icons

  useEffect(() => {
    // Calculate initial positions when the component mounts or window resizes
    const calculateInitialPositions = () => {
      const newPositions: { [key: string]: AppPosition } = {};
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      let currentX = screenWidth - iconSize - gap;
      let currentY = gap;

      apps.forEach((app) => {
        if (currentY + iconSize > screenHeight) {
          currentY = gap;
          currentX -= iconSize + gap;
        }

        newPositions[app.key] = { x: currentX, y: currentY };
        currentY += iconSize + gap;
      });

      setPositions(newPositions);
      setPositionsCalculated(true); // Mark positions as calculated
    };

    calculateInitialPositions();
    window.addEventListener("resize", calculateInitialPositions);

    return () => {
      window.removeEventListener("resize", calculateInitialPositions);
    };
  }, []);

  const handleOpenWindow = (key: string) => {
    const Component = appComponents[key]; // Get the component from the mapping
    if (Component) {
      openWindow(
        <Component />,
        key,
        apps.find((app) => app.key === key)?.name || "App"
      );
      setActiveWindow(key); // Bring the window to the front
      setSelectedApp(null); // Reset selection when app is opened
    }
  };

  const handleSelectApp = (key: string) => {
    setSelectedApp(key);
  };

  const handleDragStop = (key: string, position: AppPosition) => {
    setPositions((prevPositions) => ({
      ...prevPositions,
      [key]: position,
    }));
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".desktop-icon")) {
      setSelectedApp(null); // Deselect when clicking outside of the icons
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative desktop-area p-4 min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-[-1]">
        <Image
          src={lotusBackground}
          alt="background image"
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
      </div>
      {/* App Icons */}
      {positionsCalculated && // Only render icons after positions are calculated
        apps.map((app) => (
          <Rnd
            key={app.key}
            bounds="parent"
            size={{ width: iconSize, height: iconSize }}
            position={positions[app.key] || { x: 0, y: 0 }}
            onDragStop={(e, d) => handleDragStop(app.key, { x: d.x, y: d.y })}
            className="cursor-pointer"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleSelectApp(app.key);
              }}
              onDoubleClick={() => handleOpenWindow(app.key)}
              className="flex flex-col items-center"
            >
              <div
                className={`p-1 rounded-sm ${
                  selectedApp === app.key
                    ? "border-2 border-gray-200/20 bg-black/40"
                    : "border-2 border-transparent"
                }`}
              >
                <AppIcon src={app.icon} alt={app.name} />
              </div>
              <p
                className={`mt-2 text-white text-sm text-center rounded-sm p-1 ${
                  selectedApp === app.key ? "bg-blue-500" : "bg-transparent"
                }`}
              >
                {app.name}
              </p>
            </div>
          </Rnd>
        ))}
    </div>
  );
};

export default Desktop;
