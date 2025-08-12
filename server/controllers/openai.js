const OpenAI = require('openai')
const express = require('express')
const router = express.Router()

// 读取环境变量中的 API Key（推荐）
const apiKey = 'sk-S9pbSD2Nd3e8NJHVuUBWaBpUG6Kqx6jkemYnlrpkPy7ffVsK'
const baseURL = 'https://fastbase.csic.cn/v1/'

router.post('/summarize', async (req, res) => {
  try {
    const { prompt, content } = req.body

    if (!prompt || !content) {
      return res.status(400).json({ error: '缺少 prompt 或 content 参数' })
    }

    console.log(`[Summarize] prompt: ${prompt}`)
    console.log(`[Summarize] content: ${content}`)

    // 初始化 OpenAI 客户端
    const openai = new OpenAI({
      apiKey,
      baseURL,
      timeout: 60000,
      maxRetries: 3
    })

    // 调用 Chat Completions
    const completion = await openai.chat.completions.create({
      model: 'ZKXW',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: content }
      ]
      // temperature: 0.7,
      // max_tokens: 1024
    })

    const result = completion.choices?.[0]?.message?.content || ''
    console.log(`[Summarize] AI Response: ${result}`)

    res.json({ result })
  } catch (error) {
    console.error('[OpenAI Error]', error)

    let errorMessage = error.message || '未知错误'
    if (error.constructor?.name === 'APIConnectionTimeoutError') {
      errorMessage = '请求 OpenAI API 超时，请检查网络连接或稍后重试'
    } else if (error.constructor?.name === 'APIError') {
      errorMessage = `OpenAI API 错误: ${error.message}`
    } else if (error.constructor?.name === 'AuthenticationError') {
      errorMessage = 'OpenAI API 认证失败，请检查 API 密钥是否正确'
    }

    res.status(500).json({ error: errorMessage })
  }
})

module.exports = router
