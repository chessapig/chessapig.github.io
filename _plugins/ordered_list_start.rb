# Keep the numbers of ordered lists that don't start at 1.
# Kramdown always numbers a list from 1, so a list written as "2. ..." (say, after a paragraph that
# interrupts a list) would show as 1. Before markdown is converted, this puts the block attribute
# {: start="2"} on its own line above such a list, which kramdown turns into <ol start="2">.
# Obsidian already shows the typed number, so the markdown is written the same way for both.
# Lists inside blockquotes (and so callouts) are handled too: the attribute goes inside the quote.

module OrderedListStart
  ITEM = /\A {0,3}(\d+)\.[ \t]+/   # up to 3 spaces may come before an item; its text starts after the spaces
  FENCE = /\A[ \t]*(```|~~~)/
  QUOTE = /\A(?:[ \t]*>)*/          # blockquote markers

  def self.process(markdown)
    out = []
    # list state at each blockquote depth: inside a list, how far its items' text is indented, previous line blank
    states = Hash.new { |h, k| h[k] = { in_list: false, indent: 0, blank: false } }
    depth = 0
    fenced = false
    markdown.split("\n", -1).each do |line|
      fenced = !fenced if line =~ FENCE
      if fenced || line =~ FENCE
        out << line
        next
      end
      prefix = line[QUOTE]
      text = line[prefix.length..].sub(/\A /, '')   # kramdown drops one space after the last >
      d = prefix.count('>')
      if d > depth
        # a quote opening inside a list continues it (lazily), unless it comes after a blank line, unindented
        outer = states[depth]
        outer[:in_list] = false if outer[:blank] && prefix[/\A[ \t]*/].length < outer[:indent]
        outer[:blank] = false
        (depth + 1..d).each { |k| states.delete(k) }
      elsif d < depth
        (d + 1..depth).each { |k| states.delete(k) }
      end
      depth = d
      st = states[d]
      if (m = text.match(ITEM))
        if !st[:in_list] && m[1].to_i != 1
          out << prefix.rstrip unless out.empty? || out.last[QUOTE].length == out.last.rstrip.length
          out << prefix + %({: start="#{m[1].to_i}"})
        end
        st[:in_list] = true
        st[:indent] = m[0].length
      elsif text.strip.empty?
        st[:blank] = true
        out << line
        next
      elsif st[:blank] && text[/\A */].length < st[:indent]
        st[:in_list] = false   # after a blank line, the list goes on only with text indented as far as its items' text
      end
      st[:blank] = false
      out << line
    end
    out.join("\n")
  end
end

Jekyll::Hooks.register [:documents, :pages], :pre_render do |doc|
  next unless %w[.md .markdown].include?(doc.extname)
  doc.content = OrderedListStart.process(doc.content)
end
