"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Redo, 
  Undo, 
  Code, 
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
} from "lucide-react";
import { useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

const extensions = [
  StarterKit,
  Underline,
  Typography,
  Highlight,
  CharacterCount,
  Placeholder.configure({
    placeholder: "Write your post content here...",
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-primary underline cursor-pointer",
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class: "rounded-lg border shadow-sm max-w-full h-auto",
    },
  }),
];

const MenuBar = ({ editor }: { editor: any }) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSetLink = useCallback(() => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    }
    setLinkUrl("");
  }, [editor, linkUrl]);

  const handleAddImage = useCallback(() => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setImageUrl("");
  }, [editor, imageUrl]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-muted" : ""}
      >
        <Bold className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-muted" : ""}
      >
        <Italic className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive("underline") ? "bg-muted" : ""}
      >
        <UnderlineIcon className="size-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
      >
        <Heading1 className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
      >
        <Heading2 className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""}
      >
        <Heading3 className="size-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-muted" : ""}
      >
        <List className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-muted" : ""}
      >
        <ListOrdered className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "bg-muted" : ""}
      >
        <Quote className="size-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {/* Link Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={editor.isActive("link") ? "bg-muted" : ""}
          >
            <LinkIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">Insert Link</h4>
              <p className="text-xs text-muted-foreground">Enter the URL to link to.</p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetLink()}
                className="h-8"
              />
              <Button size="sm" className="h-8 px-3" onClick={handleSetLink}>
                Set
              </Button>
            </div>
            {editor.isActive("link") && (
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8 text-xs" 
                onClick={() => editor.chain().focus().unsetLink().run()}
              >
                Remove Link
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Image Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm">
            <ImageIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">Insert Image</h4>
              <p className="text-xs text-muted-foreground">Enter the image URL.</p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
                className="h-8"
              />
              <Button size="sm" className="h-8 px-3" onClick={handleAddImage}>
                Add
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={editor.isActive("highlight") ? "bg-muted" : ""}
      >
        <Highlighter className="size-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <Undo className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Redo className="size-4" />
      </Button>
    </div>
  );
};

export default function TiptapEditor({ content, onChange, disabled }: TiptapEditorProps) {
  const editor = useEditor({
    extensions,
    content: content,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[400px] p-5",
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className="flex flex-col rounded-md border bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1 text-[10px] text-muted-foreground">
        <div>
          {editor?.storage.characterCount.words()} words
        </div>
        <div>
          {editor?.storage.characterCount.characters()} characters
        </div>
      </div>
    </div>
  );
}
