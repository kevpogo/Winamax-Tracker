import { app, BrowserWindow } from "electron";
import { TrackerManager } from "./src/tracker-manager";
import { homedir } from "node:os";
import {PlayerInfosService} from "./src/player-infos-service";

export const PLAYER_NAME = "";
const user = homedir().split("/").pop();
export const PATH = `/home/${user}/.wine/drive_c/users/${user}/AppData/Roaming/winamax/documents/accounts/${PLAYER_NAME}/history`;
// Find this token in Pokstats Cookie
export const CSRF_TOKEN =
  "";
export const SESSION_TOKEN =
  "";

app.whenReady().then(async () => {
  const service = new PlayerInfosService();
  const infos = await service.getPlayerInfo(PLAYER_NAME);
  console.log(infos);

  const window = new BrowserWindow({
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    movable: true,
  });
  new TrackerManager(window);
});
