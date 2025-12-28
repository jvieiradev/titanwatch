export enum CommanderRank {
  MARSHAL = 'marshal',
  GENERAL = 'general',
}

export class Commander {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly rank: CommanderRank,
    public readonly yearsOfService: number
  ) {}
}
