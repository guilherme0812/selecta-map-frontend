import dynamic from "next/dynamic";

const MapBackground = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="bg-background h-screen w-full">
      <MapBackground />
    </div>
  );
}
