import path from "path";

const DATA_DIR = "/mnt/ssd/data";
const DB_FILE = "/mnt/ssd/db/db.sqlite";

export const PATHS = {
  DATA_DIR,
  DB_FILE,

  getVideoPath: (fileName: string): string => path.join(DATA_DIR, `${fileName}.mp4`),
  getThumbnailPath: (fileName: string): string => path.join(DATA_DIR, `${fileName}.png`),
};