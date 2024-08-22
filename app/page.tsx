import Image from 'next/image';
import TaskBar from "@/components/navigation/taskbar";
import WindowContainer from "@/components/window/windowContainer";
import lotusBackground from '@/public/backgrounds/lotus.jpg'


export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center p-24">
      <div className="absolute inset-0 z-0">
        <Image
          src={lotusBackground}
          alt='background image'
          layout="fill"
          objectFit="cover"
          quality={100}
          priority
        />
      </div>
        <WindowContainer />
      <TaskBar />
    </main>
  );
}
