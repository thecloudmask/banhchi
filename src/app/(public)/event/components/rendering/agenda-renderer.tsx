import { TraditionalAgenda } from "./traditional-agenda";
import { WeddingAgenda } from "./wedding-agenda";
import { FuneralAgenda } from "./funeral-agenda";
import { Content } from "@/services/content.service";
import { Event } from "@/types";

interface Props {
  content: Content;
  event: Event;
  theme: any;
  onCoverStateChange?: (shown: boolean) => void;
}

export const AgendaRenderer = ({ content, event, theme, onCoverStateChange }: Props) => {
  // Use content type if it's a specific ceremony style, otherwise fallback to event category
  const category = (content.type === 'wedding' || content.type === 'buddhist') 
    ? content.type 
    : (event.category || 'default');

  switch (category) {
    case 'wedding':
      return <WeddingAgenda content={content} event={event} theme={theme} onCoverStateChange={onCoverStateChange} />;
    case 'buddhist':
    case 'merit_making':
    case 'funeral':
    case 'memorial':
    case 'inauguration':
      return <TraditionalAgenda content={content} event={event} theme={theme} />;
    default:
      return <TraditionalAgenda content={content} event={event} theme={theme} />;
  }
};
