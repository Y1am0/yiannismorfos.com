type WindowControlProps = {
  icon: React.ElementType;
  backgroundColor: string;
  iconColor: string;
  className?: string;
};

const WindowControl = ({ icon: Icon, backgroundColor, iconColor, className }: WindowControlProps) => {
  return (
    <div
      className={`w-4 h-4 rounded-full flex justify-center items-center ${backgroundColor} relative group`}
    >
      <Icon
        color={iconColor}
        className={`w-3 h-3 ${className}`}
      />
    </div>
  );
};

export default WindowControl;
