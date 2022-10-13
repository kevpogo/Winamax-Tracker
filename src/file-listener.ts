import { BrowserWindow } from "electron";
import { readFileSync } from "node:fs";
import { Player, PlayerInfosService } from "./player-infos-service";
import { PLAYER_NAME } from "../index";

interface HeroInfo {
  pseudo: string;
  stack: number;
  bb: number;
  M: number;
}

export class FileListener {
  private players: Map<string, BrowserWindow> = new Map<
    string,
    BrowserWindow
  >();
  private playerInfosService: PlayerInfosService;

  constructor(
    private readonly window: BrowserWindow,
    private readonly filePath: string
  ) {
    this.playerInfosService = new PlayerInfosService();
    this.read();
  }

  async read() {
    const data = readFileSync(this.filePath, { encoding: "utf-8" });
    const hands = data.split("\n\n\n");
    const lastHand = hands[hands.length - 2];

    const players = this.getLastHandPlayers(lastHand);

    for (const player of players) {
      if (!this.players.has(player)) {
        if (player !== PLAYER_NAME) {
          this.playerInfosService.getPlayerInfo(player).then((playerInfos) => {
            if (playerInfos) {
              this.players.set(player, this.createWindow(playerInfos));
            }
          });
        }
      }
    }

    for (const player of this.players.keys()) {
      if (!players.includes(player)) {
        this.players.get(player)?.destroy();
        this.players.delete(player);
      }
    }
  }

  private getLastHandPlayers(lastHand: string) {
    const lines = lastHand.split("\n");
    let actualLine = 2;
    let players: string[] = [];
    let isHeroAllIn = false;
    let isHeroLoose = false;

    while (lines[actualLine].startsWith("Seat")) {
      const player = lines[actualLine++].match(/Seat \d*: (.*) \(/);

      if (player) {
        players.push(player[1]);
      }
    }

    for (const line of lines) {
      const heroAllIn = line.match(`${PLAYER_NAME} .* and is all-in`);
      if (heroAllIn) isHeroAllIn = true;
      const player = line.match(`Seat .* ${PLAYER_NAME} .* and lost`);
      if (isHeroAllIn && player) isHeroLoose = true;
    }

    return isHeroLoose ? [] : players;
  }

  private getLastHandHero(lastHand: string): HeroInfo {
    const lines = lastHand.split("\n");
    let actualLine = 2;
    const heroInfo: HeroInfo = {
      pseudo: PLAYER_NAME,
      stack: 0,
      bb: 0,
      M: 0,
    };

    let numberOfPersons = 0;
    while (lines[actualLine].startsWith("Seat")) {
      numberOfPersons++;
      const stack = lines[actualLine++].match(
        `Seat \d*: ${PLAYER_NAME} \((\d*)\)`
      );

      if (stack) {
        heroInfo.stack = Number.parseInt(stack[1]);
      }
    }

    const niveau = lines[0].match(/\((\d*)\/(\d*)\/(\d*)\)/);
    if (niveau) {
      const sb = Number.parseInt(niveau[1]);
      const bb = Number.parseInt(niveau[2]);
      const ante = Number.parseInt(niveau[3]);

      heroInfo.bb = Math.trunc((heroInfo.stack / bb) * 100) / 100;
      heroInfo.M = heroInfo.stack / (sb + bb + numberOfPersons * ante);
    }

    return heroInfo;
  }

  private createWindow(playerInfos: Player) {
    const win = new BrowserWindow({
      x: 0,
      y: 0,
      width: 160,
      height: 80,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      movable: true,
      parent: this.window,
    });
    win.loadFile("pastille/pastille.html", {
      query: {
        pseudo: playerInfos.pseudo,
        type: playerInfos.type,
        roi: playerInfos.roi,
        roiMoyen: playerInfos.roiMoyen,
        itm: playerInfos.itm,
        profit: playerInfos.profit,
        profitMoyen: playerInfos.profitMoyen,
      },
    });

    return win;
  }
}
