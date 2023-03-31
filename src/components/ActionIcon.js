import { FaHandRock, FaHandPaper, FaHandScissors, FaHandLizard, FaHandSpock } from "react-icons/fa";

function ActionIcon({ action, ...props }) {
    const icons = {
      rock: FaHandRock,
      paper: FaHandPaper,
      scissors: FaHandScissors,
    };
    const Icon = icons[action];
    return <Icon {...props} />;
  }

  export default ActionIcon