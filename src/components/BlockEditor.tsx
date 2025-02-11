"use client";

import { useTheme } from "next-themes";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView, Theme } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { useEdgeStore } from "@/lib/edgestore";
import { useEffect, useCallback, useRef } from "react";
import { debounce } from "lodash"; // Import debounce from lodash

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
}
const BlockEditor = ({ value, onChange, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };
  const customDarkTheme: Theme = {
    colors: {
      editor: {
        text: "#FFFFFF", // White text
        background: "#0a0a0a", // Dark background
      },
      menu: {
        text: "#FFFFFF", // White text
        background: "#0a0a0a", // Dark menu background
      },
      tooltip: {
        text: "#FFFFFF", // White text
        background: "#0a0a0a", // Dark tooltip background
      },
      hovered: {
        text: "#FFFFFF", // White text
        background: "#0a0a0a", // Dark hover background
      },
      selected: {
        text: "#FFFFFF", // White text
        background: "#0a0a0a", // Dark selected background
      },
    },
    borderRadius: 4, // Rounded corners
    fontFamily: "Arial, sans-serif", // Custom font
  };
  // Initialize the editor
  const editor = useCreateBlockNote({
    uploadFile: handleUpload,
  });

  // Ref to track if the initial content has been set
  const isInitialContentSet = useRef(false);

  // Parse initialContent and set it in the editor (only once)
  useEffect(() => {
    if (!value) return;
    try {
      const parsedContent: PartialBlock[] = JSON.parse(value);
      editor.replaceBlocks(editor.document, parsedContent);
    } catch (error) {
      console.error("Failed to parse editor content:", error);
    }
  }, [value, editor]);

  // Debounced onChange handler
  const debouncedOnChange = useCallback(
    debounce(() => {
      const contentJSON = JSON.stringify(editor.document);
      onChange(contentJSON);
    }, 300), // Debounce for 300ms
    [editor, onChange]
  );

  // Handle editor changes
  const handleEditorChange = useCallback(() => {
    debouncedOnChange();
  }, [debouncedOnChange]);

  return (
    <div
      className="overflow-y-auto h-[1122px] p-4" // Add padding
    >
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === "dark" ? customDarkTheme : "light"} // Apply custom dark theme
        onChange={handleEditorChange}
      />
    </div>
  );
};

export default BlockEditor;