import WindowControl from "./windowControl";
import { Cross1Icon, PlusIcon, MinusIcon } from "@radix-ui/react-icons";

type WindowControlsProps = {
  onClose: () => void;
  onMaximize: () => void;
};

const controls = [
  { type: "close", icon: Cross1Icon, backgroundColor: "bg-red-500", iconColor: "rgb(153, 27, 27)" },
  { type: "minimize", icon: MinusIcon, backgroundColor: "bg-orange-300", iconColor: "rgb(154, 52, 18)" },
  { type: "maximize", icon: PlusIcon, backgroundColor: "bg-green-500", iconColor: "rgb(22, 101, 52)" }
];

const WindowControls: React.FC<WindowControlsProps> = ({ onClose, onMaximize }) => {
  return (
    <div className="flex gap-2 relative group">
      {controls.map(({ type, icon, backgroundColor, iconColor }, index) => (
        <WindowControl
          key={index}
          icon={icon}
          backgroundColor={backgroundColor}
          iconColor={iconColor}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={type === "close" ? onClose : type === "maximize" ? onMaximize : undefined}
        />
      ))}
    </div>
  );
};

export default WindowControls;
