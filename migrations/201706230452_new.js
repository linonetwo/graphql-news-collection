module.exports.up = async (db) => {
  // SEED for crawler
  await db.schema.createTable('seeds', (table) => {
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v1mc()')).primary();
    table.string('title', 80).notNullable();
    table.string('url', 200);
    table.string('type', 200);
    table.boolean('using').defaultTo(false);
    table.boolean('done').defaultTo(false);
    table.timestamps(false, true);
  });
};

module.exports.down = async (db) => {
  
};

module.exports.configuration = { transaction: true };
