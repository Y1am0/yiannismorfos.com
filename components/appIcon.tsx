import Image from "next/image";
import React, { useState } from "react";

interface AppIconProps {
  src: string;
  alt: string;
  size?: number;
}

const AppIcon: React.FC<AppIconProps> = ({ src, alt, size = 48 }) => {
  const [hasError, setHasError] = useState(false);

  return (
    <>
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="rounded transition-transform duration-200 hover:scale-110"
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className="flex items-center justify-center bg-gray-300 text-gray-700 rounded"
          style={{ width: size, height: size }}
        >
          {alt.charAt(0).toUpperCase()}
        </div>
      )}
    </>
  );
};

export default AppIcon;
