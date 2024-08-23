"use client";

import WindowHeader from "@/components/window/windowHeader";
import { Rnd, DraggableData } from "react-rnd";
import { useState, useEffect } from "react";

const WindowContainer = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1020, height: 640 });
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });
  const [previousSize, setPreviousSize] = useState(windowSize);
  const [previousPosition, setPreviousPosition] = useState(windowPosition);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const initialX = (viewportWidth - windowSize.width) / 2;
    const initialY = (viewportHeight - windowSize.height) / 2;
    setWindowPosition({ x: initialX, y: initialY });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleMaximize = () => {
    setIsAnimating(true);

    if (isMaximized) {
      setWindowSize(previousSize);
      setWindowPosition(previousPosition);
      setIsMaximized(false);
    } else {
      setPreviousSize(windowSize);
      setPreviousPosition(windowPosition);
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      setWindowPosition({ x: 0, y: 0 });
      setIsMaximized(true);
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleDoubleClick = () => {
    handleMaximize();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`absolute z-10 ${isMaximized ? "inset-0" : ""} ${
        isAnimating ? "transition-all duration-300 ease-in-out" : ""
      }`}
    >
      <Rnd
        size={windowSize}
        position={windowPosition}
        minWidth={200}
        minHeight={150}
        dragHandleClassName="draggable-handle"
        onResizeStop={(_e, _direction, ref, _delta, position) => {
          setWindowSize({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
          });
          setWindowPosition(position);
        }}
        onDragStop={(_e: React.SyntheticEvent, d: DraggableData) => {
          const newY = d.y < 0 ? 0 : d.y;
          setWindowPosition({ x: d.x, y: newY });
        }}
        enableResizing={!isMaximized}
        className={`bg-gray-50/75 shadow-xl ${isMaximized ? "" : "rounded-lg"}`}
        style={{
          transition: isAnimating ? "all 0.3s ease-in-out" : "none",
        }}
      >
        <div className="draggable-handle" onDoubleClick={handleDoubleClick}>
          <WindowHeader onClose={handleClose} onMaximize={handleMaximize} />
        </div>
      </Rnd>
    </div>
  );
};

export default WindowContainer;
