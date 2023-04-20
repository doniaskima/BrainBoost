import pino from "pino";
import dayjs from "dayjs";
import pretty from "pino-pretty";

const logger = pino({
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

const prettyLogger = pretty({
  colorize: true,
  translateTime: "SYS:standard",
});

prettyLogger.pipe(process.stdout);

export default logger;
