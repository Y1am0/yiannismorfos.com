import WindowControl from "./windowControl"
import { Cross1Icon, PlusIcon, MinusIcon } from "@radix-ui/react-icons";

const WindowControls = () => {
    return (
    <div className="flex gap-2 relative group">
    <WindowControl
    icon={Cross1Icon}
    backgroundColor="bg-red-500"
    iconColor="rgb(153, 27, 27)"
    className="opacity-0 group-hover:opacity-100 transition-opacity"
  />
  <WindowControl
    icon={MinusIcon}
    backgroundColor="bg-orange-300"
    iconColor="rgb(154, 52, 18)"
    className="opacity-0 group-hover:opacity-100 transition-opacity"
  />
  <WindowControl
    icon={PlusIcon}
    backgroundColor="bg-green-500"
    iconColor="rgb(22, 101, 52)"
    className="opacity-0 group-hover:opacity-100 transition-opacity"
  />
  </div>
    )
}

export default WindowControls