export default function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[375px] h-[812px] bg-black rounded-[40px] p-3 shadow-[0_24px_48px_rgba(0,0,0,0.2),inset_0_0_0_2px_#333] relative" style={{ transform: 'scale(0.7)' }}>
      {/* Notch */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[150px] h-[30px] bg-black rounded-b-[20px] z-[100]" />
      
      {/* Screen */}
      <div className="w-full h-full bg-bg-main rounded-[32px] overflow-hidden relative flex flex-col text-text-primary transition-colors duration-300">
        {children}
      </div>
    </div>
  );
}
