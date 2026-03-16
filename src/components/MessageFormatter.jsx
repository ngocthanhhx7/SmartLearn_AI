import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

function parseMarkdown(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const elements = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trimStart();

    if (trimmed.startsWith('## ')) {
      elements.push({ type: 'h2', content: trimmed.slice(3), key: idx });
    } else if (trimmed.startsWith('### ')) {
      elements.push({ type: 'h3', content: trimmed.slice(4), key: idx });
    } else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.+)/);
      if (match) elements.push({ type: 'numbered', num: match[1], content: match[2], key: idx });
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      elements.push({ type: 'bullet', content: trimmed.slice(2), key: idx });
    } else if (trimmed.startsWith('```')) {
      elements.push({ type: 'codeStart', key: idx });
    } else if (trimmed === '') {
      elements.push({ type: 'spacer', key: idx });
    } else {
      elements.push({ type: 'text', content: line, key: idx });
    }
  });

  return elements;
}

export default function MessageFormatter({ text }) {
  const { theme, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: { gap: 2 },
    h2: {
      fontSize: 17, fontWeight: '800', color: theme.text, marginTop: 12, marginBottom: 6,
      borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 6,
    },
    h3: {
      fontSize: 15, fontWeight: '700', color: theme.textSecondary, marginTop: 10, marginBottom: 4,
    },
    paragraph: { color: theme.text, fontSize: 14, lineHeight: 22 },
    bold: { fontWeight: '700', color: theme.text },
    inlineCode: {
      fontFamily: 'monospace', backgroundColor: theme.surface, color: theme.primary,
      paddingHorizontal: 4, borderRadius: 4, fontSize: 13, borderWidth: 1, borderColor: theme.border,
    },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 2, paddingLeft: 4 },
    bulletDot: { color: theme.primary, fontSize: 16, fontWeight: '800', marginRight: 8, marginTop: 1 },
    bulletContent: { color: theme.text, fontSize: 14, lineHeight: 22, flex: 1 },
    numberedRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 3 },
    numBadge: {
      backgroundColor: isDark ? `${theme.primary}33` : `${theme.primary}22`, width: 22, height: 22, borderRadius: 11,
      justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 1,
    },
    numText: { color: theme.primary, fontSize: 12, fontWeight: '800' },
    numberedContent: { color: theme.text, fontSize: 14, lineHeight: 22, flex: 1 },
    codeBlock: {
      backgroundColor: theme.surface, borderRadius: 10, padding: 14, marginVertical: 6,
      borderWidth: 1, borderColor: theme.border,
    },
    codeText: { color: theme.accent, fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
    spacer: { height: 6 },
  });

  function renderInlineFormatting(text, baseStyle) {
    const parts = [];
    const regex = /(\*\*(.+?)\*\*)|(`(.+?)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <Text key={`t-${lastIndex}`} style={baseStyle}>
            {text.slice(lastIndex, match.index)}
          </Text>
        );
      }
      if (match[2]) {
        parts.push(
          <Text key={`b-${match.index}`} style={[baseStyle, styles.bold]}>
            {match[2]}
          </Text>
        );
      } else if (match[4]) {
        parts.push(
          <Text key={`c-${match.index}`} style={[baseStyle, styles.inlineCode]}>
            {match[4]}
          </Text>
        );
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <Text key={`t-${lastIndex}`} style={baseStyle}>
          {text.slice(lastIndex)}
        </Text>
      );
    }

    return parts.length > 0 ? parts : <Text style={baseStyle}>{text}</Text>;
  }

  const elements = parseMarkdown(text);
  let inCodeBlock = false;
  let codeLines = [];

  const rendered = [];

  elements.forEach((el) => {
    if (el.type === 'codeStart') {
      if (inCodeBlock) {
        rendered.push(
          <View key={`code-${el.key}`} style={styles.codeBlock}>
            <Text style={styles.codeText}>{codeLines.join('\n')}</Text>
          </View>
        );
        codeLines = [];
      }
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) {
      codeLines.push(el.content || '');
      return;
    }

    switch (el.type) {
      case 'h2':
        rendered.push(
          <Text key={el.key} style={styles.h2}>{el.content}</Text>
        );
        break;
      case 'h3':
        rendered.push(
          <Text key={el.key} style={styles.h3}>{el.content}</Text>
        );
        break;
      case 'bullet':
        rendered.push(
          <View key={el.key} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletContent}>{renderInlineFormatting(el.content, styles.bulletContent)}</Text>
          </View>
        );
        break;
      case 'numbered':
        rendered.push(
          <View key={el.key} style={styles.numberedRow}>
            <View style={styles.numBadge}>
              <Text style={styles.numText}>{el.num}</Text>
            </View>
            <Text style={styles.numberedContent}>{renderInlineFormatting(el.content, styles.numberedContent)}</Text>
          </View>
        );
        break;
      case 'spacer':
        rendered.push(<View key={el.key} style={styles.spacer} />);
        break;
      case 'text':
      default:
        rendered.push(
          <Text key={el.key} style={styles.paragraph}>
            {renderInlineFormatting(el.content, styles.paragraph)}
          </Text>
        );
        break;
    }
  });

  if (inCodeBlock && codeLines.length > 0) {
    rendered.push(
      <View key="code-end" style={styles.codeBlock}>
        <Text style={styles.codeText}>{codeLines.join('\n')}</Text>
      </View>
    );
  }

  return <View style={styles.container}>{rendered}</View>;
}
