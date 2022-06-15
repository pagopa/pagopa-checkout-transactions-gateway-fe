export interface PollingResponseEntity {
  channel: string;
  urlRedirect: string;
  clientResponseUrl: string;
  logoResourcePath: string;
  authOutcome: string | null | undefined;
  error: string | null | undefined;
}