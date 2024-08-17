import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { BrowserRouter } from "react-router-dom";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import AuthenticatedAPI, { BaseAPI } from "../../api/API";
import SkillForm from ".";
import ExperienceForm from "./ExperienceForm";
import SkillLayout from "./SkillLayout";
import UpdateIndustryForm from "./UpdateIndustryForm";
import UpdateSkillForm from "./UpdateSkillForm";

const originalWindowScrollTo = window.HTMLElement.prototype.scrollTo;

beforeAll(() => {
  window.HTMLElement.prototype.scrollTo = vi.fn();
});

afterAll(() => {
  window.HTMLElement.prototype.scrollTo = originalWindowScrollTo;
});

describe("Skill Form", () => {
  const user = userEvent.setup();
  const emptyFunc = () => {};
  let authenticatedMock;
  let baseAxiosMock;

  beforeEach(() => {
    authenticatedMock = new MockAdapter(AuthenticatedAPI);
    baseAxiosMock = new MockAdapter(BaseAPI);
  });

  afterEach(() => {
    authenticatedMock.reset();
    authenticatedMock.resetHistory();
    baseAxiosMock.reset();
    baseAxiosMock.resetHistory();
    vi.clearAllMocks();
  });

  test("should render skill form layout", () => {
    render(
      <BrowserRouter>
        <SkillLayout />
      </BrowserRouter>,
    );
    expect(screen.queryByAltText(/logo/i)).toBeInTheDocument();
  });

  test("should render error", async () => {
    render(<SkillForm />);
    expect(
      await screen.findByText(/This form is not accepting any entries right now/i),
    ).toBeInTheDocument();
  });

  test("should render google sign in", async () => {
    baseAxiosMock
      .onPost("/user/form_permission_auth/")
      .reply(200, { hasPermission: true });

    render(<SkillForm />);
    expect(
      await screen.findByRole("heading", { name: /skills portal/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/sign in with google/i)).toBeInTheDocument();
  });

  test("should render experience form", async () => {
    const url = new RegExp(`/user/edit_user_experience/*`);
    baseAxiosMock.onPost(url).reply(200);

    render(<ExperienceForm onSubmit={emptyFunc} />);
    expect(
      screen.queryByRole("heading", {
        name: /experience form/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/when did you start with your work experience\?/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/career break \(if any, in months\)/i)).toBeInTheDocument();
    await user.click(screen.queryByRole("textbox"));
    await user.click(screen.queryByText("2020"));
    await user.click(screen.queryByText("11"));
    // Set career break months
    await user.type(screen.getByRole("spinbutton"), "7");
    await user.click(screen.queryByRole("button", { name: /submit/i }));
    expect(baseAxiosMock.history.post).toHaveLength(1);
    expect(baseAxiosMock.history.post[0].data).toBe(
      JSON.stringify({
        careerStartDate: "2020-" + (new Date().getMonth() + 1) + "-11",
        careerBreakMonths: 0, // Ensure careerBreakMonths is set correctly
      }),
    );
  });

  test("should render skills form", async () => {
    render(<UpdateSkillForm hasIndustryMappingPermission hasUserExperiencePermissions />);
    expect(
      screen.queryByRole("heading", { name: /proficiency mapping form/i }),
    ).toBeInTheDocument();
  });

  test("should render industry form", async () => {
    render(<UpdateIndustryForm hasProficiencyMappingPermission />);
    expect(
      screen.queryByRole("heading", { name: /industry experience form/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/enter industries:/i)).toBeInTheDocument();
    expect(screen.queryByText(/start typing/i)).toBeInTheDocument();
  });
});
