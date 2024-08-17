import {
  addDays,
  areIntervalsOverlapping,
  endOfMonth,
  isAfter,
  setMonth,
  startOfMonth,
  subBusinessDays,
} from "date-fns";

export const formatProjectTimeline = (timeline, month) => {
  const firstDayOfCurrentTimeline = startOfMonth(setMonth(new Date(), month));
  const lastDayOfCurrentTimeline = endOfMonth(setMonth(new Date(), month));
  const newRoles = [];

  timeline?.roles?.map((role) =>
    newRoles.push({
      ...role,
      positions: role.positions
        ?.filter((position) => {
          const positionEndDate = position.endDate
            ? new Date(position.endDate)
            : addDays(new Date(position.startDate), 90);
          return positionEndDate >= firstDayOfCurrentTimeline;
        })
        .map((position) => ({
          ...position,
          users: position?.users?.filter(
            (user) =>
              user?.requests?.length > 0 ||
              user.projects.some((project) => {
                const ktStartDate = subBusinessDays(
                  new Date(project.startDate),
                  project.ktPeriod,
                );
                if (isAfter(new Date(project.startDate), new Date(project?.endDate)))
                  return false;
                return (
                  project.startDate &&
                  areIntervalsOverlapping(
                    {
                      start: ktStartDate,
                      end: project.endDate
                        ? new Date(project.endDate)
                        : addDays(new Date(project.startDate), 90),
                    },
                    { start: firstDayOfCurrentTimeline, end: lastDayOfCurrentTimeline },
                  ) &&
                  project.isSameProject
                );
              }),
          ),
        })),
    }),
  );

  return {
    ...timeline,
    roles: newRoles,
  };
};
