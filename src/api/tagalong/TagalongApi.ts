interface TagalongHero {
    character: {
        id: string,
        userId: string,
        name: string,
        ancestry: string,
        ancestry_bonus_skill: string,
        ancestry_bonus_spell: string,
        class: string,
        level: number,
        xp: number,

        statArray: number[],
        assignedStats: {
            might: number,
            dexterity: number,
            awareness: number,
            reason: number,
            presence: number,
            luck: number
        }
        strongPotentialStat: string,
        trained_skills: string[],
        active_actions: string[],
        known_spells: string[],
        selected_perks: {
            source: string,
            id: string,
            name: string
        }[]

        current_hp: number,
        fatigue: number,
        current_luck: number,
        studied_dice: number,
        current_wealth: { g: number, s: number, c: number }

        inventory: {
            id: string,
            name: string,
            computedName: string,
            type: string,
            category: string,
            quantity: number
            slots: number,
            total_slots: number,
            value: { g: number, s: number, c: number }
            notes: string,
            is_eqiupped: boolean,
            is_custom: boolean,
            //Weapon
            range: string,
            damage: string,
            grip: string,
            active_grip: string,
            properties: string[],
            //Armor
            might_req: number,
            armor_rating: number
        }
    }
}


const tagalongApi: string = 'https://www.vgbnd.app/api/characters/' //e38db88c-ec28-4b67-a44c-09f0fe199d01

export async function fetchHero(url: URL): Promise<TagalongHero> {
    const headers: Headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    
    const requestUrl = `${tagalongApi}${parseHeroId(url)}`
    
    const request: RequestInfo = new Request(requestUrl, {
        method: 'GET',
        headers: headers
    })

    const response = await fetch(request)
    const json = await response.json()

    console.log("Data fetched from Vagabond Tagalong:", json)

    return json as TagalongHero
}

export function parseHeroId(url: URL): string {
    return url.pathname.split('/')[2]
}