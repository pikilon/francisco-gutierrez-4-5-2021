import React, { FunctionComponent } from "react";
import { Layout } from "../components/Layout";
import { Orderbook, IOrderBookProps } from "../components/Orderbook";
import { getSubscriptionParams, FEED } from "../lib/orderbook";
const W3CWebSocket = require("websocket").w3cwebsocket;

const PRERENDER_MAX_SECONDS = 2;

const IndexPage: FunctionComponent<IOrderBookProps> = (props) => {
  return (
    <Layout title="Francisco Gutierrez - Order book">
      <Orderbook {...props} />
    </Layout>
  );
};

export default IndexPage;

export async function getStaticProps() {
  const props = await new Promise((resolve) => {
    const result: IOrderBookProps = { initialAsks: [], initialBids: [] };
    try {
      const socket = new W3CWebSocket(FEED);

      socket.onopen = () => {
        socket.send(getSubscriptionParams());
      };
      socket.onmessage = (msg: { data: string }) => {
        const data = JSON.parse(msg.data);
        const { asks, bids, feed } = data;

        if (feed === "book_ui_1_snapshot") {
          result.initialAsks = asks;
          result.initialBids = bids;

          socket.send(getSubscriptionParams(true));
          socket.close();
          resolve(result);
        }
      };
    } catch (error) {
      console.log("error fetching feed for orderbook");
      resolve(result);
    }
  });

  return { props, revalidate: PRERENDER_MAX_SECONDS };
}
