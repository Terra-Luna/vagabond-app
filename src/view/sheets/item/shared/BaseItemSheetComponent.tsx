export const BaseItemSheetComponent = ({ banner, description, body, bodyClassName }: {
    banner: React.ReactElement, description: React.ReactElement, body: React.ReactElement, bodyClassName?: string
}) => {
    return (
        <div className="flex flex-col grow overflow-hidden">
            {banner}
            <div className="flex-1 -mt-2 overflow-y-auto border-4 border-solid border-stat-block-fill/80 border-t-transparent rounded-b-md">
                {description}
                <div className={`${bodyClassName ? bodyClassName : 'flex justify-between mt-2 mx-2 gap-y-4'}`}>
                    {body}
                </div>
            </div>
        </div>
    )
}