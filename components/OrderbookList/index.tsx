import { FunctionComponent, useMemo } from "react";
import { OrderbookItem } from "../OrderbookItem";

interface Props {
  type: "bids" | "asks";
  items: TAsksBidsMap;
  groupStep: number;
}

export const OrderbookList: FunctionComponent<Props> = ({
  type,
  items,
  groupStep = 0.5,
}) => {
  const { total, orderedItems } = useMemo(() => {
    let total = 0;
    const ascSorted = Array.from(items.values())
      .sort((a, b) => a.price - b.price)
      .map((item) => {
        total = total + item.price;
        return { ...item, total };
      });
    return {
      total,
      orderedItems: type === "bids" ? ascSorted.reverse() : ascSorted,
    };
  }, [type, items, groupStep]);

  return (
    <section className="bg-gray-700 text-gray-100 text-sm ">
      <h1 className="text-2xl text-center capitalize p-4">{type}</h1>
      <table className="table-auto">
        <thead>
          <tr>
            <th>Price</th>
            <th>Size</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orderedItems.map((item) => (
            <OrderbookItem
              key={item.price}
              {...item}
              maxTotal={total}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
};
