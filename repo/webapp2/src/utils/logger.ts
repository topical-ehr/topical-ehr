export function logsFor(module: string) {
  return {
    debug: function (logId: string, args?: object) {
      console.debug(`[${module}] ${logId}`, args);
    },
    info: function (logId: string, args?: object) {
      console.log(`[${module}] ${logId}`, args);
    },
    warn: function (logId: string, args?: object) {
      console.warn(`[${module}] ${logId}`, args);
    },
    error: function (logId: string, args?: object) {
      console.error(`[${module}] ${logId}`, args);
    },
    exception: function (logId: string, args?: object): Error {
      console.error(`[${module}] ${logId}`, args);
      return new Error(`${logId} [${module}]`);
    },
  };
}
