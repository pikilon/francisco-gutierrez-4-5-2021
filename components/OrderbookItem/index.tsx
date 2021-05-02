import { FunctionComponent, memo } from "react";

interface Props {
  price: number;
  size: number;
  total: number;
}

const OrderbookItemNotMemoized: FunctionComponent<Props> = ({
  price,
  size,
  total,
}) => {
  return (
    <tr>
      <td>{price.toLocaleString()}</td>
      <td>{size.toLocaleString()}</td>
      <td>{total.toLocaleString()}</td>
    </tr>
  );
};

export const OrderbookItem = memo(OrderbookItemNotMemoized);
