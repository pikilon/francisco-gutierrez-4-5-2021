import { FunctionComponent, useMemo } from "react";
import { OrderbookItem } from "../OrderbookItem";

interface Props {
  type: "bids" | "asks";
  items: TAsksBidsMap;
  groupStep: number;
  limit: number;
}

export const OrderbookList: FunctionComponent<Props> = ({
  type,
  items,
  limit,
  groupStep = 0.5,
}) => {
  const { total, ascSorted } = useMemo(() => {
    let total = 0;
    const ascSorted = Array.from(items.values())
      .sort((a, b) => a.price - b.price)
      .map((item) => {
        total = total + item.price;
        return { ...item, total };
      });

    return {
      total,
      ascSorted,
    };
  }, [type, items]);

  const limitedItems = useMemo(() => {
    const limited = ascSorted.slice(limit * -1);
    return type === "bids" ? limited.reverse() : limited;
  }, [limit, ascSorted, type]);

  return (
    <table className="table-auto w-full">
      <thead>
        <tr>
          <th>Price</th>
          <th>Size</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {limitedItems.map((item) => (
          <OrderbookItem
            key={item.price}
            isBid={type === "bids"}
            {...item}
            maxTotal={total}
          />
        ))}
      </tbody>
    </table>
  );
};
