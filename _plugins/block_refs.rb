# Obsidian block labels and links to them, on the same page. Runs before markdown is converted.
#
# A label is "^label" at the end of a line, or on a line of its own (as Obsidian puts it after a callout or list).
# It becomes an empty <span class="block-label" data-label="label">, on its own line so that kramdown still sees
# the rest of the line as it was: "$$...$$ ^label" stays display math. _includes/callouts.html gives the
# labeled callout (or, for other blocks, the paragraph or list item) the id "label".
#
# Links [[#^label]] and [[#^label|text]] become <a class="block-ref" href="#label">. Kramdown would print the
# brackets as they are, and the | of [[#^label|text]] would turn its paragraph into a table. A link written
# without text is filled in by _includes/callouts.html with the name of what it points to ("Theorem 2", say).

module BlockRefs
  REF = /\[\[#\^([\w-]+)(?:\|([^\]]*))?\]\]/
  LABEL = /(\A|[ \t])\^([\w-]+)[ \t]*\z/
  FENCE = /\A[ \t]*(```|~~~)/
  QUOTE = /\A(?:[ \t]*>)*[ \t]*/          # blockquote markers and indentation before the text of a line
  ITEM = /\A(?:\d+\.|[-*+])[ \t]+/        # a list item marker; text after it is indented by its width

  def self.span(label)
    %(<span class="block-label" data-label="#{label}"></span>)
  end

  def self.process(markdown)
    fenced = false
    markdown.split("\n", -1).flat_map do |line|
      fenced = !fenced if line =~ FENCE
      next [line] if fenced || line =~ FENCE
      line = line.gsub(REF) { %(<a class="block-ref" href="##{$1}">#{$2}</a>) }
      m = line.match(LABEL)
      next [line] unless m
      prefix = line[QUOTE]
      text = line[prefix.length...m.begin(0)]
      next [prefix + span(m[2])] if text.strip.empty?                      # a label on its own line
      cont = prefix.gsub(/[^>\s]/, ' ') + (text[ITEM] ? ' ' * text[ITEM].length : '')
      gap = text.strip =~ /\A\$\$.*\$\$\z/ ? [prefix.rstrip] : []            # keep display math a block of its own
      [prefix + text.rstrip, *gap, cont + span(m[2])]
    end.join("\n")
  end
end

Jekyll::Hooks.register [:documents, :pages], :pre_render do |doc|
  next unless %w[.md .markdown].include?(doc.extname)
  doc.content = BlockRefs.process(doc.content)
end
