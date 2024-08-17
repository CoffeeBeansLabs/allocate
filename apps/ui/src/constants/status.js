import ActiveIcon from "/icons/activeIcon.svg";
import ClosedIcon from "/icons/closedIcon.svg";
import ColdIcon from "/icons/coldIcon.svg";
import HotIcon from "/icons/hotIcon.svg";
import SignedIcon from "/icons/signedIcon.svg";
import WarmIcon from "/icons/warmIcon.svg";

export default [
  {
    type: "COLD",
    icon: ColdIcon,
    description: "Cold: Initial Stage of Discussion",
    uiString: "Cold",
  },
  {
    type: "WARM",
    icon: WarmIcon,
    description: "Warm: Multiple Conversations Done",
    uiString: "Warm",
  },
  {
    type: "HOT",
    icon: HotIcon,
    description: "Hot: MSA & SoW in progress",
    uiString: "Hot",
  },
  {
    type: "SIGNED",
    icon: SignedIcon,
    description: "Signed: MSA & SoW Signed",
    uiString: "Signed",
  },
  {
    type: "ACTIVE",
    icon: ActiveIcon,
    description: "Active: Project commenced",
    uiString: "Active",
  },
  {
    type: "CLOSED",
    icon: ClosedIcon,
    description: "Closed: Project Completed",
    uiString: "Closed",
  },
];
