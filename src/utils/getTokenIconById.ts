import plutoLogo from "@src/assets/tokens/PLUTO.png";
import wavesLogo from "@src/assets/tokens/waves-logo.svg";
import usdnLogo from "@src/assets/tokens/usdn-logo.svg";
import tsnLogo from "@src/assets/tokens/TSN.svg";
import wxLogo from "@src/assets/tokens/WX.svg";
import puzzleLogo from "@src/assets/tokens/PUZZLE.svg";

export const getTokenIconById = (id: string) => {
  switch (id) {
    case "Ajso6nTTjptu2UHLx6hfSXVtHFtRBJCkKYd5SAyj7zf5":
      return plutoLogo;
    case "WAVES":
      return wavesLogo;
    case "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p":
      return usdnLogo;
    case "8t4DPWTwPzpatHA9AkTxWAB47THnYzBsDnoY7fQqbG91":
      return tsnLogo;
    case "Atqv59EYzjFGuitKVnMRk6H8FukjoV3ktPorbEys25on":
      return wxLogo;
    case "HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS":
      return puzzleLogo;
    default:
      return wavesLogo;
  }
};
