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

export const RichTextField = ({ width = "100%", height = 100, defaultValue = '', onChange }: { width?: number | string, height?: number, defaultValue?: string, onChange?: (html: string) => void }) => {

    const [trackRerender, setTrackRerender] = useState(false)

    const forceRerender = useCallback(() => {
        setTrackRerender(!trackRerender)
    }, [trackRerender])

    useEffect(() => {
        // for whatever reason, the very first render of a RTF doesn't seem to actually work correctly. So we force a rerender on mount
        forceRerender()
    }, [])

    const initialConfig = {
        namespace: 'VgLiteEditor',
        onError: (error) => console.error(error),
        editorState: (editor) => {
            $insertNodes($generateNodesFromDOM(editor, new DOMParser().parseFromString(defaultValue, 'text/html')))
        }
    };

    const editorRef = useRef<LexicalEditor>(null);

    return (
        <IFrameWrapper width={width} height={height}>
            <div className='border border-solid border-sheet-header-fill'>
                <LexicalComposer initialConfig={initialConfig}>
                    {onChange ? <OnChangePlugin onChange={(editorState) => {
                        editorState.read(() => {
                            if (editorRef.current) {
                                onChange($generateHtmlFromNodes(editorRef.current))
                            }
                        }, { editor: editorRef.current })
                    }} /> : undefined}
                    <RichTextPlugin
                        contentEditable={<ContentEditable className='px-1' />}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <EditorRefPlugin editorRef={editorRef} />
                </LexicalComposer>
            </div>
        </IFrameWrapper>
    )
}