export default [
  {
    label: "Master",
    options: [
      { value: true, label: "Archived", group: "Master" },
      { value: false, label: "Unarchived", group: "Master" },
    ],
  },
  {
    label: "Active",
    options: [
      { value: "INV", label: "Inventory", group: "Active" },
      { value: "REP", label: "Repair", group: "Active" },
      { value: "TRAN", label: "In Transit", group: "Active" },
      { value: "ASSI", label: "Assigned", group: "Active" },
    ],
  },
  {
    label: "Closed",
    options: [
      { value: "WR", label: "Written Off", group: "Closed" },
      { value: "NW", label: "Not Working", group: "Closed" },
      { value: "SL", label: "Stolen/Lost", group: "Closed" },
      { value: "RC", label: "Returned to Client", group: "Closed" },
      { value: "LC", label: "Returned to Leasing Company", group: "Closed" },
    ],
  },
];
