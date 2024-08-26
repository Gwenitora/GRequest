import { GTools } from "@gscript/gtools/lib/cjs/GTools";

export type icalEventUsers = {
    name: string,
    email: string
}

export enum icalEventStatus {
    CONFIRMED = "CONFIRMED",
    TENTATIVE = "TENTATIVE",
    CANCELLED = "CANCELLED"
}

export type icalEvent = {
    uid: string,
    summary: string,
    description: string,
    location: string,
    sequence: number,
    rrule: string, // !!A revoir
    attendees: icalEventUsers[],
    organizer: icalEventUsers,
    priority: number,
    url: string,
    status: icalEventStatus,
    categories: string[],
    dtstart: Date,
    dtend: Date,
    dtstamp: Date,
    lastModified: Date,
    created: Date
}

export type icalJson = {
    prodId: string[]
    content: (icalEvent)[]
}

class ical extends GTools {
    private datas: icalJson = {
        prodId: [],
        content: []
    };
}

export default ical;