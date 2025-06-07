
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bold, Italic, Underline, Code, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Palette, Type } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder = "Scrivi qui...", className = "" }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isCodeMode, setIsCodeMode] = useState(false);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertCode = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        const codeElement = document.createElement('code');
        codeElement.style.backgroundColor = '#f3f4f6';
        codeElement.style.padding = '2px 4px';
        codeElement.style.borderRadius = '4px';
        codeElement.style.fontFamily = 'monospace';
        codeElement.textContent = selectedText;
        
        range.deleteContents();
        range.insertNode(codeElement);
        
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
    }
  };

  const insertCodeBlock = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      const preElement = document.createElement('pre');
      preElement.style.backgroundColor = '#1f2937';
      preElement.style.color = '#f9fafb';
      preElement.style.padding = '12px';
      preElement.style.borderRadius = '8px';
      preElement.style.fontFamily = 'monospace';
      preElement.style.overflow = 'auto';
      preElement.style.margin = '8px 0';
      
      const codeElement = document.createElement('code');
      codeElement.textContent = selectedText || 'Il tuo codice qui...';
      preElement.appendChild(codeElement);
      
      if (selectedText) {
        range.deleteContents();
        range.insertNode(preElement);
      } else {
        range.insertNode(preElement);
      }
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
  };

  const changeFontSize = (size: string) => {
    execCommand('fontSize', size);
  };

  const changeTextColor = (color: string) => {
    execCommand('foreColor', color);
  };

  const changeBackgroundColor = (color: string) => {
    execCommand('backColor', color);
  };

  const insertLink = () => {
    const url = prompt('Inserisci URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <Card className="p-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-gray-200">
        {/* Text Formatting */}
        <div className="flex gap-1 mr-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('bold')}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('italic')}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('underline')}
            className="h-8 w-8 p-0"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        {/* Font Size */}
        <div className="flex gap-1 mr-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => changeFontSize('1')}
            className="h-8 px-2 text-xs"
          >
            <Type className="h-3 w-3 mr-1" />
            S
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => changeFontSize('3')}
            className="h-8 px-2 text-sm"
          >
            <Type className="h-4 w-4 mr-1" />
            M
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => changeFontSize('5')}
            className="h-8 px-2"
          >
            <Type className="h-5 w-5 mr-1" />
            L
          </Button>
        </div>

        {/* Colors */}
        <div className="flex gap-1 mr-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => changeTextColor('#ef4444')}
            className="h-8 w-8 p-0"
            style={{ color: '#ef4444' }}
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => changeTextColor('#3b82f6')}
            className="h-8 w-8 p-0"
            style={{ color: '#3b82f6' }}
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => changeTextColor('#10b981')}
            className="h-8 w-8 p-0"
            style={{ color: '#10b981' }}
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => changeTextColor('#f59e0b')}
            className="h-8 w-8 p-0"
            style={{ color: '#f59e0b' }}
          >
            <Palette className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 mr-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('justifyLeft')}
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('justifyCenter')}
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('justifyRight')}
            className="h-8 w-8 p-0"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 mr-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('insertUnorderedList')}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => execCommand('insertOrderedList')}
            className="h-8 w-8 p-0"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Code */}
        <div className="flex gap-1 mr-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={insertCode}
            className="h-8 px-2"
          >
            <Code className="h-4 w-4 mr-1" />
            Inline
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={insertCodeBlock}
            className="h-8 px-2"
          >
            <Code className="h-4 w-4 mr-1" />
            Block
          </Button>
        </div>

        {/* Link */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={insertLink}
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className={`min-h-[120px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${className}`}
        style={{ 
          wordWrap: 'break-word', 
          whiteSpace: 'pre-wrap'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        onFocus={(e) => {
          if (e.target.textContent === '') {
            e.target.style.color = '#000';
          }
        }}
        onBlur={(e) => {
          if (e.target.textContent === '') {
            e.target.style.color = '#9ca3af';
          }
        }}
      />
      
      {/* Placeholder styling using a style element without jsx */}
      <style dangerouslySetInnerHTML={{
        __html: `
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
        `
      }} />
    </Card>
  );
};
