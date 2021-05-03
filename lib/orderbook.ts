export const FEED = "wss://www.cryptofacilities.com/ws/v1";

export const getSubscriptionParams = (unsubscribe = false) =>
  JSON.stringify({
    event: unsubscribe ? "unsubscribe" : "subscribe",
    feed: "book_ui_1",
    product_ids: ["PI_XBTUSD"],
  });
