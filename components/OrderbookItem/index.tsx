import { FunctionComponent, memo } from "react";

interface Props {
  price: number;
  size: number;
  total: number;
  maxTotal: number;
}

const generateBackground = (
  itemTotal: number,
  maxTotal: number,
  color: string
) => {
  const percentage = Math.round((itemTotal * 100) / maxTotal);

  return {
    background: `linear-gradient(90deg, ${color} ${percentage}%, transparent 0)`,
  };
};

const OrderbookItemNotMemoized: FunctionComponent<Props> = ({
  price,
  size,
  total,
  maxTotal,
}) => {
  return (
    <tr style={generateBackground(total, maxTotal, "red")}>
      <td className="p-3">{price.toLocaleString()}</td>
      <td className="p-3">{size.toLocaleString()}</td>
      <td className="p-3">{total.toLocaleString()}</td>
    </tr>
  );
};

export const OrderbookItem = memo(OrderbookItemNotMemoized);
