import axios from "axios";
import { CSRF_TOKEN, SESSION_TOKEN } from "../index";

export interface Player {
  pseudo: string;
  type: string;
  roi: string;
  roiMoyen: string;
  itm: string;
  profit: string;
  profitMoyen: string;
}

export class PlayerInfosService {
  constructor() {}

  async getPlayerInfo(player: string): Promise<Player | undefined> {
    try {
      const playerInfos = await axios.get(
        `https://www.pokstats.com/_next/data/SlgZvU6qYefxvLHuhtifP/stats.json?playerNickname=${player}&filter=SCHEDULED&roomName=Winamax.fr`,
        {
          headers: {
            accept: "*/*",
            "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
            "sec-ch-ua":
              '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            cookie: `__Host-next-auth.csrf-token=${CSRF_TOKEN};__Secure-next-auth.session-token=${SESSION_TOKEN}`,
            Referer: "https://www.pokstats.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
          },
        }
      );

      return {
        pseudo: player,
        type: playerInfos.data.pageProps.scoreData?.logo || "",
        roi: playerInfos.data.pageProps.globalStatsData?.roiTotal?.value || "",
        roiMoyen:
          playerInfos.data.pageProps.globalStatsData?.avgRoi?.value || "",
        itm: playerInfos.data.pageProps.globalStatsData?.itmRatio?.value || "",
        profit: playerInfos.data.pageProps.globalStatsData?.profit?.value || "",
        profitMoyen:
          playerInfos.data.pageProps.globalStatsData?.avgProfit?.value || "",
      };
    } catch (error) {
      console.log(player);
      console.log("unexpected error: ", error);
    }
  }
}
