module.exports.up = async (db) => {
  // story and seed knows who's their parent
  await db.schema.table('stories', (table) => {
    table.uuid('parent_id');
  });

  await db.schema.table('seeds', (table) => {
    table.uuid('parent_id');
  });
};

module.exports.down = async (db) => {
  
};

module.exports.configuration = { transaction: true };
