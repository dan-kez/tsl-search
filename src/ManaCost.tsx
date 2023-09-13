const manaCostRegex = /(?:\{([^{}/\s]+?)\}|( \/\/ ))/g;

const ManaCost = ({ mana_cost }: { mana_cost: string }) => {
  const splitManaCostMatchAll = mana_cost.matchAll(manaCostRegex);
  const splitManaCost = Array.from(splitManaCostMatchAll).map(
    ([, group1, group2]) => group1 || group2
  );
  if (!splitManaCost) return undefined;
  return Array.from(splitManaCost).map((symbol, i) => {
    if (symbol === ' // ') {
      return <span> // </span>;
    }
    return (
      <i
        key={i}
        className={`ms ms-${symbol.toLowerCase()} ms-cost ms-shadow`}
      ></i>
    );
  });
};

export default ManaCost;
