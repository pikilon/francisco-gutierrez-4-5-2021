import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { FEED, getSubscriptionParams } from "../../lib/orderbook";
import { OrderbookList } from "../OrderbookList";

const setAskBidToMap = (askBid: TAskBid, targetMap: TAsksBidsMap) => {
  const [price, size] = askBid;
  if (size === 0) {
    targetMap.delete(price);
  } else {
    targetMap.set(price, { price, size });
  }
  return targetMap;
};

const setInitialMaps = (asksBids: TAskBid[]) => {
  const result: TAsksBidsMap = new Map();
  asksBids.forEach((askBid) => setAskBidToMap(askBid, result));
  return result;
};

export interface IOrderBookProps {
  initialAsks: TAskBid[];
  initialBids: TAskBid[];
}

export const Orderbook: FunctionComponent<IOrderBookProps> = ({
  initialAsks,
  initialBids,
}) => {
  const [asksMap, setAsksMap] = useState(setInitialMaps(initialAsks));
  const [bidsMap, setBidsMap] = useState(setInitialMaps(initialBids));
  const [groupStep] = useState(0.5);

  const updateAskBid = useCallback(
    (isBid: Boolean) => async (askBid: TAskBid) => {
      const mapToUpdate = isBid ? bidsMap : asksMap;
      const update = isBid ? setBidsMap : setAsksMap;

      const resultMap = new Map(setAskBidToMap(askBid, mapToUpdate));
      update(resultMap);
    },
    []
  );
  useEffect(() => {
    const socket = new WebSocket(FEED);

    socket.onopen = () => {
      socket.send(getSubscriptionParams());
    };

    socket.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);
      const { asks, bids } = data;

      if (asks) {
        (asks as TAskBid[]).forEach(updateAskBid(false));
      }

      if (bids) {
        (bids as TAskBid[]).forEach(updateAskBid(true));
      }
    };

    return () => {
      socket.send(getSubscriptionParams(true));
      socket.close();
    };
  }, []);

  return (
    <div className="flex">
      <div>
        <OrderbookList type="bids" items={bidsMap} groupStep={groupStep} />
      </div>
      <div className="ml-8">
        <OrderbookList type="asks" items={asksMap} groupStep={groupStep} />
      </div>
    </div>
  );
};
