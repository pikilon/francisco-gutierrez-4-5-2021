import { FunctionComponent, memo } from "react";

interface Props {
  price: number;
  size: number;
  total: number;
  maxTotal: number;
  isBid: boolean;
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
  isBid,
}) => {
  const color = isBid ? "#7F1D1D" : "#047857";
  return (
    <tr style={generateBackground(total, maxTotal, color)}>
      <td className="p-3">{price.toLocaleString()}</td>
      <td className="p-3">{size.toLocaleString()}</td>
      <td className="p-3">{total.toLocaleString()}</td>
    </tr>
  );
};

export const OrderbookItem = memo(OrderbookItemNotMemoized);
