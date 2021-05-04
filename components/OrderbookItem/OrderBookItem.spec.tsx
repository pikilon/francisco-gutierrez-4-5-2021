import { render } from "@testing-library/react";
import { OrderbookItem } from "./";

const getProps = () => ({
  isBid: true,
  price: 54933,
  size: 61117,
  total: 1427972.5,
  maxTotal: 1922437.5,
});
const percentage = (props = getProps()) =>
  Math.round((props.total * 10000) / props.maxTotal) / 100;

const getComponent = (props = getProps()) => ({
  comp: render(
    <table>
      <tbody>
        <OrderbookItem {...props} />
      </tbody>
    </table>
  ),
  props,
});

describe("OrderBookItem", () => {
  it("shold render all the info", () => {
    const { comp, props } = getComponent();
    const price = comp.getByText(props.price.toLocaleString());
    const size = comp.getByText(props.size.toLocaleString());
    const total = comp.getByText(props.total.toLocaleString());

    expect(price).toBeTruthy();
    expect(size).toBeTruthy();
    expect(total).toBeTruthy();
  });

  // Jest has a bug with linear gradient can't test any further
  // https://github.com/testing-library/jest-dom/issues/170
  it("should have a proportional background", () => {
    const { comp } = getComponent();
    const line = comp.getByTestId("row");
    expect(line).toBeTruthy();
    expect(line).toHaveStyle(`background: ${percentage}`);
  });
});
