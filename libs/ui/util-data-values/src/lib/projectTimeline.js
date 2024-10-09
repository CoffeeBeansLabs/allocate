import {
  addDays,
  addMonths,
  areIntervalsOverlapping,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isEqual,
  isWeekend,
  max,
  min,
  setMonth,
  startOfDay,
  startOfMonth,
  subBusinessDays,
} from "date-fns";

export const formatProjects = (projects = []) => {
  return projects.map((item) => ({
    ...item,
    info: {
      name: item?.name,
      startDate: item?.startDate && format(new Date(item.startDate), "PP"),
      talents: item?.talentCount,
    },
  }));
};

export const getCurrentTimeline = (month = 0) => {
  const currentDate = startOfMonth(setMonth(new Date(), month));

  const firstDayOfCurrentTimeline = startOfMonth(currentDate);
  const lastDayOfCurrentTimeline = endOfMonth(currentDate);

  const datesInCurrentTimeline = eachDayOfInterval({
    start: firstDayOfCurrentTimeline,
    end: lastDayOfCurrentTimeline,
  }).reduce(
    (accumulator, date) => [
      ...accumulator,
      {
        dateInstance: date,
        day: format(date, "eeeee"),
        date: format(date, "dd"),
        month: format(date, "MMMM"),
        year: format(date, "yyyy"),
        isWeekend: isWeekend(date),
      },
    ],
    [],
  );

  return datesInCurrentTimeline;
};

export const getDateStartCol = (date, month) => {
  const currentDate = startOfMonth(setMonth(new Date(), month));
  const firstDayOfCurrentTimeline = startOfMonth(currentDate);
  const startDate = new Date(date);
  const start = max([startDate, firstDayOfCurrentTimeline]);
  return Math.abs(differenceInDays(firstDayOfCurrentTimeline, start));
};

const getReleventDates = (projectData, month) => {
  const { startDate, endDate, ktPeriod = 0 } = projectData;

  const currentDate = startOfMonth(setMonth(new Date(), month));

  // consider start of current month as first day of currentTimeline
  const firstDayOfCurrentTimeline = startOfDay(startOfMonth(currentDate));
  const lastDayOfCurrentTimeline = startOfDay(addDays(endOfMonth(currentDate), 1));

  // if endDate is not present / null, then add 3 months to startDate
  // and consider this is as endDate(fallback-endDate)
  const fallBackEndDate = addMonths(new Date(startDate), 3);

  const projectStartDate = startOfDay(new Date(startDate));
  const projectEndDate = startOfDay(addDays(new Date(endDate || fallBackEndDate), 1));
  const ktStartDate = subBusinessDays(projectStartDate, ktPeriod);
  const ktEndDate = projectStartDate;

  return {
    firstDayOfCurrentTimeline,
    lastDayOfCurrentTimeline,
    projectStartDate,
    projectEndDate,
    ktStartDate,
    ktEndDate,
  };
};

export const getProjectTimeSpan = (projectData, month) => {
  const {
    firstDayOfCurrentTimeline,
    lastDayOfCurrentTimeline,
    projectStartDate,
    projectEndDate,
    ktStartDate,
    ktEndDate,
  } = getReleventDates(projectData, month);
  if (projectStartDate > projectEndDate) return {};
  if (
    areIntervalsOverlapping(
      { start: ktStartDate, end: projectEndDate },
      { start: firstDayOfCurrentTimeline, end: lastDayOfCurrentTimeline },
    )
  ) {
    const start = max([projectStartDate, firstDayOfCurrentTimeline]);
    const end = min([projectEndDate, lastDayOfCurrentTimeline]);

    if (projectData.ktPeriod) {
      if (
        areIntervalsOverlapping(
          { start: ktStartDate, end: ktEndDate },
          { start: firstDayOfCurrentTimeline, end: lastDayOfCurrentTimeline },
        )
      ) {
        if (
          !areIntervalsOverlapping(
            { start: projectStartDate, end: projectEndDate },
            { start: firstDayOfCurrentTimeline, end: lastDayOfCurrentTimeline },
          )
        )
          return {
            end,
            ktStartDate,
          };
        return {
          start,
          end,
          ktStartDate: max([ktStartDate, firstDayOfCurrentTimeline]),
        };
      }
    }

    return {
      start,
      end,
    };
  }
  return {};
};

export const getAllocationsRange = (allocations = [], currentMonth) => {
  const sortedAllocations = allocations
    .reduce((acc, proj) => {
      const { start, end, ktStartDate } = getProjectTimeSpan(proj, currentMonth);
      if (ktStartDate) return [...acc, start, end, ktStartDate];
      return [...acc, start, end];
    }, [])
    .sort((a, b) => a - b);

  return sortedAllocations.reduce((accumulator, _, index, array) => {
    if (index + 1 < array.length && array[index] && array[index + 1]) {
      const startDate = array[index];
      const endDate = array[index + 1];
      const days = differenceInDays(endDate, startDate);
      const startCol = Math.abs(
        differenceInDays(startOfMonth(setMonth(new Date(), currentMonth)), startDate),
      );
      const cols = days >= 1 ? days : 0;

      if (cols) {
        const allocationRangeKey = `${startCol}_${cols}`;
        const projects = [];
        let allocation = 0;

        allocations.map((project) => {
          const { projectStartDate, projectEndDate, ktStartDate, ktEndDate } =
            getReleventDates(project, currentMonth);
          if (projectStartDate <= projectEndDate) {
            if (
              areIntervalsOverlapping(
                { start: ktStartDate, end: ktEndDate },
                { start: startDate, end: endDate },
              ) &&
              project.ktPeriod
            ) {
              projects.push({
                ...project,
                startDate: ktStartDate,
                endDate: ktEndDate,
                type: "KT_PERIOD",
              });
              allocation += project.utilization;
            }
            if (
              areIntervalsOverlapping(
                { start: projectStartDate, end: projectEndDate },
                { start: startDate, end: endDate },
              ) ||
              (isEqual(startDate, endDate) && isEqual(projectStartDate, startDate))
            ) {
              projects.push({
                ...project,
                type: project.isRequest ? "REQUEST" : "PROJECT",
              });
              allocation += project.utilization;
            }
          }
        });

        return {
          ...accumulator,
          [allocationRangeKey]: {
            allocation,
            available: 100 - allocation,
            projects: projects.sort((a, b) => b.type - a.type),
          },
        };
      }
    }
    return { ...accumulator };
  }, {});
};

export const getLeavesRange = (leaves = [], month) => {
  const currentDate = startOfMonth(setMonth(new Date(), month));
  const firstDayOfCurrentTimeline = startOfDay(startOfMonth(currentDate));
  const lastDayOfCurrentTimeline = startOfDay(addDays(endOfMonth(currentDate), 1));

  return leaves
    .filter((leave) =>
      areIntervalsOverlapping(
        {
          start: new Date(leave.fromDate),
          end: new Date(leave.toDate),
        },
        {
          start: firstDayOfCurrentTimeline,
          end: lastDayOfCurrentTimeline,
        },
      ),
    )
    .reduce((acc, leave) => {
      const leaveFromDate = startOfDay(new Date(leave.fromDate));
      const leaveToDate = startOfDay(addDays(new Date(leave.toDate), 1));

      const days = differenceInDays(
        min([leaveToDate, lastDayOfCurrentTimeline]),
        max([leaveFromDate, firstDayOfCurrentTimeline]),
      );
      const startCol = Math.abs(
        differenceInDays(
          startOfMonth(setMonth(new Date(), month)),
          max([leaveFromDate, firstDayOfCurrentTimeline]),
        ),
      );
      const cols = days >= 1 ? days : 0;

      return [
        ...acc,
        {
          startCol,
          cols,
        },
      ];
    }, []);
};
