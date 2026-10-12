# Lets math be written as in Obsidian. Runs before markdown is converted.
#
# Kramdown reads markdown escapes inside $...$ (it only treats $$...$$ as math), so \{ \} \< \> \\ \! \: ... lose
# their backslash. And a | in math, $...$ or $$...$$, on a line of text makes kramdown read the paragraph as a table.
# So, in math:
#   |  ->  \vert      \|  ->  \Vert        (everywhere)
#   \< ->  \langle    \>  ->  \rangle      ($...$ only; in $$...$$ the preamble's \<x\> works as written)
#   \\ \{ \} \! \: \# keep their backslash ($...$ only): written as \\\X, which kramdown turns into \X
#   _  ->  \_         *  ->  \*            ($...$ only), so kramdown can't read them as emphasis: it turns \_ back into _
# Escapes already written, like \_ and \*, are left for kramdown, which turns them into _ and *.
# Code blocks, `code`, \$ and raw HTML blocks (which kramdown doesn't read as markdown) are left alone.

module MathEscapes
  KEEP = '\\{}!:#'   # TeX commands that kramdown would unescape: \\ \{ \} \! \: \#
  WORDS = { '<' => '\\langle', '>' => '\\rangle', '|' => '\\Vert' }

  TOKEN = /
      (?<fence>^[ \t]*(?<f>```|~~~).*?^[ \t]*\k<f>[^\n]*$)   # fenced code block
    | (?<code>(?<t>`+)[^\n]+?\k<t>)                           # inline code
    | (?<dollar>\\\$)                                          # an escaped dollar sign
    | (?<double>(?<dd>\${2,})(?:(?!\n[ \t]*\n).)+?\k<dd>)          # $$...$$ (or $$$$...$$$$), within a paragraph
    | (?<single>\$(?=\S)[^$\n]*?(?<=\S)\$)                     # $...$
  /mx

  # a control word followed by a letter needs a space after it
  def self.word(w, rest)
    rest =~ /\A[A-Za-z]/ ? w + ' ' : w
  end

  def self.fix_double(tex)
    tex.gsub(/\\\||\|/) { word(Regexp.last_match[0] == '|' ? '\\vert' : '\\Vert', Regexp.last_match.post_match) }
  end

  def self.fix_single(tex)
    tex.gsub(/\\(.)|[|_*]/m) do
      m = Regexp.last_match
      if m[0] == '|' then word('\\vert', m.post_match)
      elsif m[0] == '_' || m[0] == '*' then '\\' + m[0]
      elsif WORDS[m[1]] then word(WORDS[m[1]], m.post_match)
      elsif KEEP.include?(m[1]) then '\\\\\\' + m[1]
      else m[0]
      end
    end
  end

  # Raw HTML blocks: kramdown leaves their contents as they are (no escapes are read), so their math must be too.
  # A block starts with a block-level tag at the start of a line and runs to its matching end tag; with
  # markdown="1" its contents are markdown after all.
  BLOCK_TAGS = %w[address article aside blockquote canvas center details dialog div dl fieldset figcaption figure
                  footer form h1 h2 h3 h4 h5 h6 header hgroup hr iframe li main nav noscript ol p pre script section
                  style summary table tbody td tfoot th thead tr ul video].freeze
  HTML_START = /\A {0,3}<(#{BLOCK_TAGS.join('|')})\b([^>]*)>?/i

  # the markdown split into [text, is_markdown] chunks, by line
  def self.chunks(markdown)
    out = []
    tag = nil; depth = 0; md_inside = false
    fenced = false
    markdown.split("\n", -1).each do |line|
      fenced = !fenced if tag.nil? && line =~ /\A[ \t]*(```|~~~)/
      raw = false
      if tag
        depth += line.scan(/<#{tag}\b/i).size - line.scan(%r{</#{tag}\s*>}i).size
        raw = !md_inside || depth <= 0
        tag = nil if depth <= 0
      elsif !fenced && (m = line.match(HTML_START))
        tag = m[1]
        md_inside = m[2] =~ /markdown\s*=\s*["']?(1|block|span)/i
        depth = line.scan(/<#{tag}\b/i).size - line.scan(%r{</#{tag}\s*>}i).size
        tag = nil if depth <= 0 || tag =~ /\Ahr\z/i
        raw = true
      end
      out << [+'', !raw] if out.empty? || out.last[1] == raw   # a new chunk when the kind of line changes
      out.last[0] << line << "\n"
    end
    out.last[0].chomp!("\n") unless out.empty?
    out
  end

  def self.process(markdown)
    chunks(markdown).map do |text, is_markdown|
      next text unless is_markdown
      text.gsub(TOKEN) do
        m = Regexp.last_match
        if m[:double] then fix_double(m[0])
        elsif m[:single] then fix_single(m[0])
        else m[0]
        end
      end
    end.join
  end
end

Jekyll::Hooks.register [:documents, :pages], :pre_render do |doc|
  next unless %w[.md .markdown].include?(doc.extname)
  doc.content = MathEscapes.process(doc.content)
end
