import { tableBorder } from "../../view/common/border-styles"

export const Table = ({ headers, data, highlightedRow, centerFirstHeader }: { headers: string[], data: string[][], highlightedRow?: number, centerFirstHeader?: boolean }) => {
    return (
        <table className={`table-auto w-full ${tableBorder} mt-0.5`}>
            <thead className="bg-section-header-fill text-text-section-header text-sm">
                <tr>
                    <th className={`${centerFirstHeader ? "" : "text-left pl-1"} whitespace-nowrap`}>{headers[0]}</th>
                    {headers.slice(1).map(h => <th key={h} className="text-center">{h}</th>)}
                </tr>
            </thead>
            <tbody className="font-eskapade">
                {data.map((d, idx) => (
                    <tr
                        key={`time-${d[0]}`}
                        className={
                            `even:bg-table-row-even/50 odd:bg-table-row-odd/50 hover-glow draggable ${highlightedRow === idx ? 'border-2 border-wealth-denom-label' : ''}`
                        }
                    >
                        <td className="p-1 whitespace-nowrap">
                            {d[0]}
                        </td>

                        {d.slice(1).map((item) =>
                            <td key={item} className={`text-center font-normal`}>
                                {item}
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}