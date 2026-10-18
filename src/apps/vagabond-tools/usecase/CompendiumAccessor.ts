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

        const questionSets = [
            { question: makeQuestion(13), answer: '1AkI/9IR6zKAnl+AQaaF6Zsn3UwU7IS+ty1KGtJF2B8' },
            { question: makeQuestion(17), answer: 'Rvk6PvWkc+qzPn8lq17PETuUSmTF3JCslTWVVHH0kPc' },
            { question: makeQuestion(19), answer: 'WXP53mr21mVmMFXwtD7i0hNOXNOyQDcQXAGfii6ZXFE' },
            { question: makeQuestion(23), answer: 'FWR0H0eK+c9IwgpL0qit+d6yXkmHiu1G6w4ah/h0O0A' },
            { question: makeQuestion(25), answer: 'GejxpOwFdXVzStFYoy19U1VPvPWSr8KvTTghvt7C71k' },
            { question: makeQuestion(27), answer: 'OPC4KE11eiht/YPviM9ofsvSz5Yhvzejt+Kqkz5H9yM' }
        ]

        return questionSets[Math.floor(Math.random() * questionSets.length)]
    }

    /**
     * This is meant to simply obfuscate the compendium access answers. If a user really wanted
     * to bypass it they could, but at least we made a bit of an obfiscutory effort here.
     */
    static checkAnswer = async (input: string, answer: string): Promise<boolean> => {
        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode("jKHz7c}(3r1^>:ops)4xau?BqMr2#4m#"),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        )

        const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input.trim().toLocaleLowerCase()))
        const cipher = CompendiumAccessor.toBase64Url(new Uint8Array(sig))

        return cipher === answer
    }

    private static toBase64Url = (bytes: Uint8Array): string => {
        return btoa(String.fromCharCode(...bytes))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "")
    }
}