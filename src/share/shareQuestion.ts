// "Share this question": draws the question on screen (text, picture and the
// answer options – never the answer) as a 1080 × 1350 image with the Lanterna
// logo and address, for posts in Facebook groups and the like. On a phone it
// opens the share sheet; elsewhere the image is downloaded.

const W = 1080
const H = 1350
const PAD = 60
const C = {
  bg: '#0b1d33',
  card: '#173359',
  text: '#eef3fa',
  muted: '#9db2cf',
  signal: '#ffc83d',
}
const FONT = "'Barlow', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

/** CSS variables (var(--x)) in an SVG don't work once it is an image: put in the current values */
function resolveVars(svg: string): string {
  const cs = getComputedStyle(document.documentElement)
  return svg.replace(/var\((--[a-z0-9-]+)\)/gi, (_, name: string) => cs.getPropertyValue(name).trim() || '#888')
}

function svgImage(el: SVGSVGElement): Promise<{ img: HTMLImageElement; w: number; h: number }> {
  const clone = el.cloneNode(true) as SVGSVGElement
  const box = el.getBoundingClientRect()
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(box.width))
  clone.setAttribute('height', String(box.height))
  const text = resolveVars(new XMLSerializer().serializeToString(clone))
  return loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text)).then((img) => ({ img, w: box.width, h: box.height }))
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Splits text into lines that fit `width`, at most `max` lines (the last one ends with …) */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number, max: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (ctx.measureText(t).width > width && line) {
      lines.push(line)
      line = w
    } else line = t
  }
  if (line) lines.push(line)
  if (lines.length > max) {
    lines.length = max
    lines[max - 1] = lines[max - 1].replace(/\s*\S*$/, '') + ' …'
  }
  return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Draws images side by side, scaled to fit the box, centred. Returns the height used. */
function drawRow(ctx: CanvasRenderingContext2D, imgs: { img: HTMLImageElement; w: number; h: number }[], x: number, y: number, boxW: number, boxH: number, gap = 20): number {
  if (!imgs.length) return 0
  const h0 = Math.max(...imgs.map((i) => i.h))
  const totalW = imgs.reduce((s, i) => s + (i.w * h0) / i.h, 0) + gap * (imgs.length - 1)
  const k = Math.min(boxW / totalW, boxH / h0)
  let cx = x + (boxW - totalW * k) / 2
  for (const i of imgs) {
    const w = (i.w * h0) / i.h
    ctx.drawImage(i.img, cx, y, w * k, h0 * k)
    cx += (w + gap) * k
  }
  return h0 * k
}

export async function questionImage(root: HTMLElement, category: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, W, H)

  // Header: logo, name, category
  try {
    const logo = await loadImage('/logo.svg')
    ctx.drawImage(logo, PAD, 44, 84, 84)
  } catch {
    /* no logo – the name is enough */
  }
  ctx.fillStyle = C.text
  ctx.font = `800 52px ${FONT}`
  ctx.textBaseline = 'middle'
  ctx.fillText('Lanterna', PAD + 104, 74)
  ctx.fillStyle = C.signal
  ctx.font = `600 30px ${FONT}`
  ctx.fillText(category, PAD + 106, 116)

  // The question
  let y = 180
  ctx.fillStyle = C.text
  ctx.font = `700 42px ${FONT}`
  ctx.textBaseline = 'top'
  const prompt = root.querySelector('.question-text')?.textContent ?? ''
  for (const line of wrap(ctx, prompt, W - 2 * PAD, 5)) {
    ctx.fillText(line, PAD, y)
    y += 54
  }
  y += 16

  // The picture(s)
  const options = [...root.querySelectorAll<HTMLElement>('.options .option')]
  const pictureOptions = options.some((o) => o.querySelector('svg'))
  // Only the first picture: a second one is the answer picture shown after answering
  // (also when it has taken the place of the question picture, in .swap-to)
  const mediaSvgs = [...(root.querySelector('.question-media')?.querySelectorAll<SVGSVGElement>('svg') ?? [])]
    .filter((svg) => !svg.closest('.swap-to'))
    .slice(0, 4)
  const media = await Promise.all(mediaSvgs.map(svgImage))
  const footerTop = H - 120
  const optionBlock = pictureOptions ? 420 : options.length * 92
  const mediaH = Math.max(0, Math.min(560, footerTop - y - optionBlock - 30))
  if (media.length && mediaH > 80) y += drawRow(ctx, media, PAD, y, W - 2 * PAD, mediaH) + 30
  // A list in the question instead of a picture (the parts of a MAYDAY message to put in order)
  const listItems = media.length ? [] : [...(root.querySelector('.question-media, .order-parts')?.querySelectorAll('li') ?? [])]
  for (const li of listItems) {
    if (y > footerTop - optionBlock - 60) break
    ctx.fillStyle = C.card
    roundRect(ctx, PAD, y, W - 2 * PAD, 58, 14)
    ctx.fill()
    const strong = li.querySelector('strong')?.textContent ?? ''
    ctx.fillStyle = C.signal
    ctx.font = `800 30px ${FONT}`
    ctx.fillText(strong, PAD + 22, y + 13)
    ctx.fillStyle = C.text
    ctx.font = `500 30px ${FONT}`
    ctx.fillText((li.textContent ?? '').slice(strong.length).trim(), PAD + 64, y + 13)
    y += 70
  }
  if (listItems.length) y += 14

  // The options, lettered A, B, C, D – the answer is not shown
  const letters = 'ABCDEF'
  if (pictureOptions) {
    const cols = 2
    const cw = (W - 2 * PAD - 24) / cols
    const ch = Math.min(200, (footerTop - y - 24) / Math.ceil(options.length / cols) - 24)
    for (let i = 0; i < options.length; i++) {
      const x = PAD + (i % cols) * (cw + 24)
      const top = y + Math.floor(i / cols) * (ch + 24)
      ctx.fillStyle = C.card
      roundRect(ctx, x, top, cw, ch, 18)
      ctx.fill()
      const svg = options[i].querySelector('svg')
      if (svg) drawRow(ctx, [await svgImage(svg)], x + 56, top + 10, cw - 70, ch - 20)
      ctx.fillStyle = C.signal
      ctx.font = `800 34px ${FONT}`
      ctx.fillText(letters[i], x + 18, top + 16)
    }
  } else {
    for (let i = 0; i < options.length; i++) {
      ctx.font = `600 32px ${FONT}`
      const lines = wrap(ctx, options[i].textContent ?? '', W - 2 * PAD - 100, 2)
      const h = 30 + lines.length * 38
      if (y + h > footerTop - 10) break
      ctx.fillStyle = C.card
      roundRect(ctx, PAD, y, W - 2 * PAD, h, 18)
      ctx.fill()
      ctx.fillStyle = C.signal
      ctx.font = `800 32px ${FONT}`
      ctx.fillText(letters[i], PAD + 26, y + 16)
      ctx.fillStyle = C.text
      ctx.font = `600 32px ${FONT}`
      lines.forEach((l, j) => ctx.fillText(l, PAD + 80, y + 16 + j * 38))
      y += h + 14
    }
  }

  // Footer
  ctx.fillStyle = C.muted
  ctx.font = `600 30px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText('What would you answer?', W / 2, H - 104)
  ctx.fillStyle = C.signal
  ctx.font = `700 32px ${FONT}`
  ctx.fillText('Practise in Lanterna · app.lanternakonsult.se', W / 2, H - 62)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No image'))), 'image/png'))
}

/** Share sheet on a phone, download elsewhere. Returns how it went. */
export async function shareQuestion(root: HTMLElement, category: string): Promise<'shared' | 'saved' | 'cancelled' | 'failed'> {
  try {
    const blob = await questionImage(root, category)
    const file = new File([blob], 'lanterna-question.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: 'What would you answer? Practise in Lanterna – app.lanternakonsult.se' })
        return 'shared'
      } catch (e) {
        if ((e as Error).name === 'AbortError') return 'cancelled'
      }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lanterna-question.png'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 5000)
    return 'saved'
  } catch {
    return 'failed'
  }
}
