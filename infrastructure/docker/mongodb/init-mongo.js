// ===================================================================
// MongoDB Initialization Script
// ===================================================================
//
// This script initializes MongoDB databases and collections
// for the Titan Watch microservices.
//
// Databases created:
// - kaiju_db: For Kaiju Service (Hexagonal Architecture)
// - event_db: For Event Service (Event Sourcing)
//
// ===================================================================

// Switch to admin database
db = db.getSiblingDB('admin');

// Create Kaiju Database
db = db.getSiblingDB('kaiju_db');
db.createCollection('kaijus');
db.kaijus.createIndex({ "location": "2dsphere" });
db.kaijus.createIndex({ "status": 1 });
db.kaijus.createIndex({ "threatLevel": -1 });
db.kaijus.createIndex({ "lastSeenAt": -1 });

// Create collections for kaiju tracking
db.createCollection('detections');
db.detections.createIndex({ "kaijuId": 1, "timestamp": -1 });
db.detections.createIndex({ "source": 1 });

db.createCollection('behaviors');
db.behaviors.createIndex({ "kaijuId": 1, "analyzedAt": -1 });

print('✅ Kaiju Database initialized');

// Create Event Store Database
db = db.getSiblingDB('event_db');

// Event Store collection (append-only)
db.createCollection('events', {
    capped: false,
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["aggregateId", "eventType", "data", "timestamp", "version"],
            properties: {
                aggregateId: { bsonType: "string" },
                aggregateType: { bsonType: "string" },
                eventType: { bsonType: "string" },
                data: { bsonType: "object" },
                timestamp: { bsonType: "date" },
                version: { bsonType: "int" },
                metadata: { bsonType: "object" }
            }
        }
    }
});

// Indexes for event querying
db.events.createIndex({ "aggregateId": 1, "version": 1 }, { unique: true });
db.events.createIndex({ "aggregateType": 1, "timestamp": -1 });
db.events.createIndex({ "eventType": 1, "timestamp": -1 });
db.events.createIndex({ "timestamp": -1 });

// Snapshots collection for performance
db.createCollection('snapshots');
db.snapshots.createIndex({ "aggregateId": 1, "version": -1 });

print('✅ Event Store Database initialized');

// Create Analytics Database (for future use)
db = db.getSiblingDB('analytics_db');
db.createCollection('aggregations');
db.aggregations.createIndex({ "timestamp": -1 });

print('✅ Analytics Database initialized');

print('🎉 MongoDB initialization completed successfully!');
