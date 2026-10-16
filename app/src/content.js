// ---------------------------------------------------------------------------
// All example content lives here. The user can edit every story in the UI;
// edits are stored in localStorage and merged over these defaults at load.
// ---------------------------------------------------------------------------

export const PROFILE = {
  name: "Harsh's Little Room",
  tagline: 'an example room — every story is yours to rewrite',
};

export const BOOKS = [
  {
    id: 'book-moomin',
    title: 'The Summer Book',
    author: 'Tove Jansson',
    color: '#7d9b76',
    story:
      'Borrowed from a secondhand shop on a rainy Tuesday and never quite returned in my heart.\n\nIt sits on the top shelf because that is where quiet books belong. Six islands, one grandmother, and the idea that summers are not measured in days but in small adventures.',
  },
  {
    id: 'book-murakami',
    title: 'Kafka on the Shore',
    author: 'Haruki Murakami',
    color: '#4f6d8f',
    story:
      'The book that taught me to read with a pencil. Fish fall from the sky, cats talk, and still the strangest thing in it is an ordinary boy deciding to become someone new.\n\nFinished it on an overnight bus. The sunrise through the window matched the cover almost exactly.',
  },
  {
    id: 'book-astro',
    title: 'Astrophysics for People in a Hurry',
    author: 'Neil deGrasse Tyson',
    color: '#b4552d',
    story:
      'Bought at an airport, which feels appropriate — a small book about very large things for a person suspended between places.\n\nIt is the book I lend most. Half of them come back; the other half are presumably still orbiting someone\'s shelf.',
  },
  {
    id: 'book-littleprince',
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    color: '#d9a441',
    story:
      'Three copies. One in English, one gifted in French, one battered travel edition that has been to eleven countries.\n\nThe travel copy has a boarding pass from 2019 still marking chapter twenty-one. I keep meaning to remove it. I keep not removing it.',
  },
  {
    id: 'book-sea',
    title: 'The Old Man and the Sea',
    author: 'Ernest Hemingway',
    color: '#5e8a8a',
    story:
      'A one-sitting book about a three-day fight. My grandfather gave it to me with the advice: "Short books respect your time. Long fights respect your effort."\n\nThe shelf it sits on wobbles slightly. So does the story, and so does everything worth keeping.',
  },
  {
    id: 'book-wild',
    title: 'Braiding Sweetgrass',
    author: 'Robin Wall Kimmerer',
    color: '#8a5f7e',
    story:
      'Read one essay each Sunday morning with coffee. It has slowed me down more than any meditation app.\n\nThe margins are full of notes in three colors of ink, which tells you how many times I have changed my mind about what matters.',
  },
];

export const RECORDS = [
  {
    id: 'record-kindofblue',
    title: 'Kind of Blue',
    artist: 'Miles Davis',
    color: '#3c5a80',
    note:
      'The record that lives on the turntable. Bought from a basement shop where the owner tested it on his own machine before selling — five full minutes of scrutiny for a five-dollar record.\n\n"So Blue" sounds best after midnight, which is to say it sounds best all the time.',
  },
  {
    id: 'record-rumours',
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    color: '#c98b3f',
    note:
      'The sleeve has a coffee ring exactly the size of my favorite mug. This is not an accident and I will not be taking questions.\n\nSide two is for cooking. Something about "Gold Dust Woman" improves pasta sauce measurably.',
  },
  {
    id: 'record-bossa',
    title: 'Getz/Gilberto',
    artist: 'Stan Getz & João Gilberto',
    color: '#7d9b76',
    note:
      'Sunday morning music. The neighbors have never complained, which either means the walls are thick or their Sundays needed this too.',
  },
];

export const POSTCARDS = [
  {
    id: 'card-kyoto',
    place: 'Kyoto, Japan',
    date: 'April 2019',
    tint: '#c98b8b',
    story:
      'The cherry blossoms were three days from peak and the whole city behaved like it was holding its breath.\n\nI wrote this card from a teahouse that seated nine people. The owner drew a tiny map on the back showing where the best quiet garden was. It was his own garden. It was excellent.',
  },
  {
    id: 'card-lisbon',
    place: 'Lisbon, Portugal',
    date: 'October 2021',
    tint: '#d9a441',
    story:
      'A city built on hills is a city that makes you earn every view. Tram 28, a custard tart eaten standing up, and tiles — thousands of tiles, no two corners alike.\n\nThe light in Lisbon at 6pm does something no filter has ever reproduced.',
  },
  {
    id: 'card-reykjavik',
    place: 'Reykjavík, Iceland',
    date: 'February 2022',
    tint: '#7fa3b8',
    story:
      'Four hours of daylight and every one of them felt borrowed. The aurora showed up on the last night, as if the country was saying "alright, since you came all this way."\n\nThe hot dog stand near the harbor: worth the flight by itself.',
  },
  {
    id: 'card-jaipur',
    place: 'Jaipur, India',
    date: 'November 2022',
    tint: '#c97a5a',
    story:
      'The Pink City at golden hour is not pink and not quite golden — it is the color of the minute before a photograph is taken.\n\nBought this card in a bazaar while a man repaired a watch with tools smaller than rice grains. Some places you visit; some places you attend.',
  },
  {
    id: 'card-hanoi',
    place: 'Hanoi, Vietnam',
    date: 'March 2023',
    tint: '#7d9b76',
    story:
      'The Old Quarter at 6am: soup steam, bicycle bells, and a thousand tiny plastic stools arranged like a city built for people exactly one coffee tall.\n\nTrain Street was still open then. We drank egg coffee three meters from the tracks and nobody checked their phone once.',
  },
  {
    id: 'card-cusco',
    place: 'Cusco, Peru',
    date: 'August 2023',
    tint: '#8a5f7e',
    story:
      'Altitude sickness and awe arrive together at 3,400 meters. Day one: I could barely climb stairs. Day three: I understood why people build cities in impossible places.\n\nCoca tea tastes like the mountainside smells. This card smells faintly of both.',
  },
  {
    id: 'card-santorini',
    place: 'Santorini, Greece',
    date: 'June 2024',
    tint: '#5e8a8a',
    story:
      'Everyone photographs the blue domes. What nobody photographs is the donkey traffic jam at 9am, or the old man who has painted his door a slightly different blue every year since 1987.\n\n"For variety," he said. The whole island is his sketchbook.',
  },
  {
    id: 'card-cape',
    place: 'Cape Town, South Africa',
    date: 'January 2025',
    tint: '#b4552d',
    story:
      'A mountain with its own weather system watching over a city that has everything: penguins, vineyards, and streets that end in ocean.\n\nHiked up before dawn with a headlamp and a thermos. At the top, Table Mountain shrugged off its tablecloth of cloud exactly on schedule, like it had read the tour guide.',
  },
];

export const ALL_ITEMS = [
  ...BOOKS.map((b) => ({ ...b, kind: 'book' })),
  ...RECORDS.map((r) => ({ ...r, kind: 'record' })),
  ...POSTCARDS.map((p) => ({ ...p, kind: 'postcard' })),
];
