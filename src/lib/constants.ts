import { FieldDefinition } from "@/types";

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  schema: FieldDefinition[];
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'merit_making',
    name: 'Merit Making',
    description: 'Flower ceremony or general merit making.',
    schema: [
      { key: 'usd', label: 'USD', type: 'money_usd' },
      { key: 'khr', label: 'KHR', type: 'money_khr' },
    ]
  },
  {
    id: 'memorial',
    name: 'Memorial Service',
    description: 'Traditional Dakshinanupadana memorial service.',
    schema: [
      { key: 'usd', label: 'USD', type: 'money_usd' },
      { key: 'khr', label: 'KHR', type: 'money_khr' },
    ]
  },
  {
    id: 'inauguration',
    name: 'Temple Inauguration',
    description: 'Inauguration of temple structures.',
    schema: [
      { key: 'usd', label: 'USD', type: 'money_usd' },
      { key: 'khr', label: 'KHR', type: 'money_khr' },
    ]
  },
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Standard wedding template.',
    schema: [
      { key: 'usd', label: 'USD', type: 'money_usd' },
      { key: 'khr', label: 'KHR', type: 'money_khr' },
    ]
  },
  {
    id: 'funeral',
    name: 'Funeral',
    description: 'Includes Money, Rice, and Water contributions.',
    schema: [
      { key: 'usd', label: 'USD', type: 'money_usd' },
      { key: 'khr', label: 'KHR', type: 'money_khr' },
      { key: 'rice', label: 'Rice', type: 'number', unit: 'kg' },
      { key: 'water', label: 'Water', type: 'number', unit: 'case' },
    ]
  },
  {
    id: 'custom',
    name: 'Other',
    description: 'Start with a blank slate.',
    schema: []
  }
];
