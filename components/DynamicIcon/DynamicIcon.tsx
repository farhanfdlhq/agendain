import { 
  Clock, Calendar, Users, MapPin, Compass, Sun, Moon, Star, Check, 
  Hash, Plane, Globe, Shield, Heart, Camera, Coffee, Utensils, 
  Bed, Car, Ticket, Music, ShoppingBag, Palmtree, Mountain,
  type LucideIcon 
} from 'lucide-react';

export const IconMap: Record<string, LucideIcon> = {
  Clock, Calendar, Users, MapPin, Compass, Sun, Moon, Star, Check, 
  Hash, Plane, Globe, Shield, Heart, Camera, Coffee, Utensils, 
  Bed, Car, Ticket, Music, ShoppingBag, Palmtree, Mountain
};

export const AVAILABLE_ICONS = Object.keys(IconMap);

export default function DynamicIcon({ name, size = 18, className = "" }: { name: string, size?: number, className?: string }) {
  const IconComponent = IconMap[name];
  
  if (!IconComponent) {
    // Fallback: render as text (for emojis)
    return <span className={className} style={{ fontSize: size }}>{name}</span>;
  }
  
  return <IconComponent size={size} className={className} strokeWidth={2.5} />;
}
