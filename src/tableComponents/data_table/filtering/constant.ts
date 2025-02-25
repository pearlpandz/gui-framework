import { IBOOLEANOPTIONS, IFILTERMATCHMODE, IFILTEROPERATOR, IOPTIONS } from "./filterInterface"

export const OPERATOR : IOPTIONS[] = [
    {
        label: "Match All",
        value: "AND"
    }
    ,
    {
        label: "Match Any",
        value: "OR"
    },
]

export const STR_MATCH_MODE: IOPTIONS[] = [
    {
        label: "Starts with",
        value: "startsWith",
    },
    {
        label: "Contains",
        value: "contains",
    },
    {
        label: "Not contains",
        value: "notContains",
    },
    {
        label: "Ends with",
        value: "endsWith",
    },
    {
        label: "Equals",
        value: "equals",
    },
    {
        label: "Not equals",
        value: "notEquals",
    }
]

export const NUM_MATCH_MODE: IOPTIONS[] = [
    {
        label: "Equals",
        value: "equals",
    },
    {
        label: "Not equals",
        value: "notEquals",
    },
    {
        label: "Less than",
        value: "lt",
    },
    {
        label: "Less than or equal to",
        value: "lte",
    },
    {
        label: "Greater than",
        value: "gt",
    },
    {
        label: "Greater than or equal to",
        value: "gte",
    },
]

export const DATE_MATCH_MODE: IOPTIONS[] = [
    {
        value: "dateIs",
        label: "Date is"
    },
    {
        value:"dateIsNot",
        label:"Date is not",
    },
    {
        value:"dateBefore",
        label:"Date before",
    },
    {
        value:"dateAfter",
        label:"Date after",
    },
]

export const BOOLEAN_MATCH_MODE: IBOOLEANOPTIONS[] = [
    {
        label: "Yes",
        value: true,
    },
    {
        label: "No",
        value: false,
    },
]

export const FilterMatchMode: { [key in IFILTERMATCHMODE]: string } = {
    STARTS_WITH : 'startsWith',
    CONTAINS : 'contains',
    NOT_CONTAINS : 'notContains',
    ENDS_WITH : 'endsWith',
    EQUALS : 'equals',
    NOT_EQUALS : 'notEquals',
    IN : 'in',
    LESS_THAN : 'lt',
    LESS_THAN_OR_EQUAL_TO : 'lte',
    GREATER_THAN : 'gt',
    GREATER_THAN_OR_EQUAL_TO : 'gte',
    BETWEEN : 'between',
    DATE_IS : 'dateIs',
    DATE_IS_NOT : 'dateIsNot',
    DATE_BEFORE : 'dateBefore',
    DATE_AFTER : 'dateAfter',
    CUSTOM : 'custom'
}

export const FilterOperator : IFILTEROPERATOR = {
    AND : 'AND',
    OR : 'OR'
}

export const ALL_MATCH_MODE : (IOPTIONS | IBOOLEANOPTIONS)[] = [
    {
        label: "Starts with",
        value: "startsWith",
    },
    {
        label: "Contains",
        value: "contains",
    },
    {
        label: "Not contains",
        value: "notContains",
    },
    {
        label: "Ends with",
        value: "endsWith",
    },
    {
        label: "Equals",
        value: "equals",
    },
    {
        label: "Not equals",
        value: "notEquals",
    },
    {
        label: "Less than",
        value: "lt",
    },
    {
        label: "Less than or equal to",
        value: "lte",
    },
    {
        label: "Greater than",
        value: "gt",
    },
    {
        label: "Greater than or equal to",
        value: "gte",
    },
    {
        value: "dateIs",
        label: "Date is"
    },
    {
        value:"dateIsNot",
        label:"Date is not",
    },
    {
        value:"dateBefore",
        label:"Date before",
    },
    {
        value:"dateAfter",
        label:"Date after",
    },
    {
        label: "Yes",
        value: true,
    },
    {
        label: "No",
        value: false,
    },
]