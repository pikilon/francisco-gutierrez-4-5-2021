/// <reference types="next" />
/// <reference types="next/types/global" />

type TAskBid = [number, number];

interface IAskBidObject {
  price: number;
  size: number;
}
interface IAskBidTotalObject extends IAskBidObject {
  total: number;
}

type TAsksBidsMap = Map<number, IAskBidObject>;
