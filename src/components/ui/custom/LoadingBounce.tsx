export const LoadingBounce  =() =>  {
    return (
        <div className="flex gap-1 font-extrabold text-6xl justify-center items-center">
            <span className="bg-chart-5 size-[10px] font-sans custom-animate-bounce bounce-delay-1 rounded-full"></span>
            <span className="bg-chart-3 size-[11px] font-sans custom-animate-bounce bounce-delay-2 rounded-full"></span>
            <span className="bg-chart-2 size-[12px] font-sans custom-animate-bounce bounce-delay-3 rounded-full"></span>
        </div>
    )
}