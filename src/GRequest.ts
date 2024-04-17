import GScript from "@gscript/gscript";

export class GRequest extends GScript.GScript<GScript.projects> {
    pj = GScript.projects.GRequest;
    static pj = GScript.projects.GRequest;
    
    pjPath = GScript.pathDependPjVar.GRequest;
    static pjPath = GScript.pathDependPjVar.GRequest;
}