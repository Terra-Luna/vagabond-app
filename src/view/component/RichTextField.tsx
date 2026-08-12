import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { IFrameWrapper } from './IFrameWrapper';
import { $insertNodes, LexicalEditor } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditMode } from '../context/EditModeContext/Hooks';

export const RichTextField = ({
    width = "100%",
    height = "100%",
    defaultValue = '',
    onChange,
    className
}: {
    width?: number | string,
    height?: number | string,
    defaultValue?: string,
    onChange?: (html: string) => void,
    className?: string
}) => {

    const { isEditMode } = useEditMode()
    const [trackRerender, setTrackRerender] = useState(false)

    const forceRerender = useCallback(() => {
        setTrackRerender(!trackRerender)
    }, [trackRerender])

    useEffect(() => {
        // for whatever reason, the very first render of a RTF doesn't seem to actually work correctly. So we force a rerender on mount
        forceRerender()
    }, [])

    const editorRef = useRef<LexicalEditor>(null);

    useEffect(() => {
        // toggle readonly on the editor when editMode changes
        editorRef.current?.setEditable(isEditMode)
    }, [isEditMode])

    const initialConfig = {
        namespace: 'VagabondEditor',
        onError: (error) => console.error(error),
        editorState: (editor) => {
            $insertNodes($generateNodesFromDOM(editor, new DOMParser().parseFromString(defaultValue, 'text/html')))
        },
        editable: isEditMode,
    };

    const Placeholder = () => {
        return (
            <div className="absolute p-1 text-sm italic" style={{ pointerEvents: 'none' }}>Enter text...</div>
        )
    }

    return (
        <IFrameWrapper width={width} height={height}>
            <div className={`${className} text-text-primary font-paradigm font-normal bg-sheet-main-fill`}>
                <LexicalComposer initialConfig={initialConfig}>
                    <div className="flex flex-col min-h-full min-w-full bg-transparent">
                        <div className="flex grow-1 relative">
                            <RichTextPlugin
                                contentEditable={<ContentEditable className="p-1 min-h-full min-w-full text-sm leading-5" />}
                                placeholder={<Placeholder />}
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            {onChange ? <OnChangePlugin onChange={(editorState) => {
                                editorState.read(() => {
                                    if (editorRef.current) {
                                        onChange($generateHtmlFromNodes(editorRef.current))
                                    }
                                }, { editor: editorRef.current })
                            }} /> : undefined}
                            <HistoryPlugin />
                            <EditorRefPlugin editorRef={editorRef} />
                        </div>
                    </div>
                </LexicalComposer>
            </div>
        </IFrameWrapper>
    )
}