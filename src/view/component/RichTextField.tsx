import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import { IFrameWrapper } from './IFrameWrapper';

const initialConfig = {
    namespace: 'MyEditor',
    onError: (error) => console.error(error),
};

export const RichTextField = ({ width = "100%", height = 100 }: { width?: number | string, height?: number }) => {
    return (
        <IFrameWrapper width={width} height={height}>
            <LexicalComposer initialConfig={initialConfig}>
                <RichTextPlugin
                    contentEditable={<ContentEditable className='border border-solid border-sheet-header-fill' />}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
            </LexicalComposer>
        </IFrameWrapper>
    )
}