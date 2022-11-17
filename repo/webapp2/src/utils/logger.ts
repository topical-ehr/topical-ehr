export function logsForModule(moduleName: string) {
  return function (func: Function, args: IArguments) {
    return {
      info: function (...args: any[]) {
        console.log(`[${moduleName}][${func.name}]`, ...args);
      },
      error: function (...args: any[]) {
        console.error(`[${moduleName}][${func.name}]`, ...args);
      },
    };
  };
}
