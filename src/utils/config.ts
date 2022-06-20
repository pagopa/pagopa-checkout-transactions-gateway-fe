export function getConfig(): {
  API_HOST: string;
  API_GET_INTERVAL: number;
} {
  return {
    API_HOST: process.env.API_HOST || "",
    API_GET_INTERVAL: +(process.env.API_GET_INTERVAL || 5000),
  };
}
