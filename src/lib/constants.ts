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
    name: 'Wedding Ceremony',
    description: 'Standard wedding template with groom and bride details.',
    schema: [
      { key: 'usd', label: 'USD', type: 'money_usd' },
      { key: 'khr', label: 'KHR', type: 'money_khr' },
    ]
  },
  {
    id: 'buddhist',
    name: 'Buddhist Ceremony (កម្មវិធីបុណ្យ)',
    description: 'Religous, merit-making, or traditional ceremony.',
    schema: [
      { key: 'usd', label: 'USD', type: 'money_usd' },
      { key: 'khr', label: 'KHR', type: 'money_khr' },
    ]
  }
];
