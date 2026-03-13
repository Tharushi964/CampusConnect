// src/contexts/ColorContext.js
const color =[
    '#111FA2',
    '#5478FF',
    '#0A0F2C',
    '#111640',
    '#53CBF3',
    '#FFDE42'
]

export const colors = {
  light: {
    background: "bg-[#F0F4FF]",
    cardBg: "bg-white",
    inputBg: "bg-[#F7F9FF]",
    text: "text-[#111FA2]",
    textSecondary: "text-[#5478FF]",
    border: "border-[#53CBF3]",
    link: "text-[#5478FF] hover:text-[#111FA2]",
    gradientPrimary: "from-[#5478FF] to-[#111FA2]",
    buttonPrimary:
      "bg-gradient-to-r from-[#5478FF] to-[#111FA2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity",
    buttonSecondary:
      "text-[#111FA2] hover:bg-[#53CBF3]/20 hover:text-[#111FA2] transition-colors",
    accent: "text-[#FFDE42]",
    accentBg: "bg-[#FFDE42]",
    navBg: "bg-white border-[#53CBF3]",

     notification: {
      success: "bg-green-50 text-green-800 border-green-300",
      error: "bg-red-50 text-red-800 border-red-300",
      warning: "bg-yellow-50 text-yellow-800 border-yellow-300",
      info: "bg-blue-50 text-blue-800 border-blue-300",
    },
  },
  
  dark: {
    background: "bg-[#0A0F2C]",
    cardBg: "bg-[#111640]",
    inputBg: "bg-[#0D1235]",
    text: "text-[#F0F4FF]",
    textSecondary: "text-[#53CBF3]",
    border: "border-[#5478FF]/40",
    link: "text-[#53CBF3] hover:text-[#FFDE42]",
    gradientPrimary: "from-[#5478FF] to-[#53CBF3]",
    buttonPrimary:
      "bg-gradient-to-r from-[#5478FF] to-[#53CBF3] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity",
    buttonSecondary:
      "text-[#53CBF3] hover:bg-[#5478FF]/20 hover:text-[#F0F4FF] transition-colors",
    accent: "text-[#FFDE42]",
    accentBg: "bg-[#FFDE42]",
    navBg: "bg-[#111640] border-[#5478FF]/40",

    notification: {
      success: "bg-green-900/30 text-green-200 border-green-700",
      error: "bg-red-900/30 text-red-200 border-red-700",
      warning: "bg-yellow-900/30 text-yellow-200 border-yellow-700",
      info: "bg-blue-900/30 text-blue-200 border-blue-700",
    },
  },
};