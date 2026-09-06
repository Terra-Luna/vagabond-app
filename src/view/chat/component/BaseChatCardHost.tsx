import { tableBorder } from "../../common/border-styles";

const chatCardBodyStyle = `
    ${tableBorder}
    text-text-primary 
    text-lg 
    font-eskapade 
    font-bold
    bg-sheet-main-fill
    rounded-sm
`

export const BaseChatCardHost = ({ banner, contents }) => {
    return (
        <div className={chatCardBodyStyle}>
            {banner}
            <div className="p-1">
                {contents}
            </div>
        </div>
    )
}