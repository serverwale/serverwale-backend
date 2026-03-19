/**
 * add_faqs.js
 * Generates 4-5 SEO-targeted FAQs for every shop product and saves to DB.
 * Run: node add_faqs.js
 */

const db = require("./db");

// ─── Product-type detection (same logic as seo_images.js) ────────────────────
function detectType(name = "", category = "") {
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  const t = n + " " + c;

  if (t.includes("rack") && (t.includes("server") || t.includes("r6") || t.includes("r7") || t.includes("r8") || t.includes("r9"))) return "rack_server";
  if (t.includes("blade") && t.includes("server")) return "blade_server";
  if ((t.includes("tower") || t.includes("t140") || t.includes("t340") || t.includes("t440") || t.includes("ts")) && t.includes("server")) return "tower_server";
  if (t.includes("server")) return "rack_server";
  if (t.includes("nas") || (t.includes("network") && t.includes("storage"))) return "nas_storage";
  if (t.includes("san") || (t.includes("storage area") || (t.includes("storage") && (t.includes("msa") || t.includes("ds") || t.includes("3par"))))) return "san_storage";
  if (t.includes("ssd") || t.includes("solid state") || t.includes("nvme")) return "ssd";
  if (t.includes("hard drive") || t.includes("hdd") || t.includes("sata") || (t.includes("7200") && t.includes("drive"))) return "hdd";
  if (t.includes("switch") || t.includes("router")) return "switch_router";
  if (t.includes("firewall") || t.includes("fortigate") || t.includes("cisco asa") || t.includes("pfsense")) return "firewall";
  if (t.includes("nic") || t.includes("hba") || t.includes("network adapter") || t.includes("10gbe") || t.includes("25gbe")) return "nic_hba";
  if (t.includes("workstation") || t.includes("precision") || t.includes("z4") || t.includes("z6") || t.includes("z8")) return "workstation";
  if (t.includes("laptop") || t.includes("notebook") || t.includes("thinkpad") || t.includes("latitude") || t.includes("elitebook")) return "laptop";
  if (t.includes("desktop") || t.includes("optiplex") || t.includes("elitedesk") || t.includes("prodesk")) return "desktop";
  if (t.includes("gpu") || t.includes("graphics") || t.includes("rtx") || t.includes("quadro") || t.includes("tesla") || t.includes("nvidia") || t.includes("radeon")) return "gpu";
  if (t.includes("ram") || t.includes("memory") || t.includes("dimm") || t.includes("rdimm") || t.includes("ddr4") || t.includes("ddr5")) return "ram";
  if (t.includes("cpu") || t.includes("processor") || t.includes("xeon") || t.includes("epyc") || t.includes("core i")) return "cpu";
  if (t.includes("ups") || t.includes("uninterruptible") || t.includes("apc") || t.includes("pdu") || t.includes("power supply") || t.includes("psu")) return "ups_psu";
  if (t.includes("cooling") || t.includes("rack fan") || t.includes("server fan") || t.includes("thermal")) return "cooling";
  if (c.includes("rental") || t.includes("rental") || t.includes("on rent") || t.includes("for rent")) return "rental";
  if (c.includes("service") || t.includes("amc") || t.includes("support plan") || t.includes("maintenance")) return "services";
  return "default";
}

// ─── Extract brand/model from product name ────────────────────────────────────
function extractBrand(name = "") {
  const brands = ["Dell", "HP", "HPE", "Lenovo", "IBM", "Cisco", "Juniper", "Aruba", "Netgear", "D-Link",
    "Seagate", "Western Digital", "WD", "Toshiba", "Samsung", "Intel", "AMD", "NVIDIA",
    "Fortinet", "Palo Alto", "APC", "Eaton", "Vertiv", "Synology", "QNAP", "NetApp", "Huawei",
    "Fujitsu", "SuperMicro", "Supermicro", "Asus", "Gigabyte", "MSI", "Corsair", "Kingston"];
  for (const b of brands) {
    if (name.toLowerCase().startsWith(b.toLowerCase())) return b;
    if (name.toLowerCase().includes(" " + b.toLowerCase() + " ")) return b;
  }
  return null;
}

// ─── Generate FAQs based on product type ─────────────────────────────────────
function generateFAQs(product) {
  const { name, category, warranty, price } = product;
  const type = detectType(name, category);
  const brand = extractBrand(name);
  const brandStr = brand ? `${brand} ` : "";
  const priceStr = parseFloat(price) > 0
    ? `₹${parseFloat(price).toLocaleString("en-IN")}`
    : null;

  const warrantyStr = warranty || "1 Year Comprehensive Warranty";

  // Common FAQ shared by all types
  const warrantyFAQ = {
    q: `What warranty does the ${name} come with?`,
    a: `The ${name} comes with ${warrantyStr}. This covers all manufacturing defects, free parts replacement, and pan-India service support. Serverwale also offers extended AMC (Annual Maintenance Contract) plans for continued coverage beyond the standard warranty.`,
  };

  const priceFAQ = {
    q: `What is the price of ${name} in India?`,
    a: priceStr
      ? `The ${name} is currently priced at ${priceStr} on Serverwale. Prices may vary based on configuration, quantity, and applicable taxes. Contact our sales team for bulk discounts, EMI options, and GST invoices.`
      : `The price of ${name} varies based on configuration and availability. Contact Serverwale's sales team for the latest pricing, bulk discounts, GST invoice, and EMI options across India.`,
  };

  const faqs = [];

  if (type === "rack_server" || type === "blade_server" || type === "tower_server") {
    const serverType = type === "blade_server" ? "blade server" : type === "tower_server" ? "tower server" : "rack server";
    faqs.push(priceFAQ);
    faqs.push({
      q: `Is the ${name} suitable for enterprise and data center use?`,
      a: `Yes, the ${name} is purpose-built for enterprise and data center environments. It supports redundant hot-swap power supplies, RAID-enabled storage, IPMI/iDRAC/iLO remote management, and is certified for 24/7 continuous operation under demanding workloads.`,
    });
    faqs.push({
      q: `Does the ${name} support virtualization platforms like VMware and Hyper-V?`,
      a: `Absolutely. The ${name} is certified for leading virtualization platforms including VMware vSphere/ESXi, Microsoft Hyper-V, and KVM. Its multi-core processor support and large RAM capacity make it ideal for hosting multiple virtual machines in production environments.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Can I customize the ${name} with more RAM, storage, or GPU?`,
      a: `Yes. Serverwale offers custom configuration for the ${name} including RAM upgrades (up to maximum supported capacity), additional storage drives, GPU accelerators, and networking cards. All custom builds are tested before dispatch and backed by full warranty.`,
    });
  } else if (type === "nas_storage") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `What is the maximum storage capacity of the ${name}?`,
      a: `The ${name} supports expandable storage through multiple drive bays. Depending on the model, it can scale from a few terabytes to petabyte-level capacity using compatible HDDs or SSDs. Contact Serverwale for configuration-specific capacity details.`,
    });
    faqs.push({
      q: `Does the ${name} support RAID and data redundancy?`,
      a: `Yes, the ${name} supports multiple RAID levels (RAID 0, 1, 5, 6, 10) for data redundancy and performance optimization. It also supports snapshotting, replication, and automated backup features to protect your critical business data.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Is the ${name} compatible with Windows, Linux, and macOS environments?`,
      a: `Yes, the ${name} is compatible with Windows Server, Linux, and macOS through standard NFS, SMB/CIFS, and AFP protocols. It also supports iSCSI and Fibre Channel for SAN-like block storage access in mixed environments.`,
    });
  } else if (type === "san_storage") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `What connectivity does the ${name} support?`,
      a: `The ${name} supports high-speed connectivity including Fibre Channel (FC), iSCSI, and FCoE (Fibre Channel over Ethernet), enabling low-latency, high-throughput block storage access for enterprise applications and databases.`,
    });
    faqs.push({
      q: `Is the ${name} suitable for Oracle, SAP, or SQL Server databases?`,
      a: `Yes, the ${name} is validated for mission-critical database workloads including Oracle Database, SAP HANA, Microsoft SQL Server, and VMware vSAN. Its enterprise-grade IOPS and sub-millisecond latency ensure optimal database performance.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Does the ${name} support tiered storage and auto-tiering?`,
      a: `Yes, the ${name} includes intelligent tiering capabilities that automatically move frequently accessed data to faster SSD tiers while archiving cold data to higher-capacity HDD tiers — optimizing both performance and cost.`,
    });
  } else if (type === "ssd") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `What is the read/write speed and endurance rating of the ${name}?`,
      a: `The ${name} offers high sequential read/write speeds optimized for enterprise workloads. Its TBW (Terabytes Written) endurance rating ensures long-term reliability in 24/7 server environments. Contact Serverwale for the full spec sheet.`,
    });
    faqs.push({
      q: `Is the ${name} compatible with Dell, HP, and IBM servers?`,
      a: `Yes, the ${name} is designed for compatibility with major server platforms including Dell PowerEdge, HP ProLiant/HPE, IBM System x, and Cisco UCS. Always verify the specific model's hardware compatibility list (HCL) for your server generation.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Does the ${name} support hardware RAID controllers?`,
      a: `Yes, the ${name} is compatible with leading hardware RAID controllers including Dell PERC, HP Smart Array, and LSI MegaRAID. It supports RAID 0, 1, 5, 10 configurations for enterprise-grade data protection and performance.`,
    });
  } else if (type === "hdd") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `What is the RPM speed and interface of the ${name}?`,
      a: `The ${name} operates at enterprise-grade RPM speeds (typically 7200 RPM or 10K/15K RPM for performance models) with SAS or SATA interface. Its sustained transfer rates are optimized for 24/7 server and NAS workloads.`,
    });
    faqs.push({
      q: `Is the ${name} suitable for RAID arrays in servers?`,
      a: `Yes, the ${name} is specifically designed for RAID configurations in enterprise servers and storage systems. It features RAID-specific firmware enhancements (TLER/ERC) that prevent RAID controller timeouts during error recovery, unlike desktop drives.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `How many IOPS does the ${name} deliver?`,
      a: `The ${name} delivers consistent IOPS performance suitable for database and application server workloads. For exact IOPS specifications based on workload type (sequential vs random, read vs write), contact Serverwale for the full datasheet.`,
    });
  } else if (type === "switch_router") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `What switching capacity and port speed does the ${name} support?`,
      a: `The ${name} supports enterprise-grade switching capacity with high-density ports (1G/10G/25G/40G/100G depending on model). Its non-blocking architecture ensures wire-speed forwarding for latency-sensitive applications.`,
    });
    faqs.push({
      q: `Does the ${name} support VLAN, QoS, and advanced Layer 3 routing?`,
      a: `Yes, the ${name} supports IEEE 802.1Q VLANs, QoS (Quality of Service), OSPF/BGP Layer 3 routing, LACP link aggregation, and spanning tree protocols (STP/RSTP/MSTP) for enterprise network segmentation and traffic management.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Is the ${name} compatible with SDN and network automation tools?`,
      a: `Yes, the ${name} supports modern network management including SNMP, NETCONF/YANG, REST API, and Ansible/Python automation. It integrates with SDN controllers and network monitoring platforms for centralized management.`,
    });
  } else if (type === "firewall") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `What throughput and concurrent sessions does the ${name} support?`,
      a: `The ${name} delivers enterprise-grade firewall throughput with support for thousands of concurrent sessions. It includes IPS/IDS, application control, SSL inspection, and antivirus/anti-malware scanning — contact Serverwale for model-specific performance figures.`,
    });
    faqs.push({
      q: `Does the ${name} support VPN for remote workforce connectivity?`,
      a: `Yes, the ${name} supports IPsec VPN, SSL VPN, and SD-WAN capabilities, enabling secure remote access for employees. It integrates with major identity providers (Active Directory, LDAP, RADIUS) for policy-based access control.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Is the ${name} suitable for compliance with PCI-DSS, ISO 27001, or GDPR?`,
      a: `Yes, the ${name} provides the security controls needed for regulatory compliance including PCI-DSS, ISO 27001, and GDPR. Its comprehensive logging, reporting, and traffic inspection capabilities support security audits and compliance documentation.`,
    });
  } else if (type === "nic_hba") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `What bandwidth and protocol does the ${name} support?`,
      a: `The ${name} supports high-bandwidth connectivity (1G/10G/25G/40G/100G or Fibre Channel 8G/16G/32G depending on the model) with hardware offload features like TOE, iSCSI, and RDMA/RoCE to reduce CPU overhead and improve network performance.`,
    });
    faqs.push({
      q: `Is the ${name} compatible with VMware, Windows Server, and Linux?`,
      a: `Yes, the ${name} provides certified drivers for VMware vSphere, Windows Server 2012/2016/2019/2022, Red Hat Enterprise Linux, Ubuntu, and SUSE Linux. It supports SR-IOV for direct VM-to-NIC passthrough in virtualized environments.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Does the ${name} support RDMA and low-latency networking for HPC or AI workloads?`,
      a: `Yes, the ${name} supports RDMA over Converged Ethernet (RoCE) or InfiniBand, delivering ultra-low latency and high throughput essential for HPC clustering, AI/ML distributed training, and high-frequency trading applications.`,
    });
  } else if (type === "workstation") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `Is the ${name} suitable for CAD, video editing, and 3D rendering?`,
      a: `Yes, the ${name} is engineered for professional workloads including AutoCAD, SolidWorks, Adobe Premiere Pro, DaVinci Resolve, and 3D rendering applications like Blender and Cinema 4D. Its ECC memory and certified GPU support ensure stability under continuous heavy workloads.`,
    });
    faqs.push({
      q: `Does the ${name} support ECC RAM and professional GPUs?`,
      a: `Yes, the ${name} supports ECC (Error-Correcting Code) memory which is critical for preventing data corruption in scientific, engineering, and financial workloads. It also supports NVIDIA Quadro/RTX professional GPUs for ISV-certified graphics performance.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Can I upgrade the RAM and storage in the ${name}?`,
      a: `Yes, the ${name} offers excellent upgradeability with multiple RAM slots (supporting up to the maximum capacity), additional PCIe slots for GPUs and NVMe storage, and multiple drive bays. Serverwale can pre-configure upgrades before dispatch.`,
    });
  } else if (type === "laptop") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `Is the ${name} available for EMI and business purchase with GST invoice?`,
      a: `Yes, the ${name} is available with EMI options and comes with a valid GST invoice for business purchase. Serverwale also supports bulk procurement for corporates, educational institutions, and government organizations with special pricing.`,
    });
    faqs.push({
      q: `What is the battery life and build quality of the ${name}?`,
      a: `The ${name} features a durable business-grade build designed to meet MIL-STD-810G standards (on eligible models). Battery life varies by usage, but is optimized for all-day productivity with power management modes for extended uptime.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Can I upgrade the RAM and SSD in the ${name}?`,
      a: `Upgradeability depends on the specific model. Many business laptops support user-upgradeable RAM and M.2 NVMe SSD slots. Serverwale can pre-install upgraded components before delivery — contact us for configuration options.`,
    });
  } else if (type === "desktop") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `Is the ${name} suitable for office use and business deployments?`,
      a: `Yes, the ${name} is designed for business productivity including Microsoft Office, ERP applications, web browsing, and light content creation. Its compact form factor, energy efficiency, and enterprise management features (vPro/DASH) make it ideal for corporate deployments.`,
    });
    faqs.push({
      q: `Does the ${name} support bulk deployment and centralized management?`,
      a: `Yes, the ${name} supports Intel vPro or AMD PRO technology for remote management, imaging, and provisioning. It integrates with Microsoft SCCM, Intune, and other endpoint management platforms for large-scale enterprise deployments.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Can I get the ${name} with Windows 11 Pro and GST invoice?`,
      a: `Yes, Serverwale provides the ${name} with genuine Windows 11 Pro pre-installed along with a valid GST invoice. We also offer volume licensing options and OS-less configurations for organizations with existing license agreements.`,
    });
  } else if (type === "gpu") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `Is the ${name} suitable for AI/ML training, deep learning, and HPC workloads?`,
      a: `Yes, the ${name} is designed for compute-intensive AI/ML training, inference, deep learning frameworks (TensorFlow, PyTorch), and high-performance computing. Its CUDA cores and VRAM enable parallel processing of large datasets and neural networks.`,
    });
    faqs.push({
      q: `Does the ${name} support multi-GPU configurations (NVLink or SLI)?`,
      a: `Yes (on supported models), the ${name} supports NVLink high-bandwidth GPU interconnect for multi-GPU training jobs and compute clusters. This enables near-linear scaling of compute performance across multiple GPUs in a single server or workstation.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Is the ${name} compatible with Dell, HP, and Supermicro servers?`,
      a: `The ${name} is compatible with servers that provide adequate PCIe slot bandwidth and power delivery. Full-height double-width GPUs require a compatible server chassis. Contact Serverwale to verify compatibility with your specific server model.`,
    });
  } else if (type === "ram") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `Is the ${name} ECC (Error-Correcting Code) memory? Why does it matter?`,
      a: `ECC memory automatically detects and corrects single-bit errors, preventing data corruption and server crashes. The ${name} ${name.toLowerCase().includes("ecc") || name.toLowerCase().includes("rdimm") ? "uses ECC technology" : "is optimized"} for enterprise servers where data integrity is critical for financial, scientific, and database workloads.`,
    });
    faqs.push({
      q: `Which servers and workstations is the ${name} compatible with?`,
      a: `The ${name} is compatible with enterprise server platforms that support its form factor (RDIMM/LRDIMM/UDIMM) and speed (DDR4/DDR5). Always verify compatibility using the server's QVL (Qualified Vendor List). Serverwale can confirm compatibility with your specific system.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Can I mix the ${name} with existing RAM sticks in my server?`,
      a: `For optimal performance and stability, mixing RAM modules of different speeds, capacities, or manufacturers is not recommended in enterprise servers. Matching identical modules in the correct DIMM slot configuration is essential. Contact Serverwale for guidance on your specific server memory upgrade.`,
    });
  } else if (type === "cpu") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `What workloads is the ${name} optimized for?`,
      a: `The ${name} is optimized for enterprise workloads including virtualization, database processing, ERP applications, AI inference, and HPC. Its high core count, large L3 cache, and PCIe lane support make it ideal for multi-threaded server workloads.`,
    });
    faqs.push({
      q: `Is the ${name} compatible with my existing server motherboard?`,
      a: `CPU compatibility depends on the socket type (LGA/SP3/SP5/AM5) and BIOS version of your server platform. The ${name} must match the socket and TDP requirements of your server. Contact Serverwale to verify compatibility with your specific server model and generation.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Does the ${name} support hardware virtualization (VT-x/AMD-V) and AVX instructions?`,
      a: `Yes, the ${name} supports Intel VT-x or AMD-V hardware virtualization along with AVX-512/AVX2 instructions for accelerated data processing. These features are essential for running VMware, Hyper-V, and containerized workloads efficiently.`,
    });
  } else if (type === "ups_psu") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `What is the backup time and load capacity of the ${name}?`,
      a: `The backup time of the ${name} depends on the connected load. At full rated capacity, it provides critical backup time to safely shut down servers. Adding external battery packs can extend runtime significantly. Contact Serverwale for a load-specific runtime calculation.`,
    });
    faqs.push({
      q: `Is the ${name} compatible with APC/Eaton management software and SNMP monitoring?`,
      a: `Yes, the ${name} integrates with enterprise power management software for SNMP monitoring, automated graceful shutdown, and power event alerting. This ensures your servers receive adequate shutdown time during extended outages to prevent data loss.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Is the ${name} suitable for server rooms, data centers, and critical IT infrastructure?`,
      a: `Yes, the ${name} is designed for protecting critical IT infrastructure including servers, storage arrays, networking equipment, and workstations. Its double-conversion or line-interactive topology provides clean, regulated power protecting against surges, sags, and complete outages.`,
    });
  } else if (type === "rental") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `What are the rental terms and minimum duration for the ${name}?`,
      a: `Serverwale offers flexible rental terms for the ${name} starting from 1 month, with options for 3-month, 6-month, and annual contracts. Rental includes delivery, installation, and technical support. Contact us for a customized rental quote.`,
    });
    faqs.push({
      q: `Is technical support included with the ${name} rental?`,
      a: `Yes, all equipment rentals from Serverwale include technical support, preventive maintenance, and hardware replacement in case of failure. This ensures zero downtime for your business operations throughout the rental period.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Can I convert the ${name} rental to a purchase later?`,
      a: `Yes, Serverwale offers a rent-to-own option where rental payments can be adjusted against the purchase price. This is ideal for startups and businesses that want to trial equipment before committing to a purchase. Contact our team for details.`,
    });
  } else if (type === "services") {
    faqs.push(priceFAQ);
    faqs.push({
      q: `What does the ${name} service plan include?`,
      a: `The ${name} service plan includes preventive maintenance visits, hardware fault diagnosis, parts replacement (as applicable), software updates, and priority support response. Serverwale's certified engineers ensure your IT infrastructure runs at peak performance year-round.`,
    });
    faqs.push({
      q: `What is the response time for service calls under the ${name} plan?`,
      a: `Serverwale guarantees fast response times under the ${name} plan — typically within 4 hours for critical issues in Delhi NCR, and next business day for other locations. 24/7 phone and WhatsApp support is available for all AMC customers.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `Does the ${name} plan cover third-party and end-of-life hardware?`,
      a: `Yes, Serverwale's service plans cover multi-vendor environments including Dell, HP, IBM, Cisco, and other brands — even for end-of-life hardware. Our engineers are certified across platforms to provide comprehensive coverage for your entire IT estate.`,
    });
  } else {
    // default (accessories, cooling, etc.)
    faqs.push(priceFAQ);
    faqs.push({
      q: `Is the ${name} compatible with major server and workstation brands?`,
      a: `The ${name} is designed for compatibility with major enterprise platforms including Dell, HP/HPE, IBM, Lenovo, and Cisco. Please verify the specific part number matches your system's requirements. Serverwale can confirm compatibility for your use case.`,
    });
    faqs.push({
      q: `Is the ${name} available for bulk/enterprise purchase with GST invoice?`,
      a: `Yes, Serverwale offers the ${name} in bulk quantities for enterprise procurement with valid GST invoices. We support tendering processes, GeM portal requirements, and institutional purchases with competitive pricing and fast delivery across India.`,
    });
    faqs.push(warrantyFAQ);
    faqs.push({
      q: `How long does delivery of the ${name} take?`,
      a: `Serverwale ships the ${name} across India. Delhi NCR orders typically ship within 24-48 hours. Pan-India delivery takes 3-7 business days depending on location. Express shipping is available for urgent requirements — contact our team.`,
    });
  }

  return faqs.slice(0, 5); // max 5 FAQs
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  const dbp = db.promise();

  // 1. Add faqs column if not exists
  try {
    await dbp.query("ALTER TABLE shop_products ADD COLUMN faqs JSON NULL AFTER warranty");
    console.log("✅ Added faqs column to shop_products");
  } catch (err) {
    if (err.code === "ER_DUP_FIELDNAME" || err.message.includes("Duplicate column")) {
      console.log("ℹ️  faqs column already exists — skipping ALTER");
    } else {
      throw err;
    }
  }

  // 2. Fetch all products
  const [products] = await dbp.query(
    "SELECT id, name, category, warranty, price FROM shop_products ORDER BY id"
  );
  console.log(`Total products: ${products.length}\n`);

  let updated = 0;
  for (const p of products) {
    const faqs = generateFAQs(p);
    await dbp.query("UPDATE shop_products SET faqs=? WHERE id=?", [JSON.stringify(faqs), p.id]);
    updated++;
    if (updated % 100 === 0) {
      process.stdout.write(`  ${updated}/${products.length}\r`);
    }
  }

  console.log(`\n✅ Done — ${updated} products updated with FAQs`);
  process.exit(0);
}

run().catch(err => { console.error("❌", err.message); process.exit(1); });
