export interface PollingResponseEntity {
  channel: string;
  urlRedirect: string | null | undefined;
  clientResponseUrl: string;
  logoResourcePath: string;
  authOutcome: string | null | undefined;
  error: string | null | undefined;
}

export enum Channel {
  WEB = "WEB",
  APP = "APP"
}
