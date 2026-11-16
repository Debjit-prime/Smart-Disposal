import { Category, ProductItem, SubmissionItem } from '../types/disposal';

export const CATEGORY_SUBTOPICS: Record<Category, string[]> = {
  Plastics: ['Bags', 'Bottles', 'Cups', 'Wrappers'],
  Paper: ['Plates', 'Newsprint', 'Filters', 'Cartons'],
  'Food Waste': ['Peels', 'Grounds', 'Leaves', 'Shells'],
  Textiles: ['Cotton', 'Jute', 'Wool', 'Synthetics'],
  Metals: ['Aluminum', 'Steel', 'Foils', 'Caps'],
  Glass: ['Bottles', 'Jars', 'Tableware', 'Mirrors'],
  Packaging: ['Boxes', 'Foam', 'Cups', 'Mailers'],
  Electronics: ['Batteries', 'Circuits', 'Cables', 'Casings'],
};

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'banana-peel',
    name: 'Banana peel',
    aliases: ['banana skin', 'fruit peel', 'banana'],
    category: 'Food Waste',
    subTopic: 'Peels',
    biodegradable: true,
    decompositionTime: '2 – 5 weeks',
    decompositionDays: 21,
    timelinePercent: 14,
    breaksDownInto: ['Water', 'Carbon dioxide', 'Nutrient-rich humus', 'Potassium minerals'],
    whyExplanation:
      'Banana peels are built from natural cellulose, pectin, and moisture-rich plant fibers. Soil bacteria and fungi quickly secrete cellulase enzymes that sever these organic bonds into compost.',
    alternative: {
      name: 'Home compost bin or bokashi bucket',
      reason: 'Diverts methane-producing organics from sealed landfills into fertile garden soil.',
      decompositionTime: '2 – 4 weeks',
    },
    sourceLabel: 'U.S. EPA — Composting at Home',
    sourceUrl: 'https://www.epa.gov/recycle/composting-home',
    verificationStatus: 'Verified',
  },
  {
    id: 'plastic-bag',
    name: 'Plastic bag (HDPE/LDPE)',
    aliases: ['grocery bag', 'polythene bag', 'shopping bag', 'plastic shopping bag'],
    barcode: '078742123451',
    category: 'Plastics',
    subTopic: 'Bags',
    biodegradable: false,
    decompositionTime: '10 – 20 years (fragments)',
    decompositionDays: 5475,
    timelinePercent: 72,
    breaksDownInto: ['Microplastics', 'Nanoplastics', 'Trace ethylene oligomers'],
    whyExplanation:
      'Polyethylene chains contain strong carbon-carbon bonds that soil microbes do not recognize. Sunlight UV rays slowly make the film brittle, shattering it into microplastics rather than true soil nutrients.',
    alternative: {
      name: 'Woven organic cotton tote',
      reason: 'Washable, durable across hundreds of grocery trips, and naturally compostable at end of life.',
      decompositionTime: '3 – 6 months',
    },
    sourceLabel: 'NOAA Marine Debris Program',
    sourceUrl: 'https://marinedebris.noaa.gov/discover-marine-debris',
    verificationStatus: 'Verified',
  },
  {
    id: 'paper-plate',
    name: 'Uncoated paper plate',
    aliases: ['paper plate', 'cardboard plate', 'disposable plate'],
    category: 'Paper',
    subTopic: 'Plates',
    biodegradable: true,
    decompositionTime: '2 – 4 months',
    decompositionDays: 90,
    timelinePercent: 28,
    breaksDownInto: ['Water', 'Carbon dioxide', 'Organic cellulose humus'],
    whyExplanation:
      'Pressed wood-pulp fibers break apart when exposed to rain and microbial moisture. Note that glossy plastic-coated plates will leave behind a thin polyethylene film that does not biodegrade.',
    alternative: {
      name: 'Molded sugarcane bagasse plate',
      reason: 'Made from leftover sugarcane stalk fiber; sturdy against hot liquids and fully home-compostable.',
      decompositionTime: '45 – 60 days',
    },
    sourceLabel: 'USDA BioPreferred Program',
    sourceUrl: 'https://www.biopreferred.gov',
    verificationStatus: 'Verified',
  },
  {
    id: 'styrofoam-cup',
    name: 'Styrofoam cup (EPS)',
    aliases: ['foam cup', 'polystyrene cup', 'styrofoam', 'expanded polystyrene'],
    category: 'Packaging',
    subTopic: 'Cups',
    biodegradable: false,
    decompositionTime: '500+ years (persists)',
    decompositionDays: 182500,
    timelinePercent: 98,
    breaksDownInto: ['Polystyrene micro-beads', 'Trace styrene monomers'],
    whyExplanation:
      'Expanded polystyrene is a petroleum foam locked together by aromatic benzene rings. Natural microorganisms lack the metabolic pathways to digest it, so it persists for centuries as brittle foam fragments.',
    alternative: {
      name: 'Insulated stainless steel tumbler',
      reason: 'Eliminates single-use foam completely and keeps beverages hot or cold for hours.',
      decompositionTime: 'Reusable indefinitely',
    },
    sourceLabel: 'Woods Hole Oceanographic Institution',
    sourceUrl: 'https://www.whoi.edu/know-your-ocean/ocean-topics/pollution/marine-plastics/',
    verificationStatus: 'Verified',
  },
  {
    id: 'tea-bag',
    name: 'Standard tea bag (sealed)',
    aliases: ['tea bag', 'teabag', 'pyramid tea bag'],
    category: 'Food Waste',
    subTopic: 'Leaves',
    biodegradable: false,
    decompositionTime: 'Leaves: 1 mo · Mesh: 100+ yrs',
    decompositionDays: 36500,
    timelinePercent: 86,
    breaksDownInto: ['Plant compost (leaves)', 'Polypropylene microplastics (sealant)'],
    whyExplanation:
      'While tea leaves compost rapidly, most heat-sealed paper bags and silky pyramid sachets use polypropylene or nylon fibers to stay intact in boiling water, leaving microplastic skeletons in compost.',
    alternative: {
      name: 'Loose-leaf tea in stainless infuser',
      reason: 'Zero plastic mesh, richer flavor, and the spent leaves go straight into soil or compost.',
      decompositionTime: '2 – 4 weeks',
    },
    sourceLabel: 'Environmental Science & Technology — Plastic Teabags Study',
    sourceUrl: 'https://pubs.acs.org/doi/10.1021/acs.est.9b02540',
    verificationStatus: 'Verified',
  },
  {
    id: 'jute-bag',
    name: 'Jute bag',
    aliases: ['burlap bag', 'hessian tote', 'jute tote', 'jute'],
    category: 'Textiles',
    subTopic: 'Jute',
    biodegradable: true,
    decompositionTime: '1 – 3 months',
    decompositionDays: 60,
    timelinePercent: 22,
    breaksDownInto: ['Cellulose humus', 'Lignin', 'Water', 'Carbon dioxide'],
    whyExplanation:
      'Jute is spun directly from rain-fed bast plant stems rich in cellulose and lignin. Without synthetic resin liners, soil fungi and moisture break the coarse fibers into fertile organic humus within weeks.',
    alternative: {
      name: 'Unlined heavy-weave jute tote',
      reason: 'Strong enough for heavy groceries and fully home-compostable once worn out.',
      decompositionTime: '1 – 3 months',
    },
    sourceLabel: 'FAO — Natural Fibres Sustainability',
    sourceUrl: 'https://www.fao.org/natural-fibres-2009/about/15-natural-fibres/en/',
    verificationStatus: 'Verified',
  },
  {
    id: 'plastic-bottle',
    name: 'PET plastic water bottle',
    aliases: ['water bottle', 'soda bottle', 'pet bottle', 'plastic bottle'],
    barcode: '012000001291',
    category: 'Plastics',
    subTopic: 'Bottles',
    biodegradable: false,
    decompositionTime: '450 years',
    decompositionDays: 164250,
    timelinePercent: 95,
    breaksDownInto: ['PET microplastics', 'Terephthalic acid fragments'],
    whyExplanation:
      'Polyethylene terephthalate (PET) is engineered to resist moisture, oxygen, and bacterial decay. In nature it weathers slowly under sunlight without returning nutrients to soil ecosystems.',
    alternative: {
      name: 'Refillable stainless steel bottle',
      reason: 'Replaces hundreds of disposable PET bottles per year with recyclable food-grade steel.',
      decompositionTime: 'Reusable 10+ years',
    },
    sourceLabel: 'NOAA Marine Debris — Decomposition Timeline',
    sourceUrl: 'https://marinedebris.noaa.gov',
    verificationStatus: 'Verified',
  },
  {
    id: 'snack-wrapper',
    name: 'Multi-layer chip wrapper',
    aliases: ['snack wrapper', 'foil wrapper', 'candy wrapper', 'plastic wrapper'],
    category: 'Plastics',
    subTopic: 'Wrappers',
    biodegradable: false,
    decompositionTime: '80 – 100 years',
    decompositionDays: 32850,
    timelinePercent: 84,
    breaksDownInto: ['Polypropylene fragments', 'Metallized aluminum flakes'],
    whyExplanation:
      'Chip bags laminate polypropylene plastic to an ultra-thin aluminum vapor layer. Microbes cannot digest the bonded polymers, and recycling sorters reject the mixed layers.',
    alternative: {
      name: 'Bulk snacks in reusable glass jars',
      reason: 'Eliminates unrecyclable multi-layer flexible films completely.',
      decompositionTime: 'Reusable indefinitely',
    },
    sourceLabel: 'U.S. EPA — Packaging Waste Facts',
    sourceUrl: 'https://www.epa.gov',
    verificationStatus: 'Verified',
  },
  {
    id: 'aluminum-can',
    name: 'Aluminum beverage can',
    aliases: ['soda can', 'beer can', 'aluminum can', 'tin can'],
    barcode: '049000042566',
    category: 'Metals',
    subTopic: 'Aluminum',
    biodegradable: false,
    decompositionTime: '200 – 250 years',
    decompositionDays: 80000,
    timelinePercent: 90,
    breaksDownInto: ['Aluminum oxide', 'Trace epoxy liner fragments'],
    whyExplanation:
      'Aluminum forms a protective oxide film that slows corrosion in air and soil. While it does not biodegrade organically, it is infinitely recyclable using 95% less energy than refining new ore.',
    alternative: {
      name: 'Tap water or recycled-aluminum refill',
      reason: 'Always recycle aluminum cans cleanly; recycled cans return to shelves in ~60 days.',
      decompositionTime: 'Closed-loop recyclable',
    },
    sourceLabel: 'The Aluminum Association — Sustainability',
    sourceUrl: 'https://www.aluminum.org/sustainability',
    verificationStatus: 'Verified',
  },
  {
    id: 'glass-bottle',
    name: 'Glass bottle',
    aliases: ['glass jar', 'wine bottle', 'glass bottle', 'mason jar'],
    category: 'Glass',
    subTopic: 'Bottles',
    biodegradable: false,
    decompositionTime: '1,000,000+ years',
    decompositionDays: 365000000,
    timelinePercent: 100,
    breaksDownInto: ['Inert silica sand (mechanical erosion only)'],
    whyExplanation:
      'Glass is fused silica sand that does not chemically decompose via microbes or release toxins, meaning it remains intact for millennia unless crushed or remelted in a recycling furnace.',
    alternative: {
      name: 'Reuse glass jars or recycle curbside',
      reason: 'Glass can be sterilized and reused endlessly or remelted without losing structural purity.',
      decompositionTime: '100% recyclable forever',
    },
    sourceLabel: 'Glass Packaging Institute',
    sourceUrl: 'https://www.gpi.org/glass-recycling-facts',
    verificationStatus: 'Verified',
  },
  {
    id: 'cardboard-box',
    name: 'Corrugated cardboard box',
    aliases: ['shipping box', 'cardboard', 'amazon box', 'carton'],
    barcode: '038000138416',
    category: 'Packaging',
    subTopic: 'Boxes',
    biodegradable: true,
    decompositionTime: '2 – 3 months',
    decompositionDays: 75,
    timelinePercent: 25,
    breaksDownInto: ['Cellulose humus', 'Water', 'Carbon dioxide'],
    whyExplanation:
      'Unwaxed corrugated cardboard consists of layered wood-pulp paper bound with starch glue. Once plastic packing tape is removed, soil fungi rapidly digest the lignin and cellulose.',
    alternative: {
      name: 'Tape-free recycled cardboard & paper tape',
      reason: 'Paper water-activated tape keeps boxes 100% plastic-free for clean composting or recycling.',
      decompositionTime: '2 months',
    },
    sourceLabel: 'U.S. EPA — Paper & Cardboard Recovery',
    sourceUrl: 'https://www.epa.gov/facts-and-figures-about-materials-waste-and-recycling',
    verificationStatus: 'Verified',
  },
  {
    id: 'cotton-tshirt',
    name: 'Cotton shirt',
    aliases: ['cotton t-shirt', 'cotton cloth', 'cotton fabric', 't-shirt'],
    category: 'Textiles',
    subTopic: 'Cotton',
    biodegradable: true,
    decompositionTime: '3 – 6 months',
    decompositionDays: 135,
    timelinePercent: 32,
    breaksDownInto: ['Natural cellulose fibers', 'Water', 'Carbon dioxide', 'Soil organic matter'],
    whyExplanation:
      'Unblended cotton is nearly pure plant cellulose. In moist, aerated soil, bacteria and fungi unravel the spun fibers in months—whereas polyester blends shed synthetic microfibers for centuries.',
    alternative: {
      name: 'Secondhand or undyed organic cotton',
      reason: 'Avoids synthetic elastane/polyester threads and chemical dyes during soil breakdown.',
      decompositionTime: '3 – 5 months',
    },
    sourceLabel: 'Textile Exchange — Fiber Decomposition',
    sourceUrl: 'https://textileexchange.org',
    verificationStatus: 'Verified',
  },
  {
    id: 'polyester-fleece',
    name: 'Polyester fleece jacket',
    aliases: ['polyester', 'fleece', 'synthetic clothing', 'nylon jacket'],
    category: 'Textiles',
    subTopic: 'Synthetics',
    biodegradable: false,
    decompositionTime: '20 – 200 years',
    decompositionDays: 36500,
    timelinePercent: 84,
    breaksDownInto: ['Synthetic microfibers', 'PET polymer fragments'],
    whyExplanation:
      'Polyester is spun from the same petroleum plastic used in soda bottles. Microbes cannot digest synthetic ester polymers, and laundering or weathering sheds persistent microfibers into waterways.',
    alternative: {
      name: 'Merino wool or heavyweight organic cotton',
      reason: 'Natural protein and cellulose fibers biodegrade cleanly without shedding plastic microfibers.',
      decompositionTime: '6 – 12 months',
    },
    sourceLabel: 'IUCN — Primary Microplastics in Oceans',
    sourceUrl: 'https://portals.iucn.org/library/node/46622',
    verificationStatus: 'Verified',
  },
  {
    id: 'coffee-grounds',
    name: 'Used coffee grounds & filter',
    aliases: ['coffee grounds', 'coffee filter', 'espresso puck'],
    category: 'Food Waste',
    subTopic: 'Grounds',
    biodegradable: true,
    decompositionTime: '2 – 4 weeks',
    decompositionDays: 21,
    timelinePercent: 14,
    breaksDownInto: ['Nitrogen-rich humus', 'Water', 'Carbon dioxide'],
    whyExplanation:
      'Ground roasted coffee beans have massive surface area and nitrogen content, feeding compost microbes rapidly. Unbleached paper filters decompose alongside them in the same timeframe.',
    alternative: {
      name: 'Unbleached paper filter + direct composting',
      reason: 'Adds balanced nitrogen and boosts earthworm activity in garden compost piles.',
      decompositionTime: '2 – 3 weeks',
    },
    sourceLabel: 'Oregon State University Extension — Coffee Composting',
    sourceUrl: 'https://extension.oregonstate.edu',
    verificationStatus: 'Verified',
  },
  {
    id: 'plastic-straw',
    name: 'Disposable plastic straw',
    aliases: ['drinking straw', 'polypropylene straw', 'straw'],
    category: 'Plastics',
    subTopic: 'Cups',
    biodegradable: false,
    decompositionTime: '200 years',
    decompositionDays: 73000,
    timelinePercent: 88,
    breaksDownInto: ['Polypropylene microplastics', 'Pigment additives'],
    whyExplanation:
      'Made from lightweight polypropylene, straws slip through recycling sorters and persist for centuries in coastal ecosystems, fragmenting mechanically into microplastics.',
    alternative: {
      name: 'Bamboo, reed, or stainless steel straw',
      reason: 'Natural reed/bamboo composts in weeks; stainless steel lasts indefinitely.',
      decompositionTime: '4 – 8 weeks (bamboo)',
    },
    sourceLabel: 'Ocean Conservancy — Plastics Data',
    sourceUrl: 'https://oceanconservancy.org',
    verificationStatus: 'Verified',
  },
  {
    id: 'coffee-cup',
    name: 'Disposable paper coffee cup',
    aliases: ['to-go cup', 'takeout coffee cup', 'paper cup'],
    category: 'Packaging',
    subTopic: 'Cups',
    biodegradable: false,
    decompositionTime: 'Paper: 2 mo · Liner: 30+ yrs',
    decompositionDays: 10950,
    timelinePercent: 76,
    breaksDownInto: ['Wood pulp', 'Polyethylene plastic film fragments'],
    whyExplanation:
      'Though 95% paper, standard hot drink cups are bonded to a waterproof polyethylene (PE) inner lining. That thin plastic skin prevents standard paper recycling and resists biodegradation.',
    alternative: {
      name: 'Reusable ceramic or steel travel mug',
      reason: 'Zero hidden plastic liner and avoids single-use cup waste entirely.',
      decompositionTime: 'Reusable years',
    },
    sourceLabel: 'National Geographic — Paper Cup Waste',
    sourceUrl: 'https://www.nationalgeographic.com',
    verificationStatus: 'Verified',
  },
  {
    id: 'newspaper',
    name: 'Soy-ink newspaper',
    aliases: ['newspaper', 'newsprint', 'paper flyer'],
    category: 'Paper',
    subTopic: 'Newsprint',
    biodegradable: true,
    decompositionTime: '4 – 6 weeks',
    decompositionDays: 35,
    timelinePercent: 18,
    breaksDownInto: ['Carbon dioxide', 'Water', 'Cellulose soil organic matter'],
    whyExplanation:
      'Newsprint uses minimally refined mechanical wood pulp with thin sheets that absorb moisture rapidly. Modern soy-based inks break down safely alongside the paper.',
    alternative: {
      name: 'Curbside paper recycling or compost mulch',
      reason: 'Shredded newsprint acts as an ideal carbon-rich "brown" layer in compost.',
      decompositionTime: '4 – 6 weeks',
    },
    sourceLabel: 'Cornell Waste Management Institute',
    sourceUrl: 'https://cwmi.css.cornell.edu',
    verificationStatus: 'Verified',
  },
  {
    id: 'orange-peel',
    name: 'Orange & citrus peel',
    aliases: ['orange skin', 'lemon peel', 'citrus rind'],
    category: 'Food Waste',
    subTopic: 'Peels',
    biodegradable: true,
    decompositionTime: '3 – 6 months',
    decompositionDays: 135,
    timelinePercent: 32,
    breaksDownInto: ['Organic humus', 'Carbon dioxide', 'Water'],
    whyExplanation:
      'Citrus peels contain natural limonene oils that mildly slow bacteria at first, taking longer than soft banana skins, yet soil fungi steadily break them down into rich compost.',
    alternative: {
      name: 'Chopped citrus peels in aerobic compost',
      reason: 'Chopping rinds into smaller pieces doubles microbial surface contact for faster breakdown.',
      decompositionTime: '1 – 2 months',
    },
    sourceLabel: 'USDA Natural Resources Conservation Service',
    sourceUrl: 'https://www.nrcs.usda.gov',
    verificationStatus: 'Verified',
  },
  {
    id: 'wool-sock',
    name: '100% Merino wool garment',
    aliases: ['wool sweater', 'wool sock', 'sheep wool'],
    category: 'Textiles',
    subTopic: 'Wool',
    biodegradable: true,
    decompositionTime: '6 – 12 months',
    decompositionDays: 270,
    timelinePercent: 40,
    breaksDownInto: ['Keratin amino acids', 'Nitrogen', 'Sulfur compounds', 'Humus'],
    whyExplanation:
      'Wool is made of natural keratin protein. Soil microbes use protease enzymes to digest keratin and slowly release plant-available nitrogen back into the earth.',
    alternative: {
      name: 'Mendable pure wool or hemp textiles',
      reason: 'Releases soil nutrients as it decomposes rather than synthetic microfibers.',
      decompositionTime: '6 – 12 months',
    },
    sourceLabel: 'Journal of Polymers and the Environment — Wool Soil Study',
    sourceUrl: 'https://link.springer.com',
    verificationStatus: 'Verified',
  },
  {
    id: 'tin-steel-can',
    name: 'Steel food tin can',
    aliases: ['soup can', 'tin can', 'steel can', 'canned food'],
    category: 'Metals',
    subTopic: 'Steel',
    biodegradable: false,
    decompositionTime: '50 years (rusts)',
    decompositionDays: 18250,
    timelinePercent: 78,
    breaksDownInto: ['Iron oxide (rust)', 'Trace tin & polymer liner'],
    whyExplanation:
      'Iron and oxygen react with moisture to oxidize steel into rust over decades, though modern cans also contain a thin food-grade epoxy interior lining. Recycling recovers the steel indefinitely.',
    alternative: {
      name: 'Bulk dry goods or recycled steel cans',
      reason: 'Steel is magnetically separated and recycled at higher rates than almost any other material.',
      decompositionTime: 'Infinitely recyclable',
    },
    sourceLabel: 'Steel Recycling Institute',
    sourceUrl: 'https://www.steelsustainability.org',
    verificationStatus: 'Verified',
  },
  {
    id: 'pla-bioplastic-cup',
    name: 'PLA "compostable" clear cup',
    aliases: ['pla cup', 'cornstarch plastic', 'bioplastic cup'],
    category: 'Plastics',
    subTopic: 'Cups',
    biodegradable: false,
    decompositionTime: 'Soil: 80+ yrs · Industrial: 90 d',
    decompositionDays: 29200,
    timelinePercent: 80,
    breaksDownInto: ['Lactic acid (industrial 60°C)', 'Persistent polymer fragments (cool soil/ocean)'],
    whyExplanation:
      'Polylactic acid (PLA) is made from fermented corn starch, but it requires sustained 60°C (140°F) industrial composting facilities to break down. In home compost, landfills, or cold oceans it behaves like standard plastic.',
    alternative: {
      name: 'Reusable glass or stainless cup',
      reason: 'Avoids confusion with recycling streams where PLA contaminates PET plastic batches.',
      decompositionTime: 'Reusable years',
    },
    sourceLabel: 'Biodegradable Products Institute (BPI)',
    sourceUrl: 'https://bpiworld.org',
    verificationStatus: 'Verified',
  },
  {
    id: 'lithium-battery',
    name: 'Disposable alkaline / Li-ion battery',
    aliases: ['battery', 'aa battery', 'lithium battery', 'cell battery'],
    category: 'Electronics',
    subTopic: 'Batteries',
    biodegradable: false,
    decompositionTime: '100+ years (corrodes)',
    decompositionDays: 36500,
    timelinePercent: 92,
    breaksDownInto: ['Corroded zinc/lithium salts', 'Heavy metal leachate'],
    whyExplanation:
      'Batteries combine steel casings with reactive alkaline or lithium electrolytes that never biodegrade. If tossed into soil or landfills, casings corrode and leak heavy metals into groundwater.',
    alternative: {
      name: 'Rechargeable NiMH cells & e-waste drop-off',
      reason: 'One rechargeable AA replaces hundreds of single-use cells and recovers metals safely.',
      decompositionTime: 'Recyclable via e-waste',
    },
    sourceLabel: 'U.S. EPA — Used Household Batteries',
    sourceUrl: 'https://www.epa.gov/recycle/used-household-batteries',
    verificationStatus: 'Verified',
  },
  {
    id: 'printed-circuit-board',
    name: 'Printed circuit board (e-waste)',
    aliases: ['circuit board', 'motherboard', 'electronics', 'phone board'],
    category: 'Electronics',
    subTopic: 'Circuits',
    biodegradable: false,
    decompositionTime: '1,000+ years (inert)',
    decompositionDays: 365000,
    timelinePercent: 99,
    breaksDownInto: ['Fiberglass epoxy resin', 'Trace copper, lead & solder alloys'],
    whyExplanation:
      'Circuit boards are laminated from flame-retardant epoxy fiberglass and soldered metals designed never to degrade under heat or humidity. Always route electronics to certified recyclers.',
    alternative: {
      name: 'Modular repairable devices & certified e-cycling',
      reason: 'Recovers gold, copper, and rare earths without mining or toxic soil leaching.',
      decompositionTime: 'Recoverable metals',
    },
    sourceLabel: 'UNEP — Global E-waste Monitor',
    sourceUrl: 'https://ewastemonitor.info',
    verificationStatus: 'Verified',
  },
];

export const INITIAL_SUBMISSIONS: SubmissionItem[] = [
  {
    id: 'sub-1',
    type: 'new-item',
    productName: 'Silicone baking mat',
    category: 'Packaging',
    notes: 'Submitted by user via Checker — silicone is durable synthetic polymer, non-biodegradable.',
    submittedAt: '2026-11-14',
    status: 'Pending',
  },
  {
    id: 'sub-2',
    type: 'correction',
    productName: 'Uncoated paper plate',
    category: 'Paper',
    notes: 'Suggested adding note about grease-soaked pizza boxes vs clean paper plates.',
    submittedAt: '2026-11-15',
    status: 'Pending',
  },
];

export const SUGGESTED_CHIPS = [
  'Plastic bag',
  'Paper plate',
  'Banana peel',
  'Styrofoam cup',
  'Tea bag',
];

export const CATEGORIES: ('All' | Category)[] = [
  'All',
  'Plastics',
  'Paper',
  'Food Waste',
  'Textiles',
  'Metals',
  'Glass',
  'Packaging',
  'Electronics',
];

const ALTERNATIVE_IMAGE_BY_ID: Record<string, string> = {
  'banana-peel': '/assets/aistudio/image_4_29227969.png',
  'plastic-bag': '/src/assets/images/alt_cotton_jute_tote_1794850774040.jpg',
  'paper-plate': '/src/assets/images/alt_bagasse_cardboard_paper_1794850777681.jpg',
  'styrofoam-cup': '/src/assets/images/alt_steel_bottle_tumbler_1794850773818.jpg',
  'tea-bag': '/src/assets/images/alt_loose_leaf_tea_1794850775764.jpg',
  'jute-bag': '/src/assets/images/alt_cotton_jute_tote_1794850774040.jpg',
  'plastic-bottle': '/src/assets/images/alt_steel_bottle_tumbler_1794850773818.jpg',
  'snack-wrapper': '/src/assets/images/alt_glass_jars_bulk_1794850774524.jpg',
  'aluminum-can': '/src/assets/images/alt_steel_bottle_tumbler_1794850773818.jpg',
  'glass-bottle': '/src/assets/images/alt_glass_jars_bulk_1794850774524.jpg',
  'cardboard-box': '/src/assets/images/alt_bagasse_cardboard_paper_1794850777681.jpg',
  'cotton-tshirt': '/src/assets/images/alt_natural_wool_cotton_1794850776997.jpg',
  'polyester-fleece': '/src/assets/images/alt_natural_wool_cotton_1794850776997.jpg',
  'coffee-grounds': '/src/assets/images/alt_compost_humus_citrus_1794850777693.jpg',
  'plastic-straw': '/src/assets/images/alt_bamboo_straws_1794850775603.jpg',
  'coffee-cup': '/src/assets/images/alt_ceramic_travel_mug_1794850777003.jpg',
  newspaper: '/assets/aistudio/image_2_338a9168.png',
  'orange-peel': '/src/assets/images/alt_compost_humus_citrus_1794850777693.jpg',
  'wool-sock': '/src/assets/images/alt_natural_wool_cotton_1794850776997.jpg',
  'tin-steel-can': '/src/assets/images/alt_glass_jars_bulk_1794850774524.jpg',
  'pla-bioplastic-cup': '/src/assets/images/alternatives_banner_nature_1794849364151.jpg',
  'lithium-battery': '/src/assets/images/alt_ewaste_repair_batteries_1794850778288.jpg',
  'printed-circuit-board': '/src/assets/images/alt_ewaste_repair_batteries_1794850778288.jpg',
};

export function getAlternativeImageUrl(product: ProductItem): string {
  const direct = ALTERNATIVE_IMAGE_BY_ID[product.id];
  if (direct) return direct;

  const text = `${product.alternative.name} ${product.name}`.toLowerCase();
  if (text.includes('straw') || text.includes('bamboo') || text.includes('reed')) {
    return '/src/assets/images/alt_bamboo_straws_1794850775603.jpg';
  }
  if (text.includes('tea') || text.includes('infuser')) {
    return '/src/assets/images/alt_loose_leaf_tea_1794850775764.jpg';
  }
  if (text.includes('mug') || text.includes('ceramic') || text.includes('coffee')) {
    return '/src/assets/images/alt_ceramic_travel_mug_1794850777003.jpg';
  }
  if (text.includes('tote') || text.includes('jute') || text.includes('bag')) {
    return '/src/assets/images/alt_cotton_jute_tote_1794850774040.jpg';
  }
  if (text.includes('bottle') || text.includes('tumbler') || text.includes('steel')) {
    return '/src/assets/images/alt_steel_bottle_tumbler_1794850773818.jpg';
  }
  if (text.includes('jar') || text.includes('glass') || text.includes('bulk')) {
    return '/src/assets/images/alt_glass_jars_bulk_1794850774524.jpg';
  }
  if (text.includes('wool') || text.includes('cotton') || text.includes('hemp')) {
    return '/src/assets/images/alt_natural_wool_cotton_1794850776997.jpg';
  }
  if (text.includes('plate') || text.includes('bagasse') || text.includes('cardboard')) {
    return '/src/assets/images/alt_bagasse_cardboard_paper_1794850777681.jpg';
  }
  if (text.includes('battery') || text.includes('circuit') || text.includes('e-waste') || text.includes('device')) {
    return '/src/assets/images/alt_ewaste_repair_batteries_1794850778288.jpg';
  }
  if (text.includes('compost') || text.includes('bokashi') || text.includes('peel')) {
    return '/src/assets/images/alt_compost_humus_citrus_1794850777693.jpg';
  }
  return '/src/assets/images/alternatives_banner_nature_1794849364151.jpg';
}

export const CATEGORY_IMAGES: Record<Category, string> = {
  Plastics: '/src/assets/images/db_cat_plastics_1794850956628.jpg',
  Paper: '/src/assets/images/db_cat_paper_1794850956441.jpg',
  'Food Waste': '/src/assets/images/db_cat_food_waste_1794850956846.jpg',
  Textiles: '/src/assets/images/db_cat_textiles_1794850959368.jpg',
  Metals: '/src/assets/images/db_cat_metals_1794850958895.jpg',
  Glass: '/src/assets/images/db_cat_glass_1794850958785.jpg',
  Packaging: '/src/assets/images/db_cat_packaging_1794850960072.jpg',
  Electronics: '/src/assets/images/db_cat_electronics_1794850960780.jpg',
};

const SUBTOPIC_IMAGE_MAP: Record<Category, Record<string, string>> = {
  Plastics: {
    Bags: '/assets/aistudio/image_3_f5698fe3.png',
    Bottles: '/src/assets/images/db_cat_plastics_1794850956628.jpg',
    Cups: '/src/assets/images/db_cat_packaging_1794850960072.jpg',
    Wrappers: '/src/assets/images/bg_database_specimen_1794849012701.jpg',
  },
  Paper: {
    Plates: '/src/assets/images/db_cat_paper_1794850956441.jpg',
    Newsprint: '/src/assets/images/alt_bagasse_cardboard_paper_1794850777681.jpg',
    Filters: '/src/assets/images/alt_ceramic_travel_mug_1794850777003.jpg',
    Cartons: '/src/assets/images/db_cat_packaging_1794850960072.jpg',
  },
  'Food Waste': {
    Peels: '/src/assets/images/db_cat_food_waste_1794850956846.jpg',
    Grounds: '/src/assets/images/alt_compost_humus_citrus_1794850777693.jpg',
    Leaves: '/src/assets/images/alt_loose_leaf_tea_1794850775764.jpg',
    Shells: '/assets/aistudio/image_4_29227969.png',
  },
  Textiles: {
    Cotton: '/src/assets/images/alt_natural_wool_cotton_1794850776997.jpg',
    Jute: '/src/assets/images/alt_cotton_jute_tote_1794850774040.jpg',
    Wool: '/src/assets/images/db_cat_textiles_1794850959368.jpg',
    Synthetics: '/assets/aistudio/image_3_f5698fe3.png',
  },
  Metals: {
    Aluminum: '/src/assets/images/db_cat_metals_1794850958895.jpg',
    Steel: '/src/assets/images/alt_steel_bottle_tumbler_1794850773818.jpg',
    Foils: '/src/assets/images/db_cat_packaging_1794850960072.jpg',
    Caps: '/src/assets/images/db_cat_glass_1794850958785.jpg',
  },
  Glass: {
    Bottles: '/src/assets/images/db_cat_glass_1794850958785.jpg',
    Jars: '/src/assets/images/alt_glass_jars_bulk_1794850774524.jpg',
    Tableware: '/src/assets/images/alternatives_banner_nature_1794849364151.jpg',
    Mirrors: '/src/assets/images/bg_database_specimen_1794849012701.jpg',
  },
  Packaging: {
    Boxes: '/src/assets/images/alt_bagasse_cardboard_paper_1794850777681.jpg',
    Foam: '/src/assets/images/db_cat_packaging_1794850960072.jpg',
    Cups: '/src/assets/images/alt_ceramic_travel_mug_1794850777003.jpg',
    Mailers: '/src/assets/images/db_cat_paper_1794850956441.jpg',
  },
  Electronics: {
    Batteries: '/src/assets/images/db_cat_electronics_1794850960780.jpg',
    Circuits: '/src/assets/images/alt_ewaste_repair_batteries_1794850778288.jpg',
    Cables: '/src/assets/images/bg_biology_roots_1794849017726.jpg',
    Casings: '/src/assets/images/bg_database_specimen_1794849012701.jpg',
  },
};

export function getSubTopicImageUrl(category: Category, subTopic: string): string {
  return SUBTOPIC_IMAGE_MAP[category]?.[subTopic] || CATEGORY_IMAGES[category];
}


