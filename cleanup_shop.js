/**
 * Serverwale Shop - Comprehensive Product Cleanup Script
 * -------------------------------------------------------
 * 1. Maps 253 messy categories → clean "Main > Sub" hierarchy
 * 2. Fixes image field (CSV → main image + images JSON array)
 * 3. Adds random star ratings (3.5–5.0) where missing
 * 4. Adds category-based SEO specifications
 * 5. Generates keyword-rich short descriptions
 * 6. Removes duplicate products (same name, keep lowest id)
 * 7. Rebuilds shop_categories table with clean hierarchy
 */

const mysql = require("mysql2/promise");

const DB_CONFIG = {
  host: "localhost",
  user: "root",
  password: "",
  database: "serverwale",
  waitForConnections: true,
  connectionLimit: 10,
};

// =====================================================
// CATEGORY MAPPING
// =====================================================
function determineCategory(oldCat, productName) {
  const cat = (oldCat || "").toLowerCase();
  const name = (productName || "").toLowerCase();

  // CLOUD
  if (cat.includes("cloud vps") || cat.includes("cloud"))
    return "Cloud & VPS > Cloud VPS Plans";

  // LAPTOPS
  if (cat.includes("laptop") || name.includes("laptop"))
    return "Laptops > All Laptops";

  // RENTALS (check before generic server/storage/network)
  if (cat.includes("server rental") || cat.includes("it rental") || cat.includes("it rentals") || cat.includes("server > server rental"))
    return "Rentals > Server Rental";
  if (cat.includes("nas storage rental") || cat.includes("san storage rental") || cat.includes("das storage rental") || (cat.includes("storage rental") && !cat.includes("storage server")))
    return "Rentals > Storage Rental";
  if (cat.includes("firewall rental") || cat.includes("network equipment rental") || cat.includes("network switches rental") || cat.includes("routers rental") || cat.includes("checkpoint firewall rental") || cat.includes("cisco firewall rental") || cat.includes("fortgate rental") || cat.includes("fortigate rental") || cat.includes("palo alto firewall rental") || cat.includes("pfsense firewall rental") || cat.includes("sonicwall firewall rental") || cat.includes("sophos firewall rental") || cat.includes("juniper firewall rental") || cat.includes("datacenter firewall rental") || cat.includes("enterprise firewall rental") || cat.includes("cisco server rental") || cat.includes("huawei server rental") || cat.includes("dell server rental") || cat.includes("hp server rental") || cat.includes("ibm server rental"))
    return "Rentals > Server Rental";
  if (cat.includes("workstation rental"))
    return "Rentals > Workstation Rental";
  if (cat.includes("das storage rental"))
    return "Rentals > Storage Rental";

  // AMC & SERVICES
  if (cat.includes("server amc") || cat.includes("dell server amc") || cat.includes("hp server amc") || cat.includes("ibm server amc"))
    return "AMC & Services > Server AMC";
  if (cat.includes("server repair"))
    return "AMC & Services > Server Repair";
  if (cat.includes("server management") || cat.includes("monitoring service"))
    return "AMC & Services > Server Management";
  if (cat.includes("pricing list"))
    return "AMC & Services > Pricing Lists";

  // DESKTOPS
  if ((cat.includes("desktop") && !cat.includes("server")) || cat.includes("certified excellent renewed") || cat.includes("ncomputing"))
    return "Desktops > Refurbished Desktops";

  // COMPONENTS
  if (cat.includes("graphic card") || cat.includes("graphics card") || cat.includes("graphics-card") || cat.includes("nvidia graphic") || cat.includes("amd graphic"))
    return "Components > Graphics Cards";
  if (cat.includes("intel xeon") || cat.includes("processor") || (cat.includes("cpu") && !cat.includes("server")))
    return "Components > Processors & CPUs";
  if (cat.includes("power-supply") || cat.includes("power supply"))
    return "Components > Power Supplies";
  if (cat.includes("cooling fan") || cat.includes("heatsink"))
    return "Components > Cooling";

  // STORAGE - SSD (before HDD)
  if (cat.includes("sata ssd") || cat.includes("solid state drive") || (cat.includes("ssd") && !cat.includes("server")))
    return "Storage > Solid State Drives";

  // STORAGE - HDD
  if (cat.includes("sas hdd") || cat.includes("sata hdd") || cat.includes("harddrive") || cat.includes("hard disk") ||
    cat.includes("sas hard") || cat.includes("sata hard") ||
    /\d+tb sas/.test(cat) || /\d+gb sas/.test(cat) || /\d+(tb|gb) sata/.test(cat) ||
    cat.includes('2.5" sas') || cat.includes('2.5" sata') || cat.includes('3.5" sas') ||
    cat.includes("600gb") || cat.includes("900gb") || cat.includes("1.2tb") || cat.includes("1.8tb") ||
    cat.includes("brand new sas") || cat.includes("brand new sata") || cat.includes("brand new seagate") ||
    cat.includes("dell sas") || cat.includes("dell sata") || cat.includes("hp sas") || cat.includes("hp sata") ||
    cat.includes("ibm sas") || cat.includes("seagate sas") || cat.includes("server sas") || cat.includes("server sata") ||
    cat.includes("supermicro sas") || cat.includes("refurbished sas") || cat.includes("refurbished sata"))
    return "Storage > Hard Disk Drives";

  // STORAGE - SAN
  if (cat.includes("san storage") || cat.includes("hp msa san") || cat.includes("dell emc unity") ||
    cat.includes("hpe 3par") || cat.includes("3par") || cat.includes("16/32gbps san") || cat.includes("8gbps san") ||
    cat.includes("refurbished san") || cat.includes("dell san") || cat.includes("refurbished dell san"))
    return "Storage > SAN Storage";

  // STORAGE - NAS
  if (cat.includes("nas storage") || cat.includes("10gbps nas"))
    return "Storage > NAS Storage";

  // STORAGE - DAS
  if (cat.includes("das storage") || cat.includes("direct attached storage") || cat.includes("refurbished das"))
    return "Storage > DAS Storage";

  // STORAGE - Storage Servers
  if (cat.includes("storage server") || cat.includes("powervault") || cat.includes("freenas") ||
    cat.includes("windows storage") || cat.includes("hp storageworks") || cat.includes("dell emc") ||
    cat.includes("dell powervault") || cat.includes("hpe apollo"))
    return "Storage > Storage Servers";

  // STORAGE - Generic
  if (cat.includes("storage drive") || cat.includes("storage"))
    return "Storage > Storage Accessories";

  // NETWORKING
  if (cat.includes("check point") || cat.includes("checkpoint") || cat.includes("fortigate") ||
    cat.includes("fortinet") || cat.includes("huawei firewall") || cat.includes("juniper firewall") ||
    cat.includes("palo alto") || cat.includes("pfsense") || cat.includes("sonicwall") ||
    cat.includes("sophos") || cat.includes("enterprise firewall") || cat.includes("basic firewall") ||
    cat.includes("datacenter firewall") || (cat.includes("firewall") && !cat.includes("rental")))
    return "Networking > Firewalls";

  if (cat.includes("network card") || cat.includes("ethernet card") || cat.includes("hba card") ||
    cat.includes("hba-card") || cat.includes("intel network") || cat.includes("server network card") ||
    cat.includes("dual port ethernet") || cat.includes("quad port ethernet") || cat.includes("cisco server network") ||
    cat.includes("dell server network") || cat.includes("hp server network") || cat.includes("supermicro server network"))
    return "Networking > Network Cards & HBAs";

  if (cat.includes("switch") || cat.includes("kvm"))
    return "Networking > Switches & KVM";

  if (cat.includes("router") && !cat.includes("rental"))
    return "Networking > Routers";

  // COMPONENTS - catch accessories
  if (cat.includes("caddy") || cat.includes("server accessor") || cat.includes("component"))
    return "Components > Server Accessories";

  // WORKSTATIONS
  if (cat.includes("rendering pc") || cat.includes("rendering pcs"))
    return "Workstations > Rendering Workstations";
  if ((cat.includes("dell") && cat.includes("workstation")) || (name.includes("dell") && cat.includes("workstation")))
    return "Workstations > Dell Workstations";
  if ((cat.includes("hp") || cat.includes("hp z")) && cat.includes("workstation"))
    return "Workstations > HP Workstations";
  if (cat.includes("lenovo") && cat.includes("workstation"))
    return "Workstations > Lenovo Workstations";
  if (cat.includes("ibm") && cat.includes("workstation"))
    return "Workstations > IBM Workstations";
  if (cat.includes("brand new workstation"))
    return "Workstations > Brand New Workstations";
  if (cat.includes("workstation"))
    return "Workstations > Refurbished Workstations";

  // SERVERS - specific brands
  if ((cat.includes("dell") || name.includes("dell poweredge") || name.includes("dell r") || name.includes("dell t")) &&
    (cat.includes("blade")))
    return "Servers > Dell Blade Servers";
  if ((cat.includes("dell") || name.includes("dell")) &&
    (cat.includes("tower") && !cat.includes("workstation")))
    return "Servers > Dell Tower Servers";
  if ((cat.includes("dell") || name.includes("dell")) &&
    (cat.includes("poweredge") || cat.includes("rack server") || cat.includes("dell servers") ||
      cat.includes("dell refurb") || cat.includes("dell used rack") || name.includes("poweredge")))
    return "Servers > Dell Rack Servers";

  if ((cat.includes("hp") || cat.includes("hpe") || name.includes("hp proliant")) && cat.includes("blade"))
    return "Servers > HP Blade Servers";
  if ((cat.includes("hp") || name.includes("hp")) && (cat.includes("tower") && !cat.includes("workstation")))
    return "Servers > HP Tower Servers";
  if ((cat.includes("hp") || cat.includes("hpe") || name.includes("hp") || name.includes("proliant")) &&
    (cat.includes("proliant") || cat.includes("rack server") || cat.includes("hp servers") ||
      cat.includes("hp refurb") || cat.includes("hp rack") || name.includes("proliant")))
    return "Servers > HP Rack Servers";

  if ((cat.includes("lenovo") || name.includes("lenovo") || name.includes("thinksystem")) && cat.includes("server"))
    return "Servers > Lenovo Servers";
  if ((cat.includes("ibm") || name.includes("ibm")) && (cat.includes("server") || cat.includes("rack")))
    return "Servers > IBM Servers";
  if ((cat.includes("fujitsu") || name.includes("fujitsu") || name.includes("primergy")) &&
    (cat.includes("server") || cat.includes("rack") || cat.includes("tower")))
    return "Servers > Fujitsu Servers";
  if ((cat.includes("supermicro") || name.includes("supermicro")) && (cat.includes("server") || cat.includes("rack")))
    return "Servers > Supermicro Servers";
  if (cat.includes("cisco ucs") || cat.includes("refurbished cisco") || (name.includes("cisco") && cat.includes("server")))
    return "Servers > Cisco UCS Servers";
  if (cat.includes("amd epyc"))
    return "Servers > AMD EPYC Servers";
  if (cat.includes("rendering server"))
    return "Servers > Rendering Servers";
  if (cat.includes("blade server"))
    return "Servers > Blade Servers";
  if (cat.includes("tower server") && !cat.includes("workstation"))
    return "Servers > Tower Servers";
  if (cat.includes("latest server"))
    return "Servers > Latest Servers";
  if (cat.includes("buy back server"))
    return "Servers > Refurbished Servers";
  if (cat.includes("rugged server"))
    return "Servers > Rugged Servers";
  if (cat.includes("mikrotik") || cat.includes("inspur"))
    return "Servers > Other Servers";
  if (cat.includes("server") || cat.includes("1u") || cat.includes("2u") || cat.includes("3u") || cat.includes("4u"))
    return "Servers > Rack Servers";

  // COMPONENTS fallback
  if (cat.includes("harddrive") || cat.includes("component"))
    return "Components > Server Accessories";

  return "Servers > Rack Servers";
}

// =====================================================
// SPECIFICATION TEMPLATES
// =====================================================
function getSpecifications(mainCat, subCat, name) {
  const specs = {};

  if (mainCat === "Servers") {
    let brand = "Multi-Brand";
    if (subCat.includes("Dell")) brand = "Dell";
    else if (subCat.includes("HP")) brand = "HP / HPE";
    else if (subCat.includes("Lenovo")) brand = "Lenovo";
    else if (subCat.includes("IBM")) brand = "IBM";
    else if (subCat.includes("Fujitsu")) brand = "Fujitsu";
    else if (subCat.includes("Supermicro")) brand = "Supermicro";
    else if (subCat.includes("Cisco")) brand = "Cisco";
    specs["Brand"] = brand;
    specs["Form Factor"] = subCat.includes("Tower") ? "Tower" : subCat.includes("Blade") ? "Blade" : "Rack (1U / 2U / 4U)";
    specs["Processor"] = "Intel Xeon Scalable / AMD EPYC";
    specs["RAM"] = "Up to 1.5TB DDR4/DDR5 ECC RDIMM";
    specs["Storage Bays"] = "4 to 24 Drive Bays (SAS / SATA / NVMe)";
    specs["Network"] = "Dual 1GbE / 10GbE / 25GbE";
    specs["Power Supply"] = "Redundant Hot-Swap PSU";
    specs["Management"] = "iDRAC9 / iLO5 / XClarity / IMM2";
    specs["Expansion"] = "PCIe Gen3 / Gen4 Slots";
    specs["Condition"] = "Certified Refurbished / Grade A";
    specs["Warranty"] = "90 Days – 1 Year Comprehensive";
    specs["Delivery"] = "Pan-India, Same Day Delhi NCR";
  } else if (mainCat === "Workstations") {
    let brand = "Professional";
    if (subCat.includes("Dell")) brand = "Dell";
    else if (subCat.includes("HP")) brand = "HP";
    else if (subCat.includes("Lenovo")) brand = "Lenovo";
    else if (subCat.includes("IBM")) brand = "IBM";
    specs["Brand"] = brand;
    specs["Form Factor"] = subCat.includes("Tower") ? "Tower Workstation" : "Professional Workstation";
    specs["Processor"] = "Intel Xeon W / Core i9 / AMD Threadripper PRO";
    specs["RAM"] = "Up to 512GB DDR4 ECC Registered";
    specs["Storage"] = "NVMe SSD (Boot) + SATA HDD (Data)";
    specs["Graphics"] = "NVIDIA RTX / Quadro / AMD Pro";
    specs["OS"] = "Windows 10/11 Pro (Available)";
    specs["Certifications"] = "ISV Certified – AutoCAD, SolidWorks, CATIA, Maya";
    specs["Expansion"] = "Multiple PCIe Slots for GPU / Storage";
    specs["Condition"] = subCat.includes("Brand New") ? "Brand New, Sealed" : "Certified Refurbished";
    specs["Warranty"] = "90 Days – 1 Year";
  } else if (mainCat === "Laptops") {
    specs["Type"] = "Business / Professional Laptop";
    specs["Display"] = "14\" / 15.6\" / 17.3\" Full HD IPS";
    specs["Processor"] = "Intel Core i5 / i7 / i9 / Xeon";
    specs["RAM"] = "8GB / 16GB / 32GB DDR4";
    specs["Storage"] = "256GB / 512GB / 1TB SSD";
    specs["Battery"] = "Up to 12 Hours";
    specs["Connectivity"] = "Wi-Fi 6, Bluetooth 5.0, USB-C";
    specs["OS"] = "Windows 10/11 Pro";
    specs["Condition"] = "Certified Refurbished – Grade A";
    specs["Warranty"] = "90 Days";
  } else if (mainCat === "Desktops") {
    specs["Type"] = "Business Desktop PC";
    specs["Form Factor"] = "SFF / Micro / Tower";
    specs["Processor"] = "Intel Core i5 / i7 / i9";
    specs["RAM"] = "8GB / 16GB / 32GB DDR4";
    specs["Storage"] = "HDD 500GB to 2TB / SSD 256GB+";
    specs["OS"] = "Windows 10 Pro (COA Included)";
    specs["Connectivity"] = "USB 3.0, HDMI / DisplayPort";
    specs["Condition"] = "Certified Refurbished";
    specs["Warranty"] = "90 Days";
  } else if (mainCat === "Storage" && subCat === "Hard Disk Drives") {
    specs["Type"] = "Enterprise Hard Disk Drive";
    specs["Interface"] = "SAS 6Gbps / 12Gbps / SATA 6Gbps";
    specs["Form Factor"] = "2.5\" SFF / 3.5\" LFF";
    specs["RPM"] = "7200 / 10K / 15K RPM";
    specs["Cache"] = "64MB / 128MB / 256MB Buffer";
    specs["Compatibility"] = "Dell, HP, IBM, Lenovo, Supermicro Servers";
    specs["Condition"] = "Refurbished / Brand New";
    specs["Warranty"] = "90 Days";
  } else if (mainCat === "Storage" && subCat === "Solid State Drives") {
    specs["Type"] = "Enterprise Solid State Drive";
    specs["Interface"] = "SATA 6Gbps / SAS 12Gbps / NVMe PCIe Gen3/Gen4";
    specs["Form Factor"] = "2.5\" / M.2 / U.2";
    specs["Read Speed"] = "Up to 7000 MB/s (NVMe)";
    specs["Write Speed"] = "Up to 5000 MB/s (NVMe)";
    specs["Endurance"] = "Enterprise Grade – High TBW Rating";
    specs["Compatibility"] = "Universal Server Compatibility";
    specs["Warranty"] = "1 Year";
  } else if (mainCat === "Storage" && subCat === "SAN Storage") {
    specs["Type"] = "Enterprise SAN Storage Array";
    specs["Protocol"] = "Fibre Channel / iSCSI / FCoE / NVMe-oF";
    specs["FC Connectivity"] = "8Gbps / 16Gbps / 32Gbps";
    specs["Max Raw Capacity"] = "Petabyte Scale Expandable";
    specs["Controllers"] = "Dual Active-Active / Active-Passive";
    specs["Cache"] = "Flash / DRAM Write-Back";
    specs["RAID Support"] = "RAID 0, 1, 5, 6, 10, DP";
    specs["Condition"] = "Certified Refurbished";
    specs["Warranty"] = "90 Days – 1 Year";
  } else if (mainCat === "Storage" && subCat === "NAS Storage") {
    specs["Type"] = "Network Attached Storage (NAS)";
    specs["Protocols"] = "SMB 3.0 / NFS v4 / iSCSI / AFP / FTP";
    specs["Drive Bays"] = "2 to 24+ Bays (SAS / SATA / SSD)";
    specs["Network"] = "1GbE / 10GbE / 25GbE";
    specs["RAID"] = "RAID 0/1/5/6/10, JBOD";
    specs["Virtualization"] = "VMware, Hyper-V, Citrix Ready";
    specs["Condition"] = "Refurbished / Brand New";
    specs["Warranty"] = "90 Days – 1 Year";
  } else if (mainCat === "Storage" && subCat === "DAS Storage") {
    specs["Type"] = "Direct Attached Storage (DAS)";
    specs["Interface"] = "SAS / SATA / FC / USB 3.0";
    specs["Drive Bays"] = "4 to 60+ Bays";
    specs["RAID"] = "Hardware RAID Controller";
    specs["Use Case"] = "Video Editing, Rendering, Backup, Archive";
    specs["Condition"] = "Certified Refurbished";
    specs["Warranty"] = "90 Days";
  } else if (mainCat === "Storage") {
    specs["Type"] = "Enterprise Storage Solution";
    specs["Capacity"] = "Scalable";
    specs["Condition"] = "Certified Refurbished";
    specs["Warranty"] = "90 Days – 1 Year";
    specs["Support"] = "On-site & Remote Available";
  } else if (mainCat === "Networking" && subCat === "Firewalls") {
    specs["Type"] = "Next-Generation Firewall (NGFW)";
    specs["Throughput"] = "Up to 100 Gbps";
    specs["VPN"] = "IPSec / SSL VPN / SD-WAN";
    specs["Features"] = "IPS / IDS / Application Control / DPI";
    specs["Interfaces"] = "1GbE / 10GbE / SFP+ Ports";
    specs["Management"] = "Web GUI / REST API / Central Management";
    specs["Condition"] = "Refurbished / Brand New";
    specs["Warranty"] = "90 Days – 1 Year";
  } else if (mainCat === "Networking" && subCat === "Network Cards & HBAs") {
    specs["Type"] = "Server Network Interface Card / HBA";
    specs["Interface"] = "PCIe x4 / x8 / x16";
    specs["Speed"] = "1GbE / 10GbE / 25GbE / 40GbE";
    specs["Ports"] = "Single / Dual / Quad Port";
    specs["Protocol"] = "Ethernet / Fibre Channel / iSCSI";
    specs["Compatibility"] = "Universal Server Platform";
    specs["Condition"] = "Refurbished";
    specs["Warranty"] = "90 Days";
  } else if (mainCat === "Networking" && subCat === "Switches & KVM") {
    specs["Type"] = "Enterprise Network Switch";
    specs["Ports"] = "24 / 48 / 96 Ports";
    specs["Speed"] = "1GbE / 10GbE / 25GbE / 40GbE";
    specs["Uplink"] = "SFP / SFP+ / QSFP";
    specs["PoE"] = "PoE / PoE+ / UPoE (Model Dependent)";
    specs["Management"] = "Full L2/L3 Managed";
    specs["Condition"] = "Refurbished";
    specs["Warranty"] = "90 Days – 1 Year";
  } else if (mainCat === "Networking") {
    specs["Type"] = "Enterprise Networking Equipment";
    specs["Standard"] = "IEEE 802.3";
    specs["Condition"] = "Refurbished";
    specs["Warranty"] = "90 Days";
  } else if (mainCat === "Components" && subCat === "Graphics Cards") {
    specs["Type"] = "Professional / AI / Gaming GPU";
    specs["Interface"] = "PCIe x16 Gen3 / Gen4";
    specs["Memory"] = "8GB / 16GB / 24GB / 48GB GDDR6X";
    specs["Memory Bandwidth"] = "Up to 960 GB/s";
    specs["CUDA Cores"] = "Thousands (Model Dependent)";
    specs["API"] = "CUDA / OpenCL / DirectX 12 / Vulkan";
    specs["Power"] = "200W – 450W TDP";
    specs["Condition"] = "Refurbished / Brand New";
    specs["Warranty"] = "90 Days – 1 Year";
  } else if (mainCat === "Components" && subCat === "Processors & CPUs") {
    specs["Type"] = "Enterprise Server / Workstation Processor";
    specs["Socket"] = "LGA3647 / LGA4189 / SP3 / LGA1700";
    specs["Cores"] = "6 to 64 Cores";
    specs["Threads"] = "12 to 128 Threads";
    specs["Cache"] = "Up to 256MB L3";
    specs["Memory Support"] = "DDR4 / DDR5 ECC RDIMM / LRDIMM";
    specs["TDP"] = "65W to 400W";
    specs["Condition"] = "Refurbished – Tested & Certified";
    specs["Warranty"] = "90 Days";
  } else if (mainCat === "Components" && subCat === "Power Supplies") {
    specs["Type"] = "Server Power Supply Unit (PSU)";
    specs["Wattage"] = "460W / 750W / 1200W / 2400W";
    specs["Efficiency"] = "80 PLUS Platinum / Titanium";
    specs["Form Factor"] = "Hot-Swap Redundant";
    specs["Compatibility"] = "Dell, HP, IBM, Lenovo Servers";
    specs["Condition"] = "Refurbished";
    specs["Warranty"] = "90 Days";
  } else if (mainCat === "Components") {
    specs["Type"] = "Server Component / Accessory";
    specs["Condition"] = "Refurbished";
    specs["Compatibility"] = "Dell, HP, IBM, Lenovo, Supermicro";
    specs["Warranty"] = "90 Days";
  } else if (mainCat === "Rentals") {
    specs["Rental Plans"] = "Monthly / Quarterly / Annual";
    specs["Minimum Period"] = "1 Month";
    specs["Support"] = "24/7 Technical Support Included";
    specs["Installation"] = "Free On-site Setup";
    specs["AMC"] = "Comprehensive AMC Available";
    specs["Delivery"] = "Pan-India";
    specs["Upgrade Option"] = "Scalable Mid-Contract";
  } else if (mainCat === "AMC & Services") {
    specs["Service Type"] = subCat;
    specs["Coverage"] = "Parts + Labour + Travel";
    specs["Response Time"] = "4 Hours (Critical) / NBD (Standard)";
    specs["Contract Duration"] = "1 Year / 2 Year / 3 Year";
    specs["Support"] = "24x7x365 Remote + On-site";
    specs["Coverage Area"] = "Pan-India";
    specs["Brands Covered"] = "Dell, HP, IBM, Lenovo, Supermicro";
  } else if (mainCat === "Cloud & VPS") {
    specs["Type"] = "KVM Cloud VPS";
    specs["Hypervisor"] = "KVM (Kernel-based Virtual Machine)";
    specs["Network"] = "1 Gbps Shared / Dedicated Port";
    specs["OS"] = "Ubuntu / CentOS / Debian / Windows Server";
    specs["Uptime SLA"] = "99.99% Guaranteed";
    specs["Backups"] = "Daily Automated Snapshots";
    specs["Control Panel"] = "cPanel / DirectAdmin / Plesk (Optional)";
    specs["Support"] = "24/7 Technical Support";
    specs["Location"] = "India Data Center";
  }

  return specs;
}

// =====================================================
// SEO SHORT DESCRIPTIONS
// =====================================================
const DESC_TEMPLATES = {
  "Servers > Dell Rack Servers": (n) => `Buy certified refurbished ${n} at best price in India. Enterprise Dell rack server tested for high performance, ideal for data centers, virtualization, and cloud infrastructure. Pan-India delivery with warranty.`,
  "Servers > HP Rack Servers": (n) => `${n} – Refurbished HP ProLiant rack server at best price in India. Industry-leading reliability for enterprise workloads, SAP, VMware, and HPC. Tested, certified & warranted.`,
  "Servers > Lenovo Servers": (n) => `${n} – Certified refurbished Lenovo ThinkSystem server for AI, analytics, and data center. High performance with Intel Xeon Scalable processors. Best price in India.`,
  "Servers > IBM Servers": (n) => `${n} – Refurbished IBM enterprise server for database, ERP, and virtualization workloads. Reliable, tested, and certified. Available in India with warranty.`,
  "Servers > Fujitsu Servers": (n) => `${n} – Refurbished Fujitsu PRIMERGY server for cost-effective enterprise computing. Reliable performance for SMB and large enterprises. Tested & warranted.`,
  "Servers > Supermicro Servers": (n) => `${n} – Supermicro server at best price in India. High-density rack server for HPC, rendering, and cloud. Certified refurbished with comprehensive warranty.`,
  "Servers > Cisco UCS Servers": (n) => `${n} – Cisco UCS unified computing server. Best-in-class for VMware, SAP, and enterprise applications. Available refurbished at best price in India.`,
  "Servers > AMD EPYC Servers": (n) => `${n} – AMD EPYC powered server for HPC and cloud. More cores, higher memory bandwidth, and lower TCO. Available in India with warranty.`,
  "Servers > Rendering Servers": (n) => `${n} – GPU-accelerated rendering server for 3D animation, VFX, and architectural visualization. Maximum RAM and PCIe slots for pro render workloads.`,
  "Servers > Blade Servers": (n) => `${n} – Refurbished blade server for space-efficient enterprise computing. High-density compute in minimal rack space. Certified & warranted.`,
  "Servers > Tower Servers": (n) => `${n} – Tower server for SMB and enterprise. Easy to deploy, expandable, and cost-effective. Certified refurbished with warranty in India.`,
  "Servers > Dell Tower Servers": (n) => `${n} – Refurbished Dell tower server at best price. Versatile enterprise server for offices, SMBs, and edge deployments. Warranted & tested.`,
  "Servers > HP Tower Servers": (n) => `${n} – HP tower server for enterprise office environments. Quiet, scalable, and powerful. Certified refurbished with warranty in India.`,
  "Servers > Rack Servers": (n) => `${n} – Certified refurbished rack server at best price in India. Enterprise-grade 1U/2U/4U server tested, cleaned, and warranted. Pan-India delivery.`,
  "Servers > Refurbished Servers": (n) => `${n} – Certified refurbished server available at best price in India. Thoroughly tested, cleaned, and warranted for reliable enterprise performance.`,
  "Servers > Latest Servers": (n) => `${n} – Latest generation server available in India. Cutting-edge Intel or AMD platform for next-gen workloads. Best price, warranty included.`,
  "Servers > Rugged Servers": (n) => `${n} – Ruggedized server for harsh environment deployments. Military-grade durability for industrial, defense, and edge computing applications.`,
  "Servers > Other Servers": (n) => `${n} – Specialized server solution for enterprise deployments. Configured for reliability, performance, and scalability. Available in India.`,
  "Workstations > Dell Workstations": (n) => `${n} – Dell Precision workstation for CAD, 3D rendering, simulation, and VFX. ISV certified for AutoCAD, SolidWorks, Maya, and Revit. Refurbished with warranty.`,
  "Workstations > HP Workstations": (n) => `${n} – HP Z-series workstation for engineering and creative professionals. ISV certified, high-ECC RAM support. Refurbished at best price in India.`,
  "Workstations > Lenovo Workstations": (n) => `${n} – Lenovo ThinkStation workstation for demanding professional workloads. Reliable Intel Xeon / AMD Threadripper performance. Available in India.`,
  "Workstations > IBM Workstations": (n) => `${n} – IBM professional workstation for enterprise-grade workloads. High reliability and performance for mission-critical applications.`,
  "Workstations > Rendering Workstations": (n) => `${n} – GPU-powered rendering workstation for Cinema 4D, Octane, V-Ray, Redshift, and Unreal Engine. Multi-GPU support for maximum throughput.`,
  "Workstations > Brand New Workstations": (n) => `${n} – Brand new professional workstation with latest-gen CPUs and GPUs. Ideal for AI, ML, rendering, and engineering. Full manufacturer warranty.`,
  "Workstations > Refurbished Workstations": (n) => `${n} – Certified refurbished professional workstation at best price in India. Grade A hardware for CAD, 3D design, and content creation.`,
  "Laptops > All Laptops": (n) => `${n} – Certified refurbished business laptop in India. Grade A condition, tested for performance, ideal for professionals and students. 90-day warranty.`,
  "Desktops > Refurbished Desktops": (n) => `${n} – Certified refurbished desktop PC at best price in India. Business-grade performance, Windows 10 Pro, fully tested with 90-day warranty.`,
  "Storage > Hard Disk Drives": (n) => `${n} – Enterprise SAS/SATA hard disk drive. Tested for 100% reliability. Compatible with Dell, HP, IBM, Lenovo servers. Best price in India.`,
  "Storage > Solid State Drives": (n) => `${n} – Enterprise SSD for maximum IOPS. NVMe PCIe / SATA / SAS options. Ideal for databases, VMs, and high-performance applications. In India.`,
  "Storage > SAN Storage": (n) => `${n} – Enterprise SAN storage array for mission-critical data. FC and iSCSI connectivity, redundant controllers. Certified refurbished with warranty.`,
  "Storage > NAS Storage": (n) => `${n} – Network-attached storage for centralized data management. SMB/NFS/iSCSI support. Scalable from SMB to enterprise. Best price India.`,
  "Storage > DAS Storage": (n) => `${n} – Direct-attached storage for high-performance local workflows. Ideal for video editing, rendering, and backup. High capacity, low latency.`,
  "Storage > Storage Servers": (n) => `${n} – Dedicated storage server for bulk data, archiving, and backup. High capacity, redundant design for 24/7 mission-critical operation.`,
  "Storage > Storage Accessories": (n) => `${n} – Enterprise storage accessory and component at best price in India. Compatible with leading storage brands. Tested and warranted.`,
  "Networking > Firewalls": (n) => `${n} – Next-generation enterprise firewall for network security. Deep packet inspection, IPS/IDS, and VPN. Protect your infrastructure from threats.`,
  "Networking > Network Cards & HBAs": (n) => `${n} – Server network card / HBA adapter for high-speed data center connectivity. 1GbE to 100GbE options. Best price in India.`,
  "Networking > Switches & KVM": (n) => `${n} – Enterprise network switch for high-speed campus and data center LAN. PoE, VLAN, SFP+ support. Managed, reliable, scalable.`,
  "Networking > Routers": (n) => `${n} – Enterprise router for WAN connectivity and advanced routing. SD-WAN ready with BGP, OSPF, and MPLS support. Best price in India.`,
  "Components > Graphics Cards": (n) => `${n} – Professional GPU for AI/ML training, 3D rendering, VFX, and deep learning. CUDA cores, GDDR6X memory, PCIe x16 interface. India.`,
  "Components > Processors & CPUs": (n) => `${n} – Enterprise server processor for data center and workstation. High core count, ECC memory, and PCIe lanes for maximum performance.`,
  "Components > Power Supplies": (n) => `${n} – Hot-swap redundant server PSU. High efficiency 80 PLUS Platinum. Compatible with Dell, HP, IBM, Lenovo enterprise servers.`,
  "Components > Cooling": (n) => `${n} – Genuine server cooling fan / heatsink. Ensures optimal thermal performance for enterprise servers. Tested OEM part with warranty.`,
  "Components > Server Accessories": (n) => `${n} – Server accessory for enterprise hardware. Compatible with leading server brands. Quality tested for reliable performance.`,
  "Rentals > Server Rental": (n) => `Rent ${n} in India. Flexible monthly, quarterly, and annual server rental plans. On-site delivery, setup, and 24/7 technical support included.`,
  "Rentals > Storage Rental": (n) => `Rent ${n} storage solution in India. No upfront investment. Flexible rental plans for SMB and enterprise with full technical support.`,
  "Rentals > Network & Firewall Rental": (n) => `Rent ${n} in India. Flexible network equipment rental for events, projects, and short-term business needs. Setup and support included.`,
  "Rentals > Workstation Rental": (n) => `Rent ${n} workstation in India. Monthly workstation rental for projects, film shoots, and business requirements. Full support included.`,
  "Cloud & VPS > Cloud VPS Plans": (n) => `${n} – High-performance KVM cloud VPS with dedicated vCPUs, NVMe SSD storage, and 99.99% uptime SLA. Deploy in minutes in India.`,
  "AMC & Services > Server AMC": (n) => `${n} – Annual Maintenance Contract for enterprise servers. Comprehensive parts and labour coverage with rapid response time. Pan-India coverage.`,
  "AMC & Services > Server Management": (n) => `${n} – Professional server management and monitoring service. Proactive 24/7 monitoring, patch management, and performance optimization.`,
  "AMC & Services > Server Repair": (n) => `${n} – Certified server repair service by expert engineers. Dell, HP, IBM, Lenovo, Supermicro servers repaired. Fast turnaround, pan-India.`,
  "AMC & Services > Pricing Lists": (n) => `${n} – Complete pricing list for enterprise IT hardware and services. Get the best price for servers, storage, networking, and workstations in India.`,
};

function generateShortDescription(name, category) {
  const fn = DESC_TEMPLATES[category];
  if (fn) return fn(name);
  return `${name} – Available at best price in India. Certified quality, tested, and warranted. Contact Serverwale for pricing and availability. Pan-India delivery.`;
}

// =====================================================
// RANDOM RATING
// =====================================================
function randomRating(id) {
  const h = ((id * 2654435761) >>> 0) % 15;
  return parseFloat((3.5 + h * 0.1).toFixed(1));
}
function randomReviewCount(id) {
  return 5 + (((id * 1234567891) >>> 0) % 196);
}

// =====================================================
// MAIN
// =====================================================
async function main() {
  console.log("🚀 Connecting to database...");
  const pool = mysql.createPool(DB_CONFIG);
  const conn = await pool.getConnection();

  try {
    // ── 1. Remove duplicates (same name, keep lowest id) ──────────────
    console.log("\n📋 Step 1: Removing duplicate products...");
    const [dupeCheck] = await conn.query(`
      SELECT name, MIN(id) as keep_id, COUNT(*) as cnt
      FROM shop_products
      GROUP BY LOWER(TRIM(name))
      HAVING cnt > 1
    `);
    console.log(`   Found ${dupeCheck.length} duplicate product names`);

    if (dupeCheck.length > 0) {
      for (const dupe of dupeCheck) {
        await conn.query(`
          DELETE FROM shop_products
          WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND id != ?
        `, [dupe.name, dupe.keep_id]);
      }
      const [{ cnt: removed }] = await conn.query(`SELECT ROW_COUNT() as cnt`);
      console.log(`   ✅ Duplicates removed`);
    }

    // ── 2. Get all remaining products ─────────────────────────────────
    console.log("\n📋 Step 2: Fetching all products...");
    const [products] = await conn.query(`SELECT id, name, category, image, images, short_description, rating, review_count FROM shop_products ORDER BY id`);
    console.log(`   Total products: ${products.length}`);

    // ── 3. Process each product in batches ────────────────────────────
    console.log("\n📋 Step 3: Processing products (categories, images, ratings, specs)...");
    const BATCH = 50;
    let processed = 0;
    const newCategorySet = new Set();

    for (let i = 0; i < products.length; i += BATCH) {
      const batch = products.slice(i, i + BATCH);

      for (const p of batch) {
        const newCat = determineCategory(p.category, p.name);
        newCategorySet.add(newCat);

        const [mainCat, subCat] = newCat.split(" > ");
        const specs = getSpecifications(mainCat, subCat, p.name);
        const specsJson = JSON.stringify(specs);

        // Fix images: split CSV → main image + images array
        let mainImg = null;
        let extraImgs = "[]";
        if (p.image) {
          const parts = p.image.split(",").map(s => s.trim()).filter(Boolean);
          if (parts.length > 0) {
            mainImg = parts[0];
            if (parts.length > 1) {
              extraImgs = JSON.stringify(parts.slice(1, 5)); // keep up to 4 extra
            }
          }
        }

        // Short description
        let shortDesc = p.short_description;
        if (!shortDesc || shortDesc.trim().length < 20) {
          shortDesc = generateShortDescription(p.name, newCat);
        }

        // Ratings
        const rating = (p.rating && p.rating > 0) ? p.rating : randomRating(p.id);
        const reviewCount = (p.review_count && p.review_count > 0) ? p.review_count : randomReviewCount(p.id);

        // Tags based on category
        const tags = generateTags(mainCat, subCat, p.name);

        // Warranty
        const warranty = getWarranty(mainCat, subCat);

        // Stock status
        const stockStatus = getStockStatus(mainCat);

        // Badge
        const badge = getBadge(p.id, mainCat);

        await conn.query(`
          UPDATE shop_products SET
            category = ?,
            specifications = ?,
            short_description = ?,
            rating = ?,
            review_count = ?,
            image = ?,
            images = ?,
            tags = ?,
            warranty = ?,
            stock_status = ?,
            badge = ?
          WHERE id = ?
        `, [newCat, specsJson, shortDesc, rating, reviewCount, mainImg, extraImgs, JSON.stringify(tags), warranty, stockStatus, badge, p.id]);
      }

      processed += batch.length;
      if (processed % 200 === 0 || processed === products.length) {
        console.log(`   Processed ${processed}/${products.length}...`);
      }
    }

    console.log(`   ✅ All products processed`);

    // ── 4. Rebuild shop_categories ─────────────────────────────────────
    console.log("\n📋 Step 4: Rebuilding shop_categories table...");
    await conn.query(`DELETE FROM shop_categories WHERE 1=1`);

    // Collect all unique categories from DB
    const [catRows] = await conn.query(`SELECT DISTINCT category FROM shop_products WHERE category IS NOT NULL ORDER BY category`);
    const allCats = new Set();

    for (const row of catRows) {
      const cat = row.category;
      allCats.add(cat);
      // Also add main category
      const mainCat = cat.split(" > ")[0];
      allCats.add(mainCat);
    }

    for (const cat of [...allCats].sort()) {
      try {
        await conn.query(`INSERT IGNORE INTO shop_categories (name) VALUES (?)`, [cat]);
      } catch (e) { /* skip duplicates */ }
    }

    const [{ total: catTotal }] = await conn.query(`SELECT COUNT(*) as total FROM shop_categories`);
    console.log(`   ✅ Rebuilt ${catTotal} categories`);

    // ── 5. Summary ─────────────────────────────────────────────────────
    const [{ total }] = await conn.query(`SELECT COUNT(*) as total FROM shop_products`);
    console.log(`\n✅ Done! ${total} products cleaned. ${catTotal} categories created.`);
    console.log("\nCategory breakdown:");
    const [catSummary] = await conn.query(`
      SELECT SUBSTRING_INDEX(category, ' > ', 1) as main_cat, COUNT(*) as cnt
      FROM shop_products
      GROUP BY main_cat
      ORDER BY cnt DESC
    `);
    catSummary.forEach(r => console.log(`   ${r.main_cat}: ${r.cnt} products`));

  } finally {
    conn.release();
    await pool.end();
  }
}

function generateTags(mainCat, subCat, name) {
  const tags = [];
  const n = name.toLowerCase();

  if (mainCat === "Servers") {
    tags.push("Server", "Enterprise", "Refurbished");
    if (subCat.includes("Dell")) tags.push("Dell", "PowerEdge");
    if (subCat.includes("HP")) tags.push("HP", "ProLiant");
    if (subCat.includes("Lenovo")) tags.push("Lenovo", "ThinkSystem");
    if (subCat.includes("IBM")) tags.push("IBM");
    if (subCat.includes("Fujitsu")) tags.push("Fujitsu", "PRIMERGY");
    if (subCat.includes("Supermicro")) tags.push("Supermicro");
    if (subCat.includes("Cisco")) tags.push("Cisco", "UCS");
    if (n.includes("1u")) tags.push("1U");
    if (n.includes("2u") || n.includes("dl3") || n.includes("dl5")) tags.push("2U");
    if (n.includes("4u")) tags.push("4U");
    if (n.includes("xeon")) tags.push("Intel Xeon");
    if (n.includes("epyc")) tags.push("AMD EPYC");
  } else if (mainCat === "Workstations") {
    tags.push("Workstation", "Professional");
    if (n.includes("dell") || subCat.includes("Dell")) tags.push("Dell Precision");
    if (n.includes("hp") || subCat.includes("HP")) tags.push("HP Z-Series");
    if (n.includes("lenovo") || subCat.includes("Lenovo")) tags.push("ThinkStation");
    tags.push("CAD", "Rendering");
  } else if (mainCat === "Laptops") {
    tags.push("Laptop", "Business Laptop", "Refurbished Laptop");
    if (n.includes("thinkpad")) tags.push("ThinkPad");
    if (n.includes("elitebook")) tags.push("EliteBook");
    if (n.includes("latitude")) tags.push("Latitude");
  } else if (mainCat === "Desktops") {
    tags.push("Desktop PC", "Refurbished Desktop", "Business PC");
    if (n.includes("dell")) tags.push("Dell OptiPlex");
    if (n.includes("hp")) tags.push("HP ProDesk");
    if (n.includes("lenovo")) tags.push("Lenovo ThinkCentre");
  } else if (mainCat === "Storage") {
    tags.push("Storage", "Enterprise Storage");
    if (subCat.includes("SAS") || subCat.includes("HDD")) tags.push("SAS", "HDD");
    if (subCat.includes("SSD")) tags.push("SSD", "NVMe");
    if (subCat.includes("SAN")) tags.push("SAN", "Fibre Channel");
    if (subCat.includes("NAS")) tags.push("NAS", "Network Storage");
  } else if (mainCat === "Networking") {
    tags.push("Networking", "Enterprise Network");
    if (subCat.includes("Firewall")) tags.push("Firewall", "Network Security", "NGFW");
    if (subCat.includes("Switch")) tags.push("Switch", "PoE", "Managed Switch");
    if (subCat.includes("Cards")) tags.push("NIC", "Network Card");
  } else if (mainCat === "Components") {
    tags.push("Server Components");
    if (subCat.includes("GPU") || subCat.includes("Graphics")) tags.push("GPU", "NVIDIA", "Graphics Card");
    if (subCat.includes("CPU") || subCat.includes("Processor")) tags.push("CPU", "Intel Xeon");
    if (subCat.includes("Power")) tags.push("PSU", "Power Supply");
  } else if (mainCat === "Rentals") {
    tags.push("Rental", "IT Rental", "India");
    if (subCat.includes("Server")) tags.push("Server Rental");
    if (subCat.includes("Storage")) tags.push("Storage Rental");
    if (subCat.includes("Network") || subCat.includes("Firewall")) tags.push("Firewall Rental");
  } else if (mainCat === "Cloud & VPS") {
    tags.push("Cloud VPS", "KVM VPS", "India VPS", "Linux VPS");
  } else if (mainCat === "AMC & Services") {
    tags.push("AMC", "Server AMC", "IT Support", "Maintenance");
  }
  return [...new Set(tags)].slice(0, 6);
}

function getWarranty(mainCat, subCat) {
  if (mainCat === "Rentals") return "Included in Rental";
  if (mainCat === "AMC & Services") return "Service Contract";
  if (mainCat === "Cloud & VPS") return "99.99% Uptime SLA";
  if (mainCat === "Components") return "90 Days";
  if (mainCat === "Laptops" || mainCat === "Desktops") return "90 Days";
  if (subCat && subCat.includes("Brand New")) return "1 Year Manufacturer";
  return "90 Days – 1 Year";
}

function getStockStatus(mainCat) {
  if (mainCat === "Rentals" || mainCat === "AMC & Services" || mainCat === "Cloud & VPS") return "in_stock";
  if (mainCat === "Components") return "in_stock";
  return "on_request";
}

function getBadge(id, mainCat) {
  const h = ((id * 987654321) >>> 0) % 10;
  if (mainCat === "Cloud & VPS") return "featured";
  if (mainCat === "Rentals") return "featured";
  if (h === 0) return "best_seller";
  if (h === 1) return "new";
  if (h === 2) return "hot_deal";
  if (h === 3) return "limited_offer";
  return null;
}

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
