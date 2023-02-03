import { Command } from "./Command.js"
import { formatNumber, titleCase } from "../../utils/Utils.js"
import { fetchProfiles, fetchUuid } from "../../utils/apiUtils.js"

export class TrophyFishCommand implements Command {
    aliases = ["trophy", "trophyfish", "tfish"]
    usage = "<player:[profile|bingo]> <total | tiers | fish [fish]>"

    async execute(args: string[]) {
        if (args.length < 2) return `Syntax: skill ${this.usage}`
        const playerArg = args.shift()!.split(":")
        const playerName = playerArg[0]
        const profileArg = playerArg[1]?.toLowerCase()
        const arg = args.shift()!
        const fish = args?.join("_")
        if (arg === "fish" && !fish) return `Syntax: trophy ${this.usage}`
        let message
        try {
            const uuid = await fetchUuid(playerName)
            const profiles = await fetchProfiles(uuid)

            // Fetch correct profile
            let profile
            if (!profileArg) {
                profile = profiles.find(p => p.selected)
            } else if (profileArg === "bingo") {
                profile = profiles.find(p => p.game_mode == "bingo")
            } else {
                profile = profiles.find(p => p.cute_name?.toLowerCase() === profileArg)
            }
            if (!profile) {
                return "Profile could not be determined."
            }

            const cuteName = profile.cute_name
            const data = profile?.members?.[uuid]?.['trophy_fish']
            if (!data) {
                return `No trophy fish data found for ${playerName}.`
            }
            message = `${titleCase(arg)} data for ${playerName} (${cuteName}): `
            const obj = Object.entries(data) as [string, number][]
            switch (arg) {
                case "total":
                    message += `Total trophy fish caught: ${data.total_caught}`
                    break
                case "tiers":
                    const bronzeTotal = obj.filter(([key]) => key.includes("_bronze"))
                    const bronzeUnlocked = bronzeTotal.filter(([, value]) => value > 0).length
                    const silverTotal = obj.filter(([key]) => key.includes("_silver"))
                    const silverUnlocked = silverTotal.filter(([, value]) => value > 0).length
                    const goldTotal = obj.filter(([key]) => key.includes("_gold"))
                    const goldUnlocked = goldTotal.filter(([, value]) => value > 0).length
                    const diamondTotal = obj.filter(([key]) => key.includes("_diamond"))
                    const diamondUnlocked = diamondTotal.filter(([, value]) => value > 0).length
                    message = `Trophy fish tiers unlocked for ${playerName} (${cuteName}): `
                    message += `Bronze: ${bronzeUnlocked}/${bronzeTotal.length} | Silver: ${silverUnlocked}/${silverTotal.length} | Gold: ${goldUnlocked}/${goldTotal.length} | Diamond: ${diamondUnlocked}/${diamondTotal.length}`
                    break
                case "fish":
                    const fsih = this.guessFish(obj, fish)
                    if (!fsih) return "Invalid fish."
                    const name = fsih[0]
                    message = `${name} caught for ${playerName} (${cuteName}): `
                    message += `Total ${titleCase(name.replaceAll("_", " "))}: ${fsih[1] ?? 0} | Bronze: ${data[`${name}_bronze`] ?? 0} | Silver: ${data[`${name}_silver`] ?? 0} | Gold: ${data[`${name}_gold`] ?? 0} | Diamond: ${data[`${name}_diamond`] ?? 0}`
                    break
                default:
                    return `Syntax: trophy ${this.usage}`
            }

        } catch (e) {
            message = "Something went wrong!"
            console.error(e)
        }
        return message
    }

    guessFish(data: [string, number][], input: string) {
        let phrase = input.split("_")
        let bestMatches = data.filter(([key, value]) => {
            return phrase.some((phrase) => key.includes(phrase))
        })
        let bestMatch
        if (bestMatches.length > 1) {
            bestMatch = bestMatches.sort((a, b) => {
                return phrase.filter(phrase => b[0].includes(phrase)).length - phrase.filter(phrase => a[0].includes(phrase)).length
            })[0]
        } else if (bestMatches.length === 1) {
            bestMatch = bestMatches[0]
        }
        return bestMatch
    }
} 