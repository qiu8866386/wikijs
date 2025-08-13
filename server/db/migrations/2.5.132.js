exports.up = async (knex) => {
  // 为pages表添加aiContentAt字段，用于记录AI内容生成时间
  return knex.schema.table('pages', table => {
    table.timestamp('aiContentAt').nullable()
  })
}

exports.down = async (knex) => {
  // 删除aiContentAt字段
  return knex.schema.table('pages', table => {
    table.dropColumn('aiContentAt')
  })
}