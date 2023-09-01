import { LanguageSupport, LRLanguage } from "@codemirror/language";
import { LRParser } from "@lezer/lr";
export declare const parser: LRParser;
export declare const yamlLanguage: LRLanguage;
export declare const yaml: () => LanguageSupport;
