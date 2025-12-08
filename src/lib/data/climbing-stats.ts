export type ClimbingStatLine = {
  altitude: string;
  peaks: string;
};

export type ClimbingStats = {
  title: string;
  lines: ClimbingStatLine[];
};

export const successfulClimbs: ClimbingStats = {
  title: 'Successful climbs',
  lines: [
    { altitude: '8000M', peaks: 'EVEREST x2 / K2 / MANASLU' },
    { altitude: '7000M', peaks: 'MT NOSHAQ' },
    { altitude: '6000M', peaks: 'MERA PEAK' }
  ]
};

export const unsuccessfulClimbs: ClimbingStats = {
  title: 'Unsuccessful climbs',
  lines: [
    { altitude: '8000M', peaks: 'DHAULAGIRI / K2 WINTER / CHO OYU' },
    { altitude: '6000M', peaks: 'MT LOGAN' },
    { altitude: '5000M', peaks: 'KOH E PAMIR' }
  ]
};

/** Format a stat line for display: "8000M EVEREST x2 / K2" */
export function formatStatLine(line: ClimbingStatLine): string {
  return `${line.altitude} ${line.peaks}`;
}
