export interface PersonEntry {
  id: string;
  amount: number; // integer paisas
  direction: 'gave' | 'received';
  note?: string;
  date: string;
  time: string;
}

export interface MockPerson {
  id: string;
  name: string;
  phone?: string;
  entries: PersonEntry[];
  deletedAt?: number;
}

export const MOCK_PEOPLE: MockPerson[] = [
  {
    id: '1',
    name: 'Basit',
    entries: [
      { id: 'e1', amount: 200000, direction: 'gave', date: '2 Jul', time: '5:10 PM' },
      { id: 'e2', amount: 100000, direction: 'received', date: '28 Jun', time: '9:00 AM' },
      { id: 'e3', amount: 100000, direction: 'gave', date: '20 Jun', time: '6:40 PM' },
    ],
  },
  {
    id: '2',
    name: 'Ali',
    entries: [{ id: 'e4', amount: 50000, direction: 'received', date: '25 Jun', time: '2:15 PM' }],
  },
  {
    id: '3',
    name: 'Sarah',
    entries: [],
  },
  {
    id: '4',
    name: 'Hamza',
    entries: [{ id: 'e5', amount: 450000, direction: 'gave', date: '15 Jun', time: '11:00 AM' }],
  },
  {
    id: '5',
    name: 'Zara',
    entries: [{ id: 'e6', amount: 120000, direction: 'received', date: '10 Jun', time: '4:30 PM' }],
  },
];
