import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { formatISO, setDate } from "date-fns";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import AuthenticatedAPI from "../../../api/API";
import { ROLES } from "../../../constants/roles";
import { useAuthStore } from "../../../store/authStore";
import ManageTalentModal from "./ManageTalentModal";

describe("Add to Project Form", () => {
  const user = userEvent.setup();
  let authenticatedAxiosMock;
  const mockData = [
    {
      id: 1,
      name: "Test name",
      allocation: 100,
      allocationTill: formatISO(setDate(new Date(), 20), { representation: "date" }),
    },
    {
      id: 2,
      name: "Talent 2",
      allocation: 50,
      allocationTill: formatISO(setDate(new Date(), 31), { representation: "date" }),
    },
  ];

  beforeEach(() => {
    authenticatedAxiosMock = new MockAdapter(AuthenticatedAPI);
  });

  afterEach(() => {
    authenticatedAxiosMock.reset();
    authenticatedAxiosMock.resetHistory();
    vi.clearAllMocks();
  });

  test("should render manage talent", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.admin] } });
    render(<ManageTalentModal isOpen={true} data={mockData} />);

    expect(
      screen.queryByRole("row", {
        name: /talent name allocation allocation till action/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/test name/i)).toBeInTheDocument();
    expect(screen.queryByText(/talent 2/i)).toBeInTheDocument();
    expect(
      screen.queryAllByRole("button", { name: /remove talent from allocation/i }),
    ).toHaveLength(2);
    expect(screen.queryAllByRole("button", { name: /make changes/i })).toHaveLength(2);
  });

  test("should enable request change button on allocation change", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.requester] } });
    render(<ManageTalentModal isOpen={true} data={mockData} />);

    const requestChangeBtn = screen.getAllByRole("button", { name: /request changes/i });
    expect(requestChangeBtn[0]).toBeDisabled();

    const allocationInputs = screen.getAllByPlaceholderText(/select utilization/i);

    await user.click(allocationInputs[0]);

    await user.type(allocationInputs[0], "75");

    // Wait for the debounce function to be called
    await waitFor(
      () => {
        expect(
          screen.queryAllByRole("button", { name: /request changes/i })[0],
        ).toBeEnabled();
      },
      { timeout: 1100 },
    );

    await user.click(allocationInputs[1]);
    await user.type(allocationInputs[1], `${mockData[1].allocation}`);

    // Wait for the debounce function to be called
    await waitFor(
      () => {
        expect(
          screen.queryAllByRole("button", { name: /request changes/i })[1],
        ).toBeDisabled();
      },
      { timeout: 1100 },
    );
  });

  test("should enable request change button on allocation date change", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.requester] } });
    render(<ManageTalentModal isOpen={true} data={mockData} />);

    const requestChangeBtn = screen.getAllByRole("button", {
      name: /request changes/i,
    });
    expect(requestChangeBtn[0]).toBeDisabled();

    await user.click(screen.getAllByRole("textbox")[0]);
    await user.click(screen.getByText(/12/i));
    expect(
      screen.queryAllByRole("button", {
        name: /request changes/i,
      })[0],
    ).toBeEnabled();

    await user.click(screen.getAllByRole("textbox")[1]);
    expect(
      screen.queryAllByRole("button", {
        name: /request changes/i,
      })[1],
    ).toBeDisabled();
  });

  test("should remove on delete icon click", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.admin] } });
    const mockOnRemove = vi.fn();
    render(<ManageTalentModal isOpen={true} data={mockData} onRemove={mockOnRemove} />);
    await user.click(
      screen.getAllByRole("button", { name: /remove talent from allocation/i })[0],
    );
    expect(mockOnRemove).toHaveBeenCalledOnce();
  });

  test("should request changes", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.requester] } });
    const mockOnClose = vi.fn();
    authenticatedAxiosMock.onPut(new RegExp(`/projects/allocation-request/*`)).reply(200);

    render(<ManageTalentModal isOpen={true} data={mockData} onClose={mockOnClose} />);

    await user.click(screen.getAllByRole("textbox")[0]);
    await user.click(screen.getByText(/12/i));
    await user.click(
      screen.getAllByRole("button", {
        name: /request changes/i,
      })[0],
    );
    expect(authenticatedAxiosMock.history.put).toHaveLength(1);
    expect(authenticatedAxiosMock.history.put[0].data).toBe(
      JSON.stringify({
        utilization: mockData[0].allocation,
        endDate: formatISO(setDate(new Date(), 12), { representation: "date" }),
      }),
    );
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  test("should make changes", async () => {
    useAuthStore.setState({ user: { roles: [ROLES.admin] } });
    const mockOnClose = vi.fn();
    authenticatedAxiosMock.onPut(new RegExp(`/projects/allocation/*`)).reply(200);

    render(<ManageTalentModal isOpen={true} data={mockData} onClose={mockOnClose} />);

    const dateInput = screen.getAllByRole("textbox")[0];
    await user.click(dateInput);
    await user.click(screen.getByText(/12/i));

    // Wait for the debounce
    await new Promise((resolve) => setTimeout(resolve, 1100));

    await user.click(
      screen.getAllByRole("button", {
        name: /make changes/i,
      })[0],
    );

    expect(authenticatedAxiosMock.history.put).toHaveLength(1);

    const sentData = JSON.parse(authenticatedAxiosMock.history.put[0].data);
    expect(sentData).toEqual({
      user: mockData[0].id,
      utilization: mockData[0].allocation,
      endDate: formatISO(setDate(new Date(), 12), { representation: "date" }),
    });
    expect(new Date(sentData.endDate).getDate()).toBe(12);

    expect(mockOnClose).toHaveBeenCalledOnce();
  });
});
