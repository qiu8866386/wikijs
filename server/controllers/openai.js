const OpenAI = require('openai')
const express = require('express')
const router = express.Router()

// 读取环境变量中的 API Key（推荐在生产环境使用环境变量）
const apiKey = 'sk-S9pbSD2Nd3e8NJHVuUBWaBpUG6Kqx6jkemYnlrpkPy7ffVsK'
const baseURL = 'https://fastbase.csic.cn/v1/'

router.post('/summarize', async (req, res) => {
  console.log('[99999999999999999]', req.body)
  try {
    const { prompt, content, pageId } = req.body

    if (!prompt || !content || !pageId) {
      return res.status(400).json({ error: '缺少 prompt、content 或 pageId 参数' })
    }

    console.log(`[Summarize] prompt: ${prompt}`)
    console.log(`[Summarize] content: ${content}`)
    console.log(`[Summarize] pageId: ${pageId}`)

    // 初始化 OpenAI 客户端
    const openai = new OpenAI({
      apiKey,
      baseURL,
      timeout: 60000,
      maxRetries: 3
    })

    // 调用 Chat Completions
    const completion = await openai.chat.completions.create({
      model: 'GZWYY-VL',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: content }
      ]
    })

    const result = completion.choices?.[0]?.message?.content || ''

    // 更新数据库中对应 pageId 的 aiContent
    try {
      // 查询页面
      const page = await WIKI.models.pages.query().findById(pageId)

      if (!page) {
        return res.status(404).json({ error: `未找到 pageId 为 ${pageId} 的页面` })
      }

      // 只更新 aiContent 字段
      await WIKI.models.pages
        .query()
        .findById(pageId)
        .patch({
          aiContent: result
        })

      console.log(`[Summarize] 已更新页面 ${pageId} 的 aiContent 字段`)
    } catch (dbError) {
      console.error('[Database Error] 更新页面 aiContent 时出错:', dbError)
    }

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
