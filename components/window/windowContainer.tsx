"use client";

import WindowHeader from "@/components/window/windowHeader";
import { Resizable } from "re-resizable";
import Draggable from "react-draggable";

const WindowContainer = () => {
  return (
    <div className="absolute z-10">
      <Draggable handle=".draggable-handle">
        <Resizable
          defaultSize={{
            width: 1020,
            height: 640,
          }}
          minWidth={200}
          minHeight={150}
          className="bg-gray-50/75 shadow-xl rounded-lg"
        >
          <div className="draggable-handle">
            <WindowHeader />
          </div>
        </Resizable>
      </Draggable>
    </div>
  );
};

export default WindowContainer;
