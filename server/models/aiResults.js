const Model = require('objection').Model

/* global WIKI */

/**
 * AI Results model
 */
module.exports = class AIResult extends Model {
  static get tableName() { return 'aiResults' }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['content', 'pageId'],

      properties: {
        id: { type: 'integer' },
        pageId: { type: 'integer' },
        prompt: { type: 'string' },
        content: { type: 'string' },
        result: { type: 'string' },
        model: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
      }
    }
  }

  static get relationMappings() {
    return {
      page: {
        relation: Model.BelongsToOneRelation,
        modelClass: require('./pages'),
        join: {
          from: 'aiResults.pageId',
          to: 'pages.id'
        }
      }
    }
  }

  /**
   * Save AI result to database
   *
   * @param {Object} opts AI result properties
   * @returns {Promise} Promise of the AIResult model instance
   */
  static async saveResult(opts) {
    try {
      const result = await WIKI.models.aiResults.query().insert({
        pageId: opts.pageId,
        prompt: opts.prompt,
        content: opts.content,
        result: opts.result,
        model: opts.model || 'ZKXW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      return result
    } catch (err) {
      WIKI.logger.error('Failed to save AI result to database:', err)
      throw err
    }
  }
  
  /**
   * Get AI results by page ID
   *
   * @param {Number} pageId Page ID
   * @returns {Promise} Promise of the AIResult model instances
   */
  static async getByPageId(pageId) {
    try {
      const results = await WIKI.models.aiResults.query()
        .where('pageId', pageId)
        .orderBy('createdAt', 'desc')
      
      return results
    } catch (err) {
      WIKI.logger.error('Failed to get AI results from database:', err)
      throw err
    }
  }
}