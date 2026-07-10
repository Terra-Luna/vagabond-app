export const BaseItemSheetComponent = ({ banner, description, body, bodyClassName }: {
    banner: React.ReactElement, description: React.ReactElement, body: React.ReactElement, bodyClassName?: string
}) => {
    return (
        <div className="flex flex-col grow overflow-hidden">
            {banner}
            <div className="flex-1 overflow-y-auto border-2 border-solid border-table-border border-t-0 rounded-b-md">
                {description}
                <div className={`${bodyClassName ? bodyClassName : 'flex justify-between mt-2 mx-2 gap-y-4'}`}>
                    {body}
                </div>
            </div>
        </div>
    )
}