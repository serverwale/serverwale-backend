/**
 * fix_specs.js
 * Assigns technically accurate, model-specific specifications and features
 * to shop products based on product name pattern matching.
 * Run: node fix_specs.js
 */

const mysql = require("mysql2/promise");

const db_config = { host: "localhost", user: "root", password: "", database: "serverwale" };

// ─── SPEC LIBRARY ──────────────────────────────────────────────────────────
// Each entry: { match: regex, specs: {}, features: [] }
// Rules are checked in order — first match wins.

const RULES = [

  // ══════════════════════════════════════════════════════════════
  //  CISCO UCS
  // ══════════════════════════════════════════════════════════════
  {
    match: /UCS\s+C220\s+M6/i,
    specs: {
      Brand: "Cisco", "Form Factor": "Rack (1U)", Sockets: "2x LGA4189",
      Processor: "Intel Xeon Scalable 3rd Gen (Ice Lake-SP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "32 DIMM Slots", "Max RAM": "8 TB DDR4",
      "Drive Bays": "10x 2.5\" NVMe / SAS / SATA Hot-Swap",
      Network: "2x Onboard Intel GbE", Management: "Cisco IMC (CIMC)",
      "Power Supply": "2x 1050W Redundant Hot-Swap PSU",
      PCIe: "3x PCIe 4.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Latest Cisco UCS C220 M6 — Ice Lake-SP with PCIe 4.0 support",
      "Up to 40 cores per socket (Intel Xeon Scalable 3rd Gen)",
      "32 DIMM slots supporting up to 8TB DDR4 ECC RAM",
      "PCIe 4.0 doubles bandwidth for NVMe and GPU workloads",
      "All 10 drive bays support NVMe for extreme IOPS",
      "Cisco IMC for zero-touch provisioning and remote HTML5 KVM",
      "Ideal for AI/ML inference, real-time analytics, and cloud-native apps"
    ]
  },
  {
    match: /UCS\s+C220\s+M5/i,
    specs: {
      Brand: "Cisco", "Form Factor": "Rack (1U)", Sockets: "2x LGA3647",
      Processor: "Intel Xeon Scalable 1st / 2nd Gen (Skylake / Cascade Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "3 TB DDR4",
      "Drive Bays": "10x 2.5\" NVMe / SAS / SATA or 4x 3.5\" LFF Hot-Swap",
      Network: "2x Onboard Intel GbE", Management: "Cisco IMC (CIMC)",
      "Power Supply": "2x 770W Redundant Hot-Swap PSU",
      PCIe: "3x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "1U Cisco UCS server with Intel Xeon Scalable (Skylake / Cascade Lake)",
      "Up to 28 cores per CPU with AVX-512 instruction set support",
      "3TB DDR4 max RAM — ideal for large in-memory databases (SAP HANA, Redis)",
      "Supports Intel Optane DC Persistent Memory (DCPMM)",
      "Cisco IMC for full out-of-band remote management",
      "UCS Manager integration for policy-based data center automation",
      "Suitable for VMware vSphere, OpenStack, Kubernetes workloads"
    ]
  },
  {
    match: /UCS\s+C220\s+M4/i,
    specs: {
      Brand: "Cisco", "Form Factor": "Rack (1U)", Sockets: "2x LGA2011-3",
      Processor: "Intel Xeon E5-2600 v3 / v4 (Haswell-EP / Broadwell-EP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "1.5 TB DDR4",
      "Drive Bays": "2x 2.5\" SFF or 8x 2.5\" SFF (with expander) Hot-Swap",
      Network: "2x Onboard Intel GbE", Management: "Cisco IMC (CIMC)",
      "Power Supply": "2x 770W Redundant Hot-Swap PSU",
      PCIe: "3x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dual-socket 1U Cisco UCS with DDR4 memory (first DDR4 generation)",
      "Intel Xeon E5-2600 v3 (Haswell) or v4 (Broadwell) — up to 22 cores/socket",
      "1.5TB DDR4 ECC maximum RAM across 24 DIMM slots",
      "Cisco IMC (CIMC) for OS-independent remote management",
      "PCIe 3.0 expansion for 10GbE NIC, SAS HBA, or GPU cards",
      "Hot-plug drives, PSU, and fans for maximum uptime",
      "Excellent value for VMware, Hyper-V, and KVM virtualization"
    ]
  },
  {
    match: /UCS\s+C220\s+M3/i,
    specs: {
      Brand: "Cisco", "Form Factor": "Rack (1U)", Sockets: "2x LGA2011",
      Processor: "Intel Xeon E5-2600 v2 (Ivy Bridge-EP)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "768 GB DDR3",
      "Drive Bays": "2x 2.5\" SFF Hot-Swap SAS / SATA",
      Network: "2x Onboard Intel GbE", Management: "Cisco IMC (CIMC)",
      "Power Supply": "2x 650W Redundant Hot-Swap PSU",
      PCIe: "3x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dual-socket 1U Cisco UCS rack server for data center virtualization",
      "Intel Xeon E5-2600 v2 processors — up to 12 cores per socket",
      "768GB DDR3 ECC max across 24 DIMM slots",
      "Cisco IMC (CIMC) for remote out-of-band management",
      "Hot-swap drives and redundant PSU for enterprise-grade uptime",
      "Integrates with Cisco UCS Manager for centralized policy management",
      "Cost-effective for legacy VMware, Hyper-V, and compute clusters"
    ]
  },
  {
    match: /UCS\s+C240\s+M6/i,
    specs: {
      Brand: "Cisco", "Form Factor": "Rack (2U)", Sockets: "2x LGA4189",
      Processor: "Intel Xeon Scalable 3rd Gen (Ice Lake-SP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "32 DIMM Slots", "Max RAM": "8 TB DDR4",
      "Drive Bays": "24x 2.5\" NVMe / SAS / SATA Hot-Swap",
      Network: "2x Onboard Intel GbE", Management: "Cisco IMC (CIMC)",
      "Power Supply": "2x 1050W Redundant Hot-Swap PSU",
      PCIe: "6x PCIe 4.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "2U storage-dense Cisco UCS with Ice Lake-SP and PCIe 4.0",
      "24 hot-swap bays supporting full NVMe, SAS, or SATA configuration",
      "8TB DDR4 ECC maximum with 32 DIMM slots",
      "6x PCIe 4.0 slots for SAS HBA, NVMe HBA, 25/100GbE, or GPU",
      "Intel Xeon Scalable 3rd Gen — up to 40 cores per socket",
      "Cisco IMC for full lifecycle management with REST API",
      "Built for Ceph, vSAN, Nutanix, and software-defined storage"
    ]
  },
  {
    match: /UCS\s+C240\s+M5/i,
    specs: {
      Brand: "Cisco", "Form Factor": "Rack (2U)", Sockets: "2x LGA3647",
      Processor: "Intel Xeon Scalable 1st / 2nd Gen (Skylake / Cascade Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "3 TB DDR4",
      "Drive Bays": "24x 2.5\" NVMe / SAS / SATA or 12x 3.5\" LFF Hot-Swap",
      Network: "2x Onboard Intel GbE", Management: "Cisco IMC (CIMC)",
      "Power Supply": "2x 1050W Redundant Hot-Swap PSU",
      PCIe: "6x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "2U high-density Cisco UCS storage server with Xeon Scalable processors",
      "24 drive bays supporting NVMe, SAS, and SATA simultaneously",
      "3TB DDR4 max memory — ideal for big data and analytics",
      "Supports Intel Optane DCPMM for persistent memory tier",
      "6x PCIe 3.0 slots for flexible I/O expansion",
      "Cisco IMC with integrated HTML5 KVM for remote management",
      "Ideal for Hadoop, Spark, Ceph, and hyperconverged deployments"
    ]
  },
  {
    match: /UCS\s+C240\s+M4/i,
    specs: {
      Brand: "Cisco", "Form Factor": "Rack (2U)", Sockets: "2x LGA2011-3",
      Processor: "Intel Xeon E5-2600 v3 / v4 (Haswell-EP / Broadwell-EP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "1.5 TB DDR4",
      "Drive Bays": "24x 2.5\" SFF or 12x 3.5\" LFF Hot-Swap SAS / SATA",
      Network: "2x Onboard Intel GbE", Management: "Cisco IMC (CIMC)",
      "Power Supply": "2x 1200W Redundant Hot-Swap PSU",
      PCIe: "6x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "High-density 2U Cisco UCS storage server with DDR4 support",
      "Intel Xeon E5-2600 v3/v4 — up to 22 cores per socket",
      "Up to 1.5TB DDR4 ECC RAM across 24 DIMM slots",
      "24x 2.5\" or 12x 3.5\" hot-swap drive bays for massive storage capacity",
      "Cisco IMC out-of-band management with remote KVM",
      "6x PCIe 3.0 expansion slots for SAS HBA, 10GbE, or GPU",
      "Best for vSAN, SWIFT object storage, backup appliances, and Hadoop"
    ]
  },
  {
    match: /UCS\s+C240\s+M3/i,
    specs: {
      Brand: "Cisco", "Form Factor": "Rack (2U)", Sockets: "2x LGA2011",
      Processor: "Intel Xeon E5-2600 v2 (Ivy Bridge-EP)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "768 GB DDR3",
      "Drive Bays": "24x 2.5\" SFF or 12x 3.5\" LFF Hot-Swap SAS / SATA",
      Network: "2x Onboard Intel GbE", Management: "Cisco IMC (CIMC)",
      "Power Supply": "2x 650W Redundant Hot-Swap PSU",
      PCIe: "6x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "2U storage-optimized Cisco UCS with 24 hot-swap drive bays",
      "Dual Intel Xeon E5-2600 v2 — up to 12 cores per socket",
      "768GB DDR3 ECC max across 24 DIMM slots",
      "Cisco CIMC for remote management independent of the OS",
      "6x PCIe 3.0 slots for HBA, NIC, and storage controller expansion",
      "Ideal for scale-out NAS, backup appliances, and Hadoop clusters",
      "Cost-effective entry into Cisco UCS unified compute ecosystem"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  DELL POWEREDGE — RACK (by generation, 1U)
  // ══════════════════════════════════════════════════════════════
  {
    match: /PowerEdge\s+R6[68]0\b|PowerEdge\s+R660\b|PowerEdge\s+R680\b/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (1U)", Sockets: "2x LGA4677",
      Processor: "Intel Xeon Scalable 4th Gen (Sapphire Rapids)",
      "Max CPUs": "2", "RAM Type": "DDR5 ECC RDIMM / RDIMM 3DS",
      "RAM Slots": "16 DIMM Slots", "Max RAM": "2 TB DDR5",
      "Drive Bays": "8x 2.5\" or 4x 3.5\" Hot-Swap NVMe / SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC9 with OpenManage",
      "Power Supply": "2x 800W Redundant Hot-Swap PSU",
      PCIe: "3x PCIe 5.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "16th Gen Dell PowerEdge 1U rack server with Xeon Scalable 4th Gen",
      "PCIe 5.0 doubles bandwidth over Gen4 — ideal for NVMe and high-speed NICs",
      "DDR5 memory delivers 50% bandwidth improvement over DDR4",
      "iDRAC9 with OpenManage for comprehensive lifecycle management",
      "Supports CXL 1.1 memory expansion for near-memory compute",
      "Built for cloud-native applications, microservices, and AI inference",
      "Compact 1U design — efficient rack density for modern data centers"
    ]
  },
  {
    match: /PowerEdge\s+R650\b|PowerEdge\s+R6415\b|PowerEdge\s+R650xs\b/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (1U)", Sockets: "2x LGA4189",
      Processor: "Intel Xeon Scalable 3rd Gen (Ice Lake-SP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "16 DIMM Slots", "Max RAM": "2 TB DDR4",
      "Drive Bays": "10x 2.5\" or 4x 3.5\" Hot-Swap NVMe / SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC9 with OpenManage",
      "Power Supply": "2x 800W Redundant Hot-Swap PSU",
      PCIe: "3x PCIe 4.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "15th Gen Dell PowerEdge 1U with Xeon Scalable 3rd Gen (Ice Lake)",
      "Up to 40 cores per socket with PCIe 4.0 support",
      "2TB DDR4 ECC max — handles memory-intensive enterprise workloads",
      "iDRAC9 with OpenManage for automated lifecycle management",
      "10x hot-plug 2.5\" bays with NVMe/SAS/SATA flexibility",
      "Supports OCP 3.0 network adapters for flexible connectivity",
      "Ideal for cloud workloads, containerized apps, and edge compute"
    ]
  },
  {
    match: /PowerEdge\s+R640\b|PowerEdge\s+R640xs\b/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (1U)", Sockets: "2x LGA3647",
      Processor: "Intel Xeon Scalable 1st / 2nd Gen (Skylake / Cascade Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "3 TB DDR4",
      "Drive Bays": "8x 2.5\" or 4x 3.5\" Hot-Swap NVMe / SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC9 with OpenManage",
      "Power Supply": "2x 750W Redundant Hot-Swap PSU",
      PCIe: "3x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "14th Gen Dell PowerEdge 1U with Xeon Scalable processors",
      "Up to 28 cores per socket with AVX-512 instruction support",
      "3TB DDR4 ECC max across 24 DIMM slots",
      "iDRAC9 with OpenManage for automated, API-driven lifecycle management",
      "Supports Intel Optane DCPMM persistent memory",
      "NVMe-capable drive bays for ultra-low latency storage",
      "Best for VMware vSphere, SQL Server, Oracle, and SAP workloads"
    ]
  },
  {
    match: /PowerEdge\s+R630\b|PowerEdge\s+R630[^x]/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (1U)", Sockets: "2x LGA2011-3",
      Processor: "Intel Xeon E5-2600 v3 / v4 (Haswell-EP / Broadwell-EP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "768 GB DDR4",
      "Drive Bays": "8x 2.5\" or 4x 3.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC8 with OpenManage",
      "Power Supply": "2x 750W Redundant Hot-Swap PSU",
      PCIe: "3x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "13th Gen Dell PowerEdge 1U rack server with DDR4 ECC memory",
      "Intel Xeon E5-2600 v3/v4 — up to 22 cores per socket",
      "768GB DDR4 ECC max across 24 DIMM slots",
      "iDRAC8 for remote monitoring, KVM, and lifecycle management",
      "8x hot-swap 2.5\" SAS/SATA bays with RAID controller support",
      "Redundant hot-swap PSU and fans for 24/7 availability",
      "Cost-effective workhorse for virtualization, web serving, and databases"
    ]
  },
  {
    match: /PowerEdge\s+R620\b/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (1U)", Sockets: "2x LGA2011",
      Processor: "Intel Xeon E5-2600 v2 (Ivy Bridge-EP)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "768 GB DDR3",
      "Drive Bays": "8x 2.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC7 with OpenManage",
      "Power Supply": "2x 750W Redundant Hot-Swap PSU",
      PCIe: "3x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "12th Gen Dell PowerEdge 1U server — proven enterprise reliability",
      "Dual Intel Xeon E5-2600 v2 — up to 12 cores per socket",
      "24 DIMM slots supporting up to 768GB DDR3 ECC RAM",
      "iDRAC7 for remote management and system monitoring",
      "8x hot-swap 2.5\" bays with integrated RAID (H310 / H710)",
      "Redundant hot-swap PSU and fans",
      "Ideal for web hosting, email, DNS, and light virtualization"
    ]
  },
  {
    match: /PowerEdge\s+R610/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (1U)", Sockets: "2x LGA1366",
      Processor: "Intel Xeon E5500 / X5500 / X5600 (Nehalem / Westmere EP)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM",
      "RAM Slots": "18 DIMM Slots", "Max RAM": "192 GB DDR3",
      "Drive Bays": "6x 2.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC6 with OpenManage",
      "Power Supply": "2x 502W Redundant Hot-Swap PSU",
      PCIe: "2x PCIe 2.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days"
    },
    features: [
      "11th Gen Dell PowerEdge compact 1U rack server",
      "Dual Intel Xeon Nehalem/Westmere EP processors",
      "Up to 192GB DDR3 ECC RAM across 18 DIMM slots",
      "iDRAC6 for out-of-band remote management",
      "6x hot-swap 2.5\" SAS/SATA bays",
      "Redundant hot-swap PSU for continuous operation",
      "Economical choice for light workloads, dev/test, and LAMP stacks"
    ]
  },

  // DELL 2U RACK
  {
    match: /PowerEdge\s+R7[68]0\b|PowerEdge\s+R760\b/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (2U)", Sockets: "2x LGA4677",
      Processor: "Intel Xeon Scalable 4th Gen (Sapphire Rapids)",
      "Max CPUs": "2", "RAM Type": "DDR5 ECC RDIMM / RDIMM 3DS",
      "RAM Slots": "32 DIMM Slots", "Max RAM": "4 TB DDR5",
      "Drive Bays": "12x 3.5\" or 24x 2.5\" Hot-Swap NVMe / SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC9 with OpenManage",
      "Power Supply": "2x 1100W Redundant Hot-Swap PSU",
      PCIe: "6x PCIe 5.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "16th Gen Dell PowerEdge 2U flagship with Xeon Scalable 4th Gen",
      "PCIe 5.0 and DDR5 for next-generation workload performance",
      "4TB DDR5 ECC max across 32 DIMM slots",
      "Up to 24 NVMe/SAS/SATA hot-swap drive bays",
      "iDRAC9 with Telemetry and OpenManage for intelligent automation",
      "Supports CXL 1.1 for memory pooling and near-memory compute",
      "Built for AI/ML training, HPC, SAP HANA, and mission-critical databases"
    ]
  },
  {
    match: /PowerEdge\s+R750\b|PowerEdge\s+R750xa\b|PowerEdge\s+R750xs\b/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (2U)", Sockets: "2x LGA4189",
      Processor: "Intel Xeon Scalable 3rd Gen (Ice Lake-SP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "32 DIMM Slots", "Max RAM": "4 TB DDR4",
      "Drive Bays": "12x 3.5\" or 24x 2.5\" Hot-Swap NVMe / SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC9 with OpenManage",
      "Power Supply": "2x 1100W Redundant Hot-Swap PSU",
      PCIe: "6x PCIe 4.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "15th Gen Dell PowerEdge 2U with Ice Lake-SP and PCIe 4.0",
      "4TB DDR4 ECC max — massive memory for in-memory databases",
      "Up to 24 NVMe-capable hot-swap drive bays",
      "6x PCIe 4.0 slots for GPU, NVMe HBA, and 25/100GbE adapters",
      "iDRAC9 with OpenManage for automated lifecycle management",
      "Supports Intel Optane PMem 200 for persistent memory tier",
      "Ideal for SAP HANA, Oracle RAC, VMware vSAN, and HPC"
    ]
  },
  {
    match: /PowerEdge\s+R740\b|R740xd2\b|R740xd\b/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (2U)", Sockets: "2x LGA3647",
      Processor: "Intel Xeon Scalable 1st / 2nd Gen (Skylake / Cascade Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "3 TB DDR4",
      "Drive Bays": "8x 3.5\" or 16x 2.5\" Hot-Swap NVMe / SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC9 with OpenManage",
      "Power Supply": "2x 750W Redundant Hot-Swap PSU",
      PCIe: "6x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "14th Gen Dell PowerEdge 2U rack server with Xeon Scalable processors",
      "Up to 28 cores per socket with Intel AVX-512 instruction support",
      "3TB DDR4 ECC max across 24 DIMM slots",
      "Supports Intel Optane DCPMM for persistent memory",
      "iDRAC9 with OpenManage — API-driven, cloud-ready management",
      "NVMe-capable drive bays for enterprise flash storage",
      "Best-in-class 2U for VMware, Hyper-V, SQL Server, and SAP"
    ]
  },
  {
    match: /PowerEdge\s+R730xd|R730xd/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (2U)", Sockets: "2x LGA2011-3",
      Processor: "Intel Xeon E5-2600 v3 / v4 (Haswell-EP / Broadwell-EP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "1.5 TB DDR4",
      "Drive Bays": "26x 2.5\" or 14x 3.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC8 with OpenManage",
      "Power Supply": "2x 750W Redundant Hot-Swap PSU",
      PCIe: "5x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "13th Gen Dell PowerEdge high-density 2U storage server",
      "Up to 26x 2.5\" or 14x 3.5\" hot-swap drive bays",
      "Intel Xeon E5-2600 v3/v4 — up to 22 cores per socket",
      "1.5TB DDR4 ECC max across 24 DIMM slots",
      "iDRAC8 for remote management, KVM, and lifecycle control",
      "Built for scale-out storage, media archives, and backup appliances",
      "PERC H330/H730 RAID controller for data protection"
    ]
  },
  {
    match: /PowerEdge\s+R730\b|PowerEdge\s+R730[^x]/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (2U)", Sockets: "2x LGA2011-3",
      Processor: "Intel Xeon E5-2600 v3 / v4 (Haswell-EP / Broadwell-EP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "1.5 TB DDR4",
      "Drive Bays": "8x 3.5\" or 16x 2.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC8 with OpenManage",
      "Power Supply": "2x 750W Redundant Hot-Swap PSU",
      PCIe: "5x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "13th Gen Dell PowerEdge 2U workhorse with DDR4 memory",
      "Dual Intel Xeon E5-2600 v3/v4 — up to 22 cores per socket",
      "1.5TB DDR4 ECC max across 24 DIMM slots",
      "iDRAC8 with OpenManage for full remote lifecycle management",
      "Up to 16x 2.5\" or 8x 3.5\" hot-swap SAS/SATA bays",
      "PERC H330 / H730 RAID for configurable data protection",
      "Industry-standard choice for VMware, SQL Server, ERP, and file services"
    ]
  },
  {
    match: /PowerEdge\s+R720xd/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (2U)", Sockets: "2x LGA2011",
      Processor: "Intel Xeon E5-2600 v2 (Ivy Bridge-EP)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "768 GB DDR3",
      "Drive Bays": "26x 2.5\" or 14x 3.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC7 with OpenManage",
      "Power Supply": "2x 750W Redundant Hot-Swap PSU",
      PCIe: "5x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "12th Gen Dell PowerEdge high-capacity storage 2U server",
      "Up to 26x 2.5\" or 14x 3.5\" hot-swap drive bays",
      "Dual Intel Xeon E5-2600 v2 — up to 12 cores per socket",
      "768GB DDR3 ECC max across 24 DIMM slots",
      "iDRAC7 for remote management and monitoring",
      "Proven choice for NAS, backup servers, and media archives",
      "PERC H710P RAID controller for enterprise-grade data protection"
    ]
  },
  {
    match: /PowerEdge\s+R720[^x]/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (2U)", Sockets: "2x LGA2011",
      Processor: "Intel Xeon E5-2600 v2 (Ivy Bridge-EP)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "768 GB DDR3",
      "Drive Bays": "8x 3.5\" or 16x 2.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC7 with OpenManage",
      "Power Supply": "2x 750W Redundant Hot-Swap PSU",
      PCIe: "5x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "12th Gen Dell PowerEdge 2U server — reliable enterprise compute",
      "Dual Intel Xeon E5-2600 v2 processors — up to 12 cores each",
      "768GB DDR3 ECC max across 24 DIMM slots",
      "iDRAC7 for out-of-band remote management",
      "8x 3.5\" or 16x 2.5\" hot-swap SAS/SATA bays with RAID support",
      "Redundant hot-swap PSU and fans for continuous uptime",
      "Popular choice for SME virtualization, ERP, and database workloads"
    ]
  },
  {
    match: /PowerEdge\s+R720\b|PowerEdge\s+R720[^x]/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (2U)", Sockets: "2x LGA2011",
      Processor: "Intel Xeon E5-2600 v2 (Ivy Bridge-EP)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "768 GB DDR3",
      "Drive Bays": "8x 3.5\" or 16x 2.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC7 with OpenManage",
      "Power Supply": "2x 750W Redundant Hot-Swap PSU",
      PCIe: "5x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "12th Gen Dell PowerEdge 2U server — proven enterprise compute platform",
      "Dual Intel Xeon E5-2600 v2 (Ivy Bridge) — up to 12 cores per socket",
      "768GB DDR3 ECC max across 24 DIMM slots",
      "iDRAC7 for remote management, virtual KVM, and system monitoring",
      "8x 3.5\" or 16x 2.5\" hot-swap SAS/SATA drive bays with RAID support",
      "Redundant hot-swap PSU and fans for uninterrupted 24/7 operation",
      "Battle-tested platform for VMware, Hyper-V, ERP, and SQL Server"
    ]
  },
  {
    match: /PowerEdge\s+R710/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (2U)", Sockets: "2x LGA1366",
      Processor: "Intel Xeon X5600 / E5600 / X5500 (Westmere / Nehalem EP)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM",
      "RAM Slots": "18 DIMM Slots", "Max RAM": "288 GB DDR3",
      "Drive Bays": "8x 2.5\" or 6x 3.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC6 with OpenManage",
      "Power Supply": "2x 570W Redundant Hot-Swap PSU",
      PCIe: "4x PCIe 2.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days"
    },
    features: [
      "11th Gen Dell PowerEdge 2U — proven enterprise reliability",
      "Dual Intel Xeon Westmere/Nehalem EP — up to 12 cores total",
      "Up to 288GB DDR3 ECC across 18 DIMM slots",
      "iDRAC6 for remote server management",
      "8x hot-swap 2.5\" SAS/SATA bays",
      "Redundant hot-swap PSU and cooling",
      "Cost-effective platform for dev/test, archiving, and legacy applications"
    ]
  },

  // DELL TOWER SERVERS
  {
    match: /PowerEdge\s+T6[34]0|PowerEdge\s+T640/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower (5U)", Sockets: "2x LGA3647",
      Processor: "Intel Xeon Scalable 1st / 2nd Gen (Skylake / Cascade Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "3 TB DDR4",
      "Drive Bays": "Up to 18x 3.5\" or 32x 2.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC9 with OpenManage",
      "Power Supply": "2x 1100W Redundant Hot-Swap PSU",
      PCIe: "8x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "14th Gen Dell PowerEdge tower server with Xeon Scalable processors",
      "Massive expansion: up to 8x PCIe 3.0 slots and 32 drive bays",
      "3TB DDR4 ECC max — ideal for large-scale databases",
      "iDRAC9 OpenManage for remote and automated server management",
      "Hot-swap drives and redundant PSU for enterprise uptime",
      "Supports GPU cards for AI/ML workloads in a tower form factor",
      "Ideal for SMBs, branch offices, and compute-intensive on-site workloads"
    ]
  },
  {
    match: /PowerEdge\s+T[45][23]0|PowerEdge\s+T430|PowerEdge\s+T530/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower (5U)", Sockets: "2x LGA2011-3",
      Processor: "Intel Xeon E5-2600 v3 / v4 (Haswell-EP / Broadwell-EP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "16 DIMM Slots", "Max RAM": "512 GB DDR4",
      "Drive Bays": "Up to 8x 3.5\" or 16x 2.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC8 with OpenManage",
      "Power Supply": "2x 495W Redundant Hot-Swap PSU",
      PCIe: "5x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "13th Gen Dell PowerEdge tower with DDR4 ECC memory support",
      "Dual Intel Xeon E5-2600 v3/v4 — up to 22 cores per socket",
      "Up to 512GB DDR4 ECC RAM across 16 DIMM slots",
      "iDRAC8 for remote management and monitoring",
      "Hot-swap drives and optional redundant PSU",
      "5x PCIe 3.0 slots for GPU, NIC, and storage expansion",
      "Ideal for SMB file servers, ERP, collaboration, and edge computing"
    ]
  },
  {
    match: /PowerEdge\s+T[34][12]0|PowerEdge\s+T320|PowerEdge\s+T420/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower (5U)", Sockets: "2x LGA1356",
      Processor: "Intel Xeon E5-2400 v2 (Ivy Bridge-EN)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM / UDIMM",
      "RAM Slots": "12 DIMM Slots", "Max RAM": "192 GB DDR3",
      "Drive Bays": "Up to 8x 3.5\" or 8x 2.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC7 with OpenManage",
      "Power Supply": "1x 495W or 2x 495W Redundant Hot-Swap PSU",
      PCIe: "4x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "12th Gen Dell PowerEdge cost-effective tower server",
      "Dual Intel Xeon E5-2400 v2 — up to 20 cores total",
      "Up to 192GB DDR3 ECC RAM across 12 DIMM slots",
      "iDRAC7 for remote management and alerting",
      "Up to 8 hot-swap drive bays with RAID support (PERC H310/H710)",
      "Compact tower design suitable for office environments",
      "Ideal for SMB file serving, print, Active Directory, and backup"
    ]
  },
  {
    match: /PowerEdge\s+T1[345]0|PowerEdge\s+T140|PowerEdge\s+T150/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower", Sockets: "1x LGA1151",
      Processor: "Intel Xeon E-2200 / Core i-series (Coffee Lake / Comet Lake)",
      "Max CPUs": "1", "RAM Type": "DDR4 ECC UDIMM / RDIMM",
      "RAM Slots": "4 DIMM Slots", "Max RAM": "64 GB DDR4",
      "Drive Bays": "4x 3.5\" or 8x 2.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC9 Basic",
      "Power Supply": "1x 300W Non-Redundant PSU",
      PCIe: "2x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Entry-level Dell PowerEdge single-socket tower server",
      "Intel Xeon E-2200 series with ECC memory support",
      "Up to 64GB DDR4 ECC RAM — reliable for small business workloads",
      "iDRAC9 Basic for remote server management",
      "4x hot-swap 3.5\" bays with integrated RAID (PERC H330 optional)",
      "Compact, quiet tower design suitable for office deployment",
      "Ideal for SMB file sharing, print services, and light virtualization"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  DELL PRECISION — OLDER WORKSTATIONS
  // ══════════════════════════════════════════════════════════════
  {
    match: /Precision\s+T7920|Precision\s+7920/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower Workstation",
      Sockets: "2x LGA3647", Processor: "Intel Xeon Scalable (Skylake / Cascade Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM",
      "RAM Slots": "12 DIMM Slots", "Max RAM": "2 TB DDR4 ECC",
      Storage: "Up to 6x PCIe NVMe SSD + 2x HDD",
      "GPU Support": "Up to 4x GPUs (NVIDIA Quadro / RTX / Tesla)",
      "Power Supply": "2000W 92% Efficiency PSU", PCIe: "7x PCIe 3.0 Slots",
      OS: "Windows 10 Pro for Workstations", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dell Precision 7920 — flagship dual-socket tower workstation with Xeon Scalable",
      "Up to 56 total cores (2x 28-core Xeon) for extreme compute throughput",
      "2TB DDR4 ECC max — handles the largest simulation and AI models",
      "Up to 4 full-height GPU cards — multi-GPU deep learning and rendering",
      "7x PCIe 3.0 slots for maximum I/O flexibility",
      "ISV-certified for CATIA V6, Siemens NX, Ansys, 3ds Max, Maya",
      "Ideal for AI/ML training, film rendering, and large-scale CAE simulation"
    ]
  },
  {
    match: /Precision\s+T7910|Precision\s+7910/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower Workstation",
      Sockets: "2x LGA2011-3", Processor: "Intel Xeon E5-2600 v3 / v4 (Haswell-EP / Broadwell-EP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM",
      "RAM Slots": "16 DIMM Slots", "Max RAM": "1 TB DDR4 ECC",
      Storage: "Up to 3x PCIe NVMe M.2 + 2x HDD / SSD",
      "GPU Support": "Up to 2x Full-Width GPUs (NVIDIA Quadro / Tesla)",
      "Power Supply": "1300W 92% Efficiency PSU", PCIe: "5x PCIe 3.0 Slots",
      OS: "Windows 10 Pro for Workstations", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dell Precision T7910 dual-socket workstation with DDR4 memory platform",
      "2x Intel Xeon E5-2600 v3/v4 — up to 44 total cores",
      "1TB DDR4 ECC max for large engineering and scientific datasets",
      "Dual GPU support for multi-GPU rendering and GPGPU compute",
      "PCIe NVMe SSD for ultra-fast project and OS storage",
      "ISV-certified for SolidWorks, CATIA, Ansys, Maya, Houdini",
      "Proven platform for VFX production, CAD, and CFD simulation"
    ]
  },
  {
    match: /Precision\s+T7810|Precision\s+7810/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower Workstation",
      Sockets: "2x LGA2011-3", Processor: "Intel Xeon E5-2600 v3 / v4 (Haswell-EP / Broadwell-EP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM",
      "RAM Slots": "16 DIMM Slots", "Max RAM": "512 GB DDR4 ECC",
      Storage: "Up to 3x SATA + 1x M.2 SSD",
      "GPU Support": "Up to 2x Full-Width GPUs",
      "Power Supply": "825W PSU", PCIe: "5x PCIe 3.0 Slots",
      OS: "Windows 10 Pro for Workstations", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dell Precision 7810 dual-socket professional workstation",
      "2x Xeon E5-2600 v3/v4 — up to 22 cores per socket",
      "512GB DDR4 ECC max across 16 DIMM slots",
      "Dual GPU support for GPU-accelerated rendering and AI compute",
      "5x PCIe 3.0 slots for maximum expansion capability",
      "ISV-certified for leading CAD, CAE, and DCC applications",
      "Solid choice for simulation, VFX production, and AI workstation use"
    ]
  },
  {
    match: /Precision\s+T7[456]00|Precision\s+T7610/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower Workstation",
      Sockets: "2x LGA2011", Processor: "Intel Xeon E5-2600 v2 (Ivy Bridge-EP)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM",
      "RAM Slots": "16 DIMM Slots", "Max RAM": "512 GB DDR3 ECC",
      Storage: "4x SATA 3.5\" / 2.5\" bays",
      "GPU Support": "Up to 2x Full-Width GPUs (NVIDIA Quadro / AMD FirePro)",
      "Power Supply": "825W – 1300W PSU", PCIe: "Up to 5x PCIe 3.0 Slots",
      OS: "Windows 10 Pro for Workstations", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dell Precision dual-socket workstation — enterprise-grade DDR3 platform",
      "Dual Intel Xeon E5-2600 v2 — up to 24 total cores",
      "512GB DDR3 ECC max for simulation and memory-intensive CAD",
      "Multiple GPU slots for professional NVIDIA Quadro or AMD FirePro cards",
      "ISV-certified for AutoCAD, SolidWorks, CATIA, 3ds Max, and Maya",
      "Battle-tested platform widely deployed in engineering and VFX",
      "Cost-effective professional workstation for design studios and institutes"
    ]
  },
  {
    match: /Precision\s+T5810|Precision\s+5810/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower Workstation",
      Sockets: "1x LGA2011-3", Processor: "Intel Xeon E5-1600 v3/v4 or E5-2600 v3/v4",
      "Max CPUs": "1", "RAM Type": "DDR4 ECC RDIMM",
      "RAM Slots": "8 DIMM Slots", "Max RAM": "256 GB DDR4 ECC",
      Storage: "3x SATA + 1x M.2 SSD",
      "GPU Support": "Up to 2x Full-Width GPUs",
      "Power Supply": "685W PSU", PCIe: "4x PCIe 3.0 Slots",
      OS: "Windows 10 Pro for Workstations", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dell Precision 5810 single-socket workstation with DDR4 ECC support",
      "Intel Xeon E5-1600 v3/v4 or E5-2600 v3 — LGA2011-3 platform",
      "256GB DDR4 ECC max across 8 DIMM slots",
      "Supports dual professional GPU cards (full-height)",
      "ISV-certified for AutoCAD, SOLIDWORKS, Inventor, and Revit",
      "PCIe 3.0 slots for NVMe storage and expansion",
      "Cost-effective professional workstation for architects and engineers"
    ]
  },
  {
    match: /Precision\s+T5600|Precision\s+5600/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower Workstation",
      Sockets: "2x LGA2011", Processor: "Intel Xeon E5-2600 v2 (Ivy Bridge-EP)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM",
      "RAM Slots": "8 DIMM Slots", "Max RAM": "256 GB DDR3 ECC",
      Storage: "4x SATA bays",
      "GPU Support": "Up to 2x Full-Width GPU",
      "Power Supply": "825W PSU", PCIe: "3x PCIe 3.0 Slots",
      OS: "Windows 10 Pro for Workstations", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dell Precision T5600 dual-socket workstation — DDR3 ECC platform",
      "2x Xeon E5-2600 v2 — up to 24 total cores at a competitive price",
      "256GB DDR3 ECC max for engineering and 3D rendering",
      "Dual GPU support for NVIDIA Quadro or AMD FirePro",
      "ISV-certified for SolidWorks, AutoCAD, CATIA, and media production",
      "Reliable legacy platform for design studios and CAE engineers",
      "Cost-effective refurbished workstation with warranty"
    ]
  },
  {
    match: /Precision\s+T[35][35]00|Precision\s+T7500/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower Workstation",
      Sockets: "2x LGA1366", Processor: "Intel Xeon X5500 / X5600 / W3600 (Nehalem / Westmere)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM",
      "RAM Slots": "6–18 DIMM Slots", "Max RAM": "Up to 192 GB DDR3 ECC",
      Storage: "SATA / SAS HDD + SSD",
      "GPU Support": "1–2x Full-Width GPUs (NVIDIA Quadro / AMD FirePro)",
      "Power Supply": "875W PSU", PCIe: "PCIe 2.0 Slots",
      OS: "Windows 10 Pro", Condition: "Certified Refurbished", Warranty: "90 Days"
    },
    features: [
      "Dell Precision Nehalem/Westmere-era professional workstation",
      "Intel Xeon X5500/X5600 dual-socket for up to 24 total cores",
      "DDR3 ECC for reliable error-correcting computation",
      "Supports professional NVIDIA Quadro or AMD FirePro GPUs",
      "ISV-certified for AutoCAD, SolidWorks, and 3D Studio Max",
      "Battle-tested legacy platform for CAD and visualization",
      "Refurbished and tested — cost-effective for budget-constrained deployments"
    ]
  },
  {
    match: /Precision\s+T1700/i,
    specs: {
      Brand: "Dell", "Form Factor": "Mini Tower Workstation",
      Sockets: "1x LGA1150", Processor: "Intel Xeon E3-1200 v3 (Haswell)",
      "Max CPUs": "1", "RAM Type": "DDR3 ECC UDIMM",
      "RAM Slots": "4 DIMM Slots", "Max RAM": "32 GB DDR3 ECC",
      Storage: "1x SATA 3.5\" + 1x SATA 2.5\"",
      "GPU Support": "1x PCIe GPU (NVIDIA Quadro / AMD FirePro)",
      "Power Supply": "290W PSU", PCIe: "2x PCIe 3.0 Slots",
      OS: "Windows 10 Pro", Condition: "Certified Refurbished", Warranty: "90 Days"
    },
    features: [
      "Dell Precision T1700 compact entry-level professional workstation",
      "Intel Xeon E3-1200 v3 with ECC DDR3 memory support",
      "32GB DDR3 ECC max for reliable CAD and design workloads",
      "PCIe slot for NVIDIA Quadro or AMD FirePro professional GPU",
      "Small form factor — fits under desks in tight office spaces",
      "ISV-certified for AutoCAD LT, SolidWorks Standard, and Adobe CC",
      "Affordable entry into certified professional workstation territory"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  HP PROLIANT RACK — by generation
  // ══════════════════════════════════════════════════════════════
  {
    match: /ProLiant\s+(ML350|ML\d+)\s+Gen11|DL\d+.*Gen11|ML\d+.*Gen11/i,
    specs: {
      Brand: "HPE", "Form Factor": "Rack (1U / 2U)", Sockets: "2x LGA4677 (or 1x for entry)",
      Processor: "Intel Xeon Scalable 4th / 5th Gen (Sapphire Rapids / Emerald Rapids)",
      "Max CPUs": "2", "RAM Type": "DDR5 ECC RDIMM / LRDIMM",
      "RAM Slots": "Up to 32 DIMM Slots", "Max RAM": "Up to 8 TB DDR5",
      "Drive Bays": "Hot-Swap NVMe / SAS / SATA",
      Network: "Embedded FlexibleLOM Port", Management: "iLO 6 with HPE iLO Amplifier",
      "Power Supply": "Redundant Hot-Swap PSU (Flex Slot)",
      PCIe: "PCIe 5.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Latest HPE ProLiant Gen11 with Xeon Scalable 4th/5th Gen processors",
      "DDR5 memory delivering 50%+ bandwidth improvement over DDR4",
      "PCIe 5.0 for next-generation NVMe and GPU connectivity",
      "iLO 6 for AI-powered server health and lifecycle management",
      "Supports HPE GreenLake cloud services for hybrid IT",
      "Silicon Root of Trust (SRT) — HPE's built-in security anchor",
      "Built for AI/ML, cloud-native, HPC, and mission-critical workloads"
    ]
  },
  {
    match: /DL\d+.*Gen10\s*Plus|ML\d+.*Gen10\s*Plus/i,
    specs: {
      Brand: "HPE", "Form Factor": "Rack (1U / 2U)", Sockets: "2x LGA4189 (or 1x)",
      Processor: "Intel Xeon Scalable 2nd / 3rd Gen (Cascade Lake / Ice Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "Up to 32 DIMM Slots", "Max RAM": "Up to 8 TB DDR4",
      "Drive Bays": "Hot-Swap NVMe / SAS / SATA",
      Network: "Embedded FlexibleLOM Port", Management: "iLO 5 with OpenManage",
      "Power Supply": "Redundant Hot-Swap Flex Slot PSU",
      PCIe: "PCIe 4.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "HPE ProLiant Gen10 Plus with Xeon Scalable 2nd/3rd Gen and PCIe 4.0",
      "PCIe 4.0 doubles I/O bandwidth for high-speed NVMe and GPU workloads",
      "iLO 5 with Advanced Security — firmware attack protection",
      "Supports Intel Optane PMem 200 for persistent memory",
      "Silicon Root of Trust for hardware-level security",
      "FlexibleLOM for flexible 1GbE / 10GbE / 25GbE connectivity",
      "Ideal for VMware, SQL Server, SAP HANA, and containerized apps"
    ]
  },
  {
    match: /DL\d+.*(Gen10|G10)(?!\s*Plus)|ML\d+.*(Gen10|G10)(?!\s*Plus)/i,
    specs: {
      Brand: "HPE", "Form Factor": "Rack (1U / 2U)", Sockets: "2x LGA3647 (or 1x)",
      Processor: "Intel Xeon Scalable 1st Gen (Skylake / Cascade Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "Up to 24 DIMM Slots", "Max RAM": "Up to 3 TB DDR4",
      "Drive Bays": "Hot-Swap NVMe / SAS / SATA",
      Network: "Embedded FlexibleLOM Port", Management: "iLO 5 with OpenManage",
      "Power Supply": "Redundant Hot-Swap Flex Slot PSU",
      PCIe: "PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "HPE ProLiant Gen10 with Intel Xeon Scalable processors",
      "Up to 28 cores per socket with AVX-512 instruction support",
      "iLO 5 management with HPE RESTful API for automation",
      "Silicon Root of Trust — unique HPE hardware security anchor",
      "Supports Intel Optane DCPMM persistent memory",
      "FlexibleLOM for flexible 10GbE / 25GbE network connectivity",
      "Ideal for VMware vSphere, SQL Server, Oracle, and cloud platforms"
    ]
  },
  {
    match: /DL\d+[A-Z]?.*?(Gen9|G9)|ML\d+[A-Z]?.*?(Gen9|G9)|DL\d+[A-Z]?.*?(Gen8|G8)|ML\d+[A-Z]?.*?(Gen8|G8)/i,
    specs: {
      Brand: "HPE / HP", "Form Factor": "Rack (1U / 2U)", Sockets: "2x LGA2011-3 (Gen9) / LGA2011 (Gen8)",
      Processor: "Intel Xeon E5-2600 v3 / v4 (Gen9) or v2 (Gen8)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM (Gen9) / DDR3 (Gen8)",
      "RAM Slots": "Up to 24 DIMM Slots", "Max RAM": "Up to 3 TB (Gen9) / 768 GB (Gen8)",
      "Drive Bays": "Hot-Swap SAS / SATA",
      Network: "Embedded FlexibleLOM Port", Management: "iLO 4 with OpenManage",
      "Power Supply": "Redundant Hot-Swap Flex Slot PSU",
      PCIe: "PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "HP ProLiant Gen9/Gen8 — industry-proven enterprise rack server",
      "Intel Xeon E5-2600 v3/v4 (Gen9) or v2 (Gen8) dual-socket platform",
      "iLO 4 for remote management, virtual KVM, and power monitoring",
      "FlexibleLOM slot for 1GbE / 10GbE network adapter",
      "Hot-swap SAS/SATA drives and redundant PSU (Flex Slot)",
      "Smart Array controller for configurable RAID (P440 / B140i)",
      "Trusted workhorse for VMware, Hyper-V, Exchange, and SQL Server"
    ]
  },
  {
    match: /DL\d+[A-Z]?.*?(Gen7|G7)|DL\d+[A-Z]?.*?(Gen6|G6)|DL\d+[A-Z]?.*?Gen5/i,
    specs: {
      Brand: "HP", "Form Factor": "Rack (1U / 2U)", Sockets: "2x LGA1366",
      Processor: "Intel Xeon E5500 / X5500 / X5600 (Nehalem / Westmere EP)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM",
      "RAM Slots": "Up to 18 DIMM Slots", "Max RAM": "Up to 288 GB DDR3",
      "Drive Bays": "Hot-Swap SAS / SATA",
      Network: "2x Onboard NC326i GbE", Management: "iLO 3",
      "Power Supply": "Redundant Hot-Swap PSU",
      PCIe: "PCIe 2.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days"
    },
    features: [
      "HP ProLiant G6/G7 generation — reliable legacy enterprise server",
      "Dual Intel Xeon Nehalem/Westmere EP processors",
      "Up to 288GB DDR3 ECC RAM",
      "iLO 3 for remote management and virtual media",
      "Hot-swap SAS/SATA drives with Smart Array RAID controller",
      "Proven platform for Windows Server, VMware ESXi, and Linux",
      "Cost-effective choice for legacy applications and archival workloads"
    ]
  },

  // HP TOWER SERVERS
  {
    match: /ML\d+.*?(Gen10|G10)/i,
    specs: {
      Brand: "HPE", "Form Factor": "Tower", Sockets: "2x LGA3647 (or 1x)",
      Processor: "Intel Xeon Scalable (Skylake / Cascade Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "Up to 16 DIMM Slots", "Max RAM": "Up to 1 TB DDR4",
      "Drive Bays": "Up to 12x Hot-Swap SAS / SATA",
      Network: "Embedded FlexibleLOM", Management: "iLO 5",
      "Power Supply": "Redundant Hot-Swap Flex Slot PSU",
      PCIe: "PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "HPE ProLiant Gen10 tower server with Xeon Scalable processors",
      "iLO 5 with Silicon Root of Trust for hardware-level security",
      "DDR4 ECC memory for reliable 24/7 operation",
      "Hot-swap drives and optional redundant PSU",
      "Flexible PCIe expansion for GPU or storage controller",
      "Quiet, compact tower design suitable for office deployment",
      "Ideal for SMB file services, ERP, virtualization, and edge compute"
    ]
  },
  {
    match: /ML\d+[A-Z]?.*?(Gen9|G9|Gen8|G8)/i,
    specs: {
      Brand: "HP", "Form Factor": "Tower", Sockets: "2x LGA2011-3 (or 1x)",
      Processor: "Intel Xeon E5-2600 v3 / v4 (Haswell / Broadwell)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "Up to 16 DIMM Slots", "Max RAM": "Up to 1 TB DDR4",
      "Drive Bays": "Up to 8x Hot-Swap 3.5\" SAS / SATA",
      Network: "Embedded FlexibleLOM", Management: "iLO 4",
      "Power Supply": "Redundant Hot-Swap PSU (optional)",
      PCIe: "PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "HP ProLiant Gen9 tower with DDR4 memory support",
      "Intel Xeon E5-2600 v3/v4 — up to 22 cores per socket",
      "iLO 4 for remote management, KVM, and system monitoring",
      "Hot-swap drives with Smart Array RAID controller",
      "Expandable PCIe 3.0 slots for GPU, NIC, or storage HBA",
      "FlexibleLOM for optional 10GbE connectivity",
      "Reliable choice for SMB virtualization, file, and database servers"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  LENOVO THINKSYSTEM / THINKSERVER
  // ══════════════════════════════════════════════════════════════
  {
    match: /ThinkSystem\s+SR\d+[56]/i,
    specs: {
      Brand: "Lenovo", "Form Factor": "Rack (1U / 2U)",
      Processor: "Intel Xeon Scalable (Skylake / Cascade Lake / Ice Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "Up to 32 DIMM Slots", "Max RAM": "Up to 6 TB DDR4",
      "Drive Bays": "Hot-Swap NVMe / SAS / SATA",
      Network: "Onboard GbE + LOM", Management: "Lenovo XClarity Controller (XCC)",
      "Power Supply": "Redundant Hot-Swap Platinum / Titanium PSU",
      PCIe: "PCIe 3.0 / 4.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Lenovo ThinkSystem rack server with Intel Xeon Scalable processors",
      "XClarity Controller (XCC) for remote management and provisioning",
      "DDR4 ECC memory — up to 6TB max for large-scale workloads",
      "Hot-swap NVMe, SAS, and SATA drives with RAID support",
      "Platinum/Titanium-certified PSU for high energy efficiency",
      "XClarity Integrator for VMware, Microsoft, and OpenStack",
      "Designed for AI inference, databases, virtualization, and cloud"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  IBM SYSTEM X / XSERIES
  // ══════════════════════════════════════════════════════════════
  {
    match: /System\s+x3[56]\d0\s+M5|x3[56]\d0\s+M5/i,
    specs: {
      Brand: "IBM / Lenovo", "Form Factor": "Rack (1U / 2U)",
      Processor: "Intel Xeon E5-2600 v3 / v4 (Haswell / Broadwell)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "16 DIMM Slots", "Max RAM": "1 TB DDR4",
      "Drive Bays": "Hot-Swap SAS / SATA",
      Network: "2x Onboard GbE", Management: "IMM2 (Integrated Management Module 2)",
      "Power Supply": "Redundant Hot-Swap PSU",
      PCIe: "PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "IBM System x M5 — enterprise reliability with DDR4 support",
      "Intel Xeon E5-2600 v3/v4 dual-socket performance",
      "IMM2 for remote management, KVM, and power monitoring",
      "1TB DDR4 ECC max for memory-intensive enterprise workloads",
      "Hot-swap SAS/SATA drives with ServeRAID M5210 RAID controller",
      "Proven IBM/Lenovo engineering for 24/7 production environments",
      "Supported by IBM ServerGuide and Lenovo XClarity Administrator"
    ]
  },
  {
    match: /System\s+x3[56]\d0\s+M4|x3[56]\d0\s+M4/i,
    specs: {
      Brand: "IBM / Lenovo", "Form Factor": "Rack (1U / 2U)",
      Processor: "Intel Xeon E5-2600 v2 (Ivy Bridge-EP)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM / LRDIMM",
      "RAM Slots": "16 DIMM Slots", "Max RAM": "512 GB DDR3",
      "Drive Bays": "Hot-Swap SAS / SATA",
      Network: "2x Onboard GbE", Management: "IMM2 (Integrated Management Module 2)",
      "Power Supply": "Redundant Hot-Swap PSU",
      PCIe: "PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "IBM System x M4 — field-proven enterprise rack server",
      "Dual Intel Xeon E5-2600 v2 up to 12 cores per socket",
      "Up to 512GB DDR3 ECC across 16 DIMM slots",
      "IMM2 remote management with virtual KVM and media",
      "Hot-swap SAS/SATA with ServeRAID M5110e RAID",
      "IBM quality engineering for high availability workloads",
      "Ideal for virtualization, databases, and legacy enterprise apps"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  DELL WORKSTATIONS
  // ══════════════════════════════════════════════════════════════
  {
    match: /Precision\s+T7820|Precision\s+7820/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower Workstation",
      Sockets: "2x LGA3647", Processor: "Intel Xeon Scalable (Skylake / Cascade Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM",
      "RAM Slots": "12 DIMM Slots", "Max RAM": "1 TB DDR4 ECC",
      Storage: "Up to 4x PCIe NVMe SSD + 2x HDD / SSD",
      "GPU Support": "Up to 2x Double-Width GPUs (NVIDIA Quadro / RTX)",
      "Power Supply": "1400W 92% Efficiency PSU",
      PCIe: "6x PCIe 3.0 Slots (2x x16, 4x x8)", OS: "Windows 10 Pro for Workstations",
      Condition: "Certified Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dual-socket Dell Precision 7820 — professional workstation for heavy compute",
      "Supports 2x Intel Xeon Scalable — up to 56 total cores",
      "1TB DDR4 ECC max — handles largest CAD assemblies and VFX scenes",
      "Dual full-width GPU support for AI/ML training and 3D rendering",
      "PCIe NVMe storage for ultra-fast project load times",
      "ISV-certified for AutoCAD, SolidWorks, CATIA, Maya, 3ds Max",
      "Ideal for AI workstations, deep learning, VFX pipelines, and CAE"
    ]
  },
  {
    match: /Precision\s+T5820|Precision\s+5820/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower Workstation",
      Sockets: "1x LGA2066", Processor: "Intel Xeon W-2100 / W-2200 (Skylake-W / Cascade Lake-W)",
      "Max CPUs": "1", "RAM Type": "DDR4 ECC RDIMM",
      "RAM Slots": "8 DIMM Slots", "Max RAM": "256 GB DDR4 ECC",
      Storage: "Up to 2x PCIe NVMe SSD + 2x HDD / SSD",
      "GPU Support": "Up to 2x Double-Width GPUs (NVIDIA Quadro / RTX)",
      "Power Supply": "950W 92% Efficiency PSU",
      PCIe: "4x PCIe 3.0 Slots (1x x16, 2x x8, 1x x4)", OS: "Windows 10 Pro for Workstations",
      Condition: "Certified Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "Single-socket Dell Precision 5820 workstation with Xeon W platform",
      "Intel Xeon W-2200 series — up to 18 cores with AVX-512 support",
      "256GB DDR4 ECC max for large engineering models and VFX projects",
      "Supports dual full-width professional GPU cards",
      "PCIe NVMe M.2 SSD for fast OS and project storage",
      "ISV-certified for SOLIDWORKS, CATIA, Ansys, Abaqus, Maya, Houdini",
      "Best for mid-to-high tier CAD, CFD simulation, and 3D rendering"
    ]
  },
  {
    match: /Precision\s+3630|Precision\s+3[46][23]0/i,
    specs: {
      Brand: "Dell", "Form Factor": "Tower Workstation",
      Sockets: "1x LGA1151", Processor: "Intel Xeon E-2100 / E-2200 or Core i-series (Coffee Lake)",
      "Max CPUs": "1", "RAM Type": "DDR4 ECC UDIMM (Xeon E) / DDR4 UDIMM (Core i)",
      "RAM Slots": "4 DIMM Slots", "Max RAM": "64 GB DDR4",
      Storage: "1x PCIe NVMe M.2 + 2x SATA HDD / SSD",
      "GPU Support": "1x Double-Width or 2x Single-Width GPU",
      "Power Supply": "460W / 500W Efficiency PSU",
      PCIe: "3x PCIe 3.0 Slots", OS: "Windows 10 Pro for Workstations",
      Condition: "Certified Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "Entry-level Dell Precision tower workstation for professional tasks",
      "Intel Xeon E-2200 or Core i7/i9 — up to 8 cores with ECC support",
      "Up to 64GB DDR4 ECC RAM for reliable CAD and design work",
      "PCIe NVMe SSD for fast application launch and file access",
      "Supports NVIDIA Quadro / GeForce / AMD Radeon Pro GPU",
      "ISV-certified for AutoCAD, SolidWorks, and Adobe Creative Suite",
      "Cost-effective workstation for architects, designers, and engineers"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  HP WORKSTATIONS
  // ══════════════════════════════════════════════════════════════
  {
    match: /HP\s+Z8\s+G4|HPE?\s+Z8\s+G4/i,
    specs: {
      Brand: "HP", "Form Factor": "Tower Workstation",
      Sockets: "2x LGA3647", Processor: "Intel Xeon Scalable (Skylake / Cascade Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM",
      "RAM Slots": "24 DIMM Slots", "Max RAM": "3 TB DDR4 ECC",
      Storage: "Up to 6x NVMe SSD + HDD",
      "GPU Support": "Up to 4x GPUs (NVIDIA Quadro / RTX)",
      "Power Supply": "1700W Titanium PSU",
      PCIe: "7x PCIe 3.0 Slots", OS: "Windows 10 Pro for Workstations",
      Condition: "Certified Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "HP Z8 G4 — HP's flagship dual-socket professional workstation",
      "3TB DDR4 ECC max — largest memory capacity in a tower workstation",
      "Up to 4 GPU cards — built for multi-GPU deep learning and 3D rendering",
      "Intel Xeon Scalable with up to 28 cores per socket",
      "7x PCIe 3.0 slots for maximum I/O flexibility",
      "ISV-certified for CATIA V6, Ansys, Siemens NX, Autodesk Maya",
      "Ideal for AI/ML training, VFX, film rendering, and simulation"
    ]
  },
  {
    match: /HP\s+Z6\s+G4|HPE?\s+Z6\s+G4/i,
    specs: {
      Brand: "HP", "Form Factor": "Tower Workstation",
      Sockets: "2x LGA3647", Processor: "Intel Xeon Scalable (Skylake / Cascade Lake)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM",
      "RAM Slots": "12 DIMM Slots", "Max RAM": "384 GB DDR4 ECC",
      Storage: "Up to 4x NVMe SSD + HDD",
      "GPU Support": "Up to 2x GPUs (NVIDIA Quadro / RTX)",
      "Power Supply": "1000W Titanium PSU",
      PCIe: "5x PCIe 3.0 Slots", OS: "Windows 10 Pro for Workstations",
      Condition: "Certified Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "HP Z6 G4 — dual-socket mid-range professional workstation",
      "Intel Xeon Scalable with up to 28 cores per socket",
      "384GB DDR4 ECC max for large CAD assemblies and in-memory datasets",
      "Dual GPU support for accelerated rendering and AI compute",
      "NVMe PCIe SSD for fast project I/O",
      "ISV-certified for SolidWorks, CATIA, PTC Creo, and Siemens NX",
      "Ideal for CFD, FEA simulation, architectural visualization, and VFX"
    ]
  },
  {
    match: /HP\s+Z4\s+G4|HPE?\s+Z4\s+G4/i,
    specs: {
      Brand: "HP", "Form Factor": "Tower Workstation",
      Sockets: "1x LGA2066", Processor: "Intel Xeon W-2100 / W-2200 or Core X (Skylake-X / Cascade Lake-X)",
      "Max CPUs": "1", "RAM Type": "DDR4 ECC RDIMM",
      "RAM Slots": "8 DIMM Slots", "Max RAM": "256 GB DDR4 ECC",
      Storage: "Up to 3x NVMe M.2 SSD + 2x HDD / SSD",
      "GPU Support": "Up to 2x GPUs (NVIDIA Quadro / RTX)",
      "Power Supply": "700W / 1000W 90% Efficiency PSU",
      PCIe: "4x PCIe 3.0 Slots", OS: "Windows 10 Pro for Workstations",
      Condition: "Certified Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "HP Z4 G4 — single-socket professional workstation with Xeon W platform",
      "Intel Xeon W-2200 series — up to 18 cores with AVX-512 support",
      "256GB DDR4 ECC max for reliable error-free computation",
      "NVMe SSD support for ultra-fast storage performance",
      "Supports NVIDIA Quadro RTX and AMD Radeon Pro GPUs",
      "ISV-certified for AutoCAD, SOLIDWORKS, Inventor, and Revit",
      "Best for mid-range engineering, product design, and 3D rendering"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  STORAGE — HDD
  // ══════════════════════════════════════════════════════════════
  {
    match: /SAS\s+HDD|SAS\s+Hard\s+Drive|Enterprise\s+SAS/i,
    specs: {
      Type: "Enterprise SAS Hard Disk Drive", Interface: "SAS 6Gb/s or 12Gb/s",
      "Form Factor": "2.5\" SFF or 3.5\" LFF",
      RPM: "10,000 RPM or 15,000 RPM",
      "Cache Buffer": "64 MB – 256 MB",
      MTBF: "2,000,000 Hours",
      "Compatible Systems": "Dell PowerEdge, HP ProLiant, IBM System x, Lenovo ThinkSystem",
      "Use Case": "RAID arrays, enterprise databases, transaction processing",
      Condition: "Refurbished / Pull", Warranty: "90 Days"
    },
    features: [
      "Enterprise SAS hard drive — built for 24/7 server environments",
      "10K or 15K RPM for high IOPS transaction-heavy workloads",
      "SAS interface provides redundant data paths for fault tolerance",
      "Hot-swap compatible with Dell, HP, IBM, Lenovo server backplanes",
      "TLER (Time-Limited Error Recovery) for RAID reliability",
      "Tested and verified for enterprise-grade performance before shipping",
      "Ideal for OLTP databases, ERP systems, and RAID storage arrays"
    ]
  },
  {
    match: /SATA\s+HDD|SATA\s+Hard\s+Drive|SATA\s+\d+TB/i,
    specs: {
      Type: "Enterprise SATA Hard Disk Drive", Interface: "SATA III 6Gb/s",
      "Form Factor": "3.5\" LFF or 2.5\" SFF",
      RPM: "7,200 RPM",
      "Cache Buffer": "64 MB – 256 MB",
      MTBF: "1,000,000 – 2,000,000 Hours",
      "Compatible Systems": "Dell PowerEdge, HP ProLiant, Supermicro, NAS devices",
      "Use Case": "Bulk storage, backup, archival, NAS, sequential workloads",
      Condition: "Refurbished / Pull", Warranty: "90 Days"
    },
    features: [
      "Enterprise SATA HDD for high-capacity storage at low cost",
      "7200 RPM with large cache buffer for sequential read/write",
      "TLER support for reliable operation in RAID configurations",
      "Compatible with Dell PowerEdge, HP ProLiant, Supermicro, and NAS",
      "Ideal for backup targets, media storage, and archival workloads",
      "Power-efficient design for always-on storage environments",
      "Tested and inspected before shipping — refurbished to OEM standards"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  STORAGE — SPECIFIC HDD / SSD PRODUCTS
  // ══════════════════════════════════════════════════════════════
  {
    match: /15K.*SAS|SAS.*15K|15\s*k.*rpm.*SAS|SAS.*15\s*k/i,
    specs: {
      Type: "Enterprise SAS Hard Disk Drive", Interface: "SAS 6Gb/s or 12Gb/s",
      "Form Factor": "2.5\" SFF or 3.5\" LFF",
      RPM: "15,000 RPM", "Cache Buffer": "128 MB – 256 MB",
      MTBF: "2,000,000 Hours",
      "Compatible Systems": "Dell PowerEdge, HP ProLiant, IBM System x, Lenovo ThinkSystem",
      Condition: "Refurbished / Pull", Warranty: "90 Days"
    },
    features: [
      "15K RPM enterprise SAS HDD — highest IOPS in the spinning disk category",
      "Purpose-built for OLTP databases requiring low-latency random I/O",
      "SAS 12Gb/s interface with dual-port for redundant backplane paths",
      "TLER (Time-Limited Error Recovery) ensures RAID array stability",
      "Hot-swap compatible with Dell, HP, IBM, Lenovo backplanes",
      "Ideal for Oracle, SQL Server, ERP, and transactional storage",
      "Pull from decommissioned enterprise environments — tested before dispatch"
    ]
  },
  {
    match: /10K.*SAS|SAS.*10K|10\s*k.*rpm.*SAS|SAS.*10\s*k/i,
    specs: {
      Type: "Enterprise SAS Hard Disk Drive", Interface: "SAS 6Gb/s or 12Gb/s",
      "Form Factor": "2.5\" SFF", RPM: "10,000 RPM",
      "Cache Buffer": "64 MB – 128 MB", MTBF: "2,000,000 Hours",
      "Compatible Systems": "Dell PowerEdge, HP ProLiant, IBM System x, Lenovo ThinkSystem",
      Condition: "Refurbished / Pull", Warranty: "90 Days"
    },
    features: [
      "10K RPM enterprise SAS hard drive — balanced performance and capacity",
      "SAS interface with dual-port redundancy for enterprise backplane compatibility",
      "TLER enabled for reliable RAID operation without drive timeouts",
      "Hot-swap compatible with Dell, HP, IBM, Lenovo server backplanes",
      "Suitable for tier-2 storage: OLAP, email, file services, and virtualisation",
      "Tested for full rated capacity and SMART health before shipping",
      "Cost-effective spinning disk for mixed I/O workloads"
    ]
  },
  {
    match: /7\.2K.*SAS|SAS.*7\.2K|7\.2k.*rpm|7200.*SAS|SAS.*7200/i,
    specs: {
      Type: "Enterprise SAS Nearline (NL-SAS) Hard Disk Drive", Interface: "SAS 6Gb/s or 12Gb/s",
      "Form Factor": "3.5\" LFF", RPM: "7,200 RPM",
      "Cache Buffer": "64 MB – 256 MB", MTBF: "1,200,000 – 2,000,000 Hours",
      "Compatible Systems": "Dell PowerEdge, HP ProLiant, IBM System x, Lenovo ThinkSystem, Supermicro",
      Condition: "Refurbished / Pull", Warranty: "90 Days"
    },
    features: [
      "Enterprise NL-SAS 7.2K RPM — high capacity at lower cost per GB",
      "SAS interface with dual-port redundancy — more reliable than SATA in servers",
      "TLER support for safe RAID 5/6 operation",
      "Hot-swap compatible with all major server backplanes",
      "Designed for backup, archival, surveillance, and sequential workloads",
      "Larger capacities available (up to 12TB+ per drive)",
      "Verified SMART status and full-surface scan before dispatch"
    ]
  },
  {
    match: /SSD.*SAS|SAS.*SSD|Solid\s+State.*SAS/i,
    specs: {
      Type: "Enterprise SAS Solid State Drive (SSD)", Interface: "SAS 6Gb/s or 12Gb/s",
      "Form Factor": "2.5\" SFF", "Endurance": "High DWPD (3–10 DWPD typical)",
      "Sequential Read": "Up to 2100 MB/s", "Sequential Write": "Up to 1800 MB/s",
      MTBF: "2,000,000 Hours",
      "Compatible Systems": "Dell PowerEdge, HP ProLiant, IBM System x, Lenovo",
      Condition: "Refurbished / Pull", Warranty: "90 Days"
    },
    features: [
      "Enterprise SAS SSD — zero moving parts, ultra-low latency random I/O",
      "SAS 12Gb/s with dual-port for full backplane path redundancy",
      "High DWPD endurance rating for write-intensive enterprise workloads",
      "Power-loss protection capacitor prevents data corruption on sudden shutdown",
      "Drop-in replacement for SAS HDD — same backplane and hot-swap compatibility",
      "Ideal for tier-1 databases, VDI boot, and latency-sensitive applications",
      "Tested for SMART health and full-capacity validation before shipping"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  NETWORKING — CARDS
  // ══════════════════════════════════════════════════════════════
  {
    match: /10GbE|10\s*Gb\s*Ethernet|10G\s+NIC|SFP\+/i,
    specs: {
      Type: "10GbE Server Network Adapter", Interface: "PCIe 2.0 / 3.0 x8",
      Ports: "Dual Port (2x 10GbE SFP+) or Quad Port",
      Speed: "10 Gigabit Ethernet",
      Chipset: "Intel X520 / X540 / Mellanox ConnectX-3 / Broadcom BCM57810",
      "Compatible Systems": "Dell PowerEdge, HP ProLiant, Supermicro, IBM, Lenovo",
      "Supported OS": "Windows Server, RHEL, CentOS, Ubuntu, VMware ESXi",
      Condition: "Refurbished", Warranty: "90 Days"
    },
    features: [
      "10GbE server NIC — 10x faster than standard GbE for high-throughput workloads",
      "SFP+ ports support both 10GbE optical (LC fiber) and DAC twinax cables",
      "Low-latency data path ideal for iSCSI, NFS, and SMB/CIFS storage",
      "SR-IOV (Single Root I/O Virtualization) for direct VM NIC assignment",
      "Compatible with Dell, HP, Supermicro, IBM server PCIe slots",
      "Supports bonding/teaming for redundancy and link aggregation",
      "Ideal for vSAN, iSCSI SANs, backup networks, and cloud replication"
    ]
  },
  {
    match: /HBA|Host\s+Bus\s+Adapter|FC\s+HBA|Fibre\s+Channel/i,
    specs: {
      Type: "Fibre Channel Host Bus Adapter (FC HBA)", Interface: "PCIe 2.0 / 3.0 x8",
      Ports: "Dual Port (2x FC)", Speed: "8Gb/s or 16Gb/s Fibre Channel",
      Chipset: "Emulex LPe / QLogic QLE series",
      "Compatible Systems": "Dell PowerEdge, HP ProLiant, IBM, Lenovo, Supermicro",
      "Supported OS": "Windows Server, RHEL, ESXi, AIX",
      Condition: "Refurbished", Warranty: "90 Days"
    },
    features: [
      "Enterprise FC HBA for connecting servers to SAN storage arrays",
      "8Gb or 16Gb Fibre Channel — low latency, high IOPS SAN connectivity",
      "Dual-port for redundant fabric paths and multipathing (MPIO / DM-Multipath)",
      "Compatible with EMC, NetApp, HP 3PAR, IBM DS, and Pure Storage SANs",
      "HBA driver support for VMware ESXi, Windows Server, and Linux",
      "Boot from SAN capability for diskless server deployments",
      "Ideal for Oracle RAC, SQL Server clusters, and enterprise SAN environments"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  DELL — ENTRY 1U (single-socket E3 / Xeon E)
  // ══════════════════════════════════════════════════════════════
  {
    match: /PowerEdge\s+R2[123]0|PowerEdge\s+R250/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (1U)", Sockets: "1x LGA1151 / LGA1200",
      Processor: "Intel Xeon E-2300 / E-2200 / E3-1200 (Coffee Lake / Rocket Lake)",
      "Max CPUs": "1", "RAM Type": "DDR4 ECC UDIMM",
      "RAM Slots": "4 DIMM Slots", "Max RAM": "128 GB DDR4",
      "Drive Bays": "4x 3.5\" or 4x 2.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC9 Basic (R240/R250) / iDRAC8 (R230) / iDRAC7 (R220)",
      "Power Supply": "1x 250W or 1x 450W PSU",
      PCIe: "1–2x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Entry-level 1U Dell PowerEdge single-socket rack server",
      "Intel Xeon E-series with ECC memory for reliable SMB workloads",
      "Compact 1U design — fits in small server rooms and branch offices",
      "Hot-swap drive bays with optional RAID (PERC H330 Adapter)",
      "iDRAC for remote management and health monitoring",
      "Cost-effective for web servers, DNS, file services, and light VMs",
      "Low power consumption — ideal for always-on deployments"
    ]
  },
  {
    match: /PowerEdge\s+R3[1-5]0/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (1U)", Sockets: "1x LGA1151",
      Processor: "Intel Xeon E3-1200 v5 / v6 or Xeon E-2100 (Skylake / Kaby Lake / Coffee Lake)",
      "Max CPUs": "1", "RAM Type": "DDR4 ECC UDIMM",
      "RAM Slots": "4 DIMM Slots", "Max RAM": "64 GB DDR4",
      "Drive Bays": "4x 3.5\" or 4x 2.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC8 (R330) / iDRAC9 (R340/R350)",
      "Power Supply": "1x 350W or 1x 550W PSU",
      PCIe: "2x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "1U single-socket Dell PowerEdge for SMB and edge deployments",
      "Intel Xeon E3/E-2100 with ECC DDR4 memory for reliability",
      "Up to 64GB DDR4 ECC across 4 DIMM slots",
      "Hot-swap 3.5\" or 2.5\" SAS/SATA bays",
      "iDRAC8/9 for remote monitoring and management",
      "Small footprint 1U — perfect for remote sites and branch offices",
      "Ideal for AD, DHCP, DNS, file sharing, and light virtualization"
    ]
  },
  {
    match: /PowerEdge\s+R4[12][05]|PowerEdge\s+R415/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (1U)", Sockets: "2x LGA1356",
      Processor: "Intel Xeon E5-2400 v2 (Ivy Bridge-EN) or AMD Opteron 4200 (R415)",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM",
      "RAM Slots": "12 DIMM Slots", "Max RAM": "192 GB DDR3",
      "Drive Bays": "4x 3.5\" or 8x 2.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC7",
      "Power Supply": "1x 550W or 2x 550W Redundant PSU",
      PCIe: "3x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "12th Gen Dell PowerEdge value 1U dual-socket rack server",
      "Intel Xeon E5-2400 v2 — up to 10 cores per socket (LGA1356 platform)",
      "Up to 192GB DDR3 ECC across 12 DIMM slots",
      "iDRAC7 for remote management and monitoring",
      "Hot-swap SAS/SATA bays with PERC H310 / H710 RAID",
      "Optional redundant PSU for improved availability",
      "Cost-effective for web hosting, SMB virtualization, and databases"
    ]
  },
  {
    match: /PowerEdge\s+R4[34][05]|PowerEdge\s+R430|PowerEdge\s+R440|PowerEdge\s+R450/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (1U)", Sockets: "1–2x LGA (varies by model)",
      Processor: "Intel Xeon E5-2400 v2 (R430) / Xeon Scalable (R440) / Xeon Scalable 3rd Gen (R450)",
      "Max CPUs": "2 (R430) / 1 (R440 / R450)", "RAM Type": "DDR3 (R430) / DDR4 (R440/R450) ECC RDIMM",
      "RAM Slots": "12–16 DIMM Slots", "Max RAM": "192 GB (R430) / 1 TB (R440/R450)",
      "Drive Bays": "4–8x Hot-Swap SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC8 (R430) / iDRAC9 (R440/R450)",
      "Power Supply": "Redundant Hot-Swap PSU",
      PCIe: "2–3x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dell PowerEdge value-tier 1U rack server for cost-conscious deployments",
      "DDR4 ECC memory (R440/R450) for improved reliability over DDR3",
      "iDRAC8/9 for remote server lifecycle management",
      "Hot-swap SAS/SATA bays with PERC H330 / H730 RAID controller",
      "Compact 1U form factor for high-density rack deployments",
      "Redundant hot-swap PSU for improved uptime",
      "Suitable for web servers, DNS, file sharing, and virtualization"
    ]
  },
  {
    match: /PowerEdge\s+R5[23][05]|PowerEdge\s+R520|PowerEdge\s+R530|PowerEdge\s+R540|PowerEdge\s+R550/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (2U)", Sockets: "2x LGA1356 (R520/R530) / 1x LGA3647 (R540) / 1x LGA4189 (R550)",
      Processor: "Intel Xeon E5-2400 v2 (R520/R530) / Xeon Scalable (R540) / Xeon Scalable 3rd Gen (R550)",
      "Max CPUs": "2 (R520/R530) / 1 (R540/R550)",
      "RAM Type": "DDR3 ECC (R520/R530) / DDR4 ECC (R540/R550)",
      "RAM Slots": "12–16 DIMM Slots", "Max RAM": "192 GB (R520/R530) / 2 TB (R540/R550)",
      "Drive Bays": "8–12x Hot-Swap 3.5\" or 2.5\" SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC7 (R520) / iDRAC8 (R530) / iDRAC9 (R540/R550)",
      "Power Supply": "Redundant Hot-Swap PSU",
      PCIe: "3–5x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dell PowerEdge 2U value-tier rack server for storage and compute",
      "Up to 12 hot-swap 3.5\" LFF drive bays for bulk storage capacity",
      "Newer models (R540/R550) support DDR4 ECC with Xeon Scalable CPUs",
      "iDRAC for remote management, KVM access, and power control",
      "PERC RAID controller for configurable data protection",
      "Redundant hot-swap PSU for 24/7 availability",
      "Ideal for file servers, backup targets, and SMB virtualization"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  DELL — 4-SOCKET / HIGH-END
  // ══════════════════════════════════════════════════════════════
  {
    match: /PowerEdge\s+R820/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (2U)", Sockets: "4x LGA2011",
      Processor: "Intel Xeon E5-4600 v2 (Ivy Bridge-EX)",
      "Max CPUs": "4", "RAM Type": "DDR3 ECC RDIMM / LRDIMM",
      "RAM Slots": "48 DIMM Slots", "Max RAM": "1.5 TB DDR3",
      "Drive Bays": "8x 2.5\" Hot-Swap SAS / SATA",
      Network: "4x Onboard Broadcom GbE", Management: "iDRAC7 with OpenManage",
      "Power Supply": "2x 1100W Redundant Hot-Swap PSU",
      PCIe: "6x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "4-socket Dell PowerEdge 2U server — maximum compute density",
      "4x Intel Xeon E5-4600 v2 — up to 48 total cores in 2U",
      "1.5TB DDR3 ECC max across 48 DIMM slots",
      "iDRAC7 for comprehensive remote management",
      "Ideal for large-scale virtualization and in-memory databases",
      "High core count platform for Oracle and SAP licensing optimization",
      "Legacy workhorse for enterprise data center consolidation"
    ]
  },
  {
    match: /PowerEdge\s+R9[234]0|PowerEdge\s+R840|PowerEdge\s+R940/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (4U)", Sockets: "4x LGA3647 / LGA4189",
      Processor: "Intel Xeon Scalable / Xeon E7-8800 v4 (varies by model)",
      "Max CPUs": "4", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "48–96 DIMM Slots", "Max RAM": "Up to 12 TB DDR4",
      "Drive Bays": "8–24x Hot-Swap SAS / SATA / NVMe",
      Network: "4x Onboard Broadcom GbE", Management: "iDRAC8 / iDRAC9 with OpenManage",
      "Power Supply": "2x 1600W Redundant Hot-Swap PSU",
      PCIe: "12x PCIe 3.0 / 4.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "4-socket Dell PowerEdge — built for mission-critical enterprise workloads",
      "Up to 4x Intel Xeon Scalable CPUs with massive core count",
      "Up to 12TB DDR4 ECC for large in-memory databases (SAP HANA, Oracle)",
      "12x PCIe slots for maximum I/O — GPU arrays, NVMe, and 100GbE",
      "iDRAC8/9 with OpenManage for enterprise lifecycle automation",
      "Redundant everything: PSU, fans, RAID, and network paths",
      "Platform for Oracle RAC, SAP HANA scale-up, and Microsoft SQL Always On"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  DELL — AMD EPYC (R6x15/R6x25/R7x15/R7x25 series)
  // ══════════════════════════════════════════════════════════════
  {
    match: /PowerEdge\s+R6[46]15|PowerEdge\s+R6[68]25|PowerEdge\s+R7[46]15|PowerEdge\s+R7[68]25|C6525|R6415|R6515|R6525|R6615|R6625|R7415|R7425|R7515|R7525|R7615|R7625/i,
    specs: {
      Brand: "Dell", "Form Factor": "Rack (1U / 2U)",
      Processor: "AMD EPYC 7001 (Naples) / 7002 (Rome) / 7003 (Milan) — varies by model",
      "Max CPUs": "1–2 (AMD EPYC single/dual socket)",
      "RAM Type": "DDR4 ECC RDIMM / LRDIMM / 3DS RDIMM",
      "RAM Slots": "Up to 32 DIMM Slots", "Max RAM": "Up to 4 TB DDR4",
      "Drive Bays": "Up to 24x Hot-Swap NVMe / SAS / SATA",
      Network: "2x Onboard Broadcom GbE", Management: "iDRAC9 with OpenManage",
      "Power Supply": "Redundant Hot-Swap PSU",
      PCIe: "Up to 8x PCIe 4.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dell PowerEdge with AMD EPYC processor — high core count at competitive TCO",
      "AMD EPYC delivers up to 64 cores per socket (Rome/Milan)",
      "PCIe 4.0 support for NVMe storage and high-speed networking",
      "Massive memory bandwidth — 8 DDR4 channels per EPYC socket",
      "iDRAC9 with OpenManage for full remote lifecycle management",
      "Ideal for cloud-native workloads, HPC, and software-defined storage",
      "AMD EPYC memory security features: Secure Encrypted Virtualization (SEV)"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  DELL — BLADE
  // ══════════════════════════════════════════════════════════════
  {
    match: /PowerEdge\s+M6[34]0|PowerEdge\s+M[56][23]0|M1000e/i,
    specs: {
      Brand: "Dell", "Form Factor": "Blade Server / Enclosure",
      Processor: "Intel Xeon E5-2600 v3/v4 (M630) / Xeon Scalable (M640)",
      "Max CPUs": "2 per blade", "RAM Type": "DDR4 ECC RDIMM (M630/M640)",
      "RAM Slots": "24 DIMM Slots per blade", "Max RAM": "768 GB – 1.5 TB per blade",
      "Chassis": "Dell PowerEdge M1000e (up to 16 half-height blades)",
      Network: "Integrated LOM + optional Mezzanine cards", Management: "iDRAC8 / iDRAC9 with CMC",
      "Power Supply": "6x 2700W or 3x 5400W Redundant PSU (chassis)",
      PCIe: "Mezzanine card slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dell PowerEdge blade server for high-density compute environments",
      "Up to 16 blades per M1000e chassis — massive density per rack unit",
      "Shared chassis power, cooling, and networking reduce cabling complexity",
      "iDRAC with Chassis Management Controller (CMC) for unified management",
      "DDR4 ECC memory and dual Xeon CPUs per blade",
      "Mezzanine expansion for 10GbE, 16Gb FC, and InfiniBand",
      "Ideal for VDI, HPC clusters, and dense virtualization environments"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  SUPERMICRO SERVERS
  // ══════════════════════════════════════════════════════════════
  {
    match: /Supermicro.*1U|Supermicro.*SYS-1/i,
    specs: {
      Brand: "Supermicro", "Form Factor": "Rack (1U)", Sockets: "1–2x (varies by board)",
      Processor: "Intel Xeon E3 / E5 / Xeon Scalable or AMD EPYC (varies by model)",
      "Max CPUs": "1–2", "RAM Type": "DDR3 / DDR4 ECC RDIMM (depends on platform)",
      "RAM Slots": "4–24 DIMM Slots", "Max RAM": "Up to 3 TB DDR4",
      "Drive Bays": "4–10x 2.5\" or 3.5\" Hot-Swap SAS / SATA",
      Network: "2x Onboard Intel / Broadcom GbE", Management: "IPMI 2.0 (BMC)",
      "Power Supply": "1–2x Redundant Hot-Swap PSU",
      PCIe: "2–3x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Supermicro 1U rackmount server — flexible and customizable build-to-order design",
      "Supports Intel Xeon E3/E5/Scalable or AMD EPYC based on motherboard",
      "IPMI 2.0 (BMC) for full out-of-band remote management",
      "Hot-swap SAS/SATA drive bays with optional expander backplane",
      "Open architecture — compatible with standard ATX/EATX components",
      "Redundant hot-swap PSU and fans for enterprise availability",
      "Popular in cloud, HPC, GPU compute, and scale-out storage clusters"
    ]
  },
  {
    match: /Supermicro.*2U|Supermicro.*SYS-2|Supermicro.*Storage\s+Server/i,
    specs: {
      Brand: "Supermicro", "Form Factor": "Rack (2U)", Sockets: "1–2x (varies)",
      Processor: "Intel Xeon E5 / Scalable or AMD EPYC (varies by model)",
      "Max CPUs": "1–2", "RAM Type": "DDR4 ECC RDIMM / LRDIMM",
      "RAM Slots": "Up to 24 DIMM Slots", "Max RAM": "Up to 3 TB DDR4",
      "Drive Bays": "8–24x Hot-Swap 3.5\" / 2.5\" SAS / SATA / NVMe",
      Network: "2x Onboard Intel / Broadcom GbE", Management: "IPMI 2.0 (BMC)",
      "Power Supply": "2x Redundant Hot-Swap PSU",
      PCIe: "Up to 6x PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Supermicro 2U server with flexible compute and storage configuration",
      "Up to 24 hot-swap drive bays — ideal for storage-dense deployments",
      "Intel Xeon Scalable or AMD EPYC based on board selection",
      "IPMI 2.0 BMC for remote management without OS dependency",
      "Redundant hot-swap PSU and fans for 24/7 uptime",
      "Modular open architecture — customizable to specific workload needs",
      "Widely deployed in cloud, CDN, big data, and hyperconverged clusters"
    ]
  },
  {
    match: /Supermicro/i,
    specs: {
      Brand: "Supermicro", "Form Factor": "Rack Server (1U / 2U / 4U)",
      Processor: "Intel Xeon E3 / E5 / Scalable or AMD EPYC (varies by model)",
      "Max CPUs": "1–2", "RAM Type": "DDR3 / DDR4 ECC RDIMM",
      "RAM Slots": "Up to 24 DIMM Slots", "Max RAM": "Up to 3 TB DDR4",
      "Drive Bays": "Hot-Swap SAS / SATA / NVMe",
      Network: "2x Onboard GbE", Management: "IPMI 2.0 (BMC)",
      "Power Supply": "Redundant Hot-Swap PSU",
      PCIe: "PCIe 3.0 Slots", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Supermicro enterprise-grade server — designed for data center efficiency",
      "Open architecture supports a wide range of Intel and AMD CPU platforms",
      "IPMI 2.0 for full out-of-band remote management",
      "Hot-swap drives, PSU, and fans for continuous 24/7 operation",
      "Industry-leading power efficiency with 80 Plus Platinum PSU",
      "Popular in cloud, colocation, HPC, and storage server deployments",
      "Serverwale-tested and certified before shipping"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  HP BLADE SERVERS
  // ══════════════════════════════════════════════════════════════
  {
    match: /ProLiant\s+BL4[56]0c\s+Gen9|BL4[56]0c\s+G9/i,
    specs: {
      Brand: "HPE", "Form Factor": "Half-Height Blade (for c7000 / c3000 chassis)",
      Sockets: "2x LGA2011-3", Processor: "Intel Xeon E5-2600 v3 / v4 (Haswell / Broadwell EP)",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM",
      "RAM Slots": "16 DIMM Slots", "Max RAM": "512 GB DDR4",
      "Drive Bays": "2x 2.5\" SFF (optional FlexBay)",
      Network: "2x Flex-10 10Gb (FlexFabric-20/20)", Management: "iLO 4",
      "Expansion": "2x Mezzanine slots for FCoE, FC, InfiniBand, 10GbE",
      Condition: "Certified Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "HP ProLiant BL460c Gen9 — half-height blade server for c7000/c3000 chassis",
      "Dual Intel Xeon E5-2600 v3/v4 with DDR4 ECC memory support",
      "512GB DDR4 max per blade — ideal for dense virtualization",
      "Shared chassis infrastructure: power, cooling, networking, and management",
      "iLO 4 per blade for individual remote management",
      "2x Mezzanine slots for 10GbE, FC, FCoE, or InfiniBand connectivity",
      "Ideal for VDI, HPC, cloud platforms, and virtual desktop infrastructure"
    ]
  },
  {
    match: /ProLiant\s+BL4[56]0c\s+Gen8|BL4[56]0c\s+G8|BL4[56]0c\s+G7/i,
    specs: {
      Brand: "HP", "Form Factor": "Half-Height Blade (for c7000 / c3000 chassis)",
      Sockets: "2x LGA2011", Processor: "Intel Xeon E5-2600 v2 (Gen8) / E5-2600 (Gen7) Ivy Bridge / Sandy Bridge",
      "Max CPUs": "2", "RAM Type": "DDR3 ECC RDIMM",
      "RAM Slots": "16 DIMM Slots", "Max RAM": "384 GB DDR3",
      "Drive Bays": "2x 2.5\" SFF (optional)",
      Network: "2x Flex-10 10Gb (FlexFabric)", Management: "iLO 4 (Gen8) / iLO 3 (Gen7)",
      "Expansion": "2x Mezzanine slots",
      Condition: "Certified Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "HP ProLiant BL460c Gen8/G7 blade server for HPE BladeSystem enclosures",
      "Dual Xeon E5-2600 v2 processors — up to 12 cores each (Gen8)",
      "DDR3 ECC memory up to 384GB across 16 DIMM slots",
      "iLO 4 (Gen8) for individual blade remote management",
      "Shares chassis power, cooling, and switching fabric — reduces cabling",
      "Mezzanine expansion for 10GbE FlexFabric, FC, or InfiniBand",
      "Cost-effective option for high-density virtualization and VDI"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  NAS STORAGE
  // ══════════════════════════════════════════════════════════════
  {
    match: /QNAP|Synology|NAS\s+Server|Network\s+Attached\s+Storage|LinkStation|TeraStation|ReadyNAS|PowerVault\s+NX/i,
    specs: {
      Type: "Network Attached Storage (NAS)",
      "Drive Bays": "2–24 Bay (varies by model)",
      Interface: "Gigabit Ethernet (1GbE) / 10GbE (on higher-end models)",
      "Supported RAID": "RAID 0, 1, 5, 6, 10 (varies by model)",
      "Max Capacity": "Depends on drive size and bay count",
      "Compatible Drives": "3.5\" SATA HDD, 2.5\" SSD",
      OS: "QTS (QNAP) / DSM (Synology) / Proprietary firmware",
      Protocol: "SMB/CIFS, NFS, AFP, FTP, iSCSI", Condition: "Refurbished",
      Warranty: "90 Days"
    },
    features: [
      "Network-attached storage for centralised file access over LAN/WAN",
      "Supports SMB, NFS, AFP, and FTP for cross-platform file sharing",
      "Hardware RAID with hot-swap drives for continuous data availability",
      "Built-in backup software for local, remote, and cloud backup",
      "iSCSI target support — presents storage as block device to servers",
      "Low-power ARM/x86 CPU for always-on 24/7 operation",
      "Ideal for SMB file sharing, media storage, surveillance, and backup"
    ]
  },
  {
    match: /SAN\s+Storage|Fiber\s+Channel\s+SAN|EMC\s+VNX|NetApp\s+FAS|HP\s+3PAR|Dell\s+PowerVault\s+MD|Dell\s+EMC\s+SC/i,
    specs: {
      Type: "SAN Storage Array", Interface: "8Gb / 16Gb Fibre Channel or 10GbE iSCSI",
      "Drive Bays": "12–96 Drive Bays (varies by model)",
      "Supported Drives": "SAS HDD, SAS SSD, NVMe SSD",
      "Supported RAID": "RAID 5, 6, 10, DP (RAID 6-variant)",
      Controllers: "Dual Active-Active Controllers for high availability",
      Protocol: "Fibre Channel, iSCSI, FCoE",
      "Max Raw Capacity": "Depends on drive configuration",
      Condition: "Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "Enterprise SAN storage array with dual active-active controllers",
      "Fibre Channel or iSCSI connectivity to server hosts",
      "Thin provisioning and deduplication for storage efficiency",
      "Automatic tiering between SSD and SAS drives (where supported)",
      "Snapshot and replication for disaster recovery and business continuity",
      "Hot-swap drives, PSUs, and controllers for zero-downtime maintenance",
      "Ideal for Oracle RAC, SQL Server clusters, VMware, and VDI workloads"
    ]
  },
  {
    match: /Storage\s+Server|Server.*Storage|NAS.*Server|Storage.*Server/i,
    specs: {
      Type: "High-Density Storage Server",
      "Form Factor": "Rack (2U / 4U)",
      Processor: "Intel Xeon E5 / Scalable (varies by model)",
      "RAM": "16 GB – 256 GB DDR4 ECC",
      "Drive Bays": "12–60x Hot-Swap 3.5\" SAS / SATA",
      "Max Raw Storage": "Depends on drive size installed",
      "RAID Support": "Hardware RAID via SAS/HBA controller",
      Network: "Dual GbE or 10GbE", Management: "IPMI / iLO / iDRAC",
      Condition: "Certified Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "Purpose-built high-density storage server for data-intensive workloads",
      "Up to 60 hot-swap 3.5\" drive bays for massive raw capacity",
      "Supports SAS and SATA HDDs and SSDs simultaneously",
      "Hardware RAID or HBA pass-through for software-defined storage",
      "10GbE network support for fast data access across the network",
      "Out-of-band management via IPMI, iDRAC, or iLO",
      "Ideal for Ceph, GlusterFS, ZFS, scale-out NAS, and backup targets"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  GRAPHICS CARDS
  // ══════════════════════════════════════════════════════════════
  {
    match: /NVIDIA\s+Quadro\s+RTX\s+8000|NVIDIA\s+Quadro\s+RTX\s+6000/i,
    specs: {
      Brand: "NVIDIA", Type: "Professional GPU", GPU: "Turing (TU102)",
      "VRAM": "48 GB GDDR6 (RTX 8000) / 24 GB GDDR6 (RTX 6000)",
      "CUDA Cores": "4,608 CUDA Cores", "Tensor Cores": "576 (2nd Gen)",
      "RT Cores": "72 (1st Gen)", Interface: "PCIe 3.0 x16",
      "Display Outputs": "4x DisplayPort 1.4 + 1x VirtualLink (USB-C)",
      "Power Consumption": "295W TDP", "Cooling": "Active (Dual-fan blower)",
      Condition: "Refurbished", Warranty: "90 Days"
    },
    features: [
      "NVIDIA Quadro RTX flagship professional GPU with real-time ray tracing",
      "48GB GDDR6 ECC VRAM (RTX 8000) — handles largest 3D scenes and AI models",
      "2nd Gen Tensor Cores for AI/deep learning acceleration (FP16/INT8/INT4)",
      "1st Gen RT Cores for hardware-accelerated ray and path tracing",
      "NVLink support (RTX 8000) for 96GB combined VRAM in dual-GPU setup",
      "ISV-certified for Autodesk, Adobe, Siemens, PTC, and Dassault products",
      "Ideal for AI training, VFX, architectural visualization, and CAE"
    ]
  },
  {
    match: /NVIDIA\s+Quadro\s+RTX\s+4000/i,
    specs: {
      Brand: "NVIDIA", Type: "Professional GPU", GPU: "Turing (TU104)",
      "VRAM": "8 GB GDDR6 ECC", "CUDA Cores": "2,304 CUDA Cores",
      "Tensor Cores": "288 (2nd Gen)", "RT Cores": "36 (1st Gen)",
      Interface: "PCIe 3.0 x16",
      "Display Outputs": "3x DisplayPort 1.4 + 1x VirtualLink (USB-C)",
      "Power Consumption": "160W TDP (single 6-pin connector)", "Cooling": "Active (single blower)",
      Condition: "Refurbished", Warranty: "90 Days"
    },
    features: [
      "NVIDIA Quadro RTX 4000 — professional mid-range GPU with ray tracing",
      "8GB GDDR6 ECC VRAM for reliable professional visualization",
      "2nd Gen Tensor Cores for AI/ML inference and deep learning",
      "Real-time ray tracing via dedicated RT Cores",
      "Low single-6-pin power requirement — fits most workstation PSUs",
      "ISV-certified for AutoCAD, Revit, SOLIDWORKS, Maya, and Houdini",
      "Ideal for 3D CAD, architectural rendering, and media production"
    ]
  },
  {
    match: /NVIDIA\s+Quadro\s+K\d+/i,
    specs: {
      Brand: "NVIDIA", Type: "Professional GPU (Kepler / Maxwell)",
      GPU: "Kepler GK104 / GK107 / Maxwell GM200 (varies by model)",
      "VRAM": "2 GB – 12 GB GDDR5 ECC", "CUDA Cores": "256 – 3,072 CUDA Cores",
      Interface: "PCIe 2.0 / 3.0 x16",
      "Display Outputs": "4x DisplayPort 1.2 (varies)",
      Condition: "Refurbished", Warranty: "90 Days"
    },
    features: [
      "NVIDIA Quadro K-series professional GPU — ISV-certified stability",
      "ECC VRAM for error-correcting computation — critical for professional CAD",
      "OpenGL and DirectX hardware support for 3D professional applications",
      "Supports multi-monitor setups (up to 4 displays simultaneously)",
      "ISV-certified for AutoCAD, SolidWorks, CATIA, and 3ds Max",
      "Enterprise driver support lifecycle for long-term deployment",
      "Cost-effective professional GPU for workstations and design studios"
    ]
  },
  {
    match: /NVIDIA\s+NVS\s+\d+|NVIDIA\s+NVS/i,
    specs: {
      Brand: "NVIDIA", Type: "Professional Multi-Display GPU",
      "VRAM": "1 GB – 4 GB DDR3 / GDDR5", "CUDA Cores": "48 – 192 CUDA Cores",
      Interface: "PCIe 2.0 / 3.0 x16",
      "Display Outputs": "2–4x DisplayPort / DVI",
      "Power Consumption": "< 25W (passive / low-profile cooling)", "Form Factor": "Low Profile",
      Condition: "Refurbished", Warranty: "90 Days"
    },
    features: [
      "NVIDIA NVS — professional low-power multi-display GPU for businesses",
      "Ultra-low power (< 25W) — passive or quiet cooling for office environments",
      "Low-profile card fits standard and slim workstations",
      "2–4 independent display outputs for productivity multi-monitor setups",
      "Certified for professional applications: Excel, AutoCAD LT, SAP GUI",
      "Enterprise-grade driver stability with NVIDIA Quadro driver package",
      "Ideal for finance, trading, control rooms, and digital signage"
    ]
  },
  {
    match: /NVIDIA\s+GeForce\s+RTX\s+3090/i,
    specs: {
      Brand: "NVIDIA", Type: "Consumer GPU (Ampere)",
      GPU: "GA102", "VRAM": "24 GB GDDR6X",
      "CUDA Cores": "10,496 CUDA Cores", "Tensor Cores": "328 (3rd Gen)",
      "RT Cores": "82 (2nd Gen)", Interface: "PCIe 4.0 x16",
      "Power Consumption": "350W TDP (3x 8-pin or 1x 12-pin)",
      "Memory Bandwidth": "936 GB/s", Condition: "Refurbished", Warranty: "90 Days"
    },
    features: [
      "NVIDIA GeForce RTX 3090 — Ampere flagship with 24GB GDDR6X VRAM",
      "24GB GDDR6X at 936 GB/s — near-professional GPU memory capacity",
      "10,496 CUDA Cores with 3rd Gen Tensor Cores for AI workloads",
      "2nd Gen RT Cores for real-time ray tracing in games and renders",
      "PCIe 4.0 x16 for maximum bandwidth on compatible platforms",
      "Popular for AI/ML model training, Stable Diffusion, and 3D rendering",
      "High-performance option for VFX artists, researchers, and AI engineers"
    ]
  },
  {
    match: /NVIDIA\s+GeForce|NVIDIA\s+GTX|NVIDIA\s+RTX/i,
    specs: {
      Brand: "NVIDIA", Type: "Consumer / Prosumer GPU",
      "VRAM": "4 GB – 24 GB GDDR5 / GDDR6 / GDDR6X",
      "CUDA Cores": "Varies by model", Interface: "PCIe 3.0 / 4.0 x16",
      Condition: "Refurbished", Warranty: "90 Days"
    },
    features: [
      "NVIDIA GeForce GPU — high-performance graphics for gaming and content creation",
      "GDDR6 / GDDR6X high-bandwidth memory for rendering and AI tasks",
      "CUDA cores for GPU-accelerated computing (Blender, DaVinci Resolve, AI)",
      "Supports NVIDIA NVENC hardware video encoding for live streaming",
      "Compatible with PCIe 3.0 and 4.0 x16 slots",
      "Tested and refurbished to full working condition",
      "Suitable for 3D rendering, AI inference, video editing, and gaming"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  LAPTOPS
  // ══════════════════════════════════════════════════════════════
  {
    match: /ThinkPad|Latitude|EliteBook|ProBook/i,
    specs: {
      Brand: "Lenovo / Dell / HP (varies)", Type: "Business Laptop",
      Processor: "Intel Core i5 / i7 (varies by model and generation)",
      "RAM": "8 GB – 32 GB DDR4", Storage: "256 GB – 1 TB SSD",
      Display: "13.3\" – 15.6\" FHD IPS Anti-Glare",
      Battery: "6-cell Li-Ion (up to 12 hours, varies)", OS: "Windows 10 Pro / Windows 11 Pro",
      Ports: "USB 3.x, USB-C / Thunderbolt, HDMI, SD Card, RJ-45 (varies)",
      Condition: "Certified Refurbished (Grade A)", Warranty: "90 Days – 1 Year"
    },
    features: [
      "Enterprise-grade business laptop — built for professional productivity",
      "Intel Core i5/i7 processor for smooth multi-tasking and office workloads",
      "DDR4 RAM and SSD storage for fast boot and application performance",
      "Military-grade durability rating (MIL-STD-810G on select models)",
      "Full HD IPS anti-glare display for comfortable extended use",
      "Long battery life for all-day field and remote work",
      "Serverwale-certified refurbished — tested, cleaned, and warranted"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  COMPONENTS — COOLING
  // ══════════════════════════════════════════════════════════════
  {
    match: /Server\s+Fan|Cooling\s+Fan|Heatsink|Heat\s+Sink|CPU\s+Fan|Chassis\s+Fan/i,
    specs: {
      Type: "Server Cooling Component (Fan / Heatsink)",
      "Compatible Systems": "Dell PowerEdge, HP ProLiant, IBM System x, Lenovo ThinkSystem",
      Connector: "4-pin PWM (varies by model)",
      "Airflow Direction": "Front-to-Rear (standard server airflow)",
      Condition: "Refurbished / Pull", Warranty: "90 Days"
    },
    features: [
      "OEM server cooling component — guaranteed compatibility with listed server models",
      "Hot-swap fan modules (on supported platforms) for zero-downtime replacement",
      "PWM-controlled speed for intelligent thermal management",
      "Maintains ASHRAE A1/A2 operating temperatures in rack environments",
      "Tested for RPM accuracy and airflow performance before shipping",
      "Replaces failed fans without interrupting server operation",
      "Certified to restore full cooling capacity to specification"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  COMPONENTS — POWER SUPPLIES
  // ══════════════════════════════════════════════════════════════
  {
    match: /Power\s+Supply|PSU|Watt.*Server|Server.*Watt/i,
    specs: {
      Type: "Server Power Supply Unit (PSU)",
      "Compatible Systems": "Dell PowerEdge, HP ProLiant, IBM System x, Supermicro",
      Rating: "460W – 1600W (varies by model)",
      "Efficiency": "80 Plus Gold / Platinum rated",
      "Form Factor": "Redundant Hot-Swap (1+1 configuration)",
      Connector: "Universal Backplane Connector (model-specific)",
      Condition: "Refurbished / Pull", Warranty: "90 Days"
    },
    features: [
      "OEM server PSU — drop-in replacement for certified server models",
      "Hot-swap redundant design — replace failed PSU without powering down",
      "80 Plus Gold / Platinum efficiency — reduces energy costs in data centers",
      "Built-in power factor correction (PFC) for stable input power",
      "Over-voltage, over-current, and short-circuit protection",
      "Tested at full load before shipping — guaranteed rated wattage output",
      "Restores full N+1 redundancy to server infrastructure"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  IBM SERVERS (additional models)
  // ══════════════════════════════════════════════════════════════
  {
    match: /IBM\s+(BladeCenter|HS[0-9]+)|System\s+x.*Blade/i,
    specs: {
      Brand: "IBM / Lenovo", "Form Factor": "Blade Server",
      Processor: "Intel Xeon E5-2600 v2 (Ivy Bridge-EP)",
      "Max CPUs": "2 per blade", "RAM Type": "DDR3 ECC RDIMM",
      "RAM Slots": "16 DIMM Slots", "Max RAM": "384 GB DDR3 per blade",
      Chassis: "IBM BladeCenter E / H / S (up to 14 blades)",
      Network: "Integrated CNA / GbE pass-through", Management: "IMM2 + Advanced Management Module (AMM)",
      Condition: "Certified Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "IBM BladeCenter HS23 — high-density blade server with dual Xeon E5-2600 v2",
      "Shared chassis: power, cooling, and switching fabrics for simplified management",
      "384GB DDR3 ECC per blade for virtualisation and data warehouse workloads",
      "IMM2 per blade for individual remote management",
      "Advanced Management Module (AMM) for centralised chassis management",
      "Mezzanine expansion for 10GbE, FC, and InfiniBand connectivity",
      "Proven IBM engineering for mission-critical enterprise deployments"
    ]
  },
  {
    match: /IBM\s+(x3[1-4][0-9]{2}\s+M[3-5]|x3[0-9]{3}\s+M[0-9]|TS\s+1[0-9]{2}|x3[0-9]+)|System\s+x3[0-9]+/i,
    specs: {
      Brand: "IBM / Lenovo", "Form Factor": "Rack (1U / 2U) or Tower",
      Processor: "Intel Xeon E3-1200 / E5-2400 / E5-2600 (varies by model)",
      "Max CPUs": "1–2", "RAM Type": "DDR3 ECC RDIMM / UDIMM",
      "RAM Slots": "4–16 DIMM Slots", "Max RAM": "Up to 512 GB DDR3",
      "Drive Bays": "Hot-Swap SAS / SATA",
      Network: "2x Onboard GbE", Management: "IMM2 (Integrated Management Module 2)",
      "Power Supply": "Redundant Hot-Swap PSU (where applicable)",
      Condition: "Certified Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "IBM System x enterprise server — field-proven IBM engineering reliability",
      "IMM2 for out-of-band remote management and system health monitoring",
      "ECC DDR3 memory for error-correcting reliable computation",
      "Hot-swap SAS/SATA drives with ServeRAID M-series RAID controller",
      "Supported by IBM ServerGuide and Lenovo XClarity tools",
      "Backed by decades of IBM data center design expertise",
      "Cost-effective refurbished option for legacy IBM-based environments"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  AMC & SERVICES
  // ══════════════════════════════════════════════════════════════
  {
    match: /AMC|Annual\s+Maintenance|Server\s+AMC|Maintenance\s+Contract/i,
    specs: {
      "Service Type": "Annual Maintenance Contract (AMC)",
      "Coverage": "Hardware fault diagnosis, repair, and part replacement",
      "Response Time": "4–8 Hours On-Site (NBD) / Remote (same day)",
      "Contract Duration": "1 Year (renewable)",
      "Supported Brands": "Dell, HP, IBM, Lenovo, Supermicro",
      "Includes": "Preventive maintenance, health checks, firmware updates",
      Location: "Pan-India (Delhi NCR same day)"
    },
    features: [
      "Comprehensive Annual Maintenance Contract for server infrastructure",
      "4-8 hour on-site response time for critical hardware failures",
      "Preventive maintenance visits every quarter — catch issues before they fail",
      "Firmware and driver updates to keep servers patched and optimised",
      "Spare parts coverage — major components replaced at no extra charge",
      "Dedicated account manager and 24/7 helpdesk support",
      "Reduces unplanned downtime and extends server operational life"
    ]
  },
  {
    match: /Server\s+Repair|Repair.*Server|Server\s+Service|Server\s+Support/i,
    specs: {
      "Service Type": "Server Repair Service",
      "Turnaround": "Same Day (Delhi NCR) / 24–72 Hours (Pan India)",
      "Diagnosis": "Free hardware diagnosis before repair",
      "Supported Brands": "Dell PowerEdge, HP ProLiant, IBM System x, Lenovo, Supermicro, Cisco UCS",
      "Common Repairs": "PSU replacement, RAM/CPU failure, motherboard repair, RAID rebuild",
      Location: "Nehru Place Service Center, New Delhi + Pan-India Pickup/Drop"
    },
    features: [
      "Expert server repair for all major brands — Dell, HP, IBM, Lenovo, Cisco",
      "Free diagnostic to identify root cause before any repair is started",
      "Same-day turnaround for critical repairs at Nehru Place service centre",
      "Genuine OEM and compatible spare parts used for all replacements",
      "Post-repair burn-in testing to verify full functionality",
      "RAID data recovery and array rebuild service available",
      "90-day warranty on all repaired components"
    ]
  },
  {
    match: /Server\s+Management|Remote\s+Management/i,
    specs: {
      "Service Type": "Managed Server Services / Remote Server Management",
      "Management Scope": "OS administration, monitoring, patching, backup",
      "Monitoring": "24/7 proactive monitoring with alert escalation",
      "Supported OS": "Windows Server (all versions), RHEL, CentOS, Ubuntu, VMware ESXi",
      "Response": "15-minute alert response; 1-hour SLA for critical incidents",
      "Tools": "Nagios, Zabbix, Ansible, SCCM, Puppet (as applicable)"
    },
    features: [
      "24/7 proactive server monitoring — CPU, RAM, disk, and network health",
      "OS patching and security updates on a scheduled or on-demand basis",
      "Automated backup configuration and verification",
      "Performance tuning and capacity planning recommendations",
      "Incident response with defined SLAs (15 min alert, 1 hr resolution)",
      "Reduces need for in-house IT staff — outsource to certified engineers",
      "Detailed monthly health reports and uptime metrics"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  RENTALS
  // ══════════════════════════════════════════════════════════════
  {
    match: /Server\s+Rental|Rent.*Server|Server.*Rent/i,
    specs: {
      "Service Type": "Short-Term / Long-Term Server Rental",
      "Rental Period": "Daily / Weekly / Monthly",
      "Server Types": "HP ProLiant, Dell PowerEdge, IBM, Supermicro",
      "Configurations": "Custom — specify CPU, RAM, Storage, OS",
      Location: "Pan-India delivery (Same Day Delhi NCR)",
      Support: "24/7 Remote Support included",
      "Setup Time": "Same Day (Delhi NCR) / 24-48 Hrs (Pan India)",
      "Use Cases": "Events, Testing, DevOps, Burst Capacity, DR"
    },
    features: [
      "Flexible server rental — daily, weekly, or monthly with no long-term commitment",
      "Choose from HP ProLiant, Dell PowerEdge, IBM, and Supermicro configurations",
      "Custom RAM, CPU, and storage configurations to match your exact needs",
      "Pre-configured with OS (Windows Server / CentOS / Ubuntu) on request",
      "Same-day delivery within Delhi NCR — ideal for urgent requirements",
      "Eliminates upfront CapEx for temporary or seasonal compute needs",
      "24/7 remote support and hardware replacement guarantee"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  LENOVO THINKSTATION
  // ══════════════════════════════════════════════════════════════
  {
    match: /ThinkStation\s+P[5-9]|ThinkStation\s+P\d{3}/i,
    specs: {
      Brand: "Lenovo", "Form Factor": "Tower Workstation",
      Processor: "Intel Xeon W / Core i-series or AMD Ryzen PRO (varies by model)",
      "Max CPUs": "1–2", "RAM Type": "DDR4 ECC RDIMM / UDIMM",
      "RAM Slots": "8–16 DIMM Slots", "Max RAM": "Up to 1 TB DDR4 ECC",
      Storage: "NVMe PCIe SSD + SATA HDD / SSD",
      "GPU Support": "Up to 2x Professional GPU (NVIDIA Quadro / RTX)",
      OS: "Windows 10 / 11 Pro for Workstations", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Lenovo ThinkStation professional workstation — ISV-certified performance",
      "Supports Intel Xeon W or Core i-series with ECC memory",
      "NVMe PCIe SSD for fast OS and project storage",
      "Professional GPU support for NVIDIA Quadro / RTX visualization",
      "ISV-certified for SolidWorks, AutoCAD, Revit, and DCC tools",
      "Lenovo reliability with enterprise-grade support lifecycle",
      "Ideal for engineering design, 3D modelling, and media production"
    ]
  },
  {
    match: /ThinkStation\s+P330\s+Tiny|ThinkStation.*Tiny/i,
    specs: {
      Brand: "Lenovo", "Form Factor": "Tiny / Ultra-Compact Workstation",
      Sockets: "1x LGA1151", Processor: "Intel Xeon E-2100 / Core i-series",
      "Max CPUs": "1", "RAM Type": "DDR4 ECC SODIMM",
      "RAM Slots": "2 DIMM Slots", "Max RAM": "32 GB DDR4 ECC",
      Storage: "1x PCIe NVMe M.2 + 1x SATA 2.5\"",
      "GPU Support": "Optional: NVIDIA Quadro P620 (via PCIe Riser)",
      "Power Supply": "135W – 230W External Power Adapter",
      PCIe: "1x PCIe 3.0 x16 (via riser, optional)",
      OS: "Windows 10 Pro", Condition: "Certified Refurbished", Warranty: "90 Days – 1 Year"
    },
    features: [
      "Lenovo ThinkStation P330 Tiny — compact workstation for tight spaces",
      "Intel Xeon E-2100 with ECC DDR4 SODIMM — error-correcting memory",
      "PCIe Riser slot for optional NVIDIA Quadro GPU add-on",
      "Ultra-small footprint — mounts behind monitor or under desk",
      "NVMe SSD for fast boot and application performance",
      "Ideal for CAD, GIS, and architectural drafting in space-limited environments",
      "Enterprise-grade ECC reliability in an ultra-small form factor"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  DESKTOPS (generic fallback for remaining)
  // ══════════════════════════════════════════════════════════════
  {
    match: /OptiPlex|ThinkCentre|ProDesk|EliteDesk|IdeaCentre|Vostro\s+\d{4}/i,
    specs: {
      Brand: "Dell / Lenovo / HP (varies)", Type: "Business Desktop PC",
      Processor: "Intel Core i5 / i7 or Xeon E-series (varies by model)",
      "RAM": "8 GB – 32 GB DDR4", Storage: "256 GB – 1 TB SSD or HDD",
      "Form Factor": "SFF / Micro / Mini Tower",
      OS: "Windows 10 Pro (COA Included)", Network: "Onboard GbE + Optional Wi-Fi",
      Ports: "USB 3.x, HDMI / DisplayPort, RJ-45", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Enterprise-grade business desktop PC — refurbished and certified",
      "Intel Core i5/i7 processor for smooth office and productivity workloads",
      "SSD storage for fast boot, quick application launch, and reliable operation",
      "Compact form factor — fits under desk or in small office spaces",
      "Windows 10 Pro COA included — genuine licensed OS",
      "Tested for CPU, RAM, storage, and connectivity before dispatch",
      "Ideal for office productivity, ERP, POS systems, and business applications"
    ]
  },

  // ══════════════════════════════════════════════════════════════
  //  GENERIC FALLBACKS FOR SEO / MISC PRODUCTS
  // ══════════════════════════════════════════════════════════════
  {
    match: /Rental|On\s+Rent|For\s+Rent|Workstation.*Rent|Rent.*Workstation|KVM\s+Switch|Firewall.*Rental|Rental.*Firewall/i,
    specs: {
      "Service Type": "Short-Term / Long-Term Equipment Rental",
      "Rental Period": "Daily / Weekly / Monthly",
      "Available Equipment": "Servers, Workstations, Networking Devices, KVM Switches",
      Location: "Pan-India (Same Day Delhi NCR)",
      Support: "24/7 Technical Support included",
      "Setup Time": "Same Day (Delhi NCR) / 24–48 Hrs (Pan India)"
    },
    features: [
      "Flexible equipment rental — no long-term commitment required",
      "Wide range: servers, workstations, networking equipment, KVM switches",
      "Custom configuration to match your exact compute and storage needs",
      "Pre-tested and pre-configured equipment delivered to your site",
      "Same-day delivery within Delhi NCR for urgent requirements",
      "24/7 technical support and hardware replacement guarantee",
      "Reduces CapEx — ideal for events, DR drills, and burst capacity"
    ]
  },
  {
    match: /Price\s+List|Pricing|Cost\s+of\s+Server|Server\s+Price/i,
    specs: {
      "Service Type": "Server Pricing Guide / Consultation",
      "Coverage": "HP ProLiant, Dell PowerEdge, IBM, Lenovo, Cisco UCS, Supermicro",
      "Pricing Basis": "Configuration-based quotation (CPU, RAM, Storage, OS)",
      "Response Time": "30 minutes during business hours",
      Location: "Nehru Place, New Delhi + Pan-India delivery"
    },
    features: [
      "Get transparent, configuration-based pricing for enterprise servers",
      "Covers all major brands: HP, Dell, Lenovo, IBM, Cisco, Supermicro",
      "Pricing based on exact CPU, RAM, storage, and OS configuration required",
      "30-minute quotation response during business hours",
      "Includes warranty, testing certification, and delivery charges",
      "Bulk discounts available for multi-unit orders",
      "Contact Serverwale for custom configurations and volume pricing"
    ]
  },
  {
    match: /GPU\s+Server|AI\s+Server|Deep\s+Learning\s+Server|Rendering\s+Server|Mining\s+Server/i,
    specs: {
      Brand: "Custom / Multi-Brand", "Form Factor": "Rack (1U / 2U / 4U) or Tower",
      Processor: "Intel Xeon Scalable or AMD EPYC",
      "Max CPUs": "2", "RAM Type": "DDR4 ECC RDIMM",
      "RAM Slots": "Up to 24 DIMM Slots", "Max RAM": "Up to 3 TB DDR4",
      "GPU Slots": "Up to 8x GPU (NVIDIA Tesla / A100 / H100 / RTX / Quadro)",
      "GPU Interconnect": "NVLink (on supported NVIDIA GPUs)",
      Network: "10GbE / 25GbE / 100GbE (InfiniBand optional)",
      Management: "IPMI / iDRAC / iLO", Condition: "Configured to Order",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Dedicated GPU compute server — built for AI/ML training and inference",
      "Supports NVIDIA Tesla, A100, H100, RTX A-series, or Quadro GPUs",
      "NVLink GPU interconnect enables multi-GPU unified memory addressing",
      "High-bandwidth 25GbE / 100GbE networking for fast data pipelines",
      "Intel Xeon Scalable or AMD EPYC for balanced CPU-GPU compute",
      "Configured to order — specify GPU count, VRAM, storage, and networking",
      "Ideal for AI model training, 3D rendering, HPC simulations, and VFX"
    ]
  },
  {
    match: /Rack\s+Server|Refurbished\s+Server|Used\s+Server|Second\s+Hand\s+Server|Enterprise\s+Server/i,
    specs: {
      Brand: "HP / Dell / IBM / Lenovo / Supermicro",
      "Form Factor": "Rack (1U / 2U / 4U)",
      Processor: "Intel Xeon E5 / Scalable or AMD EPYC (varies by model)",
      "Max CPUs": "2", "RAM Type": "DDR3 / DDR4 ECC RDIMM",
      "RAM Slots": "12–32 DIMM Slots", "Max RAM": "Up to 3 TB",
      "Drive Bays": "Hot-Swap SAS / SATA",
      Network: "Dual GbE (onboard)", Management: "iDRAC / iLO / IMM / IPMI",
      "Power Supply": "Redundant Hot-Swap PSU", Condition: "Certified Refurbished",
      Warranty: "90 Days – 1 Year"
    },
    features: [
      "Certified refurbished rack server — tested and warranted by Serverwale",
      "Available in HP, Dell, IBM, Lenovo, Supermicro — wide range of configurations",
      "Hot-swap drives, PSU, and fans for enterprise-grade availability",
      "Remote management via iDRAC, iLO, or IPMI for out-of-band access",
      "ECC RAM for error-correcting memory — critical for data integrity",
      "Redundant hot-swap PSU for uninterrupted 24/7 operation",
      "Saves 60–80% over new hardware while maintaining enterprise performance"
    ]
  },

];

// ─── APPLY RULES ───────────────────────────────────────────────────────────
async function run() {
  const con = await mysql.createConnection(db_config);
  console.log("✅ Connected to MySQL");

  const [rows] = await con.execute(
    "SELECT id, name FROM shop_products"
  );
  console.log(`📦 Total products: ${rows.length}`);

  let updated = 0, skipped = 0;

  for (const row of rows) {
    const name = row.name || "";
    let matched = null;

    for (const rule of RULES) {
      if (rule.match.test(name)) {
        matched = rule;
        break;
      }
    }

    if (!matched) { skipped++; continue; }

    await con.execute(
      "UPDATE shop_products SET specifications = ?, features = ? WHERE id = ?",
      [
        JSON.stringify(matched.specs),
        JSON.stringify(matched.features),
        row.id
      ]
    );
    updated++;
  }

  await con.end();
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭  Skipped (no rule matched): ${skipped}`);
}

run().catch(err => { console.error("❌ Error:", err); process.exit(1); });
