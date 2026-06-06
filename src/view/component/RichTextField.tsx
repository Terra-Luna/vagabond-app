import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import { IFrameWrapper } from './IFrameWrapper';

export const RichTextField = ({ width = "100%", height = 100, defaultValue = '' }: { width?: number | string, height?: number, defaultValue?: string }) => {
    const initialConfig = {
        namespace: 'MyEditor',
        onError: (error) => console.error(error),
        editorState: `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"${defaultValue}","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`
    };
    return (
        <IFrameWrapper width={width} height={height}>
            <div className='border border-solid border-sheet-header-fill'>
                <LexicalComposer initialConfig={initialConfig}>
                    <RichTextPlugin
                        contentEditable={<ContentEditable className='px-1' />}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                </LexicalComposer>
            </div>
        </IFrameWrapper>
    )
}