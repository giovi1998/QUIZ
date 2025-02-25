// components/ProgressBar.tsx
import React from "react";
type ProgressBarProps = {
    progress: number;
  };
  
  const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    return (
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className="h-2 bg-blue-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };
  
  export default ProgressBar;