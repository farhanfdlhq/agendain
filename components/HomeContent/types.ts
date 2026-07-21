export interface DestinationType {
  slug: string
  nama?: string
  name?: string
  foto?: string
  image?: string
  rating?: string
  price?: string
  openTripCount?: number
}

export interface HomeSettingsType {
  [key: string]: any
  whatsapp_number?: string
  whatsapp_message?: string
  sectionOrder?: string
  whyItems?: WhyCardType[]
  whyItems_en?: WhyCardType[]
  accItems?: AccordionItemType[]
  accItems_en?: AccordionItemType[]
  testiItems?: TestimonialType[]
  testiItems_en?: TestimonialType[]
  faqItems?: FaqItemType[]
  faqItems_en?: FaqItemType[]
}

export interface WhyCardType {
  number: string
  title: string
  desc: string
  image?: string
  foto?: string
}

export interface AccordionItemType {
  title: string
  body: string
}

export interface TestimonialType {
  name: string
  text: string
}

export interface FaqItemType {
  q: string
  a: string
}

export interface PackageType {
  id: string
  slug: string
  nama: string
  // Add more as needed
}
