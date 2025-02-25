export interface IOPTIONS {
  label: string;
  value: string;
}

export interface IBOOLEANOPTIONS{
    label: string;
    value: boolean;
}

export interface IFILTEROPERATOR {
  AND: string;
  OR: string;
}

export type IFILTERMATCHMODE =
  | "STARTS_WITH"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "ENDS_WITH"
  | "EQUALS"
  | "NOT_EQUALS"
  | "IN"
  | "LESS_THAN"
  | "LESS_THAN_OR_EQUAL_TO"
  | "GREATER_THAN"
  | "GREATER_THAN_OR_EQUAL_TO"
  | "BETWEEN"
  | "DATE_IS"
  | "DATE_IS_NOT"
  | "DATE_BEFORE"
  | "DATE_AFTER"
  | "CUSTOM";

export interface IFILTERCONSTRAINTS {
  value: string | null | boolean | number | Date;
  matchMode: IFILTERMATCHMODE;
}

export interface IFILTERS {
  operator: IFILTEROPERATOR;
  constraints: IFILTERCONSTRAINTS[];
}

export interface ICONSTRAINTS {
  id: string;
  matchMode: string;
  query: string | boolean | number | Date | null;
  column: string;
}

export type FILTERVALUE = string | boolean | number | Date | null;