/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { asLocator } from '../../utils';

import type { Language, LanguageGenerator, LanguageGeneratorOptions } from './types';
import type * as actions from '@recorder/actions';

export type StructuralPseudoClass = {
    type: 'nth-child';
    n: number;
  };
  
  export type TextMatcherType = 'has-text';
  
  export type TextMatcherPseudoClass = {
    type: TextMatcherType;
    text: string;
  };
  
  export type ClassNameSelector = {
    className: string;
  };
  
  export type AttributeSelectorHas = {
    type: 'has';
    name: string;
  };
  
  export type AttributeSelectorValue = {
    type: 'identical';
    name: string;
    value: string;
  };
  
  export type AttributeSelector = AttributeSelectorHas | AttributeSelectorValue;
  
  export type AICompoundSelector = {
    type: 'compound';
    id?: string;
    tagName?: string;
    classNames?: ClassNameSelector[];
    attributes?: AttributeSelector[];
    textMatcher?: TextMatcherPseudoClass;
    structural?: StructuralPseudoClass;
  };
  
  export type AIComplexOperand = 'child' | 'descendant' | 'adjacent' | 'sibling';
  
  export type AIComplexSelector = {
    type: 'complex';
    leftSelector: AISelector;
    operand: AIComplexOperand;
    rightSelector: AICompoundSelector;
  };
  
  export type AISelector = AICompoundSelector | AIComplexSelector;
  
  export type AISelectorSchemaObject = {
    selector: AISelector;
  };

export class BalLanguageGenerator implements LanguageGenerator {
  id = 'bal';
  groupName = '';
  name = 'BAL';
  highlighter = 'javascript' as Language;

  generateAction(actionInContext: actions.ActionInContext): string {
    const locator = (actionInContext.action as any).selector ? JSON.parse(asLocator('bal', (actionInContext.action as any).selector)) : undefined;
    console.log('BALgenerateAction Locator', locator);
    const entry = {
      ...actionInContext.action,
      ...actionInContext.frame,
      locator,
    };
    console.log('BALgenerateAction Mapped', entry);
    return JSON.stringify(entry);
  }

  generateHeader(options: LanguageGeneratorOptions): string {
    console.log('BALgenerateHeader', options);
    return JSON.stringify(options);
  }

  generateFooter(saveStorage: string | undefined): string {
    console.log('BALgenerateFooter', saveStorage);
    return '';
  }
}


type SelectorParts = {
  tagName?: string;
  id?: string;
  classNames: string[];
  attributes: { name: string; value: string }[];
  structural?: { type: 'nth-child'; n: number };
  textMatcher?: { type: 'has-text'; text: string };
};
