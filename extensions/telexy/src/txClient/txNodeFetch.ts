import {
  RequestInfo as NodeFetchRequestInfo,
  RequestInit as NodeFetchRequestInit,
  Response as NodeFetchResponse,
} from 'node-fetch';
import { INodeFetch } from '../common/iNodeFetch';
import nodeFetch from 'node-fetch';
import { ILogger, IProfiler } from '../common/interfaces';
export class TxNodeFetch implements INodeFetch {
  async fetch(url: NodeFetchRequestInfo, init?: NodeFetchRequestInit): Promise<NodeFetchResponse> {
    try {
      const response = await nodeFetch(url, init);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      } else if (response.headers.has('fusionerror')) {
        const err = await response.json();
        throw err;
      }
      return response;
    } catch (err) {
      // to facilitate debugging
      throw err;
    }
  }
}
