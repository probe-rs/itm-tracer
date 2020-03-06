export interface DwtUnit {
    active: boolean,
    address: number,
    data: number[],
}

export interface Dwt {
    units: DwtUnit[],
}