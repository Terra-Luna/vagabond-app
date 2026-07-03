declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css?inline' {
  const classes: { readonly [key: string]: string };
  export default classes;
}