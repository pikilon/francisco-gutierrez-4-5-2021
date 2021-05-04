import {
  ChangeEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
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

const setAsksBidsToMap = (
  asksBids: TAskBid[],
  targetMap: TAsksBidsMap = new Map()
) => {
  asksBids.forEach((askBid) => setAskBidToMap(askBid, targetMap));
  return targetMap;
};

export interface IOrderBookProps {
  initialAsks: TAskBid[];
  initialBids: TAskBid[];
}

export const Orderbook: FunctionComponent<IOrderBookProps> = ({
  initialAsks,
  initialBids,
}) => {
  const [asksMap, setAsksMap] = useState(setAsksBidsToMap(initialAsks));
  const [bidsMap, setBidsMap] = useState(setAsksBidsToMap(initialBids));
  const [groupStep] = useState(0.5);
  const [limit, setLimit] = useState(10);

  const handleLimitChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      const number = Number(value);
      if (number && number >= 5) setLimit(number);
    },
    []
  );

  const updateAskBids = useCallback(
    async (asksBids: TAskBid[], isBid: Boolean) => {
      const mapToUpdate = isBid ? bidsMap : asksMap;
      const update = isBid ? setBidsMap : setAsksMap;

      const resultMap = new Map(setAsksBidsToMap(asksBids, mapToUpdate));
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
        updateAskBids(asks as TAskBid[], false);
      }

      if (bids) {
        updateAskBids(bids as TAskBid[], true);
      }
    };

    return () => {
      socket.send(getSubscriptionParams(true));
      socket.close();
    };
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl text-center">Orderbook Francisco</h1>
      <div className="mb-4 flex flex-col text-sm sm:flex-row sm:justify-center">
        <label>
          <h3 className="text-xl">Limit results</h3>
          <input
            type="number"
            step="5"
            min="5"
            name="limit"
            value={limit}
            onChange={handleLimitChange}
            className="p-3 border-2 rounded-lg"
          />
        </label>
      </div>
      <div className="flex flex-col text-sm sm:flex-row sm:items-stretch sm:justify-center">
        <section className="bg-gray-700 text-gray-100">
          <h1 className="text-2xl text-center capitalize p-4">Bids</h1>
          <OrderbookList
            limit={limit}
            type="bids"
            items={bidsMap}
            groupStep={groupStep}
          />
        </section>
        <section className="mt-4 sm:mt-0 sm:ml-4 bg-gray-700 text-gray-100">
          <h1 className="text-2xl text-center capitalize p-4">Asks</h1>
          <OrderbookList
            limit={limit}
            type="asks"
            items={asksMap}
            groupStep={groupStep}
          />
        </section>
      </div>
    </div>
  );
};
