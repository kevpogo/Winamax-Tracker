import { watch } from "node:fs";
import { FileListener } from "./file-listener";
import { BrowserWindow } from "electron";
import { PATH } from "../index";

export class TrackerManager {
  private files: Map<string, FileListener> = new Map<string, FileListener>();

  constructor(window: BrowserWindow) {
    watch(`${PATH}`, (event, filename) => {
      if (event === "change" && filename.endsWith(".txt")) {
        if (!filename.startsWith(".") && !filename.includes("summary")) {
          if (!this.files.has(filename)) {
            this.files.set(
              filename,
              new FileListener(window, `${PATH}/${filename}`)
            );
          } else {
            this.files.get(filename)?.read();
          }
        }
      }
    });
  }
}
