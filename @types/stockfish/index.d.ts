declare module 'stockfish' {

  type EngineType = {
    onmessage: (data: string) => void;
    postMessage: (data: string) => void;
  } & {[key: any]: any};

  export default function(): EngineType;
}

