import { Divider } from "../../component/Header"

export const ChatCardBanner = ({ portrait, title }: { portrait: string, title: string }) => {
    console.log(name)
    return (
        <div className={`flex space-x-1 items-center bg-section-header-fill px-1 rounded-t-md font-eskapade font-bold`}>
            {portrait == null ? <></> :
                    <img className={`object-contain h-[54px] w-[54px] p-0.5`} src={portrait} alt={'hero'} />
            }
            <div className="flex w-full items-center text-text-section-header">
                <div className="text-xl mr-1">{title}</div>
                <Divider />
            </div>
        </div>
    )
}