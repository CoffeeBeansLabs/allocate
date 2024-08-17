import { differenceInDays } from "date-fns";

const MIN_LENGTH = 180;
const MAX_LENGTH = 1000;
const MIN_LENGTH_MOBILE = (192 / window.screen.width) * 100;
const MAX_LENGTH_MOBILE = 100;
const MAX_WEEK = 26; // weeks in 6 months

const statusColorCodes = [
  {
    code: "INV",
    status: "Inventory",
    color: "var(--color-BrightYellow)",
  },
  {
    code: "ASSI",
    status: "Assigned",
    color: "var(--color-OceanGreen)",
  },
  {
    code: "REP",
    status: "Repair",
    color: "var(--color-SunsetOrange-1)",
  },
  {
    code: "TRAN",
    status: "In transit",
    color:
      "repeating-linear-gradient(120deg, var(--color-White), var(--color-White) 4px, var(--color-DavysGrey) 4px, var(--color-DavysGrey) 6px)",
  },
  {
    code: "ARCHIVE",
    status: "Archived",
    color:
      "repeating-linear-gradient(90deg, var(--color-LightRed), var(--color-LightRed) 5px, var(--color-White) 5px, var(--color-White) 6px)",
  },
  {
    code: "WR",
    status: "Written Off",
    color: "var(--color-SunsetOrange-1)",
  },
  {
    code: "NW",
    status: "Not Working",
    color: "var(--color-SunsetOrange-1)",
  },
  {
    code: "SL",
    status: "Stolen/Lost",
    color: "var(--color-SunsetOrange-1)",
  },
  {
    code: "RC",
    status: "Returned to Client",
    color: "var(--color-BrightYellow)",
  },
  {
    code: "LC",
    status: "Returned to Leasing Company",
    color: "var(--color-OceanGreen)",
  },
  {
    code: "To be received by employee",
    status: "To be received by employee",
    color:
      "repeating-linear-gradient(120deg, var(--color-White), var(--color-White) 4px, var(--color-DavysGrey) 4px, var(--color-DavysGrey) 6px)",
  },
];

const closedBackground =
  "repeating-linear-gradient(90deg, var(--color-SunsetOrange-1), var(--color-SunsetOrange-1) 5px, var(--color-White) 5px, var(--color-White) 8px)";

export const getAssetTimelineValues = (startDate, endDate, statusParam, isMobile) => {
  let length;

  if (!statusParam) return;

  const { color, status } = statusColorCodes.find((item) => item.code === statusParam);

  const days = differenceInDays(
    endDate ? new Date(endDate) : new Date(),
    new Date(startDate),
  );
  const weeks = Math.ceil(days / 7);

  if (isMobile) {
    length = (MAX_LENGTH_MOBILE * weeks) / MAX_WEEK;
    length =
      length < MAX_LENGTH_MOBILE
        ? Math.max(length, MIN_LENGTH_MOBILE)
        : MAX_LENGTH_MOBILE;
  } else {
    length = (MAX_LENGTH * weeks) / MAX_WEEK;
    length = length < MAX_LENGTH ? Math.max(length, MIN_LENGTH) : MAX_LENGTH;
  }

  const widthValue = Math.ceil(length) + (isMobile ? "%" : "px");
  return {
    widthValue,
    backgroundValue: color || closedBackground,
    statusValue: status,
  };
};

export function transformTimelineData(inputData) {
  return inputData?.map((item, index) => {
    const newItem = { ...item };
    newItem.startDate = newItem.dateOfChange;
    if (index === inputData.length - 1) {
      newItem.endDate = "";
    } else {
      newItem.endDate = inputData[index + 1].dateOfChange;
    }
    return newItem;
  });
}

export function getStatus(allocation) {
  if (allocation?.archived) return "ARCHIVE";
  if (
    allocation?.closed === null &&
    allocation?.active === null &&
    allocation?.archived === false
  )
    return "ARCHIVE";
  return allocation?.closed ?? allocation?.active;
}
