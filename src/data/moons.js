const moons = [
  {
    name: "Moon",
    parentPlanetName: "Earth",
    size: 0.3,
    distance: 2.5,
    speed: 0.04,
    color: 0xffffff,
    diameter: "3,474 km",
    orbitalPeriod: "27.3 days",
    description: "The Moon, Earth's sole natural satellite, is heavily cratered and marked by dark volcanic maria. Its gravity influences ocean tides, stabilizes Earth's axial tilt, and has inspired countless myths and legends. Neil Armstrong famously became the first human to set foot on the Moon in 1969."
  },
  {
    name: "Phobos",
    parentPlanetName: "Mars",
    size: 0.2,
    distance: 1.3,
    speed: 0.05,
    color: 0xffffff,
    diameter: "22.2 km",
    orbitalPeriod: "7.7 hours",
    description: "Phobos, Mars's largest moon, is irregularly shaped and orbits incredibly close to Mars, rising and setting multiple times each Martian day. Scientists predict that Phobos will eventually either crash into Mars or break apart, forming a ring around the planet in the distant future."
  },
  {
    name: "Deimos",
    parentPlanetName: "Mars",
    size: 0.15,
    distance: 2.0,
    speed: 0.04,
    color: 0xffffff,
    diameter: "12.4 km",
    orbitalPeriod: "30.3 hours",
    description: "Deimos is Mars's smaller, outer moon. It is irregularly shaped, heavily cratered, and likely captured from the asteroid belt. Its surface is smoother than Phobos due to a thick layer of fine dust and debris."
  },
  {
    name: "Io",
    parentPlanetName: "Jupiter",
    size: 0.4,
    distance: 4,
    speed: 0.018,
    color: 0xffffff,
    diameter: "3,643 km",
    orbitalPeriod: "1.8 days",
    description: "Io, Jupiter's closest large moon, is the most volcanically active body in the Solar System, constantly reshaped by hundreds of active volcanoes spewing sulfur compounds. Its vibrant surface of reds, yellows, and whites resembles a pizza, caused by volcanic sulfur deposits."
  },
  {
    name: "Europa",
    parentPlanetName: "Jupiter",
    size: 0.35,
    distance: 5,
    speed: 0.014,
    color: 0xffffff,
    diameter: "3,122 km",
    orbitalPeriod: "3.6 days",
    description: "Europa is an icy world, believed to harbor a vast subsurface ocean beneath its frozen crust, making it one of the most promising places to search for extraterrestrial life. Its smooth, cracked surface indicates geological activity beneath."
  },
  {
    name: "Ganymede",
    parentPlanetName: "Jupiter",
    size: 0.45,
    distance: 6,
    speed: 0.011,
    color: 0xffffff,
    diameter: "5,268 km",
    orbitalPeriod: "7.2 days",
    description: "Ganymede is the largest moon in the Solar System—larger than Mercury. Unique among moons, it has its own magnetic field and is believed to contain a subsurface saltwater ocean beneath its thick icy crust."
  },
  {
    name: "Callisto",
    parentPlanetName: "Jupiter",
    size: 0.40,
    distance: 7,
    speed: 0.009,
    color: 0xffffff,
    diameter: "4,821 km",
    orbitalPeriod: "16.7 days",
    description: "Callisto is Jupiter's outermost Galilean moon, heavily cratered and geologically inactive, making it a fascinating historical record of the early Solar System. Its icy, ancient surface reflects billions of years of impacts."
  },
  {
    name: "Titan",
    parentPlanetName: "Saturn",
    size: 0.3,
    distance: 4,
    speed: 0.02,
    color: 0xffffff,
    diameter: "5,150 km",
    orbitalPeriod: "15.9 days",
    description: "Titan, Saturn's largest moon, is the only moon known to have a thick atmosphere and stable liquid on its surface—rivers and lakes of liquid methane. Its complex chemistry and atmospheric composition intrigue scientists searching for prebiotic conditions."
  },
  {
    name: "Rhea",
    parentPlanetName: "Saturn",
    size: 0.25,
    distance: 5.5,
    speed: 0.017,
    color: 0xffffff,
    diameter: "1,528 km",
    orbitalPeriod: "4.5 days",
    description: "Rhea is Saturn's second-largest moon, characterized by its heavily cratered, icy surface. It has a thin atmosphere of oxygen and carbon dioxide, and may have a partial ring system, which would make it unique among moons."
  },
  {
    name: "Titania",
    parentPlanetName: "Uranus",
    size: 0.25,
    distance: 3.5,
    speed: 0.03,
    color: 0xffffff,
    diameter: "1,578 km",
    orbitalPeriod: "8.7 days",
    description: "Titania is the largest moon of Uranus, featuring a complex surface with numerous impact craters, extensive canyon systems, and signs of geological activity. Its surface shows evidence of past tectonic forces and possible internal heating."
  },
  {
    name: "Oberon",
    parentPlanetName: "Uranus",
    size: 0.25,
    distance: 4.5,
    speed: 0.025,
    color: 0xffffff,
    diameter: "1,523 km",
    orbitalPeriod: "13.5 days",
    description: "Oberon, Uranus's second-largest moon, has one of the darkest surfaces in the Solar System. Its terrain is marked by ancient impact craters and mysterious dark patches, which may be exposed material from its interior."
  },
  {
    name: "Triton",
    parentPlanetName: "Neptune",
    size: 0.3,
    distance: 3.5,
    speed: 0.028,
    color: 0xffffff,
    diameter: "2,707 km",
    orbitalPeriod: "5.9 days",
    description: "Triton orbits Neptune in the opposite direction of the planet's rotation, suggesting it was captured rather than formed in place. It has active geysers of nitrogen gas and dust, making it one of only four known geologically active moons in our Solar System."
  }
];

export default moons;
