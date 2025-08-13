exports.up = knex => {
  return knex.schema.createTable('aiResults', table => {
    table.increments('id').primary()
    table.integer('pageId').unsigned().references('id').inTable('pages').onDelete('CASCADE')
    table.text('prompt')
    table.text('content')
    table.text('result')
    table.string('model')
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })
}

exports.down = knex => {
  return knex.schema.dropTable('aiResults')
}