import { sys_id } from "../../../utils/foundryUtils"
import { appLang } from "../../../utils/lang"
import { localizeString } from "../../../utils/localeUtils"

export class CompendiumAccessor {

    static registerCompendiumAccess() {
        (game.settings as any).register(sys_id, "compendiumAccess" as any, {
            name: "Unlock Compendium",
            hint: "",
            scope: "world",
            config: false,
            type: Boolean,
            default: false
        })
    }

    static isLocked = (): boolean => {
        return !(game.settings as any)?.get(sys_id, "compendiumAccess")
    }

    static unlock = async () => {
        await (game.settings as any).set(sys_id, "compendiumAccess", true)
    }

    static getQuestion = (): { question: string, answer: string } => {
        const makeQuestion = (page: number) => {
            return localizeString(appLang.General.compendiumAccessQuestionRoot, { page: page.toString() })
        }

        /**
         * These values were originally encrypted, but we have nowhere to securely
         * get the code so it was ultimately pointless. While this doesn't need to
         * be so secure, we could set up some HMAC later if needed.
         * Commit: e28ebd6ddabceb9921df9f4a053da6eb549209bf
         */
        const questionSets = [
            { question: makeQuestion(13), answer: '331210' },
            { question: makeQuestion(17), answer: '15859' },
            { question: makeQuestion(19), answer: '12677' },
            { question: makeQuestion(23), answer: '16568' },
            { question: makeQuestion(25), answer: '42783' },
            { question: makeQuestion(27), answer: '32608' }
        ]

        return questionSets[Math.floor(Math.random() * questionSets.length)]
    }

    /**
     * This is meant to simply obfuscate the compendium access answers. If a user really wanted
     * to bypass it they could, but at least we made a bit of an obfiscutory effort here.
     */
    static checkAnswer = async (input: string, answer: string): Promise<boolean> => {
        return input === answer
    }

}