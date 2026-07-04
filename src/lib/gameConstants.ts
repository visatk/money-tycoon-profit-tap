import type {
  BusinessDef,
  InvestmentAsset,
  LuxuryItem,
  MarketEventDef,
  MiniGameDef,
  QuestDef,
} from '@/types'

// ─── BUSINESSES ───────────────────────────────────────────────────────────────

export const BUSINESSES: BusinessDef[] = [
  {
    id: 'store',
    name: 'Your Own Store',
    emoji: '🏪',
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.4)',
    description: 'Manage retail trade, optimize product assortment, attract virtual shoppers.',
    baseIncomePerTap: 1,
    baseAutoPerManager: 0.5,
    upgrades: [
      {
        id: 'product_variety',
        name: 'Product Variety',
        description: '+50% tap income — more products means more sales',
        cost: 100,
        tapMultiplier: 1.5,
        icon: '📦',
      },
      {
        id: 'loyalty_cards',
        name: 'Loyalty Cards',
        description: '+100% tap income — repeat customers spend more',
        cost: 500,
        tapMultiplier: 2.0,
        icon: '💳',
      },
      {
        id: 'self_checkout',
        name: 'Self Checkout',
        description: '+100% auto income — customers serve themselves',
        cost: 2_000,
        autoMultiplier: 2.0,
        icon: '🤖',
      },
      {
        id: 'brand_advertising',
        name: 'Brand Advertising',
        description: '+200% tap income — massive foot traffic',
        cost: 10_000,
        tapMultiplier: 3.0,
        icon: '📺',
      },
      {
        id: 'premium_brand',
        name: 'Premium Brand',
        description: '+300% all income — luxury product lines',
        cost: 100_000,
        tapMultiplier: 4.0,
        autoMultiplier: 4.0,
        icon: '👑',
      },
    ],
    managers: [
      { id: 'cashier', name: 'Cashier', description: 'Rings up sales automatically', costPerHire: 50, incomePerSecond: 1 },
      { id: 'shift_manager', name: 'Shift Manager', description: 'Manages staff and inventory', costPerHire: 500, incomePerSecond: 8 },
      { id: 'district_manager', name: 'District Manager', description: 'Oversees all operations', costPerHire: 5_000, incomePerSecond: 50 },
    ],
  },
  {
    id: 'taxi',
    name: 'Taxi Service',
    emoji: '🚕',
    color: '#eab308',
    glowColor: 'rgba(234,179,8,0.4)',
    description: 'Create your own fleet! Set up passenger transport logistics and hire virtual drivers.',
    baseIncomePerTap: 5,
    baseAutoPerManager: 2,
    upgrades: [
      {
        id: 'gps_system',
        name: 'GPS System',
        description: '+50% tap income — efficient routing',
        cost: 500,
        tapMultiplier: 1.5,
        icon: '🗺️',
      },
      {
        id: 'luxury_fleet',
        name: 'Luxury Fleet',
        description: '+100% tap income — premium fares',
        cost: 2_500,
        tapMultiplier: 2.0,
        icon: '🚘',
      },
      {
        id: 'driver_training',
        name: 'Driver Training',
        description: '+100% auto income — higher ratings',
        cost: 10_000,
        autoMultiplier: 2.0,
        icon: '🎓',
      },
      {
        id: 'surge_pricing',
        name: 'Surge Pricing',
        description: '+200% tap income — dynamic fares',
        cost: 50_000,
        tapMultiplier: 3.0,
        icon: '📈',
      },
      {
        id: 'autonomous_vehicles',
        name: 'Autonomous Vehicles',
        description: '+400% auto income — self-driving taxis',
        cost: 500_000,
        autoMultiplier: 5.0,
        icon: '🤖',
      },
    ],
    managers: [
      { id: 'driver', name: 'Driver', description: 'Picks up passengers automatically', costPerHire: 250, incomePerSecond: 4 },
      { id: 'fleet_manager', name: 'Fleet Manager', description: 'Coordinates all drivers', costPerHire: 2_500, incomePerSecond: 30 },
      { id: 'dispatch_ai', name: 'Dispatch AI', description: 'Optimal route AI system', costPerHire: 25_000, incomePerSecond: 200 },
    ],
  },
  {
    id: 'logistics',
    name: 'Logistics & Delivery',
    emoji: '📦',
    color: '#3b82f6',
    glowColor: 'rgba(59,130,246,0.4)',
    description: 'Upgrade transport hubs, coordinate deliveries, manage a global supply chain.',
    baseIncomePerTap: 20,
    baseAutoPerManager: 8,
    upgrades: [
      {
        id: 'cargo_capacity',
        name: 'Cargo Capacity',
        description: '+50% tap income — larger shipments',
        cost: 2_000,
        tapMultiplier: 1.5,
        icon: '🚛',
      },
      {
        id: 'express_lanes',
        name: 'Express Lanes',
        description: '+100% tap income — faster deliveries',
        cost: 10_000,
        tapMultiplier: 2.0,
        icon: '⚡',
      },
      {
        id: 'hub_warehouse',
        name: 'Hub Warehouse',
        description: '+150% auto income — centralized storage',
        cost: 40_000,
        autoMultiplier: 2.5,
        icon: '🏭',
      },
      {
        id: 'drone_delivery',
        name: 'Drone Delivery',
        description: '+300% tap income — aerial routes',
        cost: 200_000,
        tapMultiplier: 4.0,
        icon: '🚁',
      },
      {
        id: 'global_network',
        name: 'Global Network',
        description: '+500% all income — worldwide logistics',
        cost: 2_000_000,
        tapMultiplier: 6.0,
        autoMultiplier: 6.0,
        icon: '🌍',
      },
    ],
    managers: [
      { id: 'courier', name: 'Courier', description: 'Delivers packages automatically', costPerHire: 1_000, incomePerSecond: 16 },
      { id: 'logistics_manager', name: 'Logistics Manager', description: 'Optimizes all routes', costPerHire: 10_000, incomePerSecond: 120 },
      { id: 'supply_chain_ai', name: 'Supply Chain AI', description: 'Full automation AI', costPerHire: 100_000, incomePerSecond: 800 },
    ],
  },
  {
    id: 'construction',
    name: 'Construction Company',
    emoji: '🏗️',
    color: '#f97316',
    glowColor: 'rgba(249,115,22,0.4)',
    description: 'Build skyscrapers, manage projects, and create architectural masterpieces.',
    baseIncomePerTap: 100,
    baseAutoPerManager: 40,
    upgrades: [
      {
        id: 'safety_equipment',
        name: 'Safety Equipment',
        description: '+50% tap income — faster builds',
        cost: 10_000,
        tapMultiplier: 1.5,
        icon: '⛑️',
      },
      {
        id: 'modern_machinery',
        name: 'Modern Machinery',
        description: '+150% tap income — powerful equipment',
        cost: 50_000,
        tapMultiplier: 2.5,
        icon: '🏗️',
      },
      {
        id: 'permit_expediting',
        name: 'Permit Expediting',
        description: '+100% auto income — faster approvals',
        cost: 200_000,
        autoMultiplier: 2.0,
        icon: '📋',
      },
      {
        id: 'skyscraper_tech',
        name: 'Skyscraper Tech',
        description: '+300% tap income — mega projects',
        cost: 1_000_000,
        tapMultiplier: 4.0,
        icon: '🏙️',
      },
      {
        id: 'smart_construction',
        name: 'Smart Construction',
        description: '+500% all income — AI-designed builds',
        cost: 10_000_000,
        tapMultiplier: 6.0,
        autoMultiplier: 6.0,
        icon: '🤖',
      },
    ],
    managers: [
      { id: 'foreman', name: 'Foreman', description: 'Manages the construction crew', costPerHire: 5_000, incomePerSecond: 80 },
      { id: 'project_manager', name: 'Project Manager', description: 'Oversees all projects', costPerHire: 50_000, incomePerSecond: 600 },
      { id: 'ceo', name: 'CEO', description: 'Runs the entire company', costPerHire: 500_000, incomePerSecond: 4_000 },
    ],
  },
  {
    id: 'airport',
    name: 'International Airport',
    emoji: '✈️',
    color: '#8b5cf6',
    glowColor: 'rgba(139,92,246,0.4)',
    description: 'Build a world-class airport, expand routes, and manage passenger flows.',
    baseIncomePerTap: 500,
    baseAutoPerManager: 200,
    upgrades: [
      {
        id: 'terminal_expansion',
        name: 'Terminal Expansion',
        description: '+50% tap income — more gates',
        cost: 50_000,
        tapMultiplier: 1.5,
        icon: '🏛️',
      },
      {
        id: 'new_routes',
        name: 'International Routes',
        description: '+150% tap income — global connections',
        cost: 250_000,
        tapMultiplier: 2.5,
        icon: '🌐',
      },
      {
        id: 'vip_lounge',
        name: 'VIP Lounge',
        description: '+200% auto income — premium passengers',
        cost: 1_000_000,
        autoMultiplier: 3.0,
        icon: '💎',
      },
      {
        id: 'duty_free_shops',
        name: 'Duty Free Shops',
        description: '+300% tap income — retail revenue',
        cost: 5_000_000,
        tapMultiplier: 4.0,
        icon: '🛍️',
      },
      {
        id: 'hub_airport',
        name: 'Major Hub Airport',
        description: '+600% all income — global traffic hub',
        cost: 50_000_000,
        tapMultiplier: 7.0,
        autoMultiplier: 7.0,
        icon: '🌟',
      },
    ],
    managers: [
      { id: 'ground_crew', name: 'Ground Crew', description: 'Handles aircraft automatically', costPerHire: 25_000, incomePerSecond: 400 },
      { id: 'air_traffic_controller', name: 'Air Traffic Controller', description: 'Manages all flights', costPerHire: 250_000, incomePerSecond: 3_000 },
      { id: 'airport_ceo', name: 'Airport CEO', description: 'Runs the entire airport', costPerHire: 2_500_000, incomePerSecond: 20_000 },
    ],
  },
  {
    id: 'factory',
    name: 'Industrial Factory',
    emoji: '🏭',
    color: '#ec4899',
    glowColor: 'rgba(236,72,153,0.4)',
    description: 'Run production lines, innovate with robotics, and manufacture at scale.',
    baseIncomePerTap: 2_500,
    baseAutoPerManager: 1_000,
    upgrades: [
      {
        id: 'assembly_line',
        name: 'Assembly Line',
        description: '+50% tap income — faster production',
        cost: 250_000,
        tapMultiplier: 1.5,
        icon: '⚙️',
      },
      {
        id: 'quality_control',
        name: 'Quality Control',
        description: '+150% tap income — premium products',
        cost: 1_250_000,
        tapMultiplier: 2.5,
        icon: '✅',
      },
      {
        id: 'resource_recycling',
        name: 'Resource Recycling',
        description: '+200% auto income — zero waste',
        cost: 5_000_000,
        autoMultiplier: 3.0,
        icon: '♻️',
      },
      {
        id: 'robot_assembly',
        name: 'Robot Assembly',
        description: '+400% tap income — full automation',
        cost: 25_000_000,
        tapMultiplier: 5.0,
        icon: '🤖',
      },
      {
        id: 'megafactory',
        name: 'Megafactory',
        description: '+700% all income — industrial empire',
        cost: 250_000_000,
        tapMultiplier: 8.0,
        autoMultiplier: 8.0,
        icon: '🏭',
      },
    ],
    managers: [
      { id: 'technician', name: 'Technician', description: 'Maintains production lines', costPerHire: 125_000, incomePerSecond: 2_000 },
      { id: 'plant_manager', name: 'Plant Manager', description: 'Oversees all operations', costPerHire: 1_250_000, incomePerSecond: 15_000 },
      { id: 'automation_ai', name: 'Automation AI', description: 'Full robotic management', costPerHire: 12_500_000, incomePerSecond: 100_000 },
    ],
  },
]

export const BUSINESS_MAP = Object.fromEntries(
  BUSINESSES.map((b) => [b.id, b]),
) as Record<string, BusinessDef>

// ─── INVESTMENTS ──────────────────────────────────────────────────────────────

export const INVESTMENT_ASSETS: InvestmentAsset[] = [
  {
    id: 'tech_stock',
    name: 'Tech Stocks',
    emoji: '💻',
    description: 'High-growth technology companies. Volatile but rewarding.',
    basePrice: 100,
    volatility: 0.05,
    color: '#3b82f6',
  },
  {
    id: 'real_estate',
    name: 'Real Estate',
    emoji: '🏠',
    description: 'Stable property investments. Steady growth over time.',
    basePrice: 1_000,
    volatility: 0.02,
    color: '#f59e0b',
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    emoji: '₿',
    description: 'Extreme volatility. High risk, high reward digital assets.',
    basePrice: 50,
    volatility: 0.15,
    color: '#f97316',
  },
  {
    id: 'bonds',
    name: 'Gov Bonds',
    emoji: '📜',
    description: 'Government-backed securities. Safe and predictable returns.',
    basePrice: 500,
    volatility: 0.005,
    color: '#10b981',
  },
  {
    id: 'commodities',
    name: 'Commodities',
    emoji: '⚡',
    description: 'Oil, gold, and energy futures. Moderate risk and reward.',
    basePrice: 200,
    volatility: 0.03,
    color: '#8b5cf6',
  },
]

// ─── LUXURY ITEMS ─────────────────────────────────────────────────────────────

export const LUXURY_ITEMS: LuxuryItem[] = [
  // Cars
  { id: 'sports_car', category: 'cars', name: 'Sports Car', emoji: '🏎️', description: 'A sleek sports car to show off your success', price: 50_000, incomeBonus: 2, prestigeScore: 10, gradient: 'from-red-500 to-orange-500' },
  { id: 'luxury_sedan', category: 'cars', name: 'Luxury Sedan', emoji: '🚗', description: 'Premium comfort and style for the discerning entrepreneur', price: 200_000, incomeBonus: 4, prestigeScore: 25, gradient: 'from-slate-500 to-slate-700' },
  { id: 'supercar', category: 'cars', name: 'Supercar', emoji: '🏎️', description: 'Zero to 100 in under 3 seconds. Pure performance.', price: 1_000_000, incomeBonus: 8, prestigeScore: 60, gradient: 'from-yellow-400 to-amber-600' },
  { id: 'hypercar', category: 'cars', name: 'Hypercar', emoji: '🏎️', description: 'One of the most exclusive vehicles ever created', price: 5_000_000, incomeBonus: 15, prestigeScore: 150, gradient: 'from-blue-400 to-purple-600' },
  { id: 'track_weapon', category: 'cars', name: 'Track Weapon', emoji: '🏎️', description: 'A race car for the road. The pinnacle of automotive art.', price: 25_000_000, incomeBonus: 25, prestigeScore: 400, gradient: 'from-green-400 to-emerald-600' },
  { id: 'mythical_racer', category: 'cars', name: 'Mythical Racer', emoji: '🏎️', description: 'A legendary vehicle whispered about in billionaire circles', price: 100_000_000, incomeBonus: 50, prestigeScore: 1_000, gradient: 'from-pink-400 to-rose-600' },
  { id: 'future_concept', category: 'cars', name: 'Future Concept', emoji: '🏎️', description: 'A vehicle from the future. Only 3 in existence.', price: 500_000_000, incomeBonus: 100, prestigeScore: 3_000, gradient: 'from-cyan-400 to-blue-600' },
  { id: 'ultimate_legend', category: 'cars', name: 'Ultimate Legend', emoji: '🏎️', description: 'The single most expensive vehicle ever auctioned', price: 2_000_000_000, incomeBonus: 200, prestigeScore: 10_000, gradient: 'from-yellow-300 to-amber-500' },

  // Jets
  { id: 'private_jet', category: 'jets', name: 'Private Jet', emoji: '✈️', description: 'Skip the lines. Travel in ultimate comfort.', price: 10_000_000, incomeBonus: 5, prestigeScore: 200, gradient: 'from-sky-400 to-blue-600' },
  { id: 'executive_jet', category: 'jets', name: 'Executive Jet', emoji: '✈️', description: 'A flying boardroom for the global power player', price: 50_000_000, incomeBonus: 10, prestigeScore: 600, gradient: 'from-indigo-400 to-violet-600' },
  { id: 'super_jet', category: 'jets', name: 'Super Jet', emoji: '✈️', description: 'Ultra-long range. Nonstop from New York to Tokyo.', price: 200_000_000, incomeBonus: 20, prestigeScore: 2_000, gradient: 'from-purple-400 to-fuchsia-600' },
  { id: 'mega_jet', category: 'jets', name: 'Mega Jet', emoji: '✈️', description: 'A flying palace. The ultimate statement of power.', price: 1_000_000_000, incomeBonus: 50, prestigeScore: 8_000, gradient: 'from-amber-400 to-yellow-500' },

  // Yachts
  { id: 'luxury_yacht', category: 'yachts', name: 'Luxury Yacht', emoji: '⛵', description: 'Sail the Mediterranean in style and comfort', price: 20_000_000, incomeBonus: 5, prestigeScore: 350, gradient: 'from-teal-400 to-cyan-600' },
  { id: 'mega_yacht', category: 'yachts', name: 'Mega Yacht', emoji: '🚢', description: 'Your own floating resort. Complete with helipad.', price: 100_000_000, incomeBonus: 15, prestigeScore: 1_500, gradient: 'from-blue-400 to-indigo-600' },
  { id: 'giga_yacht', category: 'yachts', name: 'Giga Yacht', emoji: '🛳️', description: 'Larger than a football field. The ultimate yacht.', price: 1_000_000_000, incomeBonus: 40, prestigeScore: 9_000, gradient: 'from-emerald-400 to-teal-600' },

  // Art
  { id: 'modern_print', category: 'art', name: 'Modern Print', emoji: '🖼️', description: 'A limited edition print by an emerging artist', price: 500_000, incomeBonus: 1, prestigeScore: 15, gradient: 'from-pink-300 to-rose-400' },
  { id: 'impressionist', category: 'art', name: 'Impressionist', emoji: '🎨', description: 'A stunning impressionist work from the 19th century', price: 2_000_000, incomeBonus: 2, prestigeScore: 40, gradient: 'from-violet-400 to-purple-500' },
  { id: 'pop_art_icon', category: 'art', name: 'Pop Art Icon', emoji: '🖼️', description: 'An iconic pop art piece that defines an era', price: 5_000_000, incomeBonus: 3, prestigeScore: 100, gradient: 'from-yellow-400 to-orange-500' },
  { id: 'classic_master', category: 'art', name: 'Old Master', emoji: '🎨', description: 'A Renaissance masterpiece by a famous name', price: 10_000_000, incomeBonus: 5, prestigeScore: 250, gradient: 'from-amber-500 to-yellow-600' },
  { id: 'digital_nft', category: 'art', name: 'Legendary NFT', emoji: '💎', description: 'The most valuable digital artwork ever created', price: 50_000_000, incomeBonus: 10, prestigeScore: 700, gradient: 'from-cyan-400 to-blue-500' },
  { id: 'abstract_genius', category: 'art', name: 'Abstract Genius', emoji: '🖼️', description: 'A critically acclaimed abstract piece', price: 100_000_000, incomeBonus: 15, prestigeScore: 1_500, gradient: 'from-fuchsia-400 to-pink-600' },
  { id: 'sculpture_marvel', category: 'art', name: 'Bronze Sculpture', emoji: '🗿', description: 'A monumental bronze by a legendary sculptor', price: 500_000_000, incomeBonus: 25, prestigeScore: 5_000, gradient: 'from-orange-400 to-red-500' },
  { id: 'priceless_relic', category: 'art', name: 'Ancient Relic', emoji: '🏺', description: 'A 3,000-year-old artifact of incalculable value', price: 2_000_000_000, incomeBonus: 50, prestigeScore: 15_000, gradient: 'from-yellow-300 to-amber-400' },
  { id: 'masterpiece', category: 'art', name: 'The Masterpiece', emoji: '🎨', description: 'The most valuable painting ever sold at auction', price: 10_000_000_000, incomeBonus: 100, prestigeScore: 50_000, gradient: 'from-rose-400 to-pink-600' },
]

export const LUXURY_MAP = Object.fromEntries(LUXURY_ITEMS.map((l) => [l.id, l])) as Record<string, LuxuryItem>

// ─── MARKET EVENTS ────────────────────────────────────────────────────────────

export const MARKET_EVENTS: MarketEventDef[] = [
  {
    type: 'economic_boom',
    title: 'Economic Boom!',
    description: 'The economy is booming! All businesses earn 3× income.',
    emoji: '💰',
    effect: 'boost_all',
    multiplier: 3,
    durationMinutes: 5,
  },
  {
    type: 'market_surge',
    title: 'Market Surge!',
    description: 'One industry is surging with 5× income!',
    emoji: '📈',
    effect: 'boost_one',
    multiplier: 5,
    durationMinutes: 3,
  },
  {
    type: 'fuel_shortage',
    title: 'Fuel Shortage!',
    description: 'Rising fuel costs slash Logistics income by 50%.',
    emoji: '⛽',
    effect: 'reduce_one',
    businessId: 'logistics',
    multiplier: 0.5,
    durationMinutes: 10,
  },
  {
    type: 'storm_warning',
    title: 'Storm Warning!',
    description: 'Severe weather grounds all flights. Airport income down 75%.',
    emoji: '🌩️',
    effect: 'reduce_one',
    businessId: 'airport',
    multiplier: 0.25,
    durationMinutes: 8,
  },
  {
    type: 'grand_opening',
    title: 'Grand Opening!',
    description: 'Your store just went viral! 10× income for a limited time.',
    emoji: '🎉',
    effect: 'boost_one',
    businessId: 'store',
    multiplier: 10,
    durationMinutes: 2,
  },
  {
    type: 'road_works',
    title: 'Road Works!',
    description: 'City road works disrupt taxi routes. 30% income reduction.',
    emoji: '🚧',
    effect: 'reduce_one',
    businessId: 'taxi',
    multiplier: 0.7,
    durationMinutes: 15,
  },
  {
    type: 'construction_boom',
    title: 'Construction Boom!',
    description: 'New infrastructure projects everywhere. 4× construction income!',
    emoji: '🏗️',
    effect: 'boost_one',
    businessId: 'construction',
    multiplier: 4,
    durationMinutes: 6,
  },
  {
    type: 'equipment_failure',
    title: 'Equipment Failure!',
    description: 'Critical machinery breakdown. Factory income paused temporarily.',
    emoji: '💥',
    effect: 'reduce_one',
    businessId: 'factory',
    multiplier: 0,
    durationMinutes: 3,
  },
]

// ─── MINI-GAMES ───────────────────────────────────────────────────────────────

export const MINI_GAMES: MiniGameDef[] = [
  {
    id: 'tap_frenzy',
    name: 'Tap Frenzy',
    emoji: '👆',
    description: 'Tap as fast as you can in 10 seconds for massive rewards!',
    maxReward: 50_000,
    cooldownMinutes: 30,
  },
  {
    id: 'memory_match',
    name: 'Memory Match',
    emoji: '🃏',
    description: 'Match all 6 pairs of business cards to win upgrade vouchers!',
    maxReward: 100_000,
    cooldownMinutes: 60,
  },
  {
    id: 'fortune_wheel',
    name: 'Fortune Wheel',
    emoji: '🎡',
    description: 'Spin the wheel of fortune for a random cash prize or multiplier!',
    maxReward: 200_000,
    cooldownMinutes: 120,
  },
]

// ─── DAILY QUESTS POOL ────────────────────────────────────────────────────────

export const QUEST_POOL: QuestDef[] = [
  { id: 'tap_500', title: 'Tap Champion', description: 'Tap 500 times total', emoji: '👆', target: 500, rewardType: 'cash', rewardAmount: 50_000, rewardLabel: '$50K' },
  { id: 'tap_1000', title: 'Tap Master', description: 'Tap 1,000 times total', emoji: '💪', target: 1000, rewardType: 'cash', rewardAmount: 150_000, rewardLabel: '$150K' },
  { id: 'tap_5000', title: 'Tap Legend', description: 'Tap 5,000 times total', emoji: '🏆', target: 5000, rewardType: 'cash', rewardAmount: 1_000_000, rewardLabel: '$1M' },
  { id: 'earn_store_1m', title: 'Retail Rush', description: 'Earn $1M from Your Store', emoji: '🏪', target: 1_000_000, rewardType: 'boost', rewardAmount: 2, rewardLabel: 'Store 2× (1h)' },
  { id: 'earn_taxi_5m', title: 'Road Warrior', description: 'Earn $5M from Taxi Service', emoji: '🚕', target: 5_000_000, rewardType: 'boost', rewardAmount: 2, rewardLabel: 'Taxi 2× (1h)' },
  { id: 'earn_logistics_10m', title: 'Supply Chain', description: 'Earn $10M from Logistics', emoji: '📦', target: 10_000_000, rewardType: 'boost', rewardAmount: 2, rewardLabel: 'Logistics 2× (1h)' },
  { id: 'earn_construction_50m', title: 'Builder Boss', description: 'Earn $50M from Construction', emoji: '🏗️', target: 50_000_000, rewardType: 'cash', rewardAmount: 5_000_000, rewardLabel: '$5M' },
  { id: 'earn_airport_100m', title: 'Sky High', description: 'Earn $100M from Airport', emoji: '✈️', target: 100_000_000, rewardType: 'cash', rewardAmount: 10_000_000, rewardLabel: '$10M' },
  { id: 'earn_factory_500m', title: 'Industrial Mogul', description: 'Earn $500M from Factory', emoji: '🏭', target: 500_000_000, rewardType: 'cash', rewardAmount: 50_000_000, rewardLabel: '$50M' },
  { id: 'buy_3_upgrades', title: 'Upgrade Spree', description: 'Purchase 3 upgrades', emoji: '⬆️', target: 3, rewardType: 'cash', rewardAmount: 250_000, rewardLabel: '$250K' },
  { id: 'buy_5_upgrades', title: 'Power Up', description: 'Purchase 5 upgrades', emoji: '🚀', target: 5, rewardType: 'cash', rewardAmount: 1_000_000, rewardLabel: '$1M' },
  { id: 'hire_2_managers', title: 'Team Builder', description: 'Hire 2 managers', emoji: '👥', target: 2, rewardType: 'cash', rewardAmount: 500_000, rewardLabel: '$500K' },
  { id: 'hire_5_managers', title: 'Corporate Empire', description: 'Hire 5 managers', emoji: '🏢', target: 5, rewardType: 'cash', rewardAmount: 2_000_000, rewardLabel: '$2M' },
  { id: 'make_investment', title: 'Investor', description: 'Make any investment', emoji: '📊', target: 1, rewardType: 'cash', rewardAmount: 100_000, rewardLabel: '$100K' },
  { id: 'complete_minigame', title: 'Game On', description: 'Complete any mini-game', emoji: '🎮', target: 1, rewardType: 'random', rewardAmount: 0, rewardLabel: 'Random Prize' },
]

// ─── GAME PROGRESSION ─────────────────────────────────────────────────────────

/** XP needed to reach next level: 100 × 1.5^(level-1) */
export function xpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

/** Cost to level up a business: 100 × 1.15^level */
export function levelUpCost(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level))
}

/** Maximum offline earnings duration: 8 hours */
export const MAX_OFFLINE_SECONDS = 8 * 3600

/** Auto-save interval in milliseconds */
export const AUTO_SAVE_INTERVAL_MS = 10_000

/** Client-side income tick interval in milliseconds */
export const INCOME_TICK_MS = 100

/** KV leaderboard TTL in seconds */
export const LEADERBOARD_TTL_SECONDS = 300

/** Fortune wheel reward tiers */
export const WHEEL_REWARDS = [
  { label: '$10K', amount: 10_000, weight: 30 },
  { label: '$50K', amount: 50_000, weight: 25 },
  { label: '$100K', amount: 100_000, weight: 20 },
  { label: '$500K', amount: 500_000, weight: 12 },
  { label: '$1M', amount: 1_000_000, weight: 7 },
  { label: '2× Boost (1h)', amount: 0, weight: 4 },
  { label: '$5M', amount: 5_000_000, weight: 1.5 },
  { label: '$10M JACKPOT!', amount: 10_000_000, weight: 0.5 },
]
