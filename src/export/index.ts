import { json, typeExt } from "@gscript/gtools";
import { UploadedFile } from "express-fileupload";
import { Sharp } from "sharp";

/**
 * some many tools for a request
 */
export namespace requ {
    /**
     * The type of the request
     */
    export enum type {
        /**
         * The request is public, and everyone can see and us it
         */
        PUBLIC = "public",
        /**
         * The request is private, and is only usable by the server
         */
        PRIVATE = "private"
    }

    /**
     * The type of the call
     */
    export enum callType {
        /**
         * The request is a `get` request
         * Use that one when the request need to just get some data and change nothing
         */
        GET = "get",
        /**
         * The request is a `post` request
         * Use that one when the request need to send new data in the server, and get nothing
         * (`post` is reserved for **creation**)
         */
        POST = "post",
        /**
         * The request is a `put` request
         * Use that one when the request need to send change data in the server, and get nothing
         * (`put` is reserved for **full update**)
         */
        PUT = "put",
        /**
         * The request is a `patch` request
         * Use that one when the request need to send change data in the server, and get nothing
         * (`patch` is reserved for **partial update**)
         */
        PATCH = "patch",
        /**
         * The request is a `delete` request
         * Use that one when the request need to delete some data in the server, and get nothing
         * (`delete` is reserved for **deletion**)
         */
        DELETE = "delete"
    }

    /**
     * All http codes
     */
    export namespace httpCodes {
        /**
         * Type for get all http codes
         */
        export type all = _100_Information | _200_Success | _300_Redirection | _400_ClientError | _500_ServerError;

        export const codeToName = (code: all): string => {
            if (code >= 100 && code <= 199) {
                return `Information : ${requ.httpCodes._100_Information[code].split('_')[2]}`;
            } else if (code >= 200 && code <= 299) {
                return `Success : ${requ.httpCodes._200_Success[code].split('_')[2]}`;
            } else if (code >= 300 && code <= 399) {
                return `Redirection : ${requ.httpCodes._300_Redirection[code].split('_')[2]}`;
            } else if (code >= 400 && code <= 499) {
                return `Client Error : ${requ.httpCodes._400_ClientError[code].split('_')[2]}`;
            } else if (code >= 500 && code <= 599) {
                return `Server Error : ${requ.httpCodes._500_ServerError[code].split('_')[2]}`;
            } else {
                return `Unknown : ${code}`;
            }
        };

        /**
         * This codes are for information
         */
        export enum _100_Information {
            /**
             * ***FR***: Attente de la suite de la requête.
             * 
             * ***EN***: Waiting for the request to continue.
             */
            _100_Continue = 100,
            /**
             * ***FR***: Acceptation du changement de protocole.
             * 
             * ***EN***: Acceptance of the protocol change.
             */
            _101_SwitchingProtocols = 101,
            /**
             * ***FR***: Traitement en cours (évite que le client dépasse le temps d’attente limite).
             * 
             * ***EN***: Processing in progress (prevents the client from exceeding the time limit).
             */
            _102_Processing = 102,
            /**
             * ***FR***: Dans l'attente de la réponse définitive, le serveur renvoie des liens que le client peut commencer à télécharger.
             * 
             * ***EN***: Awaiting the final response, the server returns links that the client can start downloading.
             */
            _103_EarlyHints = 103
        }
        /**
         * This codes are for success
         */
        export enum _200_Success {
            /**
             * ***FR***: 	Requête traitée avec succès. La réponse dépendra de la méthode de requête utilisée.
             * 
             * ***EN***: Request processed successfully. The response will depend on the request method used.
             */
            _200_OK = 200,
            /**
             * ***FR***: Requête traitée avec succès et création d’un document.
             * 
             * ***EN***: Request processed successfully and document created.
             */
            _201_Created = 201,
            /**
             * ***FR***: 	Requête traitée, mais sans garantie de résultat.
             * 
             * ***EN***: Request processed, but no guarantee of result.
             */
            _202_Accepted = 202,
            /**
             * ***FR***: Information renvoyée, mais générée par une source non certifiée.
             * 
             * ***EN***: Information returned, but generated by an uncertified source.
             */
            _203_NonAuthoritativeInformation = 203,
            /**
             * ***FR***: Requête traitée avec succès mais pas d’information à renvoyer.
             * 
             * ***EN***: Request processed successfully but no information to return.
             */
            _204_NoContent = 204,
            /**
             * ***FR***: Requête traitée avec succès, la page courante peut être effacée.
             * 
             * ***EN***: Request processed successfully, the current page can be erased.
             */
            _205_ResetContent = 205,
            /**
             * ***FR***: Une partie seulement de la ressource a été transmise.
             * 
             * ***EN***: Only part of the resource has been transmitted.
             */
            _206_PartialContent = 206,
            /**
             * ***FR***: Réponse multiple.
             * 
             * ***EN***: Multiple response.
             */
            _207_MultiStatus = 207,
            /**
             * ***FR***: Le document a été envoyé précédemment dans cette collection.
             * 
             * ***EN***: The document was previously sent in this collection.
             */
            _208_AlreadyReported = 208,
            /**
             * ***FR***: La copie de la ressource côté client diffère de celle du serveur (contenu ou propriétés).
             * 
             * ***EN***: The client-side resource copy differs from the server-side resource copy (content or properties).
             */
            _210_ContentDifferent = 210,
            /**
             * ***FR***: Le serveur a accompli la requête pour la ressource, et la réponse est une représentation du résultat d'une ou plusieurs manipulations d'instances appliquées à l'instance actuelle.
             * 
             * ***EN***: The server has fulfilled the request for the resource, and the response is a representation of the result of one or more instance manipulations applied to the current instance.
             */
            _226_IMUsed = 226
        }
        /**
         * This codes are for redirection
         */
        export enum _300_Redirection {
            /**
             * ***FR***: L’URI demandée se rapporte à plusieurs ressources.
             * 
             * ***EN***: The requested URI refers to multiple resources.
             */
            _300_MultipleChoices = 300,
            /**
             * ***FR***: Document déplacé de façon permanente.
             * 
             * ***EN***: Document permanently moved.
             */
            _301_MovedPermanently = 301,
            /**
             * ***FR***: Document déplacé de façon temporaire.
             * ***EN***: Document moved temporarily.
             */
            _302_Found = 302,
            /**
             * ***FR***: La réponse à cette requête est ailleurs.
             * 
             * ***EN***: The response to this request is elsewhere.
             */
            _303_SeeOther = 303,
            /**
             * ***FR***: Document non modifié depuis la dernière requête.
             * 
             * ***EN***: Document not modified since the last request.
             */
            _304_NotModified = 304,
            /**
             * ***FR***: La requête doit être réadressée au proxy.
             * 
             * ***EN***: The request must be redirected to the proxy.
             */
            _305_UseProxy = 305,
            /**
             * ***FR***: La requête doit être redirigée temporairement vers l’URI spécifiée sans changement de méthode.
             * ***EN***: The request must be temporarily redirected to the specified URI without changing the method.
             */
            _307_TemporaryRedirect = 307,
            /**
             * ***FR***: La requête doit être redirigée définitivement vers l’URI spécifiée sans changement de méthode.
             * 
             * ***EN***: The request must be permanently redirected to the specified URI without changing the method.
             */
            _308_PermanentRedirect = 308,
            /**
             * ***FR***: 	La requête doit être redirigée de trop nombreuses fois, ou est victime d’une boucle de redirection.
             * 
             * ***EN***: The request must be redirected too many times, or is the victim of a redirection loop.
             */
            _310_TooManyRedirects = 310
        }
        /**
         * This codes are for client error
         */
        export enum _400_ClientError {
            /**
             * ***FR***: La syntaxe de la requête est erronée.
             * ***EN***: The syntax of the request is incorrect.
             */
            _400_BadRequest = 400,
            /**
             * ***FR***: Une authentification est nécessaire pour accéder à la ressource.
             * 
             * ***EN***: Authentication is required to access the resource.
             */
            _401_Unauthorized = 401,
            /**
             * ***FR***: Paiement requis pour accéder à la ressource.
             * 
             * ***EN***: Payment is required to access the resource.
             */
            _402_PaymentRequired = 402,
            /**
             * ***FR***: Le serveur a compris la requête, mais refuse de l'exécuter. Contrairement à l'erreur 401, s'authentifier ne fera aucune différence. Sur les serveurs où l'authentification est requise, cela signifie généralement que l'authentification a été acceptée mais que les droits d'accès ne permettent pas au client d'accéder à la ressource.
             * 
             * ***EN***: The server understood the request, but refuses to execute it. Unlike error 401, authenticating will make no difference. On servers where authentication is required, this usually means that authentication has been accepted but access rights do not allow the client to access the resource.
             */
            _403_Forbidden = 403,
            /**
             * ***FR***: Ressource non trouvée.
             * 
             * ***EN***: Resource not found.
             */
            _404_NotFound = 404,
            /**
             * ***FR***: Méthode de requête non autorisée.
             * 
             * ***EN***: Unauthorized request method.
             */
            _405_MethodNotAllowed = 405,
            /**
             * ***FR***: La ressource demandée n'est pas disponible dans un format qui respecterait les en-têtes "Accept" de la requête.
             * 
             * ***EN***: The requested resource is not available in a format that would respect the request's "Accept" headers.
             */
            _406_NotAcceptable = 406,
            /**
             * ***FR***: Accès à la ressource autorisé par identification avec le proxy.
             * 
             * ***EN***: Access to the resource authorized by identification with the proxy.
             */
            _407_ProxyAuthenticationRequired = 407,
            /**
             * ***FR***: Temps d’attente d’une requête du client, écoulé côté serveur. D'après les spécifications HTTP : "Le client n'a pas produit de requête dans le délai que le serveur était prêt à attendre. Le client PEUT répéter la demande sans modifications à tout moment ultérieur".
             * 
             * ***EN***: Client request timeout, server side elapsed. According to HTTP specifications: "The client did not produce a request within the time that the server was willing to wait. The client MAY repeat the request without modifications at any later time".
             */
            _408_RequestTimeout = 408,
            /**
             * ***FR***: La requête ne peut être traitée à la suite d'un conflit avec l'état actuel du serveur.
             * 
             * ***EN***: The request cannot be processed due to a conflict with the current state of the server.
             */
            _409_Conflict = 409,
            /**
             * ***FR***: La ressource n'est plus disponible et aucune adresse de redirection n’est connue.
             * 
             * ***EN***: The resource is no longer available and no redirection address is known.
             */
            _410_Gone = 410,
            /**
             * ***FR***: La longueur de la requête n’a pas été précisée.
             * 
             * ***EN***: The length of the request has not been specified.
             */
            _411_LengthRequired = 411,
            /**
             * ***FR***: Préconditions envoyées par la requête non vérifiées.
             * 
             * ***EN***: Preconditions sent by the request not verified.
             */
            _412_PreconditionFailed = 412,
            /**
             * ***FR***: Traitement abandonné dû à une requête trop importante.
             * 
             * ***EN***: Processing abandoned due to a request that is too large.
             */
            _413_PayloadTooLarge = 413,
            /**
             * ***FR***: URI trop longue.
             * 
             * ***EN***: URI too long.
             */
            _414_URITooLong = 414,
            /**
             * ***FR***: Format de requête non supporté pour une méthode et une ressource données.
             * 
             * ***EN***: Request format not supported for a given method and resource.
             */
            _415_UnsupportedMediaType = 415,
            /**
             * ***FR***: Champs d’en-tête de requête "range" incorrect.
             * 
             * ***EN***: Incorrect "range" request header fields.
             */
            _416_RangeNotSatisfiable = 416,
            /**
             * ***FR***: Comportement attendu et défini dans l’en-tête de la requête insatisfaisante.
             * 
             * ***EN***: Expected behavior and defined in the request header unsatisfactory.
             */
            _417_ExpectationFailed = 417,
            /**
             * ***FR***: "Je suis une théière": Ce code est défini dans la RFC 232417 datée du 1er avril 1998, Hyper Text Coffee Pot Control Protocol.
             * 
             * ***EN***: "I am a teapot": This code is defined in RFC 232417 dated April 1, 1998, Hyper Text Coffee Pot Control Protocol.
             */
            _418_ImATeapot = 418,
            /**
             * ***FR***: Ressource expirée.
             * 
             * ***EN***: Resource expired.
             */
            _419_PageTimeout = 419,
            /**
             * ***FR***: La requête a été envoyée à un serveur qui n'est pas capable de produire une réponse (par exemple, car une connexion a été réutilisée).
             * 
             * ***EN***: The request was sent to a server that is not capable of producing a response (for example, because a connection was reused).
             */
            _421_MisdirectedRequest = 421,
            /**
             * ***FR***: L’entité fournie avec la requête est incompréhensible ou incomplète.
             * 
             * ***EN***: The entity provided with the request is incomprehensible or incomplete.
             */
            _422_UnprocessableEntity = 422,
            /**
             * ***FR***: L’opération ne peut avoir lieu car la ressource est verrouillée.
             * 
             * ***EN***: The operation cannot take place because the resource is locked.
             */
            _423_Locked = 423,
            /**
             * ***FR***: Une méthode de la transaction a échoué.
             * 
             * ***EN***: A method of the transaction failed.
             */
            _424_MethodFailure = 424,
            /**
             * ***FR***: Le serveur ne peut traiter la demande car elle risque d'être rejouée.
             * 
             * ***EN***: The server cannot process the request because it may be replayed.
             */
            _425_TooEarly = 425,
            /**
             * ***FR***: Le client devrait changer de protocole, par exemple au profit de TLS/1.0.
             * 
             * ***EN***: The client should change protocol, for example to TLS/1.0.
             */
            _426_UpgradeRequired = 426,
            /**
             * ***FR***: La signature numérique du document est non-valide.
             * 
             * ***EN***: The digital signature of the document is invalid.
             */
            _427_InvalidDigitalSignature = 427,
            /**
             * ***FR***: La requête doit être conditionnelle.
             * 
             * ***EN***: The request must be conditional.
             */
            _428_PreconditionRequired = 428,
            /**
             * ***FR***: le client a émis trop de requêtes dans un délai donné.
             * 
             * ***EN***: the client has issued too many requests in a given time frame.
             */
            _429_TooManyRequests = 429,
            /**
             * ***FR***: Les entêtes HTTP émises dépassent la taille maximale admise par le serveur.
             * 
             * ***EN***: The HTTP headers issued exceed the maximum size allowed by the server.
             */
            _431_RequestHeaderFieldsTooLarge = 431,
            /**
             * ***FR***: La requête devrait être renvoyée après avoir effectué une action.
             * 
             * ***EN***: The request should be returned after performing an action.
             */
            _449_RetryWith = 449,
            /**
             * ***FR***: Cette erreur est produite lorsque les outils de contrôle parental sont activés et bloquent l’accès à la page.
             * 
             * ***EN***: This error is produced when parental control tools are activated and block access to the page.
             */
            _450_BlockedByParentalControls = 450,
            /**
             * ***FR***: La ressource demandée est inaccessible pour des raisons d'ordre légal.
             * 
             * ***EN***: The requested resource is unavailable for legal reasons.
             */
            _451_UnavailableForLegalReasons = 451,
            /**
             * ***FR***: Erreur irrécupérable.
             * 
             * ***EN***: Unrecoverable error.
             */
            _456_UnrecoverableError = 456
        }
        /**
         * This codes are for server error
         */
        export enum _500_ServerError {
            /**
             * ***FR***: Erreur interne du serveur.
             * 
             * ***EN***: Internal server error.
             */
            _500_InternalServerError = 500,
            /**
             * ***FR***: Fonctionnalité réclamée non supportée par le serveur.
             * 
             * ***EN***: Functionality claimed not supported by the server.
             */
            _501_NotImplemented = 501,
            /**
             * ***FR***: En agissant en tant que serveur proxy ou passerelle, le serveur a reçu une réponse invalide depuis le serveur distant.
             * 
             * ***EN***: Acting as a proxy server or gateway, the server received an invalid response from the remote server.
             */
            _502_BadGateway = 502,
            /**
             * ***FR***: Service temporairement indisponible ou en maintenance.
             * 
             * ***EN***: Service temporarily unavailable or under maintenance.
             */
            _503_ServiceUnavailable = 503,
            /**
             * ***FR***: Temps d’attente d’une réponse d’un serveur à un serveur intermédiaire écoulé.
             * 
             * ***EN***: Waiting time for a response from a server to an intermediate server elapsed.
             */
            _504_GatewayTimeout = 504,
            /**
             * ***FR***: Version HTTP non gérée par le serveur.
             * 
             * ***EN***: HTTP version not supported by the server.
             */
            _505_HTTPVersionNotSupported = 505,
            /**
             * ***FR***: Erreur de négociation. Transparent content negociation.
             * 
             * ***EN***: Negotiation error. Transparent content negotiation.
             */
            _506_VariantAlsoNegotiates = 506,
            /**
             * ***FR***: Espace insuffisant pour modifier les propriétés ou construire la collection.
             * 
             * ***EN***: Insufficient space to modify properties or build the collection.
             */
            _507_InsufficientStorage = 507,
            /**
             * ***FR***: Boucle dans une mise en relation de ressources (RFC 584224).
             * 
             * ***EN***: Loop in a resource relationship (RFC 584224).
             */
            _508_LoopDetected = 508,
            /**
             * ***FR***: Utilisé par de nombreux serveurs pour indiquer un dépassement de quota.
             * 
             * ***EN***: Used by many servers to indicate a quota overrun.
             */
            _509_BandwidthLimitExceeded = 509,
            /**
             * ***FR***: La requête ne respecte pas la politique d'accès aux ressources HTTP étendues.
             * 
             * ***EN***: The request does not comply with the extended HTTP resource access policy.
             */
            _510_NotExtended = 510,
            /**
             * ***FR***: 	Le client doit s'authentifier pour accéder au réseau. Utilisé par les portails captifs pour rediriger les clients vers la page d'authentification.
             * 
             * ***EN***: The client must authenticate to access the network. Used by captive portals to redirect clients to the authentication page.
             */
            _511_NetworkAuthenticationRequired = 511
        }
    }

    /**
     * The type of a file received on a form
     */
    export interface UploadedFileWithSharp extends UploadedFile {
        sharp: Sharp;
    }

    /**
     * The type of multiples files received on a form
     */
    export type fileArrayWithSharp = null | undefined | json.objPersoType<UploadedFileWithSharp | UploadedFileWithSharp[]>;

    /**
     * All the variables contents for a request
     */
    export type requestContent = {
        /**
         * The id of the template used, it's the index in the array in your `inTemplates`.
         */
        template: number,
        /**
         * The body of the request (respect strictly a template of `inTemplates`).
         */
        body: json.type,
        /**
         * The header of the request.
         */
        header: typeExt<json.type, json.objPersoType<string>>,
        /**
         * If you have make variable in your link, you can get them here (example: `/mod/:id/version` => `{id: string}`).
         */
        linkVar: typeExt<json.type, json.objPersoType<string>>,
        /**
         * also variables in your link but not previsible (optionnal) and with other format (example: `/hw?id=1` => `{version: string}`).
         */
        query: typeExt<json.type, json.objPersoType<string>>,
        /**
         * If you have files in your request, you can get them here.
         */
        files: fileArrayWithSharp,
        /**
         * The cookies of the request.
         */
        cookies: json.objPersoType<string>,
        /**
         * The precise link of the request.
         */
        link: string
    }
    export type responseContent = {
        /**
         * The body of the request (respect strictly a template of `inTemplates`).
         */
        body: json.type;
        /**
         * The header of the request.
         */
        header: typeExt<json.type, json.objPersoType<string>>;
        /**
         * The precise link of the request.
         */
        link: string;
        /**
         * Wich http code is the response
         */
        status: httpCodes.all;
    };

    /**
     * The response of a request
     */
    export type requestResponse = {resBody: json.type, resCode: httpCodes.all} | {resFile: string, resCode: httpCodes.all};

    /**
     * The type of a secret variable
     */
    export type SecretVariableType = boolean | { command?: true, helper: false } | { command: true, helper?: false } | { command?: false, helper: true } | { command: false, helper?: true };
}