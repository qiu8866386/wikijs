const OpenAI = require('openai')
const _ = require('lodash')

/* global WIKI */

module.exports = {
  openai: null,
  isEnabled: false,

  /**
   * 初始化 OpenAI 客户端
   */
  async init() {
    const openaiKey = _.get(WIKI.config, 'sk-g7DLh7ebeOVnjSOhqOoIAls8y0xdHgANMP0Xjn9X6J0pcL1F', '')
    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey
      })
      this.isEnabled = true
      WIKI.logger.info('OpenAI service initialized successfully.')
    } else {
      WIKI.logger.warn('OpenAI API key not configured. OpenAI features will be disabled.')
    }
  },

  /**
   * 调用 OpenAI Chat Completion API
   *
   * @param {string} prompt 用户输入提示
   * @param {object} options 其他选项
   * @returns {Promise<string>} AI 生成的回复
   */
  async chatCompletion(prompt, options = {}) {
    if (!this.isEnabled || !this.openai) {
      throw new Error('OpenAI service is not enabled or initialized.')
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: options.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: options.systemMessage || 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
      })

      return response.choices[0].message.content
    } catch (error) {
      WIKI.logger.error('Error calling OpenAI API:', error)
      throw error
    }
  },

  /**
   * 调用 OpenAI Completion API (适用于旧模型)
   *
   * @param {string} prompt 用户输入提示
   * @param {object} options 其他选项
   * @returns {Promise<string>} AI 生成的回复
   */
  async completion(prompt, options = {}) {
    if (!this.isEnabled || !this.openai) {
      throw new Error('OpenAI service is not enabled or initialized.')
    }

    try {
      const response = await this.openai.completions.create({
        model: options.model || 'text-davinci-003',
        prompt: prompt,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
      })

      return response.choices[0].text
    } catch (error) {
      WIKI.logger.error('Error calling OpenAI Completion API:', error)
      throw error
    }
  }
}
