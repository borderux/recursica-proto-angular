/**
 * What this dataset is for — shown by the data registry
 * (`src/data/index.ts`) so agents/designers can tell what a dataset is
 * without opening it.
 */
export const description =
  "Inventory of GPUs and servers in an AI infrastructure company's fleet — the dataset behind the Demo Prototype's dashboard.";

/** Kind of asset a rack unit holds. */
export type AssetType = "GPU" | "Server";

/** Lifecycle state of an inventory item. */
export type AssetStatus =
  | "Active"
  | "Provisioning"
  | "Maintenance"
  | "Decommissioned";

/**
 * A single rack unit in the fleet — either a GPU accelerator or a server.
 */
export interface InventoryItem {
  /** Stable identifier for the item. */
  id: string;
  /** Asset tag / hostname, e.g. "gpu-node-01". */
  name: string;
  /** Whether this is a GPU or a Server. */
  type: AssetType;
  /** Hardware model, e.g. "NVIDIA H100 80GB". */
  model: string;
  /** Datacenter the item lives in, e.g. "us-east-1". */
  datacenter: string;
  /** Rack and unit position, e.g. "R12-U34". */
  rack: string;
  /** Current lifecycle status. */
  status: AssetStatus;
  /** Current utilization, as a percentage from 0 to 100. */
  utilization: number;
  /** Free-text notes about the item. */
  notes: string;
}

/** The normal-case dataset: a fleet of GPUs and servers across datacenters. */
export const inventory: InventoryItem[] = [
  {
    id: "inv-1",
    name: "gpu-node-01",
    type: "GPU",
    model: "NVIDIA H100 80GB",
    datacenter: "us-east-1",
    rack: "R12-U34",
    status: "Active",
    utilization: 92,
    notes: "Primary training cluster node.",
  },
  {
    id: "inv-2",
    name: "gpu-node-02",
    type: "GPU",
    model: "NVIDIA H100 80GB",
    datacenter: "us-east-1",
    rack: "R12-U36",
    status: "Active",
    utilization: 88,
    notes: "",
  },
  {
    id: "inv-3",
    name: "gpu-node-03",
    type: "GPU",
    model: "NVIDIA A100 40GB",
    datacenter: "us-east-1",
    rack: "R14-U10",
    status: "Maintenance",
    utilization: 0,
    notes: "Firmware update in progress.",
  },
  {
    id: "inv-4",
    name: "gpu-node-04",
    type: "GPU",
    model: "NVIDIA A100 40GB",
    datacenter: "us-west-2",
    rack: "R03-U22",
    status: "Active",
    utilization: 74,
    notes: "",
  },
  {
    id: "inv-5",
    name: "gpu-node-05",
    type: "GPU",
    model: "NVIDIA L40S",
    datacenter: "us-west-2",
    rack: "R03-U24",
    status: "Active",
    utilization: 61,
    notes: "Reserved for inference workloads.",
  },
  {
    id: "inv-6",
    name: "gpu-node-06",
    type: "GPU",
    model: "NVIDIA L40S",
    datacenter: "eu-frankfurt-1",
    rack: "R08-U05",
    status: "Provisioning",
    utilization: 0,
    notes: "Awaiting network config.",
  },
  {
    id: "inv-7",
    name: "gpu-node-07",
    type: "GPU",
    model: "AMD MI300X",
    datacenter: "eu-frankfurt-1",
    rack: "R08-U07",
    status: "Active",
    utilization: 95,
    notes: "",
  },
  {
    id: "inv-8",
    name: "gpu-node-08",
    type: "GPU",
    model: "AMD MI300X",
    datacenter: "ap-southeast-1",
    rack: "R01-U11",
    status: "Active",
    utilization: 55,
    notes: "",
  },
  {
    id: "inv-9",
    name: "gpu-node-09",
    type: "GPU",
    model: "NVIDIA H100 80GB",
    datacenter: "ap-southeast-1",
    rack: "R01-U13",
    status: "Decommissioned",
    utilization: 0,
    notes: "Scheduled for teardown.",
  },
  {
    id: "inv-10",
    name: "gpu-node-10",
    type: "GPU",
    model: "NVIDIA A100 40GB",
    datacenter: "us-east-1",
    rack: "R12-U40",
    status: "Active",
    utilization: 80,
    notes: "",
  },
  {
    id: "inv-11",
    name: "srv-node-01",
    type: "Server",
    model: "Dell PowerEdge R760",
    datacenter: "us-east-1",
    rack: "R20-U02",
    status: "Active",
    utilization: 45,
    notes: "Runs the training orchestrator.",
  },
  {
    id: "inv-12",
    name: "srv-node-02",
    type: "Server",
    model: "Dell PowerEdge R760",
    datacenter: "us-east-1",
    rack: "R20-U04",
    status: "Active",
    utilization: 38,
    notes: "",
  },
  {
    id: "inv-13",
    name: "srv-node-03",
    type: "Server",
    model: "Supermicro SYS-421GE",
    datacenter: "us-west-2",
    rack: "R05-U08",
    status: "Active",
    utilization: 52,
    notes: "",
  },
  {
    id: "inv-14",
    name: "srv-node-04",
    type: "Server",
    model: "Supermicro SYS-421GE",
    datacenter: "us-west-2",
    rack: "R05-U10",
    status: "Maintenance",
    utilization: 0,
    notes: "Disk replacement scheduled.",
  },
  {
    id: "inv-15",
    name: "srv-node-05",
    type: "Server",
    model: "HPE ProLiant DL380",
    datacenter: "eu-frankfurt-1",
    rack: "R09-U01",
    status: "Active",
    utilization: 30,
    notes: "",
  },
  {
    id: "inv-16",
    name: "srv-node-06",
    type: "Server",
    model: "HPE ProLiant DL380",
    datacenter: "eu-frankfurt-1",
    rack: "R09-U03",
    status: "Provisioning",
    utilization: 0,
    notes: "",
  },
  {
    id: "inv-17",
    name: "srv-node-07",
    type: "Server",
    model: "Lenovo ThinkSystem SR675",
    datacenter: "ap-southeast-1",
    rack: "R02-U15",
    status: "Active",
    utilization: 67,
    notes: "",
  },
  {
    id: "inv-18",
    name: "srv-node-08",
    type: "Server",
    model: "Lenovo ThinkSystem SR675",
    datacenter: "ap-southeast-1",
    rack: "R02-U17",
    status: "Decommissioned",
    utilization: 0,
    notes: "Replaced by srv-node-07.",
  },
  {
    id: "inv-19",
    name: "gpu-node-11",
    type: "GPU",
    model: "NVIDIA H100 80GB",
    datacenter: "us-west-2",
    rack: "R03-U26",
    status: "Active",
    utilization: 90,
    notes: "",
  },
  {
    id: "inv-20",
    name: "srv-node-09",
    type: "Server",
    model: "Dell PowerEdge R760",
    datacenter: "eu-frankfurt-1",
    rack: "R09-U05",
    status: "Active",
    utilization: 41,
    notes: "",
  },
];

/** Known datacenters and statuses, for the edit form's dropdowns. */
export const DATACENTERS = [
  "us-east-1",
  "us-west-2",
  "eu-frankfurt-1",
  "ap-southeast-1",
];

export const ASSET_TYPES: AssetType[] = ["GPU", "Server"];

export const ASSET_STATUSES: AssetStatus[] = [
  "Active",
  "Provisioning",
  "Maintenance",
  "Decommissioned",
];
