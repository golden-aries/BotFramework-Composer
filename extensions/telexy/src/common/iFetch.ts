export interface IFetch {
  fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
}
