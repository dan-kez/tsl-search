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
    console.log(activeColor)
  return (
    <>
      {COLORS.map((color) => (
        <ColorFilterButton
          key={color}
          color={color}
          isActive={color === activeColor}
          onClick={() => {
            console.log(color);
            setActiveColor(color);
            setFilterModel((currentFilters) => {
              return {
                ...currentFilters,
                items: [
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
