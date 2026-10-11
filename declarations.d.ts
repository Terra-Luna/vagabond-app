declare module "*.css?inline" {
  export const injectedCss: string;
}

/**
 * Used for rendering SVG similar to Lucide React.
 * See DieIcon.tsx for usage.
 */
declare module '*.svg?react' {
  import { FunctionComponent } from "react";
  const node: FunctionComponent<{ className: string, fill: any }>;
  export default node;
}