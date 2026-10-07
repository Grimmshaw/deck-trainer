import type { ReactNode } from 'react'
import type { StudyRegion } from '../regions'
import type { CategoryId } from './categories'

export interface Ctx {
  region: StudyRegion
}

export interface Option {
  id: string
  label: string
  /** Optional richer content, for example Morse symbols or a flag */
  node?: ReactNode
}

export interface Question {
  /** The knowledge item this question tests, used for progress and "My mistakes" */
  key: string
  category: CategoryId
  prompt: string
  /** Picture, light or sound shown with the question */
  media?: ReactNode
  options: Option[]
  correctId: string
  explanation: ReactNode
  /** Extra picture shown after answering, for example the same vessel by day */
  reveal?: ReactNode
  /** 'pictures' shows the options as a 2 × 2 grid of pictures */
  layout?: 'pictures'
}

export interface Flashcard {
  front: ReactNode
  title: string
  back: ReactNode
}

export interface Generator {
  category: CategoryId
  /** Every knowledge item in this category */
  items(ctx: Ctx): string[]
  /** A question about one item. May return null if the item can't be asked right now. */
  make(key: string, ctx: Ctx): Question | null
  /** A flashcard for Learn mode */
  card?(key: string, ctx: Ctx): Flashcard
  /** Short human name for an item, shown in the results */
  label(key: string, ctx: Ctx): string
}
