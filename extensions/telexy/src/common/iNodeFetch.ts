import {
  RequestInfo as NodeFetchRequestInfo,
  RequestInit as NodeFetchRequestInit,
  Response as NodeFetchResponse,
} from 'node-fetch';
export interface INodeFetch {
  fetch(url: NodeFetchRequestInfo, init?: NodeFetchRequestInit): Promise<NodeFetchResponse>;
}
