import { tableBorder } from "../common/border-styles";

const chatCardBodyStyle = `${tableBorder} rounded-md text-text-primary text-lg font-eskapade font-bold bg-sheet-main-fill`

export const BaseChatCardHost = ({ banner, contents }) => {
    return (
        <div className={chatCardBodyStyle}>
            {banner}
            <div className="p-2">
                {contents}
            </div>
        </div>
    )
}