declare module "*.css" {
  const content: any;
  export default content;
}

declare module '*.svg?react' {
  import { FunctionComponent } from "react";
  const node: FunctionComponent<{ className: string, fill: any }>;
  export default node;
}