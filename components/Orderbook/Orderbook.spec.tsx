import { render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Orderbook } from "./";
import { GROUP_INTERVALS } from "../OrderbookList";

const getProps = () => ({
  doNotFetch: true,
  initialAsks: [
    [54236.5, 182397],
    [54237, 15000],
    [54237.5, 713],
    [54239.5, 2040],
    [54241, 18000],
    [54243.5, 10000],
    [54244, 12940],
    [54245, 29319],
    [54245.5, 450],
    [54246, 450],
    [54246.5, 14592],
    [54247.5, 2500],
    [54250, 9630],
    [54250.5, 6130],
    [54251.5, 55848],
    [54252, 6108],
    [54252.5, 10362],
    [54253, 27280],
    [54253.5, 20000],
    [54254, 2915],
    [54257.5, 10610],
    [54258, 56995],
    [54259, 1923],
    [54260.5, 57215],
    [54263, 12245],
  ] as TAskBid[],
  initialBids: [
    [54212.5, 6381],
    [54212, 3000],
    [54209.5, 20000],
    [54205.5, 10183],
    [54205, 6134],
    [54204.5, 67511],
    [54200.5, 25000],
    [54200, 20000],
    [54199.5, 23063],
    [54196.5, 6075],
    [54196, 50000],
    [54195.5, 20000],
    [54194.5, 20000],
    [54194, 40000],
    [54193, 78362],
    [54192.5, 40000],
    [54192, 56953],
    [54189.5, 2500],
    [54187, 2096],
    [54186, 246473],
    [54185.5, 30000],
    [54185, 6165],
    [54182, 2923],
    [54181, 1927],
    [54180, 122872],
  ] as TAskBid[],
});
const getComponent = (props = getProps()) => ({
  comp: render(<Orderbook {...props} />),
  props,
});

describe("OrderBook", () => {
  it("shold render all the info with default values", () => {
    const { comp } = getComponent();
    const limitInput = comp.getByTestId("limit-input");
    const groupDecrease = comp.getByTestId("group-decrease");
    const groupIncrease = comp.getByTestId("group-increase");
    const groupValue = comp.getByTestId("group-value");
    const bidsColumn = comp.getByTestId("bids-column");
    const asksColumn = comp.getByTestId("asks-column");

    expect(limitInput).toBeTruthy();
    expect(groupDecrease).toBeTruthy();
    expect(groupIncrease).toBeTruthy();
    expect(groupValue).toBeTruthy();
    expect(bidsColumn).toBeTruthy();
    expect(asksColumn).toBeTruthy();

    // @ts-ignore
    expect(limitInput.value).toEqual("10");
  });
  it("should set the limits", () => {
    const { comp, props } = getComponent();
    const limitInput = comp.getByTestId("limit-input");
    const bidsColumn = comp.getByTestId("bids-column");

    expect(bidsColumn.querySelectorAll("[data-testid='row'")).toHaveLength(10);

    fireEvent.change(limitInput, { target: { value: "5" } });
    expect(bidsColumn.querySelectorAll("[data-testid='row'")).toHaveLength(5);

    fireEvent.change(limitInput, { target: { value: "2" } });
    expect(bidsColumn.querySelectorAll("[data-testid='row'")).toHaveLength(5);

    fireEvent.change(limitInput, { target: { value: "15" } });
    expect(bidsColumn.querySelectorAll("[data-testid='row'")).toHaveLength(15);

    fireEvent.change(limitInput, { target: { value: "2000" } });
    expect(bidsColumn.querySelectorAll("[data-testid='row'")).toHaveLength(
      props.initialAsks.length
    );
  });

  it("should group the results", async () => {
    const { comp, props } = getComponent();
    const limitInput = comp.getByTestId("limit-input");
    const bidsColumn = comp.getByTestId("bids-column");
    const groupDecrease = comp.getByTestId("group-decrease");
    const groupIncrease = comp.getByTestId("group-increase");
    const groupValue = comp.getByTestId("group-value");

    fireEvent.change(limitInput, { target: { value: "2000" } });
    expect(bidsColumn.querySelectorAll("[data-testid='row'")).toHaveLength(
      props.initialAsks.length
    );

    expect(groupDecrease).toHaveAttribute("disabled");
    expect(groupIncrease).not.toHaveAttribute("disabled");

    userEvent.click(groupDecrease);
    expect(groupValue.textContent).toEqual("0.5");
    expect(bidsColumn.querySelectorAll("[data-testid='row'")).toHaveLength(
      props.initialAsks.length
    );

    GROUP_INTERVALS.forEach((value) => {
      expect(groupValue.textContent).toEqual(value.toString());
      userEvent.click(groupIncrease);
    });
    expect(groupDecrease).not.toHaveAttribute("disabled");
    expect(groupIncrease).toHaveAttribute("disabled");

    userEvent.click(groupIncrease);
    expect(groupValue.textContent).toEqual("2500");

    userEvent.click(groupDecrease);
    expect(groupValue.textContent).toEqual("1000");

    await waitFor(() =>
      expect(bidsColumn.querySelectorAll("[data-testid='row'")).toHaveLength(1)
    );
  });
});
