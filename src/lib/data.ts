import { media, type Img } from './media'

export const BRAND = 'BLACK JACK BARBERS'
export const ADDRESS = 'Kyiv, Ukraine'
export const HOURS = { days: 'Mon — Sat', time: '10:00 — 21:00' }
export const LINKS = {
  instagram: 'https://instagram.com/',
  telegram: 'https://t.me/',
  maps: 'https://www.google.com/maps/search/?api=1&query=Kyiv+Ukraine+barbershop',
  email: 'mailto:hello@blackjackbarbers.com',
}

export const nav = [
  { label: 'About', target: '#about' },
  { label: 'Services', target: '#services' },
  { label: 'Team', target: '#team' },
  { label: 'Work', target: '#work' },
  { label: 'Contact', target: '#contact' },
]

export type Service = { name: string; desc: string; time: string; price: number; img: Img }
export const services: Service[] = [
  { name: 'Signature Haircut', desc: 'Consultation, precision cut, wash and styling. Built around your head shape and the way you actually wear your hair.', time: '60 min', price: 900, img: media.haircut },
  { name: 'Beard Sculpt', desc: 'Shape, line-up and hot-towel finish with a straight razor. Oil and balm to close.', time: '40 min', price: 650, img: media.beard },
  { name: 'Haircut + Beard', desc: 'The full signature cut and beard sculpt in one sitting — one barber, one consistent line.', time: '90 min', price: 1400, img: media.combo },
  { name: 'Kids Cut', desc: 'A calm, quick cut for boys under 12. Same craft, a little more patience.', time: '40 min', price: 600, img: media.kids },
  { name: 'Royal Package', desc: 'Haircut, beard, hot-towel shave, face care and a pour from the bar. Two hours that belong to you.', time: '120 min', price: 2400, img: media.royal },
]

export type Barber = { name: string; role: string; years: number; handle: string; img: Img; note: string }
export const barbers: Barber[] = [
  { name: 'Mark Lysenko', role: 'Founder · Head Barber', years: 12, handle: 'mark.blackjack', img: media.teamMark, note: 'Scissor-over-comb, classic tapers' },
  { name: 'Denys Koval', role: 'Senior Barber', years: 8, handle: 'denys.blackjack', img: media.teamDenys, note: 'Skin fades, textured crops' },
  { name: 'Artem Shevchuk', role: 'Beard Specialist', years: 6, handle: 'artem.blackjack', img: media.teamArtem, note: 'Straight-razor shaves, beard design' },
  { name: 'Ivan Melnyk', role: 'Barber', years: 4, handle: 'ivan.blackjack', img: media.teamIvan, note: 'Long hair, modern mullets' },
]

export type Work = { title: string; tag: string; img: Img; layout: string; speed: number }
export const work: Work[] = [
  { title: 'The Gentleman Taper', tag: 'Haircut', img: media.workA, layout: 'md:col-span-8', speed: -0.5 },
  { title: 'Sharp Line', tag: 'Beard', img: media.workB, layout: 'md:col-span-3 md:col-start-10 md:mt-[30vh]', speed: 0.8 },
  { title: 'Midnight Fade', tag: 'Skin fade', img: media.workC, layout: 'md:col-span-4 md:col-start-2 md:mt-[6vh]', speed: 0.3 },
  { title: 'Textured Crop', tag: 'Haircut', img: media.workD, layout: 'md:col-span-5 md:col-start-7 md:mt-[24vh]', speed: -0.4 },
  { title: 'Royal Ritual', tag: 'Shave', img: media.workE, layout: 'md:col-span-8 md:col-start-3 md:mt-[6vh]', speed: 0.5 },
]

export const reviews = [
  { quote: 'The best barbershop I’ve ever been to.', name: 'Alex M.', meta: 'Signature Haircut' },
  { quote: 'Forty minutes, not one wasted movement.', name: 'Dmytro K.', meta: 'Beard Sculpt' },
  { quote: 'It feels like a private club, not a salon.', name: 'Oleh S.', meta: 'Royal Package' },
  { quote: 'Finally, a fade that still looks right in week three.', name: 'Max R.', meta: 'Haircut + Beard' },
]

export const uah = (n: number) => `${n.toLocaleString('en-US').replace(',', ' ')} ₴`
