export default {
	async fetch(request, env) {
		const url = new URL(request.url)
		const path = url.pathname

		if (path === '/words' && request.method === 'GET') {
			const stmt = env.DB.prepare('SELECT * FROM words')
			const { results } = await stmt.all()
			return new Response(JSON.stringify(results), {
				headers: { 'content-type': 'application/json' },
			})
		}

		if (path === '/words/upsert' && request.method === 'POST') {
			const body = (await request.json()) as { word: string; tag?: string }
			const { word, tag } = body
			if (!word) {
				return new Response(JSON.stringify({ error: 'word is required' }), {
					status: 400,
					headers: { 'content-type': 'application/json' },
				})
			}
			const stmt = env.DB.prepare('INSERT INTO words (word, count, tag) VALUES (?, 0, ?) ON CONFLICT(word) DO UPDATE SET count = count + 1')
			await stmt.bind(word, tag || null).run()
			return new Response(JSON.stringify({ success: true }), {
				headers: { 'content-type': 'application/json' },
			})
		}

		return new Response(JSON.stringify({ error: 'Not found' }), {
			status: 404,
			headers: { 'content-type': 'application/json' },
		})
	},
} satisfies ExportedHandler<Env>
