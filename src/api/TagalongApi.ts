interface TagalongHero {
    character: {
        name: string,
        ancestry: string,
        class: string,
        xp: number,
        trained_skills: string[],
        statArray: number[]
    },
    derived: {}
    /**
     * TODO: finish mapping this response schema
     */
}

const tagalongApi: string = 'https://www.vgbnd.app/api/characters/'

export async function fetchHero(url: URL): Promise<TagalongHero> {
    const headers: Headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    
    const requestUrl = `${tagalongApi}${parseHeroId(url)}`
    console.log("Calling Tagalong API:", requestUrl)
    const request: RequestInfo = new Request(requestUrl, {
        method: 'GET',
        headers: headers
    })

    const response = await fetch(request)
    const json = await response.json()
    return json as TagalongHero
}

export function parseHeroId(url: URL): string {
    return url.pathname.split('/')[2]
}