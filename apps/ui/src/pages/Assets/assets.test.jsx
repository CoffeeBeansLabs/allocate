import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { CONFIRMATION_MSG } from "../../constants/common";
import Assets from ".";
import AssetDetails from "./AssetDetails";
import AssetTimeline from "./AssetDetails/AssetTimeline";
import AssetsForm from "./AssetForm";

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

const originalWindowConfirm = window.confirm;
const originalWindowScrollIntoView = window.HTMLElement.prototype.scrollIntoView;

beforeAll(() => {
  window.confirm = vi.fn(() => {
    return true;
  });
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterAll(() => {
  window.confirm = originalWindowConfirm;
  window.HTMLElement.prototype.scrollIntoView = originalWindowScrollIntoView;
});

describe("Assets", () => {
  vi.mock("@allocate-core/util-data-values", async () => {
    const actual = await vi.importActual("@allocate-core/util-data-values");
    const data = [
      {
        changeId: " 5CD213OMC9*40",
        inventoryId: " 5CD213OMC9",
        active: "ASSI",
        closed: null,
        taggedTo: "Sourav Kumar Jha",
        archived: false,
        startDate: "2022-06-29",
        endDate: "",
      },
    ];
    return {
      ...actual,
      getAssetTimelineValues: vi
        .fn()
        .mockReturnValue({ widthValue: 200, colorValue: "" }),
      transformTimelineData: vi.fn().mockReturnValue(data),
      getStatus: vi.fn().mockReturnValue("ASSI"),
    };
  });

  test("should render initial page", async () => {
    render(
      <BrowserRouter>
        <Assets />
      </BrowserRouter>,
    );

    expect(
      screen.queryByRole("button", {
        name: /add plus button add new asset/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("row", {
        name: /cb sr# model type year of mfg screen size tagged to/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/search for assets/i)).toBeInTheDocument();
    expect(screen.queryByText(/inventory/i)).toBeInTheDocument();
  });

  test("should open modal on add asset click", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Assets />
      </BrowserRouter>,
    );
    expect(await screen.findByText("Add New Asset")).toBeInTheDocument();
    await user.click(
      screen.queryByRole("button", { name: /add plus button add new asset/i }),
    );
    expect(screen.queryByRole("heading", { name: /add new asset/i })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /close icon/i })).toBeInTheDocument();
  });

  test("should render asset form", async () => {
    render(<AssetsForm />);
    expect(await screen.findByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  test("should throw error on submit without serial number", async () => {
    const user = userEvent.setup();
    render(<AssetsForm />);
    const submitBtn = await screen.findByRole("button", { name: /save/i });

    await user.click(submitBtn);
    expect(await screen.findByText(/enter serial number/i)).toBeInTheDocument();
  });

  test("should not throw error on submit with serail number", async () => {
    const user = userEvent.setup();
    render(<AssetsForm />);
    const submitBtn = await screen.findByRole("button", { name: /save/i });
    const assetSrNo = await screen.findByPlaceholderText("Enter Sr No.");

    await user.type(assetSrNo, "test number");

    await user.click(submitBtn);
    await waitFor(() => expect(screen.queryByText(/enter serial number/i)).toBeNull());
  });

  test("should display alert dialog on cancel", async () => {
    const user = userEvent.setup();
    render(
      <AssetsForm
        onCancel={() => {
          if (window.confirm(CONFIRMATION_MSG)) return;
        }}
      />,
    );
    const cancelBtn = await screen.findByRole("button", { name: /cancel/i });
    await user.click(cancelBtn);
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(CONFIRMATION_MSG);
    });
  });

  test("should render sub status on status click", async () => {
    const user = userEvent.setup();
    render(<AssetsForm />);

    expect(screen.queryByText(/sub status/i)).toBeNull();
    const activeView = await screen.findByText(/active/i);
    const activeRadio = within(activeView).getByRole("radio");
    await user.click(activeRadio);
    expect(await screen.findByText(/sub status \*/i)).toBeInTheDocument();
    const closedView = await screen.findByText(/closed/i);
    const closedRadio = within(closedView).getByRole("radio");
    expect(await screen.findByText(/sub status \*/i)).toBeInTheDocument();
    await user.click(closedRadio);
  });

  test("should render the asset details", async () => {
    render(
      <BrowserRouter>
        <AssetDetails serialNum={123} />
      </BrowserRouter>,
    );

    expect(await screen.findByText("Assets / View Details")).toBeInTheDocument();
    expect(
      await screen.findByText("Details of selected Hardware/Software"),
    ).toBeInTheDocument();
    expect(await screen.findByText(/serial number/i)).toBeInTheDocument();
    expect(await screen.findByAltText(/edit asset details/i)).toBeInTheDocument();
  });

  test("should open edit asset model", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AssetDetails />
      </BrowserRouter>,
    );

    const editButton = await screen.findByAltText(/edit asset details button/i);
    await user.click(editButton);
    expect(
      await screen.findByRole("heading", {
        name: /edit asset details/i,
      }),
    ).toBeInTheDocument();
  });

  test("should render timeline", async () => {
    render(
      <BrowserRouter>
        <AssetDetails />
      </BrowserRouter>,
    );
    expect(
      await screen.findByRole("heading", {
        name: /timeline/i,
      }),
    ).toBeInTheDocument();
  });

  test("should show timeline dates and status", async () => {
    const testData = [
      {
        changeId: " 5CD213OMC9*40",
        inventoryId: " 5CD213OMC9",
        active: "ASSI",
        dateOfChange: "2022-06-29",
        closed: null,
        taggedTo: "Sourav Kumar Jha",
        archived: false,
      },
    ];
    render(<AssetTimeline timelineData={testData} />);

    expect(screen.getByText(/jun 29, 2022/i)).toBeInTheDocument();
    expect(screen.getByText("Present")).toBeInTheDocument();
  });
});
