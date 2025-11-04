import { FireBot, CitizenFeedback } from '@/types/bot';

// Mock fire bots deployed in San Francisco area
export const mockBots: FireBot[] = [
  {
    id: 'bot-001',
    name: 'FireBot Alpha',
    status: 'active',
    latitude: 37.7749,
    longitude: -122.4194,
    lastActive: '2024-11-04 14:23:00',
  },
  {
    id: 'bot-002',
    name: 'FireBot Beta',
    status: 'inactive',
    latitude: 37.7849,
    longitude: -122.4094,
  },
  {
    id: 'bot-003',
    name: 'FireBot Gamma',
    status: 'inactive',
    latitude: 37.7649,
    longitude: -122.4294,
  },
  {
    id: 'bot-004',
    name: 'FireBot Delta',
    status: 'active',
    latitude: 37.7949,
    longitude: -122.3994,
    lastActive: '2024-11-04 14:45:00',
  },
  {
    id: 'bot-005',
    name: 'FireBot Epsilon',
    status: 'inactive',
    latitude: 37.7549,
    longitude: -122.4394,
  },
];

// Mock citizen feedback
export const mockFeedback: CitizenFeedback[] = [
  {
    id: 'fb-001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    message: 'The fire bot responded incredibly fast to the incident on Market Street. Excellent service!',
    timestamp: '2024-11-04 10:30:00',
    rating: 5,
  },
  {
    id: 'fb-002',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    message: 'Great initiative! The bot near my neighborhood gives me peace of mind.',
    timestamp: '2024-11-03 15:45:00',
    rating: 5,
  },
  {
    id: 'fb-003',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    message: 'I noticed a bot that seemed to be malfunctioning. It was making unusual sounds.',
    timestamp: '2024-11-02 09:15:00',
    rating: 3,
  },
  {
    id: 'fb-004',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    message: 'The response time was amazing during the small fire last week. Thank you!',
    timestamp: '2024-11-01 18:20:00',
    rating: 5,
  },
  {
    id: 'fb-005',
    name: 'Robert Martinez',
    email: 'r.martinez@email.com',
    message: 'Would like to see more bots deployed in the western district.',
    timestamp: '2024-10-31 12:00:00',
    rating: 4,
  },
];
