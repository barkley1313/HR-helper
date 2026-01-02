export interface Person {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  members: Person[];
  aiIdentity?: TeamIdentity;
  isLoadingAi?: boolean;
}

export interface TeamIdentity {
  teamName: string;
  motto: string;
}

export enum AppTab {
  INPUT = 'INPUT',
  LUCKY_DRAW = 'LUCKY_DRAW',
  GROUPING = 'GROUPING',
}
