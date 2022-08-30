export interface IMenu {
    id: string;
    title: string;
    translate: string;
    type?: string;
    icon?: string;
    url?: string;
    children?: IMenu[];
}

export interface FlsField {
    tableName?: string;
    fieldName?: string;
    accessLevel?: number;
}

export interface Apl {
    storedProcedure?: string;
    isAllowAccess?: boolean;
}

export interface SbtFormMetaData {
    column: SbtFieldMetaData[];
}

export interface SbtFieldMetaData {
    dataField?: string;    
    editorType?: string;
    editorOptions?: any;
    type?: string;
    message?: string;
}

export interface SbtFormSetup {
    formTitle: string;
    exportFilename?: string;
    apiUrl?: string;
}

export interface SortField {
    selector?: string;
    desc?: boolean;
}

export interface User {
    userId: string;
    email: string;
    fullName: string;
}

export class AuthResponse {
    UserInfo?: UserInfo;
    MenuJson?: MenuJson;
    ActionJson?: MenuJson;
    ShortcutJson?: MenuJson;
    
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class UserInfo {
    Id?: string;
    Name?: string;
    NickName?: string;
    Email?: string;
    MobilePhone?: string;
    DefaultLanguage?: string;
    Result?: string;
    AccessToken?: string;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export class MenuJson {
    Id?: string;
    Title?: string;
    Translate?: string;
    Type?: string;
    Icon?: string;
    Url?: string;
    
    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
}

export const RECURSIVELOOP = (obj) => {
    Object.keys(obj).forEach(key => {

        console.log('key: ' + key + ', value: ' + obj[key]);

        if (typeof obj[key] === 'object') {
            RECURSIVELOOP(obj[key])
        }
    })
}

