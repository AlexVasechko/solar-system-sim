const planets = [
  {
    name: "Mercury",
    size: 0.5,
    distance: 3,
    speed: 0.015,
    color: 0xdddddd,
    eccentricity: 0.2056,
    tilt: 0.034,
    diameter: "4,879 km",
    orbitalPeriod: "88 Earth days",
    temperature: "−173°C to 427°C",
    description: "Mercury, the closest planet to the Sun, is a small, rocky world resembling our Moon. Its surface is covered with impact craters from countless meteorite collisions. Due to its proximity to the Sun, Mercury experiences extreme temperature variations. Interestingly, Mercury has virtually no atmosphere, so its sky remains pitch-black even during daytime."
  },
  {
    name: "Venus",
    size: 0.9,
    distance: 6,
    speed: 0.010,
    color: 0xffee55,
    eccentricity: 0.0067,
    tilt: 177.4,
    diameter: "12,104 km",
    orbitalPeriod: "225 Earth days",
    temperature: "Average 464°C",
    description: "Venus, named after the Roman goddess of love and beauty, is sometimes called Earth's sister planet due to its similar size and mass. Its surface, however, is a scorching desert landscape dominated by volcanic plains and clouds of sulfuric acid. Venus has the thickest atmosphere of all terrestrial planets, creating an intense greenhouse effect that makes it hotter than Mercury."
  },
  {
    name: "Earth",
    size: 1.0,
    distance: 8,
    speed: 0.008,
    color: 0x0088ff,
    eccentricity: 0.0167,
    tilt: 23.4,
    diameter: "12,756 km",
    orbitalPeriod: "365.25 days",
    temperature: "Average 15°C",
    description: "Earth, our home planet, is uniquely covered by vast oceans and vibrant continents teeming with life. Its protective atmosphere and magnetic field shield it from harmful solar radiation. Earth is the only planet known to sustain life, thanks to its abundant liquid water, moderate temperatures, and breathable atmosphere."
  },
  {
    name: "Mars",
    size: 0.8,
    distance: 12,
    speed: 0.006,
    color: 0xff2200,
    eccentricity: 0.0934,
    tilt: 25.2,
    diameter: "6,792 km",
    orbitalPeriod: "687 Earth days",
    temperature: "−125°C to 20°C",
    description: "Mars, known as the \"Red Planet,\" gets its color from iron oxide (rust) in its soil. Its landscape features huge volcanoes, deep canyons, and polar ice caps composed of frozen water and carbon dioxide. Mars is actively explored by robotic spacecraft in search of past or present signs of life, and is a prime candidate for future human colonization."
  },
  {
    name: "Jupiter",
    size: 3.0,
    distance: 18,
    speed: 0.004,
    color: 0xffaa00,
    eccentricity: 0.0489,
    tilt: 3.1,
    diameter: "142,984 km",
    orbitalPeriod: "11.86 Earth years",
    temperature: "Average −110°C",
    description: "Jupiter is the largest planet in our Solar System—a gas giant famous for its colorful bands, swirling storms, and the Great Red Spot, a gigantic storm larger than Earth that has persisted for centuries. Jupiter's powerful magnetic field generates spectacular auroras and shelters dozens of moons, including four large moons discovered by Galileo in 1610."
  },
  {
    name: "Saturn",
    size: 2.5,
    distance: 24,
    speed: 0.0032,
    color: 0xffee00,
    eccentricity: 0.0565,
    tilt: 26.7,
    diameter: "120,536 km",
    orbitalPeriod: "29.46 Earth years",
    temperature: "Average −140°C",
    description: "Saturn, known for its stunning ring system, is a gas giant composed mainly of hydrogen and helium. Its rings consist of billions of icy particles ranging from dust grains to boulders. Saturn also hosts numerous moons, including Titan, a moon larger than Mercury with a dense atmosphere and surface lakes of liquid methane."
  },
  {
    name: "Uranus",
    size: 2.0,
    distance: 30,
    speed: 0.0025,
    color: 0x00ffff,
    eccentricity: 0.0472,
    tilt: 97.8,
    diameter: "51,118 km",
    orbitalPeriod: "84.01 Earth years",
    temperature: "Average −195°C",
    description: "Uranus is a unique ice giant with a distinct blue-green hue from methane gas in its atmosphere. It rotates on its side, causing extreme seasonal shifts. Discovered by William Herschel in 1781, Uranus has faint rings and dozens of moons named after characters from Shakespearean plays and the works of Alexander Pope."
  },
  {
    name: "Neptune",
    size: 1.8,
    distance: 36,
    speed: 0.002,
    color: 0x0044ff,
    eccentricity: 0.0086,
    tilt: 28.3,
    diameter: "49,528 km",
    orbitalPeriod: "164.79 Earth years",
    temperature: "Average −200°C",
    description: "Neptune, the farthest known planet from the Sun, is an ice giant known for its striking deep-blue color and supersonic winds reaching speeds over 2,000 km/h—the fastest in our Solar System. Discovered mathematically in 1846 due to its gravitational effects on Uranus, Neptune hosts Triton, one of the Solar System's most unusual moons."
  }
];

export default planets;
