/**
 * add_descriptions.js
 * Generates rich, SEO-friendly HTML full_description for all 1120 shop products.
 * 4–5 sections per product: intro, features, use cases, Serverwale intro, CTA links.
 * Run: node add_descriptions.js
 */

const db = require("./db");

// ─── Product type detection ───────────────────────────────────────────────────
function detectType(name = "", category = "") {
  const t = (name + " " + category).toLowerCase();
  if (t.includes("rack") && (t.includes("server") || /r[0-9]{3,4}/.test(t))) return "rack_server";
  if (t.includes("blade") && t.includes("server")) return "blade_server";
  if ((t.includes("tower") || /t[0-9]{3}/.test(t)) && t.includes("server")) return "tower_server";
  if (t.includes(" server") || t.includes("poweredge") || t.includes("proliant") || t.includes("system x")) return "rack_server";
  if (t.includes("nas") || (t.includes("network") && t.includes("storage"))) return "nas_storage";
  if (t.includes("san") || t.includes("3par") || t.includes("msa") || (t.includes("storage") && t.includes("array"))) return "san_storage";
  if (t.includes("nvme") || t.includes("ssd") || t.includes("solid state")) return "ssd";
  if (t.includes("hdd") || t.includes("hard drive") || t.includes("hard disk")) return "hdd";
  if (t.includes("switch") || t.includes("router")) return "switch_router";
  if (t.includes("firewall") || t.includes("fortigate") || t.includes("asa ") || t.includes("pfsense")) return "firewall";
  if (t.includes("nic") || t.includes("hba") || t.includes("network adapter") || t.includes("10gbe") || t.includes("25gbe")) return "nic_hba";
  if (t.includes("workstation") || t.includes("precision") || t.includes(" z4") || t.includes(" z6") || t.includes(" z8")) return "workstation";
  if (t.includes("laptop") || t.includes("notebook") || t.includes("thinkpad") || t.includes("latitude") || t.includes("elitebook")) return "laptop";
  if (t.includes("desktop") || t.includes("optiplex") || t.includes("elitedesk") || t.includes("prodesk")) return "desktop";
  if (t.includes("gpu") || t.includes("graphics") || t.includes("rtx") || t.includes("quadro") || t.includes("tesla") || t.includes("a100") || t.includes("v100")) return "gpu";
  if (t.includes("ram") || t.includes(" memory") || t.includes("dimm") || t.includes("rdimm") || t.includes("ddr4") || t.includes("ddr5")) return "ram";
  if (t.includes("cpu") || t.includes("processor") || t.includes("xeon") || t.includes("epyc")) return "cpu";
  if (t.includes("ups") || t.includes("uninterruptible") || t.includes("pdu") || t.includes("power supply") || t.includes("psu") || t.includes("apc ") || t.includes("eaton")) return "ups_psu";
  if (t.includes("cooling") || t.includes("rack fan") || t.includes("server fan") || t.includes("thermal")) return "cooling";
  if (t.includes("rental") || t.includes("on rent") || t.includes("for rent")) return "rental";
  if (t.includes("amc") || t.includes("support plan") || t.includes("maintenance contract") || t.includes("service plan")) return "services";
  return "default";
}

function extractBrand(name = "") {
  const brands = ["Dell", "HP", "HPE", "Lenovo", "IBM", "Cisco", "Juniper", "Aruba", "Netgear", "D-Link",
    "Seagate", "Western Digital", "WD", "Toshiba", "Samsung", "Intel", "AMD", "NVIDIA",
    "Fortinet", "Palo Alto", "APC", "Eaton", "Vertiv", "Synology", "QNAP", "NetApp",
    "Fujitsu", "Supermicro", "Huawei"];
  for (const b of brands) {
    if (name.toLowerCase().startsWith(b.toLowerCase())) return b;
  }
  return null;
}

// ─── HTML builder ─────────────────────────────────────────────────────────────
function h2(text) { return `<h2>${text}</h2>`; }
function h3(text) { return `<h3>${text}</h3>`; }
function p(text)  { return `<p>${text}</p>`; }
function ul(items) { return `<ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>`; }
function b(text)  { return `<strong>${text}</strong>`; }
function a(text, href) { return `<a href="${href}">${text}</a>`; }

const SHOP  = "/#/shop/now";
const CONTACT = "/#/contact";
const ABOUT   = "/#/about";
const SERVICES_PAGE = "/#/services";

function serverwaleBlock(type) {
  const category = {
    rack_server: "servers", blade_server: "servers", tower_server: "servers",
    nas_storage: "storage solutions", san_storage: "storage solutions",
    hdd: "storage drives", ssd: "storage drives",
    switch_router: "networking equipment", firewall: "security appliances", nic_hba: "networking components",
    workstation: "workstations", laptop: "laptops", desktop: "desktops",
    gpu: "GPU accelerators", ram: "server memory", cpu: "processors",
    ups_psu: "power solutions", cooling: "cooling systems",
    rental: "rental equipment", services: "IT services", default: "IT hardware",
  }[type] || "IT hardware";

  return p(
    `${b("Serverwale")} is ${b("India's most trusted enterprise IT hardware company")}, serving SMBs, enterprises, data centers, and government organisations since over a decade. We specialise in certified refurbished and brand-new ${category} — all thoroughly tested, warranty-backed, and ready for enterprise deployment. Every order comes with a ${b("valid GST invoice")}, ${b("pan-India delivery")}, and ${b("dedicated post-sales support")} from our certified engineers. Whether you need a single unit or a large-scale data center buildout, Serverwale delivers the same promise: ${b("quality hardware at honest prices")}.`
  );
}

function ctaBlock(type) {
  const catLinks = {
    rack_server: ["Rack Servers", "Servers"], blade_server: ["Blade Servers", "Servers"],
    tower_server: ["Tower Servers", "Servers"], nas_storage: ["NAS Storage", "Storage"],
    san_storage: ["SAN Storage", "Storage"], hdd: ["Hard Drives", "Storage"],
    ssd: ["SSDs", "Storage"], switch_router: ["Network Switches", "Networking"],
    firewall: ["Firewalls", "Networking"], nic_hba: ["NICs & HBAs", "Networking"],
    workstation: ["Workstations", "Workstations"], laptop: ["Laptops", "Laptops"],
    desktop: ["Desktops", "Desktops"], gpu: ["GPUs", "Components"],
    ram: ["Server RAM", "Components"], cpu: ["Processors", "Components"],
    ups_psu: ["UPS & Power", "Power"], cooling: ["Cooling Systems", "Accessories"],
    rental: ["Server Rental", "Servers"], services: ["IT Services", "Services"],
    default: ["All Products", "All"],
  };
  const [label, cat] = catLinks[type] || ["All Products", "All"];
  const catParam = cat !== "All" ? `?category=${encodeURIComponent(cat)}` : "";

  return `<div class="desc-cta-box">${b("Ready to order or need expert advice?")} Browse our complete ${
    a(label, SHOP + catParam)
  } catalogue, explore ${
    a("server rental options", SHOP + "?category=Servers")
  } for flexible procurement, or ${
    a("contact our sales team", CONTACT)
  } for a custom quote with bulk pricing, EMI, and GST invoice. Learn more ${
    a("about Serverwale", ABOUT)
  } and our ${
    a("full range of IT services", SERVICES_PAGE)
  }.</div>`;
}

// ─── Type-specific description generators ────────────────────────────────────
function generate(product) {
  const { name, category, warranty, price } = product;
  const type = detectType(name, category);
  const brand = extractBrand(name) || "this";
  const priceStr = parseFloat(price) > 0 ? `₹${parseFloat(price).toLocaleString("en-IN")}` : null;
  const warrantyStr = warranty || "1 Year Comprehensive Warranty";
  const W = b(warrantyStr);

  // ---------- RACK / BLADE / TOWER SERVER ----------
  if (type === "rack_server" || type === "blade_server" || type === "tower_server") {
    const st = type === "blade_server" ? "Blade Server" : type === "tower_server" ? "Tower Server" : "Rack Server";
    const mount = type === "tower_server" ? "tower form factor" : type === "blade_server" ? "blade chassis" : "standard 19-inch rack";
    return [
      h2(`${name} – Enterprise-Grade ${st} for Data Centers & Business IT`),
      p(`The ${b(name)} is a ${b(`high-performance ${st.toLowerCase()}`)} designed to power mission-critical workloads in data centers, enterprise environments, and growing businesses across India. Built for ${b("24/7 continuous operation")}, it delivers the reliability, scalability, and compute power that modern IT infrastructure demands. Mounting in a ${mount}, this server optimises rack space while providing the processing muscle needed for ${b("virtualisation, databases, ERP applications, and cloud infrastructure")}. ${priceStr ? `Available from Serverwale at ${b(priceStr)}.` : "Contact Serverwale for competitive pricing."}`),
      h3("Key Features & Technical Capabilities"),
      p(`The ${b(name)} is engineered with enterprise-class components for peak reliability. It supports ${b("multi-core Intel Xeon or AMD EPYC processors")} with high core counts and large cache, enabling efficient parallel processing. ${b("ECC (Error-Correcting Code) RAM support")} ensures data integrity under heavy workloads — critical for financial, scientific, and database applications. The server includes ${b("hot-swap drive bays")}, ${b("redundant power supplies")}, and ${b("RAID-enabled storage controllers")} (Dell PERC, HP Smart Array) for maximum uptime. Remote management via ${b("iDRAC / iLO / IPMI")} allows out-of-band server administration from anywhere.`),
      ul([
        `${b("Virtualisation-ready")} – certified for VMware vSphere, Microsoft Hyper-V, and KVM`,
        `${b("Scalable memory")} – supports large RAM configurations for in-memory databases`,
        `${b("High-speed I/O")} – PCIe Gen 4/5 slots for NVMe SSDs, GPUs, and 25/100GbE NICs`,
        `${b("Enterprise security")} – TPM 2.0, Secure Boot, and hardware-based encryption`,
        `${b("Energy efficient")} – 80 PLUS Platinum/Titanium PSUs with smart power management`,
      ]),
      h3("Ideal Use Cases & Deployment Scenarios"),
      p(`The ${b(name)} is the backbone of modern enterprise IT. Deploy it as a ${b("primary application server")} running SAP, Oracle, or Microsoft SQL Server; as a ${b("virtualisation host")} consolidating dozens of VMs on a single platform; or as a ${b("private cloud node")} in OpenStack or VMware vSAN environments. It excels in ${b("high-performance computing (HPC)")}, ${b("AI/ML inference workloads")}, ${b("web and API server farms")}, and ${b("backup and disaster recovery")} infrastructure. Government organisations, hospitals, banks, and IT companies across India trust this platform for always-on availability.`),
      h3("Why Buy This Server from Serverwale?"),
      serverwaleBlock(type),
      p(`All servers come with ${W} coverage, thorough pre-dispatch testing (burn-in, memory check, RAID configuration), and same-day dispatch for in-stock units. Our ${b("pan-India service network")} ensures on-site support is available in Delhi NCR and remote support across India.`),
      h3("Build Your Complete Server Infrastructure"),
      p(`A powerful server is the foundation — complete it with the right accessories. Pair the ${b(name)} with ${
        a("enterprise-grade SSDs and HDDs", SHOP + "?category=Storage")
      } for fast, reliable storage, ${
        a("managed switches and networking gear", SHOP + "?category=Networking")
      } for high-bandwidth connectivity, and a ${
        a("quality UPS solution", SHOP + "?category=Power")
      } to protect against power outages. Explore our full ${
        a("server catalogue at Serverwale Shop", SHOP + "?category=Servers")
      } or ${
        a("contact us", CONTACT)
      } for a custom-built server solution tailored to your workload.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- NAS STORAGE ----------
  if (type === "nas_storage") {
    return [
      h2(`${name} – Network Attached Storage for Businesses & Data Centers`),
      p(`The ${b(name)} is a ${b("high-capacity Network Attached Storage (NAS)")} solution that centralises your organisation's data, making it accessible from every device on your network. Designed for ${b("SMBs, enterprises, creative studios, and surveillance applications")}, it combines large storage capacity with enterprise-grade data protection and collaboration features. ${priceStr ? `Available from Serverwale at ${b(priceStr)}.` : "Contact Serverwale for the latest pricing."}`),
      h3("Storage Capacity, Performance & Scalability"),
      p(`The ${b(name)} supports multiple drive bays accommodating ${b("SATA HDDs and SSDs")} for flexible capacity scaling. With ${b("hardware RAID support")} (RAID 0, 1, 5, 6, 10), your data remains protected against drive failures with automatic rebuilding. ${b("10GbE networking support")} ensures fast file transfers for video editing, large database backups, and multi-user access. Automated snapshots and replication to remote NAS or cloud storage provide a complete ${b("3-2-1 backup strategy")} for business continuity.`),
      ul([
        `${b("Multi-protocol support")} – SMB/CIFS, NFS, AFP, iSCSI for Windows, Linux, macOS`,
        `${b("RAID protection")} – RAID 0/1/5/6/10 with hot spare support`,
        `${b("Snapshot & replication")} – point-in-time recovery and remote DR replication`,
        `${b("User access control")} – Active Directory integration, per-user quotas`,
        `${b("App ecosystem")} – surveillance, cloud sync, download manager, and more`,
      ]),
      h3("Applications & Business Use Cases"),
      p(`The ${b(name)} serves as a central file server for team collaboration, a backup target for server and workstation data, a private cloud storage replacing expensive SaaS subscriptions, and a surveillance recording server. Creative agencies use NAS for ${b("high-resolution video project storage")}, IT teams use it for ${b("VM backup targets")}, and enterprises deploy it as a ${b("secondary disaster recovery site")} for critical data.`),
      h3("Why Choose Serverwale for NAS Solutions?"),
      serverwaleBlock(type),
      p(`Every NAS solution from Serverwale comes with ${W}, professional racking and configuration support, and access to our certified storage engineers for deployment assistance. We stock a full range of compatible ${a("NAS drives and expansion shelves", SHOP + "?category=Storage")}.`),
      h3("Complete Your Storage Infrastructure"),
      p(`Pair the ${b(name)} with ${a("enterprise SATA HDDs or SSDs", SHOP + "?category=Storage")} for maximum capacity, ${a("managed switches", SHOP + "?category=Networking")} for high-bandwidth access, and ${a("UPS units", SHOP + "?category=Power")} for power protection. ${a("Contact Serverwale", CONTACT)} for a complete NAS + backup solution tailored to your storage requirements and budget.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- SAN STORAGE ----------
  if (type === "san_storage") {
    return [
      h2(`${name} – Enterprise SAN Storage for Mission-Critical Applications`),
      p(`The ${b(name)} is an ${b("enterprise Storage Area Network (SAN)")} solution delivering sub-millisecond latency and high IOPS for the most demanding database and application workloads. Purpose-built for ${b("Oracle, SAP, Microsoft SQL Server, and VMware vSAN")} environments, it provides the performance and reliability backbone of your data center. ${priceStr ? `Priced at ${b(priceStr)} — contact Serverwale for volume discounts.` : "Contact Serverwale for enterprise pricing."}`),
      h3("Performance, Connectivity & Enterprise Features"),
      p(`The ${b(name)} supports ${b("Fibre Channel (FC), iSCSI, and FCoE")} connectivity, delivering the low-latency block storage that enterprise applications demand. Its ${b("intelligent auto-tiering")} automatically places hot data on fast SSD tiers and cold data on high-capacity HDD tiers — optimising both performance and cost. ${b("Dual controllers")} with active-active failover ensure zero downtime during maintenance or component failure.`),
      ul([
        `${b("All-flash & hybrid tiers")} – NVMe, SAS SSD, and SAS HDD media support`,
        `${b("High availability")} – dual redundant controllers, no single point of failure`,
        `${b("Enterprise data services")} – thin provisioning, deduplication, compression, snapshots`,
        `${b("VMware certified")} – vSphere VAAI, VASA, and SRM integration`,
        `${b("Compliance-ready")} – encryption at rest, audit logging, WORM support`,
      ]),
      h3("Mission-Critical Deployment Scenarios"),
      p(`The ${b(name)} is deployed in the most demanding enterprise environments: ${b("banking transaction processing")}, ${b("hospital patient record systems")}, ${b("e-commerce platforms during peak sales")}, and ${b("media broadcast storage")}. Its consistent low latency and high throughput make it the right choice wherever application performance directly impacts business outcomes.`),
      h3("Serverwale – Your Enterprise Storage Partner in India"),
      serverwaleBlock(type),
      p(`Our storage specialists provide end-to-end SAN deployment services including capacity planning, zoning, LUN configuration, and host connectivity setup. All units come with ${W} and our certified engineers provide on-site commissioning support across India.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- SSD ----------
  if (type === "ssd") {
    return [
      h2(`${name} – Enterprise SSD for High-Performance Server & Storage Applications`),
      p(`The ${b(name)} is an ${b("enterprise-grade Solid State Drive (SSD)")} engineered for the relentless read/write demands of production servers, storage arrays, and high-performance workstations. Unlike consumer SSDs, this drive is designed for ${b("24/7 continuous operation")} with a high ${b("TBW (Terabytes Written) endurance rating")} and ${b("consistent, predictable latency")} — critical for databases, virtualisation, and transactional applications. ${priceStr ? `Available at Serverwale for ${b(priceStr)}.` : "Contact Serverwale for current pricing and availability."}`),
      h3("Speed, Endurance & Technical Specifications"),
      p(`The ${b(name)} delivers blazing ${b("sequential read and write speeds")} that dramatically reduce database query times, VM boot times, and application load latency compared to traditional HDDs. Its enterprise-class ${b("NVMe, SAS, or SATA interface")} (depending on model) ensures compatibility with modern server HBAs and RAID controllers. ${b("Power Loss Protection (PLP)")} circuits safeguard data integrity during sudden power interruptions — a critical feature for production server environments.`),
      ul([
        `${b("High endurance")} – enterprise TBW ratings for write-intensive workloads`,
        `${b("Power Loss Protection")} – capacitor-based data integrity on power failure`,
        `${b("Low latency")} – consistent sub-millisecond response times`,
        `${b("SMART monitoring")} – proactive health alerts and wear level reporting`,
        `${b("RAID compatible")} – certified with Dell PERC, HP Smart Array, and LSI controllers`,
      ]),
      h3("Where to Use This SSD"),
      p(`Deploy the ${b(name)} as a ${b("primary OS and application drive")} in rack servers for fast boot and application launch, as a ${b("database log volume")} for high-speed write operations, as an ${b("NVMe cache tier")} in hybrid SAN/NAS systems, or as the primary storage in ${b("VDI (Virtual Desktop Infrastructure)")} hosts where IOPS per VM is critical.`),
      h3("Buy Enterprise SSDs from Serverwale"),
      serverwaleBlock(type),
      p(`Serverwale stocks a wide range of enterprise SSDs from ${b("Dell, HP, Samsung, Intel, Seagate, and Western Digital")} — all sourced through authorised channels and covered by ${W}. We can supply individual drives or bulk quantities for storage expansion projects with ${b("guaranteed compatibility verification")} for your server platform.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- HDD ----------
  if (type === "hdd") {
    return [
      h2(`${name} – Enterprise Hard Drive for Servers, NAS & Storage Arrays`),
      p(`The ${b(name)} is an ${b("enterprise-class Hard Disk Drive (HDD)")} purpose-built for server, NAS, and SAN environments requiring large capacity, reliable continuous operation, and RAID-optimised firmware. Unlike desktop-grade drives, enterprise HDDs feature ${b("TLER/ERC (Time-Limited Error Recovery)")} firmware that prevents RAID controller timeouts during error recovery — protecting your data integrity in multi-drive arrays. ${priceStr ? `Priced at ${b(priceStr)} at Serverwale.` : "Contact Serverwale for bulk pricing."}`),
      h3("Technical Performance & Enterprise Firmware"),
      p(`The ${b(name)} operates at ${b("enterprise spindle speeds")} (typically 7200 RPM for capacity-optimised or 10K/15K RPM for performance models) with ${b("SAS or SATA interface")}. Its vibration compensation technology ensures consistent performance in dense multi-drive enclosures where vibration from adjacent drives can degrade performance. ${b("Rotational Vibration (RV) sensors")} actively compensate for chassis vibration in high-density storage shelves.`),
      ul([
        `${b("TLER/ERC firmware")} – RAID-optimised error recovery prevents array degradation`,
        `${b("High MTBF")} – 1.2M–2M hours mean time between failures`,
        `${b("Vibration compensation")} – stable performance in multi-drive chassis`,
        `${b("Large cache buffer")} – 256MB or higher cache for improved throughput`,
        `${b("Low power modes")} – intelligent spin-down for cold storage tiers`,
      ]),
      h3("Ideal Applications"),
      p(`The ${b(name)} is ideal as a ${b("bulk data storage tier")} in enterprise NAS and SAN systems, as an ${b("archival drive")} in MAID (Massive Array of Idle Disks) configurations, as a ${b("backup target drive")} for Veeam, Veritas, or Commvault backup jobs, and as a ${b("cost-effective capacity tier")} in hybrid all-flash/HDD storage architectures.`),
      h3("Serverwale – Trusted Hard Drive Supplier in India"),
      serverwaleBlock(type),
      p(`We supply enterprise HDDs from ${b("Seagate Exos, WD Gold/RE/Ultrastar, Toshiba Enterprise MG")} series and ${b("server-branded drives from Dell, HP, and IBM")} — all backed by ${W} and shipped with verified compatibility for your storage platform.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- SWITCH / ROUTER ----------
  if (type === "switch_router") {
    return [
      h2(`${name} – Enterprise Network Switch for High-Performance LAN Infrastructure`),
      p(`The ${b(name)} is an ${b("enterprise-grade managed network switch")} delivering the switching capacity, port density, and advanced features required for modern data center, campus, and branch office deployments. Designed for ${b("zero packet loss at wire speed")}, it supports the high-bandwidth, low-latency connectivity that servers, storage systems, and cloud applications demand. ${priceStr ? `Available from Serverwale at ${b(priceStr)}.` : "Contact Serverwale for enterprise pricing and availability."}`),
      h3("Switching Capacity, Port Speed & Advanced Features"),
      p(`The ${b(name)} provides ${b("non-blocking switching architecture")} ensuring full bandwidth utilisation across all ports simultaneously. It supports ${b("IEEE 802.1Q VLANs")} for network segmentation, ${b("LACP (Link Aggregation)")} for redundant high-bandwidth uplinks, ${b("OSPF and BGP routing protocols")} for Layer 3 inter-VLAN routing, and ${b("QoS (Quality of Service)")} policies to prioritise latency-sensitive traffic like VoIP and video.`),
      ul([
        `${b("High-density ports")} – 1G/10G/25G/40G/100G options for server and uplink connectivity`,
        `${b("Layer 3 routing")} – static routes, OSPF, BGP for enterprise network design`,
        `${b("Advanced security")} – 802.1X port authentication, DHCP snooping, ARP inspection`,
        `${b("Stacking support")} – build a unified virtual switch from multiple physical units`,
        `${b("Energy efficient")} – EEE (Energy-Efficient Ethernet) reduces power on idle ports`,
      ]),
      h3("Network Design Use Cases"),
      p(`Deploy the ${b(name)} as a ${b("top-of-rack (ToR) switch")} in server rooms connecting compute nodes at 10G/25G, as a ${b("distribution layer switch")} aggregating access-layer traffic, as a ${b("spine switch")} in spine-leaf data center architectures, or as a ${b("core campus switch")} for enterprise office networks with hundreds of users.`),
      h3("Buy Enterprise Switches from Serverwale"),
      serverwaleBlock(type),
      p(`Our networking specialists can assist with ${b("switch selection, VLAN design, and configuration")} to ensure your network infrastructure meets current and future bandwidth demands. All switches come with ${W} and Serverwale's certified engineer support.`),
      p(`Complete your network infrastructure with ${a("servers", SHOP + "?category=Servers")}, ${a("firewalls", SHOP + "?category=Networking")}, and ${a("network cables and transceivers", SHOP + "?category=Accessories")}. ${a("Contact our networking experts", CONTACT)} for a complete network design and equipment supply quote.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- FIREWALL ----------
  if (type === "firewall") {
    return [
      h2(`${name} – Enterprise Firewall & Network Security Appliance`),
      p(`The ${b(name)} is an ${b("enterprise-class next-generation firewall (NGFW)")} providing comprehensive perimeter security, threat prevention, and VPN connectivity for businesses of all sizes. In an era where ${b("cyber threats are growing in sophistication and frequency")}, a robust firewall is the first and most critical line of defence for your network infrastructure. The ${name} combines ${b("deep packet inspection, application awareness, IPS/IDS, and SSL inspection")} in a single hardened appliance. ${priceStr ? `Available from Serverwale at ${b(priceStr)}.` : "Contact Serverwale for security pricing."}`),
      h3("Security Features & Threat Prevention"),
      p(`The ${b(name)} delivers enterprise-grade security through its ${b("stateful firewall engine")} combined with next-generation capabilities: ${b("Application Control")} identifies and controls over 3,000+ applications regardless of port; ${b("Intrusion Prevention System (IPS)")} detects and blocks exploits in real time; ${b("SSL/TLS inspection")} decrypts and inspects encrypted traffic where threats often hide; and ${b("antivirus/anti-malware scanning")} provides gateway-level protection before threats reach endpoints.`),
      ul([
        `${b("NGFW capabilities")} – application control, URL filtering, anti-malware, sandboxing`,
        `${b("VPN")} – IPsec Site-to-Site, SSL VPN for remote workers, SD-WAN support`,
        `${b("HA clustering")} – active-passive or active-active for zero-downtime failover`,
        `${b("Identity-based policies")} – AD/LDAP/RADIUS integration for user-based rules`,
        `${b("Compliance")} – PCI-DSS, ISO 27001, GDPR reporting and logging`,
      ]),
      h3("Remote Work, Branch & Data Center Security"),
      p(`The ${b(name)} secures ${b("remote workforce connectivity")} through encrypted VPN tunnels, ${b("branch office WAN aggregation")} through SD-WAN, and ${b("data center north-south traffic")} inspection for cloud and on-premise hybrid environments. It integrates with SIEM platforms for centralised security event monitoring and automated threat response.`),
      h3("Serverwale – Your Network Security Partner"),
      serverwaleBlock(type),
      p(`Our certified network security engineers assist with ${b("firewall sizing, policy design, VPN configuration, and compliance reporting")}. All security appliances come with ${W} and access to firmware updates during the support period. ${a("Contact us", CONTACT)} for a security assessment and firewall recommendation.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- WORKSTATION ----------
  if (type === "workstation") {
    return [
      h2(`${name} – Professional Workstation for Engineering, Design & Creative Professionals`),
      p(`The ${b(name)} is a ${b("certified professional workstation")} engineered for demanding creative and technical workloads where consumer PCs simply fall short. From ${b("3D CAD and BIM modelling")} to ${b("4K/8K video editing")}, ${b("scientific simulation")}, and ${b("AI/ML model training")}, this workstation delivers the processing power, certified GPU performance, and ECC memory reliability that professionals depend on. ${priceStr ? `Priced at ${b(priceStr)} at Serverwale.` : "Contact Serverwale for configuration-specific pricing."}`),
      h3("Professional-Grade Hardware & ISV Certifications"),
      p(`The ${b(name)} is powered by ${b("Intel Xeon W or Core i9 / AMD Ryzen Threadripper Pro processors")} optimised for multi-threaded professional applications. ${b("ECC (Error-Correcting Code) memory")} silently corrects single-bit memory errors — preventing the crashes and data corruption that non-ECC memory allows in long rendering or simulation jobs. ${b("Certified NVIDIA Quadro/RTX or AMD Radeon Pro GPU support")} ensures validated performance in ISV-certified professional applications (AutoCAD, SolidWorks, Maya, DaVinci Resolve).`),
      ul([
        `${b("ISV certified")} – validated for AutoCAD, SolidWorks, CATIA, Revit, Maya, and more`,
        `${b("ECC memory")} – error correction for crash-free long-running computations`,
        `${b("Professional GPU support")} – NVIDIA RTX/Quadro, AMD Radeon Pro`,
        `${b("High core count CPU")} – Xeon W or Threadripper for parallel rendering`,
        `${b("Expandable storage")} – multiple M.2 NVMe + SATA bays for project storage`,
      ]),
      h3("Who Needs a Professional Workstation?"),
      p(`The ${b(name)} is the tool of choice for ${b("mechanical and civil engineers")} running FEA/CFD simulations, ${b("architects and BIM designers")} working in Revit and Navisworks, ${b("video editors and VFX artists")} processing high-resolution footage, ${b("data scientists")} training ML models locally, and ${b("medical imaging professionals")} processing DICOM datasets. Industries including ${b("aerospace, automotive, construction, media, and healthcare")} rely on workstations like this for their daily mission-critical workflows.`),
      h3("Why Buy Your Workstation from Serverwale?"),
      serverwaleBlock(type),
      p(`Serverwale offers ${b("custom-configured workstations")} — choose your processor, RAM, GPU, and storage based on your specific workload. All units are pre-configured, tested, and dispatched with ${W}. Need a ${a("server", SHOP + "?category=Servers")} to complement your workstation-based pipeline? We have complete infrastructure solutions.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- LAPTOP ----------
  if (type === "laptop") {
    return [
      h2(`${name} – Business Laptop for Professionals & Enterprise Mobility`),
      p(`The ${b(name)} is a ${b("certified business-grade laptop")} designed for professionals who demand performance, durability, and security in a portable form factor. Built to ${b("MIL-STD-810 standards")} for ruggedness and featuring ${b("enterprise security features like TPM 2.0 and biometric authentication")}, it's the ideal tool for field professionals, executives, and remote workers who need reliable computing wherever they go. ${priceStr ? `Available from Serverwale at ${b(priceStr)}.` : "Contact Serverwale for the latest pricing and availability."}`),
      h3("Performance, Durability & Security Features"),
      p(`Powered by the latest ${b("Intel Core or AMD Ryzen processors")} with fast ${b("NVMe SSD storage")} and ${b("high-resolution display")}, the ${b(name)} handles everything from office productivity to light creative work and video conferencing. ${b("Intel vPro / AMD PRO technology")} enables remote management, imaging, and security policies — essential for corporate IT deployment at scale. Long battery life and rapid charging keep professionals productive through full working days.`),
      ul([
        `${b("Business-grade build")} – aluminium chassis with MIL-STD-810 durability rating`,
        `${b("Enterprise security")} – TPM 2.0, fingerprint reader, facial recognition, Kensington lock`,
        `${b("Intel vPro / AMD PRO")} – remote management and enterprise security features`,
        `${b("Connectivity")} – Thunderbolt 4, USB-C, HDMI, Wi-Fi 6, optional 4G/5G`,
        `${b("Windows 11 Pro")} – full enterprise OS with BitLocker and domain join support`,
      ]),
      h3("Perfect for Remote Work, Field Operations & Corporate Use"),
      p(`The ${b(name)} is ideal for ${b("corporate deployments")} requiring standardised, manageable endpoints, ${b("field sales and service teams")} needing reliable connectivity on the go, ${b("executives and managers")} who need a powerful primary device, and ${b("work-from-home professionals")} seeking desktop-like performance in a portable package.`),
      h3("Buy Laptops from Serverwale with GST Invoice & Warranty"),
      serverwaleBlock(type),
      p(`Serverwale provides ${b("genuine business laptops from Dell, HP, Lenovo, and other leading brands")} with valid GST invoices for corporate procurement. ${b("Bulk orders receive priority pricing and deployment support.")} All laptops come with ${W} and Serverwale's certified after-sales service. EMI options available for businesses and individuals.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- DESKTOP ----------
  if (type === "desktop") {
    return [
      h2(`${name} – Business Desktop PC for Corporate & Enterprise Deployments`),
      p(`The ${b(name)} is a ${b("business-class desktop PC")} optimised for corporate productivity, enterprise application performance, and large-scale endpoint deployment. Unlike consumer desktops, business PCs from Dell, HP, and Lenovo feature ${b("enterprise management capabilities")} (Intel vPro, AMD PRO, DASH) that enable IT administrators to remotely manage, image, and secure thousands of endpoints from a centralised console. ${priceStr ? `Available at Serverwale for ${b(priceStr)}.` : "Contact Serverwale for bulk enterprise pricing."}`),
      h3("Business Features, Performance & Manageability"),
      p(`The ${b(name)} is powered by the latest ${b("Intel Core or AMD Ryzen processors")} with fast ${b("DDR5/DDR4 memory")} and ${b("NVMe SSD primary storage")} for rapid application launch and data access. Its ${b("compact or tower form factor")} fits any workspace. ${b("Multiple display output")} support enables dual/triple monitor setups for productivity-focused workflows. The chassis features ${b("tool-less internal access")} for quick upgrades and maintenance.`),
      ul([
        `${b("Enterprise management")} – Intel vPro/AMT for remote out-of-band management`,
        `${b("Security features")} – TPM 2.0, Secure Boot, HP Sure Start / Dell SafeBIOS`,
        `${b("Expandability")} – PCIe slots, multiple storage bays, abundant USB connectivity`,
        `${b("ISV certified")} – validated for SAP, AutoCAD, and enterprise business applications`,
        `${b("Energy Star certified")} – 80 PLUS PSU, low power states for cost savings`,
      ]),
      h3("Ideal for Corporate, Education & Government Deployments"),
      p(`The ${b(name)} is the right choice for ${b("call centers")} needing reliable always-on workstations, ${b("educational institutions")} standardising on a single platform, ${b("government offices")} requiring certified hardware for GeM procurement, and ${b("corporate back-office teams")} running ERP, accounting, and productivity applications all day.`),
      h3("Bulk Desktop Procurement — Serverwale"),
      serverwaleBlock(type),
      p(`Serverwale specialises in ${b("bulk desktop supply for corporates, institutions, and government")} with competitive pricing, volume discounts, and complete deployment support. All desktops come with ${W} and ${b("genuine Windows 11 Pro")} with valid GST invoice. ${a("Request a bulk quote", CONTACT)} today.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- GPU ----------
  if (type === "gpu") {
    return [
      h2(`${name} – Professional GPU for AI, Machine Learning & High-Performance Computing`),
      p(`The ${b(name)} is a ${b("high-performance GPU accelerator")} designed to dramatically accelerate ${b("AI/ML training, deep learning inference, 3D rendering, video transcoding, and scientific computing")} workloads. In an era where ${b("artificial intelligence and data-intensive computing")} define competitive advantage, the right GPU can be the difference between hours and minutes of computation time. ${priceStr ? `Available from Serverwale at ${b(priceStr)}.` : "Contact Serverwale for availability and pricing."}`),
      h3("Compute Performance, Memory & CUDA Capabilities"),
      p(`The ${b(name)} provides massive parallel compute throughput through its ${b("thousands of CUDA or Tensor cores")}, enabling simultaneous processing of enormous datasets. Its ${b("large GPU memory (VRAM)")} is essential for training large neural networks and loading high-resolution 3D scenes. ${b("NVLink high-bandwidth interconnect")} (on supported models) enables multi-GPU configurations that scale compute linearly for large AI training jobs and HPC clusters.`),
      ul([
        `${b("AI/ML acceleration")} – TensorFloat-32, BFloat16, FP64 precision support`,
        `${b("CUDA ecosystem")} – compatible with TensorFlow, PyTorch, RAPIDS, cuDNN`,
        `${b("Large VRAM")} – handle large models and datasets without memory overflow`,
        `${b("Professional rendering")} – RTX ray tracing for photorealistic visualisations`,
        `${b("Multi-GPU support")} – NVLink bridging for linear performance scaling`,
      ]),
      h3("AI, HPC & Creative Professional Use Cases"),
      p(`Deploy the ${b(name)} in ${b("AI research clusters")} for training large language models and computer vision networks, in ${b("data science workstations")} for GPU-accelerated analytics with RAPIDS, in ${b("rendering farms")} for architectural visualisation and VFX, and in ${b("medical imaging")} for GPU-accelerated DICOM processing and AI-assisted diagnostics.`),
      h3("Source GPUs from Serverwale — India's AI Hardware Specialist"),
      serverwaleBlock(type),
      p(`Serverwale stocks ${b("NVIDIA Tesla, A100, H100, RTX, Quadro, and AMD Radeon Pro GPUs")} for both server and workstation deployment. We assist with ${b("compatibility verification")} for your server chassis and provide ${W} with full after-sales support. ${a("Contact us", CONTACT)} for AI infrastructure design including compute servers, networking, and storage.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- RAM ----------
  if (type === "ram") {
    return [
      h2(`${name} – Enterprise Server Memory for Reliable, High-Performance Computing`),
      p(`The ${b(name)} is an ${b("enterprise-grade server memory module")} designed for continuous, reliable operation in demanding server and workstation environments. Unlike consumer RAM, enterprise memory features ${b("ECC (Error-Correcting Code) technology")} that detects and automatically corrects single-bit memory errors — silently preventing data corruption, application crashes, and unplanned server downtime. ${priceStr ? `Available from Serverwale at ${b(priceStr)}.` : "Contact Serverwale for pricing and compatibility confirmation."}`),
      h3("ECC Technology, Speed & Capacity"),
      p(`The ${b(name)} operates at ${b("enterprise-validated speeds")} ensuring stable operation at rated frequency with automatic XMP/JEDEC profiles. As a ${b("Registered DIMM (RDIMM) or Load-Reduced DIMM (LRDIMM)")}, it buffers the memory bus reducing electrical load — enabling servers to populate more DIMM slots for higher total capacity without signal integrity issues. ${b("DDR4 or DDR5 technology")} delivers bandwidth improvements that directly benefit memory-bandwidth-sensitive workloads like in-memory databases and virtualisation.`),
      ul([
        `${b("ECC error correction")} – single-bit error detection and correction for data integrity`,
        `${b("RDIMM/LRDIMM")} – registered design for higher capacity per server`,
        `${b("High capacity options")} – scale server RAM to maximum supported configuration`,
        `${b("Low operating voltage")} – energy-efficient operation reducing datacenter PUE`,
        `${b("SPD programmed")} – auto-configuration by server BIOS at correct speeds`,
      ]),
      h3("Performance Impact of a Memory Upgrade"),
      p(`Expanding server RAM is often the ${b("highest-impact, lowest-cost performance upgrade")} available. More RAM allows servers to run more virtual machines with larger memory allocations, reduces paging (swap) operations that bottleneck database performance, enables larger in-memory datasets for analytics workloads, and increases the number of simultaneous user sessions on terminal and application servers.`),
      h3("Buy Verified Server RAM from Serverwale"),
      serverwaleBlock(type),
      p(`Serverwale carries verified memory from ${b("Samsung, SK Hynix, Micron, and server-OEM brands")} (Dell-branded, HP-branded, Lenovo-branded) ensuring compatibility with your server platform. We verify compatibility against your specific ${b("server model's QVL (Qualified Vendor List)")} before dispatch. All memory modules come with ${W}.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- CPU ----------
  if (type === "cpu") {
    return [
      h2(`${name} – Enterprise Server Processor for High-Performance Computing`),
      p(`The ${b(name)} is an ${b("enterprise-class server processor")} delivering the multi-core compute performance, large cache capacity, and high memory bandwidth that modern server workloads demand. Whether powering a ${b("virtualisation host, database server, HPC cluster, or AI inference engine")}, this processor provides the reliable compute foundation for your most critical applications. ${priceStr ? `Available from Serverwale at ${b(priceStr)}.` : "Contact Serverwale for pricing."}`),
      h3("Multi-Core Architecture, Cache & Platform Features"),
      p(`The ${b(name)} features a ${b("high core count architecture")} designed for parallel workload execution — essential for running many VMs simultaneously, processing concurrent database transactions, and executing parallelised scientific calculations. Its ${b("large last-level cache (LLC)")} reduces main memory access latency for frequently accessed data. ${b("Hardware virtualisation support")} (Intel VT-x/AMD-V) combined with ${b("IOMMU")} enables efficient VM creation and direct device passthrough.`),
      ul([
        `${b("Many-core design")} – scale compute with core count for parallel workloads`,
        `${b("Large LLC cache")} – reduced memory latency for database and analytics workloads`,
        `${b("AVX-512 / AVX2")} – vectorised instruction sets for AI, HPC, and media workloads`,
        `${b("PCIe Gen 4/5 lanes")} – high-bandwidth connectivity for NVMe and GPU devices`,
        `${b("Memory channels")} – multi-channel DDR5/DDR4 for maximum bandwidth`,
      ]),
      h3("CPU Upgrade Impact on Workload Performance"),
      p(`Upgrading to the ${b(name)} can significantly improve ${b("VM density on virtualisation hosts")} (more cores = more VMs), ${b("database transaction throughput")} (faster per-core performance), ${b("rendering and compilation speed")} (more parallel threads), and ${b("AI inference throughput")} (AVX-512 for optimised neural network execution). For dual-socket servers, a second processor also unlocks additional memory slots and PCIe lanes.`),
      h3("Server Processor Supply — Serverwale"),
      serverwaleBlock(type),
      p(`Serverwale supplies genuine ${b("Intel Xeon Scalable and AMD EPYC processors")} — new, refurbished, and OEM-branded options available. We verify socket compatibility and TDP requirements for your specific server model before dispatch. All processors come with ${W} and ${b("certified engineer installation support")} is available upon request.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- UPS / PSU ----------
  if (type === "ups_psu") {
    return [
      h2(`${name} – Uninterruptible Power Supply for Critical IT Infrastructure Protection`),
      p(`The ${b(name)} is an ${b("enterprise-grade Uninterruptible Power Supply (UPS)")} that protects your critical IT infrastructure — servers, storage systems, and networking equipment — from ${b("power outages, surges, sags, and electrical noise")}. In an environment where a few seconds of power interruption can corrupt databases, damage storage systems, and cost thousands in downtime, a quality UPS is not optional — it is essential. ${priceStr ? `Available from Serverwale at ${b(priceStr)}.` : "Contact Serverwale for power protection solutions."}`),
      h3("UPS Technology, Runtime & Load Capacity"),
      p(`The ${b(name)} uses ${b("online double-conversion topology")} (or line-interactive on eligible models) that provides completely clean, regulated power to connected equipment at all times — not just during outages. ${b("Automatic Voltage Regulation (AVR)")} corrects voltage fluctuations without switching to battery, extending battery life significantly. ${b("SNMP management card support")} enables integration with enterprise monitoring platforms like Nagios, PRTG, and Zabbix for automated graceful shutdown and alerting.`),
      ul([
        `${b("Online double-conversion")} – clean power with zero transfer time on outage`,
        `${b("AVR technology")} – voltage regulation without battery usage`,
        `${b("Expandable runtime")} – add external battery modules for extended backup`,
        `${b("SNMP/network management")} – remote monitoring and automated shutdown`,
        `${b("Hot-swap batteries")} – replace batteries without powering down connected equipment`,
      ]),
      h3("Protecting Your Server Room & Data Center"),
      p(`The ${b(name)} is sized for ${b("server rack power protection")}, protecting Dell/HP rack servers, storage arrays, and network switches during power events. Proper UPS sizing ensures your servers receive ${b("sufficient runtime to complete graceful shutdown")} — preventing filesystem corruption and data loss. For larger deployments, multiple UPS units can be paralleled for ${b("redundant N+1 power protection")}.`),
      h3("Buy UPS Solutions from Serverwale"),
      serverwaleBlock(type),
      p(`Serverwale stocks UPS units from ${b("APC by Schneider Electric, Eaton, Vertiv (Liebert), and Emerson")} — the leading power protection brands trusted by data centers worldwide. Our power specialists perform ${b("load calculations and UPS sizing")} to ensure your infrastructure is properly protected. All units come with ${W} and battery replacement support. ${a("Contact us", CONTACT)} for a power audit.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- RENTAL ----------
  if (type === "rental") {
    return [
      h2(`${name} – Flexible IT Equipment Rental for Businesses Across India`),
      p(`Serverwale's ${b(name)} rental service provides ${b("enterprise-grade IT hardware on flexible terms")} — without the upfront capital investment of ownership. Whether you need equipment for a ${b("short-term project, seasonal traffic spike, office expansion, or disaster recovery")}, renting from Serverwale gives you immediate access to the latest hardware with predictable monthly costs and zero depreciation risk. ${priceStr ? `Starting from ${b(priceStr)} — contact Serverwale for a custom rental quote.` : "Contact Serverwale for tailored rental pricing."}`),
      h3("What's Included in Every Rental"),
      p(`Every ${b(name)} rental from Serverwale includes ${b("delivery and professional installation")} at your site, ${b("initial configuration and testing")} to your specifications, ${b("ongoing technical support")} throughout the rental period, and ${b("hardware replacement within 24-48 hours")} in case of failure. No hidden maintenance costs, no repair bills — just a single predictable monthly fee that covers everything.`),
      ul([
        `${b("Flexible terms")} – 1 month, 3 months, 6 months, 1 year, and longer`,
        `${b("Zero downtime guarantee")} – hardware replacement if a unit fails`,
        `${b("Pan-India delivery")} – available across all major cities`,
        `${b("GST invoice")} – full tax documentation for business expense claims`,
        `${b("Rent-to-own option")} – convert rental payments toward purchase price`,
      ]),
      h3("When Does IT Equipment Rental Make Sense?"),
      p(`Renting makes business sense when you need ${b("temporary computing capacity for a software project or data migration")}, want to ${b("trial hardware before committing to purchase")}, need to ${b("scale IT quickly for a new office or client project")}, or simply prefer to ${b("preserve capital and improve cash flow")} by converting a large CapEx purchase into a manageable OpEx monthly expense. Many startups and growing businesses prefer renting over owning for the flexibility it provides.`),
      h3("India's Trusted IT Rental Company — Serverwale"),
      serverwaleBlock(type),
      p(`Serverwale has been providing ${b("server, workstation, laptop, and networking equipment rental")} across India for over a decade. Our rental fleet includes ${b("refurbished and new hardware from Dell, HP, Lenovo, and Cisco")} — all maintained to enterprise standards. ${a("View our rental catalogue", SHOP + "?category=Servers")} or ${a("contact our rental team", CONTACT)} to discuss your requirements.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- SERVICES ----------
  if (type === "services") {
    return [
      h2(`${name} – Professional IT Support & Maintenance Services`),
      p(`Serverwale's ${b(name)} provides ${b("comprehensive IT infrastructure support")} ensuring your servers, storage, and networking equipment operate at peak performance year-round. With ${b("proactive maintenance, rapid fault response, and certified engineering expertise")}, our service plans eliminate the unpredictability of IT infrastructure failures and the high cost of emergency repairs. ${priceStr ? `Starting from ${b(priceStr)} per year.` : "Contact Serverwale for a customised service quote."}`),
      h3("What Our IT Service Plans Cover"),
      p(`The ${b(name)} covers ${b("scheduled preventive maintenance visits")} (quarterly or semi-annual depending on plan tier), ${b("hardware fault diagnosis and repair")}, ${b("spare parts replacement")} for covered components, ${b("firmware and OS security patch management")}, ${b("performance monitoring and capacity planning")}, and ${b("24/7 emergency response")} for critical infrastructure incidents.`),
      ul([
        `${b("Preventive maintenance")} – scheduled visits to clean, test, and optimise hardware`,
        `${b("On-site response")} – certified engineers dispatched within 4 hours in Delhi NCR`,
        `${b("Remote support")} – 24/7 phone, email, and remote desktop support`,
        `${b("Parts coverage")} – replacement parts for covered hardware at no extra cost`,
        `${b("Multi-vendor support")} – Dell, HP, Cisco, IBM, Lenovo, and other brands`,
      ]),
      h3("Protecting Your Business from Unplanned Downtime"),
      p(`Every hour of IT downtime costs businesses thousands in lost productivity, revenue, and customer trust. The ${b(name)} transforms unpredictable, expensive emergency repairs into a ${b("budgeted, managed IT service")} with guaranteed response times and proactive issue prevention. Our engineers identify and resolve potential failures before they impact your operations.`),
      h3("Serverwale — India's Trusted IT Infrastructure Services Company"),
      serverwaleBlock(type),
      p(`Serverwale serves ${b("IT teams across India")} — from single-server SMBs to multi-rack data center operators. Our engineers are certified on ${b("Dell, HP, Cisco, IBM, Lenovo, NetApp, and VMware")} platforms. ${a("Explore our full range of IT services", SERVICES_PAGE)}, ${a("view our hardware catalogue", SHOP)}, or ${a("contact us directly", CONTACT)} for a site assessment and custom service proposal.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- NIC / HBA ----------
  if (type === "nic_hba") {
    return [
      h2(`${name} – High-Performance Network Interface Card for Enterprise Servers`),
      p(`The ${b(name)} is an ${b("enterprise-grade Network Interface Card (NIC) or Host Bus Adapter (HBA)")} that upgrades your server's network or storage connectivity to the speeds and capabilities required for modern data center workloads. Whether you need ${b("10G/25G/100G Ethernet for server networking")} or ${b("8G/16G/32G Fibre Channel for SAN storage connectivity")}, this adapter delivers the bandwidth, low latency, and hardware offload features your infrastructure demands. ${priceStr ? `Available from Serverwale at ${b(priceStr)}.` : "Contact Serverwale for compatibility confirmation and pricing."}`),
      h3("Bandwidth, Offload Features & Protocol Support"),
      p(`The ${b(name)} features ${b("hardware TCP/IP offload (TOE)")} reducing CPU overhead for network processing, ${b("RDMA over Converged Ethernet (RoCE)")} for low-latency storage and clustering applications, and ${b("SR-IOV (Single Root I/O Virtualisation)")} enabling direct NIC passthrough to virtual machines for maximum performance in VMware and KVM environments. ${b("iSCSI and FCoE offload")} transforms standard Ethernet ports into storage initiators without requiring dedicated HBAs.`),
      ul([
        `${b("High bandwidth")} – 10G/25G/40G/100G Ethernet or 8G/16G/32G FC options`,
        `${b("RDMA/RoCE")} – ultra-low latency for storage and HPC clustering`,
        `${b("SR-IOV support")} – direct VM-to-NIC passthrough for maximum VM performance`,
        `${b("Hardware offload")} – TOE, iSCSI offload, reduces host CPU utilisation`,
        `${b("Multi-OS drivers")} – VMware ESXi, Windows Server, RHEL, Ubuntu certified`,
      ]),
      h3("Ideal for AI Infrastructure & High-Performance Networking"),
      p(`The ${b(name)} is essential for ${b("distributed AI training clusters")} requiring high-bandwidth GPU-to-GPU communication, ${b("hyper-converged infrastructure (HCI)")} nodes in VMware vSAN or Nutanix environments, ${b("high-frequency trading")} servers requiring microsecond latency, and ${b("storage-dense server deployments")} needing Fibre Channel connectivity to SAN arrays.`),
      h3("Serverwale — Network Adapter Specialist for Indian Data Centers"),
      serverwaleBlock(type),
      p(`We supply NICs and HBAs from ${b("Mellanox/NVIDIA ConnectX, Broadcom NetXtreme, Intel Ethernet, Qlogic, and Emulex")} — verified compatible with Dell, HP, Cisco, and Supermicro server platforms. All adapters come with ${W} and Serverwale's technical compatibility assurance. ${a("Contact us", CONTACT)} for a compatibility check for your specific server and switch environment.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- COOLING ----------
  if (type === "cooling") {
    return [
      h2(`${name} – Enterprise Server Cooling for Reliable Data Center Thermal Management`),
      p(`The ${b(name)} is a ${b("professional-grade cooling solution")} for servers, rack enclosures, and data center environments where ${b("thermal management directly impacts hardware longevity and performance")}. Modern high-density servers generate significant heat, and inadequate cooling is a leading cause of ${b("premature hardware failure, thermal throttling, and unplanned downtime")}. The ${name} ensures your infrastructure stays within safe operating temperatures under all load conditions. ${priceStr ? `Available from Serverwale at ${b(priceStr)}.` : "Contact Serverwale for cooling solutions."}`),
      h3("Cooling Performance & Features"),
      p(`The ${b(name)} delivers ${b("high airflow in a compact form factor")}, suitable for ${b("rack-mounted servers, blade chassis, and dense UPS/networking enclosures")}. ${b("Variable-speed fan control")} responds to real-time temperature sensor data — running quietly under light load and ramping up automatically under heavy compute. ${b("Hot-swap capability")} on supported models allows fan replacement without powering down equipment.`),
      ul([
        `${b("High CFM airflow")} – rated for high-density, high-heat server environments`,
        `${b("Variable speed control")} – reduces noise under light load, ramps up when needed`,
        `${b("Hot-swap design")} – replace fans without server downtime on supported chassis`,
        `${b("Low acoustic profile")} – optimised blade design for reduced noise emission`,
        `${b("Long MTBF")} – enterprise-grade bearings rated for continuous operation`,
      ]),
      h3("Maintaining Optimal Data Center Operating Temperatures"),
      p(`Maintaining ${b("inlet temperatures between 18°C–27°C")} (ASHRAE A1/A2 standards) for servers is critical for long-term hardware health. The ${b(name)} complements your ${b("precision air conditioning and hot/cold aisle containment")} strategy to keep exhaust heat from recirculating to server inlets — one of the most common causes of thermal-related hardware failures in server rooms.`),
      h3("Buy Data Center Cooling from Serverwale"),
      serverwaleBlock(type),
      p(`Serverwale supplies replacement fans and cooling modules for ${b("Dell PowerEdge, HP ProLiant, Cisco UCS, and IBM servers")} along with rack-level cooling accessories. All cooling components come with ${W}. Complete your infrastructure with ${a("server hardware", SHOP + "?category=Servers")}, ${a("UPS solutions", SHOP + "?category=Power")}, and ${a("rack accessories", SHOP + "?category=Accessories")}. ${a("Contact our team", CONTACT)} for a complete data center design consultation.`),
      ctaBlock(type),
    ].join("\n");
  }

  // ---------- DEFAULT (accessories, components, etc.) ----------
  return [
    h2(`${name} – Enterprise IT Hardware from Serverwale`),
    p(`The ${b(name)} is a ${b("high-quality IT hardware component")} sourced, tested, and supplied by Serverwale — ${b("India's trusted enterprise IT hardware company")}. Whether you're building out a data center, upgrading an existing server infrastructure, or procuring specialised IT components for a specific workload, Serverwale delivers ${b("certified, warranty-backed hardware")} at competitive prices with fast pan-India delivery. ${priceStr ? `Current pricing: ${b(priceStr)}.` : "Contact Serverwale for a personalised quote."}`),
    h3("Product Quality & Certification Standards"),
    p(`Every product at Serverwale — including the ${b(name)} — undergoes ${b("rigorous multi-point quality inspection")} before dispatch. Refurbished units are ${b("thoroughly tested, cleaned, and certified")} to perform to original manufacturer specifications. New units are sourced through ${b("authorised distribution channels")} ensuring genuine hardware with full manufacturer compliance. Our quality process means you receive hardware that is ${b("ready for enterprise deployment on day one")}.`),
    ul([
      `${b("Multi-point quality check")} – tested for functionality, performance, and reliability`,
      `${b("Certified components")} – sourced through authorised or verified supply chains`,
      `${b("Ready-to-deploy")} – pre-tested and configured as required before dispatch`,
      `${b("Compatibility guaranteed")} – verified compatible with major server platforms`,
      `${b("Full documentation")} – datasheet, driver pack, and configuration guide included`,
    ]),
    h3("Integrate Into Your Complete IT Infrastructure"),
    p(`The ${b(name)} fits seamlessly into your broader IT infrastructure ecosystem. Serverwale is your ${b("single-source IT hardware partner")} — supplying everything from ${a("enterprise servers", SHOP + "?category=Servers")} and ${a("storage systems", SHOP + "?category=Storage")} to ${a("networking equipment", SHOP + "?category=Networking")} and ${a("power protection", SHOP + "?category=Power")}. Whether you're expanding an existing setup or building from scratch, our certified engineers can help design and supply a complete, integrated IT environment.`),
    h3("Why Thousands of Businesses Choose Serverwale"),
    serverwaleBlock(type),
    p(`The ${b(name)} comes with ${W} ensuring peace of mind post-purchase. Our ${b("dedicated customer success team")} is available via phone, email, and WhatsApp to address any technical queries, warranty claims, or procurement requirements.`),
    ctaBlock(type),
  ].join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  const dbp = db.promise();
  const [products] = await dbp.query(
    "SELECT id, name, category, warranty, price FROM shop_products ORDER BY id"
  );
  console.log(`Total products: ${products.length}\n`);

  let ok = 0;
  const BATCH = 50;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    await Promise.all(batch.map(p => {
      const desc = generate(p);
      return dbp.query("UPDATE shop_products SET full_description=? WHERE id=?", [desc, p.id]);
    }));
    ok += batch.length;
    process.stdout.write(`  ${ok}/${products.length}\r`);
  }

  console.log(`\n✅ Done — ${ok} products updated with rich descriptions`);
  process.exit(0);
}

run().catch(err => { console.error("❌", err.message); process.exit(1); });
