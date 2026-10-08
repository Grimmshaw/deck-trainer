import { useMemo } from 'react'
import BuoySvg from '../buoyage/BuoySvg'
import { getMark } from '../buoyage/marks'
import { CHART_SYMBOLS, ChartSymbolSvg } from '../chart/symbols'
import BearingDial from '../colregs/BearingDial'
import CategoryIcon, { type IconKind } from '../components/CategoryIcon'
import { FLAGS, FlagSvg } from '../flags/flags'
import { plainShipScene } from '../lights/scene'
import VesselSvg from '../lights/VesselSvg'
import { VESSELS } from '../lights/vessels'
import type { CategoryId } from '../study/categories'

// Small pictures for the category cards, drawn by the same engines as the questions.

export default function CategoryArt({ id, icon }: { id: CategoryId; icon: IconKind }) {
  const art = useMemo(() => {
    switch (id) {
      case 'buoyage':
        return <BuoySvg mark={getMark('north', 'A')} size={40} />
      case 'lights': {
        const v = VESSELS.find((x) => x.id === 'ram')!.variants[0]
        return <VesselSvg variant={v} night silhouette scene={{ ...plainShipScene(45), horizon: 120 }} size={92} zoom={1.9} />
      }
      case 'colregs':
        return <BearingDial bearing={45} size={44} />
      case 'flags':
        return <FlagSvg flag={FLAGS.find((f) => f.letter === 'A')!} size={38} />
      case 'chart':
        return <ChartSymbolSvg symbol={CHART_SYMBOLS.find((s) => s.id === 'wreckDanger')!} size={44} />
      default:
        return <CategoryIcon kind={icon} size={30} />
    }
  }, [id, icon])
  return <span className={`category-icon art-${id}`}>{art}</span>
}
