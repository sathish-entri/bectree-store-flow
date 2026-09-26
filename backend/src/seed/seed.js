const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');

dotenv.config();

const productsData = [
  // ==================== ELECTRONICS (6 Products) ====================
  {
    name: 'AeroWave Pro Wireless Headphones',
    slug: 'aerowave-pro-wireless-headphones',
    category: 'Electronics',
    description: 'High-fidelity active noise-cancelling wireless headphones with 40-hour battery life, ultra-plush memory foam earcups, and spatial audio support.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-ELEC-01-STD-BLK', size: 'Standard', colour: 'Midnight Black', price: 199.99, stock: 25 },
      { sku: 'SF-ELEC-01-STD-SLV', size: 'Standard', colour: 'Starlight Silver', price: 199.99, stock: 1 }, // Edge-case: stock = 1
      { sku: 'SF-ELEC-01-STD-BLU', size: 'Standard', colour: 'Cobalt Blue', price: 219.99, stock: 0 }     // Edge-case: stock = 0
    ]
  },
  {
    name: 'KeyCraft K8 Mechanical Keyboard',
    slug: 'keycraft-k8-mechanical-keyboard',
    category: 'Electronics',
    description: 'Custom hot-swappable mechanical keyboard featuring CNC aluminum chassis, pre-lubed switches, PBT double-shot keycaps, and south-facing RGB.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-ELEC-02-TKL-RED', size: 'Tenkeyless', colour: 'Linear Red', price: 129.99, stock: 15 },
      { sku: 'SF-ELEC-02-TKL-BRN', size: 'Tenkeyless', colour: 'Tactile Brown', price: 129.99, stock: 10 },
      { sku: 'SF-ELEC-02-65P-BLU', size: '65%', colour: 'Clicky Blue', price: 119.99, stock: 4 }
    ]
  },
  {
    name: 'PulseFlow Smart Fitness Watch',
    slug: 'pulseflow-smart-fitness-watch',
    category: 'Electronics',
    description: 'Precision AMOLED smartwatch tracking ECG, SpO2, HRV, sleep cycles, and 120+ sport modes with 7-day battery life and titanium bezel.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-ELEC-03-40M-BLK', size: '40mm', colour: 'Space Black', price: 249.99, stock: 8 },
      { sku: 'SF-ELEC-03-44M-SLV', size: '44mm', colour: 'Brushed Silver', price: 279.99, stock: 1 }, // Edge-case: stock = 1
      { sku: 'SF-ELEC-03-44M-GLD', size: '44mm', colour: 'Rose Gold', price: 279.99, stock: 0 }     // Edge-case: stock = 0
    ]
  },
  {
    name: 'VortexBeam 4K Ultra Webcam',
    slug: 'vortexbeam-4k-ultra-webcam',
    category: 'Electronics',
    description: 'Studio-grade 4K UHD streaming webcam with dual AI noise-cancelling mics, HDR auto light correction, and integrated magnetic privacy shutter.',
    images: [
      'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-ELEC-04-STD-BLK', size: 'Standard', colour: 'Carbon Black', price: 89.99, stock: 20 },
      { sku: 'SF-ELEC-04-STD-WHT', size: 'Standard', colour: 'Arctic White', price: 94.99, stock: 5 }
    ]
  },
  {
    name: 'NovaCharge 100W GaN Fast Charger',
    slug: 'novacharge-100w-gan-fast-charger',
    category: 'Electronics',
    description: 'Compact 4-port Gallium Nitride wall charger with 3x USB-C Power Delivery and 1x USB-A QC4+ ports to charge laptops, tablets, and phones simultaneously.',
    images: [
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-ELEC-05-STD-WHT', size: 'Standard', colour: 'Glossy White', price: 49.99, stock: 50 },
      { sku: 'SF-ELEC-05-STD-BLK', size: 'Standard', colour: 'Matte Black', price: 49.99, stock: 35 }
    ]
  },
  {
    name: 'SoundSphere 360 Bluetooth Speaker',
    slug: 'soundsphere-360-bluetooth-speaker',
    category: 'Electronics',
    description: 'IPX7 waterproof portable speaker with true 360-degree acoustic dispersion, deep resonant bass radiator, and 24-hour continuous playtime.',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-ELEC-06-STD-CHR', size: 'Standard', colour: 'Charcoal', price: 79.99, stock: 18 },
      { sku: 'SF-ELEC-06-STD-OLV', size: 'Standard', colour: 'Forest Green', price: 79.99, stock: 7 },
      { sku: 'SF-ELEC-06-STD-ORG', size: 'Standard', colour: 'Sunset Orange', price: 84.99, stock: 1 } // Edge-case: stock = 1
    ]
  },

  // ==================== APPAREL (6 Products) ====================
  {
    name: 'CloudKnit Heavyweight Hoodie',
    slug: 'cloudknit-heavyweight-hoodie',
    category: 'Apparel',
    description: '450 GSM French terry cotton fleece hoodie tailored in a modern boxy silhouette with double-layered hood and ribbed side gussets.',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-APPR-01-S-OAT', size: 'S', colour: 'Oatmeal Heather', price: 85.00, stock: 12 },
      { sku: 'SF-APPR-01-M-OAT', size: 'M', colour: 'Oatmeal Heather', price: 85.00, stock: 20 },
      { sku: 'SF-APPR-01-L-BLK', size: 'L', colour: 'Washed Black', price: 85.00, stock: 1 },  // Edge-case: stock = 1
      { sku: 'SF-APPR-01-XL-BLK', size: 'XL', colour: 'Washed Black', price: 89.00, stock: 0 }  // Edge-case: stock = 0
    ]
  },
  {
    name: 'AeroTech Waterproof Commuter Jacket',
    slug: 'aerotech-waterproof-commuter-jacket',
    category: 'Apparel',
    description: '3-layer bonded breathable shell jacket engineered with taped seams, YKK AquaGuard zippers, reflective accents, and packable storm hood.',
    images: [
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-APPR-02-M-SLT', size: 'M', colour: 'Slate Grey', price: 165.00, stock: 10 },
      { sku: 'SF-APPR-02-L-SLT', size: 'L', colour: 'Slate Grey', price: 165.00, stock: 6 },
      { sku: 'SF-APPR-02-M-OLV', size: 'M', colour: 'Army Olive', price: 170.00, stock: 3 }
    ]
  },
  {
    name: 'Raw Selvedge Denim Jeans',
    slug: 'raw-selvedge-denim-jeans',
    category: 'Apparel',
    description: '14.5 oz Japanese selvedge denim in a clean slim-tapered cut with custom copper hardware, chain-stitched hems, and genuine leather patch.',
    images: [
      'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-APPR-03-30-IND', size: '30W', colour: 'Indigo Raw', price: 140.00, stock: 8 },
      { sku: 'SF-APPR-03-32-IND', size: '32W', colour: 'Indigo Raw', price: 140.00, stock: 15 },
      { sku: 'SF-APPR-03-34-IND', size: '34W', colour: 'Indigo Raw', price: 140.00, stock: 1 } // Edge-case: stock = 1
    ]
  },
  {
    name: 'Supima Cotton Essential Crewneck Tee',
    slug: 'supima-cotton-essential-crewneck-tee',
    category: 'Apparel',
    description: '100% American extra-long staple Supima cotton t-shirt with ultra-soft hand feel, reinforced collar, and anti-shrink pre-wash treatment.',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-APPR-04-S-WHT', size: 'S', colour: 'Optic White', price: 32.00, stock: 40 },
      { sku: 'SF-APPR-04-M-WHT', size: 'M', colour: 'Optic White', price: 32.00, stock: 45 },
      { sku: 'SF-APPR-04-L-BLK', size: 'L', colour: 'Jet Black', price: 32.00, stock: 30 }
    ]
  },
  {
    name: 'Merino Wool Performance Baselayer',
    slug: 'merino-wool-performance-baselayer',
    category: 'Apparel',
    description: '100% 200 GSM Australian Merino wool long sleeve offering natural thermoregulation, moisture wicking, and odor resistance for active pursuits.',
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-APPR-05-M-NVY', size: 'M', colour: 'Deep Navy', price: 95.00, stock: 14 },
      { sku: 'SF-APPR-05-L-NVY', size: 'L', colour: 'Deep Navy', price: 95.00, stock: 0 },  // Edge-case: stock = 0
      { sku: 'SF-APPR-05-L-CHR', size: 'L', colour: 'Charcoal', price: 95.00, stock: 9 }
    ]
  },
  {
    name: 'FlexFit Technical Cargo Pants',
    slug: 'flexfit-technical-cargo-pants',
    category: 'Apparel',
    description: 'Four-way stretch water-repellent ripstop trousers with articulated knee darts, magnetic cargo pockets, and adjustable cinch cuffs.',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-APPR-06-30-KHK', size: '30W', colour: 'Desert Khaki', price: 110.00, stock: 7 },
      { sku: 'SF-APPR-06-32-BLK', size: '32W', colour: 'Matte Black', price: 110.00, stock: 12 },
      { sku: 'SF-APPR-06-34-BLK', size: '34W', colour: 'Matte Black', price: 110.00, stock: 1 } // Edge-case: stock = 1
    ]
  },

  // ==================== FOOTWEAR (6 Products) ====================
  {
    name: 'HyperStrider Carbon Marathon Runner',
    slug: 'hyperstrider-carbon-marathon-runner',
    category: 'Footwear',
    description: 'Elite road racing shoes featuring full-length curved carbon fiber propulsion plate, supercritical PEBA foam, and monomesh breathable upper.',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-FOOT-01-US9-RED', size: 'US 9', colour: 'Solar Crimson', price: 220.00, stock: 10 },
      { sku: 'SF-FOOT-01-US10-RED', size: 'US 10', colour: 'Solar Crimson', price: 220.00, stock: 1 },  // Edge-case: stock = 1
      { sku: 'SF-FOOT-01-US11-WHT', size: 'US 11', colour: 'Pure White', price: 220.00, stock: 0 }     // Edge-case: stock = 0
    ]
  },
  {
    name: 'Verona Handcrafted Leather Loafers',
    slug: 'verona-handcrafted-leather-loafers',
    category: 'Footwear',
    description: 'Artisanal Italian calfskin leather penny loafers constructed with Blake-stitch welt, cushioned leather insole, and stacked leather heel.',
    images: [
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-FOOT-02-US9-COGN', size: 'US 9', colour: 'Antique Cognac', price: 195.00, stock: 8 },
      { sku: 'SF-FOOT-02-US10-COGN', size: 'US 10', colour: 'Antique Cognac', price: 195.00, stock: 5 },
      { sku: 'SF-FOOT-02-US10-BLK', size: 'US 10', colour: 'Obsidian Black', price: 195.00, stock: 7 }
    ]
  },
  {
    name: 'TrailShield Vibram Waterproof Boot',
    slug: 'trailshield-vibram-waterproof-boot',
    category: 'Footwear',
    description: 'Rugged all-weather hiking boots featuring waterproof nubuck leather, eVent breathable membrane, and ultra-grippy Vibram Megagrip lug outsole.',
    images: [
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-FOOT-03-US9-BRN', size: 'US 9', colour: 'Timber Brown', price: 180.00, stock: 12 },
      { sku: 'SF-FOOT-03-US10-BRN', size: 'US 10', colour: 'Timber Brown', price: 180.00, stock: 15 },
      { sku: 'SF-FOOT-03-US11-BLK', size: 'US 11', colour: 'Black Canyon', price: 180.00, stock: 1 } // Edge-case: stock = 1
    ]
  },
  {
    name: 'UrbanKicks Retro Suede Sneaker',
    slug: 'urbankicks-retro-suede-sneaker',
    category: 'Footwear',
    description: 'Vintage 1980s low-top silhouette crafted with premium hairy suede overlays, gum rubber outsole, and molded EVA footbed for daily comfort.',
    images: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-FOOT-04-US8-GRY', size: 'US 8', colour: 'Concrete Grey', price: 105.00, stock: 18 },
      { sku: 'SF-FOOT-04-US9-GRY', size: 'US 9', colour: 'Concrete Grey', price: 105.00, stock: 22 },
      { sku: 'SF-FOOT-04-US10-GRN', size: 'US 10', colour: 'Vintage Forest', price: 110.00, stock: 6 }
    ]
  },
  {
    name: 'CloudSlide Recovery Sandal',
    slug: 'cloudslide-recovery-sandal',
    category: 'Footwear',
    description: 'Therapeutic post-workout slides made from proprietary dual-density closed-cell foam that absorbs 37% more impact than standard EVA.',
    images: [
      'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-FOOT-05-US9-SND', size: 'US 9', colour: 'Sand Dune', price: 48.00, stock: 25 },
      { sku: 'SF-FOOT-05-US10-SND', size: 'US 10', colour: 'Sand Dune', price: 48.00, stock: 30 },
      { sku: 'SF-FOOT-05-US11-BLK', size: 'US 11', colour: 'Pitch Black', price: 48.00, stock: 0 } // Edge-case: stock = 0
    ]
  },
  {
    name: 'Chelsea Lug-Sole Leather Boot',
    slug: 'chelsea-lug-sole-leather-boot',
    category: 'Footwear',
    description: 'Modern pull-on Chelsea boots built with water-resistant full-grain leather, heavy-duty elastic side gores, and chunky shock-absorbing lug sole.',
    images: [
      'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-FOOT-06-US9-BLK', size: 'US 9', colour: 'Glossy Black', price: 165.00, stock: 11 },
      { sku: 'SF-FOOT-06-US10-BLK', size: 'US 10', colour: 'Glossy Black', price: 165.00, stock: 9 },
      { sku: 'SF-FOOT-06-US11-WAL', size: 'US 11', colour: 'Dark Walnut', price: 170.00, stock: 4 }
    ]
  },

  // ==================== ACCESSORIES (6 Products) ====================
  {
    name: 'Vanguard Cordura Everyday Backpack 24L',
    slug: 'vanguard-cordura-everyday-backpack-24l',
    category: 'Accessories',
    description: 'Weatherproof 500D Cordura daypack with dedicated 16-inch padded laptop sleeve, magnetic Fidlock quick-release buckles, and hidden passport pocket.',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-ACCS-01-24L-BLK', size: '24 Liters', colour: 'Stealth Black', price: 135.00, stock: 14 },
      { sku: 'SF-ACCS-01-24L-GRY', size: '24 Liters', colour: 'Heather Graphite', price: 135.00, stock: 1 }, // Edge-case: stock = 1
      { sku: 'SF-ACCS-01-24L-COY', size: '24 Liters', colour: 'Coyote Tan', price: 145.00, stock: 0 }       // Edge-case: stock = 0
    ]
  },
  {
    name: 'Apex Bifold RFID Leather Wallet',
    slug: 'apex-bifold-rfid-leather-wallet',
    category: 'Accessories',
    description: 'Slimline vegetable-tanned Italian leather wallet with electromagnetic RFID shielding, 8 quick-access card slots, and pull-tab cash sleeve.',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-ACCS-02-STD-BRN', size: 'Standard', colour: 'Bourbon Brown', price: 45.00, stock: 35 },
      { sku: 'SF-ACCS-02-STD-BLK', size: 'Standard', colour: 'Matte Black', price: 45.00, stock: 28 }
    ]
  },
  {
    name: 'Aviator Classic Polarized Sunglasses',
    slug: 'aviator-classic-polarized-sunglasses',
    category: 'Accessories',
    description: 'Timeless teardrop aviators with lightweight titanium frames, UV400 anti-reflective polarized crystal lenses, and adjustable silicone nose pads.',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-ACCS-03-MED-GLD', size: 'Medium 58mm', colour: 'Gold / G15 Green', price: 155.00, stock: 16 },
      { sku: 'SF-ACCS-03-LRG-BLK', size: 'Large 62mm', colour: 'Gunmetal / Polarized Grey', price: 165.00, stock: 6 },
      { sku: 'SF-ACCS-03-MED-SLV', size: 'Medium 58mm', colour: 'Silver / Cobalt Mirror', price: 165.00, stock: 1 } // Edge-case: stock = 1
    ]
  },
  {
    name: 'Heritage Canvas Duffel Bag 45L',
    slug: 'heritage-canvas-duffel-bag-45l',
    category: 'Accessories',
    description: 'Heavy 18 oz waxed canvas weekend bag reinforced with full-grain bridle leather handles, solid brass hardware, and waterproof boot compartment.',
    images: [
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-ACCS-04-45L-OLV', size: '45 Liters', colour: 'Field Olive', price: 145.00, stock: 10 },
      { sku: 'SF-ACCS-04-45L-NVY', size: '45 Liters', colour: 'Naval Navy', price: 145.00, stock: 8 }
    ]
  },
  {
    name: 'Minimalist Automatic Chrono Watch',
    slug: 'minimalist-automatic-chrono-watch',
    category: 'Accessories',
    description: 'Bauhaus-inspired mechanical watch equipped with Seiko NH35 automatic movement, sapphire crystal with anti-scratch coating, and Horween strap.',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-ACCS-05-40M-WHT', size: '40mm', colour: 'White Dial / Tan Leather', price: 295.00, stock: 5 },
      { sku: 'SF-ACCS-05-40M-BLK', size: '40mm', colour: 'Black Dial / Mesh Steel', price: 310.00, stock: 1 } // Edge-case: stock = 1
    ]
  },
  {
    name: 'Thermal insulated Stainless Tumbler 750ml',
    slug: 'thermal-insulated-stainless-tumbler-750ml',
    category: 'Accessories',
    description: 'Double-wall vacuum-sealed 18/8 kitchen-grade stainless steel bottle keeping beverages iced for 24 hours or piping hot for 12 hours.',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-ACCS-06-750-MAT', size: '750ml', colour: 'Matte Obsidian', price: 34.99, stock: 40 },
      { sku: 'SF-ACCS-06-750-WHT', size: '750ml', colour: 'Powder Frost White', price: 34.99, stock: 22 },
      { sku: 'SF-ACCS-06-750-TER', size: '750ml', colour: 'Warm Terracotta', price: 34.99, stock: 0 } // Edge-case: stock = 0
    ]
  },

  // ==================== HOME & LIVING (6 Products) ====================
  {
    name: 'ErgoMax Dual-Motor Standing Desk',
    slug: 'ergomax-dual-motor-standing-desk',
    category: 'Home & Living',
    description: 'Heavy-duty electric sit-stand desk frame with solid walnut top, 4 programmable digital memory presets, anti-collision sensor, and cable tray.',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-HOME-01-55I-WAL', size: '55 x 28 in', colour: 'Solid Walnut / Black Frame', price: 489.00, stock: 6 },
      { sku: 'SF-HOME-01-60I-WAL', size: '60 x 30 in', colour: 'Solid Walnut / Black Frame', price: 539.00, stock: 3 },
      { sku: 'SF-HOME-01-60I-OAK', size: '60 x 30 in', colour: 'Natural Oak / White Frame', price: 539.00, stock: 1 } // Edge-case: stock = 1
    ]
  },
  {
    name: 'Lumina Smart Ambient Desk Lamp',
    slug: 'lumina-smart-ambient-desk-lamp',
    category: 'Home & Living',
    description: 'Architectural aluminum LED balance lamp with stepless dimming, 2700K-6500K color temperature range, ambient back-light, and wireless charger base.',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-HOME-02-STD-SLV', size: 'Standard', colour: 'Anodized Silver', price: 89.00, stock: 15 },
      { sku: 'SF-HOME-02-STD-BLK', size: 'Standard', colour: 'Matte Black', price: 89.00, stock: 20 },
      { sku: 'SF-HOME-02-STD-BRS', size: 'Standard', colour: 'Brushed Brass', price: 99.00, stock: 0 } // Edge-case: stock = 0
    ]
  },
  {
    name: 'Artisan Ceramic Pour-Over Dripper Set',
    slug: 'artisan-ceramic-pour-over-dripper-set',
    category: 'Home & Living',
    description: 'Hand-thrown stoneware coffee dripper with spiral interior ribs for optimal extraction, accompanied by a 600ml borosilicate glass decanter.',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-HOME-03-600-WHT', size: '600ml', colour: 'Speckled White', price: 42.00, stock: 18 },
      { sku: 'SF-HOME-03-600-CLY', size: '600ml', colour: 'Terracotta Clay', price: 42.00, stock: 14 }
    ]
  },
  {
    name: 'AromaZen Ultrasonic Essential Oil Diffuser',
    slug: 'aromazen-ultrasonic-essential-oil-diffuser',
    category: 'Home & Living',
    description: 'Handcrafted ceramic ultrasonic mist diffuser covering 500 sq ft with whisper-quiet operation, ambient LED halo, and auto-shutoff timer.',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-HOME-04-180-STN', size: '180ml', colour: 'Stone Grey', price: 56.00, stock: 22 },
      { sku: 'SF-HOME-04-180-WHT', size: '180ml', colour: 'Porcelain White', price: 56.00, stock: 1 } // Edge-case: stock = 1
    ]
  },
  {
    name: 'Nordic Merino Wool Woven Throw Blanket',
    slug: 'nordic-merino-wool-woven-throw-blanket',
    category: 'Home & Living',
    description: 'Ultra-soft woven herringbone throw blanket crafted from 100% fine New Zealand lambswool with traditional fringed edges (130 x 180 cm).',
    images: [
      'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-HOME-05-STD-OAT', size: '130x180cm', colour: 'Oatmeal Herringbone', price: 98.00, stock: 12 },
      { sku: 'SF-HOME-05-STD-SGE', size: '130x180cm', colour: 'Earthy Sage', price: 98.00, stock: 9 },
      { sku: 'SF-HOME-05-STD-CHR', size: '130x180cm', colour: 'Smoky Charcoal', price: 98.00, stock: 0 } // Edge-case: stock = 0
    ]
  },
  {
    name: 'Apex Top-Grain Leather Desk Mat',
    slug: 'apex-top-grain-leather-desk-mat',
    category: 'Home & Living',
    description: 'Premium vegetable-tanned leather executive desk pad with natural suede underside, water-resistant top finish, and integrated magnetic cable anchor.',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'
    ],
    variants: [
      { sku: 'SF-HOME-06-MED-BRN', size: '31 x 15 in', colour: 'Chestnut Brown', price: 68.00, stock: 25 },
      { sku: 'SF-HOME-06-LRG-BLK', size: '36 x 18 in', colour: 'Midnight Black', price: 78.00, stock: 16 },
      { sku: 'SF-HOME-06-LRG-TAN', size: '36 x 18 in', colour: 'Natural Tan', price: 78.00, stock: 1 } // Edge-case: stock = 1
    ]
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Seeding process started...');

    // Clear existing collections
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing Product and User collections.');

    // Seed Demo User through User.create so bcrypt pre-save hook executes
    const demoUser = await User.create({
      name: 'StoreFlow Demo User',
      email: 'demo@storeflow.com',
      password: 'password123'
    });
    console.log(`Demo User created: ${demoUser.email} (password: password123, hashed in DB)`);

    // Verify all SKUs across the dataset are strictly unique before inserting
    const allSkus = [];
    for (const prod of productsData) {
      for (const v of prod.variants) {
        if (allSkus.includes(v.sku)) {
          throw new Error(`Duplicate SKU detected in seed data: ${v.sku}`);
        }
        allSkus.push(v.sku);
      }
    }
    console.log(`Verified ${allSkus.length} unique variant SKUs across ${productsData.length} products.`);

    // Insert Products
    const createdProducts = await Product.create(productsData);
    console.log(`Successfully seeded ${createdProducts.length} products into MongoDB!`);

    console.log('\n--- Seeding Summary ---');
    console.log(`Total Products: ${createdProducts.length}`);
    console.log(`Total Variants: ${allSkus.length}`);
    console.log(`Categories: ${[...new Set(productsData.map(p => p.category))].join(', ')}`);

    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
