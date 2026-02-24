'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useRef, useCallback, useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  CodeSquare,
  Link2,
  Minus,
} from 'lucide-react';
import styles from './RichTextEditor.module.css';

export default function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Adicione uma descricao...',
  editable = true,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef(null);

  const handleUpdate = useCallback(
    ({ editor }) => {
      if (!onChange) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const html = editor.getHTML();
        // If editor is empty, return empty string
        const isEmpty = editor.isEmpty;
        onChange(isEmpty ? '' : html);
      }, 300);
    },
    [onChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
    ],
    content: content || '',
    editable,
    onUpdate: handleUpdate,
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    immediatelyRender: false,
  });

  const handleLinkClick = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL do link:', previousUrl || 'https://');
    if (url === null) return; // cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const containerClass = [
    styles.container,
    isFocused ? styles.containerFocused : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass}>
      {editable && (
        <div className={styles.toolbar}>
          <ToolbarButton
            icon={<Bold size={15} />}
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Negrito"
          />
          <ToolbarButton
            icon={<Italic size={15} />}
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italico"
          />
          <ToolbarButton
            icon={<Strikethrough size={15} />}
            isActive={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Tachado"
          />
          <ToolbarButton
            icon={<Code size={15} />}
            isActive={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Codigo inline"
          />

          <div className={styles.toolbarDivider} />

          <ToolbarButton
            icon={<Heading2 size={15} />}
            isActive={editor.isActive('heading', { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            title="Titulo 2"
          />
          <ToolbarButton
            icon={<Heading3 size={15} />}
            isActive={editor.isActive('heading', { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            title="Titulo 3"
          />

          <div className={styles.toolbarDivider} />

          <ToolbarButton
            icon={<List size={15} />}
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Lista com marcadores"
          />
          <ToolbarButton
            icon={<ListOrdered size={15} />}
            isActive={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Lista numerada"
          />
          <ToolbarButton
            icon={<Quote size={15} />}
            isActive={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Citacao"
          />

          <div className={styles.toolbarDivider} />

          <ToolbarButton
            icon={<CodeSquare size={15} />}
            isActive={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Bloco de codigo"
          />
          <ToolbarButton
            icon={<Link2 size={15} />}
            isActive={editor.isActive('link')}
            onClick={handleLinkClick}
            title="Link"
          />
          <ToolbarButton
            icon={<Minus size={15} />}
            isActive={false}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Linha horizontal"
          />
        </div>
      )}

      <div className={styles.editor}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({ icon, isActive, onClick, title }) {
  const btnClass = [styles.toolbarBtn, isActive ? styles.toolbarBtnActive : '']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={btnClass}
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
    >
      {icon}
    </button>
  );
}
