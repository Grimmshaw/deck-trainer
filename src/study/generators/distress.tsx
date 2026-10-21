import { DISTRESS_SIGNALS, NOT_DISTRESS } from '../../content/distress'
import { radioWindow, RADIO_ORDER_SETS, wrongOrders } from '../../content/radioOrder'
import { DSC_SITUATIONS, DSC_TEXT, PRIORITY_SITUATIONS, PRIORITY_TEXT, RADIO_SITUATIONS, type DscCategory, type Priority } from '../../content/distressSituations'
import type { Generator, Question } from '../types'
import { pick, sample, shuffle } from '../util'
import { DISTRESS_TYPED } from '../typedAnswers'

// COLREG Annex IV: recognise the signals that indicate distress and need of assistance.

const PREFIX = 'distress:'
/** Put the parts of a MAYDAY or PAN-PAN message in the right order */
const ORDER = 'distress:order:'
/** Which signal: MAYDAY, PAN-PAN, SÉCURITÉ or MAYDAY RELAY? */
const PRIO = 'distress:prio:'
/** Which DSC category? */
const DSC = 'distress:dsc:'
const situation = (id: string) => RADIO_SITUATIONS.find((x) => x.id === id)!

function prioQuestion(key: string): Question {
  const x = situation(key.slice(PRIO.length))
  return {
    key,
    category: 'distress',
    prompt: `${x.text}${x.text.endsWith('?') ? '' : ' Which signal do you use on the radio?'}`,
    options: shuffle(Object.keys(PRIORITY_TEXT) as Priority[]).map((p) => ({ id: p, label: PRIORITY_TEXT[p] })),
    correctId: x.priority,
    explanation: <>{x.why}</>,
  }
}

function dscQuestion(key: string): Question {
  const x = situation(key.slice(DSC.length))
  return {
    key,
    category: 'distress',
    prompt: `${x.text} Which DSC category do you choose?`,
    options: (Object.keys(DSC_TEXT) as DscCategory[]).map((c) => ({ id: c, label: DSC_TEXT[c] })),
    correctId: x.dsc!,
    explanation: (
      <>
        The DSC categories in falling priority are distress, urgency, safety and routine. Here it is <strong>{DSC_TEXT[x.dsc!].toLowerCase()}</strong>.{' '}
        {x.why}
      </>
    ),
  }
}
const byKey = (key: string) => DISTRESS_SIGNALS.find((d) => PREFIX + d.id === key)!

const letters = 'ABCD'

function orderQuestion(key: string): Question {
  const { message, parts } = radioWindow(key.slice(ORDER.length))
  const shown = shuffle(parts)
  const name = (p: string) => letters[shown.indexOf(p)]
  const text = (o: string[]) => o.map(name).join(' → ')
  return {
    key,
    category: 'distress',
    prompt:
      message.id === 'ack'
        ? 'You hear a MAYDAY and can help. You acknowledge it by VHF. In which order do these four parts come?'
        : `You send a ${message.title} message by VHF after the DSC call. These four parts come one after the other. In which order?`,
    media: (
      <ol className="order-parts">
        {shown.map((p, i) => (
          <li key={p}>
            <strong>{letters[i]}</strong> {p}
          </li>
        ))}
      </ol>
    ),
    options: shuffle([{ id: 'right', label: text(parts) }, ...wrongOrders(parts).map((o, i) => ({ id: `w${i}`, label: text(o) }))]),
    correctId: 'right',
    explanation: (
      <>
        {parts.join(' → ')}. {message.why}
      </>
    ),
  }
}

export const distressGenerator: Generator = {
  category: 'distress',
  items: () => [
    ...DISTRESS_SIGNALS.map((d) => PREFIX + d.id),
    ...RADIO_ORDER_SETS.map((s) => ORDER + s),
    ...PRIORITY_SITUATIONS.map((x) => PRIO + x.id),
    ...DSC_SITUATIONS.map((x) => DSC + x.id),
  ],
  label: (key) =>
    key.startsWith(ORDER)
      ? `Order of a ${radioWindow(key.slice(ORDER.length)).message.title} message`
      : key.startsWith(PRIO)
        ? `Which signal? ${situation(key.slice(PRIO.length)).text}`
        : key.startsWith(DSC)
          ? `Which DSC category? ${situation(key.slice(DSC.length)).text}`
          : byKey(key).text,

  make(key): Question {
    if (key.startsWith(ORDER)) return orderQuestion(key)
    if (key.startsWith(PRIO)) return prioQuestion(key)
    if (key.startsWith(DSC)) return dscQuestion(key)
    const d = byKey(key)
    if (d.picture && Math.random() < 0.6) {
      return {
        key,
        category: 'distress',
        prompt: 'A vessel shows this signal. What does it mean?',
        media: <div className="flag-stage">{d.picture()}</div>,
        options: shuffle([
          { id: 'distress', label: 'She is in distress and requires assistance' },
          { id: 'pilot', label: 'She requires a pilot' },
          { id: 'anchor', label: 'She is at anchor' },
          { id: 'clear', label: 'Keep clear of me; I am manoeuvring with difficulty' },
        ]),
        correctId: 'distress',
        typed: DISTRESS_TYPED,
        explanation: (
          <>
            {d.text}. <strong>{d.ref}</strong>
          </>
        ),
      }
    }
    const wrong = sample(NOT_DISTRESS, 3)
    const ask = pick(['Which of these signals indicates distress and need of assistance?', 'Which of these is a distress signal under COLREG Annex IV?'])
    return {
      key,
      category: 'distress',
      prompt: ask,
      options: shuffle([{ id: 'right', label: d.text }, ...wrong.map((w, i) => ({ id: `w${i}`, label: w }))]),
      correctId: 'right',
      explanation: (
        <>
          {d.text} is a distress signal. <strong>{d.ref}</strong>
        </>
      ),
    }
  },

  card(key) {
    if (key.startsWith(PRIO) || key.startsWith(DSC)) {
      const q = key.startsWith(PRIO) ? prioQuestion(key) : dscQuestion(key)
      return {
        title: key.startsWith(PRIO) ? 'Which signal?' : 'Which DSC category?',
        front: <p className="card-text">{q.prompt}</p>,
        back: (
          <>
            <strong>{q.options.find((o) => o.id === q.correctId)!.label}</strong>
            <p>{q.explanation}</p>
          </>
        ),
      }
    }
    if (key.startsWith(ORDER)) {
      const { message } = radioWindow(key.slice(ORDER.length))
      return {
        title: message.title,
        front: <p className="card-text">What is the order of a {message.title} message?</p>,
        back: (
          <>
            <ol className="order-parts">
              {message.parts.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
            <p>{message.why}</p>
          </>
        ),
      }
    }
    const d = byKey(key)
    return {
      title: d.ref,
      front: d.picture ? <div className="flag-stage">{d.picture()}</div> : <p className="card-text">{d.text}</p>,
      back: (
        <>
          <strong>Distress signal</strong>
          <p>{d.text}</p>
          <p className="rule">{d.ref}</p>
        </>
      ),
    }
  },
}
