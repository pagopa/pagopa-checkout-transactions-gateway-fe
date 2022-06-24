export function getConfig(): {
  API_HOST: string;
  API_BASEPATH: string;
  API_GET_INTERVAL: number;
  API_TIMEOUT: number;
} {
  return {
    API_HOST: process.env.API_HOST || "",
    API_BASEPATH: process.env.API_BASEPATH || "",
    API_GET_INTERVAL: +(process.env.API_GET_INTERVAL || 5000),
    API_TIMEOUT: +(process.env.API_TIMEOUT || 10000)
  };
}
