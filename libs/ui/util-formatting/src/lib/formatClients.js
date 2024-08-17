import { format } from "date-fns";

export const formatClients = (clients = []) => {
  return clients.map((item) => ({
    id: item.id,
    name: item.name,
    industry: item?.industry?.name,
    startDate: format(new Date(item.startDate), "PP"),
  }));
};
