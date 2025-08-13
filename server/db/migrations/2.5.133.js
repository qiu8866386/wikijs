exports.up = async (knex) => {
  // 为pages表添加aiContent字段，用于存储AI生成的内容
  return knex.schema.table('pages', table => {
    table.text('aiContent').nullable()
  })
}

exports.down = async (knex) => {
  // 删除aiContent字段
  return knex.schema.table('pages', table => {
    table.dropColumn('aiContent')
  })
}