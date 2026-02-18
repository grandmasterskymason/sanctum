import { Cinzel, Cormorant_Garamond } from "next/font/google"

export const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
})

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-body-face",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
})
