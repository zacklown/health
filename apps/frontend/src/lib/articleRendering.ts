export type TocItem = {
	id: string;
	text: string;
	level: number;
};

function escapeHtml(input: string): string {
	return input
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

export function getDictionaryLetter(slug: string): string {
	const normalized = slugifyHeading(slug);
	const firstCharacter = normalized.charAt(0).toUpperCase();
	return /^[A-Z]$/.test(firstCharacter) ? firstCharacter : '#';
}

export function buildDictionaryAnchor(slug: string): string {
	const normalized = slugifyHeading(slug) || 'term';
	const letter = getDictionaryLetter(normalized).toLowerCase().replace(/[^a-z0-9]/g, 'other');
	return `${letter}-${normalized}`;
}

function renderTermLinks(text: string): string {
	const bracketSyntaxLinked = text.replace(/\[\[([a-z0-9][a-z0-9-]{0,63})\]\]/gi, (match, rawTag) => {
		const tag = String(rawTag || '');
		if (!tag) return match;
		const slug = tag.toLowerCase();
		return `<a class="term-link" href="/dictionary#${encodeURIComponent(buildDictionaryAnchor(slug))}">${tag}</a>`;
	});

	return bracketSyntaxLinked.replace(/(^|[\s(>])#([a-z0-9][a-z0-9-]{0,63})\b/gi, (match, prefix, rawTag) => {
		const tag = String(rawTag || '');
		if (!tag) return match;
		if (/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(tag)) return match;
		const slug = tag.toLowerCase();
		return `${prefix}<a class="term-link" href="/dictionary#${encodeURIComponent(buildDictionaryAnchor(slug))}">${tag}</a>`;
	});
}

function renderInlineMarkdown(line: string): string {
	let output = escapeHtml(line);
	output = output.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');
	output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
	output = renderTermLinks(output);
	output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	output = output.replace(/\*([^*]+)\*/g, '<em>$1</em>');
	output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
	return output;
}

export function renderMarkdownWithToc(markdown: string): { html: string; toc: TocItem[] } {
	const lines = markdown.replaceAll('\r\n', '\n').split('\n');
	const htmlParts: string[] = [];
	const toc: TocItem[] = [];
	const headingCounts = new Map<string, number>();
	let paragraphLines: string[] = [];
	let inList = false;

	function flushParagraph() {
		if (!paragraphLines.length) {
			return;
		}
		htmlParts.push(`<p>${renderInlineMarkdown(paragraphLines.join(' '))}</p>`);
		paragraphLines = [];
	}

	function closeList() {
		if (!inList) {
			return;
		}
		htmlParts.push('</ul>');
		inList = false;
	}

	function getHeadingId(text: string): string {
		const base = slugifyHeading(text) || 'section';
		const count = headingCounts.get(base) ?? 0;
		headingCounts.set(base, count + 1);
		return count === 0 ? base : `${base}-${count + 1}`;
	}

	for (const rawLine of lines) {
		const line = rawLine.trim();

		if (!line) {
			flushParagraph();
			closeList();
			continue;
		}

		const horizontalRuleMatch = line.match(/^(-{3,}|\*{3,}|_{3,})$/);
		if (horizontalRuleMatch) {
			flushParagraph();
			closeList();
			htmlParts.push('<hr />');
			continue;
		}

		const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
		if (headingMatch) {
			flushParagraph();
			closeList();
			const level = headingMatch[1].length;
			const headingText = headingMatch[2].trim();
			const headingId = getHeadingId(headingText);
			toc.push({ id: headingId, text: headingText, level });
			htmlParts.push(`<h${level} id="${headingId}">${renderInlineMarkdown(headingText)}</h${level}>`);
			continue;
		}

		const listMatch = line.match(/^[-*]\s+(.+)$/);
		if (listMatch) {
			flushParagraph();
			if (!inList) {
				htmlParts.push('<ul>');
				inList = true;
			}
			htmlParts.push(`<li>${renderInlineMarkdown(listMatch[1])}</li>`);
			continue;
		}

		paragraphLines.push(line);
	}

	flushParagraph();
	closeList();

	return { html: htmlParts.join('\n'), toc };
}

export function renderMarkdown(markdown: string): string {
	return renderMarkdownWithToc(markdown).html;
}
