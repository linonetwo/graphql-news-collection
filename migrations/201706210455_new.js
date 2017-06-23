module.exports.up = async (db) => {
  // User accounts add jwt login
  await db.schema.table('users', (table) => {
    table.string('username', 100);
    table.string('password', 100);
    table.string('image_url', 400);
  });
};

module.exports.down = async (db) => {
};

module.exports.configuration = { transaction: true };
