import React from 'react';
import { SkeletonBox } from './SkeletonBox';

interface SkeletonTextProps {
  width?: number | string;
  height?: number;
  lines?: number;
  spacing?: number;
}

/**
 * Skeleton text component - displays multiple lines of skeleton text
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  width = '100%',
  height = 16,
  lines = 1,
  spacing = 8,
}) => {
  return (
    <>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBox
          key={index}
          width={index === lines - 1 ? width : '100%'}
          height={height}
          style={{
            marginBottom: index < lines - 1 ? spacing : 0,
          }}
        />
      ))}
    </>
  );
};
