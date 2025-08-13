exports.up = knex => {
  return knex.schema.table('pages', table => {
    table.text('aiSummary').defaultTo('')
  })
}

exports.down = knex => {
  return knex.schema.table('pages', table => {
    table.dropColumn('aiSummary')
  })
}
