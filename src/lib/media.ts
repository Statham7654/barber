import hero from '../assets/img/hero.webp'
import heroM from '../assets/img/hero-m.webp'
import haircut from '../assets/img/haircut.webp'
import beard from '../assets/img/beard.webp'
import combo from '../assets/img/combo.webp'
import kids from '../assets/img/kids.webp'
import royal from '../assets/img/royal.webp'
import razor from '../assets/img/razor.webp'
import teamMark from '../assets/img/team-mark.webp'
import teamDenys from '../assets/img/team-denys.webp'
import teamArtem from '../assets/img/team-artem.webp'
import teamIvan from '../assets/img/team-ivan.webp'
import workA from '../assets/img/work-a.webp'
import workB from '../assets/img/work-b.webp'
import workC from '../assets/img/work-c.webp'
import workD from '../assets/img/work-d.webp'
import workE from '../assets/img/work-e.webp'

/**
 * Все изображения сайта в одном месте. Чтобы поставить свои фото (барберы, стрижки) —
 * положите файл в src/assets/img и замените импорт; размеры w/h — пропорции кадра.
 */
export type Img = { src: string; w: number; h: number; alt: string }
const img = (src: string, w: number, h: number, alt: string): Img => ({ src, w, h, alt })

export const media = {
  hero: img(hero, 1920, 1080, 'Open barber scissors with brass handles on black slate, lit by a single soft light'),
  heroM: img(heroM, 1080, 1620, 'Open barber scissors with brass handles on black slate'),
  haircut: img(haircut, 900, 1125, 'Barber scissors with brass rings, open, on dark stone'),
  beard: img(beard, 900, 1125, 'A straight razor with ebony scales, fully open'),
  combo: img(combo, 900, 1125, 'Scissors and a black acetate comb laid side by side'),
  kids: img(kids, 900, 1125, 'Macro of the teeth of a black barber comb'),
  royal: img(royal, 900, 1125, 'A smoked-glass bottle of beard oil and a brass-lidded pomade tin'),
  razor: img(razor, 1600, 1000, 'Close-up of a polished straight-razor blade catching the light'),
  teamMark: img(teamMark, 800, 1000, 'his brass-handled shears'),
  teamDenys: img(teamDenys, 800, 1000, 'his comb and scissors'),
  teamArtem: img(teamArtem, 800, 1000, 'his straight razor'),
  teamIvan: img(teamIvan, 800, 1000, 'his beard oil'),
  workA: img(workA, 1600, 1000, 'Barber tools laid out on black slate from above'),
  workB: img(workB, 800, 1000, 'Detail of scissors mid-cut'),
  workC: img(workC, 800, 1200, 'Grooming oil and pomade on the counter'),
  workD: img(workD, 1000, 800, 'Comb teeth in raking light'),
  workE: img(workE, 1600, 900, 'Straight-razor edge in close-up'),
}
