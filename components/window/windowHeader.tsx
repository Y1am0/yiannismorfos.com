import WindowControls from "./windowControls";

type WindowHeaderProps = {
  onClose: () => void;
  onMaximize: () => void;
};

const WindowHeader: React.FC<WindowHeaderProps> = ({ onClose, onMaximize }) => {
  return (
    <div className="w-full h-10 px-4 bg-gray-200 rounded-t-lg flex items-center">
      <WindowControls onClose={onClose} onMaximize={onMaximize} />
    </div>
  );
};

export default WindowHeader;
