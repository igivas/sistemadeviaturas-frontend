export type IPaginationResponse<T> = {
  total?: number;
  totalPage?: number;
  items?: T[];
};
