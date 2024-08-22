"use client";

import { Resizable } from "re-resizable";

const TaskBar = () => {
    return (
        <div className="absolute bottom-4">
        <Resizable
            defaultSize={{
                width: 1020,
                height: 64,
            }}
            minWidth={200}
            minHeight={64}
            maxWidth={1280}
            lockAspectRatio
            className="bg-gray-200/50 backdrop-blur-sm rounded-2xl"
        >
        </Resizable>
        </div>
    );
};

export default TaskBar;
