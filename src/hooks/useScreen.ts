import { useEffect, useState } from "react";

export const useScreen = () => {
    const [screen, setScreen] = useState(0);

    const handleWindowSizeChange = () => {
        setScreen(window.innerWidth);
    }

    useEffect(()=> {
        handleWindowSizeChange()
        window.addEventListener('resize', ()=> handleWindowSizeChange())
        return ()=> {
            window.removeEventListener('resize', ()=> handleWindowSizeChange())
        }
    },[])

    return screen;
}