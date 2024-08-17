import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test } from "vitest";

import { RadioButton } from ".";

afterEach(cleanup);

describe("Radio button", () => {
  const testLabel = "Test button";
  const optionOne = { value: "A", label: "A" };
  const optionTwo = { value: "B", label: "B" };
  const testOption = [optionOne, optionTwo];

  test("should render label and options", () => {
    render(<RadioButton label={testLabel} options={testOption} />);

    expect(screen.queryByText(testLabel)).toBeInTheDocument();
    expect(screen.queryByText(optionOne.label)).toBeInTheDocument();
    expect(screen.queryByText(optionTwo.label)).toBeInTheDocument();
  });

  test("should be default checked", () => {
    render(<RadioButton label={testLabel} options={testOption} value={optionOne} />);
    const view = screen.getByText(optionOne.label);
    expect(within(view).queryByRole("radio")).toBeChecked();
  });

  test("should check only one radio", async () => {
    const user = userEvent.setup();
    render(<RadioButton label={testLabel} options={testOption} value={optionOne} />);
    const secondView = screen.getByText(optionTwo.label);
    const radioTwo = within(secondView).getByRole("radio");
    await user.click(radioTwo);

    expect(radioTwo).toBeChecked();
    const firstView = screen.getByText(optionOne.label);
    expect(within(firstView).queryByRole("radio")).not.toBeChecked();
  });
});
