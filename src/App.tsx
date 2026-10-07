import { useEffect, useMemo, useState } from 'react'
import type { Level, Mode } from './morse'
import { findRegion } from './regions'
import { load, save } from './storage'
import { findCategory, type CategoryId } from './study/categories'
import { EXAM_CATEGORIES, GENERATORS } from './study/registry'
import type { Ctx, Generator } from './study/types'
import Hub from './components/Hub'
import Home from './components/Home'
import Practice from './components/Practice'
import Chart from './components/Chart'
import Buoyage from './components/Buoyage'
import Lights from './components/Lights'
import RegionPicker from './components/RegionPicker'
import ComingSoon from './components/ComingSoon'
import CategoryHome from './components/study/CategoryHome'
import Session, { type SessionMode } from './components/study/Session'
import Learn from './components/study/Learn'

export interface Settings {
  mode: Mode
  level: Level
  length: number
}

export interface Stats {
  bestStreak: number
}

type Screen =
  | { name: 'hub' }
  | { name: 'region' }
  | { name: 'morse' }
  | { name: 'practice' }
  | { name: 'chart' }
  | { name: 'gallery'; category: 'buoyage' | 'lights' }
  | { name: 'category'; category: CategoryId }
  | { name: 'session'; category: CategoryId; mode: SessionMode; count: number; back: Screen; run: number }
  | { name: 'learn'; category: CategoryId; back: Screen }
  | { name: 'soon'; category: CategoryId }

const DEFAULT_SETTINGS: Settings = { mode: 'decode', level: 1, length: 3 }
const DEFAULT_STATS: Stats = { bestStreak: 0 }

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'hub' })
  const [settings, setSettings] = useState<Settings>(() => load('morse.settings', DEFAULT_SETTINGS))
  const [stats, setStats] = useState<Stats>(() => load('morse.stats', DEFAULT_STATS))
  const [regionId, setRegionId] = useState<string>(() => load('morse.region', { id: 'intl' }).id)
  const region = findRegion(regionId)
  const ctx: Ctx = useMemo(() => ({ region }), [region])

  // Effects must not return anything except a clean-up function, so the
  // bodies are wrapped in braces. (Newer browsers make scrollTo return a
  // Promise, which React treats as a broken clean-up function and crashes.)
  useEffect(() => {
    save('morse.settings', settings)
  }, [settings])
  useEffect(() => {
    save('morse.stats', stats)
  }, [stats])
  useEffect(() => {
    save('morse.region', { id: regionId })
  }, [regionId])
  // Start each new screen at the top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen])

  const go = (s: Screen) => setScreen(s)
  const hub = () => go({ name: 'hub' })

  const updateBestStreak = (streak: number) =>
    setStats((s) => (streak > s.bestStreak ? { ...s, bestStreak: streak } : s))

  const openCategory = (id: CategoryId) => {
    if (id === 'morse') go({ name: 'morse' })
    else if (id === 'exam') startSession('exam', 'exam', 40, { name: 'hub' })
    else if (GENERATORS[id]) go({ name: 'category', category: id })
    else go({ name: 'soon', category: id })
  }

  const startSession = (category: CategoryId, mode: SessionMode, count: number, back: Screen) =>
    go({ name: 'session', category, mode, count, back, run: Date.now() })

  const generatorsFor = (id: CategoryId): Generator[] =>
    id === 'exam' ? EXAM_CATEGORIES.map((c) => GENERATORS[c]!) : [GENERATORS[id]!]

  return (
    <div className="app">
      {screen.name === 'hub' && <Hub region={region} onOpen={openCategory} onRegion={() => go({ name: 'region' })} />}

      {screen.name === 'region' && (
        <RegionPicker
          current={region}
          onPick={(r) => {
            setRegionId(r.id)
            hub()
          }}
          onBack={hub}
        />
      )}

      {screen.name === 'morse' && (
        <Home
          settings={settings}
          stats={stats}
          onChange={setSettings}
          onStart={() => go({ name: 'practice' })}
          onChart={() => go({ name: 'chart' })}
          onLearn={() => go({ name: 'learn', category: 'morse', back: { name: 'morse' } })}
          onQuiz={() => startSession('morse', 'practice', 10, { name: 'morse' })}
          onBack={hub}
        />
      )}
      {screen.name === 'practice' && (
        <Practice settings={settings} onExit={() => go({ name: 'morse' })} onStreak={updateBestStreak} />
      )}
      {screen.name === 'chart' && <Chart level={settings.level} onBack={() => go({ name: 'morse' })} />}

      {screen.name === 'category' && (
        <CategoryHome
          category={findCategory(screen.category)}
          generator={GENERATORS[screen.category]!}
          ctx={ctx}
          onBack={hub}
          onStart={(mode, count) => startSession(screen.category, mode, count, screen)}
          onLearn={() => go({ name: 'learn', category: screen.category, back: screen })}
          reference={
            screen.category === 'buoyage' || screen.category === 'lights'
              ? {
                  label: screen.category === 'buoyage' ? 'All marks' : 'All vessels',
                  open: () => go({ name: 'gallery', category: screen.category as 'buoyage' | 'lights' }),
                }
              : undefined
          }
        />
      )}

      {screen.name === 'gallery' && screen.category === 'buoyage' && (
        <Buoyage region={region.buoyage} onBack={() => go({ name: 'category', category: 'buoyage' })} />
      )}
      {screen.name === 'gallery' && screen.category === 'lights' && (
        <Lights onBack={() => go({ name: 'category', category: 'lights' })} />
      )}

      {screen.name === 'session' && (
        <Session
          key={screen.run}
          title={screen.category === 'exam' ? 'Final exam' : findCategory(screen.category).title}
          generators={generatorsFor(screen.category)}
          mode={screen.mode}
          count={screen.count}
          ctx={ctx}
          onExit={() => go(screen.back)}
          onPracticeMistakes={() => startSession(screen.category, 'mistakes', 10, screen.back)}
        />
      )}

      {screen.name === 'learn' && (
        <Learn
          title={findCategory(screen.category).title}
          generator={GENERATORS[screen.category]!}
          ctx={ctx}
          onExit={() => go(screen.back)}
        />
      )}

      {screen.name === 'soon' && <SoonScreen id={screen.category} onBack={hub} />}
    </div>
  )
}

function SoonScreen({ id, onBack }: { id: CategoryId; onBack: () => void }) {
  const c = findCategory(id)
  return <ComingSoon title={c.title} text={c.text} icon={c.icon} onBack={onBack} />
}
