import { tableBorder } from "../../common/border-styles";

const chatCardBodyStyle = `
    ${tableBorder}
    text-text-primary 
    text-lg 
    font-eskapade 
    font-bold
    bg-sheet-main-fill
    rounded-md
`

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