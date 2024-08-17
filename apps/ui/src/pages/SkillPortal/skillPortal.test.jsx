import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MockAdapter from "axios-mock-adapter";
import { BrowserRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import AuthenticatedAPI, { BaseAPI } from "../../api/API";
import { FORM_LINK } from "../../constants/skillPortalActions";
import { useAuthStore } from "../../store/authStore";
import SkillPortal from ".";

describe("Skill portal", () => {
  const user = userEvent.setup();
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

  test("should render skill portal", async () => {
    baseAxiosMock
      .onPost("/user/form_permission_auth/")
      .reply(200, { hasPermission: true });

    useAuthStore.setState({ user: { roles: ["admin", "user"] } });

    render(
      <BrowserRouter>
        <SkillPortal />
      </BrowserRouter>,
    );
    expect(baseAxiosMock.history.post).toHaveLength(4);
    expect(
      await screen.findByRole("heading", {
        name: /skill portal access/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/enable form access/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/allow users to access skillset data/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/allow users to access industry data/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/allow users to access experience data/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/add \/ delete \/ edit skills:/i)).toBeInTheDocument();
    expect(screen.queryByText(/add \/ delete \/ edit industries:/i)).toBeInTheDocument();
  });

  test("should handle enable form access toggle", async () => {
    authenticatedMock.onPost("/user/add_user_groups_permission/").reply(200);

    render(
      <BrowserRouter>
        <SkillPortal />
      </BrowserRouter>,
    );
    const toggleButtons = await screen.findAllByRole("checkbox");
    await user.click(toggleButtons[0]);
    expect(authenticatedMock.history.post).toHaveLength(2);
    expect(authenticatedMock.history.post[0].data).toBe(
      '{"action":"assign_form_permissions"}',
    );
    expect(authenticatedMock.history.post[1].data).toBe(
      '{"action":"assign_proficiency_mapping_permissions"}',
    );
  });

  test("should toggle form toggle when skill form is toggled", async () => {
    authenticatedMock.onPost("/user/add_user_groups_permission/").reply(200);

    render(
      <BrowserRouter>
        <SkillPortal />
      </BrowserRouter>,
    );
    const toggleButtons = await screen.findAllByRole("checkbox");
    await user.click(toggleButtons[1]);
    expect(authenticatedMock.history.post).toHaveLength(2);
    expect(authenticatedMock.history.post[0].data).toBe(
      '{"action":"assign_proficiency_mapping_permissions"}',
    );
    expect(authenticatedMock.history.post[1].data).toBe(
      '{"action":"assign_form_permissions"}',
    );

    await user.click(toggleButtons[1]);
    expect(authenticatedMock.history.post).toHaveLength(4);
    expect(authenticatedMock.history.post[2].data).toBe(
      '{"action":"revoke_proficiency_mapping_permissions"}',
    );
    expect(authenticatedMock.history.post[3].data).toBe(
      '{"action":"revoke_form_permissions"}',
    );
  });

  test("should toggle form toggle when industry form is toggled", async () => {
    authenticatedMock.onPost("/user/add_user_groups_permission/").reply(200);

    render(
      <BrowserRouter>
        <SkillPortal />
      </BrowserRouter>,
    );
    const toggleButtons = await screen.findAllByRole("checkbox");

    await user.click(toggleButtons[2]);
    expect(authenticatedMock.history.post).toHaveLength(2);
    expect(authenticatedMock.history.post[0].data).toBe(
      '{"action":"assign_industry_mapping_permissions"}',
    );
    expect(authenticatedMock.history.post[1].data).toBe(
      '{"action":"assign_form_permissions"}',
    );

    await user.click(toggleButtons[2]);
    expect(authenticatedMock.history.post).toHaveLength(4);
    expect(authenticatedMock.history.post[2].data).toBe(
      '{"action":"revoke_industry_mapping_permissions"}',
    );
    expect(authenticatedMock.history.post[3].data).toBe(
      '{"action":"revoke_form_permissions"}',
    );
  });

  test("should toggle form toggle when experience form is toggled", async () => {
    authenticatedMock.onPost("/user/add_user_groups_permission/").reply(200);

    render(
      <BrowserRouter>
        <SkillPortal />
      </BrowserRouter>,
    );
    const toggleButtons = await screen.findAllByRole("checkbox");

    await user.click(toggleButtons[3]);
    expect(authenticatedMock.history.post).toHaveLength(2);
    expect(authenticatedMock.history.post[0].data).toBe(
      '{"action":"assign_edit_user_experience_permissions"}',
    );
    expect(authenticatedMock.history.post[1].data).toBe(
      '{"action":"assign_form_permissions"}',
    );

    await user.click(toggleButtons[3]);
    expect(authenticatedMock.history.post).toHaveLength(4);
    expect(authenticatedMock.history.post[2].data).toBe(
      '{"action":"revoke_edit_user_experience_permissions"}',
    );
    expect(authenticatedMock.history.post[3].data).toBe(
      '{"action":"revoke_form_permissions"}',
    );
  });

  test("should disable all toggle on form disable", async () => {
    baseAxiosMock
      .onPost("/user/form_permission_auth/")
      .reply(200, { hasPermission: true });
    authenticatedMock.onPost("/user/add_user_groups_permission/").reply(200);

    render(
      <BrowserRouter>
        <SkillPortal />
      </BrowserRouter>,
    );
    const toggleButtons = await screen.findAllByRole("checkbox");
    await user.click(toggleButtons[0]);
    expect(authenticatedMock.history.post).toHaveLength(4);
    expect(authenticatedMock.history.post[0].data).toBe(
      '{"action":"revoke_form_permissions"}',
    );
    expect(authenticatedMock.history.post[1].data).toBe(
      '{"action":"revoke_proficiency_mapping_permissions"}',
    );
    expect(authenticatedMock.history.post[2].data).toBe(
      '{"action":"revoke_industry_mapping_permissions"}',
    );
    expect(authenticatedMock.history.post[3].data).toBe(
      '{"action":"revoke_edit_user_experience_permissions"}',
    );
  });

  test("should add new skill", async () => {
    authenticatedMock.onPost("/common/skill/").reply(200);
    render(
      <BrowserRouter>
        <SkillPortal />
      </BrowserRouter>,
    );
    const userInputs = await screen.findAllByPlaceholderText("Enter");
    await user.type(userInputs[0], "Test skill");
    await user.keyboard("{Enter}");
    expect(authenticatedMock.history.post).toHaveLength(1);
    expect(authenticatedMock.history.post[0].data).toBe('{"name":"Test skill"}');
  });

  test("should delete existing skill", async () => {
    authenticatedMock
      .onGet("/projects/position-dropdowns/")
      .reply(200, { dropdowns: { skills: [{ id: 323, name: "test skill" }] } });
    authenticatedMock.onGet("/common/industry/").reply(200);
    authenticatedMock.onDelete("/common/skill/").reply(200);

    render(
      <BrowserRouter>
        <SkillPortal />
      </BrowserRouter>,
    );
    await user.click(await screen.findByAltText(/cross button to remove/i));
    expect(authenticatedMock.history.delete).toHaveLength(1);
    expect(authenticatedMock.history.delete[0].url).toBe("/common/skill/323");
  });

  test("should add new industry", async () => {
    authenticatedMock.onPost("/common/industry/").reply(200);
    render(
      <BrowserRouter>
        <SkillPortal />
      </BrowserRouter>,
    );
    const userInputs = await screen.findAllByPlaceholderText("Enter");
    await user.type(userInputs[1], "Test industry");
    await user.keyboard("{Enter}");
    expect(authenticatedMock.history.post).toHaveLength(1);
    expect(authenticatedMock.history.post[0].data).toBe('{"name":"Test industry"}');
  });

  test("should delete existing industry", async () => {
    authenticatedMock
      .onGet("/projects/position-dropdowns/")
      .reply(200, { dropdowns: { skills: [] } });
    authenticatedMock
      .onGet("/common/industry/")
      .reply(200, [{ id: 63, name: "test industry" }]);
    authenticatedMock.onDelete("/common/industry/").reply(200);

    render(
      <BrowserRouter>
        <SkillPortal />
      </BrowserRouter>,
    );
    await user.click(await screen.findByAltText(/cross button to remove/i));
    expect(authenticatedMock.history.delete).toHaveLength(1);
    expect(authenticatedMock.history.delete[0].url).toBe("/common/industry/63");
  });

  test("should handle clipboard copy", async () => {
    navigator.clipboard.writeText = vi.fn();
    render(
      <BrowserRouter>
        <SkillPortal />
      </BrowserRouter>,
    );
    await user.click(await screen.findByAltText(/copy link icon/i));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(FORM_LINK);
  });
});
