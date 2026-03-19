/**
 * seo_images.js
 * – Assigns product-relevant Unsplash images per product type (granular)
 * – Rewrites short_description + tags with proper SEO keywords
 * Run: node seo_images.js
 */

const db = require("./db");

// ═══════════════════════════════════════════════════════════════════
//  CURATED UNSPLASH PHOTO POOLS (permanent CDN IDs, product-matched)
// ═══════════════════════════════════════════════════════════════════
const POOLS = {
  // ── RACK SERVERS ──────────────────────────────────────────────
  rack_server: [
    "photo-1558494949-ef010cbdcc31", // server rack with ethernet
    "photo-1629654297299-c8506221ca97", // data-center server row
    "photo-1544197150-b99a580bb7a8", // blue-lit data center aisle
    "photo-1600267185393-e158a98703de", // rack units close-up
    "photo-1451187580459-43490279c0fa", // data center overhead
    "photo-1484557985045-edf25e08da73", // server/networking room
  ],

  // ── TOWER SERVERS ─────────────────────────────────────────────
  tower_server: [
    "photo-1629654297299-c8506221ca97",
    "photo-1600267185393-e158a98703de",
    "photo-1544197150-b99a580bb7a8",
    "photo-1558494949-ef010cbdcc31",
    "photo-1451187580459-43490279c0fa",
  ],

  // ── BLADE SERVERS ─────────────────────────────────────────────
  blade_server: [
    "photo-1544197150-b99a580bb7a8",
    "photo-1629654297299-c8506221ca97",
    "photo-1558494949-ef010cbdcc31",
    "photo-1600267185393-e158a98703de",
    "photo-1451187580459-43490279c0fa",
  ],

  // ── NAS / STORAGE SERVERS ─────────────────────────────────────
  nas_storage: [
    "photo-1558618666-fcd25c85cd64", // hard drive platters
    "photo-1597733336794-12d05021d510", // stacked drives
    "photo-1540829917886-91ab031b1764", // storage devices
    "photo-1629654297299-c8506221ca97",
    "photo-1544197150-b99a580bb7a8",
  ],

  // ── SAN / ENTERPRISE STORAGE ARRAYS ──────────────────────────
  san_storage: [
    "photo-1629654297299-c8506221ca97",
    "photo-1544197150-b99a580bb7a8",
    "photo-1558618666-fcd25c85cd64",
    "photo-1600267185393-e158a98703de",
    "photo-1597733336794-12d05021d510",
  ],

  // ── HARD DISK DRIVES ──────────────────────────────────────────
  hdd: [
    "photo-1558618666-fcd25c85cd64", // HDD platters
    "photo-1597733336794-12d05021d510", // drives
    "photo-1540829917886-91ab031b1764", // storage
    "photo-1518770660439-4636190af475", // circuit/electronics
    "photo-1629654297299-c8506221ca97",
  ],

  // ── SOLID STATE DRIVES ────────────────────────────────────────
  ssd: [
    "photo-1518770660439-4636190af475", // PCB/circuit close-up
    "photo-1591370874773-6702e8f12fd8", // electronic components
    "photo-1558618666-fcd25c85cd64",
    "photo-1597733336794-12d05021d510",
    "photo-1629654297299-c8506221ca97",
  ],

  // ── NETWORK SWITCHES & ROUTERS ────────────────────────────────
  switch_router: [
    "photo-1586772002130-7a5f8979ade4", // ethernet patch panel
    "photo-1558494949-ef010cbdcc31", // cables in switch
    "photo-1484557985045-edf25e08da73", // networking room
    "photo-1544197150-b99a580bb7a8",
    "photo-1451187580459-43490279c0fa",
  ],

  // ── NETWORK CARDS / HBAs / NICs ───────────────────────────────
  nic_hba: [
    "photo-1518770660439-4636190af475", // PCB/circuit
    "photo-1591370874773-6702e8f12fd8", // electronic components
    "photo-1586772002130-7a5f8979ade4", // ethernet
    "photo-1558494949-ef010cbdcc31",
    "photo-1544197150-b99a580bb7a8",
  ],

  // ── FIREWALLS / SECURITY APPLIANCES ──────────────────────────
  firewall: [
    "photo-1544197150-b99a580bb7a8",
    "photo-1484557985045-edf25e08da73",
    "photo-1586772002130-7a5f8979ade4",
    "photo-1558494949-ef010cbdcc31",
    "photo-1629654297299-c8506221ca97",
  ],

  // ── LAPTOPS ───────────────────────────────────────────────────
  laptop: [
    "photo-1496181133206-80ce9b88a853", // laptop open
    "photo-1517336714731-489689fd1ca8", // laptop sideways
    "photo-1541807084-5c52b6b3adef",    // laptop screen glow
    "photo-1484788984921-03950022c9ef", // laptop keyboard
    "photo-1525547719571-a2d4ac8945e2", // laptop on desk
  ],

  // ── WORKSTATIONS ──────────────────────────────────────────────
  workstation: [
    "photo-1593642632559-0c6d3fc62b89", // desktop with dual monitors
    "photo-1547082299-de196ea013d6",    // computer monitor setup
    "photo-1587202372775-e229f172b9d7", // workstation
    "photo-1527443224154-c4a3942d3acf", // computer desk
    "photo-1484788984921-03950022c9ef",
  ],

  // ── DESKTOPS ──────────────────────────────────────────────────
  desktop: [
    "photo-1593642632559-0c6d3fc62b89",
    "photo-1547082299-de196ea013d6",
    "photo-1527443224154-c4a3942d3acf",
    "photo-1587202372775-e229f172b9d7",
    "photo-1484788984921-03950022c9ef",
  ],

  // ── GPU / GRAPHICS CARDS ──────────────────────────────────────
  gpu: [
    "photo-1591370874773-6702e8f12fd8", // electronic components
    "photo-1518770660439-4636190af475", // PCB
    "photo-1593642632559-0c6d3fc62b89", // workstation with GPU
    "photo-1547082299-de196ea013d6",
    "photo-1629654297299-c8506221ca97",
  ],

  // ── MEMORY / RAM ──────────────────────────────────────────────
  ram: [
    "photo-1591370874773-6702e8f12fd8",
    "photo-1518770660439-4636190af475",
    "photo-1629654297299-c8506221ca97",
    "photo-1544197150-b99a580bb7a8",
    "photo-1558494949-ef010cbdcc31",
  ],

  // ── CPU / PROCESSORS ──────────────────────────────────────────
  cpu: [
    "photo-1518770660439-4636190af475", // circuit close-up
    "photo-1591370874773-6702e8f12fd8",
    "photo-1629654297299-c8506221ca97",
    "photo-1544197150-b99a580bb7a8",
    "photo-1558494949-ef010cbdcc31",
  ],

  // ── POWER SUPPLIES / UPS ──────────────────────────────────────
  ups_psu: [
    "photo-1629654297299-c8506221ca97",
    "photo-1558494949-ef010cbdcc31",
    "photo-1544197150-b99a580bb7a8",
    "photo-1518770660439-4636190af475",
    "photo-1600267185393-e158a98703de",
  ],

  // ── COOLING / FANS / HEATSINKS ────────────────────────────────
  cooling: [
    "photo-1591370874773-6702e8f12fd8",
    "photo-1518770660439-4636190af475",
    "photo-1629654297299-c8506221ca97",
    "photo-1544197150-b99a580bb7a8",
    "photo-1558494949-ef010cbdcc31",
  ],

  // ── SERVER ACCESSORIES ────────────────────────────────────────
  accessories: [
    "photo-1629654297299-c8506221ca97",
    "photo-1558494949-ef010cbdcc31",
    "photo-1518770660439-4636190af475",
    "photo-1586772002130-7a5f8979ade4",
    "photo-1544197150-b99a580bb7a8",
  ],

  // ── RENTALS (server/infra rental) ─────────────────────────────
  rental: [
    "photo-1544197150-b99a580bb7a8",
    "photo-1629654297299-c8506221ca97",
    "photo-1558494949-ef010cbdcc31",
    "photo-1600267185393-e158a98703de",
    "photo-1451187580459-43490279c0fa",
  ],

  // ── AMC / SERVICES ────────────────────────────────────────────
  services: [
    "photo-1484557985045-edf25e08da73",
    "photo-1629654297299-c8506221ca97",
    "photo-1544197150-b99a580bb7a8",
    "photo-1558494949-ef010cbdcc31",
    "photo-1600267185393-e158a98703de",
  ],

  // ── DEFAULT ───────────────────────────────────────────────────
  default: [
    "photo-1558494949-ef010cbdcc31",
    "photo-1629654297299-c8506221ca97",
    "photo-1544197150-b99a580bb7a8",
    "photo-1600267185393-e158a98703de",
    "photo-1451187580459-43490279c0fa",
  ],
};

const BASE = "https://images.unsplash.com/";
const Q = "?w=700&q=85&fit=crop";

function url(photoId) {
  return `${BASE}${photoId}${Q}`;
}

// ═══════════════════════════════════════════════════════════════════
//  DETECT PRODUCT TYPE FROM NAME + CATEGORY
// ═══════════════════════════════════════════════════════════════════
function detectPool(name, category) {
  const n = name.toLowerCase();
  const c = (category || "").toLowerCase();

  // Rentals
  if (c.includes("rental") || n.includes("rental")) return "rental";

  // AMC / Services
  if (c.includes("amc") || c.includes("services") || c.includes("repair") ||
      c.includes("management") || n.includes("service plan") || n.includes("support plan"))
    return "services";

  // Laptops
  if (c.includes("laptop") || n.includes("laptop") ||
      /latitude [0-9]/i.test(n) || /elitebook/i.test(n) || /thinkpad/i.test(n) ||
      /probook/i.test(n) || /macbook/i.test(n) || /chromebook/i.test(n) ||
      n.includes("notebook"))
    return "laptop";

  // GPU / Graphics
  if (c.includes("graphics") || n.includes("quadro") || n.includes("geforce") ||
      n.includes("radeon") || n.includes("gpu") || n.includes("graphics card") ||
      n.includes("tesla ") || n.includes("firepro") || n.includes("grid "))
    return "gpu";

  // CPU / Processors
  if (n.includes("processor") || n.includes("xeon") || n.includes("cpu") ||
      n.includes("opteron") || /intel e[35]-/i.test(n) || /amd epyc/i.test(n))
    return "cpu";

  // RAM / Memory
  if (n.includes("ram") || n.includes("memory") || n.includes("dimm") ||
      n.includes("rdimm") || n.includes("lrdimm") || n.includes("ddr") ||
      c.includes("memory"))
    return "ram";

  // SSD
  if (n.includes("ssd") || n.includes("solid state") || n.includes("flash") ||
      n.includes("nvme") || n.includes("pcie ssd") || c.includes("solid state"))
    return "ssd";

  // HDD / Hard drives
  if (n.includes("hard drive") || n.includes("hdd") || n.includes("sas drive") ||
      n.includes("sata drive") || /\d+tb/i.test(n) || /\d+gb.*sas/i.test(n) ||
      c.includes("hard disk"))
    return "hdd";

  // NIC / HBA / Network cards
  if (n.includes("ethernet adapter") || n.includes("nic ") || n.includes("hba") ||
      n.includes("network adapter") || n.includes("network card") ||
      n.includes("fiber channel") || n.includes("fibre channel") ||
      n.includes("converged network") || c.includes("network cards"))
    return "nic_hba";

  // Firewall / Security appliances
  if (n.includes("firewall") || n.includes("asa ") || n.includes("fortigate") ||
      n.includes("palo alto") || n.includes("juniper srx") || n.includes("sonicwall"))
    return "firewall";

  // Switches / Routers
  if (n.includes("switch") || n.includes("router") || n.includes("catalyst ") ||
      n.includes("nexus ") || n.includes("procurve") || n.includes("aruba") ||
      n.includes("juniper ex") || n.includes("extreme") || c.includes("switch") ||
      c.includes("router"))
    return "switch_router";

  // Cooling
  if (n.includes("fan") || n.includes("heatsink") || n.includes("heat sink") ||
      n.includes("cooling") || n.includes("cooler") || c.includes("cooling"))
    return "cooling";

  // Power supplies / UPS
  if (n.includes("power supply") || n.includes("psu") || n.includes("ups") ||
      n.includes("apc ") || n.includes("eaton") || n.includes("liebert") ||
      n.includes("power unit") || c.includes("power supplies") || c.includes("ups"))
    return "ups_psu";

  // Server accessories
  if (n.includes("rail kit") || n.includes("rack rail") || n.includes("bezel") ||
      n.includes("caddy") || n.includes("tray") || n.includes("cable arm") ||
      n.includes("kvm") || n.includes("server accessory") || c.includes("server accessories"))
    return "accessories";

  // NAS / Network Attached Storage
  if (c.includes("nas") || n.includes("nas ") || n.includes("synology") ||
      n.includes("qnap") || n.includes("netapp") || n.includes("readynas"))
    return "nas_storage";

  // SAN / Storage arrays
  if (c.includes("san") || n.includes("san ") || n.includes("3par") ||
      n.includes("equallogic") || n.includes("md1") || n.includes("msa ") ||
      n.includes("eva ") || n.includes("ds4") || n.includes("storage array") ||
      c.includes("das") || n.includes("storage server"))
    return "san_storage";

  // Blade servers
  if (n.includes("blade") || c.includes("blade") || n.includes("bx") ||
      n.includes("c-class") || n.includes("ucs blade"))
    return "blade_server";

  // Tower servers
  if (n.includes("tower") || n.includes("ml350") || n.includes("ml110") ||
      n.includes("ml10") || /dl\d{2}[^0-9]/i.test(n) === false && n.includes("ml") ||
      n.includes("poweredge t") || n.includes("proliant t") || c.includes("tower server"))
    return "tower_server";

  // Workstations
  if (c.includes("workstation") || n.includes("workstation") ||
      n.includes("precision ") || n.includes("z2") || n.includes("z4") ||
      n.includes("z6") || n.includes("z8") || n.includes("z240") ||
      n.includes("z440") || n.includes("z640") || n.includes("z840") ||
      n.includes("thinkstation"))
    return "workstation";

  // Desktops
  if (c.includes("desktop") || n.includes("desktop") || n.includes("optiplex") ||
      n.includes("compaq") || n.includes("prodesk") || n.includes("elitedesk"))
    return "desktop";

  // Rack servers (default for server category)
  if (c.includes("server") || n.includes("server") || n.includes("proliant") ||
      n.includes("poweredge") || n.includes("system x") || n.includes("thinksystem") ||
      n.includes("supermicro") || n.includes("cisco ucs"))
    return "rack_server";

  return "default";
}

// ═══════════════════════════════════════════════════════════════════
//  DETERMINISTIC IMAGE PICK (Knuth hash — same product = same image)
// ═══════════════════════════════════════════════════════════════════
function pick(pool, id, offset = 0) {
  const h = Math.abs(((id * 2654435761) + offset * 1000003) >>> 0);
  return url(pool[h % pool.length]);
}

function buildExtras(pool, id, mainUrl) {
  const used = new Set([mainUrl]);
  const extras = [];
  for (let o = 1; extras.length < 4; o++) {
    const u = pick(pool, id, o);
    if (!used.has(u)) { used.add(u); extras.push(u); }
    if (o > 60) break;
  }
  return extras;
}

// ═══════════════════════════════════════════════════════════════════
//  SEO SHORT DESCRIPTION GENERATOR
// ═══════════════════════════════════════════════════════════════════
function seoDescription(name, category, poolKey) {
  const cat = (category || "").toLowerCase();
  const brandMatch = name.match(/^(HP|Dell|Cisco|IBM|Lenovo|Supermicro|Fujitsu|Sun|Oracle|Huawei|Juniper|Aruba|Extreme|Brocade|NetApp|EMC|Hitachi|Seagate|Western Digital|WD|Toshiba|Intel|AMD|NVIDIA|APC|Eaton|Synology|QNAP|Avocent|Belkin|Tripp Lite)/i);
  const brand = brandMatch ? brandMatch[0] : "";

  // Extract model hint from name (first 3 tokens after brand)
  const tokens = name.replace(/^(HP|Dell|Cisco|IBM|Lenovo|Supermicro|Fujitsu)\s+/i, "").split(/\s+/);
  const modelHint = tokens.slice(0, 3).join(" ");

  switch (poolKey) {
    case "rack_server":
      return `${name} – Certified Refurbished Rack Server available in India. Enterprise-grade ${brand || "server"} rack unit ideal for data centers, cloud workloads, and virtualization. Tested, cleaned, and backed by warranty. Best refurbished server price in India with pan-India delivery.`;

    case "tower_server":
      return `${name} – Refurbished Tower Server for SMBs and enterprises. ${brand ? brand + " certified" : "Fully tested"} tower server offering reliable compute power for file serving, ERP, and business applications. Cost-effective, warranty-covered, shipped across India.`;

    case "blade_server":
      return `${name} – Refurbished Blade Server module for high-density computing. Ideal for data-center consolidation and virtualization workloads. ${brand ? brand + " grade" : "Enterprise"} blade tested to OEM standards. Buy refurbished blade servers online in India at Serverwale.`;

    case "nas_storage":
      return `${name} – Refurbished NAS Storage solution for enterprise file storage and backup. Scalable, high-availability network-attached storage at a fraction of new cost. ${brand ? brand + " certified" : "Fully tested"} with warranty. Buy NAS storage online India.`;

    case "san_storage":
      return `${name} – Refurbished SAN / Enterprise Storage Array for mission-critical data workloads. ${brand || "Enterprise"} storage offering high IOPS and scalable capacity. Serverwale-tested with warranty. Best SAN storage price in India.`;

    case "hdd":
      return `${name} – Refurbished Enterprise Hard Disk Drive (HDD) for servers and workstations. ${brand || "Enterprise"}-grade SAS / SATA drive, tested for performance and reliability. Affordable server HDD price in India with fast shipping.`;

    case "ssd":
      return `${name} – Refurbished Enterprise Solid State Drive (SSD) for ultra-fast server storage. ${brand || "High-performance"} NVMe / SAS SSD tested for endurance and speed. Best refurbished SSD price in India at Serverwale.`;

    case "switch_router":
      return `${name} – Refurbished Network Switch / Router for enterprise LAN and data-center networking. ${brand || "Enterprise"} managed switch offering high-speed port aggregation and VLAN support. Buy certified refurbished networking equipment in India.`;

    case "nic_hba":
      return `${name} – Refurbished Server Network Adapter / HBA for high-speed data center connectivity. ${brand || "Enterprise"} 1GbE / 10GbE / 25GbE NIC ideal for server upgrades. Tested and certified. Buy server network cards online in India.`;

    case "firewall":
      return `${name} – Refurbished Enterprise Firewall / Security Appliance for network perimeter protection. ${brand || "Enterprise"}-grade firewall with IPS/IDS capabilities. Cost-effective network security solution with warranty. Buy refurbished firewalls in India.`;

    case "laptop":
      return `${name} – Certified Refurbished Business Laptop for professionals. ${brand || "Enterprise"}-grade laptop with fast processor, ample RAM, and reliable build quality. Ideal for remote work, office use, and enterprise deployments. Buy refurbished laptops in India at best price.`;

    case "workstation":
      return `${name} – Refurbished Professional Workstation for CAD, 3D rendering, video editing, and engineering workloads. ${brand || "Enterprise"} workstation with powerful CPU and expandable RAM. Serverwale-certified with warranty. Buy workstations online India.`;

    case "desktop":
      return `${name} – Certified Refurbished Desktop PC for office and business use. ${brand || "Enterprise"}-grade desktop with reliable performance for everyday computing, ERP, and enterprise applications. Best refurbished PC price in India.`;

    case "gpu":
      return `${name} – Refurbished Professional GPU / Graphics Card for workstations and servers. ${brand || "High-performance"} graphics card for AI/ML inference, 3D rendering, CAD, and compute-intensive workloads. Buy refurbished GPUs in India at Serverwale.`;

    case "cpu":
      return `${name} – Refurbished Server Processor / CPU for enterprise servers and workstations. ${brand || "Enterprise"}-grade multi-core processor offering high compute density. Tested, certified, and ready to deploy. Buy server CPUs in India.`;

    case "ram":
      return `${name} – Refurbished Server RAM / Memory Module (ECC / Registered DIMM) for enterprise servers. Tested for compatibility and stability. ${brand || "Enterprise"}-grade server memory at the best price in India. Upgrade your server with certified RAM.`;

    case "cooling":
      return `${name} – Refurbished Server Cooling Fan / Heatsink for enterprise servers. Genuine ${brand || "OEM"} cooling component ensuring optimal thermal management. Serverwale-tested replacement part with warranty. Buy server cooling parts in India.`;

    case "ups_psu":
      return `${name} – Refurbished UPS / Power Supply for servers and enterprise infrastructure. Reliable ${brand || "enterprise-grade"} power protection and conditioning to prevent downtime. Certified and tested. Buy refurbished UPS and server PSUs in India.`;

    case "accessories":
      return `${name} – Genuine ${brand || "OEM"} Server Accessory / Spare Part for enterprise servers. Serverwale-tested component ensuring compatibility and performance. Cost-effective server accessory with warranty. Buy server spare parts online in India.`;

    case "rental":
      return `${name} – Server Rental / IT Infrastructure Rental service by Serverwale. Flexible short-term and long-term server rental plans for startups, enterprises, and project-based deployments. Managed servers available pan-India. Contact us for server rental pricing.`;

    case "services":
      return `${name} – Professional IT Support and Server Maintenance service by Serverwale. Comprehensive AMC, repair, and management services for HP, Dell, IBM, Cisco servers and enterprise IT infrastructure across India.`;

    default:
      return `${name} – Certified Refurbished Enterprise IT Hardware available at Serverwale. Fully tested, cleaned, and backed by warranty. Pan-India delivery with expert support. Best refurbished IT hardware price in India.`;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  SEO TAG GENERATOR
// ═══════════════════════════════════════════════════════════════════
function seoTags(name, category, poolKey) {
  const brandMatch = name.match(/^(HP|Dell|Cisco|IBM|Lenovo|Supermicro|Fujitsu|Sun|Oracle|Huawei|Juniper|Aruba|Extreme|Brocade|NetApp|EMC|Hitachi|Seagate|Western Digital|WD|Toshiba|Intel|AMD|NVIDIA|APC|Eaton|Synology|QNAP)/i);
  const brand = brandMatch ? brandMatch[0] : null;

  // Extract model number from name
  const modelMatch = name.match(/([A-Z]{1,6}[-\s]?\d{2,6}[A-Z0-9\-]*)(?:\s|$)/i);
  const model = modelMatch ? modelMatch[0].trim() : null;

  const base = ["Refurbished", "India", "Buy Online", "Best Price India", "Serverwale"];
  if (brand) base.push(`${brand}`, `Refurbished ${brand}`);
  if (model) base.push(model);

  const typeMap = {
    rack_server:   ["Rack Server", "1U 2U Server", "Enterprise Server", "Data Center Server", "Refurbished Server", "Server Price India", "Used Server", "Certified Server", "Server Rental India"],
    tower_server:  ["Tower Server", "Server", "Enterprise Server", "Refurbished Tower Server", "Business Server", "Small Business Server"],
    blade_server:  ["Blade Server", "Blade Module", "High Density Server", "Enterprise Blade", "Data Center Blade"],
    nas_storage:   ["NAS Storage", "Network Attached Storage", "File Server", "Backup Storage", "NAS Device India"],
    san_storage:   ["SAN Storage", "Storage Array", "Enterprise Storage", "Storage Area Network", "Disk Array India"],
    hdd:           ["Hard Drive", "HDD", "SAS Drive", "SATA HDD", "Server Hard Disk", "Enterprise HDD", "Storage Upgrade"],
    ssd:           ["SSD", "Solid State Drive", "NVMe SSD", "Enterprise SSD", "Fast Storage", "Server SSD India"],
    switch_router: ["Network Switch", "Managed Switch", "Router", "Enterprise Switch", "Data Center Switch", "Networking Equipment India"],
    nic_hba:       ["Network Adapter", "NIC", "HBA", "Server NIC", "Ethernet Adapter", "10GbE NIC", "Fiber Channel HBA"],
    firewall:      ["Firewall", "Network Security", "UTM", "Security Appliance", "Enterprise Firewall", "IDS IPS"],
    laptop:        ["Laptop", "Business Laptop", "Refurbished Laptop", "Office Laptop", "Laptop India", "Used Laptop"],
    workstation:   ["Workstation", "Professional Workstation", "CAD Workstation", "Desktop Workstation", "High Performance PC"],
    desktop:       ["Desktop PC", "Office PC", "Refurbished Desktop", "Business Desktop", "Tower PC India"],
    gpu:           ["GPU", "Graphics Card", "Professional GPU", "AI GPU", "ML GPU", "3D Rendering GPU", "Workstation GPU"],
    cpu:           ["Processor", "CPU", "Server Processor", "Xeon", "Multi-Core CPU", "Server CPU India"],
    ram:           ["Server RAM", "Memory", "DIMM", "ECC RAM", "Registered DIMM", "Server Memory Upgrade"],
    cooling:       ["Server Fan", "Heatsink", "Cooling", "Server Cooling", "OEM Fan", "Thermal Management"],
    ups_psu:       ["UPS", "Power Supply", "Server PSU", "Uninterruptible Power", "Power Protection", "Server Power Unit"],
    accessories:   ["Server Accessory", "Rail Kit", "Server Parts", "OEM Spare", "Server Component", "Data Center Accessory"],
    rental:        ["Server Rental", "IT Rental", "Infrastructure Rental", "Dedicated Server Rental", "Cloud Server India"],
    services:      ["Server AMC", "IT Support", "Server Repair", "Maintenance Contract", "IT Services India"],
    default:       ["Enterprise IT", "IT Hardware", "Refurbished Equipment", "Data Center"],
  };

  const typeTags = typeMap[poolKey] || typeMap.default;
  const all = [...new Set([...base, ...typeTags])];
  return JSON.stringify(all.slice(0, 14));
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════
async function run() {
  const dbp = db.promise();
  const [products] = await dbp.query(
    "SELECT id, name, category, image, images FROM shop_products ORDER BY id"
  );
  console.log(`Products: ${products.length}`);

  let updated = 0;
  for (const p of products) {
    const key  = detectPool(p.name, p.category);
    const pool = POOLS[key] || POOLS.default;

    const mainImg   = pick(pool, p.id, 0);
    const extras    = buildExtras(pool, p.id, mainImg);
    const imagesJson = JSON.stringify(extras);

    const desc = seoDescription(p.name, p.category, key);
    const tags = seoTags(p.name, p.category, key);

    await dbp.query(
      "UPDATE shop_products SET image=?, images=?, short_description=?, tags=? WHERE id=?",
      [mainImg, imagesJson, desc, tags, p.id]
    );
    updated++;
    if (updated % 100 === 0) process.stdout.write(`  ${updated}/${products.length}\r`);
  }

  console.log(`\n✅ Updated ${updated} products — images, descriptions, tags all refreshed.`);
  process.exit(0);
}

run().catch(err => { console.error("❌", err); process.exit(1); });
