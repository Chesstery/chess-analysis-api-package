require('isomorphic-fetch');

import {LICHESS_OPENING_URL} from './../constants';

export function lichessOpening(params: {fen: string}): Promise<any> {

  const fen: string = params.fen;

  return new Promise<any>((
    resolve: (data: any) => void,
    reject: (error: any) => void
  ): void => {
    fetch(`${LICHESS_OPENING_URL}?fen=${fen}`, {
      method: "GET"
    })
    .then((response: Response): Promise<any> => response.json())
    .then((data: any) => {
      if(data.moves?.length > 0) {
        resolve({...data, fen});
      } else {
        reject({
          fen,
          message: "not opening move find or FEN invalid"
        });
      }
    })
    .catch(reject)
  });

};

