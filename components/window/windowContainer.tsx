"use client";

import { useEffect, useState } from "react";
import WindowHeader from "@/components/window/windowHeader";
import { Rnd } from "react-rnd";

const ANIMATION_DURATION = 300;

interface WindowContainerProps {
  onClose: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  initialPosition: { x: number; y: number };
  initialSize: { width: number; height: number };
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const WindowContainer: React.FC<WindowContainerProps> = ({
  onClose,
  onPositionChange,
  onSizeChange,
  initialPosition,
  initialSize,
  isActive,
  onClick,
  children,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [windowSize, setWindowSize] = useState(initialSize);
  const [windowPosition, setWindowPosition] = useState(initialPosition);
  const [previousSize, setPreviousSize] = useState(windowSize);
  const [previousPosition, setPreviousPosition] = useState(windowPosition);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isMaximized) {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      setWindowPosition({ x: 0, y: 0 });
    } else {
      setWindowSize(initialSize);
      setWindowPosition(initialPosition);
    }
  }, [isMaximized, initialPosition, initialSize]);

  const handleClose = () => {
    setIsAnimating(true);
    setIsClosing(true);

    setWindowSize((prevSize) => ({
      width: prevSize.width * 0.8,
      height: prevSize.height * 0.8,
    }));
    setWindowPosition((prevPosition) => ({
      x: prevPosition.x + windowSize.width * 0.1,
      y: prevPosition.y + windowSize.height * 0.1,
    }));

    setTimeout(() => {
      onClose();
      setIsAnimating(false);
      setIsClosing(false);
    }, ANIMATION_DURATION);
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
    }, ANIMATION_DURATION);
  };

  const handleDragStop = (_e: any, d: any) => {
    if (!isMaximized) {
      const newPosition = { x: d.x, y: d.y < 0 ? 0 : d.y };
      setWindowPosition(newPosition);
      onPositionChange(newPosition);
    }
  };

  const handleResizeStop = (
    _e: any,
    _direction: any,
    ref: any,
    _delta: any,
    position: any
  ) => {
    if (!isMaximized) {
      const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
      setWindowSize(newSize);
      setWindowPosition(position);
      onSizeChange(newSize);
      onPositionChange(position);
    }
  };

  return (
    <>
      <Rnd
        size={windowSize}
        position={windowPosition}
        minWidth={200}
        minHeight={150}
        dragHandleClassName="draggable-handle"
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        enableResizing={!isMaximized}
        className={`bg-gray-50/75 shadow-xl ${
          isMaximized ? "" : "rounded-lg"
        } ${isActive ? "z-50" : "z-10"}`}
        style={{
          transition: isAnimating ? "all 0.3s ease-in-out" : "none",
          opacity: isClosing ? 0 : 1,
        }}
        onClick={onClick}
      >
        <div className="draggable-handle">
          <WindowHeader
            onClose={handleClose}
            onDoubleClick={handleMaximize}
            onMaximize={handleMaximize}
          />
        </div>
        <div className="p-4">{children}</div>
      </Rnd>
    </>
  );
};

export default WindowContainer;
