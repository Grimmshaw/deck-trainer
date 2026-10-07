// Word lists used for practice. Add words freely – they are filtered
// automatically so each level only gets words made of its own characters.

// Maritime / seafaring vocabulary
const MARITIME = `
 sea seas ship ships boat boats mast masts stern bow bows hull deck decks keel helm
 anchor anchors port ports berth quay pier dock docks moor moored rope ropes line lines
 winch rudder engine engines fuel oil gale gales storm wind winds wave waves swell fog
 mist tide tides tidal wake crew mate mates master bridge radar chart charts knot knots
 sail sails sailor sailors ferry cargo tanker pilot pilots harbor harbour coast coastal
 shore bay cape strait channel fairway lane lanes watch officer cadet cadets captain
 bosun galley cabin cabins hatch hatches hold ballast draft draught tonnage vessel
 vessels yacht dinghy canoe raft lifeboat liferaft rescue distress urgent alert
 message radio aerial antenna beacon light lights signal signals flag flags mayday
 safety route course bearing heading depth sound shoal reef rock rocks island isle
 north south east west aft abaft astern ahead abeam alee leeway weather trim list heel
 roll pitch yaw speed log navy convoy steam steamer motor anchorage seaman seamen
 seamanship marine maritime ocean oceans tug tugs barge tow towing tower buoy buoys
 mark marks starboard portside steer steering stop slow full half dead reckoning
 position latitude longitude meridian noon sextant compass gyro magnet magnetic
 azimuth horizon star stars moon sun sunset sunrise dawn dusk night day station
 stations notice mariner mariners passage voyage journey crossing transit sailing
 inbound outbound arrival depart leave stand standby over out roger copy affirm
 negative correct wilco repeat say again spell figures ice icing gust gusts squall
 swells breaker breakers surf spray brine salt salty water waters deep shallow tidewater
 ebb flood neap spring current currents drift drifting adrift aground grounding collision
 fire flooding sinking capsize abandon muster boat drill drills alarm alarms siren
 horn whistle bell gong flare flares smoke rocket hand pump pumps bilge hold holds
 tank tanks hose valve valves shaft screw propeller bow thruster stem transom freeboard
 beam length gross net tonnes ton tons load loading discharge cargoes container
 containers reefer bulk bulker tanker trailer trailers cars passengers
 passenger gangway ramp lashing lashings chain chains cable cables shackle hawser
 bollard cleat fender fenders mooring moorings warp warps spring springs breast head
 tail anchor chain windlass capstan derrick crane cranes boom booms davit davits
 lookout watchman helmsman engineer oiler wiper messman steward cook chief second third
 deckhand rating ratings crewman pilotage tugboat icebreaker trawler fisher fishing
 nets trawl seiner coaster freighter liner cruise cruiser frigate destroyer patrol
 coastguard lifeguard ashore aboard onboard offshore inshore seaward landward leeward
 windward upwind downwind headwind tailwind beaufort knotting splice splices bowline
 hitch hitches sheet sheets halyard halyards jib mainsail spinnaker tack tacking gybe
 jibe reach running beating close haul hauled mooring seaway sound sounds isles
 manoeuvre maneuver attain stem stems mast mains mainmast foremast mizzen
`

// Common English words
const COMMON = `
 a an as at am in is it me no on so to of or by be do go he if up us we my
 and the are not one two six ten man men son sun see sea eat ate tea toe toes tie ties
 net nets set sets sat sit tin tins ton tons not note notes nose noses mine mines
 mint mints tame team teams time times tame same seem seen seat seats stem stems
 meat meats mate mates name names main mean means meant moan moans moon moons mood
 noon soon stone stones state states taste tastes toast toasts most mist mists east
 nest nests sent tent tents test tests tint ties mast masts seam seams moist
 inmate inmates mansion mansions motion motions nation nations station stations
 stamina tomato tomatoes animate animates nominate maintain instant instants
 estate estates meanest seasons season onion onions saint saints satin stain stains
 attest attests assent intense omit omits emit emits item items mitten mittens
 otter otters attempt attempts statement statements tension tensions mention mentions
 insane insist insists inmost moment moments minimal anatomist matinee matinees
 seaman seamen aims aim ion ions ant ants oat oats oath tonne tonnes stamen
 tease teases nose amen omen omens tome tomes atom atoms monies maestro
 stamens toast inset insets onset onsets tannin assist assists mission missions
 emission session sessions tomatoes intimate intimates nominees 
 ten tens tea teas tan tans tat mass moss mosses toss tosses miss misses mess
 messes oasis amiss amount amounts

 about after again all also always another any around ask away back bad bag ball
 bank base bear beat bed been before begin being best better big bird black blue
 body book both box boy bread break bring brown build busy buy call came can car card
 care carry case cat catch change check child city clean clear climb clock close cold
 come cook cool corner could count country cover cross cup cut dark date daughter
 dear desk dinner dog door down draw dream dress drink drive drop dry during each
 early earth easy edge egg eight end enough even evening ever every eye face fact
 fall family far farm fast father feel few field fight fill find fine finger finish
 first fish five floor fly follow food foot form four free fresh friend from front
 fruit full fun game garden gate gave girl give glad glass gold good got grass great
 green ground group grow guess hair hand happy hard have hear heart heavy help her
 here high hill him his hit home hope horse hot hour house how hundred idea inside
 jump just keep key kind king know lady lake land large last late laugh learn left
 less letter lift like little live long look lose lot loud love low made make many
 map march market may might mile milk mind minute miss money month more morning
 mother mouth move much music must near neck need never new news next nice nine
 nothing now number often old once only open other our own page paper park part
 party past pay people pick picture piece place plan plant play please point poor
 power pretty pull push put queen question quick quiet quite rain read ready real
 red remember rest rich ride right ring river road room round run safe said sand
 save school second seven shall short should show side simple sing sister size skin
 sky sleep small smile snow some song sorry speak spend stand start stay step still
 stop story street strong study such sugar summer sure table take talk tall teach
 tell thank that their them then there these they thing think this those three
 through today together told tomorrow took top touch town train tree true try turn
 under until upon very visit voice wait walk wall want warm wash way wear week well
 went were what when where which while white who whole why wide wife will window
 winter wish with without woman wonder wood word work world would write wrong yard
 year yellow yes yesterday yet you young your zero zone zoo quiz jazz jacket jolly
 joke judge juice jungle jury just kayak kettle kitchen knee knife lazy oxygen
 quay quota quote equip squad squid squeeze vex wax box fox fix mix six taxi exit
 exam extra index excess
`

// Words and groups that contain digits – used on level 3
const WITH_DIGITS = `
 ch16 ch13 ch70 ch06 ch67 ch12 ch14 vhf16 vhf70 2182 406 121 156 8414
 solas74 colreg72 marpol73 stcw78 stcw95 imo1 dsc70 mmsi 24h 12nm 200nm 3nm 6nm
 10kn 12kn 15kn 20kn 360 180 090 270 045 135 225 315 1972 1974 1978 1995 2010
 1200 0800 1600 2000 0400 0000 b1 b2 a1 a2 a3 a4 c1 c2 f1 n2 s1 w3 e5 t4
 no1 no2 berth2 berth7 pier4 dock9 deck3 deck4 deck7 se12 lr2 mr1 mr2
`

function toList(raw: string): string[] {
 const words = raw
 .split(/\s+/)
 .map((w) => w.trim().toUpperCase())
 .filter((w) => /^[A-Z0-9]+$/.test(w))
 return Array.from(new Set(words))
}

export const WORDS: string[] = toList(MARITIME + ' ' + COMMON)
export const DIGIT_WORDS: string[] = toList(WITH_DIGITS).filter((w) => /[0-9]/.test(w))
