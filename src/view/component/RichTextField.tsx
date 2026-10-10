import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListItemNode, ListNode } from '@lexical/list'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { $deleteTableColumnAtSelection, $deleteTableRowAtSelection, $getTableNodeFromLexicalNodeOrThrow, $insertTableColumnAtSelection, $insertTableRowAtSelection, $isTableCellNode, INSERT_TABLE_COMMAND, TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { $findMatchingParent } from '@lexical/utils'
import { $getNearestNodeFromDOMNode, $getSelection, $insertNodes, $isRangeSelection, INDENT_CONTENT_COMMAND, LexicalEditor, OUTDENT_CONTENT_COMMAND } from 'lexical'
import { BetweenHorizontalEnd, BetweenHorizontalStart, BetweenVerticalEnd, BetweenVerticalStart, Columns2, IndentDecrease, IndentIncrease, List, ListOrdered, Rows2, Table, Trash2 } from 'lucide-react'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { appLang } from '../../utils/lang'
import { useEditMode } from '../context/EditModeContext/Hooks'
import { IFrameWrapper } from './IFrameWrapper'

const editorTheme = {
    list: {
        ul: 'vb-rtf-ul',
        ol: 'vb-rtf-ol',
        listitem: 'vb-rtf-li',
        nested: { listitem: 'vb-rtf-nested' },
    }
}

const RESIZE_HANDLE_PX = 5
const MIN_COLUMN_PX = 30

const TableColumnResizePlugin = () => {
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        const findBorderCell = (e: MouseEvent) => {
            const cell = (e.target as HTMLElement | null)?.closest?.('td, th') as HTMLTableCellElement | null | undefined
            if (!cell || !editor.isEditable()) return undefined
            const row = cell.parentElement as HTMLTableRowElement
            const isLastColumn = cell.cellIndex === row.cells.length - 1
            const nearRightBorder = cell.getBoundingClientRect().right - e.clientX <= RESIZE_HANDLE_PX
            return nearRightBorder && !isLastColumn ? cell : undefined
        }

        let cleanupRoot: (() => void) | undefined
        const unregisterRoot = editor.registerRootListener((root) => {
            cleanupRoot?.()
            cleanupRoot = undefined
            if (!root) return

            const onMove = (e: MouseEvent) => {
                root.style.cursor = findBorderCell(e) ? 'col-resize' : ''
            }

            const onDown = (e: MouseEvent) => {
                const cell = findBorderCell(e)
                const tableElement = cell?.closest('table')
                if (!cell || !tableElement) return
                e.preventDefault()

                const index = cell.cellIndex
                const startX = e.clientX
                const startWidths = Array.from((tableElement.rows[0]?.cells ?? []) as ArrayLike<HTMLTableCellElement>)
                    .map(c => c.getBoundingClientRect().width)
                const doc = root.ownerDocument

                const onDrag = (ev: MouseEvent) => {
                    const dx = Math.max(-(startWidths[index] - MIN_COLUMN_PX), Math.min(startWidths[index + 1] - MIN_COLUMN_PX, ev.clientX - startX))
                    const widths = [...startWidths]
                    widths[index] += dx
                    widths[index + 1] -= dx
                    editor.update(() => {
                        const node = $getNearestNodeFromDOMNode(tableElement)
                        if (!node) return
                        try {
                            $getTableNodeFromLexicalNodeOrThrow(node).setColWidths(widths.map(Math.round))
                        } catch {
                            // not a table
                        }
                    })
                }
                const onUp = () => {
                    doc.removeEventListener('mousemove', onDrag)
                    doc.removeEventListener('mouseup', onUp)
                }
                doc.addEventListener('mousemove', onDrag)
                doc.addEventListener('mouseup', onUp)
            }

            root.addEventListener('mousemove', onMove)
            root.addEventListener('mousedown', onDown)
            cleanupRoot = () => {
                root.removeEventListener('mousemove', onMove)
                root.removeEventListener('mousedown', onDown)
            }
        })

        return () => {
            unregisterRoot()
            cleanupRoot?.()
        }
    }, [editor])

    return null
}

const Toolbar = () => {
    const [editor] = useLexicalComposerContext()
    const [isInTable, setIsInTable] = useState(false)

    useEffect(() => {
        const check = () => {
            const selection = $getSelection()
            const inTable = !!selection && ($isRangeSelection(selection) || selection.getNodes().length > 0) &&
                !!$findMatchingParent(selection.getNodes()[0], n => $isTableCellNode(n))
            setIsInTable(inTable)
        }
        return editor.registerUpdateListener(({ editorState }) => editorState.read(check))
    }, [editor])

    const deleteTable = () => editor.update(() => {
        const node = $getSelection()?.getNodes()[0]
        if (!node) return
        try {
            $getTableNodeFromLexicalNodeOrThrow(node).remove()
        } catch {
            // cursor isn't in a table
        }
    })

    const tableEdit = (edit: () => void) => () => editor.update(() => {
        try {
            edit()
        } catch {
            // cursor isn't in a table
        }
    })

    const buttons: { icon: ReactNode, title: string, onClick: () => void, tableOnly?: boolean }[] = [
        { icon: <List size={14} />, title: appLang.RichTextEditor.bulletedList, onClick: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined) },
        { icon: <ListOrdered size={14} />, title: appLang.RichTextEditor.numberedList, onClick: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined) },
        { icon: <IndentIncrease size={14} />, title: appLang.RichTextEditor.indent, onClick: () => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined) },
        { icon: <IndentDecrease size={14} />, title: appLang.RichTextEditor.outdent, onClick: () => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined) },
        { icon: <Table size={14} />, title: appLang.RichTextEditor.insertTable, onClick: () => editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: '3', columns: '3', includeHeaders: true }) },
        { icon: <BetweenHorizontalStart size={14} />, title: appLang.RichTextEditor.insertRowAbove, onClick: tableEdit(() => $insertTableRowAtSelection(false)), tableOnly: true },
        { icon: <BetweenHorizontalEnd size={14} />, title: appLang.RichTextEditor.insertRowBelow, onClick: tableEdit(() => $insertTableRowAtSelection(true)), tableOnly: true },
        { icon: <BetweenVerticalStart size={14} />, title: appLang.RichTextEditor.insertColumnLeft, onClick: tableEdit(() => $insertTableColumnAtSelection(false)), tableOnly: true },
        { icon: <BetweenVerticalEnd size={14} />, title: appLang.RichTextEditor.insertColumnRight, onClick: tableEdit(() => $insertTableColumnAtSelection(true)), tableOnly: true },
        { icon: <Rows2 size={14} />, title: appLang.RichTextEditor.deleteRow, onClick: tableEdit($deleteTableRowAtSelection), tableOnly: true },
        { icon: <Columns2 size={14} />, title: appLang.RichTextEditor.deleteColumn, onClick: tableEdit($deleteTableColumnAtSelection), tableOnly: true },
        { icon: <Trash2 size={14} />, title: appLang.RichTextEditor.deleteTable, onClick: deleteTable, tableOnly: true },
    ]

    return (
        <div className="vb-rtf-toolbar sticky top-0 z-10 flex gap-1 -mt-1 text-sm bg-sheet-main-fill">
            {buttons.filter(b => !b.tableOnly || isInTable).map(b => (
                <button key={b.title} type="button" title={b.title} onMouseDown={e => e.preventDefault()} onClick={b.onClick}>{b.icon}</button>
            ))}
        </div>
    )
}

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

    const editorRef = useRef<LexicalEditor>(null)

    useEffect(() => {
        // toggle readonly on the editor when editMode changes
        editorRef.current?.setEditable(isEditMode)
    }, [isEditMode])

    const initialConfig = {
        namespace: 'VagabondEditor',
        theme: editorTheme,
        nodes: [ListNode, ListItemNode, TableNode, TableRowNode, TableCellNode],
        onError: (error) => console.error(error),
        editorState: (editor) => {
            $insertNodes($generateNodesFromDOM(editor, new DOMParser().parseFromString(defaultValue, 'text/html')))
        },
        editable: isEditMode,
    }

    const Placeholder = () => {
        return (
            <div className="absolute p-1 text-sm italic" style={{ pointerEvents: 'none' }}>{appLang.General.enterText}</div>
        )
    }

    return (
        <IFrameWrapper width={width} height={height}>
            <div className={`vb-rtf ${className ?? ""} text-text-primary font-paradigm font-normal bg-sheet-main-fill`}>
                <LexicalComposer initialConfig={initialConfig}>
                    {isEditMode && <Toolbar />}
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
                            <ListPlugin />
                            <TablePlugin />
                            <TableColumnResizePlugin />
                            <TabIndentationPlugin />
                            <EditorRefPlugin editorRef={editorRef} />
                        </div>
                    </div>
                </LexicalComposer>
            </div>
        </IFrameWrapper>
    )
}