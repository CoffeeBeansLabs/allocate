import { getFormatedDate } from "@allocate-core/util-formatting";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addDays } from "date-fns";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";

import { useAuthStore } from "../../store/authStore";
import SkillsCard from ".";
import MobileTalentInfo from "./MobileTalentInfo";

describe("Skills Card", () => {
  const user = userEvent.setup();
  const mockUserInfo = {
    id: 1,
    name: "Test name",
    skills: [{ skillId: 1, skill: "Skill A", rating: 3 }],
    experienceMonths: 32,
    lastWorkingDay: new Date(),
    role: "Test role",
    isOverUtilized: true,
    projects: [
      {
        projectName: "Test Project",
        utilization: 50,
        startDate: new Date(),
        endDate: new Date(),
      },
    ],
    leaves: [{ fromDate: addDays(new Date(), 7), toDate: addDays(new Date(), 7) }],
    requests: [
      {
        projectName: "Test request",
        utilization: 100,
        startDate: new Date(),
        endDate: new Date(),
      },
    ],
  };
  useAuthStore.setState({ user: { roles: ["admin"] } });

  test("should render skills card", async () => {
    render(
      <BrowserRouter>
        <SkillsCard {...mockUserInfo} />
      </BrowserRouter>,
    );
    const name = screen.queryByText(/test name/i);
    expect(name).toBeInTheDocument();
    expect(name).toHaveStyle({
      color: "var(--color-MaximumRed)",
    });
    await user.click(name);
    expect(screen.queryByText(/exp - 2 years 8 months/i)).toBeInTheDocument();
    expect(screen.queryByText(/role - test role/i)).toBeInTheDocument();
    expect(
      screen.queryByText(`LWD - ${getFormatedDate(new Date())}`),
    ).toBeInTheDocument();
    expect(screen.queryByText(/skill a/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId(/rating_filled/i)).toHaveLength(3);
    expect(screen.queryAllByTestId(/rating_unfilled/i)).toHaveLength(2);
    await user.click(screen.queryByText(/show all skills/i));
  });

  test("should render mobile talent info", async () => {
    render(
      <BrowserRouter>
        <MobileTalentInfo
          userDetails={mockUserInfo}
          showLeavesAndRequests
          criteria={{ skills: [1] }}
        />
      </BrowserRouter>,
    );
    expect(screen.queryByText(/exp - 2 years 8 months/i)).toBeInTheDocument();
    expect(screen.queryByText(/role - test role/i)).toBeInTheDocument();
    expect(
      screen.queryByText(`LWD - ${getFormatedDate(new Date())}`),
    ).toBeInTheDocument();
    expect(screen.queryAllByText(getFormatedDate(new Date()))).toHaveLength(4);
    expect(screen.queryByText(/test project/i)).toBeInTheDocument();
    expect(screen.queryByText(/upcoming leaves/i)).toBeInTheDocument();
    expect(
      screen.queryByText(
        `${getFormatedDate(mockUserInfo.leaves[0].fromDate)} - ${getFormatedDate(
          mockUserInfo.leaves[0].toDate,
        )}`,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/requests/i)).toBeInTheDocument();
    expect(screen.queryByText(/test request/i)).toBeInTheDocument();
    expect(screen.queryByText(/100 %/i)).toBeInTheDocument();
    expect(screen.queryByText(/50 %/i)).toBeInTheDocument();
    expect(screen.queryByText(/skill a/i)).toBeInTheDocument();
    expect(screen.queryAllByTestId(/rating_filled/i)).toHaveLength(3);
    expect(screen.queryAllByTestId(/rating_unfilled/i)).toHaveLength(2);
  });

  test("should render mobile talent info with compact views", async () => {
    render(
      <BrowserRouter>
        <MobileTalentInfo
          userDetails={{
            ...mockUserInfo,
            requests: [],
            skills: [
              ...mockUserInfo.skills,
              { skillId: 2, skill: "Skill B", rating: 2 },
              { skillId: 3, skill: "Skill C", rating: 2 },
              { skillId: 4, skill: "Skill D", rating: 2 },
              { skillId: 5, skill: "Skill E", rating: 2 },
              { skillId: 6, skill: "Skill F", rating: 2 },
            ],
          }}
          showLeavesAndRequests
          showCompactSkillView
          showCompactProjectView
          criteria={{ skills: [1] }}
        />
      </BrowserRouter>,
    );
    expect(screen.queryAllByText(/skill/i)).toHaveLength(5);
    expect(screen.queryByText(/no requests/i)).toBeInTheDocument();
    await user.click(screen.queryByText(/view more/i));
    expect(await screen.findAllByText(/skill/i)).toHaveLength(6);
  });

  test("should render with all skills", async () => {
    render(
      <BrowserRouter>
        <MobileTalentInfo
          userDetails={{
            ...mockUserInfo,
            skills: [
              ...mockUserInfo.skills,
              { skillId: 2, skill: "Skill B", rating: 2 },
              { skillId: 3, skill: "Skill C", rating: 2 },
              { skillId: 4, skill: "Skill D", rating: 2 },
              { skillId: 5, skill: "Skill E", rating: 2 },
              { skillId: 6, skill: "Skill F", rating: 2 },
            ],
          }}
        />
      </BrowserRouter>,
    );
    await user.click(screen.queryByText(/view more/i));
    expect(screen.queryAllByText(/skill/i)).toHaveLength(6);
  });
});
