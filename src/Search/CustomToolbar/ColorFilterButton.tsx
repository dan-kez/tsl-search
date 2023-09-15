import { MouseEventHandler } from 'react';

const ColorFilterButton = ({
  onClick,
  isActive,
  color,
}: {
  onClick: MouseEventHandler<HTMLElement>;
  isActive: boolean,
  color: 'W' | 'U' | 'B' | 'R' | 'G';
}) => {
  console.log(isActive);
  return (
    <button
      className={`mana-filter-button${isActive ? ' active': ''}`}
      onClick={onClick}
    >
      <i className={`ms ms-${color.toLowerCase()} ms-cost ms-shadow`} onClick={onClick}></i>
    </button>
  );
};

export default ColorFilterButton;
