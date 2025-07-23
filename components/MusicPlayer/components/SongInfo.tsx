"use client";

import React from "react";
import { CURRENT_SONG } from "../config";
import { LAYOUT } from "../constants";

/**
 * Song information display component
 */
export const SongInfo: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Song title */}
      <div className={LAYOUT.songInfo.titleClasses}>{CURRENT_SONG.title}</div>

      {/* Artist name */}
      <div className={LAYOUT.songInfo.artistClasses}>
        by{" "}
        <span className={`truncate ${LAYOUT.songInfo.maxArtistWidth}`}>
          {CURRENT_SONG.artist}
        </span>
      </div>
    </div>
  );
};
