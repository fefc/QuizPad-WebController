export interface Player {
  readonly uuid: string,
  readonly nickname: string,
  readonly avatar: string,
  answer: number,
  stats: PlayerStats
}

export interface PlayerStats {
  position: number,
  points: number
}
