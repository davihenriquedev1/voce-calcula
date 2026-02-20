import * as React from "react"

// const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
    const [isMobile, /*setIsMobile*/] = React.useState<boolean | undefined>(true) // força como true, gambiarra pra não alterar o componente UI 

    // baseado no tamanho da tela:
    /*
    React.useEffect(() => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const onChange = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }
      mql.addEventListener("change", onChange)
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      return () => mql.removeEventListener("change", onChange)
    }, [])
    */

  return !!isMobile
}
