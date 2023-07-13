export type Renderer<T extends {} = {}> = {
  onLoad: () => void;
} & T;
