export const LoadingBounce = () => {
    return (
        <div className="flex gap-1 font-extrabold text-6xl justify-center items-center">
            <span className="text-color-palette4 font-sans custom-animate-bounce bounce-delay-1">.</span>
            <span className="text-color-palette1 font-sans custom-animate-bounce bounce-delay-2">.</span>
            <span className="text-color-palette2 font-sans custom-animate-bounce bounce-delay-3">.</span>
        </div>
    )
}