import React from 'react';
import lionheadImg from '../assets/sg_lionhead.png';

interface LionHeadSymbolProps {
  className?: string;
  size?: number;
}

/**
 * Official Singapore Lion Head Symbol
 * Matches the exact emblem used on https://www.mas.gov.sg/
 * and official Singapore Government web mastheads.
 */
export const LionHeadSymbol: React.FC<LionHeadSymbolProps> = ({
  className = 'w-[15px] h-[17px]',
  size,
}) => {
  return (
    <img
      src={lionheadImg}
      alt="Singapore Lion Head Symbol"
      width={size || 15}
      height={size ? Math.round((size * 17) / 15) : 17}
      className={`inline-block shrink-0 object-contain select-none ${className}`}
      loading="eager"
    />
  );
};
