import { Text } from "@allocate-core/ui-components";

import StatusIcons from "./status";

const projectStatusFilter = [
  {
    label: <Text size="b2">All Statuses</Text>,
    value: "all",
  },
].concat(
  StatusIcons.map((item) => ({
    label: (
      <div className="flex align-center gap-20">
        <img
          src={item.icon}
          alt={`project status icon: ${item.description}`}
          aria-hidden="true"
          style={{ width: "18px", height: "18px" }}
        />
        <Text size="b2">{item.uiString}</Text>
      </div>
    ),
    value: item.type,
  })),
);

export default projectStatusFilter;
