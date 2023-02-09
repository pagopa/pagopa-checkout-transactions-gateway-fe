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
