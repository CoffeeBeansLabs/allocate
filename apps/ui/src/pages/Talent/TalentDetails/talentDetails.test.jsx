import { getFormatedDate } from "@allocate-core/util-formatting";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { formatISO, subYears } from "date-fns";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import AuthenticatedAPI from "../../../api/API";
import { useAuthStore } from "../../../store/authStore";
import BasicDetails from "./BasicDetails";
import ExperienceDetails from "./ExperienceDetails";
import IndustryExp from "./IndustryExp";
import ProjectDetails from "./ProjectDetails";
import Skills from "./Skills";

describe("Talent Details", () => {
  const mockHandleEdit = vi.fn().mockRejectedValue(null);
  const mockEmptyFunc = () => {};
  const user = userEvent.setup();
  useAuthStore.setState({ user: { roles: ["admin"] } });
  let authenticatedMock;

  beforeEach(() => {
    authenticatedMock = new MockAdapter(AuthenticatedAPI);
  });

  afterEach(() => {
    authenticatedMock.reset();
    vi.clearAllMocks();
  });

  test("should render LWD edit", async () => {
    const mockLwdValue = getFormatedDate(new Date());

    render(<BasicDetails handleEdit={mockHandleEdit} />);

    const editIcon = screen.queryByAltText(/lwd edit icon/i);
    await user.click(editIcon);
    const lwdInput = screen.queryByPlaceholderText(/select lwd/i);
    await user.click(lwdInput);
    expect(getFormatedDate(lwdInput.value)).toBe(mockLwdValue);
    await user.click(document.body);
    const lwdArgument = expect.objectContaining({
      lwd: formatISO(new Date(), { representation: "date" }),
    });
    expect(mockHandleEdit).toHaveBeenCalledWith(undefined, lwdArgument);
  });

  test("should open confirmation popup for past lwd", async () => {
    const mockLwdValue = subYears(new Date(), 1);

    render(<BasicDetails handleEdit={mockHandleEdit} />);

    const editIcon = screen.getByAltText(/lwd edit icon/i);
    await user.click(editIcon);
    const lwdInput = screen.getByPlaceholderText(/select lwd/i);
    await user.click(lwdInput);
    await user.click(screen.getByText(mockLwdValue.getFullYear()));
    await user.click(screen.getByText(mockLwdValue.getDate()));
    await user.click(document.body);
    expect(screen.queryByRole("heading", { name: /are you sure?/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /yes/i }));
    const lwdArgument = expect.objectContaining({
      lwd: formatISO(mockLwdValue, { representation: "date" }),
    });
    expect(mockHandleEdit).toHaveBeenCalledWith(undefined, lwdArgument);
  });

  test("should cancel updating lwd for past date", async () => {
    const mockLwdValue = subYears(new Date(), 1);

    render(<BasicDetails handleEdit={mockHandleEdit} />);

    const editIcon = screen.getByAltText(/lwd edit icon/i);
    await user.click(editIcon);
    const lwdInput = screen.getByPlaceholderText(/select lwd/i);
    await user.click(lwdInput);
    await user.click(screen.getByText(mockLwdValue.getFullYear()));
    await user.click(screen.getByText(mockLwdValue.getDate()));
    await user.click(document.body);
    expect(screen.queryByRole("heading", { name: /are you sure?/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByAltText(/lwd edit icon/i)).toBeInTheDocument();
    expect(screen.queryByAltText(/calendar icon/i)).not.toBeInTheDocument();
  });

  test("should remove LWD", async () => {
    const url = new RegExp(`/user/remove_lwd/*`);
    authenticatedMock.onPatch(url).reply(200);

    render(
      <BasicDetails
        talentDetails={{ lastWorkingDay: new Date() }}
        handleEdit={mockHandleEdit}
      />,
    );

    const editIcon = screen.queryByAltText(/lwd edit icon/i);
    await user.click(editIcon);
    const lwdInput = screen.queryByPlaceholderText(/select lwd/i);
    expect(getFormatedDate(lwdInput.value)).toBe(getFormatedDate(new Date()));
    await user.click(screen.getByRole("img", { name: /click to close calendar/i }));
    expect(authenticatedMock.history.patch.length).toBe(1);
    expect(authenticatedMock.history.patch[0].url).toBe("/user/remove_lwd/undefined/");
  });

  test("should render function edit", async () => {
    render(<BasicDetails handleEdit={mockHandleEdit} />);

    await user.click(screen.queryByAltText(/function edit icon/i));
    const dropdownBtn = screen.queryByAltText(/click to toggle dropdown menu/i);
    await user.click(dropdownBtn);
    expect(screen.queryAllByText(/support/i)).toHaveLength(1);
    const deliveryOption = screen.queryByText(/delivery/i);
    await user.click(deliveryOption);
    expect(screen.queryByText(/support/i)).not.toBeInTheDocument();
    await user.click(document.body);
    const functionArgument = expect.objectContaining({
      function: "Delivery",
    });
    expect(mockHandleEdit).toHaveBeenCalledWith(undefined, functionArgument);
  });

  test("should render profile edit", async () => {
    const mockLink = "http://test.com";
    render(<BasicDetails handleEdit={mockHandleEdit} />);

    await user.click(screen.queryByAltText(/profile link edit icon/i));
    await user.type(
      screen.queryByPlaceholderText(/add coffeebeans profile link here/i),
      mockLink,
    );
    await user.type(
      screen.queryByPlaceholderText(/add greyamp profile link here/i),
      mockLink,
    );
    await user.click(screen.queryByRole("button", { name: /save/i }));
    const profileArgument = expect.objectContaining({
      cbProfileLink: mockLink,
      gaProfileLink: mockLink,
    });
    expect(mockHandleEdit).toHaveBeenCalledWith(undefined, profileArgument);
  });

  test("should throw error for invalid profile link", async () => {
    render(<BasicDetails handleEdit={mockHandleEdit} />);
    await user.click(screen.queryByAltText(/profile link edit icon/i));
    const saveBtn = screen.queryByRole("button", { name: /save/i });
    await user.type(
      screen.queryByPlaceholderText(/Add Coffeebeans Profile link here/i),
      "test",
    );
    expect(screen.queryByText(/enter valid url/i)).toBeInTheDocument();
    expect(saveBtn).toBeDisabled();
  });

  test("should render role edit", async () => {
    authenticatedMock
      .onGet("/projects/position-dropdowns/")
      .reply(200, { dropdowns: { roles: [{ id: 1, name: "test role" }] } });
    render(<ExperienceDetails handleEdit={mockHandleEdit} />);

    await user.click(screen.queryByAltText(/role edit icon/i));
    const dropdownBtn = screen.queryByAltText(/click to toggle dropdown menu/i);
    await user.click(dropdownBtn);
    const roleOptions = await screen.findByText(/test role/i);
    await user.click(roleOptions);
    await user.click(document.body);
    const roleArgument = expect.objectContaining({
      role: 1,
    });
    expect(mockHandleEdit).toHaveBeenCalledWith(undefined, roleArgument);
  });

  test("should render industry edit", async () => {
    render(
      <IndustryExp data={[]} handleEdit={mockHandleEdit} setRefetch={mockEmptyFunc} />,
    );
    await user.click(screen.queryAllByAltText(/industry edit icon/i)[0]);
    expect(screen.queryByText(/start typing\.\.\./i)).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByPlaceholderText(/start typing/i)).not.toBeInTheDocument();
  });

  test("should add industry to list", async () => {
    authenticatedMock.onGet("/common/industry/").reply(200, [
      { id: 1, name: "test industry1" },
      { id: 2, name: "test industry2" },
    ]);

    render(
      <IndustryExp data={[]} handleEdit={mockHandleEdit} setRefetch={mockEmptyFunc} />,
    );
    const industryEditIcon = await screen.findByAltText(/industry edit icon/i);
    await user.click(industryEditIcon);
    const industryDropdown = screen.queryByAltText(/click to toggle dropdown menu/i);
    await user.click(industryDropdown);
    await user.click(screen.queryByText(/test industry2/i));
    const industryArgument = expect.objectContaining({
      industries: [2],
    });
    expect(mockHandleEdit).toHaveBeenCalledWith(undefined, industryArgument);
  });

  test("should delete industry from list", async () => {
    const mockIndustry = [{ id: 1, name: "test industry" }];
    render(
      <IndustryExp
        data={mockIndustry}
        handleEdit={mockHandleEdit}
        setRefetch={mockEmptyFunc}
      />,
    );
    await user.click(screen.queryAllByAltText(/industry edit icon/i)[0]);
    await user.click(screen.queryByAltText(/cross button to remove/i));
    const industryArgument = expect.objectContaining({
      industries: [],
    });
    expect(mockHandleEdit).toHaveBeenCalledWith(undefined, industryArgument);
  });

  test("should render skills edit", async () => {
    render(
      <Skills
        data={Array(6).fill({ skill: "test skill", rating: 3 })}
        handleEdit={mockHandleEdit}
      />,
    );
    await user.click(screen.queryByAltText(/skills edit icon/i));
    const saveBtn = screen.queryByRole("button", { name: /save/i });
    await user.click(saveBtn);
    const skillArgument = expect.objectContaining({
      skills: [],
    });
    expect(mockHandleEdit).toHaveBeenCalledWith(undefined, skillArgument);
    expect(saveBtn).not.toBeInTheDocument();
  });

  test("should render mobile project details", async () => {
    const mockProjects = [
      {
        projectId: 1,
        projectName: "Test Project",
        startDate: new Date(),
        endDate: new Date(),
      },
    ];
    render(
      <BrowserRouter>
        <ProjectDetails currentProjects={mockProjects} pastProjects={[]} />
      </BrowserRouter>,
    );
    expect(
      screen.queryByRole("heading", { name: /current project/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /past project/i })).toBeInTheDocument();
    expect(screen.queryByText(/test project/i)).toBeInTheDocument();
  });
});
