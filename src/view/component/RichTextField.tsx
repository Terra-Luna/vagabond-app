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

export const RichTextField = () => {
    return (
        <IFrameWrapper>
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