import React from "react";

const MANA_COST_REGEX = /(?:\{([^{}/\s]+?)\}|( \/\/ ))/g;

const ManaCost = ({ mana_cost }: { mana_cost: string }) => {
  const splitManaCostMatchAll = mana_cost.matchAll(MANA_COST_REGEX);
  const splitManaCost = Array.from(splitManaCostMatchAll).map(
    ([, group1, group2]) => group1 || group2
  );
  if (!splitManaCost) return undefined;
  return Array.from(splitManaCost).map((symbol, i) => {
    if (symbol === ' // ') {
      return <span key={i}> // </span>;
    }
    return (
      <i
        key={i}
        className={`ms ms-${symbol.toLowerCase()} ms-cost ms-shadow`}
      ></i>
    );
  });
};

const MemoizedManaCost = React.memo(ManaCost);

export default MemoizedManaCost;
