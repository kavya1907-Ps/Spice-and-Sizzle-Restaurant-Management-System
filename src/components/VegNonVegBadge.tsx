import React from 'react';

interface VegNonVegBadgeProps {
  isVeg: boolean;
  showLabel?: boolean;
}

export const VegNonVegBadge: React.FC<VegNonVegBadgeProps> = ({ isVeg, showLabel = false }) => {
  return (
    <span
      className="inline-flex items-center gap-1.5 shrink-0"
      title={isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
    >
      <span
        className={`w-4 h-4 rounded-[3px] border-[1.5px] flex items-center justify-center bg-white shrink-0 ${
          isVeg ? 'border-[#15803D]' : 'border-[#B91C1C]'
        }`}
        aria-hidden="true"
      >
        {isVeg ? (
          <span className="w-2 h-2 rounded-full bg-[#15803D]" />
        ) : (
          <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[7px] border-b-[#B91C1C]" />
        )}
      </span>
      {showLabel && (
        <span
          className={`text-xs font-medium whitespace-nowrap ${
            isVeg ? 'text-[#15803D]' : 'text-[#B91C1C]'
          }`}
        >
          {isVeg ? 'Veg' : 'Non-Veg'}
        </span>
      )}
    </span>
  );
};
