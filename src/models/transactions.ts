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

export interface XPayResponse {
  html: string;
  status: string;
  authOutcome: string;
  authCode: string;
  redirectUrl: string;
}
