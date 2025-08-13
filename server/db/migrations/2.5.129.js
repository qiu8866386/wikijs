exports.up = async (knex) => {
  // 空迁移文件，用于修复数据库迁移错误
  // 该版本不包含任何数据库结构更改
  return knex.schema.raw('SELECT 1')
}

exports.down = async (knex) => {
  // 回滚操作同样为空
  return knex.schema.raw('SELECT 1')
}
