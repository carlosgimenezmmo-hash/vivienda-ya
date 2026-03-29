"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div style={{ background: "#fff", color: "#0a0a0a", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <p>Landing OK</p>
    </div>
  )
}
