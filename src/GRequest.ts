import GScript from "@gscript/gscript";

/**
 * The base class of other GRequest classes
 */
export class GRequest extends GScript.GScript<GScript.projects> {
    pj = GScript.projects.GRequest;
    /**
     * The project of this script
     */
    static pj = GScript.projects.GRequest;
    
    pjPath = GScript.pathDependPjVar.GRequest;
    /**
     * The node_modules path of this script
     */
    static pjPath = GScript.pathDependPjVar.GRequest;
}