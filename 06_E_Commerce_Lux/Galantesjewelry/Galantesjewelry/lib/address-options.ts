export type UsStateOption = {
  id: number;
  code: string;
  label: string;
  cities: string[];
};

export const US_COUNTRY = {
  id: 233,
  label: 'United States',
} as const;

export const US_STATE_OPTIONS: UsStateOption[] = [
  {
    id: 10,
    code: 'FL',
    label: 'Florida',
    cities: ['Islamorada', 'Miami', 'Miami Beach', 'Key Largo', 'Marathon', 'Orlando', 'Tampa', 'Key West'],
  },
  {
    id: 33,
    code: 'NY',
    label: 'New York',
    cities: ['New York', 'Brooklyn', 'Queens', 'Buffalo', 'Rochester'],
  },
  {
    id: 5,
    code: 'CA',
    label: 'California',
    cities: ['Los Angeles', 'San Diego', 'San Francisco', 'Beverly Hills', 'San Jose'],
  },
  {
    id: 43,
    code: 'TX',
    label: 'Texas',
    cities: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth'],
  },
];

export function getStateById(stateId?: number) {
  return US_STATE_OPTIONS.find((state) => state.id === stateId) || null;
}

export function getCityOptions(stateId?: number) {
  return getStateById(stateId)?.cities || [];
}
