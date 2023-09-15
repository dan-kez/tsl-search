import { GridFilterModel } from '@mui/x-data-grid';
import { useState } from 'react';
import ColorFilterButton from './ColorFilterButton';

const COLORS = ['W', 'U', 'B', 'R', 'G'] as const;

const ColorFilters = ({
  setFilterModel,
}: {
  setFilterModel: React.Dispatch<
    React.SetStateAction<GridFilterModel | undefined>
  >;
}) => {
  const [activeColor, setActiveColor] = useState<string>();

  return (
    <>
      {COLORS.map((color) => (
        <ColorFilterButton
          key={color}
          color={color}
          isActive={color === activeColor}
          onClick={() => {
            setActiveColor(color === activeColor ? undefined : color);
            setFilterModel((currentFilters) => {
              return {
                ...currentFilters,
                items:
                  // unset the color if it's already active
                  color === activeColor
                    ? []
                    : [
                        {
                          field: 'colors',
                          operator: 'equals',
                          value: color,
                        },
                      ],
              };
            });
          }}
        />
      ))}
    </>
  );
};

export default ColorFilters;
