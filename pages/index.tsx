import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import { OrderbookItem } from "../components/OrderbookItem";

const FEED_ID = "book_ui_1";

const getSubscriptionParams = (unsubscribe = false) =>
  JSON.stringify({
    event: unsubscribe ? "unsubscribe" : "subscribe",
    feed: FEED_ID,
    product_ids: ["PI_XBTUSD"],
  });

type TAsksBids = [number, number];

type TAskBidTotal = { price: number; size: number };

type TOrderBookDictionary = { [price: string]: TAskBidTotal };

// Sets states in a non-blocking way
const getBidAskObject = (data: TAsksBids) => {
  const [price, size] = data;
  return { price, size, total: 0 };
};

const IndexPage = () => {
  const [asksMap, setAsksMap] = useState<Map<number, TAskBidTotal>>(new Map());
  const [bidsMap, setBidsMap] = useState<Map<number, TAskBidTotal>>(new Map());

  const updateAskBid = (isBid: Boolean) => (askBid: TAsksBids) => {
    const mapToUpdate = isBid ? bidsMap : asksMap; 
    const update = isBid ? setBidsMap : setAsksMap; 
    const [price, size] = askBid;

    if (size === 0) {
      mapToUpdate.delete(price);
    } else {
      mapToUpdate.set(price, { price, size });
    }
    const resultMap = new Map(mapToUpdate);
    update(resultMap)
  };
  useEffect(() => {
    const socket = new WebSocket("wss://www.cryptofacilities.com/ws/v1");
    let count = 0;

    socket.onopen = (evt) => {
      socket.send(getSubscriptionParams());
    };

    socket.onmessage = async (msg) => {
      const data = JSON.parse(msg.data);
      const { asks, bids } = data;

      if (asks) {
        (asks as TAsksBids[]).forEach(updateAskBid(false));
      }

      if (bids) {
        (bids as TAsksBids[]).forEach(updateAskBid(true));
      }
      count++;
      if (count === 85) socket.send(getSubscriptionParams(true));
    };

    return () => {
      socket.send(getSubscriptionParams(true));
      socket.close();
    };
  }, []);

  let totalBids = 0;
  

  return (
    <Layout title="Home | Next.js + TypeScript Example">
      <h1>Hello Next.js 👋</h1>
      <table>
        <thead>
          <tr>
            <th>Price</th>
            <th>Size</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(bidsMap.values()).map((bid) => (
            <OrderbookItem
              key={bid.price}
              {...bid}
              total={((totalBids += bid.price), totalBids)}
            />
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default IndexPage;
