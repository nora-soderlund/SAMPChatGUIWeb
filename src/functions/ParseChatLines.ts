import { ChatData } from "../interfaces/ChatData";

export default function parseChatLines(chatData: ChatData, chat: string) {
    return chat.split('\n').map((line) => parseChatLine(chatData, line)).filter(Boolean);
};

export function getChatLinesFromTime(chatData: ChatData, chat: string, from: Date, count: number, maxMinutes: number) {
    const fromHours = from.getHours();
    const fromMinutes = from.getMinutes();
    const fromSeconds = from.getSeconds();

    const fromTotalSeconds = (fromHours * 3600) + (fromMinutes * 60) + fromSeconds;
    
    const maxTotalSeconds = (maxMinutes * 60);

    const lines = chat.split('\n').map((line) => {
        if(line[0] === '[' && line[9] === ']') {
            const hour = parseInt(line.substring(1, 3));
            const minute = parseInt(line.substring(4, 6));
            const second = parseInt(line.substring(7, 9));

            const lineTotalSeconds = (hour * 3600) + (minute * 60) + second;

            if (lineTotalSeconds < fromTotalSeconds && lineTotalSeconds > (fromTotalSeconds - maxTotalSeconds)) {
                if(parseChatLine(chatData, line)) {
                    return line;
                }
            }
        }
        
        return null;
    }).filter(Boolean);

    const start = Math.max(0, lines.length - count);
    const end = Math.min(start + count, lines.length);

    console.log({
        lines,
        cropped: lines.slice(start, end)
    });

    return lines.slice(start, end).join('\n');
};

function parseChatLine(chatData: ChatData, line: string) {
    let color = "FFFFFF";

    if(line[0] === '[' && line[9] === ']') {
        line = line.substring(11);
    }

    if((line.startsWith("> ") || line.startsWith("* ")) && !line.startsWith("* [Vehicle alarm]") && !/\\*\s\(([A-Z][a-z]+_[A-Z][a-z]+)\):\s(.+)/.test(line)) {
        if(!chatData.includeAutomatedActions) {
            if(line.includes("started the engine") || line.includes("stopped the engine") || line.endsWith("checks the time.") || line.endsWith("takes their gun and badge from a locker.")) {
                return null;
            }
        }

        line = '*' + line.substring(1);
        color = "C2A4DA";
    }
    else if(line.startsWith("**[CH")) {
        if(!chatData.includeRadio) {
            return null;
        }

        //color = "B5AF8F";
        color = "FFEC8B";
    }
    else if (line.startsWith("(Radio)")) {
        color = "BFC0C2";
    }
    else if (line.includes(" says [low]: ") || /([A-Za-z]+\s[A-Za-z]+)\s+says(.*)\\[low\\](.*?):\s+(.*)/.test(line)) {
        if(chatData.characterName && (line.toLowerCase().startsWith(chatData.characterName.toLowerCase()) || line.toLowerCase().startsWith(chatData.characterName.toLowerCase().replace('_', ' ')))) {
            color = "FFFFFF";
        }
        else {
            color = "C8C8C8";
        }
    }
    else if (line.includes(" says (phone): ") || line.includes(" says (phone - low): ") || /([A-Za-z]+\s[A-Za-z]+)\s+says(.*)\\((phone|phone - low)\\)(.*?):\s+(.*)/.test(line)) {
        if(chatData.characterName && (line.toLowerCase().startsWith(chatData.characterName.toLowerCase()) || line.toLowerCase().startsWith(chatData.characterName.toLowerCase().replace('_', ' ')))) {
            color = "FFFFFF";
        }
        else {
            color = "FFFF00";
        }
    }
    else if (line.includes(" says: ") || /([A-Za-z]+\s[A-Za-z]+)\s+(says|shouts|screams)\s+to\s+([A-Za-z]+\s[A-Za-z]+):\s+(.*)/.test(line)|| /([A-Za-z]+\s[A-Za-z]+)\s+(says|shouts|screams)(.*):\s+(.*)/.test(line)) {
        if(line.includes("[MIC]")) {
            color = "9DFF96";
        }
        else if(chatData.characterName && (line.toLowerCase().startsWith(chatData.characterName.toLowerCase()) || line.toLowerCase().startsWith(chatData.characterName.toLowerCase().replace('_', ' ')))) {
            color = "FFFFFF";
        }
        else {
            color = "E6E6E6";
        }
    }
    else if (line.includes(" whispers: ") || /([A-Za-z]+\s[A-Za-z]+)\s+whispers(.*):\s+(.*)/.test(line)) {
        color = "FFFF00";
    }
    else if (line.includes("shouts: ") || line.includes("screams: ")) {
        color = "FFFFFF";
    }
    else if(line.startsWith("[Company Advertisement]") || line.startsWith("[Advertisement]")) {
        if(!chatData.includeBroadcasts) {
            return null;
        }
        
        color = "33AA33";
    }
    else if(line.startsWith("[Package]")) {
        color = "33AA33";
    }
    else if(line.startsWith("[SAN]")) {
        if(!chatData.includeBroadcasts) {
            return null;
        }
        
        color = "FFEC8B";
    }
    else if(line.startsWith("[Government Announcement]")) {
        if(!chatData.includeBroadcasts) {
            return null;
        }
        
        color = "6495ED";
    }
    else if(line.startsWith("** [") && line.endsWith("**")) {
        if(!chatData.includeRadio) {
            return null;
        }

        color = "FF8282";
    }
    else if(line === "_______Vehicle Weapon Package:_______") {
        color = "33AA33";
    }
    else if(/^\[\s([0-9]+).\s/.test(line)) {
        color = "F0F8FF";
    }
    else if(line.includes("You will spawn now with")) {
        color = "33AA33";
    }
    else if(line.startsWith("[Drugs] You've taken") || line.startsWith("You've taken")) {
        color = "FFFF00";
    }
    else if(line.trim().length === 0) {
    }
    else {
        console.log("Ignoring: " + line);

        return null;
    }

    return {
        message: line,
        color
    }
};
