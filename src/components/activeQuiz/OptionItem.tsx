// components/activeQuiz/OptionItem.tsx
import React from "react";

const styles = `
@keyframes highlightAnim {
  0% { background-size: 0% 100%; }
  100% { background-size: 100% 100%; }
}

.highlighted {
  background-image: linear-gradient(to right, #fef08a 0%, #fef08a 100%);
  background-repeat: no-repeat;
  background-position: left center;
  animation: highlightAnim 0.3s ease-out;
}

@media (max-width: 640px) {
  .highlighted {
    background-size: 100% 100% !important;
    animation: none;
  }
}
`;
type OptionItemProps = {
  option: string;
  selected: boolean;
  onSelect: () => void;
};

export const OptionItem: React.FC<OptionItemProps> = ({
  option,
  selected,
  onSelect,
}) => {
  return (
    <div className="flex items-center cursor-pointer group w-full" onClick={onSelect}>
        <style>{styles}</style>
      <div
        className={`flex items-center w-full p-2 sm:p-3 rounded-md transition-all duration-200 ${
          selected ? "highlighted border-yellow-400" : "hover:bg-gray-50"
        }`}
      >
        <span
          className={`text-base sm:text-lg relative z-10 flex-1 ${
            selected ? "text-gray-800 font-medium" : "text-gray-700"
          }`}
        >
          {option}
        </span>
      </div>
    </div>
  );
};
