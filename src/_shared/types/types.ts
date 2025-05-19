export interface Sender {
  name: string;
  email: string;
  count: number;
}

export interface UnsubscribeData {
  posturl: string | null;
  mailto: string | null;
  clickurl: string | null;
}

export interface ManualUnsubscribeData {
  linkOnlySenders: [string, string][]; // Array of tuples with email and click URL
  noUnsubscribeSenders: string[]; // Array of emails with no unsubscribe option
}
