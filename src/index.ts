import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(
	'*',
	cors({
		origin: ['http://localhost:5500', 'https://hero-utils.pages.dev'],
	}),
)

app.get('/words', async (c) => {
	const stmt = (c.env as { DB: D1Database }).DB.prepare('SELECT * FROM words')
	const { results } = await stmt.all()
	return c.json(results)
})

app.post('/words/upsert', async (c) => {
	const body = await c.req.json<{ word: string; tag?: string }>()
	const { word, tag } = body
	if (!word) {
		return c.json({ error: 'word is required' }, 400)
	}
	const stmt = (c.env as { DB: D1Database }).DB.prepare(
		'INSERT INTO words (word, count, tag) VALUES (?, 1, ?) ON CONFLICT(word) DO UPDATE SET count = count + 1',
	)
	await stmt.bind(word, tag || null).run()
	return c.json({ success: true })
})

export default app
