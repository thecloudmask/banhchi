import { FieldDefinition } from "@/types";

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  schema: FieldDefinition[];
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Standard wedding template with USD and KHR.',
    schema: [
      { key: 'usd', label: 'USD', type: 'money_usd' },
      { key: 'khr', label: 'KHR', type: 'money_khr' },
    ]
  },
  {
    id: 'funeral',
    name: 'Funeral / Ceremony',
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
    name: 'Custom',
    description: 'Start with a blank slate.',
    schema: []
  }
];
