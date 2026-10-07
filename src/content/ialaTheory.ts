// The 20 IALA theory questions Robin reviewed (Google Doc "IALA sample questions").
// The first option is the correct one; the app shuffles them.

export interface TheoryQuestion {
  id: string
  q: string
  options: string[]
  why: string
  source: string
}

export const IALA_THEORY: TheoryQuestion[] = [
  {
    id: 'Q1',
    q: "Region A. You are entering harbour from seaward and see a red, can-shaped buoy ahead. How do you pass it?",
    options: ["Keep it on your port side", "Keep it on your starboard side", "Pass on either side", "Keep well clear, it marks a wreck"],
    why: "In Region A, port-hand marks are red and can-shaped. When following the direction of buoyage, keep them on your port side.",
    source: "IALA MBS (R1001), lateral marks, Region A",
  },
  {
    id: 'Q2',
    q: "Region B. You are entering harbour from seaward. What colour are the starboard-hand marks?",
    options: ["Red", "Green", "Yellow", "Black and red"],
    why: "Region B reverses the lateral colours: starboard-hand marks are red and port-hand marks are green (\"red right returning\"). Region B covers the Americas, Japan, the Republic of Korea and the Philippines.",
    source: "IALA MBS (R1001), lateral marks and buoyage regions",
  },
  {
    id: 'Q3',
    q: "What is the topmark of a port-hand lateral mark in Region A?",
    options: ["A single red can (cylinder)", "A single red sphere", "A single green cone, point up", "Two black spheres"],
    why: "Port-hand marks carry a single red cylinder (can). Starboard-hand marks in Region A carry a single green cone, point up.",
    source: "IALA MBS (R1001), lateral marks",
  },
  {
    id: 'Q4',
    q: "Region A. You see a green, conical buoy with one broad red horizontal band and a green cone topmark. What does it mark?",
    options: ["Preferred channel to port", "Preferred channel to starboard", "A wreck", "The start of a traffic separation scheme"],
    why: "This is a modified starboard-hand mark. It shows where a channel divides and that the preferred (main) channel is to port. Keep it on your starboard side to follow the preferred channel.",
    source: "IALA MBS (R1001), preferred channel marks",
  },
  {
    id: 'Q5',
    q: "Which light rhythm is used on preferred channel marks?",
    options: ["Composite group flashing Fl(2+1)", "Fl(2)", "Q(6)+LFl", "Iso 4s"],
    why: "Fl(2+1) is reserved for modified lateral (preferred channel) marks. Normal lateral marks may use any rhythm except this one.",
    source: "IALA MBS (R1001), preferred channel marks",
  },
  {
    id: 'Q6',
    q: "You see a buoy with a topmark of two black cones, both points up. On which side of the buoy is the safe water?",
    options: ["North", "South", "East", "West"],
    why: "Two cones pointing up is a north cardinal mark. The safe water is to the north, so pass north of it.",
    source: "IALA MBS (R1001), cardinal marks",
  },
  {
    id: 'Q7',
    q: "At night you see a white light showing VQ(3) 5s. What is it?",
    options: ["East cardinal mark", "West cardinal mark", "Isolated danger mark", "Safe water mark"],
    why: "East cardinal marks show three very quick (or quick) flashes: VQ(3) 5s or Q(3) 10s.",
    source: "IALA MBS (R1001), cardinal marks",
  },
  {
    id: 'Q8',
    q: "A south cardinal mark shows Q(6)+LFl 15s. Why is the long flash added after the six short flashes?",
    options: ["So the group of six cannot be mistaken for a group of three or nine", "To show that the mark is lit by solar power", "To mark that it is a new danger", "To identify Region B"],
    why: "Short flashes are easy to miscount. The long flash (at least 2 seconds) marks the end of the group, so a south mark is not taken for an east or west mark.",
    source: "IALA MBS (R1001), cardinal marks",
  },
  {
    id: 'Q9',
    q: "What does a west cardinal mark look like?",
    options: ["Yellow with one broad black horizontal band", "Black with one broad yellow horizontal band", "Black above yellow", "Yellow above black"],
    why: "West: yellow with a black band. East: black with a yellow band. North: black above yellow. South: yellow above black. The black parts point to where the cones point.",
    source: "IALA MBS (R1001), cardinal marks",
  },
  {
    id: 'Q10',
    q: "Which memory aid matches the flash counts of the cardinal marks?",
    options: ["A clock face: East 3, South 6, West 9", "Compass points: East 1, South 2, West 3", "Morse letters: E, S, W", "There is no pattern"],
    why: "East shows 3 flashes, South 6 and West 9, like the hours on a clock face. North flashes continuously.",
    source: "IALA MBS (R1001), cardinal marks",
  },
  {
    id: 'Q11',
    q: "What topmark does an isolated danger mark carry?",
    options: ["Two black spheres, one above the other", "A single red sphere", "A yellow X", "Two black cones, base to base"],
    why: "Isolated danger marks carry two black spheres. They are black with one or more broad red horizontal bands.",
    source: "IALA MBS (R1001), isolated danger marks",
  },
  {
    id: 'Q12',
    q: "What light does an isolated danger mark show?",
    options: ["White, Fl(2)", "Red, Fl(2)", "White, Iso", "Yellow, Fl"],
    why: "Group flashing two, white. Think of the two black spheres on top.",
    source: "IALA MBS (R1001), isolated danger marks",
  },
  {
    id: 'Q13',
    q: "What does an isolated danger mark tell you?",
    options: ["A danger of limited extent with navigable water all around it", "Navigable water all around, for example at a landfall", "The edge of a dredged channel", "A special area, such as a spoil ground"],
    why: "It is placed on or above a danger of limited size that has navigable water all around. Do not pass close to it.",
    source: "IALA MBS (R1001), isolated danger marks",
  },
  {
    id: 'Q14',
    q: "You see a buoy with red and white vertical stripes and a single red sphere topmark. What does it mean?",
    options: ["Safe water, with navigable water all around", "Isolated danger", "Preferred channel", "Emergency wreck"],
    why: "This is a safe water mark, used for example as a landfall or mid-channel mark.",
    source: "IALA MBS (R1001), safe water marks",
  },
  {
    id: 'Q15',
    q: "Which of these lights can NOT be used on a safe water mark?",
    options: ["Q(9) 15s", "Iso", "Oc", "Morse \"A\""],
    why: "Safe water marks show a white light that is isophase, occulting, one long flash every 10 seconds or Morse \"A\". Q(9) is a west cardinal mark.",
    source: "IALA MBS (R1001), safe water marks",
  },
  {
    id: 'Q16',
    q: "You see a yellow buoy with a yellow X-shaped topmark. What is it?",
    options: ["A special mark", "A new danger", "A west cardinal mark", "A safe water mark"],
    why: "Special marks are yellow with a yellow X topmark and, if lit, a yellow light. They mark special areas or features, such as a cable, spoil ground or data buoy.",
    source: "IALA MBS (R1001), special marks",
  },
  {
    id: 'Q17',
    q: "What does the Emergency Wreck Marking Buoy look like?",
    options: ["Blue and yellow vertical stripes, a yellow upright cross topmark, and alternating blue and yellow flashes", "Red and white vertical stripes with a red sphere", "Yellow with a yellow X and a yellow light", "Black with red bands and two black spheres"],
    why: "The Emergency Wreck Marking Buoy is used to mark a new wreck quickly. Its light alternates blue and yellow flashes.",
    source: "IALA MBS (R1001), new dangers and the Emergency Wreck Marking Buoy",
  },
  {
    id: 'Q18',
    q: "A new danger is marked with a racon. Which Morse letter does the racon show on your radar?",
    options: ["D", "A", "U", "K"],
    why: "A new danger mark may carry a racon coded Morse \"D\" (\u2013 \u00b7 \u00b7), showing about 1 nautical mile long on the radar display.",
    source: "IALA MBS (R1001), new dangers",
  },
  {
    id: 'Q19',
    q: "When there is no harbour to approach, for example along a coast, how is the general direction of buoyage decided?",
    options: ["By the buoyage authorities, in general clockwise around continental land masses", "Always from north to south", "Always with the flood stream", "The navigator chooses"],
    why: "The general direction is set by the authorities, usually clockwise around land masses. It is shown on charts and in publications.",
    source: "IALA MBS (R1001), direction of buoyage",
  },
  {
    id: 'Q20',
    q: "Region A. At night you see a red light showing Fl(2) R. What is it most likely to be?",
    options: ["A port-hand lateral mark", "An isolated danger mark", "A south cardinal mark", "A special mark"],
    why: "In Region A, red lights are used only on port-hand marks: the normal port-hand mark, and the modified port-hand mark (preferred channel to starboard), which shows Fl(2+1) R. The isolated danger mark also shows Fl(2), but in white.",
    source: "IALA MBS (R1001), lateral marks",
  },
]
