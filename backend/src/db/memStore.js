/**
 * In-memory database store — used when MONGO_URI is not set.
 * Data is lost on server restart. For production, set MONGO_URI.
 */

const { v4: uuidv4 } = require('uuid');

class Collection {
  constructor(name) {
    this.name = name;
    this.docs = new Map();
  }

  _match(doc, query) {
    return Object.entries(query).every(([k, v]) => {
      if (k === '_id') return true;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        return Object.entries(v).every(([op, val]) => {
          if (op === '$in') return Array.isArray(val) && val.includes(doc[k]);
          return true;
        });
      }
      return doc[k] === v;
    });
  }

  async findOne(query) {
    for (const doc of this.docs.values()) {
      if (this._match(doc, query)) return { ...doc };
    }
    return null;
  }

  async find(query = {}) {
    const results = [];
    for (const doc of this.docs.values()) {
      if (this._match(doc, query)) results.push({ ...doc });
    }
    return {
      sort: () => ({ lean: () => Promise.resolve(results), toArray: () => Promise.resolve(results) }),
      lean: () => Promise.resolve(results),
      toArray: () => Promise.resolve(results),
    };
  }

  async insertOne(doc) {
    const id = doc._id || uuidv4();
    const stored = { ...doc, _id: id };
    this.docs.set(id, stored);
    return stored;
  }

  async create(doc) {
    return this.insertOne(doc);
  }

  async updateOne(query, update, options = {}) {
    let found = false;
    for (const [id, doc] of this.docs.entries()) {
      if (this._match(doc, query)) {
        if (update.$set) Object.assign(doc, update.$set);
        if (update.$inc) {
          for (const [k, v] of Object.entries(update.$inc)) {
            doc[k] = (doc[k] || 0) + v;
          }
        }
        this.docs.set(id, doc);
        found = true;
        break;
      }
    }
    if (!found && options.upsert) {
      const newDoc = { ...(update.$set || {}), _id: uuidv4() };
      this.docs.set(newDoc._id, newDoc);
    }
    return { matchedCount: found ? 1 : 0, modifiedCount: found ? 1 : 0 };
  }

  async deleteOne(query) {
    for (const [id, doc] of this.docs.entries()) {
      if (this._match(doc, query)) {
        this.docs.delete(id);
        return { deletedCount: 1 };
      }
    }
    return { deletedCount: 0 };
  }

  async countDocuments(query = {}) {
    let count = 0;
    for (const doc of this.docs.values()) {
      if (this._match(doc, query)) count++;
    }
    return count;
  }

  async aggregate(pipeline) {
    const matchStage = pipeline.find(s => s.$match)?.$match || {};
    const groupStage = pipeline.find(s => s.$group)?.$group;
    let docs = [];
    for (const doc of this.docs.values()) {
      if (this._match(doc, matchStage)) docs.push(doc);
    }
    if (!groupStage) return docs;
    const result = { _id: null };
    for (const [k, v] of Object.entries(groupStage)) {
      if (k === '_id') continue;
      if (v.$sum) {
        const field = typeof v.$sum === 'string' ? v.$sum.replace('$', '') : null;
        result[k] = field ? docs.reduce((s, d) => s + (d[field] || 0), 0) : docs.length * v.$sum;
      }
    }
    return docs.length ? [result] : [];
  }

  async findOneAndUpdate(query, update, options = {}) {
    await this.updateOne(query, update, options);
    return this.findOne(query);
  }
}

const store = {
  collections: {},
  isMemory: true,
  getCollection(name) {
    if (!this.collections[name]) this.collections[name] = new Collection(name);
    return this.collections[name];
  }
};

module.exports = store;
