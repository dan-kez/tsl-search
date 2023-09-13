const manaCostRegex = /(?:\{([^{}/\s]+?)\}|( \/\/ ))/g;

const ManaCost = ({ mana_cost }: { mana_cost: string }) => {
  const splitManaCostMatchAll = mana_cost.matchAll(manaCostRegex);
  const splitManaCost = Array.from(splitManaCostMatchAll).map(
    ([, group1, group2]) => group1 || group2
  );
  if (!splitManaCost) return undefined;
  return Array.from(splitManaCost).reduce((acc, e, i) => {
    if (e === ' // ') {
      acc.push(<span>e </span>);
      return acc;
    }
    const el = <i key={i} className={`ms ms-${e.toLowerCase()} ms-cost`}></i>;
    acc.push(el);
    return acc;
  }, [] as JSX.Element[]);
};

export default ManaCost;
