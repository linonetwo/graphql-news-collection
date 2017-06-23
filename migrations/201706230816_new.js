module.exports.up = async (db) => {
  await db.schema.createTable('seed_seed', (table) => {
    table.uuid('id').notNullable().references('id').inTable('seeds').onDelete('CASCADE').onUpdate('CASCADE');
    table.uuid('parent_id').notNullable().references('id').inTable('seeds').onDelete('CASCADE').onUpdate('CASCADE');
    table.primary(['parent_id', 'id']);
  });

  await db.schema.createTable('seed_stories', (table) => {
    table.uuid('seed_id').notNullable().references('id').inTable('seeds').onDelete('CASCADE').onUpdate('CASCADE');
    table.uuid('story_id').notNullable().references('id').inTable('stories').onDelete('CASCADE').onUpdate('CASCADE');
    table.primary(['story_id', 'seed_id']);
  });
};

module.exports.down = async (db) => {

};

module.exports.configuration = { transaction: true };
