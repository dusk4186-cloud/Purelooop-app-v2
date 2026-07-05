export default function SplashScreen() {
  return (
    <div className="flex flex-col items-center h-full w-full bg-bg-main overflow-hidden">
      <div className="flex flex-col items-center flex-1 justify-center w-full">
        <img 
          src="/image-removebg-preview.png" 
          alt="PureLoop" 
          className="w-[220px] object-contain mb-12"
        />
        
        <div className="w-10 h-10 border-4 border-bg-elevated border-t-accent-primary rounded-full animate-spin"></div>
      </div>
      
      <div className="pb-12">
        <p className="text-[15px] italic text-text-secondary">Laundry made effortless</p>
      </div>
    </div>
  );
}
