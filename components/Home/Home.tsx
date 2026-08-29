import HeroSection from "./HeroSection";

export default function HomeSection({ 
  bannerSettings, 
  initialBanners 
}: { 
  bannerSettings?: any; 
  initialBanners?: any[];
}) {
  return (
    <main>
      <HeroSection bannerSettings={bannerSettings} initialBanners={initialBanners} />
    </main>
  );
}
