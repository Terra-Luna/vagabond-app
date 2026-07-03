declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css?inline' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.svg?react' {
  import { FunctionComponent } from "react";
  const node: FunctionComponent<{ className: string, fill: any }>;
  export default node;
}