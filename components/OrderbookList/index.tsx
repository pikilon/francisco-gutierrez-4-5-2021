import { FunctionComponent, useMemo } from "react";
import { OrderbookItem } from "../OrderbookItem";

export const GROUP_INTERVALS = [
  0.5,
  1,
  2.5,
  5,
  10,
  25,
  50,
  100,
  250,
  500,
  1000,
  2500,
];

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
  const ascSorted = useMemo(() => {
    let total = 0;
    const ascSorted: IAskBidTotalObject[] = Array.from(items.values())
      .sort((a, b) => a.price - b.price)
      .map((item) => {
        total = total + item.price;
        return { ...item, total };
      });

    return ascSorted;
  }, [items]);

  const groupedItems = useMemo(() => {
    if (groupStep === 0.5 || !ascSorted.length) return ascSorted;

    const { groupedMap } = ascSorted.reduce<{
      groupedMap: Map<number, IAskBidTotalObject>;
      lastInterval: number;
    }>(
      (result, item) => {
        const { groupedMap, lastInterval } = result;
        const group = groupedMap.get(lastInterval);

        if (group && item.price <= lastInterval) {
          group.size += item.size;
          group.total += item.total;
          groupedMap.set(lastInterval, group);
          return result;
        }
        const total = group ? group.total + item.total : item.total;
        const interval = Math.round(item.price) + groupStep;
        result.lastInterval = interval;
        groupedMap.set(interval, { ...item, price: interval, total });
        return result;
      },
      { groupedMap: new Map(), lastInterval: 0 }
    );
    const result = Array.from(groupedMap.values());

    return result;
  }, [groupStep, ascSorted]);

  const limitedItems = useMemo(() => {
    const limited = groupedItems.slice(limit * -1);
    return type === "bids" ? limited.reverse() : limited;
  }, [limit, groupedItems, type]);

  const maxTotal = groupedItems[groupedItems.length - 1].total;
  return (
    <table className="table-fixed w-full">
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
            maxTotal={maxTotal}
          />
        ))}
      </tbody>
    </table>
  );
};
