/// <reference types="next" />
/// <reference types="next/types/global" />

type TAskBid = [number, number];

type TAskBidTotal = { price: number; size: number };

type TAsksBidsMap = Map<number, TAskBidTotal>
