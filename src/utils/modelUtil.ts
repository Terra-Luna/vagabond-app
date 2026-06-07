type myDumbObject = {
    name: unknown;
    cringe: number;
}

type betterType = string;

type OverrideProperty<T, K extends keyof T, NewType> = Omit<T, K> & { [P in K]: NewType };
type HasProperty<T, K extends string> = K extends keyof T ? true : false;

type RemapValues<T> = {
  [K in keyof T]: T[K] extends unknown ? string : number;
};

type remapped = RemapValues<myDumbObject>;

const hi: remapped = {name: "hi!", cringe: "no"}