import { format } from "date-fns";

export const getFormatedDate = (dateString) => {
  // dateString: "2024-02-27T08:32:38Z");
  // Output: "Feb 27, 2024"
  if (dateString) return format(new Date(dateString), "PP");
  return null;
};
