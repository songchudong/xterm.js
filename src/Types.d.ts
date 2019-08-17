/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */

import { ITerminalOptions as IPublicTerminalOptions, IDisposable, IMarker, ISelectionPosition } from 'xterm';
import { ICharset, IAttributeData, CharData } from 'common/Types';
import { IEvent, IEventEmitter } from 'common/EventEmitter';
import { IColorSet, ILinkifier, ILinkMatcherOptions, IViewport } from 'browser/Types';
import { IOptionsService } from 'common/services/Services';
import { IBuffer, IBufferSet } from 'common/buffer/Types';
import { IParams, IFunctionIdentifier } from 'common/parser/Types';

export type CustomKeyEventHandler = (event: KeyboardEvent) => boolean;

export type LineData = CharData[];

/**
 * This interface encapsulates everything needed from the Terminal by the
 * InputHandler. This cleanly separates the large amount of methods needed by
 * InputHandler cleanly from the ITerminal interface.
 */
export interface IInputHandlingTerminal {
  element: HTMLElement;
  options: ITerminalOptions;
  cols: number;
  rows: number;
  charset: ICharset;
  gcharset: number;
  glevel: number;
  charsets: ICharset[];
  applicationKeypad: boolean;
  originMode: boolean;
  insertMode: boolean;
  wraparoundMode: boolean;
  bracketedPasteMode: boolean;
  curAttrData: IAttributeData;
  savedCols: number;
  x10Mouse: boolean;
  vt200Mouse: boolean;
  normalMouse: boolean;
  mouseEvents: boolean;
  sendFocus: boolean;
  utfMouse: boolean;
  sgrMouse: boolean;
  urxvtMouse: boolean;
  cursorHidden: boolean;

  buffers: IBufferSet;
  buffer: IBuffer;
  viewport: IViewport;

  onA11yCharEmitter: IEventEmitter<string>;
  onA11yTabEmitter: IEventEmitter<number>;

  bell(): void;
  focus(): void;
  scroll(isWrapped?: boolean): void;
  setgLevel(g: number): void;
  eraseAttrData(): IAttributeData;
  is(term: string): boolean;
  setgCharset(g: number, charset: ICharset): void;
  resize(x: number, y: number): void;
  reset(): void;
  showCursor(): void;
  refresh(start: number, end: number): void;
  handleTitle(title: string): void;
}

export interface ICompositionHelper {
  compositionstart(): void;
  compositionupdate(ev: CompositionEvent): void;
  compositionend(): void;
  updateCompositionElements(dontRecurse?: boolean): void;
  keydown(ev: KeyboardEvent): boolean;
}

/**
 * Calls the parser and handles actions generated by the parser.
 */
export interface IInputHandler {
  parse(data: string): void;
  parseUtf8(data: Uint8Array): void;
  print(data: Uint32Array, start: number, end: number): void;

  /** C0 BEL */ bell(): void;
  /** C0 LF */ lineFeed(): void;
  /** C0 CR */ carriageReturn(): void;
  /** C0 BS */ backspace(): void;
  /** C0 HT */ tab(): void;
  /** C0 SO */ shiftOut(): void;
  /** C0 SI */ shiftIn(): void;

  /** CSI @ */ insertChars(params: IParams): void;
  /** CSI SP @ */ scrollLeft(params: IParams): void;
  /** CSI A */ cursorUp(params: IParams): void;
  /** CSI SP A */ scrollRight(params: IParams): void;
  /** CSI B */ cursorDown(params: IParams): void;
  /** CSI C */ cursorForward(params: IParams): void;
  /** CSI D */ cursorBackward(params: IParams): void;
  /** CSI E */ cursorNextLine(params: IParams): void;
  /** CSI F */ cursorPrecedingLine(params: IParams): void;
  /** CSI G */ cursorCharAbsolute(params: IParams): void;
  /** CSI H */ cursorPosition(params: IParams): void;
  /** CSI I */ cursorForwardTab(params: IParams): void;
  /** CSI J */ eraseInDisplay(params: IParams): void;
  /** CSI K */ eraseInLine(params: IParams): void;
  /** CSI L */ insertLines(params: IParams): void;
  /** CSI M */ deleteLines(params: IParams): void;
  /** CSI P */ deleteChars(params: IParams): void;
  /** CSI S */ scrollUp(params: IParams): void;
  /** CSI T */ scrollDown(params: IParams, collect?: string): void;
  /** CSI X */ eraseChars(params: IParams): void;
  /** CSI Z */ cursorBackwardTab(params: IParams): void;
  /** CSI ` */ charPosAbsolute(params: IParams): void;
  /** CSI a */ hPositionRelative(params: IParams): void;
  /** CSI b */ repeatPrecedingCharacter(params: IParams): void;
  /** CSI c */ sendDeviceAttributesPrimary(params: IParams): void;
  /** CSI > c */ sendDeviceAttributesSecondary(params: IParams): void;
  /** CSI d */ linePosAbsolute(params: IParams): void;
  /** CSI e */ vPositionRelative(params: IParams): void;
  /** CSI f */ hVPosition(params: IParams): void;
  /** CSI g */ tabClear(params: IParams): void;
  /** CSI h */ setMode(params: IParams, collect?: string): void;
  /** CSI l */ resetMode(params: IParams, collect?: string): void;
  /** CSI m */ charAttributes(params: IParams): void;
  /** CSI n */ deviceStatus(params: IParams, collect?: string): void;
  /** CSI p */ softReset(params: IParams, collect?: string): void;
  /** CSI q */ setCursorStyle(params: IParams, collect?: string): void;
  /** CSI r */ setScrollRegion(params: IParams, collect?: string): void;
  /** CSI s */ saveCursor(params: IParams): void;
  /** CSI u */ restoreCursor(params: IParams): void;
  /** OSC 0
      OSC 2 */ setTitle(data: string): void;
  /** ESC E */ nextLine(): void;
  /** ESC = */ keypadApplicationMode(): void;
  /** ESC > */ keypadNumericMode(): void;
  /** ESC % G
      ESC % @ */ selectDefaultCharset(): void;
  /** ESC ( C
      ESC ) C
      ESC * C
      ESC + C
      ESC - C
      ESC . C
      ESC / C */ selectCharset(collectAndFlag: string): void;
  /** ESC D */ index(): void;
  /** ESC H */ tabSet(): void;
  /** ESC M */ reverseIndex(): void;
  /** ESC c */ reset(): void;
  /** ESC n
      ESC o
      ESC |
      ESC }
      ESC ~ */ setgLevel(level: number): void;
  /** ESC # 8 */ screenAlignmentPattern(): void;
}

export interface ITerminal extends IPublicTerminal, IElementAccessor, IBufferAccessor, ILinkifierAccessor {
  screenElement: HTMLElement;
  browser: IBrowser;
  writeBuffer: string[];
  cursorHidden: boolean;
  cursorState: number;
  buffer: IBuffer;
  buffers: IBufferSet;
  isFocused: boolean;
  viewport: IViewport;
  bracketedPasteMode: boolean;
  optionsService: IOptionsService;
  // TODO: We should remove options once components adopt optionsService
  options: ITerminalOptions;

  onBlur: IEvent<void>;
  onFocus: IEvent<void>;
  onA11yChar: IEvent<string>;
  onA11yTab: IEvent<number>;

  scrollLines(disp: number, suppressScrollEvent?: boolean): void;
  cancel(ev: Event, force?: boolean): boolean | void;
  showCursor(): void;
}

// Portions of the public API that are required by the internal Terminal
export interface IPublicTerminal extends IDisposable {
  textarea: HTMLTextAreaElement;
  rows: number;
  cols: number;
  buffer: IBuffer;
  markers: IMarker[];
  onCursorMove: IEvent<void>;
  onData: IEvent<string>;
  onKey: IEvent<{ key: string, domEvent: KeyboardEvent }>;
  onLineFeed: IEvent<void>;
  onScroll: IEvent<number>;
  onSelectionChange: IEvent<void>;
  onRender: IEvent<{ start: number, end: number }>;
  onResize: IEvent<{ cols: number, rows: number }>;
  onTitleChange: IEvent<string>;
  blur(): void;
  focus(): void;
  resize(columns: number, rows: number): void;
  writeln(data: string): void;
  open(parent: HTMLElement): void;
  attachCustomKeyEventHandler(customKeyEventHandler: (event: KeyboardEvent) => boolean): void;
  addCsiHandler(id: IFunctionIdentifier, callback: (params: IParams) => boolean): IDisposable;
  addDcsHandler(id: IFunctionIdentifier, callback: (data: string, param: IParams) => boolean): IDisposable;
  addEscHandler(id: IFunctionIdentifier, callback: () => boolean): IDisposable;
  addOscHandler(ident: number, callback: (data: string) => boolean): IDisposable;
  registerLinkMatcher(regex: RegExp, handler: (event: MouseEvent, uri: string) => void, options?: ILinkMatcherOptions): number;
  deregisterLinkMatcher(matcherId: number): void;
  registerCharacterJoiner(handler: (text: string) => [number, number][]): number;
  deregisterCharacterJoiner(joinerId: number): void;
  addMarker(cursorYOffset: number): IMarker;
  hasSelection(): boolean;
  getSelection(): string;
  getSelectionPosition(): ISelectionPosition | undefined;
  clearSelection(): void;
  select(column: number, row: number, length: number): void;
  selectAll(): void;
  selectLines(start: number, end: number): void;
  dispose(): void;
  scrollLines(amount: number): void;
  scrollPages(pageCount: number): void;
  scrollToTop(): void;
  scrollToBottom(): void;
  scrollToLine(line: number): void;
  clear(): void;
  write(data: string): void;
  writeUtf8(data: Uint8Array): void;
  refresh(start: number, end: number): void;
  reset(): void;
}

export interface IBufferAccessor {
  buffer: IBuffer;
}

export interface IElementAccessor {
  readonly element: HTMLElement;
}

export interface ILinkifierAccessor {
  linkifier: ILinkifier;
}

// TODO: The options that are not in the public API should be reviewed
export interface ITerminalOptions extends IPublicTerminalOptions {
  [key: string]: any;
  cancelEvents?: boolean;
  convertEol?: boolean;
  handler?: (data: string) => void;
  screenKeys?: boolean;
  termName?: string;
  useFlowControl?: boolean;
}

export interface IBrowser {
  isNode: boolean;
  userAgent: string;
  platform: string;
  isFirefox: boolean;
  isMac: boolean;
  isIpad: boolean;
  isIphone: boolean;
  isWindows: boolean;
}
