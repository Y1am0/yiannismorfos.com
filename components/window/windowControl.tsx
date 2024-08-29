type WindowControlProps = {
  icon: React.ElementType;
  backgroundColor: string;
  iconColor: string;
  className?: string;
  onClick?: () => void;
};

const WindowControl = ({ icon: Icon, backgroundColor, iconColor, className, onClick }: WindowControlProps) => {
  return (
    <button onClick={onClick}
      className={`w-4 h-4 rounded-full flex justify-center items-center ${backgroundColor} relative group`}
    >
      <Icon
        color={iconColor}
        className={`w-3 h-3 ${className}`}
      />
    </button>
  );
};

export default WindowControl;
