import mongoose from "mongoose";
import BankNode from "../models/BankNode.js";
import FederatedRound from "../models/FederatedRound.js";
import GlobalModel from "../models/GlobalModel.js";
import ModelUpdate from "../models/ModelUpdate.js";
import PrivacyEvent from "../models/PrivacyEvent.js";
import AuditLog from "../models/AuditLog.js";
import datasetService, { normalizeBankKey } from "./datasetService.js";

export const isDbConnected = () => mongoose.connection.readyState === 1;

// Default initial state for 5 Real Federated Nodes from IBM AML Dataset
const memoryStore = {
  banks: [
    {
      bankId: "BANK-70",
      bankIdNum: 70,
      bankName: "Oasis Thrift",
      shortCode: "OAS",
      region: "US-North Central",
      datasetSize: 449859,
      status: "ONLINE",
      currentModelVersion: "v2.1.0-fedavg",
      differentialPrivacy: {
        enabled: true,
        epsilon: 1.25,
        delta: "1e-5",
        noiseMultiplier: 0.8,
        clipNorm: 1.0,
      },
      lastSeen: new Date(),
    },
    {
      bankId: "BANK-10",
      bankIdNum: 10,
      bankName: "National Bank of Laramie",
      shortCode: "NBL",
      region: "US-Mountain West",
      datasetSize: 81629,
      status: "ONLINE",
      currentModelVersion: "v2.1.0-fedavg",
      differentialPrivacy: {
        enabled: true,
        epsilon: 1.25,
        delta: "1e-5",
        noiseMultiplier: 0.8,
        clipNorm: 1.0,
      },
      lastSeen: new Date(),
    },
    {
      bankId: "BANK-12",
      bankIdNum: 12,
      bankName: "National Bank of the East",
      shortCode: "NBE",
      region: "US-Eastern Seaboard",
      datasetSize: 79754,
      status: "ONLINE",
      currentModelVersion: "v2.1.0-fedavg",
      differentialPrivacy: {
        enabled: true,
        epsilon: 1.25,
        delta: "1e-5",
        noiseMultiplier: 0.8,
        clipNorm: 1.0,
      },
      lastSeen: new Date(),
    },
    {
      bankId: "BANK-1",
      bankIdNum: 1,
      bankName: "Arbor Savings Bank",
      shortCode: "ASB",
      region: "US-Great Lakes",
      datasetSize: 62211,
      status: "ONLINE",
      currentModelVersion: "v2.1.0-fedavg",
      differentialPrivacy: {
        enabled: true,
        epsilon: 1.25,
        delta: "1e-5",
        noiseMultiplier: 0.8,
        clipNorm: 1.0,
      },
      lastSeen: new Date(),
    },
    {
      bankId: "BANK-15",
      bankIdNum: 15,
      bankName: "Japan Bank #0",
      shortCode: "JB0",
      region: "APAC Corridor",
      datasetSize: 52511,
      status: "ONLINE",
      currentModelVersion: "v2.1.0-fedavg",
      differentialPrivacy: {
        enabled: true,
        epsilon: 1.25,
        delta: "1e-5",
        noiseMultiplier: 0.8,
        clipNorm: 1.0,
      },
      lastSeen: new Date(),
    },
  ],
  rounds: [],
  updates: [],
  globalModels: [
    {
      version: "v2.1.0-fedavg",
      roundNumber: 5,
      architecture: {
        model: "FraudMLP",
        inputDim: 12,
        hiddenDims: [192, 128, 64],
        outputDim: 1,
        totalParameters: 36289,
      },
      metrics: {
        accuracy: 0.962,
        aucRoc: 0.948,
        f1Score: 0.892,
        precision: 0.915,
        recall: 0.871,
        loss: 0.118,
      },
      weightsChecksum: "e7b9f142",
      weightsSize: 145156,
      status: "DISTRIBUTED",
      participatingBanks: ["BANK-70", "BANK-10", "BANK-12", "BANK-1", "BANK-15"],
      isCurrent: true,
      createdAt: new Date(),
    },
  ],
  privacyEvents: [
    {
      _id: "pe-init-1",
      source: "BANK-70",
      destination: "FEDERATED_AGGREGATOR",
      transferType: "MODEL_GRADIENTS",
      payloadType: "PYTORCH_STATE_DICT",
      size: 145156,
      allowed: true,
      reason: "FedAvg update — DP-SGD differential privacy applied (raw banking data remains on-premise)",
      roundId: "ROUND-5-FEDAVG",
      bankId: "BANK-70",
      timestamp: new Date(),
    },
  ],
  auditLogs: [
    {
      _id: "al-init-1",
      action: "FEDERATION_INITIALIZED",
      actor: "FEDERATION_COORDINATOR",
      status: "SUCCESS",
      severity: "LOW",
      description: "FedShield Multi-Bank Federated AML network online with 5 real bank nodes (725,964 transactions)",
      timestamp: new Date(),
    },
  ],
};

// ─── BANKS REPO ────────────────────────────────────────────────────────────
export const bankRepo = {
  async getAll() {
    let banks = memoryStore.banks;
    if (isDbConnected()) {
      try {
        const found = await BankNode.find({}).sort({ bankId: 1 });
        if (found && found.length) banks = found.map((b) => (b.toObject ? b.toObject() : b));
      } catch (_) {}
    }
    return banks.map((b) => {
      const stats = datasetService.getBankStats(b.bankId);
      return {
        ...b,
        datasetSize: stats.totalTransactions || b.datasetSize,
        fraudCases: stats.fraudCount,
        fraudRatio: stats.fraudRatio,
        avgRiskScore: stats.avgRiskScore,
      };
    });
  },

  async getById(bankId) {
    const key = normalizeBankKey(bankId);
    let bank = null;
    if (isDbConnected()) {
      try {
        const found = await BankNode.findOne({ $or: [{ bankId: key }, { bankId }] });
        if (found) bank = found.toObject ? found.toObject() : found;
      } catch (_) {}
    }
    if (!bank) {
      bank = memoryStore.banks.find((b) => b.bankId === key) || memoryStore.banks[0];
    }
    if (!bank) return null;

    const stats = datasetService.getBankStats(key);
    return {
      ...bank,
      datasetSize: stats.totalTransactions || bank.datasetSize,
      fraudCases: stats.fraudCount,
      fraudRatio: stats.fraudRatio,
      avgRiskScore: stats.avgRiskScore,
    };
  },

  async update(bankId, fields) {
    const key = normalizeBankKey(bankId);
    if (isDbConnected()) {
      try {
        return await BankNode.findOneAndUpdate({ bankId: key }, fields, { new: true });
      } catch (_) {}
    }
    const idx = memoryStore.banks.findIndex((b) => b.bankId === key);
    if (idx !== -1) {
      memoryStore.banks[idx] = { ...memoryStore.banks[idx], ...fields, lastSeen: new Date() };
      return memoryStore.banks[idx];
    }
    return null;
  },

  async create(data) {
    if (isDbConnected()) {
      try { return await BankNode.create(data); } catch (_) {}
    }
    const existing = memoryStore.banks.find((b) => b.bankId === data.bankId);
    if (existing) {
      Object.assign(existing, data);
      return existing;
    }
    memoryStore.banks.push(data);
    return data;
  },
};

// ─── ROUNDS REPO ───────────────────────────────────────────────────────────
export const roundRepo = {
  async getAll(limit = 20) {
    if (isDbConnected()) {
      try { return await FederatedRound.find({}).sort({ roundNumber: -1 }).limit(limit); } catch (_) {}
    }
    return [...memoryStore.rounds].reverse().slice(0, limit);
  },

  async getById(roundId) {
    if (isDbConnected()) {
      try { return await FederatedRound.findOne({ roundId }); } catch (_) {}
    }
    return memoryStore.rounds.find((r) => r.roundId === roundId) || null;
  },

  async getCurrent() {
    if (isDbConnected()) {
      try {
        const round = await FederatedRound.findOne({
          status: { $in: ["WAITING", "COLLECTING", "AGGREGATING", "DISTRIBUTING"] },
        }).sort({ roundNumber: -1 });
        if (round) return round;
        return await FederatedRound.findOne({}).sort({ roundNumber: -1 });
      } catch (_) {}
    }
    const active = memoryStore.rounds.find((r) =>
      ["WAITING", "COLLECTING", "AGGREGATING", "DISTRIBUTING"].includes(r.status)
    );
    if (active) return active;
    return memoryStore.rounds[memoryStore.rounds.length - 1] || null;
  },

  async getLastRound() {
    if (isDbConnected()) {
      try { return await FederatedRound.findOne({}).sort({ roundNumber: -1 }); } catch (_) {}
    }
    return memoryStore.rounds[memoryStore.rounds.length - 1] || null;
  },

  async create(data) {
    if (isDbConnected()) {
      try { return await FederatedRound.create(data); } catch (_) {}
    }
    const r = { ...data, timeline: data.timeline || [], createdAt: new Date() };
    memoryStore.rounds.push(r);
    return r;
  },

  async update(roundId, fields) {
    if (isDbConnected()) {
      try {
        return await FederatedRound.findOneAndUpdate({ roundId }, fields, { new: true });
      } catch (_) {}
    }
    const idx = memoryStore.rounds.findIndex((r) => r.roundId === roundId);
    if (idx !== -1) {
      if (fields.$push && fields.$push.timeline) {
        memoryStore.rounds[idx].timeline = memoryStore.rounds[idx].timeline || [];
        memoryStore.rounds[idx].timeline.push(fields.$push.timeline);
      }
      const cleanFields = { ...fields };
      delete cleanFields.$push;
      memoryStore.rounds[idx] = { ...memoryStore.rounds[idx], ...cleanFields };
      return memoryStore.rounds[idx];
    }
    return null;
  },
};

// ─── UPDATES REPO ──────────────────────────────────────────────────────────
export const updateRepo = {
  async getByQuery(query = {}) {
    if (isDbConnected()) {
      try { return await ModelUpdate.find(query).sort({ roundNumber: -1, createdAt: -1 }); } catch (_) {}
    }
    return memoryStore.updates.filter((u) => {
      for (const [k, v] of Object.entries(query)) {
        if (u[k] !== v) return false;
      }
      return true;
    });
  },

  async create(data) {
    if (isDbConnected()) {
      try { return await ModelUpdate.create(data); } catch (_) {}
    }
    const u = { _id: `upd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...data, createdAt: new Date() };
    memoryStore.updates.push(u);
    return u;
  },
};

// ─── GLOBAL MODELS REPO ────────────────────────────────────────────────────
export const modelRepo = {
  async getAll() {
    if (isDbConnected()) {
      try { return await GlobalModel.find({}).sort({ createdAt: -1 }); } catch (_) {}
    }
    return [...memoryStore.globalModels].reverse();
  },

  async getCurrent() {
    if (isDbConnected()) {
      try {
        const curr = await GlobalModel.findOne({ isCurrent: true }).sort({ createdAt: -1 });
        if (curr) return curr;
        return await GlobalModel.findOne({}).sort({ createdAt: -1 });
      } catch (_) {}
    }
    const current = memoryStore.globalModels.find((m) => m.isCurrent);
    return current || memoryStore.globalModels[memoryStore.globalModels.length - 1] || null;
  },

  async getByVersion(version) {
    if (isDbConnected()) {
      try { return await GlobalModel.findOne({ version }); } catch (_) {}
    }
    return memoryStore.globalModels.find((m) => m.version === version) || null;
  },

  async create(data) {
    if (isDbConnected()) {
      try {
        if (data.isCurrent) {
          await GlobalModel.updateMany({}, { isCurrent: false });
        }
        return await GlobalModel.create(data);
      } catch (_) {}
    }
    if (data.isCurrent) {
      memoryStore.globalModels.forEach((m) => { m.isCurrent = false; });
    }
    const m = { ...data, createdAt: new Date() };
    memoryStore.globalModels.push(m);
    return m;
  },

  async update(version, fields) {
    if (isDbConnected()) {
      try {
        return await GlobalModel.findOneAndUpdate({ version }, fields, { new: true });
      } catch (_) {}
    }
    const idx = memoryStore.globalModels.findIndex((m) => m.version === version);
    if (idx !== -1) {
      memoryStore.globalModels[idx] = { ...memoryStore.globalModels[idx], ...fields };
      return memoryStore.globalModels[idx];
    }
    return null;
  },
};

// ─── PRIVACY REPO ──────────────────────────────────────────────────────────
export const privacyRepo = {
  async getEvents(limit = 50) {
    if (isDbConnected()) {
      try { return await PrivacyEvent.find({}).sort({ timestamp: -1 }).limit(limit); } catch (_) {}
    }
    return [...memoryStore.privacyEvents].reverse().slice(0, limit);
  },

  async getByRound(roundId) {
    if (isDbConnected()) {
      try { return await PrivacyEvent.find({ roundId }).sort({ timestamp: 1 }); } catch (_) {}
    }
    return memoryStore.privacyEvents.filter((e) => e.roundId === roundId);
  },

  async create(data) {
    if (isDbConnected()) {
      try { return await PrivacyEvent.create(data); } catch (_) {}
    }
    const e = {
      _id: `pe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...data,
      timestamp: new Date(),
    };
    memoryStore.privacyEvents.push(e);
    return e;
  },

  async getSummary() {
    const events = isDbConnected()
      ? await PrivacyEvent.find({}).catch(() => memoryStore.privacyEvents)
      : memoryStore.privacyEvents;

    const total = events.length;
    const allowed = events.filter((e) => e.allowed).length;
    const blocked = events.filter((e) => !e.allowed).length;
    const totalBytes = events.filter((e) => e.allowed).reduce((acc, e) => acc + (e.size || 0), 0);

    return {
      privacyEventsTotal: total,
      allowedTransfers: allowed,
      blockedTransfers: blocked,
      bytesTransferred: totalBytes,
      dpEpsilonBudget: 1.25,
      dpDeltaBudget: "1e-5",
      noiseMultiplier: 0.8,
      complianceStandard: "DPDP Act 2023 & PMLA Multi-Bank AML Protocol",
      privacyGuarantee: "Local raw data stays in bank perimeter. Only DP-SGD gradients shared.",
    };
  },
};

// ─── AUDIT REPO ────────────────────────────────────────────────────────────
export const auditRepo = {
  async getLogs(query = {}, limit = 50, skip = 0) {
    if (isDbConnected()) {
      try {
        const filter = {};
        if (query.action) filter.action = query.action;
        if (query.status) filter.status = query.status;
        if (query.bankId) filter.bankId = query.bankId;
        const [logs, total] = await Promise.all([
          AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit),
          AuditLog.countDocuments(filter),
        ]);
        return { logs, total };
      } catch (_) {}
    }
    const filtered = memoryStore.auditLogs.filter((l) => {
      if (query.action && l.action !== query.action) return false;
      if (query.status && l.status !== query.status) return false;
      if (query.bankId && l.bankId !== query.bankId) return false;
      return true;
    });
    return {
      logs: [...filtered].reverse().slice(skip, skip + limit),
      total: filtered.length,
    };
  },

  async create(data) {
    if (isDbConnected()) {
      try { return await AuditLog.create(data); } catch (_) {}
    }
    const log = {
      _id: `al-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...data,
      timestamp: new Date(),
    };
    memoryStore.auditLogs.push(log);
    return log;
  },
};
