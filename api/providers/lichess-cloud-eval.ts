require('isomorphic-fetch');

import {LICHESS_CLOUD_EVAL_URL} from './../constants';

export function lichessCloudEval(params: {fen: string, multiPv?: number}): Promise<any> {

  return new Promise((
    resolve: (data: any) => void,
    reject: (error: any) => void,
  ): void => {
    fetch(`${LICHESS_CLOUD_EVAL_URL}?fen=${params.fen}&multiPv=${params.multiPv || 1}`, {
      method: "GET"
    })
    .then((response: Response): Promise<any> => response.json())
    .then((data: any): void => {
      if(data.error) {
        reject(data);
      } else {
        resolve(data);
      }
    })
    .catch(reject);
  });

};