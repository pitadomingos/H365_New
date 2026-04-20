import * as React from "react"

// const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Always return false to disable mobile-specific sidebar behavior
  return false;

  // Previous logic commented out:
  // const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
  //   undefined
  // )
  // const [isMounted, setIsMounted] = React.useState(false)

  // React.useEffect(() => {
  //   setIsMounted(true)
  //   return () => setIsMounted(false) // Clean up on unmount
  // }, [])

  // React.useEffect(() => {
  //   if (!isMounted) return

  //   const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  //   const onChange = () => {
  //     setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
  //   }

  //   // Set initial state after mount
  //   setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

  //   mql.addEventListener("change", onChange)
  //   return () => mql.removeEventListener("change", onChange)
  // }, [isMounted])

  // if (!isMounted) {
  //   return false; // Default to non-mobile during SSR and initial client render
  // }

  // return !!isMobile
}
