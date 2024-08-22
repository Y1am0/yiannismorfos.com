import WindowControls from "./windowControls";


const WindowHeader = () => {
  return (
    <div className="w-full h-10 px-4 bg-gray-200 rounded-t-lg flex items-center">
        <WindowControls />
    </div>
  );
};

export default WindowHeader;
