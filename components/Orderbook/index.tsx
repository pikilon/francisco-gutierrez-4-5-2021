import {
  ChangeEvent,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { FEED, getSubscriptionParams } from "../../lib/orderbook";
import { OrderbookList, GROUP_INTERVALS } from "../OrderbookList";

const GROUP_DEBOUNCE_MILLISECONDS = 500;

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
  const [connectionError, setConnectionError] = useState(false);
  const [asksMap, setAsksMap] = useState(setAsksBidsToMap(initialAsks));
  const [bidsMap, setBidsMap] = useState(setAsksBidsToMap(initialBids));
  const [groupStep, setGroupStep] = useState(0);
  const [debouncedGroupStep, setDebouncedGroupStep] = useState(groupStep);
  const [limit, setLimit] = useState(10);

  const handleGroupStep = useCallback(
    (increase: boolean) => () => {
      let increment = increase ? groupStep + 1 : groupStep - 1;
      if (increment < 0) increment = 0;
      if (increment > GROUP_INTERVALS.length - 1)
        increment = GROUP_INTERVALS.length - 1;

      setGroupStep(increment);
    },
    [groupStep]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedGroupStep(groupStep);
    }, GROUP_DEBOUNCE_MILLISECONDS);

    return () => {
      clearTimeout(handler);
    };
  }, [groupStep]);

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
    let socket: WebSocket;
    try {
      socket = new WebSocket(FEED);
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
        setConnectionError(false);
      };
    } catch (error) {
      setConnectionError(true);
    }

    return () => {
      if (socket) {
        socket.send(getSubscriptionParams(true));
        socket.close();
      }
    };
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl text-center">Orderbook Francisco</h1>
      {connectionError && (
        <div className="text-center bg-red-100 p-4 my-2 border-2 border-red-900 text-red-900">
          We are having connection problems
        </div>
      )}
      <div className="my-4 flex flex-col text-sm sm:flex-row sm:justify-center">
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
        <div className="ml-4 flex items-center content-center justify-around">
          <button
            disabled={groupStep === 0}
            onClick={handleGroupStep(false)}
            className="disabled:opacity-50 focus:outline-none bg-red-400 w-4 h-4 p-4 text-xl font-bold tracking-wider text-white rounded-full hover:bg-red-900 inline-flex items-center justify-center"
          >
            -
          </button>
          <div className="mx-2">Grouped by {GROUP_INTERVALS[groupStep]}</div>
          <button
            disabled={groupStep === GROUP_INTERVALS.length - 1}
            onClick={handleGroupStep(true)}
            className="disabled:opacity-50 focus:outline-none bg-green-500 w-4 h-4 p-4 text-xl font-bold tracking-wider text-white rounded-full hover:bg-green-600 inline-flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
      <div className="flex flex-col text-sm sm:flex-row sm:items-stretch sm:justify-center">
        <section className="bg-gray-700 text-gray-100">
          <h1 className="text-2xl text-center capitalize p-4">Bids</h1>
          <OrderbookList
            limit={limit}
            type="bids"
            items={bidsMap}
            groupStep={GROUP_INTERVALS[debouncedGroupStep]}
          />
        </section>
        <section className="mt-4 sm:mt-0 sm:ml-4 bg-gray-700 text-gray-100">
          <h1 className="text-2xl text-center capitalize p-4">Asks</h1>
          <OrderbookList
            limit={limit}
            type="asks"
            items={asksMap}
            groupStep={GROUP_INTERVALS[debouncedGroupStep]}
          />
        </section>
      </div>
    </div>
  );
};
