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
