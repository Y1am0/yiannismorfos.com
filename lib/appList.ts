import App1Content from "@/components/appContent/app1Content";
import App2Content from "@/components/appContent/app2Content";


const appComponents: { [key: string]: React.FC } = {
  app1: App1Content,
  app2: App2Content,
};

export default appComponents;


export const apps = [
  {
    key: "app1",
    name: "App 1",
    icon: "/path/to/app1-icon.png", //TODO Replace with actual path to the icon
  },
  {
    key: "app2",
    name: "App 2",
    icon: "/path/to/app2-icon.png", //TODO Replace with actual path to the icon
  },
];
