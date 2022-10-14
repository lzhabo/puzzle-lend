export interface IData {
  key: string;
  type: "integer" | "string";
  value: number | string;
}

export const getStateByKey = (values: IData[], key: string) =>
  values.find((state) => state.key === key)?.value;
