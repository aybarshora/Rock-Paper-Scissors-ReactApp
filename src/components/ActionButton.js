import ActionIcon from "./ActionIcon";

function ActionButton({ action = "", onActionSelected }) {
    return (
      <button className="round-btn" onClick={() => onActionSelected(action)}>
        <ActionIcon action={action} size={20} />
      </button>
    );
  }



  
  export default ActionButton