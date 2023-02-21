import { SimpleCommand } from "./Command.js"
import { randRange } from "../../../utils/Utils.js"
import { Bridge } from "../../Bridge.js"

export class PickCommand implements SimpleCommand {
    aliases = ["pick", "choose"]
    usage = "<option1> <option2> [option3] ..."

    async execute(args: string[]) {
        if (args.length == 0) return "You need to give me some options to choose from."
        return `I choose ${args[randRange(0, args.length - 1)]}`
    }
}